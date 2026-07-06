import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Plus, Minus, X, Trash2, Calendar, MessageSquareHeart, Lock, User, Phone, Mail, Check, Loader2, Instagram, Linkedin, MapPin, Clock, MessageCircle } from "lucide-react";
const biscoffImg = { url: "/images/biscoff-override.jpg" };
const binaryCookieImg = { url: "/images/binary-cookie.jpg" };
const pistachioImg = { url: "/images/pistachio-tablet.jpg" };
const mangoImg = { url: "/images/mango-io.jpg" };
const strawberryImg = { url: "/images/strawberry-exe.jpg" };
const LOGO_URL = "/1782553124947.png";
import { supabase } from "@/lib/supabase";
import { ReviewsSection } from "@/components/reviews-section";

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

const LOCAL_PRICES: Record<string, { price: number; originalPrice: number }> = {
  "Binary Cookie": { price: 2499, originalPrice: 2600 },
  "Pistachio Table": { price: 2999, originalPrice: 3200 },
  "Biscoff Override": { price: 2850, originalPrice: 2950 },
  "Mango.io": { price: 2599, originalPrice: 2800 },
  "Strawberry.exe": { price: 2599, originalPrice: 2800 },
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
  const [custAddress, setCustAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [addressError, setAddressError] = useState("");

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
          const local = LOCAL_PRICES[r.name];
          return {
            id: String(r.id),
            name: r.name,
            description: r.description ?? "",
            price: local ? local.price : Number(r.price) || 0,
            originalPrice: local ? local.originalPrice : undefined,
            onSale: !!local,
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

    if (!custAddress.trim() || custAddress.trim().length < 10) {
      setAddressError("Please enter your complete delivery address (min 10 characters).");
      valid = false;
    } else {
      setAddressError("");
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
          delivery_address: custAddress.trim(),
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
      setCustAddress("");
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
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-20 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src={LOGO_URL}
              alt="The Cheesecake Method"
              className="h-10 w-10 sm:h-14 sm:w-14 rounded-full object-contain shrink-0 border border-primary/40 bg-card"
            />
            <div className="min-w-0">
              <p className="section-eyebrow hidden sm:block text-[10px] sm:text-xs">EST. KARACHI</p>
              <h1 className="font-serif text-sm sm:text-lg tracking-wide gold-text">
                The Cheesecake Method
              </h1>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center whitespace-nowrap h-7 sm:h-10 px-2 py-1.5 sm:px-5 sm:py-2 rounded-sm btn-cta text-[10px] sm:text-xs"
            >
              Order Now
            </button>
            <Link
              to="/information"
              className="hidden sm:inline-flex text-[10px] sm:text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              Info
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open cart"
              className="relative shrink-0 inline-flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border hover:border-primary transition-colors"
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
      <section
        className="relative bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1567327613485-fbc7bf196198?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-32 text-center">
          <p className="section-eyebrow hero-animate hero-delay-1" style={{ color: 'var(--gold-soft)' }}>A Study in Cheesecake</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-6xl md:text-7xl leading-[1.05] text-white hero-animate hero-delay-2">
            Baked with <span className="italic" style={{ color: 'var(--gold-soft)' }}>obsession.</span>
            <br />
            Served with method.
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-white/80 text-base sm:text-lg hero-animate hero-delay-3">
            Hand-crafted in small batches. Every cheesecake is a quiet ritual of cream, fire, and patience.
          </p>
          <div className="mt-10 mx-auto max-w-xs hero-animate hero-delay-4" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold-soft) 50%, transparent)' }} />
        </div>
      </section>

      {/* Menu */}
      <main id="menu" className="mx-auto max-w-7xl px-5 sm:px-8 pb-32">
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
                      <div className="flex flex-col gap-1">
                        <h4 className="font-serif text-2xl text-foreground">{p.name}</h4>
                        <div className="flex items-center gap-2">
                          {p.onSale && p.originalPrice ? (
                            <span className="text-xs text-muted-foreground line-through font-serif">
                              {fmtPKR(p.originalPrice)}
                            </span>
                          ) : null}
                          <span className="font-serif text-lg text-foreground font-bold whitespace-nowrap">
                            {fmtPKR(p.price)}
                          </span>
                          {p.onSale && (
                            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold px-2 py-0.5 rounded-sm bg-primary/15 text-primary border border-primary/40">
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
                        className="mt-6 w-full inline-flex items-center justify-center gap-2 h-12 rounded-sm btn-cta text-sm"
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

      <ReviewsSection />

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
                className="w-full h-14 inline-flex items-center justify-center gap-2 rounded-sm btn-cta text-sm"
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
          className="relative w-full max-w-md bg-card border border-border rounded-md overflow-hidden max-h-[85vh] flex flex-col"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-border shrink-0">
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

          <form onSubmit={submitOrder} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto flex-1 py-4 px-6 space-y-5">
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
                <MapPin className="h-3.5 w-3.5 gold-text" /> Delivery Address
              </label>
              <textarea
                required
                rows={3}
                value={custAddress}
                onChange={(e) => { setCustAddress(e.target.value); if (addressError) setAddressError(""); }}
                placeholder="Enter your complete address within Karachi."
                maxLength={400}
                className={`w-full bg-background border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none max-h-24 ${addressError ? "border-destructive" : "border-input"}`}
              />
              {addressError && <p className="mt-1.5 text-xs text-destructive">{addressError}</p>}
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

            <div className="rounded-md border border-primary/30 bg-secondary/60 p-3 space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 gold-text mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed text-foreground">
                  <span className="font-semibold">Delivery Area:</span> <span className="text-muted-foreground">Available across all of Karachi.</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 gold-text mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed text-foreground">
                  <span className="font-semibold">Fulfillment Time:</span> <span className="text-muted-foreground">Limited-batch, pre-order model. Orders are typically processed within 24–48 hours.</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="h-4 w-4 gold-text mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed text-foreground">
                  <span className="font-semibold">Next Steps:</span> <span className="text-muted-foreground">You'll receive a direct WhatsApp message from us to confirm your delivery time and exact location.</span>
                </p>
              </div>
            </div>
            </div>

            <div className="shrink-0 border-t border-border p-6 space-y-4 bg-card/95 backdrop-blur">
              <div className="flex justify-between items-baseline">
                <span className="font-serif text-lg text-foreground">Total</span>
                <span className="font-serif text-2xl gold-text">{fmtPKR(total)}</span>
              </div>

              {submitError && <p className="text-xs text-destructive">{submitError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 inline-flex items-center justify-center gap-2 rounded-sm btn-cta text-sm disabled:opacity-60"
                style={{ boxShadow: "var(--shadow-gold)" }}
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing…</> : <><Lock className="h-4 w-4" /> Place Order</>}
              </button>
            </div>
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
            className="mt-8 w-full h-12 inline-flex items-center justify-center rounded-sm btn-cta text-xs"
            style={{ boxShadow: "var(--shadow-gold)" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
