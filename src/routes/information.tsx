import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import logoAsset from "@/assets/cheesecake-logo.png.asset.json";

export const Route = createFileRoute("/information")({
  head: () => ({
    meta: [
      { title: "Information — The Cheesecake Method" },
      { name: "description", content: "About The Cheesecake Method — our story, ordering, delivery and FAQs." },
      { property: "og:title", content: "Information — The Cheesecake Method" },
      { property: "og:description", content: "About The Cheesecake Method — our story, ordering, delivery and FAQs." },
    ],
  }),
  component: InformationPage,
});

function InformationPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src={logoAsset.url} alt="The Cheesecake Method" className="h-12 w-12 rounded-full object-cover shrink-0 border border-primary/40" />
            <div className="min-w-0">
              <p className="section-eyebrow hidden sm:block">Est. Karachi</p>
              <h1 className="truncate font-serif text-xl sm:text-2xl tracking-wide gold-text">
                The Cheesecake Method
              </h1>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-primary transition-colors hidden sm:inline">Menu</Link>
            <Link to="/information" className="text-xs tracking-[0.25em] uppercase gold-text">Information</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 sm:px-8 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-primary transition-colors mb-10">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Menu
        </Link>

        <p className="section-eyebrow">About</p>
        <h2 className="mt-4 font-serif text-4xl sm:text-6xl leading-[1.05] text-foreground">
          Our <span className="italic gold-text">Story.</span>
        </h2>

        <div className="mt-10 mx-auto max-w-xs gold-divider" />

        <section className="mt-16 space-y-6 text-muted-foreground leading-relaxed">
          <h3 className="font-serif text-2xl gold-text">Placeholder Heading</h3>
          <p>
            This is a placeholder paragraph. Replace this section with the business details, brand story,
            sourcing notes, and anything else worth telling. Keep the tone slow, considered, and warm.
          </p>
          <p>
            Add information about ordering windows, delivery zones across Karachi, custom cake requests,
            allergens, and care instructions here.
          </p>

          <h3 className="font-serif text-2xl gold-text mt-12">Contact</h3>
          <p>
            Replace with phone, WhatsApp, and address details. Add hours and any pickup notes the
            customer should know before placing an order.
          </p>
        </section>
      </main>
    </div>
  );
}
