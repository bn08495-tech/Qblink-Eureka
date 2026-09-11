import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Scale, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import logo from "@/assets/qblink-logo.png";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  return (
    <div className="min-h-screen soft-bg px-4 py-10 sm:py-16">
      <SEO
        title="Terms of Service — Qblink"
        description="Terms of service and platform usage agreements for Qblink digital queue platform."
        path="/terms"
      />

      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Qblink
        </Link>

        {/* Founder & Legal Review Warning Banner */}
        <div
          role="alert"
          className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 p-5 sm:p-6 mb-8 text-amber-950 dark:text-amber-100"
        >
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-bold tracking-tight">
                [DRAFT FOR FOUNDER & LEGAL COUNSEL REVIEW — APPROVAL REQUIRED BEFORE PRODUCTION DEPLOYMENT]
              </h2>
              <p className="text-sm leading-relaxed opacity-90">
                These terms describe operating rules, pilot usage guidelines, and service boundaries for the Qblink platform.
                Final liability caps, governing law jurisdiction, and enterprise terms require review and written sign-off by Qblink leadership.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <article className="bg-card rounded-2xl p-6 sm:p-10 card-shadow border border-border space-y-8 text-foreground">
          <header className="border-b border-border pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/10 flex items-center justify-center shrink-0">
                <img src={logo} alt="Qblink" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold">Qblink</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Last Updated: March 2025 · Working Draft Version 0.9
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" /> 1. Platform Purpose & Scope
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Qblink provides a cloud-hosted customer flow and queue intelligence system for walk-in businesses, restaurants, clinics, salons, and customer-facing venues. By creating an account or accessing a Qblink digital queue, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> 2. Pilot & Early Access Usage
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              During early access and pilot programs, Qblink offers core platform functionality without initial software license fees. Businesses agree to provide reasonable operational feedback. Qblink reserves the right to modify pilot terms, introduce paid subscription tiers, or update queue quotas with advance notification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" /> 3. Acceptable Use & Fair Usage
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Users and operators agree not to:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1 pl-2">
              <li>Submit automated, synthetic, or fraudulent queue entries designed to manipulate wait time calculations or exhaust SMS/WhatsApp quotas.</li>
              <li>Reverse engineer, decompile, or tamper with the live queue synchronization protocols or APIs.</li>
              <li>Attempt to gain unauthorized access to other businesses' tenant data, customer profiles, or administrative panels.</li>
              <li>Broadcast abusive, deceptive, or unsolicited marketing material through queue alert channels.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" /> 4. Service Estimates & Disclaimers
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Estimated wait times and position calculations are automated approximations based on historical service durations and real-time operator progress. Qblink is not liable for customer delays, walkaways, or scheduling deviations arising from sudden walk-in volume surges, staffing changes, or network disconnects.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-xl font-bold">5. Governing Law & Enterprise Contracting</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              These terms are governed by the laws of India. For custom Service Level Agreements (SLAs), enterprise multi-location deployments, or dedicated compliance schedules, contact:
            </p>
            <div className="bg-muted/50 rounded-xl p-4 text-sm text-foreground space-y-1 border border-border/80">
              <p><strong>Support & Enterprise:</strong> Qblink Legal & Operations</p>
              <p><strong>Email:</strong> <a href="mailto:teamqblink@gmail.com" className="text-primary hover:underline">teamqblink@gmail.com</a></p>
              <p><strong>Secondary Email:</strong> <a href="mailto:qblinkofficial@gmail.com" className="text-primary hover:underline">qblinkofficial@gmail.com</a></p>
              <p><strong>Phone:</strong> +91 9372090507</p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};

export default TermsOfService;
