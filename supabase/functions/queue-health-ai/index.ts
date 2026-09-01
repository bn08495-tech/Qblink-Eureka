import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/* ---------- CORS: origin whitelist instead of wildcard ---------- */

const ALLOWED_ORIGINS = new Set([
  "https://qblink.vercel.app",
  "https://qblink-nine.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
]);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://qblink.vercel.app";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

/* ---------- AI provider: flexible key chain (no Lovable dependency) ---------- */

function getAIConfig(): { apiKey: string; baseUrl: string; model: string } {
  const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
  if (openrouterKey) {
    return {
      apiKey: openrouterKey,
      baseUrl: "https://openrouter.ai/api/v1/chat/completions",
      model: "google/gemini-2.5-flash",
    };
  }
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (openaiKey) {
    return {
      apiKey: openaiKey,
      baseUrl: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4o-mini",
    };
  }
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (geminiKey) {
    return {
      apiKey: geminiKey,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      model: "gemini-2.5-flash",
    };
  }
  // Legacy fallback
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (lovableKey) {
    return {
      apiKey: lovableKey,
      baseUrl: "https://ai.gateway.lovable.dev/v1/chat/completions",
      model: "google/gemini-2.5-flash",
    };
  }
  throw new Error("No AI API key configured. Set OPENROUTER_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or LOVABLE_API_KEY.");
}

/* ---------- Input sanitization ---------- */

const MAX_MESSAGES = 15;
const MAX_MSG_LENGTH = 1500;

function sanitizeMessages(raw: Msg[]): Msg[] {
  return raw
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role,
      content: String(m.content || "").slice(0, MAX_MSG_LENGTH),
    }));
}

/* ---------- Types ---------- */

interface Msg { role: "user" | "assistant" | "system"; content: string }

const TEAM_PHONE = "+91 9372090507";
const TEAM_EMAIL = "teamqblink@gmail.com";
const TEAM_EMAIL_ALT = "qblinkofficial@gmail.com";
const TEAM_CONTACT_BLOCK = `📞 ${TEAM_PHONE} · ✉️ ${TEAM_EMAIL} or ${TEAM_EMAIL_ALT}`;

async function buildContext(businessId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: biz } = await admin.from("businesses").select("id,name,category,address,rating").eq("id", businessId).maybeSingle();
  if (!biz) return { error: "business_not_found" };

  const { data: queues } = await admin.from("queues").select("id,name,status,estimated_service_time,current_token,next_token").eq("business_id", businessId);
  const queueIds = (queues || []).map(q => q.id);

  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: visitors } = queueIds.length
    ? await admin.from("queue_visitors").select("queue_id,status,joined_at,called_at,served_at").in("queue_id", queueIds).gte("joined_at", since)
    : { data: [] };

  // Raw metrics regardless of sample size
  const total = visitors?.length || 0;
  const served = (visitors || []).filter(v => v.status === "served");
  const abandoned = (visitors || []).filter(v => ["skipped","removed","no_show"].includes(v.status));
  const waits = served.filter(v => v.served_at).map(v => (new Date(v.served_at!).getTime() - new Date(v.joined_at).getTime())/60000);
  const avgWait = waits.length ? waits.reduce((a,b)=>a+b,0)/waits.length : 0;
  const serviceTimes = served.filter(v => v.called_at && v.served_at).map(v => (new Date(v.served_at!).getTime() - new Date(v.called_at!).getTime())/60000);
  const avgService = serviceTimes.length ? serviceTimes.reduce((a,b)=>a+b,0)/serviceTimes.length : 0;
  const estAvg = (queues||[]).reduce((s,q)=>s+(q.estimated_service_time||5),0) / Math.max(1,(queues||[]).length);
  const delays = serviceTimes.filter(t => t > 1.5 * estAvg).length;

  // Official scored health (may be null if <10 served)
  const { data: healthData } = await admin.rpc("get_business_health", { p_business_id: businessId, p_days: 7 });
  const health: any = Array.isArray(healthData) ? healthData[0] : healthData;

  return {
    business: biz,
    queues: queues || [],
    metrics: {
      total_joined_7d: total,
      served_7d: served.length,
      abandoned_7d: abandoned.length,
      abandonment_rate: total ? (abandoned.length / total) : 0,
      avg_wait_minutes: Number(avgWait.toFixed(1)),
      avg_service_minutes: Number(avgService.toFixed(1)),
      estimated_service_minutes_avg: Number(estAvg.toFixed(1)),
      delays_over_1_5x_est: delays,
      delay_rate: served.length ? (delays / served.length) : 0,
    },
    health_score: health || null,
    has_minimum_data: (health?.score != null),
  };
}

