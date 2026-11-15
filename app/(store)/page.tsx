import { Categories, Hero, Marquee } from "@/components/store/home";
import { FilterableGrid } from "@/components/store/product";
import { favourites } from "@/lib/products";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Categories />
      <div className="pt-24">
        <FilterableGrid items={favourites} eyebrow="Most loved" title="This week’s favourites" />
      </div>
    </>
  );
}
