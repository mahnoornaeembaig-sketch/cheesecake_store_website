import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Plus, Minus, X, Trash2, Calendar, MessageSquareHeart, Lock, User, Phone, Mail, Check, Loader2, Instagram, Linkedin } from "lucide-react";
const biscoffImg = { url: "/images/biscoff-override.jpg" };
const binaryCookieImg = { url: "/images/binary-cookie.jpg" };
const pistachioImg = { url: "/images/pistachio-tablet.jpg" };
const mangoImg = { url: "/images/mango-io.jpg" };
const strawberryImg = { url: "/images/strawberry-exe.jpg" };
import logoAsset from "@/assets/cheesecake-logo.png.asset.json";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Cheesecake Method — Artisan Cheesecakes" },
      { name: "description", content: "Premium handcrafted cheesecakes. Biscoff, Pistachio Kunafa, Oreo, Mango, Strawberry. Order for delivery in PKR." },
    ],
  }),
  component: Storefront,
});

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  onSale?: boolean;
  image_url: string;
  category: "PREMIUM SERIES" | "SIGNATURE COLLECTION";
};

type CartItem = Product & {
  quantity: number;
  custom_message: string;
  delivery_date: string;
};

// Local images keyed by product name — always used, ignoring any Supabase image_url
const LOCAL_IMAGES: Record<string, string> = {
  "Biscoff Override": biscoffImg.url,
  "Binary Cookie": binaryCookieImg.url,
  "Pistachio Table": pistachioImg.url,
  "Mango.io": mangoImg.url,
  "Strawberry.exe": strawberryImg.url,
};

const DELIVERY_FEE = 350;


const fmtPKR = (n: number) =>
  "PKR " + n.toLocaleString("en-PK", { maximumFractionDigits: 0 });

function minDeliveryDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  // yyyy-MM-ddTHH:mm
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const [deliveryDate, setDeliveryDate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [dateError, setDateError] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const minDT = useMemo(minDeliveryDateTime, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, category");
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        setProducts([]);
      } else {
        const rows = (data ?? []).map((r: any) => {
          const isBinary = r.name === "Binary Cookie";
          return {
            id: String(r.id),
            name: r.name,
            description: r.description ?? "",
            price: isBinary ? 2499 : Number(r.price) || 0,
            originalPrice: isBinary ? 2500 : undefined,
            onSale: isBinary,
            image_url: LOCAL_IMAGES[r.name] || "",
            category: (r.category === "SIGNATURE COLLECTION" ? "SIGNATURE COLLECTION" : "PREMIUM SERIES") as Product["category"],
          };
        });
        setProducts(rows);
        setLoadError(null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);


  const addToCart = (p: Product) => {
    setCart((c) => {
      const found = c.find((i) => i.id === p.id);
      if (found) return c.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...c, { ...p, quantity: 1, custom_message: "", delivery_date: "" }];
    });
    setOpen(true);
  };
  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.id !== id));
  const updateQuantity = (id: string, q: number) =>
    setCart((c) => (q <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, quantity: q } : i))));
  const clearCart = () => setCart([]);

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = cart.length > 0 ? subtotal + DELIVERY_FEE : 0;

  const validateAndCheckout = () => {
    if (!deliveryDate) { setDateError("Please select a delivery / pickup date."); return; }
    if (new Date(deliveryDate).getTime() < Date.now() + 24 * 60 * 60 * 1000) {
      setDateError("We need at least 24 hours notice to craft your cake.");
      return;
    }
    setDateError("");
    setSubmitError("");
    setCheckoutOpen(true);
  };

  const pkPhoneRegex = /^(03\d{9}|\+923\d{9})$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateCheckout = () => {
    let valid = true;
    if (!custName.trim()) {
      setNameError("Customer name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    const phone = custPhone.trim();
    if (!phone) {
      setPhoneError("Phone number is required.");
      valid = false;
    } else if (!pkPhoneRegex.test(phone)) {
      setPhoneError("Please enter a valid Pakistani mobile number (e.g., 03XXXXXXXXX).");
      valid = false;
    } else {
      setPhoneError("");
    }

    const email = custEmail.trim();
    if (email && !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    return valid;
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckout()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_name: custName.trim(),
          customer_phone: custPhone.trim(),
          customer_email: custEmail.trim() || null,
          delivery_date: deliveryDate,
          custom_message: customMessage || null,
          total_amount: total,
        })
        .select("id")
        .single();
      if (orderErr || !order) throw new Error(orderErr?.message || "Failed to create order");

      const items = cart.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        quantity: i.quantity,
        unit_price: i.price,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(items);
      if (itemsErr) throw new Error(itemsErr.message);

      clearCart();
      setCheckoutOpen(false);
      setOpen(false);
      setDeliveryDate("");
      setCustomMessage("");
      setCustName("");
      setCustPhone("");
      setCustEmail("");
      setConfirmOpen(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: Array<Product["category"]> = ["PREMIUM SERIES", "SIGNATURE COLLECTION"];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src={logoAsset.url}
              alt="The Cheesecake Method"
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover shrink-0 border border-primary/40"
            />
            <div className="min-w-0 hidden xs:block sm:block">
              <p className="section-eyebrow hidden sm:block">Est. Karachi</p>
              <h1 className="truncate font-serif text-lg sm:text-2xl md:text-3xl tracking-wide gold-text">
                The Cheesecake Method
              </h1>
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/information"
              className="text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              Info
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open cart"
              className="relative shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-full border border-border hover:border-primary transition-colors"
            >
              <ShoppingBag className="h-5 w-5 gold-text" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-24 pb-12 text-center">
        <p className="section-eyebrow">A Study in Cheesecake</p>
        <h2 className="mt-4 font-serif text-4xl sm:text-6xl md:text-7xl leading-[1.05] text-foreground">
          Baked with <span className="italic gold-text">obsession.</span>
          <br />
          Served with method.
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-muted-foreground text-base sm:text-lg">
          Hand-crafted in small batches. Every cheesecake is a quiet ritual of cream, fire, and patience.
        </p>
        <div className="mt-10 mx-auto max-w-xs gold-divider" />
      </section>

      {/* Menu */}
      <main className="mx-auto max-w-7xl px-5 sm:px-8 pb-32">
        {loading && (
          <p className="text-center text-muted-foreground mt-16 text-sm tracking-[0.3em] uppercase">Loading menu…</p>
        )}
        {loadError && !loading && (
          <p className="text-center text-destructive mt-16 text-sm">Could not load menu: {loadError}</p>
        )}
        {!loading && !loadError && sections.map((section) => {
          const items = products.filter((p) => p.category === section);
          return (
            <section key={section} className="mt-16">
              <div className="flex items-center gap-6 mb-10">
                <div className="flex-1 gold-divider" />
                <h3 className="font-serif text-sm sm:text-base tracking-[0.4em] gold-text whitespace-nowrap">
                  {section}
                </h3>
                <div className="flex-1 gold-divider" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((p) => (
                  <article
                    key={p.id}
                    className="group bg-card border border-border rounded-md overflow-hidden flex flex-col transition-all hover:border-primary/60"
                    style={{ boxShadow: "var(--shadow-elegant)" }}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent pointer-events-none" />
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="section-eyebrow bg-background/60 backdrop-blur px-3 py-1 rounded-full border border-border">
                          {p.category.split(" ")[0]}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <h4 className="font-serif text-2xl text-foreground min-w-0 truncate">{p.name}</h4>
                        <div className="flex items-center gap-2 shrink-0">
                          {p.onSale && p.originalPrice ? (
                            <span className="text-xs text-muted-foreground line-through font-serif">
                              {fmtPKR(p.originalPrice)}
                            </span>
                          ) : null}
                          <span className="font-serif text-lg gold-text whitespace-nowrap">
                            {fmtPKR(p.price)}
                          </span>
                          {p.onSale && (
                            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold px-2 py-0.5 rounded-sm bg-destructive/15 text-destructive border border-destructive/40">
                              Sale
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                        {p.description}
                      </p>
                      <button
                        onClick={() => addToCart(p)}
                        className="mt-6 w-full inline-flex items-center justify-center gap-2 h-12 rounded-sm border border-primary/60 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm tracking-[0.25em] uppercase"
                      >
                        <Plus className="h-4 w-4" /> Add to Cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="" className="h-10 w-10 rounded-full object-cover border border-primary/40" />
            <p className="font-serif gold-text text-lg">The Cheesecake Method</p>
          </div>
          <div className="flex items-center gap-4">
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

      {/* Cart Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <aside
          className={`absolute right-0 top-0 h-full w-full sm:w-[480px] bg-card border-l border-border flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-border">
            <div>
              <p className="section-eyebrow">Your Selection</p>
              <h3 className="font-serif text-2xl gold-text">Cart</h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close cart"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:border-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16">
                <ShoppingBag className="h-10 w-10 gold-text" />
                <p className="mt-6 font-serif text-xl text-foreground">Your cart awaits</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a cheesecake from our collection to begin.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {cart.map((item) => (
                  <li key={item.id} className="p-6 flex gap-4">
                    <img src={item.image_url} alt={item.name} className="h-20 w-20 object-cover rounded-sm shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-lg text-foreground truncate">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove"
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{fmtPKR(item.price)} each</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-border rounded-sm">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease"
                            className="h-8 w-8 inline-flex items-center justify-center hover:bg-secondary"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase"
                            className="h-8 w-8 inline-flex items-center justify-center hover:bg-secondary"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-serif gold-text">{fmtPKR(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-border p-6 space-y-5 bg-background/40">
              <div>
                <label className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                  <Calendar className="h-3.5 w-3.5 gold-text" /> Delivery / Pickup
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minDT}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-background border border-input rounded-sm h-11 px-3 text-sm text-foreground focus:outline-none focus:border-primary"
                />
                {dateError ? (
                  <p className="mt-1 text-xs text-destructive">{dateError}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-muted-foreground">Minimum 24–48 hours notice required.</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                  <MessageSquareHeart className="h-3.5 w-3.5 gold-text" /> Custom Message (optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={120}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Happy Birthday, Amal"
                  className="w-full bg-background border border-input rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span><span>{fmtPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery</span><span>{fmtPKR(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="font-serif text-lg text-foreground">Total</span>
                  <span className="font-serif text-2xl gold-text">{fmtPKR(total)}</span>
                </div>
              </div>

              <button
                onClick={validateAndCheckout}
                className="w-full h-14 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-sm text-sm tracking-[0.3em] uppercase font-medium hover:opacity-90 transition-opacity"
                style={{ boxShadow: "var(--shadow-gold)" }}
              >
                <Lock className="h-4 w-4" /> Proceed to Secure Checkout
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Checkout Modal */}
      <div
        className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity ${checkoutOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!checkoutOpen}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setCheckoutOpen(false)} />
        <div
          className="relative w-full max-w-md bg-card border border-border rounded-md overflow-hidden"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-border">
            <div>
              <p className="section-eyebrow">Final Step</p>
              <h3 className="font-serif text-2xl gold-text">Checkout</h3>
            </div>
            <button
              type="button"
              onClick={() => !submitting && setCheckoutOpen(false)}
              aria-label="Close checkout"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border hover:border-primary disabled:opacity-50"
              disabled={submitting}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={submitOrder} className="p-6 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                <User className="h-3.5 w-3.5 gold-text" /> Full Name
              </label>
              <input
                type="text"
                required
                value={custName}
                onChange={(e) => { setCustName(e.target.value); if (nameError) setNameError(""); }}
                maxLength={80}
                className={`w-full bg-background border rounded-sm h-11 px-3 text-sm text-foreground focus:outline-none focus:border-primary ${nameError ? "border-destructive" : "border-input"}`}
              />
              {nameError && <p className="mt-1.5 text-xs text-destructive">{nameError}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                <Phone className="h-3.5 w-3.5 gold-text" /> Phone Number
              </label>
              <input
                type="tel"
                required
                value={custPhone}
                onChange={(e) => { setCustPhone(e.target.value); if (phoneError) setPhoneError(""); }}
                placeholder="03XX-XXXXXXX"
                maxLength={30}
                className={`w-full bg-background border rounded-sm h-11 px-3 text-sm text-foreground focus:outline-none focus:border-primary ${phoneError ? "border-destructive" : "border-input"}`}
              />
              {phoneError ? (
                <p className="mt-1.5 text-xs text-destructive">{phoneError}</p>
              ) : (
                <p className="mt-1 text-[11px] text-muted-foreground">We'll reach out on WhatsApp to confirm.</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                <Mail className="h-3.5 w-3.5 gold-text" /> Email <span className="opacity-60 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={custEmail}
                onChange={(e) => { setCustEmail(e.target.value); if (emailError) setEmailError(""); }}
                maxLength={120}
                className={`w-full bg-background border rounded-sm h-11 px-3 text-sm text-foreground focus:outline-none focus:border-primary ${emailError ? "border-destructive" : "border-input"}`}
              />
              {emailError && <p className="mt-1.5 text-xs text-destructive">{emailError}</p>}
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-border">
              <span className="font-serif text-lg text-foreground">Total</span>
              <span className="font-serif text-2xl gold-text">{fmtPKR(total)}</span>
            </div>

            {submitError && <p className="text-xs text-destructive">{submitError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-sm text-sm tracking-[0.3em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ boxShadow: "var(--shadow-gold)" }}
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing…</> : <><Lock className="h-4 w-4" /> Place Order</>}
            </button>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-opacity ${confirmOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!confirmOpen}
      >
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setConfirmOpen(false)} />
        <div
          className="relative w-full max-w-md bg-card border border-border rounded-md p-10 text-center"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="mx-auto h-16 w-16 rounded-full border border-primary/60 inline-flex items-center justify-center">
            <Check className="h-7 w-7 gold-text" />
          </div>
          <p className="section-eyebrow mt-6">Thank You</p>
          <h3 className="font-serif text-3xl gold-text mt-3">Order placed!</h3>
          <div className="mt-4 mx-auto max-w-xs gold-divider" />
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
            We will reach out on WhatsApp to confirm your delivery details shortly.
          </p>
          <button
            onClick={() => setConfirmOpen(false)}
            className="mt-8 w-full h-12 inline-flex items-center justify-center bg-primary text-primary-foreground rounded-sm text-xs tracking-[0.3em] uppercase font-medium hover:opacity-90 transition-opacity"
            style={{ boxShadow: "var(--shadow-gold)" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
