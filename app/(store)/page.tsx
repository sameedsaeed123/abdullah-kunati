import { Categories, Hero, Marquee } from "@/components/store/home";
import { FilterableGrid } from "@/components/store/product";
import { loadCatalog } from "@/lib/catalog";

export default async function HomePage() {
  const { products } = await loadCatalog();
  return (
    <>
      <Hero />
      <Marquee />
      <Categories />
      <div className="pt-24">
        <FilterableGrid items={products.slice(0, 8)} eyebrow="Most loved" title="This week’s favourites" />
      </div>
    </>
  );
}
