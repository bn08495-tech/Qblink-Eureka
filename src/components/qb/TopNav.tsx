import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import logo from "@/assets/qblink-logo.png";

const links = [
  { label: "Product", href: "#product" },
  { label: "Simulation", href: "#simulation" },
  { label: "Industries", href: "#industries" },
  { label: "Reviews", href: "#reviews" },
  { label: "ROI Estimator", href: "#roi" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
  { label: "FAQ", href: "#faq" },
  { label: "Demo", href: "#demo" },
];

/**
 * Horizontal product navigation for the marketing surface.
 * Transparent over the hero stage, glass once scrolled.
 */
export const TopNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("product");
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const dashboardUrl = isAdmin ? "/admin" : role === "business" ? "/dashboard" : "/customer-dashboard";

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      // Simple active section detection
      const sectionIds = ["product", "simulation", "industries", "reviews", "roi", "pricing", "contact", "faq", "demo"];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-[4.5rem] flex items-center gap-8" aria-label="Primary">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Qblink home">
          <div className="w-8 h-8 rounded-lg bg-white p-1 shadow-sm ring-1 ring-black/10 flex items-center justify-center shrink-0">
            <img src={logo} alt="Qblink logo" className="w-full h-full object-contain" draggable={false} />
          </div>
          <span className={`font-display text-lg tracking-tight font-extrabold ${scrolled ? "text-foreground" : "stage-text"}`}>
            Qblink
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium">
          {links.map((l) => {
            const id = l.href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <a
                key={l.href}
                href={l.href}
                className={`transition-all relative py-1 ${
                  isActive
                    ? "text-primary font-bold"
                    : scrolled
                    ? "text-muted-foreground hover:text-foreground"
                    : "stage-muted hover:text-[hsl(var(--brand-cream))]"
                }`}
              >
                {l.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in duration-200" />
                )}
              </a>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Always accessible ThemeToggle in header */}
          <div className="flex items-center">
            <ThemeToggle size="sm" />
          </div>

          <Link
            to="/pitch"
            className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-all ${
              scrolled
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                : "border-primary/40 bg-primary/20 text-[hsl(var(--brand-cream))] hover:bg-primary/30"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pitch Demo</span>
          </Link>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to={dashboardUrl}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className={`p-2 rounded-lg transition-colors ${
                  scrolled ? "text-muted-foreground hover:text-destructive hover:bg-muted" : "stage-muted hover:text-red-400 hover:bg-white/10"
                }`}
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/auth/signin"
                className={`hidden sm:inline-block text-sm px-3 py-2 rounded-lg transition-colors ${
                  scrolled ? "text-foreground hover:bg-muted" : "stage-text hover:bg-[hsl(var(--brand-cream)/0.1)]"
                }`}
              >
                Sign in
              </Link>

              <Link
                to="/auth/business"
                className="text-sm font-semibold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-xs text-center"
              >
                Start free pilot
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`md:hidden p-2 rounded-xl border border-border/60 bg-card/60 backdrop-blur-md transition-colors ${
              scrolled ? "text-foreground hover:bg-muted" : "stage-text hover:bg-white/10"
            }`}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      <div 
        className={`md:hidden transition-all duration-300 ease-out overflow-y-auto ${
          open 
            ? "max-h-[calc(100vh-4.5rem)] opacity-100 shadow-2xl border-b border-border" 
            : "max-h-0 opacity-0 pointer-events-none border-b-0"
        } bg-background/98 backdrop-blur-2xl`}
      >
        <div className="px-5 pt-3 pb-6 space-y-4">
          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-1.5">
            {links.map((l) => {
              const id = l.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold border border-primary/20"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/40"}`} />
                  <span>{l.label}</span>
                </a>
              );
            })}
          </div>

          {/* Quick Utility & Actions Panel */}
          <div className="pt-3 border-t border-border/80 flex flex-col gap-3">
            {/* Theme & Appearance Row */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/60">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Theme & Appearance</span>
                <span className="text-[11px] text-muted-foreground">Switch between Light and Dark mode</span>
              </div>
              <ThemeToggle size="md" />
            </div>

            {/* Action Buttons */}
            {user ? (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to={dashboardUrl}
                  onClick={() => setOpen(false)}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs text-center shadow-md shadow-primary/20 hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="w-full py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive font-semibold text-xs text-center flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/pitch"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-primary/30 bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-all text-center"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Pitch Demo</span>
                  </Link>
                  <Link
                    to="/auth/signin"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center py-2.5 px-3 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-all text-center"
                  >
                    Sign in
                  </Link>
                </div>

                <Link
                  to="/auth/business"
                  onClick={() => setOpen(false)}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs text-center shadow-md shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Start Free Pilot (No Credit Card)
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
