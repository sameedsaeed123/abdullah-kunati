import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify, tones } from "@/lib/products";

type B = Record<string, unknown>;
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x, 160)).filter(Boolean).slice(0, 12) : []);
const bad = (error: string, status = 400) => Response.json({ error }, { status });

async function freeSlug(table: "products" | "categories", name: string) {
  const sql = db();
  const base = slugify(name);
  for (let i = 0; i < 50; i++) {
    const slug = i ? `${base}-${i + 1}` : base;
    const hit = table === "products" ? await sql`select 1 from products where slug = ${slug}` : await sql`select 1 from categories where slug = ${slug}`;
    if (hit.length === 0) return slug;
  }
  return `${base}-${Date.now()}`;
}

export async function GET() {
  if (!(await isAdmin())) return bad("Unauthorized", 401);
  return Response.json(await db()`select id, name, email, phone, message, created_at from messages order by created_at desc limit 200`);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return bad("Unauthorized", 401);
  const b = (await req.json().catch(() => ({}))) as B;
  const sql = db();

  switch (b.action) {
    case "saveProduct": {
      const name = str(b.name, 120);
      const category = str(b.categorySlug, 80);
      const price = Number(b.price);
      const image = str(b.image, 300);
      if (!name || !category || !(price >= 0) || !image) return bad("Name, category, price and picture are required.");
      if ((await sql`select 1 from categories where slug = ${category} and parent_id is null`).length === 0) return bad("Unknown category.");
      const f = {
        subcategory: str(b.subcategory, 80) || null,
        tone: tones.includes(b.tone as never) ? (b.tone as string) : "sage",
        badge: str(b.badge, 24) || null,
        w: Math.max(1, Math.round(Number(b.w) || 800)),
        h: Math.max(1, Math.round(Number(b.h) || 800)),
        fit: Math.min(0.95, Math.max(0.4, Number(b.fit) || 0.76)),
        blend: !!b.blend,
        blurb: str(b.blurb, 600),
        finishes: JSON.stringify(
          (Array.isArray(b.finishes) ? (b.finishes as B[]) : [])
            .map((x) => ({ name: str(x.name, 40), color: /^#[0-9a-f]{6}$/i.test(str(x.color)) ? str(x.color) : "#e9e4d8" }))
            .filter((x) => x.name)
            .slice(0, 6),
        ),
        details: JSON.stringify(list(b.details)),
        dimensions: JSON.stringify(list(b.dimensions)),
        care: JSON.stringify(list(b.care)),
      };
      if (b.id) {
        await sql`update products set name=${name}, category=${category}, subcategory=${f.subcategory}, price=${price}, tone=${f.tone}, badge=${f.badge},
          image=${image}, w=${f.w}, h=${f.h}, fit=${f.fit}, blend=${f.blend}, blurb=${f.blurb}, finishes=${f.finishes}::jsonb, details=${f.details}::jsonb,
          dimensions=${f.dimensions}::jsonb, care=${f.care}::jsonb where id=${Number(b.id)}`;
      } else {
        const slug = await freeSlug("products", name);
        await sql`insert into products (slug, name, category, subcategory, price, tone, badge, image, w, h, fit, blend, blurb, finishes, details, dimensions, care, sort)
          values (${slug}, ${name}, ${category}, ${f.subcategory}, ${price}, ${f.tone}, ${f.badge}, ${image}, ${f.w}, ${f.h}, ${f.fit}, ${f.blend}, ${f.blurb},
                  ${f.finishes}::jsonb, ${f.details}::jsonb, ${f.dimensions}::jsonb, ${f.care}::jsonb, (select coalesce(max(sort), 0) + 1 from products))`;
      }
      return Response.json({ ok: true });
    }
    case "deleteProduct":
      await sql`delete from products where id = ${Number(b.id)}`;
      return Response.json({ ok: true });
    case "saveCategory": {
      const name = str(b.name, 60);
      if (!name) return bad("Give the category a name.");
      const tone = tones.includes(b.tone as never) ? (b.tone as string) : "sage";
      if (b.id) {
        await sql`update categories set name=${name}, description=${str(b.description, 160)}, tone=${tone}, in_nav=${b.inNav !== false} where id=${Number(b.id)}`;
      } else {
        const slug = await freeSlug("categories", name);
        await sql`insert into categories (slug, name, parent_id, description, tone, in_nav, sort)
          values (${slug}, ${name}, ${b.parentId ? Number(b.parentId) : null}, ${str(b.description, 160)}, ${tone}, ${b.inNav !== false},
                  (select coalesce(max(sort), 0) + 1 from categories))`;
      }
      return Response.json({ ok: true });
    }
    case "deleteCategory": {
      const rows = await sql`select slug, parent_id from categories where id = ${Number(b.id)}`;
      const c = rows[0];
      if (!c) return Response.json({ ok: true });
      if (c.parent_id == null) {
        if ((await sql`select 1 from products where category = ${c.slug} limit 1`).length) return bad("Move or delete this category's products first.", 409);
      } else {
        await sql`update products set subcategory = null where subcategory = ${c.slug}`;
      }
      await sql`delete from categories where id = ${Number(b.id)}`;
      return Response.json({ ok: true });
    }
    case "saveSettings": {
      if (b.key !== "hero" && b.key !== "contact") return bad("Unknown setting.");
      if (!b.value || typeof b.value !== "object" || JSON.stringify(b.value).length > 20_000) return bad("Invalid value.");
      await sql`insert into settings (key, value) values (${b.key}, ${JSON.stringify(b.value)}::jsonb) on conflict (key) do update set value = excluded.value`;
      return Response.json({ ok: true });
    }
    default:
      return bad("Unknown action.");
  }
}