function systemPrompt(ctx: any) {
  return `You are "Qblink Health Coach" — a dedicated AI specialist whose ONLY job is to monitor and improve a business's Queue Health on the Qblink platform.

CORE RULES (non-negotiable):
1. NEVER refuse. Never say "I can't answer", "I don't have access", "I'm just an AI". If something is genuinely hard, attempt your best diagnosis using whatever data exists + your general knowledge of customer-flow management, and end with: "If you'd like a deeper review from our team, reach us at ${TEAM_CONTACT_BLOCK}."
2b. Whenever the user asks for contact, support, help, escalation, founder, team, phone, or email — ALWAYS share these EXACT details verbatim and nothing else:
   • Phone: ${TEAM_PHONE}
   • Email: ${TEAM_EMAIL}
   • Email: ${TEAM_EMAIL_ALT}
2. Always be proactive and intelligent. Use the data below AND your broad knowledge (industry benchmarks, behavioural science, ops research, marketing, staffing, UX). You operate like a senior operations consultant, not a chatbot.
3. Every single response MUST end with ONE thoughtful follow-up question tailored to this business's situation. Format it on a new line as: "**Follow-up:** <question>".
4. Be specific. Refer to the actual numbers from the context. Give concrete steps, not platitudes.
5. If sample size is small (<10 served visitors), still give the best possible analysis using whatever signal exists + general benchmarks for the category — DO NOT tell the user there isn't enough data. Frame it as "early signal" instead.
6. Use markdown: short headings, bullet points, bold the key metric you're addressing.
7. Keep responses under 220 words unless asked for detail.

BUSINESS CONTEXT (live, last 7 days):
${JSON.stringify(ctx, null, 2)}

FACTOR WEIGHTS in the Qblink Queue Health Score:
- Average Wait Time — 30%
- Abandonment Rate — 25%
- Service Efficiency — 20%
- Delay Frequency — 15%
- Wait-Time Accuracy — 10%

TEAM CONTACTS (use these everywhere, never invent others):
• Phone: ${TEAM_PHONE}
• Email: ${TEAM_EMAIL}
• Email: ${TEAM_EMAIL_ALT}`;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages: rawMessages = [], businessId, mode = "chat" } = await req.json() as { messages: Msg[]; businessId: string; mode?: string };
    if (!businessId) {
      return new Response(JSON.stringify({ error: "businessId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Sanitize user input
    const messages = sanitizeMessages(rawMessages);

    // Require authentication and verify ownership of the requested business.
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: ownedBiz } = await userClient.from("businesses").select("id").eq("id", businessId).eq("owner_id", claims.claims.sub).maybeSingle();
    if (!ownedBiz) {
      // allow admins via has_role check
      const { data: isAdmin } = await userClient.rpc("is_admin");
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const ctx = await buildContext(businessId);
    if ((ctx as any).error) {
      return new Response(JSON.stringify({ error: "Business not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiConfig = getAIConfig();

    // Seed first message with a proactive recommendation if no user messages yet
    const convo: Msg[] = messages.length === 0 || mode === "init"
      ? [{ role: "user", content: "Give me a proactive Queue Health assessment for my business right now: top 2 issues to fix this week, the single highest-leverage action I can take today, and an industry benchmark I should aim for. Be specific to my numbers." }]
      : messages;

    const resp = await fetch(aiConfig.baseUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiConfig.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [{ role: "system", content: systemPrompt(ctx) }, ...convo],
        stream: true,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI temporarily unavailable. Email " + TEAM_EMAIL + " / " + TEAM_EMAIL_ALT + " or call " + TEAM_PHONE + "." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("queue-health-ai error", e);
    return new Response(JSON.stringify({ error: "Unexpected error. Reach the team at " + TEAM_EMAIL + " / " + TEAM_EMAIL_ALT + " or " + TEAM_PHONE + "." }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});