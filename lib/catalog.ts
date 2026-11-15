import { cache } from "react";
import { db } from "./db";
import { defaultHero, emptyContact, fallbackCatalog, type Catalog, type CategoryNode, type Product, type Tone } from "./products";

type Row = Record<string, unknown>;

/** Everything the storefront needs, in one round of queries. */
export const loadCatalog = cache(async (): Promise<Catalog> => {
  try {
    const sql = db();
    const [cats, prods, sets] = await Promise.all([
      sql`select * from categories order by sort, id`,
      sql`select * from products order by sort, id`,
      sql`select key, value from settings`,
    ]);
    const top = (cats as Row[]).filter((c) => c.parent_id == null);
    const categories: CategoryNode[] = top.map((c) => ({
      id: c.id as number,
      slug: c.slug as string,
      name: c.name as string,
      description: c.description as string,
      tone: c.tone as Tone,
      inNav: c.in_nav as boolean,
      children: (cats as Row[])
        .filter((s) => s.parent_id === c.id)
        .map((s) => ({ id: s.id as number, slug: s.slug as string, name: s.name as string, description: s.description as string })),
    }));
    const catName = new Map(categories.map((c) => [c.slug, c.name]));
    const subName = new Map(categories.flatMap((c) => c.children.map((s) => [s.slug, s.name] as const)));
    const products: Product[] = (prods as Row[]).map((p) => ({
      id: p.id as number,
      slug: p.slug as string,
      name: p.name as string,
      category: catName.get(p.category as string) ?? "Uncategorised",
      categorySlug: p.category as string,
      subcategory: (p.subcategory as string) || null,
      subcategoryName: subName.get(p.subcategory as string) ?? null,
      price: Number(p.price),
      rating: Number(p.rating),
      reviews: p.reviews as number,
      tone: p.tone as Tone,
      badge: (p.badge as string) || null,
      image: p.image as string,
      w: p.w as number,
      h: p.h as number,
      fit: Number(p.fit),
      hang: p.hang as boolean,
      blend: p.blend as boolean,
      blurb: p.blurb as string,
      finishes: p.finishes as Product["finishes"],
      details: p.details as string[],
      dimensions: p.dimensions as string[],
      care: p.care as string[],
    }));
    const s = Object.fromEntries((sets as Row[]).map((r) => [r.key as string, r.value]));
    return {
      products,
      categories,
      settings: { hero: { ...defaultHero, ...(s.hero as object) }, contact: { ...emptyContact, ...(s.contact as object) } },
    };
  } catch (e) {
    console.error("Catalog load failed, using built-in fallback:", e);
    return fallbackCatalog;
  }
});
