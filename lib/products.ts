import { seedCategories, seedProducts, toneBg, type Tone } from "./seed";

export { toneBg };
export type { Tone };
export const tones: Tone[] = ["sage", "butter", "sky", "sand", "stone", "blush"];

export type Product = {
  id?: number;
  slug: string;
  name: string;
  /** category display name */
  category: string;
  categorySlug: string;
  subcategory?: string | null;
  subcategoryName?: string | null;
  price: number;
  rating: number;
  reviews: number;
  tone: Tone;
  badge?: string | null;
  image: string;
  w: number;
  h: number;
  fit: number;
  hang?: boolean;
  /** photo on a white background: blended into the tile instead of cut out */
  blend?: boolean;
  blurb: string;
  finishes: { name: string; color: string }[];
  details: string[];
  dimensions: string[];
  care: string[];
};

export type CategoryNode = {
  id: number;
  slug: string;
  name: string;
  description: string;
  tone: Tone;
  inNav: boolean;
  children: { id: number; slug: string; name: string; description: string }[];
};

export type Pic = { src: string; w: number; h: number; blend?: boolean };

export type HeroContent = {
  chip: string;
  line1: string;
  line2: string;
  text: string;
  cta1: string;
  cta1Href: string;
  cta2: string;
  cta2Href: string;
  ratingTitle: string;
  ratingText: string;
  featuredLabel: string;
  featuredSlug: string;
  featuredImage?: Pic | null;
  badgeText: string;
  card1Eyebrow: string;
  card1Title: string;
  card1Sub: string;
  card1Href: string;
  card1Image?: Pic | null;
  card2Eyebrow: string;
  card2Title: string;
  card2Text: string;
};

export type Contact = {
  address: string;
  phone: string;
  email: string;
  hours: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
};

export type Settings = { hero: HeroContent; contact: Contact };
export type Catalog = { products: Product[]; categories: CategoryNode[]; settings: Settings };

export const defaultHero: HeroContent = {
  chip: "New season · 9 pieces just landed",
  line1: "Calm objects for",
  line2: "slow homes.",
  text: "Solid oak, wool and clay from small workshops. Pieces that get better the longer you live with them.",
  cta1: "Shop the edit",
  cta1Href: "/shop",
  cta2: "Explore lighting",
  cta2Href: "/shop?c=lighting",
  ratingTitle: "4.9 average",
  ratingText: "from 2,184 homes",
  featuredLabel: "Bestseller",
  featuredSlug: "bolle-lounge-chair",
  featuredImage: null,
  badgeText: "Solid oak · Wool bouclé ·",
  card1Eyebrow: "Lighting",
  card1Title: "Soft light",
  card1Sub: "3 pieces",
  card1Href: "/shop?c=lighting",
  card1Image: null,
  card2Eyebrow: "Delivery",
  card2Title: "Free over $150",
  card2Text: "Dispatched in 48h. 30-night trial.",
};

export const emptyContact: Contact = { address: "", phone: "", email: "", hours: "", whatsapp: "", instagram: "", facebook: "", tiktok: "" };

const slugOf = (name: string) => name.toLowerCase();

/** Used only when the database cannot be reached. */
export const fallbackCatalog: Catalog = {
  products: seedProducts.map((p) => ({ ...p, categorySlug: slugOf(p.category) })),
  categories: seedCategories.map((c, i) => ({ id: -1 - i, slug: slugOf(c.name), name: c.name, description: "", tone: c.tone, inNav: c.name !== "Tables", children: [] })),
  settings: { hero: defaultHero, contact: emptyContact },
};

/* The live catalog. CatalogProvider fills this before anything below it renders. */
let current: Catalog = fallbackCatalog;
export const setCatalog = (c: Catalog) => {
  current = c;
};
export const catalog = () => current;
export const bySlug = (slug: string) => current.products.find((p) => p.slug === slug);
export const inCategory = (slug: string) => current.products.filter((p) => p.categorySlug === slug);
export const inSub = (slug: string) => current.products.filter((p) => p.subcategory === slug);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .slice(0, 60) || "item";
