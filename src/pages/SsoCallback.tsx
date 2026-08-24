import { useEffect } from "react";
import { AuthenticateWithRedirectCallback, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { ensureRoleAndProfile } from "@/lib/auth/authService";
import { Loader2 } from "lucide-react";

export default function SsoCallback() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      ensureRoleAndProfile(user).then((targetUrl) => {
        navigate(targetUrl || "/auth");
      });
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center soft-bg">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Completing sign-in with Google…</p>
        <div className="hidden">
          <AuthenticateWithRedirectCallback />
        </div>
      </div>
    </div>
  );
}
