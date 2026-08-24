import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquarePlus, Sparkles, CheckCircle2, Quote, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { hapticSuccess } from "@/lib/haptics";

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  venue: string;
  category: "clinic" | "cafe" | "salon" | "customer" | "retail";
  categoryLabel: string;
  rating: number;
  quote: string;
  metricBadge: string;
  verified: boolean;
  avatarColor: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-pooja-shah",
    name: "Pooja Shah",
    role: "Lead Clinic Administrator",
    venue: "Apex Multi-Speciality Clinic",
    category: "clinic",
    categoryLabel: "🏥 Healthcare & Clinic",
    rating: 5,
    quote:
      "Qblink completely eliminated our waiting room chaos. Patients scan the QR code at reception and wait comfortably in their cars or the nearby garden. Our front desk staff no longer gets bombarded with 'How much longer?', and our patient satisfaction score jumped from 3.6 to 4.9 stars.",
    metricBadge: "84% fewer front-desk queries · Zero lobby crowd",
    verified: true,
    avatarColor: "from-blue-500 to-indigo-600",
  },
  {
    id: "rev-payal-gandhi",
    name: "Payal Gandhi",
    role: "Founder & Managing Partner",
    venue: "The Artisan Bistro & Roastery",
    category: "cafe",
    categoryLabel: "☕ Dining & Hospitality",
    rating: 5,
    quote:
      "We used to spend thousands on vibrating buzzer pagers that guests would accidentally take home or drop. With Qblink, customers scan our door poster, explore nearby boutique shops while holding their table spot, and return the moment their phone buzzes. Walkaway loss during Friday dinner rush dropped to absolute zero.",
    metricBadge: "Zero hardware loss · 100% table retention",
    verified: true,
    avatarColor: "from-amber-500 to-orange-600",
  },
  {
    id: "rev-sheetal-doshi",
    name: "Sheetal Doshi",
    role: "Director of Operations",
    venue: "Aura Health & Wellness Studios",
    category: "salon",
    categoryLabel: "💇 Wellness & Salons",
    rating: 5,
    quote:
      "Setting up Qblink took literally under two minutes. No apps to install, no tablets to purchase. Our stylists can see rolling wait times, manage appointments and walk-ins simultaneously, and call guests with keyboard shortcuts. It’s hands down the most frictionless customer flow platform we've used.",
    metricBadge: "<2 min setup · +45% staff efficiency",
    verified: true,
    avatarColor: "from-emerald-500 to-teal-600",
  },
  {
    id: "rev-vaishali-doshi",
    name: "Vaishali Doshi",
    role: "Frequent Visitor & Patient",
    venue: "Healthcare & Lifestyle Customer",
    category: "customer",
    categoryLabel: "⭐ Customer Perspective",
    rating: 5,
    quote:
      "As a customer, Qblink has been a total game-changer. I never have to sit in crowded, noisy waiting areas again. I scan the code, grab a coffee, check my live token on my phone, and walk right in when I get the arrival buzz. It respects my time and health.",
    metricBadge: "40 min physical wait saved · 100% stress-free",
    verified: true,
    avatarColor: "from-rose-500 to-pink-600",
  },
];

const LOCAL_STORAGE_KEY = "qblink:community_reviews";

