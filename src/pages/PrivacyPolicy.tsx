import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Lock, Database, Bell, Smartphone, FileText } from "lucide-react";
import logo from "@/assets/qblink-logo.png";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen soft-bg px-4 py-10 sm:py-16">
      <SEO
        title="Privacy Policy — Qblink"
        description="Privacy policy and data processing practices for Qblink digital queue platform."
        path="/privacy"
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
                This document describes the current operational data practices of the Qblink platform.
                Final statutory commitments, jurisdiction-specific compliance disclosures, and subprocessor schedules
                remain subject to formal review and written approval by Qblink leadership.
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Last Updated: March 2025 · Working Draft Version 0.9
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> 1. Principles & Architecture
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Qblink is designed as a browser-first, hardware-free customer flow system. Customers joining a queue do not need to download an application or create a persistent account. Data collection is intentionally minimized to what is strictly required to orchestrate queue entry, calculate wait times, and alert customers when their service slot is ready.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" /> 2. Information We Collect
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground">A. Queue Visitors (Walk-in Customers)</h3>
                <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
                  <li><strong>Contact Information:</strong> Phone number (or email) entered voluntarily when scanning a QR code or accessing a queue link, used solely for sending queue position alerts and readiness notifications.</li>
                  <li><strong>Party Details:</strong> Optional party size and visitor display name, used by host staff to call your party.</li>
                  <li><strong>Operational Timestamps:</strong> Time of joining, time called to counter, and time marked served or cancelled, used solely to compute rolling estimated wait times.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground">B. Business Accounts</h3>
                <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
                  <li><strong>Account Credentials:</strong> Email address, hashed password, and organization name.</li>
                  <li><strong>Business Configuration:</strong> Operating hours, average service times, counter assignments, and notification preferences.</li>
                  <li><strong>Billing Records:</strong> Subscription status and plan tier. <em>Note: Payment card details are handled directly by payment processors and are never stored on Qblink application servers.</em></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground">C. Device & Local Storage</h3>
                <p className="mt-1 leading-relaxed">
                  We use browser local storage and session tokens (such as Supabase authentication session tokens, dark/light theme preference, and optional visitor pre-fill consent) strictly for functional session persistence. We do not use third-party tracking cookies across external websites.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> 3. How We Use Information
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We process data exclusively for:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1 pl-2">
              <li>Facilitating the queue flow between customers and the specific business they visited.</li>
              <li>Delivering automated queue readiness notifications via SMS, WhatsApp, or browser push.</li>
              <li>Providing operational analytics (aggregate throughput, wait time trends) to business operators.</li>
              <li>Preventing spam, duplicate token generation, and malicious disruption of queue counters.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" /> 4. Third-Party Subprocessors
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Infrastructure providers supporting the Qblink platform currently include:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-1 pl-2">
              <li><strong>Database & Authentication:</strong> Supabase (PostgreSQL hosting with Row-Level Security).</li>
              <li><strong>Hosting & Edge Delivery:</strong> Vercel.</li>
              <li><strong>Messaging / Telephony:</strong> [TO BE CONFIRMED BY FOUNDER: Twilio / Gupshup / WhatsApp Business API Provider].</li>
              <li><strong>Payment Processing:</strong> [TO BE CONFIRMED BY FOUNDER: Razorpay / Stripe Sandbox Mode].</li>
            </ul>
            <p className="text-xs text-amber-700 dark:text-amber-300 italic mt-2">
              [Note for Legal Review: Complete legal entity names, processing locations, and Data Processing Addendum references will be appended prior to general availability.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> 5. Data Retention & User Rights
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Queue visitor records for completed tickets are retained for business reporting purposes in accordance with operational requirements. Users and businesses may request deletion of their records or an export of their stored profile by contacting our administration team.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 italic">
              [Note for Legal Review: Formal retention schedule—e.g., 30/90 days for transient visitor records vs. active business tenant records—is awaiting founder confirmation.]
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-xl font-bold">6. Contact & Legal Inquiries</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              For any privacy inquiries, data deletion requests, or legal notices, contact:
            </p>
            <div className="bg-muted/50 rounded-xl p-4 text-sm text-foreground space-y-1 border border-border/80">
              <p><strong>Team:</strong> Qblink Privacy & Operations</p>
              <p><strong>Email:</strong> <a href="mailto:teamqblink@gmail.com" className="text-primary hover:underline">teamqblink@gmail.com</a></p>
              <p><strong>Secondary Email:</strong> <a href="mailto:qblinkofficial@gmail.com" className="text-primary hover:underline">qblinkofficial@gmail.com</a></p>
              <p><strong>Location:</strong> India</p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
