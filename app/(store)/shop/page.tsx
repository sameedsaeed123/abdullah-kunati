import type { Metadata } from "next";
import { FilterableGrid } from "@/components/store/product";
import { loadCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop all" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ c?: string; s?: string }> }) {
  const { c, s } = await searchParams;
  const { products, categories } = await loadCatalog();
  const cat = categories.find((x) => x.slug === c);
  const sub = cat?.children.find((x) => x.slug === s);
  return (
    <div className="pt-6">
      <FilterableGrid
        headingAs="h1"
        items={products}
        initial={cat?.slug ?? "all"}
        initialSub={sub?.slug ?? ""}
        eyebrow={`${products.length} pieces`}
        title={sub?.name ?? cat?.name ?? "Shop all"}
      />
    </div>
  );
}