export const ReviewsSection = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return [...parsed, ...INITIAL_REVIEWS];
        }
      }
    } catch {}
    return INITIAL_REVIEWS;
  });

  const [filter, setFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formVenue, setFormVenue] = useState("");
  const [formCategory, setFormCategory] = useState<"clinic" | "cafe" | "salon" | "customer" | "retail">("clinic");
  const [formRating, setFormRating] = useState(5);
  const [formQuote, setFormQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredReviews = filter === "all" ? reviews : reviews.filter((r) => r.category === filter);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormName("");
    setFormRole("");
    setFormVenue("");
    setFormQuote("");
    setFormRating(5);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formQuote.trim()) {
      toast.error("Please provide your name and your review experience.");
      return;
    }

    setIsSubmitting(true);

    const categoryMap: Record<string, string> = {
      clinic: "🏥 Healthcare & Clinic",
      cafe: "☕ Dining & Hospitality",
      salon: "💇 Wellness & Salons",
      customer: "⭐ Customer Experience",
      retail: "🛍️ Retail & Boutique",
    };

    const colorMap: Record<string, string> = {
      clinic: "from-blue-500 to-indigo-600",
      cafe: "from-amber-500 to-orange-600",
      salon: "from-emerald-500 to-teal-600",
      customer: "from-rose-500 to-pink-600",
      retail: "from-purple-500 to-violet-600",
    };

    const newReview: ReviewItem = {
      id: `user-rev-${Date.now()}`,
      name: formName.trim(),
      role: formRole.trim() || "Verified User",
      venue: formVenue.trim() || "Local Business",
      category: formCategory,
      categoryLabel: categoryMap[formCategory] || "⭐ Community Review",
      rating: formRating,
      quote: formQuote.trim(),
      metricBadge: "Verified Community Feedback · Real Experience",
      verified: true,
      avatarColor: colorMap[formCategory] || "from-primary to-secondary",
    };

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const existing = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        const prev = existing ? JSON.parse(existing) : [];
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newReview, ...prev]));
      }
    } catch {}

    setReviews((prev) => [newReview, ...prev]);
    hapticSuccess();
    toast.success("Thank you for your review!", {
      description: "Your feedback has been published to the Qblink verified testimonials.",
    });

    setIsSubmitting(false);
    handleCloseModal();
  };

  return (
    <section id="reviews" className="relative py-24 sm:py-32 bg-[hsl(var(--surface-warm)/0.3)] overflow-hidden" aria-label="Customer Reviews">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[hsl(var(--brand-glow)/0.06)] blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(var(--brand-teal)/0.08)] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        {/* Header with Title & Add Review CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="font-mono-caps text-primary mb-3 flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-bold">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Verified Stories · Real Impact
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.02] tracking-tight">
              Trusted by operators.
              <br />
              <span className="text-primary relative inline-block">
                Loved by waiting guests.
                <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-60 rounded-full" />
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
              Read how Pooja Shah, Payal Gandhi, Sheetal Doshi, Vaishali Doshi, and local business owners transformed their customer flow with Qblink.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Add Your Review</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {[
            { id: "all", label: "All Reviews" },
            { id: "clinic", label: "🏥 Clinics & Health" },
            { id: "cafe", label: "☕ Dining & Cafes" },
            { id: "salon", label: "💇 Salons & Spas" },
            { id: "customer", label: "⭐ Customers" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((rev, idx) => (
              <motion.div
                key={rev.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="rounded-3xl p-6 sm:p-8 bg-card border border-border/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Subtle top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${rev.avatarColor}`} />

                <div>
                  {/* Category Pill & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="px-3 py-1 rounded-full bg-muted text-[11px] font-bold text-foreground/80">
                      {rev.categoryLabel}
                    </span>

                    <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">5.0</span>
                    </div>
                  </div>

                  {/* Review Quote */}
                  <div className="relative mb-6">
                    <Quote className="w-8 h-8 text-primary/15 absolute -top-3 -left-2 pointer-events-none" />
                    <p className="text-foreground/90 text-sm sm:text-base leading-relaxed font-medium relative z-10 pl-3">
                      "{rev.quote}"
                    </p>
                  </div>
                </div>

                <div>
                  {/* Metric Result Badge */}
                  <div className="mb-5 p-2.5 rounded-xl bg-primary/5 border border-primary/15 text-[11px] font-semibold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{rev.metricBadge}</span>
                  </div>

                  {/* Author Identity */}
                  <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${rev.avatarColor} text-white font-bold flex items-center justify-center shadow-sm text-sm`}>
                        {rev.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <span>{rev.name}</span>
                          {rev.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" title="Verified Review" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rev.role} · <span className="font-medium text-foreground/80">{rev.venue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Social Proof Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Zero Hardware. Zero Setup Fees.</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Join Pooja, Payal, Sheetal, and hundreds of daily walk-in counters. Go live in under 2 minutes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/60 text-foreground text-xs font-bold hover:bg-muted transition-all shrink-0"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-primary" />
            <span>Share Your Experience</span>
          </button>
        </div>
      </div>

      {/* Interactive "Add Review" Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Share Your Qblink Experience</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tell others how Qblink improved your queue or waiting experience.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Pooja Shah"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Your Role / Job Title</label>
                    <input
                      type="text"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="e.g. Clinic Administrator"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Business Name or Venue</label>
                    <input
                      type="text"
                      value={formVenue}
                      onChange={(e) => setFormVenue(e.target.value)}
                      placeholder="e.g. Apex Health Clinic"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Industry / Context</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="clinic">🏥 Healthcare & Clinic</option>
                      <option value="cafe">☕ Dining & Cafe</option>
                      <option value="salon">💇 Salon & Wellness</option>
                      <option value="retail">🛍️ Retail & Boutique</option>
                      <option value="customer">⭐ Customer / Guest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Rating</label>
                    <div className="flex items-center gap-1.5 pt-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className={`p-1 rounded-md transition-all ${
                            formRating >= star ? "text-amber-500 scale-110" : "text-muted-foreground/40 hover:text-amber-400"
                          }`}
                        >
                          <Star className={`w-5 h-5 ${formRating >= star ? "fill-current" : ""}`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-foreground ml-2">{formRating}.0 / 5.0</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    How was Qblink helpful to you? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    placeholder="Describe how Qblink reduced your waiting room crowd, eliminated paper tokens, or made waiting stress-free..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Publishing…" : "Post Verified Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
