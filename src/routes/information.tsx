import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Instagram, Linkedin, Mail } from "lucide-react";

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

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="" className="h-10 w-10 rounded-full object-contain border border-primary/40 bg-card" />
            <p className="font-serif gold-text text-lg">The Cheesecake Method</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/923002281755"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>0300-2281755</span>
            </a>
            <div className="w-px h-4 bg-border" />
            <a
              href="https://www.instagram.com/thecheesecakemehthod/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/the-cheesecake-mehthod/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="mailto:cheesecakemethod@gmail.com"
              aria-label="Email"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Crafted slowly · Delivered fresh
          </p>
        </div>
      </footer>
    </div>
  );
}
