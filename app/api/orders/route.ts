import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { bySlug } from "@/lib/products";
import { site } from "@/lib/site";

type Body = { id?: string; customer?: string; city?: string; street?: string; delivery?: string; payment?: string; lines?: { slug: string; finish?: string; qty: number }[] };

/** Place an order. Prices are recomputed on the server; the client total is never trusted. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Body;
  const lines = (b.lines ?? []).filter((l) => bySlug(l.slug) && Number.isInteger(l.qty) && l.qty > 0 && l.qty < 100);
  if (!b.id || !/^[A-Z]{2}-\d{6}$/.test(b.id) || !b.customer?.trim() || !b.city?.trim() || !b.street?.trim() || lines.length === 0)
    return Response.json({ error: "Invalid order" }, { status: 400 });
  const subtotal = lines.reduce((t, l) => t + bySlug(l.slug)!.price * l.qty, 0);
  const items = lines.reduce((t, l) => t + l.qty, 0);
  const delivery = b.delivery === "express" ? "express" : "standard";
  const total = subtotal + (subtotal >= site.freeDeliveryOver ? 0 : site.standardShipping) + (delivery === "express" ? site.expressSurcharge : 0);
  await db()`insert into orders (id, customer, city, street, items, total, delivery, payment, lines)
    values (${b.id}, ${b.customer.trim().slice(0, 120)}, ${b.city.trim().slice(0, 80)}, ${b.street.trim().slice(0, 200)}, ${items}, ${total},
            ${delivery}, ${b.payment === "bank" ? "bank" : "cod"}, ${JSON.stringify(lines)}::jsonb)`;
  return Response.json({ id: b.id, total, items });
}

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db()`select id, customer, city, items, total, status, placed_at from orders order by placed_at desc limit 200`;
  return Response.json(rows.map((r) => ({ id: r.id, customer: r.customer, city: r.city, items: r.items, total: Number(r.total), status: r.status, placedAt: new Date(r.placed_at as string).getTime() })));
}
