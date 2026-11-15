import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/store/product";
import { bySlug, products } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = bySlug((await params).slug);
  return p ? { title: p.name, description: p.blurb } : {};
}

export default async function ProductPage({ params }: Props) {
  const p = bySlug((await params).slug);
  if (!p) notFound();
  return (
    <>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 px-1 pb-4 pt-5 text-[12px] text-muted">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <ChevronRight size={12} />
        <Link href={`/shop?c=${p.category.toLowerCase()}`} className="hover:text-ink">
          {p.category}
        </Link>
        <ChevronRight size={12} />
        <span className="text-ink">{p.name}</span>
      </nav>
      <ProductView key={p.slug} p={p} />
    </>
  );
}
