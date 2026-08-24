import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Mail, Lock, Phone, AlertCircle, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/qblink-logo.png";
import SEO from "@/components/SEO";
import { COUNTRY_CODES, normalizePhone, phoneToEmail, isValidPhone } from "@/lib/phoneAuth";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { GoogleButton, AuthDivider } from "@/components/auth/GooglePickerModal";
import { prepareGoogleAuth } from "@/lib/auth/authService";

const SignIn = () => {
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  const nextUrl = searchParams.get("next");
  const safeNext = nextUrl && nextUrl.startsWith("/") && !nextUrl.startsWith("//") ? nextUrl : null;
  const signupHref = safeNext ? `/auth/customer?next=${encodeURIComponent(safeNext)}` : "/auth";

  const handleGoogle = async () => {
    setGoogleBusy(true);
    try {
      prepareGoogleAuth("customer", safeNext ?? undefined);
      const redirectUrlComplete = safeNext || "/customer-dashboard";
      if (signIn) {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete,
        });
      } else if (signUp) {
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete,
        });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't sign in with Google");
    } finally {
      setGoogleBusy(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading && !roleLoading && !adminLoading) {
      if (safeNext) {
        navigate(safeNext);
        return;
      }
      if (isAdmin) {
        navigate("/admin");
        return;
      }
      if (role === "business") navigate("/dashboard");
      else if (role === "customer") navigate("/customer-dashboard");
      else {
        toast.error("No profile found for this account. Please sign up first.");
        navigate("/auth");
      }
    }
  }, [user, role, authLoading, roleLoading, adminLoading, isAdmin, navigate, safeNext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    let loginEmail = email.trim();
    if (mode === "phone") {
      if (!isValidPhone(phone)) {
        setErrorMsg("Enter a valid WhatsApp number (at least 7 digits).");
        setLoading(false);
        return;
      }
      loginEmail = phoneToEmail(normalizePhone(countryCode, phone));
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (error) {
      const raw = (error.message || "").toLowerCase();
      let msg = mode === "phone"
        ? "We couldn't sign you in. Check your number and password."
        : "We couldn't sign you in. Check your email and password.";
      if (raw.includes("invalid login")) {
        msg = mode === "phone"
          ? "That number and password don't match. Try again or create an account."
          : "That email and password don't match. Try again or reset your password.";
      } else if (raw.includes("email not confirmed") || raw.includes("not confirmed")) {
        msg = "Please verify your account first, then sign in.";
      } else if (raw.includes("rate") || raw.includes("too many")) {
        msg = "Too many attempts. Please wait a moment and try again.";
      } else if (raw.includes("network") || raw.includes("fetch")) {
        msg = "Network issue. Check your connection and try again.";
      }
      setErrorMsg(msg);
      toast.error(msg);
      setLoading(false);
    } else {
      toast.success("Welcome back!");
    }
  };

  return (
    <div className="min-h-screen soft-bg flex items-center justify-center px-4 py-10">
      <SEO title="Sign in — Qblink" description="Sign in to your Qblink account to manage queues or track your spot." path="/auth/signin" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="Qblink" className="h-10 w-10 rounded-lg object-contain" />
            <span className="text-2xl font-bold text-foreground">Qblink</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your Qblink account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 sm:p-8 card-shadow space-y-4">
          <GoogleButton onClick={handleGoogle} loading={googleBusy} label="Sign in with Google" />
          <AuthDivider />
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted">
            <button type="button" onClick={() => setMode("phone")}
              className={`py-2 rounded-lg text-sm font-medium transition ${mode === "phone" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              WhatsApp
            </button>
            <button type="button" onClick={() => setMode("email")}
              className={`py-2 rounded-lg text-sm font-medium transition ${mode === "email" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              Email
            </button>
          </div>

          {mode === "phone" ? (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">WhatsApp number</label>
              <div className="flex gap-2">
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                  className="px-4 py-3.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors">
                  {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="tel" inputMode="numeric" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^\d\s-]/g, ""))}
                    required placeholder="98765 43210"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors" />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-1 rounded-md"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {mode === "email" && (
              <div className="mt-2 text-right">
                <Link to="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}
          </div>

          {errorMsg && (
            <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex gap-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-destructive font-medium leading-snug">{errorMsg}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  <Link to={signupHref} className="text-primary font-semibold hover:underline">Create account</Link>
                  {mode === "email" && (
                    <Link to="/auth/forgot-password" className="text-primary font-semibold hover:underline">Reset password</Link>
                  )}
                  <button type="button" onClick={() => { setErrorMsg(null); setPassword(""); }} className="text-muted-foreground hover:text-foreground">Try again</button>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full gradient-bg text-primary-foreground py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to={signupHref} className="text-primary font-semibold hover:underline">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;

