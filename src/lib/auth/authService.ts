/**
 * Auth abstraction layer with Clerk Google Authentication support.
 */
import { supabase } from "@/integrations/supabase/client";

export type AuthRole = "customer" | "business";

export interface UserLike {
  id: string;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress?: string } | null;
  emailAddresses?: Array<{ emailAddress?: string }>;
}

/**
 * Prepares session storage with the user's role before triggering Google OAuth.
 */
export function prepareGoogleAuth(role: AuthRole, redirectPath?: string): void {
  try {
    sessionStorage.setItem("qblink.pendingRole", role);
    if (redirectPath) sessionStorage.setItem("qblink.pendingNext", redirectPath);
  } catch {
    /* storage unavailable */
  }
}

/**
 * Idempotently provisions user_roles / customer_profiles / business rows for the
 * signed-in Clerk user and returns the destination URL.
 */
export async function ensureRoleAndProfile(clerkUser?: UserLike | null): Promise<string> {
  if (!clerkUser) return "/auth";

  const userId = clerkUser.id;
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
  const fullName = clerkUser.fullName || email.split("@")[0] || "User";

  let role: AuthRole = "customer";
  let targetNext: string | null = null;

  try {
    const storedRole = sessionStorage.getItem("qblink.pendingRole");
    if (storedRole === "business" || storedRole === "customer") role = storedRole;
    targetNext = sessionStorage.getItem("qblink.pendingNext");
  } catch {
    /* ignore */
  }

  const { data: existingRoles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1);

  if (!existingRoles || existingRoles.length === 0) {
    await supabase.from("user_roles").insert({ user_id: userId, role });
    if (role === "customer") {
      await supabase.from("customer_profiles").insert({
        user_id: userId,
        full_name: fullName,
      });
    }
  } else {
    role = (existingRoles[0]?.role as AuthRole) || role;
  }

  // Create stashed business draft if exists
  try {
    const draftRaw = sessionStorage.getItem("qblink.pendingBusiness");
    if (draftRaw) {
      const draft = JSON.parse(draftRaw);
      const { data: existingBiz } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", userId)
        .limit(1);

      if (!existingBiz || existingBiz.length === 0) {
        await supabase.from("businesses").insert({
          owner_id: userId,
          name: draft.name,
          category: draft.category,
          description: draft.description || null,
          address: draft.address || null,
          default_settings: draft.default_settings || {},
        });
      }
      sessionStorage.removeItem("qblink.pendingBusiness");
    }
  } catch {
    /* ignore */
  }

  if (targetNext && targetNext.startsWith("/")) {
    sessionStorage.removeItem("qblink.pendingNext");
    return targetNext;
  }

  return role === "business" ? "/dashboard" : "/customer-dashboard";
}

/* --------------------- Verification-state helpers ---------------------- */

export interface VerificationStatus {
  signedIn: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  phone: string | null;
  primaryEmail: string | null;
}

export async function getVerificationStatus(): Promise<VerificationStatus> {
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) {
    return { signedIn: false, phoneVerified: false, emailVerified: false, phone: null, primaryEmail: null };
  }
  return {
    signedIn: true,
    phoneVerified: Boolean(u.phone_confirmed_at),
    emailVerified: Boolean(u.email_confirmed_at),
    phone: u.phone ?? null,
    primaryEmail: u.email ?? null,
  };
}

export async function isPhoneVerified(): Promise<boolean> {
  return (await getVerificationStatus()).phoneVerified;
}

export async function isEmailVerified(): Promise<boolean> {
  return (await getVerificationStatus()).emailVerified;
}

