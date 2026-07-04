import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Kitchen Dashboard — The Cheesecake Method" },
      { name: "description", content: "Kitchen operations dashboard for managing orders." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-destructive">Error: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-8">Not found.</div>,
});

const STATUSES = ["pending", "confirmed", "baking", "ready", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

type Product = { name: string | null };

type OrderItem = {
  id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number | null;
  products: Product | null;
};

type Order = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  delivery_date: string | null;
  custom_message: string | null;
  total_amount: number | null;
  status: string | null;
  order_items: OrderItem[];
};

function formatPhoneForWhatsApp(phone: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  digits = digits.replace(/^0+/, "");
  if (!digits.startsWith("92")) {
    digits = "92" + digits;
  }
  return digits;
}

function buildWhatsAppUrl(
  name: string | null,
  phone: string | null,
  status: string | null
): string | null {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  if (!formattedPhone) return null;
  const displayStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Updated";
  const message = `Hello ${name || "there"}! Update from The Cheesecake Method: Your order is now ${displayStatus}! 🍰`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}


function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!session) return <LoginForm />;

  return <Dashboard session={session} />;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) setError(error.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-border bg-card p-8 rounded-sm space-y-4"
      >
        <h1 className="text-2xl font-serif text-primary">Kitchen Access</h1>
        <p className="text-sm text-muted-foreground">Sign in with your admin account.</p>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          className="w-full bg-background border border-input rounded-sm h-11 px-3 text-foreground focus:outline-none focus:border-primary"
          placeholder="Email"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-background border border-input rounded-sm h-11 px-3 text-foreground focus:outline-none focus:border-primary"
          placeholder="Password"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ session }: { session: Session }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(name))")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(`Failed to load orders: ${error.message}`);
    } else {
      const rows = ((data as Order[]) ?? []).slice().sort((a, b) => {
        const ac = a.status === "cancelled" ? 1 : 0;
        const bc = b.status === "cancelled" ? 1 : 0;
        if (ac !== bc) return ac - bc;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setOrders(rows);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: Status) {
    const prev = orders;
    setOrders((o) => {
      const updated = o.map((x) => (x.id === id ? { ...x, status } : x));
      return updated.slice().sort((a, b) => {
        const ac = a.status === "cancelled" ? 1 : 0;
        const bc = b.status === "cancelled" ? 1 : 0;
        if (ac !== bc) return ac - bc;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("id, status");
    if (error) {
      setOrders(prev);
      toast.error(`Update failed: ${error.message}`);
    } else if (!data || data.length === 0) {
      setOrders(prev);
      toast.error("Update blocked by RLS. Ensure your admin UPDATE policy is in place.");
    } else {
      toast.success(`Status saved: ${data[0].status}`);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="section-eyebrow">Kitchen</p>
          <h1 className="text-3xl font-serif text-primary">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">Signed in as {session.user.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="h-10 px-4 border border-border rounded-sm text-sm hover:bg-card"
          >
            Refresh
          </button>
          <button
            onClick={signOut}
            className="h-10 px-4 border border-border rounded-sm text-sm hover:bg-card"
          >
            Sign out
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-muted-foreground">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {orders.map((o) => {
            const isCancelled = o.status === "cancelled";
            const notifyUrl = buildWhatsAppUrl(o.customer_name, o.customer_phone, o.status);
            return (
            <article
              key={o.id}
              className={`border border-border bg-card rounded-sm p-5 space-y-4 transition-opacity ${isCancelled ? "opacity-50 line-through" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-xl text-primary">{o.customer_name || "—"}</h2>
                  <p className="text-sm text-muted-foreground">{o.customer_phone || "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    Deliver: {o.delivery_date || "—"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString()}
                </span>
              </div>

              {o.custom_message && (
                <div className="border-l-2 border-primary bg-primary/10 px-3 py-2 text-sm text-foreground">
                  <p className="text-xs uppercase tracking-wider text-primary mb-1">
                    Custom Message
                  </p>
                  {o.custom_message}
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Items
                </p>
                <ul className="space-y-1 text-sm">
                  {o.order_items?.map((it) => (
                    <li key={it.id} className="flex justify-between">
                      <span>{it.products?.name || "Unknown Product"}</span>
                      <span className="text-muted-foreground">×{it.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Total: {o.total_amount ?? "—"}
                </span>
                <div className="flex items-center gap-2">
                  {notifyUrl && (
                    <a
                      href={notifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-9 px-3 border border-border rounded-sm text-sm hover:bg-card transition-colors"
                    >
                      <MessageCircle className="size-4" />
                      Notify
                    </a>
                  )}
                  <select
                    value={(o.status as Status) || "pending"}
                    onChange={(e) => updateStatus(o.id, e.target.value as Status)}
                    className="bg-background border border-input rounded-sm h-9 px-2 text-sm focus:outline-none focus:border-primary"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
