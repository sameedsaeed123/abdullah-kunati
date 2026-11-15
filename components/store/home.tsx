"use client";

import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Leaf, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { CountUp, EASE, MaskText, Reveal } from "@/components/ui";
import { ProductObject } from "@/components/store/product";
import { money } from "@/lib/format";
import { byCategory, bySlug, categories, products, toneBg } from "@/lib/products";
import { site } from "@/lib/site";
import { addToBag } from "@/lib/store";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE, delay },
});

/* ---------------------------------- Hero ---------------------------------- */

export function Hero() {
  const hero = bySlug("bolle-lounge-chair")!;
  const pendant = bySlug("moln-pendant")!;
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <section className="grid gap-3.5 lg:h-[calc(100svh-92px)] lg:min-h-[600px] lg:grid-cols-[1.41fr_1fr]">
      <div className="grid gap-3.5 lg:grid-rows-[1fr_200px]">
        {/* headline card */}
        <div className="card flex min-h-[400px] flex-col justify-between p-7 sm:p-8">
          <motion.p {...fade(0.05)} className="inline-flex w-fit items-center gap-2 rounded-full bg-field px-3 py-1.5 text-[12px]">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-indigo/60" />
              <span className="relative size-1.5 rounded-full bg-indigo" />
            </span>
            New season · {products.length - 3} pieces just landed
          </motion.p>

          <div>
            <MaskText as="h1" lines={["Calm objects for", "slow homes."]} delay={0.1} className="display text-[clamp(44px,6.7vw,104px)]" />
            <motion.p {...fade(0.55)} className="mt-7 max-w-[350px] text-[14px] leading-[1.45] text-ink/70">
              Solid oak, wool and clay from small workshops. Pieces that get better the longer you live with them.
            </motion.p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
              <motion.div {...fade(0.65)} className="flex items-center gap-2.5">
                <Link href="/shop" className="btn-ink group h-[38px] px-5 text-[13px]">
                  Shop the edit <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
                <Link href="/shop?c=lighting" className="btn-ghost h-[38px] px-5 text-[13px]">
                  Explore lighting
                </Link>
              </motion.div>
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {[
                    ["AL", "#e6cdb8"],
                    ["MO", "#c9b7a2"],
                    ["SK", "#e9d3c7"],
                  ].map(([t, c], i) => (
                    <motion.span
                      key={t}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.85 + i * 0.09 }}
                      className="grid size-9 place-items-center rounded-full text-[10px] font-semibold text-ink/70 ring-2 ring-card"
                      style={{ background: c }}
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
                <motion.div {...fade(0.8)} className="leading-tight">
                  <p className="flex items-center gap-1 text-[12px] font-medium">
                    <Star size={11} className="fill-ink" /> 4.9 average
                  </p>
                  <p className="text-[11px] text-muted">from 2,184 homes</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-[1.34fr_1fr]">
          {/* lighting card */}
          <Link href="/shop?c=lighting" className="group relative block min-h-[200px] overflow-hidden rounded-[28px] bg-butter p-5">
            <p className="eyebrow">Lighting</p>
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: EASE, delay: 0.25 }}
              className="absolute right-[10%] top-0 h-[112%] origin-top transition-transform duration-700 ease-out-soft group-hover:rotate-[2.5deg]"
            >
              <Image src={pendant.image} alt="" width={pendant.w} height={pendant.h} sizes="220px" className="h-full w-auto object-contain object-top" />
            </motion.div>
            <div className="absolute bottom-5 left-5">
              <p className="display text-[23px]">Soft light</p>
              <p className="mt-1.5 flex items-center gap-1 text-[12px] text-ink/70">
                {byCategory("Lighting").length} pieces
                <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </p>
            </div>
          </Link>

          {/* delivery card */}
          <div className="card relative min-h-[200px] overflow-hidden p-5">
            <p className="eyebrow">Delivery</p>
            <p className="display mt-9 text-[23px]">
              Free over <CountUp value={site.freeDeliveryOver} from={site.freeDeliveryOver - 18} duration={1.2} />
            </p>
            <p className="mt-1.5 text-[12px] text-muted">Dispatched in 48h. 30-night trial.</p>
            <div className="absolute inset-x-5 bottom-[26px]">
              <div className="h-px w-full bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_3px,transparent_3px_7px)] opacity-25" />
              <motion.span
                aria-hidden
                className="absolute -top-[14px] left-0 grid size-7 place-items-center rounded-full bg-indigo text-white shadow-[0_6px_14px_-4px_rgba(61,68,208,0.7)]"
                animate={{ left: ["-12%", "104%"] }}
                transition={{ duration: 3.4, ease: [0.45, 0, 0.55, 1], repeat: Infinity, repeatDelay: 0.5 }}
              >
                <Truck size={13} />
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* featured product */}
      <div className="group relative min-h-[520px] overflow-hidden rounded-[28px] bg-sage">
        <div className="absolute left-6 top-6 z-10">
          <p className="eyebrow">{hero.badge}</p>
          <Link href={`/product/${hero.slug}`} className="mt-2 block text-[19px] font-medium tracking-[-0.02em] hover:underline hover:underline-offset-4">
            {hero.name}
          </Link>
        </div>
        <SpinBadge />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
        >
          <ProductObject p={hero} imgRef={imgRef} priority fit={0.86} sizes="(min-width: 1024px) 40vw, 100vw" />
        </motion.div>
        <motion.div
          {...fade(0.5)}
          className="absolute inset-x-5 bottom-5 flex h-[52px] items-center justify-between rounded-full bg-card/70 pl-5 pr-1.5 backdrop-blur-md"
        >
          <span className="text-[15.5px] font-semibold tabular-nums">{money(hero.price)}</span>
          <div className="flex items-center gap-4">
            <Link href={`/product/${hero.slug}`} className="text-[12.5px] font-medium text-ink/85 hover:text-ink hover:underline hover:underline-offset-4">
              Details
            </Link>
            <button
              type="button"
              onClick={() => addToBag({ slug: hero.slug, finish: hero.finishes[0]?.name, el: imgRef.current })}
              className="btn-ink h-10 px-5 text-[13px]"
            >
              Add to bag
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SpinBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -90, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.7 }}
      className="absolute right-6 top-6 z-10 grid size-[66px] place-items-center rounded-full bg-card/55 backdrop-blur-sm"
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow">
        <defs>
          <path id="badge-arc" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        <text className="fill-ink font-mono text-[9.5px] uppercase" style={{ letterSpacing: "0.3em" }}>
          <textPath href="#badge-arc">Solid oak · Wool bouclé ·</textPath>
        </text>
      </svg>
      <Leaf size={15} />
    </motion.div>
  );
}

