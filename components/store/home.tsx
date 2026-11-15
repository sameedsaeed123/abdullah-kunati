"use client";

import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, ImagePlus, Leaf, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useCatalog } from "@/components/catalog";
import { EASE, MaskText, Reveal, Spinner } from "@/components/ui";
import { ProductObject } from "@/components/store/product";
import { uploadImage } from "@/lib/admin-client";
import { money } from "@/lib/format";
import { bySlug, inCategory, toneBg, type HeroContent, type Pic } from "@/lib/products";
import { addToBag } from "@/lib/store";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE, delay },
});

type Edit = (patch: Partial<HeroContent>) => void;

/** Text that the admin can click and type into when the hero is shown in the site editor. */
function T({ value, field, edit }: { value: string; field: keyof HeroContent; edit?: Edit }) {
  if (!edit) return <>{value}</>;
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={`Edit ${field}`}
      spellCheck={false}
      onBlur={(e) => edit({ [field]: (e.currentTarget.textContent ?? "").trim() })}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className="cursor-text rounded-[6px] outline-dashed outline-1 outline-offset-[3px] outline-indigo/45 transition-[outline-color] hover:outline-indigo focus:bg-indigo/5 focus:outline-2 focus:outline-indigo"
    >
      {value}
    </span>
  );
}

/** "Change picture" control shown over an image in the editor. */
function PicButton({ onPick, className = "" }: { onPick: (p: Pic) => void; className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className={`z-20 ${className}`}>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setError("");
          try {
            onPick(await uploadImage(file));
          } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed.");
          } finally {
            setBusy(false);
          }
        }}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="flex h-9 items-center gap-2 rounded-full bg-ink px-3.5 text-[12px] font-medium text-card shadow-float transition hover:-translate-y-0.5"
      >
        {busy ? <Spinner size={12} /> : <ImagePlus size={14} />} Change picture
      </button>
      {error && (
        <p role="alert" className="mt-1.5 max-w-[200px] rounded-lg bg-card px-2 py-1 text-[11px] text-[#b3402f]">
          {error}
        </p>
      )}
    </div>
  );
}

