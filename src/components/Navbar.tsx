import { useState } from "react";
import { Menu, X, Shield, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/qblink-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const navLinks = [
  { label: "Product", href: "/#product" },
  { label: "Simulation", href: "/#simulation" },
  { label: "Industries", href: "/#industries" },
  { label: "ROI Estimator", href: "/#roi" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Affiliate", href: "/affiliate" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const { isAdmin } = useIsAdmin();

  const dashboardUrl = isAdmin ? "/admin" : role === "business" ? "/dashboard" : "/customer-dashboard";

  const handleNavClick = (href: string) => {
    setOpen(false);
    if (href.startsWith("/#")) {
      if (isHome) {
        const el = document.querySelector(href.replace("/", ""));
        el?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="section-container flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/10 flex items-center justify-center shrink-0">
            <img src={logo} alt="Qblink" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold text-foreground">Qblink</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) =>
            l.href.startsWith("/") && !l.href.startsWith("/#") ? (
              <Link key={l.href} to={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} onClick={(e) => { if (isHome && l.href.startsWith("/#")) { e.preventDefault(); handleNavClick(l.href); } }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            )
          )}
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
              <Shield size={14} /> Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link to={dashboardUrl} className="gradient-bg text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth/signin" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link to="/auth/business" className="gradient-bg text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-xs">
                Start Free Pilot
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden text-foreground p-2" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((l) =>
                l.href.startsWith("/") && !l.href.startsWith("/#") ? (
                  <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">
                    {l.label}
                  </Link>
                ) : (
                  <a key={l.href} href={l.href} onClick={(e) => { if (isHome) { e.preventDefault(); handleNavClick(l.href); } else { setOpen(false); } }} className="text-sm font-medium text-muted-foreground hover:text-foreground py-2">
                    {l.label}
                  </a>
                )
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-1.5 text-sm font-semibold text-primary py-2">
                  <Shield size={14} /> Admin
                </Link>
              )}

              {user ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Link to={dashboardUrl} onClick={() => setOpen(false)} className="gradient-bg text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                  </Link>
                  <button
                    onClick={() => { setOpen(false); signOut(); }}
                    className="border border-border text-muted-foreground hover:text-destructive py-2 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <Link to="/auth/signin" onClick={() => setOpen(false)} className="border border-border text-foreground py-2.5 rounded-xl text-sm font-semibold text-center hover:bg-muted">
                    Sign In
                  </Link>
                  <Link to="/auth/business" onClick={() => setOpen(false)} className="gradient-bg text-primary-foreground py-2.5 rounded-xl text-sm font-semibold text-center shadow-xs">
                    Start Free Pilot
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
