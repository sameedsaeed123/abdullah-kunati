"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Check, Leaf, Plus, RotateCcw, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EASE, MaskText, Stepper } from "@/components/ui";
import { money } from "@/lib/format";
import { useCatalog } from "@/components/catalog";
import { toneBg, type Product } from "@/lib/products";
import { addToBag } from "@/lib/store";

/** The product cut-out floating over its soft ground shadow. Fills the nearest positioned parent. */
export function ProductObject({
  p,
  sizes,
  priority,
  imgRef,
  fit = p.fit,
  hover = true,
}: {
  p: Product;
  sizes: string;
  priority?: boolean;
  imgRef?: React.Ref<HTMLImageElement>;
  fit?: number;
  hover?: boolean;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span
        aria-hidden
        className={`absolute bottom-[11%] left-1/2 h-[5%] w-[46%] -translate-x-1/2 rounded-[50%] bg-ink/20 blur-[10px] transition-all duration-500 ease-out-soft ${hover ? "group-hover:w-[38%] group-hover:bg-ink/15" : ""}`}
      />
      <Image
        ref={imgRef}
        src={p.image}
        alt={p.name}
        width={p.w}
        height={p.h}
        sizes={sizes}
        priority={priority}
        unoptimized={p.image.startsWith("/api/")}
        className={`relative -translate-y-[3%] object-contain ${p.blend ? "mix-blend-multiply" : ""} transition-transform duration-500 ease-out-soft ${hover ? "group-hover:-translate-y-[6%] group-hover:scale-[1.03]" : ""}`}
        style={{ height: `${fit * 100}%`, width: "auto", maxWidth: `min(${fit * 100}%, ${Math.round(p.w * 1.25)}px)` }}
      />
    </div>
  );
}

export function Rating({ p, long = false }: { p: Product; long?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted" aria-label={`Rated ${p.rating} out of 5 from ${p.reviews} reviews`}>
      <Star size={long ? 13 : 11} className="fill-ink text-ink" />
      {long ? (
        <span className="text-[12.5px]">
          {p.rating} · {p.reviews} reviews
        </span>
      ) : (
        <span className="text-[11px]">
          {p.rating} <span className="text-faint">({p.reviews})</span>
        </span>
      )}
    </span>
  );
}

export function ProductCard({ p, priority }: { p: Product; priority?: boolean }) {
  const imgRef = useRef<HTMLImageElement>(null);
  return (
    <article className="group relative">
      <Link href={`/product/${p.slug}`} className="block rounded-[22px]">
        <div className={`relative aspect-[4/5] overflow-hidden rounded-[22px] ${toneBg[p.tone]}`}>
          {p.badge && (
            <span className="absolute left-3.5 top-3.5 z-10 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium shadow-[0_1px_2px_rgba(25,27,22,0.08)]">
              {p.badge}
            </span>
          )}
          <ProductObject p={p} imgRef={imgRef} priority={priority} sizes="(min-width: 1024px) 25vw, 50vw" />
        </div>
        <div className="flex items-start justify-between gap-3 px-1 pt-3.5">
          <div className="min-w-0">
            <p className="text-[11px] text-muted">{p.category}</p>
            <h3 className="mt-0.5 truncate text-[14.5px] font-medium tracking-[-0.01em]">{p.name}</h3>
            <div className="mt-1">
              <Rating p={p} />
            </div>
          </div>
          <span className="pt-[14px] text-[15.5px] font-semibold tabular-nums">{money(p.price)}</span>
        </div>
      </Link>
      {/* quick add sits over the tile, outside the link */}
      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/5]">
        <button
          type="button"
          aria-label={`Add ${p.name} to bag`}
          onClick={() => addToBag({ slug: p.slug, finish: p.finishes[0]?.name, el: imgRef.current })}
          className="pointer-events-auto absolute bottom-3.5 right-3.5 grid size-9 scale-50 place-items-center rounded-full bg-ink text-card opacity-0 shadow-float transition-all duration-300 ease-out-soft hover:scale-110 focus-visible:scale-100 focus-visible:opacity-100 active:scale-90 group-hover:scale-100 group-hover:opacity-100 [@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-100"
        >
          <Plus size={16} />
        </button>
      </div>
    </article>
  );
}

