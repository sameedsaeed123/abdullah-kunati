import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/store/product";
import { loadCatalog } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

const find = async (slug: string) => (await loadCatalog()).products.find((p) => p.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await find((await params).slug);
  return p ? { title: p.name, description: p.blurb } : {};
}

export default async function ProductPage({ params }: Props) {
  const p = await find((await params).slug);
  if (!p) notFound();
  return (
    <>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 px-1 pb-4 pt-5 text-[12px] text-muted">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <ChevronRight size={12} />
        <Link href={`/shop?c=${p.categorySlug}`} className="hover:text-ink">
          {p.category}
        </Link>
        <ChevronRight size={12} />
        <span className="text-ink">{p.name}</span>
      </nav>
      <ProductView key={p.slug} p={p} />
    </>
  );
}
