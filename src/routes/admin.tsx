import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

const STATUSES = ["pending", "confirmed", "baking", "ready", "delivered"] as const;
type Status = (typeof STATUSES)[number];

type Product = {
  name: string | null;
};

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

const PIN = "1234";

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed") === "1") setAuthed(true);
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pin === PIN) {
              sessionStorage.setItem("admin_authed", "1");
              setAuthed(true);
            } else {
              setError("Incorrect PIN");
            }
          }}
          className="w-full max-w-sm border border-border bg-card p-8 rounded-sm space-y-4"
        >
          <h1 className="text-2xl font-serif text-primary">Kitchen Access</h1>
          <p className="text-sm text-muted-foreground">Enter PIN to continue.</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              if (error) setError("");
            }}
            autoFocus
            className="w-full bg-background border border-input rounded-sm h-11 px-3 text-foreground focus:outline-none focus:border-primary"
            placeholder="PIN"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            className="w-full h-11 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(`Failed to load orders: ${error.message}`);
    } else {
      setOrders((data as Order[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: Status) {
    const prev = orders;
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      setOrders(prev);
      toast.error(`Update failed: ${error.message}`);
    } else {
      toast.success("Status updated");
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="section-eyebrow">Kitchen</p>
          <h1 className="text-3xl font-serif text-primary">Dashboard</h1>
        </div>
        <button
          onClick={load}
          className="h-10 px-4 border border-border rounded-sm text-sm hover:bg-card"
        >
          Refresh
        </button>
      </header>

      {loading ? (
        <p className="text-muted-foreground">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {orders.map((o) => (
            <article
              key={o.id}
              className="border border-border bg-card rounded-sm p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-xl text-primary">
                    {o.customer_name || "—"}
                  </h2>
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
                      <span>{it.product_id || "Item"}</span>
                      <span className="text-muted-foreground">×{it.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Total: {o.total_amount ?? "—"}
                </span>
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
