/**
 * Auth abstraction and utility layer for Supabase Authentication.
 */
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AuthRole = "customer" | "business" | "admin";

/**
 * Resolves the role for a given user ID from the database.
 */
export async function getUserRole(userId: string): Promise<AuthRole | null> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data.role as AuthRole;
  } catch (err) {
    console.error("Error fetching user role:", err);
    return null;
  }
}

/**
 * Resolves destination dashboard route based on user ID, metadata, and role.
 */
export async function resolveUserDestination(
  userId: string,
  targetNext?: string | null,
  userObj?: { email?: string | null; user_metadata?: Record<string, any> } | null
): Promise<string> {
  if (targetNext && targetNext.startsWith("/") && !targetNext.startsWith("//")) {
    return targetNext;
  }

  // 1. Fast-path: check email or user_metadata for instant routing without network latency
  const metaRole = userObj?.user_metadata?.role;
  const email = userObj?.email?.toLowerCase();

  if (email === "qblinktrial@gmail.com" || metaRole === "admin") {
    return "/admin";
  }
  if (metaRole === "business") {
    return "/dashboard";
  }
  if (metaRole === "customer") {
    return "/customer-dashboard";
  }

  // 2. Database checks in parallel with timeout guard (max 1.5s)
  try {
    const rolePromise = getUserRole(userId);
    const bizPromise = supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", userId)
      .limit(1)
      .then(({ data }) => (data && data.length > 0 ? ("business" as AuthRole) : null))
      .catch(() => null);
    const adminPromise = supabase
      .rpc("is_admin")
      .then(({ data, error }) => (!error && Boolean(data) ? ("admin" as AuthRole) : null))
      .catch(() => null);

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));

    const result = await Promise.race([
      Promise.allSettled([adminPromise, rolePromise, bizPromise]),
      timeoutPromise,
    ]);

    if (result && Array.isArray(result)) {
      const [adminRes, roleRes, bizRes] = result;
      if (adminRes.status === "fulfilled" && adminRes.value === "admin") return "/admin";
      if (roleRes.status === "fulfilled" && roleRes.value === "business") return "/dashboard";
      if (bizRes.status === "fulfilled" && bizRes.value === "business") return "/dashboard";
      if (roleRes.status === "fulfilled" && roleRes.value === "customer") return "/customer-dashboard";
    }
  } catch (err) {
    console.error("Error resolving user destination:", err);
  }

  // Default to customer dashboard
  return "/customer-dashboard";
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


