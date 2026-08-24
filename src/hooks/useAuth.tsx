import { createContext, useContext, ReactNode, useMemo } from "react";
import { useUser, useClerk, useSession } from "@clerk/clerk-react";
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
  };
  clerkUser?: ReturnType<typeof useUser>["user"];
}

interface AuthCtx {
  session: any;
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { session: clerkSession } = useSession();
  const clerk = useClerk();

  const user: AppUser | null = useMemo(() => {
    if (!isSignedIn || !clerkUser) return null;
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;
    const fullName = clerkUser.fullName || clerkUser.firstName || email?.split("@")[0] || "User";
    const imageUrl = clerkUser.imageUrl;

    return {
      id: clerkUser.id,
      email,
      fullName,
      imageUrl,
      user_metadata: {
        full_name: fullName,
        name: fullName,
        avatar_url: imageUrl,
      },
      clerkUser,
    };
  }, [clerkUser, isSignedIn]);

  const signOut = async () => {
    await clerk.signOut();
    await supabase.auth.signOut().catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        session: clerkSession ?? (user ? { user } : null),
        user,
        loading: !clerkLoaded,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