/** A link on the live site; inert text in the editor so clicks edit instead of navigating. */
function Go({ href, edit, className, children }: { href: string; edit?: Edit; className?: string; children: React.ReactNode }) {
  return edit ? (
    <span className={className}>{children}</span>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

export function Hero({ content, edit }: { content?: HeroContent; edit?: Edit }) {
  const { settings, products } = useCatalog();
  const c = content ?? settings.hero;
  const hero = bySlug(c.featuredSlug) ?? products[0];
  const imgRef = useRef<HTMLImageElement>(null);
  const side = c.card1Image ?? (bySlug("moln-pendant") ? { src: bySlug("moln-pendant")!.image, w: bySlug("moln-pendant")!.w, h: bySlug("moln-pendant")!.h } : null);
  const shown = hero && c.featuredImage ? { ...hero, image: c.featuredImage.src, w: c.featuredImage.w, h: c.featuredImage.h, blend: c.featuredImage.blend } : hero;

  return (
    <section className={`grid gap-3.5 lg:grid-cols-[1.41fr_1fr] ${edit ? "lg:min-h-[640px]" : "lg:min-h-[max(600px,calc(100svh-92px))]"}`}>
      <div className="grid gap-3.5 lg:grid-rows-[1fr_200px]">
        {/* headline card */}
        <div className="card flex min-h-[400px] flex-col justify-between gap-10 p-6 sm:p-8">
          <motion.p {...fade(0.05)} className="inline-flex w-fit items-center gap-2 rounded-full bg-field px-3 py-1.5 text-[12px]">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-indigo/60" />
              <span className="relative size-1.5 rounded-full bg-indigo" />
            </span>
            <T value={c.chip} field="chip" edit={edit} />
          </motion.p>

          <div>
            {edit ? (
              <h1 className="display text-[clamp(40px,6.7vw,104px)]">
                <span className="block">
                  <T value={c.line1} field="line1" edit={edit} />
                </span>
                <span className="block">
                  <T value={c.line2} field="line2" edit={edit} />
                </span>
              </h1>
            ) : (
              <MaskText as="h1" lines={[c.line1, c.line2].filter(Boolean)} delay={0.1} className="display text-[clamp(40px,6.7vw,104px)]" />
            )}
            <motion.p {...fade(0.55)} className="mt-7 max-w-[350px] text-[14px] leading-[1.45] text-ink/70">
              <T value={c.text} field="text" edit={edit} />
            </motion.p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
              <motion.div {...fade(0.65)} className="flex flex-wrap items-center gap-2.5">
                <Go href={c.cta1Href} edit={edit} className="btn-ink group h-[38px] px-5 text-[13px]">
                  <T value={c.cta1} field="cta1" edit={edit} />
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Go>
                {(c.cta2 || edit) && (
                  <Go href={c.cta2Href} edit={edit} className="btn-ghost h-[38px] px-5 text-[13px]">
                    <T value={c.cta2} field="cta2" edit={edit} />
                  </Go>
                )}
              </motion.div>
              {(c.ratingTitle || edit) && (
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {[
                      ["AL", "#e6cdb8"],
                      ["MO", "#c9b7a2"],
                      ["SK", "#e9d3c7"],
                    ].map(([t, col], i) => (
                      <motion.span
                        key={t}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.85 + i * 0.09 }}
                        className="grid size-9 place-items-center rounded-full text-[10px] font-semibold text-ink/70 ring-2 ring-card"
                        style={{ background: col }}
                      >
                        {t}
                      </motion.span>
                    ))}
                  </div>
                  <motion.div {...fade(0.8)} className="leading-tight">
                    <p className="flex items-center gap-1 text-[12px] font-medium">
                      <Star size={11} className="fill-ink" /> <T value={c.ratingTitle} field="ratingTitle" edit={edit} />
                    </p>
                    <p className="text-[11px] text-muted">
                      <T value={c.ratingText} field="ratingText" edit={edit} />
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-[1.34fr_1fr]">
          {/* side card */}
          <Go href={c.card1Href} edit={edit} className="group relative block min-h-[200px] overflow-hidden rounded-[28px] bg-butter p-5">
            <p className="eyebrow relative z-10">
              <T value={c.card1Eyebrow} field="card1Eyebrow" edit={edit} />
            </p>
            {side && (
              <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: EASE, delay: 0.25 }}
                className={`absolute right-[10%] origin-top transition-transform duration-700 ease-out-soft group-hover:rotate-[2.5deg] ${c.card1Image ? "bottom-3 top-3" : "bottom-5 top-0"}`}
              >
                <Image
                  src={side.src}
                  alt=""
                  width={side.w}
                  height={side.h}
                  sizes="220px"
                  unoptimized={side.src.startsWith("/api/")}
                  className={`h-full w-auto max-w-[200px] object-contain ${c.card1Image ? "object-center" : "object-top"} ${c.card1Image?.blend ? "mix-blend-multiply" : ""}`}
                />
              </motion.div>
            )}
            {edit && <PicButton className="absolute right-3 top-3" onPick={(p) => edit({ card1Image: p })} />}
            <div className="absolute bottom-5 left-5 z-10">
              <p className="display text-[23px]">
                <T value={c.card1Title} field="card1Title" edit={edit} />
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-[12px] text-ink/70">
                <T value={c.card1Sub} field="card1Sub" edit={edit} />
                <ArrowUpRight size={12} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </p>
            </div>
          </Go>

          {/* info card */}
          <div className="card relative min-h-[200px] overflow-hidden p-5">
            <p className="eyebrow">
              <T value={c.card2Eyebrow} field="card2Eyebrow" edit={edit} />
            </p>
            <p className="display mt-9 text-[23px]">
              <T value={c.card2Title} field="card2Title" edit={edit} />
            </p>
            <p className="mt-1.5 text-[12px] text-muted">
              <T value={c.card2Text} field="card2Text" edit={edit} />
            </p>
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
      <div className="group relative min-h-[480px] overflow-hidden rounded-[28px] bg-sage">
        <div className="absolute left-6 top-6 z-10 max-w-[60%]">
          <p className="eyebrow">
            <T value={c.featuredLabel} field="featuredLabel" edit={edit} />
          </p>
          {hero && (
            <Go href={`/product/${hero.slug}`} edit={edit} className="mt-2 block text-[19px] font-medium tracking-[-0.02em] hover:underline hover:underline-offset-4">
              {hero.name}
            </Go>
          )}
        </div>
        <SpinBadge text={c.badgeText} />
        {shown && (
          <motion.div
            key={shown.image}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
          >
            <ProductObject p={shown} imgRef={imgRef} priority fit={0.86} sizes="(min-width: 1024px) 40vw, 100vw" />
          </motion.div>
        )}
        {edit && <PicButton className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" onPick={(p) => edit({ featuredImage: p })} />}
        {hero && (
          <motion.div
            {...fade(0.5)}
            className="absolute inset-x-4 bottom-4 flex h-[52px] items-center justify-between rounded-full bg-card/70 pl-5 pr-1.5 backdrop-blur-md sm:inset-x-5 sm:bottom-5"
          >
            <span className="text-[15.5px] font-semibold tabular-nums">{money(hero.price)}</span>
            <div className="flex items-center gap-4">
              <Go href={`/product/${hero.slug}`} edit={edit} className="text-[12.5px] font-medium text-ink/85 hover:text-ink hover:underline hover:underline-offset-4">
                Details
              </Go>
              <button
                type="button"
                disabled={!!edit}
                onClick={() => addToBag({ slug: hero.slug, finish: hero.finishes[0]?.name, el: imgRef.current })}
                className="btn-ink h-10 px-5 text-[13px]"
              >
                Add to bag
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function SpinBadge({ text }: { text: string }) {
  if (!text) return null;
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
          <textPath href="#badge-arc">{text.slice(0, 30)}</textPath>
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
  const { categories } = useCatalog();
  const shown = categories.filter((c) => inCategory(c.slug).length > 0);
  if (shown.length === 0) return null;
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Categories</p>
          <MaskText onView lines={["Find your corner"]} className="display mt-2 text-[clamp(30px,3.4vw,44px)]" />
        </div>
        <Link href="/shop" className="group flex shrink-0 items-center gap-2 pb-1 text-[13px] text-ink/80 hover:text-ink">
          All products <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:auto-rows-[250px] lg:grid-cols-4">
        {shown.map((c, i) => {
          const items = inCategory(c.slug);
          const cover = items[0]!;
          const big = i === 0;
          return (
            <Reveal key={c.slug} delay={Math.min(i, 6) * 0.07} className={big ? "sm:col-span-2 lg:row-span-2" : ""}>
              <Link
                href={`/shop?c=${c.slug}`}
                className={`group relative block h-full overflow-hidden rounded-[24px] ${toneBg[c.tone]} ${big ? "min-h-[320px]" : "min-h-[220px]"}`}
              >
                <div className="absolute inset-x-5 top-5 z-10 flex items-start justify-between">
                  <div>
                    <p className={`font-medium tracking-[-0.02em] ${big ? "text-[24px]" : "text-[17px]"}`}>{c.name}</p>
                    <p className="mt-0.5 text-[12px] text-ink/60">
                      {items.length} {items.length === 1 ? "piece" : "pieces"}
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
