import { Link, useNavigate } from "react-router-dom";
import { Users, Building2, ArrowRight, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import logo from "@/assets/qblink-logo.png";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const RoleSelection = () => {
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const email = user?.email ?? null;

  const dashboardUrl = isAdmin ? "/admin" : role === "business" ? "/dashboard" : "/customer-dashboard";

  return (
    <div className="min-h-screen soft-bg flex flex-col items-center justify-center px-4 py-10">
      <SEO title="Get Started — Qblink" description="Join Qblink as a customer or business and start managing walk-in queues today." path="/auth" />
      <header className="w-full max-w-5xl flex items-center justify-between mb-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/10 flex items-center justify-center shrink-0">
            <img src={logo} alt="Qblink" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold text-foreground">Qblink</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(dashboardUrl)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </button>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors p-1.5"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/signin" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          )}
        </div>
      </header>

      <div className="w-full max-w-3xl text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Join Qblink</h1>
        <p className="text-lg text-muted-foreground">How would you like to use Qblink?</p>
        {email && (
          <div className="mt-4 inline-flex flex-col items-center gap-1 text-xs text-muted-foreground bg-card border border-border rounded-xl px-4 py-2">
            <span>Logged in as: <span className="font-semibold text-foreground">{email}</span></span>
            <span>Role: <span className="font-semibold text-primary capitalize">{role || (isAdmin ? "Admin" : "Customer")}</span></span>
          </div>
        )}
      </div>

      <div className={`w-full max-w-5xl grid gap-6 ${isAdmin ? "md:grid-cols-3" : "md:grid-cols-2 max-w-3xl"}`}>
        <Link
          to={user && role === "business" ? "/dashboard" : "/auth/business"}
          className="group bg-card rounded-3xl p-8 sm:p-10 card-shadow hover:elevated-shadow transition-all border-2 border-primary/50 hover:border-primary flex flex-col min-h-[320px] relative overflow-hidden"
        >
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
              Recommended for Owners
            </span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shrink-0">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Business & Counters</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
            Set up digital queues for your clinic, restaurant, salon, or store. Go live in under 2 minutes with zero hardware.
          </p>
          <div className="text-xs font-semibold text-primary mb-4 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Free Forever Pilot · No Credit Card Required</span>
          </div>
          <span className="inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all min-h-[44px]">
            {user && role === "business" ? "Open Business Dashboard" : "Start Business Account"} <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          to={user && role === "customer" ? "/customer-dashboard" : "/auth/customer"}
          className="group bg-card rounded-3xl p-8 sm:p-10 card-shadow hover:elevated-shadow transition-all border-2 border-border hover:border-primary/60 flex flex-col min-h-[320px] relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shrink-0">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Customer Account</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
            Track your live spot in line, bookmark favorite venues, view appointment history, and receive WhatsApp / email alerts.
          </p>
          <div className="text-xs font-semibold text-primary mb-4 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Instant Access · WhatsApp or Email</span>
          </div>
          <span className="inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all min-h-[44px]">
            {user && role === "customer" ? "Open Customer Dashboard" : "Customer Sign In & Sign Up"} <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className="group bg-card rounded-3xl p-10 card-shadow hover:elevated-shadow transition-all border border-border hover:border-primary/40 flex flex-col min-h-[320px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shrink-0">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Admin Panel</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-1">
              Manage the Qblink platform — monitor businesses, customers, queues, and revenue across the network.
            </p>
            <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all min-h-[44px]">
              Open Admin <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-10 text-center">
        By signing up, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
      </p>
    </div>
  );
};

export default RoleSelection;
