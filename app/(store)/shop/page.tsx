import type { Metadata } from "next";
import { FilterableGrid } from "@/components/store/product";
import { navCategories, products, type Category } from "@/lib/products";

export const metadata: Metadata = { title: "Shop all" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const match = (["Tables", ...navCategories] as Category[]).find((n) => n.toLowerCase() === c?.toLowerCase());
  const items = match === "Tables" ? products.filter((p) => p.category === "Tables") : products;
  return (
    <div className="pt-6">
      <FilterableGrid
        headingAs="h1"
        items={items}
        initial={match && match !== "Tables" ? match : "All"}
        eyebrow={`${products.length} pieces`}
        title={match === "Tables" ? "Tables" : "Shop all"}
      />
    </div>
  );
}