export function FilterPills({ value, onChange, id, options }: { value: string; onChange: (f: string) => void; id: string; options: { slug: string; name: string }[] }) {
  return (
    <LayoutGroup id={id}>
      <div role="tablist" aria-label="Filter" className="inline-flex max-w-full overflow-x-auto rounded-full bg-card p-1 shadow-card [scrollbar-width:none]">
        {options.map((o) => {
          const active = o.slug === value;
          return (
            <button
              key={o.slug}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onChange(o.slug)}
              className={`relative h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] transition-colors duration-300 ${active ? "text-card" : "text-ink/80 hover:text-ink"}`}
            >
              {active && <motion.span layoutId="pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{o.name}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export function FilterableGrid({
  items,
  eyebrow,
  title,
  initial = "all",
  initialSub = "",
  headingAs = "h2",
}: {
  items: Product[];
  eyebrow: string;
  title: string;
  initial?: string;
  initialSub?: string;
  headingAs?: "h1" | "h2";
}) {
  const { categories } = useCatalog();
  const [filter, setFilter] = useState(initial);
  const [sub, setSub] = useState(initialSub);
  useEffect(() => {
    setFilter(initial);
    setSub(initialSub);
  }, [initial, initialSub]);

  const options = [{ slug: "all", name: "All" }, ...categories.filter((c) => items.some((p) => p.categorySlug === c.slug)).map((c) => ({ slug: c.slug, name: c.name }))];
  const subs = categories.find((c) => c.slug === filter)?.children ?? [];
  const shown = items.filter((p) => (filter === "all" || p.categorySlug === filter) && (!sub || p.subcategory === sub));

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <MaskText as={headingAs} onView lines={[title]} className="display mt-2 text-[clamp(32px,4.1vw,54px)]" />
        </div>
        <FilterPills
          id={`filter-${title}`}
          value={filter}
          options={options}
          onChange={(f) => {
            setFilter(f);
            setSub("");
          }}
        />
      </div>
      <AnimatePresence initial={false}>
        {subs.length > 0 && (
          <motion.div
            key={filter}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pt-4">
              {[{ slug: "", name: "Everything" }, ...subs].map((x) => (
                <button
                  key={x.slug}
                  type="button"
                  aria-pressed={sub === x.slug}
                  onClick={() => setSub(x.slug)}
                  className={`h-8 rounded-full px-3.5 text-[12.5px] transition-colors ${sub === x.slug ? "bg-ink text-card" : "bg-field text-ink/80 hover:bg-line"}`}
                >
                  {x.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div layout className="mt-7 grid grid-cols-2 gap-x-3.5 gap-y-8 lg:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.45, ease: EASE, delay: i * 0.03 } }}
              exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)", transition: { duration: 0.22 } }}
              transition={{ layout: { type: "spring", stiffness: 300, damping: 32 } }}
            >
              <ProductCard p={p} priority={i < 4} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {shown.length === 0 && <p className="py-20 text-center text-[14px] text-muted">Nothing here right now — new pieces land every month.</p>}
    </section>
  );
}

/* ------------------------------ Product page ------------------------------ */

const tabs = ["Details", "Dimensions", "Care"] as const;

export function ProductView({ p }: { p: Product }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [finish, setFinish] = useState(p.finishes[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Details");
  const [view, setView] = useState<"Product" | "In the room">("Product");
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const add = () => {
    if (added) return;
    addToBag({ slug: p.slug, finish: finish || undefined, qty, el: imgRef.current });
    setAdded(true);
    timer.current = setTimeout(() => setAdded(false), 2400);
  };

  const list = tab === "Details" ? p.details : tab === "Dimensions" ? p.dimensions : p.care;
  const room = view === "In the room";

  return (
    <div className="grid items-start gap-3.5 lg:grid-cols-[1.42fr_1fr]">
      {/* gallery */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className={`group relative h-[62svh] min-h-[380px] overflow-hidden rounded-[28px] lg:sticky lg:top-[78px] lg:h-[calc(100svh-92px)] ${toneBg[p.tone]}`}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: room ? 1 : 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            background:
              "radial-gradient(120% 70% at 22% 0%, rgba(255,250,235,0.55), transparent 60%), linear-gradient(#cdc4b1 0 72%, #a89a84 72% 72.4%, #b9ab94 72.4% 100%)",
          }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: room ? "6%" : 0, opacity: 1, scale: room ? 0.82 : 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <ProductObject p={p} imgRef={imgRef} priority hover={false} sizes="(min-width: 1024px) 58vw, 100vw" />
        </motion.div>
        <LayoutGroup id="view">
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 rounded-full bg-card/90 p-1 shadow-card backdrop-blur">
            {(["Product", "In the room"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`relative h-7 whitespace-nowrap rounded-full px-3.5 text-[11.5px] font-medium transition-colors ${view === v ? "text-card" : "text-ink/75 hover:text-ink"}`}
              >
                {view === v && <motion.span layoutId="view-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">{v}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </motion.div>

      {/* buy box */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
        className="card p-7 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <p className="eyebrow">{p.category}</p>
          {p.badge && <span className="rounded-full bg-field px-2.5 py-1 text-[11px] font-medium">{p.badge}</span>}
        </div>
        <MaskText as="h1" lines={[p.name]} delay={0.15} className="display mt-4 text-[clamp(34px,3.75vw,50px)]" />

        <Stagger delay={0.35}>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums">{money(p.price)}</span>
            <Rating p={p} long />
          </div>
          <p className="mt-4 max-w-[440px] text-[14px] leading-[1.55] text-ink/75">{p.blurb}</p>

          <div className={p.finishes.length ? "mt-6" : "hidden"}>
            <p className="text-[12.5px]">
              <span className="font-medium">Finish</span> <span className="text-muted">· {finish}</span>
            </p>
            <div className="mt-3 flex items-center gap-2.5" role="radiogroup" aria-label="Finish">
              {p.finishes.map((f) => {
                const on = f.name === finish;
                return (
                  <motion.button
                    key={f.name}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={f.name}
                    onClick={() => setFinish(f.name)}
                    animate={{ scale: on ? 1 : 0.84 }}
                    whileTap={{ scale: 0.78 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className="relative grid size-10 place-items-center rounded-full"
                  >
                    {on && (
                      <motion.span
                        layoutId={`ring-${p.slug}`}
                        className="absolute inset-0 rounded-full border-2 border-ink"
                        transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      />
                    )}
                    <span className="size-[30px] rounded-full shadow-[inset_0_0_0_1px_rgba(25,27,22,0.1)]" style={{ background: f.color }} />
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2.5">
            <Stepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(9, n)))} label="Quantity" />
            <motion.button
              type="button"
              onClick={add}
              whileTap={{ scale: 0.97 }}
              className="relative h-[46px] flex-1 overflow-hidden rounded-full bg-ink text-[13.5px] font-medium text-card"
              aria-live="polite"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={added ? "added" : "add"}
                  initial={{ y: 22, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -22, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute inset-0 flex items-center justify-center gap-2"
                >
                  {added ? (
                    <>
                      <Check size={15} strokeWidth={2.6} /> Added
                    </>
                  ) : (
                    <>Add to bag · {money(p.price * qty)}</>
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          <ul className="mt-4 flex flex-wrap gap-2 text-[12px] text-ink/75">
            <Chip icon={<Truck size={13} />}>Ships in 48h</Chip>
            <Chip icon={<RotateCcw size={13} />}>30-night trial</Chip>
            <Chip icon={<Leaf size={13} />}>FSC® materials</Chip>
          </ul>

          <LayoutGroup id="tabs">
            <div role="tablist" className="mt-7 flex gap-6 border-b border-line">
              {tabs.map((t) => (
                <button
                  key={t}
                  role="tab"
                  type="button"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`relative pb-3 text-[13px] transition-colors ${tab === t ? "font-medium text-ink" : "text-ink/70 hover:text-ink"}`}
                >
                  {t}
                  {tab === t && <motion.span layoutId="tab-line" className="absolute inset-x-0 -bottom-px h-[2px] bg-ink" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                </button>
              ))}
            </div>
          </LayoutGroup>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={tab}
              role="tabpanel"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className="mt-4 space-y-2.5 text-[13.5px] text-ink/80"
            >
              {list.map((d) => (
                <li key={d} className="flex items-center gap-2.5">
                  <span className="size-1 rounded-full bg-ink" />
                  {d}
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </Stagger>
      </motion.div>
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full bg-field px-3 py-1.5">
      {icon}
      {children}
    </li>
  );
}

function Stagger({ children, delay = 0 }: { children: React.ReactNode[]; delay?: number }) {
  return (
    <>
      {children.map((c, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: delay + i * 0.06 }}>
          {c}
        </motion.div>
      ))}
    </>
  );
}
