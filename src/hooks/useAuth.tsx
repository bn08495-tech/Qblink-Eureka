import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AppUser {
  id: string;
  email: string | null;
  phone?: string | null;
  fullName?: string | null;
  imageUrl?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    phone?: string;
    role?: string;
    [key: string]: any;
  };
}

export interface AuthCtx {
  session: Session | null;
  user: AppUser | null;
  rawUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: { user: User | null; session: Session | null }; error: any }>;
  signUp: (params: { email: string; password: string; options?: any }) => Promise<{ data: { user: User | null; session: Session | null }; error: any }>;
  setSessionState: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  session: null,
  user: null,
  rawUser: null,
  loading: true,
  signIn: async () => ({ data: { user: null, session: null }, error: null }),
  signUp: async () => ({ data: { user: null, session: null }, error: null }),
  setSessionState: () => {},
  signOut: async () => {},
});

export function mapSupabaseUser(user: User | null): AppUser | null {
  if (!user) return null;
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email ? user.email.split("@")[0] : "User");
  const imageUrl = user.user_metadata?.avatar_url || null;
  const phone = user.phone || user.user_metadata?.phone || null;

  return {
    id: user.id,
    email: user.email ?? null,
    phone,
    fullName,
    imageUrl,
    user_metadata: user.user_metadata,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [rawUser, setRawUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const applySession = (newSession: Session | null) => {
    setSession(newSession);
    setRawUser(newSession?.user ?? null);
    setUser(mapSupabaseUser(newSession?.user ?? null));
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    // 1. Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        applySession(session);
      })
      .catch((err) => {
        console.error("Failed to get Supabase session:", err);
        if (mounted) setLoading(false);
      });

    // 2. Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      applySession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.data?.session) {
      applySession(result.data.session);
    } else {
      setLoading(false);
    }
    return result;
  };

  const signUp = async (params: { email: string; password: string; options?: any }) => {
    setLoading(true);
    const result = await supabase.auth.signUp(params);
    if (result.data?.session) {
      applySession(result.data.session);
    } else {
      setLoading(false);
    }
    return result;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      applySession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        rawUser,
        loading,
        signIn,
        signUp,
        setSessionState: applySession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

