import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "customer" | "business" | "admin" | null;

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole>(() => {
    if (!user) return null;
    if (user.email?.toLowerCase() === "qblinktrial@gmail.com") return "admin";
    if (user.user_metadata?.role) return user.user_metadata.role as AppRole;
    return null;
  });
  const [loading, setLoading] = useState(() => !user || (!user.user_metadata?.role && user.email?.toLowerCase() !== "qblinktrial@gmail.com"));

  useEffect(() => {
    let cancelled = false;

    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    // Fast-path: Check metadata or admin email
    if (user.email?.toLowerCase() === "qblinktrial@gmail.com") {
      setRole("admin");
      setLoading(false);
      return;
    }

    if (user.user_metadata?.role) {
      setRole(user.user_metadata.role as AppRole);
      setLoading(false);
    }

    const fetchRole = async () => {
      try {
        const [roleRes, bizRes] = await Promise.allSettled([
          supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
          supabase.from("businesses").select("id").eq("owner_id", user.id).limit(1),
        ]);

        if (cancelled) return;

        if (roleRes.status === "fulfilled" && roleRes.value.data?.role) {
          setRole(roleRes.value.data.role as AppRole);
          setLoading(false);
          return;
        }

        if (bizRes.status === "fulfilled" && bizRes.value.data && bizRes.value.data.length > 0) {
          setRole("business");
          setLoading(false);
          return;
        }

        // If metadata was already present, keep it; otherwise default to customer
        setRole((prev) => prev || (user.user_metadata?.role as AppRole) || "customer");
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("Error determining user role:", err);
          setRole((prev) => prev || "customer");
          setLoading(false);
        }
      }
    };

    fetchRole();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email, authLoading]);

  return { role, loading: loading && authLoading };
};