/* --------------------------------- Marquee --------------------------------- */

const phrases = ["Hand-thrown clay", "Washed linen", "Made to last", "Dispatched in 48h", "Solid oak", "30-night trial"];

export function Marquee() {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {phrases.map((t) => (
        <span key={t} className="flex items-center">
          <span className="display px-5 text-[clamp(22px,2.4vw,30px)] !leading-none">{t}</span>
          <span className="size-1.5 rounded-full bg-indigo" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="-mx-3 overflow-hidden py-14 sm:-mx-4">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
}

/* -------------------------------- Categories -------------------------------- */

export function Categories() {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Categories</p>
          <MaskText onView lines={["Find your corner"]} className="display mt-2 text-[clamp(30px,3.4vw,44px)]" />
        </div>
        <Link href="/shop" className="group flex items-center gap-2 pb-1 text-[13px] text-ink/80 hover:text-ink">
          All products <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[250px_250px]">
        {categories.map((c, i) => {
          const cover = bySlug(c.cover)!;
          const big = i === 0;
          return (
            <Reveal key={c.name} delay={i * 0.07} className={big ? "sm:col-span-2 lg:row-span-2" : ""}>
              <Link
                href={`/shop?c=${c.name.toLowerCase()}`}
                className={`group relative block h-full overflow-hidden rounded-[24px] ${toneBg[c.tone]} ${big ? "min-h-[320px]" : "min-h-[220px]"}`}
              >
                <div className="absolute inset-x-5 top-5 z-10 flex items-start justify-between">
                  <div>
                    <p className={`font-medium tracking-[-0.02em] ${big ? "text-[24px]" : "text-[17px]"}`}>{c.name}</p>
                    <p className="mt-0.5 text-[12px] text-ink/60">
                      {byCategory(c.name).length} {byCategory(c.name).length === 1 ? "piece" : "pieces"}
                    </p>
                  </div>
                  <span className="grid size-8 place-items-center rounded-full bg-card/60 transition-all duration-300 ease-out-soft group-hover:bg-ink group-hover:text-card">
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:-rotate-45" />
                  </span>
                </div>
                <div className="absolute inset-0 top-[14%]">
                  <ProductObject p={cover} fit={big ? 0.72 : 0.6} sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} />
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
