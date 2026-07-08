import { useState, useEffect, type FormEvent } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Review = {
  name: string;
  tag: string;
  rating: number;
  text: string;
};

const SEED_REVIEWS: Review[] = [
  { name: "umer_0_0_imran", tag: "Mango.io", rating: 5, text: "It was immaculate the tast was justified the mangos were fresh and juicy 😋" },
  { name: "Verified Customer", tag: "The Cheesecake Method", rating: 5, text: "Thanks for the cake acha lga hum sabko ✨" },
  { name: "ibrahimraza5555", tag: "Signature Collection", rating: 5, text: "Perfection 🔥 💗" },
  { name: "eshaalkhn_", tag: "Premium Series", rating: 5, text: "Looks so yummy, keep going 🤍 😋" },
  { name: "noor.raza1234", tag: "The Cheesecake Method", rating: 5, text: "Delicious 🤤" },
]; 

const PRODUCT_OPTIONS = [
  "Biscoff Override",
  "Binary Cookie",
  "Pistachio Table",
  "Mango.io",
  "Strawberry.exe",
  "Signature Collection",
  "Premium Series",
  "The Cheesecake Method",
];

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= value ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <article className="bg-secondary/70 border border-border rounded-md p-6 flex flex-col gap-3 break-inside-avoid mb-6">
      <Stars value={r.rating} />
      <p className="text-sm sm:text-base text-foreground leading-relaxed">"{r.text}"</p>
      <div className="mt-2 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-foreground truncate">@{r.name}</span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-primary shrink-0">{r.tag}</span>
      </div>
    </article>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [name, setName] = useState("");
  const [product, setProduct] = useState(PRODUCT_OPTIONS[0]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // READ (GET): Fetch reviews on mount
  // ==========================================
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Map Supabase DB columns to our React component's Review type
          const formattedReviews = data.map((item) => ({
            name: item.name,
            tag: item.product_tag,
            rating: item.rating,
            text: item.review_text,
          }));
          
          // Combine the real DB reviews (first) with the hardcoded seeds (last)
          setReviews([...formattedReviews, ...SEED_REVIEWS]);
        }
      } catch (err) {
        console.error("Failed to load reviews from Supabase:", err);
        // We leave the SEED_REVIEWS in place as a graceful fallback
      }
    };

    fetchReviews();
  }, []);

  // ==========================================
  // WRITE (POST): Submit a new review
  // ==========================================
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().replace(/^@/, "");
    const cleanText = text.trim();
    if (!cleanName || !cleanText || rating < 1) {
      toast.error("Please fill out your name, rating, and review.");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Insert into DB and select the new row back
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          name: cleanName,
          product_tag: product,
          rating,
          review_text: cleanText,
        })
        .select()
        .single();

      if (error) throw error;

      // Update the UI immediately with the verified DB data
      const newReview: Review = {
        name: data.name,
        tag: data.product_tag,
        rating: data.rating,
        text: data.review_text,
      };

      // Ensure the new review goes at the very top of the list
      setReviews((r) => [newReview, ...r]);
      toast.success("Thanks for the love! Your review has been submitted.");
      
      // Reset form fields
      setName("");
      setText("");
      setRating(5);
      setProduct(PRODUCT_OPTIONS[0]);

    } catch (err: any) {
      console.warn("Review insert error:", err?.message);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24">
      {/* Reviews grid */}
      <div className="flex items-center gap-6 mb-10">
        <div className="flex-1 gold-divider" />
        <h3 className="font-serif text-sm sm:text-base tracking-[0.4em] gold-text whitespace-nowrap">
          Testimonials
        </h3>
        <div className="flex-1 gold-divider" />
      </div>

      <p className="text-center section-eyebrow">Social Proof</p>
      <h2 className="mt-3 text-center font-serif text-3xl sm:text-5xl text-foreground">
        Loved by our <span className="italic gold-text">regulars</span>.
      </h2>

      <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-6">
        {reviews.map((r, i) => (
          <ReviewCard key={`${r.name}-${i}`} r={r} />
        ))}
      </div>

      {/* Leave a review form */}
      <div className="mt-16 max-w-2xl mx-auto bg-card border border-border rounded-md p-6 sm:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <p className="section-eyebrow text-center">Your Turn</p>
        <h3 className="mt-2 text-center font-serif text-2xl sm:text-3xl text-foreground">Leave a Review</h3>
        <div className="mt-4 mx-auto max-w-xs gold-divider" />

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Name / Instagram Handle
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="@yourhandle"
              maxLength={80}
              className="w-full bg-background border border-input rounded-sm h-11 px-3 text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Product Ordered
            </label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full bg-background border border-input rounded-sm h-11 px-3 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {PRODUCT_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Rating
            </label>
            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hoverRating || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    className="p-1 -m-1 transition-transform hover:scale-110"
                  >
                    <Star className={`h-7 w-7 ${active ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Your Review
            </label>
            <textarea
              required
              rows={3}
              maxLength={500}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us how it was…"
              className="w-full bg-background border border-input rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-sm btn-cta text-sm disabled:opacity-60"
          >
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" /> Submit Review</>}
          </button>
        </form>
      </div>

      {/* Behind the scenes video */}
      <div className="mt-20">
        <div className="flex items-center gap-6 mb-10">
          <div className="flex-1 gold-divider" />
          <h3 className="font-serif text-sm sm:text-base tracking-[0.4em] gold-text whitespace-nowrap">
            THE PROCESS
          </h3>
          <div className="flex-1 gold-divider" />
        </div>
        <h2 className="text-center font-serif text-2xl sm:text-4xl text-foreground">
          Behind the Scenes: <span className="italic gold-text">Engineering Mango.io</span>
        </h2>

        <div className="mt-10 mx-auto w-full max-w-[360px] sm:max-w-[400px]">
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-border bg-card"
            style={{ aspectRatio: "9 / 16", boxShadow: "var(--shadow-elegant)" }}
          >
            <iframe
              src="https://www.instagram.com/p/DZvNVlUuhVP/embed"
              title="Behind the Scenes: Engineering Mango.io"
              allow="encrypted-media"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 w-full h-full"
              scrolling="no"
              frameBorder="0"
            />
          </div>
          <p className="mt-4 text-center text-xs tracking-[0.25em] uppercase text-muted-foreground">
            @thecheesecakemehthod
          </p>
        </div>
      </div>
    </section>
  );
}