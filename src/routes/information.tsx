import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

const LOGO_URL = "/1782553124947.png";

export const Route = createFileRoute("/information")({
  head: () => ({
    meta: [
      { title: "Information — The Cheesecake Method" },
      { name: "description", content: "Engineering a premium cloud kitchen in Karachi — the story, the menu logic, and the systems thinking behind The Cheesecake Method." },
      { property: "og:title", content: "Information — The Cheesecake Method" },
      { property: "og:description", content: "Engineering a premium cloud kitchen in Karachi — the story, the menu logic, and the systems thinking behind The Cheesecake Method." },
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
            <img src={LOGO_URL} alt="The Cheesecake Method" className="h-12 w-12 rounded-full object-contain shrink-0 border border-primary/40 bg-card" />
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

      <main className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-primary transition-colors mb-10">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Menu
        </Link>

        <p className="section-eyebrow">About</p>
        <h2 className="mt-4 font-serif text-3xl sm:text-5xl leading-[1.1] text-foreground">
          Applying systems logic and product engineering to scale a premium{" "}
          <span className="italic gold-text">cloud kitchen</span> venture.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground italic">
          Breaking production bugs, not cheesecakes.
        </p>

        <div className="mt-10 mx-auto max-w-xs gold-divider" />

        <section className="mt-14 space-y-8 text-foreground/90 leading-relaxed text-[15px] sm:text-base">
          <p>
            When scaling an idea from paper to a functional business model, consistency is everything.
            Over the last few weeks, I've been treating my kitchen like a development server — running
            tests, isolating production errors (like surface cracking and moisture imbalances), and
            optimizing ingredient variables to design a structurally flawless physical product. Today,
            the official <em>The Cheesecake Method</em> menu schema is officially live for the Karachi
            market. We didn't just design a standard flavor profile; we engineered distinct product
            lines to match precise parameters:
          </p>

          <ul className="space-y-3 pl-5 list-disc marker:text-[color:var(--gold-deep)]">
            <li>
              <strong className="gold-text font-serif text-lg">The Premium Series:</strong>{" "}
              High-complexity builds featuring rich structural profiles like our{" "}
              <em>Pistachio Table</em> (loaded with golden shredded pastry) and the caramel-driven{" "}
              <em>Biscoff Override</em>.
            </li>
            <li>
              <strong className="gold-text font-serif text-lg">The Signature Collection:</strong>{" "}
              Optimized for high-frequency runtime performance, utilizing premium fresh assets like{" "}
              <em>Mango.io</em> and <em>Strawberry.exe</em>.
            </li>
          </ul>

          <h3 className="font-serif text-2xl sm:text-3xl gold-text pt-6">
            💼 Operational Takeaways
          </h3>

          <ul className="space-y-3 pl-5 list-disc marker:text-[color:var(--gold-deep)]">
            <li>
              <strong>Inventory Logic:</strong> Managing localized sourcing pipelines across Karachi
              to maintain quality stability while keeping material overhead optimized.
            </li>
            <li>
              <strong>Agile Iterations:</strong> Scaling our operation through a limited-batch,
              pre-order strategy to ensure demand matches production capacity precisely.
            </li>
          </ul>

          <p>
            To my professional network, peers, and fellow entrepreneurs: the product is fully
            deployed, and our backend ordering pipelines are officially active. Every bite tells a
            story of creativity, taste, and challenge. 🛠️🍰
          </p>

          <div className="mx-auto max-w-xs gold-divider my-10" />

          <p>
            When people think of software engineering or computer science, they think of clean
            interfaces, logical frameworks, and automated systems. They rarely think of baking. But
            when I launched <em>The Cheesecake Method</em>, I realized that building a premium,
            physical product requires the exact same foundational mindset as deploying
            high-performance software:
          </p>

          <ul className="space-y-3 pl-5 list-disc marker:text-[color:var(--gold-deep)]">
            <li>
              <strong>The Architecture:</strong> It starts with a vision. Balancing structural
              integrity (preventing cracks/sinking) with precise ingredient parameters.
            </li>
            <li>
              <strong>The Debugging Phase:</strong> My kitchen essentially became a lab. Every
              failed batch was just an unhandled exception or a bug in the recipe logic that needed
              to be isolated and refactored.
            </li>
            <li>
              <strong>The Output:</strong> Achieving a product that compiles perfectly every single
              time, maintaining absolute consistency for the end consumer.
            </li>
          </ul>

          <p>
            This graphic represents more than just a slice of cheesecake. It represents the hours
            spent balancing late night academic deadlines with early morning kitchen operations,
            the beautiful, chaotic "challenge" of turning an entrepreneurial concept into a
            functional, scaling reality here in Karachi.
          </p>

          <p>
            To my fellow students, builders, and founders on here: don't restrict your analytical
            skill sets to just your primary field. Apply that same logical rigor to your passions
            outside the classroom. You'd be surprised at what you can build.
          </p>
        </section>
      </main>
    </div>
  );
}
