"use client";

import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { ArrowRight, Check, LayoutGrid, ShoppingBag, Trash2, User as UserIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { CountUp, EASE, Logo, Stepper } from "@/components/ui";
import { initials, money } from "@/lib/format";
import { bySlug, navCategories, toneBg } from "@/lib/products";
import { site } from "@/lib/site";
import { totals, useShop, useUI, type Flight } from "@/lib/store";

/** Loads the saved bag/session from localStorage once the page is interactive. */
export function StoreHydrator() {
  useEffect(() => {
    void Promise.resolve(useShop.persist.rehydrate()).then(() => useUI.setState({ hydrated: true }));
  }, []);
  return null;
}

/* ------------------------------- Header ------------------------------- */

export function Header() {
  const user = useShop((s) => s.user);
  return (
    <header className="fixed inset-x-3 top-3 z-40 sm:inset-x-4 sm:top-3.5">
      <div className="relative flex h-[50px] items-center justify-between rounded-full bg-card/85 pl-4 pr-1.5 shadow-card backdrop-blur-xl">
        <Logo />
        <nav aria-label="Shop" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
          <NavLink href="/shop">Shop all</NavLink>
          {navCategories.map((c) => (
            <NavLink key={c} href={`/shop?c=${c.toLowerCase()}`}>
              {c}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-full px-3 py-2 text-[13px] text-ink/80 transition hover:bg-ink/5 hover:text-ink sm:flex"
              >
                <LayoutGrid size={14} /> Dashboard
              </Link>
              <Link
                href="/account"
                aria-label={`Account: ${user.name}`}
                className="grid size-[26px] place-items-center rounded-full bg-indigo text-[10px] font-semibold text-white transition hover:scale-105"
              >
                {initials(user.name)}
              </Link>
            </>
          ) : (
            <Link
              href="/account"
              aria-label="Sign in"
              className="grid size-9 place-items-center rounded-full text-ink/80 transition hover:bg-ink/5 hover:text-ink"
            >
              <UserIcon size={16} />
            </Link>
          )}
          <BagButton />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group relative py-2 text-[13px] text-ink/85 transition-colors hover:text-ink">
      {children}
      <span className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-ink transition-transform duration-300 ease-out-soft group-hover:scale-x-100" />
    </Link>
  );
}

function BagButton() {
  const count = useShop((s) => totals(s.lines).count);
  const pulse = useUI((s) => s.bagPulse);
  const open = useUI((s) => s.openDrawer);
  const controls = useAnimationControls();

  useEffect(() => {
    if (pulse === 0) return;
    void controls.start({ scale: [1, 1.14, 0.96, 1], transition: { duration: 0.5, ease: EASE } });
  }, [pulse, controls]);

  return (
    <motion.button
      id="bag-target"
      type="button"
      onClick={open}
      animate={controls}
      whileTap={{ scale: 0.95 }}
      aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
      className="flex h-[38px] items-center gap-2 rounded-full bg-ink pl-3.5 pr-2 text-[13px] font-medium text-card"
    >
      <ShoppingBag size={14} />
      Bag
      <span className="relative grid h-5 min-w-5 place-items-center overflow-hidden rounded-full bg-card px-1 text-[11px] font-semibold text-ink">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="tabular-nums"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

/* ---------------------------- Fly-to-bag layer ---------------------------- */

export function FlyLayer() {
  const flights = useUI((s) => s.flights);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      {flights.map((f) => (
        <Flyer key={f.id} flight={f} />
      ))}
    </div>
  );
}

function Flyer({ flight }: { flight: Flight }) {
  const land = useUI((s) => s.land);
  const { from } = flight;
  const target = typeof document !== "undefined" ? document.getElementById("bag-target")?.getBoundingClientRect() : undefined;
  const size = Math.min(Math.max(Math.min(from.w, from.h) * 0.42, 72), 190);
  const sx = from.x + from.w / 2 - size / 2;
  const sy = from.y + from.h / 2 - size / 2;
  const tx = (target ? target.left + target.width / 2 : window.innerWidth - 60) - size / 2;
  const ty = (target ? target.top + target.height / 2 : 38) - size / 2;
  const T = 0.95;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <motion.img
      src={flight.src}
      alt=""
      className="absolute left-0 top-0 object-contain drop-shadow-[0_18px_18px_rgba(25,27,22,0.22)]"
      style={{ width: size, height: size }}
      initial={{ x: sx, y: sy, scale: 0.55, opacity: 0, rotate: 0 }}
      animate={{
        x: tx,
        // lifts fast, crests just above the bag, then drops in
        y: [sy, ty - 16, ty],
        scale: [0.55, 1, 0.82, 0.2],
        opacity: [0, 1, 1, 0.85],
        rotate: [0, -12, -6, 0],
      }}
      transition={{
        x: { duration: T, ease: [0.6, 0, 0.9, 0.5] },
        y: { duration: T, times: [0, 0.62, 1], ease: [[0.1, 0.8, 0.25, 1], "easeIn"] },
        scale: { duration: T, times: [0, 0.16, 0.6, 1], ease: "easeInOut" },
        opacity: { duration: T, times: [0, 0.1, 0.9, 1] },
        rotate: { duration: T, times: [0, 0.3, 0.7, 1] },
      }}
      onAnimationComplete={() => land(flight.id)}
    />
  );
}

/* --------------------------------- Toast --------------------------------- */

export function Toast() {
  const toast = useUI((s) => s.toast);
  const hide = useUI((s) => s.hideToast);
  const open = useUI((s) => s.openDrawer);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, 3600);
    return () => clearTimeout(t);
  }, [toast, hide]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 26, opacity: 0, scale: 0.94, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ y: 10, opacity: 0, scale: 0.97, filter: "blur(6px)", transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-1.5 pl-1.5 pr-1.5 text-card shadow-float ring-[3px] ring-card/70"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.12 }}
              className="grid size-7 place-items-center rounded-full bg-leaf"
            >
              <Check size={14} strokeWidth={3} />
            </motion.span>
            <span className="text-[13px]">{toast.text}</span>
            <button
              type="button"
              onClick={open}
              className="h-7 rounded-full bg-card px-3 text-[12px] font-medium text-ink transition hover:bg-white active:scale-95"
            >
              View bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ Bag drawer ------------------------------ */

export function CartDrawer() {
  const open = useUI((s) => s.drawerOpen);
  const close = useUI((s) => s.closeDrawer);
  const lines = useShop((s) => s.lines);
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.remove);
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { subtotal, count } = totals(lines);
  const left = Math.max(0, site.freeDeliveryOver - subtotal);
  const progress = Math.min(1, subtotal / site.freeDeliveryOver);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-[#55564c]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="absolute bottom-2 right-2 top-2 flex w-[348px] max-w-[calc(100vw-16px)] flex-col rounded-[26px] bg-card p-4 shadow-float"
            initial={{ x: "108%" }}
            animate={{ x: 0 }}
            exit={{ x: "108%", transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: "spring", stiffness: 330, damping: 34 }}
          >
            <div className="flex items-center justify-between px-1 pb-3 pt-1">
              <h2 className="display text-[24px]">
                Your bag <span className="text-muted">({count})</span>
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close bag"
                className="grid size-9 place-items-center rounded-full bg-field transition hover:rotate-90 hover:bg-line"
              >
                <X size={15} />
              </button>
            </div>

            {lines.length > 0 && (
              <div className="rounded-2xl bg-field px-3 pb-3 pt-2.5">
                <p className={`text-[11.5px] font-medium ${left === 0 ? "text-leaf" : "text-ink/80"}`}>
                  {left === 0 ? "Free delivery unlocked" : `${money(left)} away from free delivery`}
                </p>
                <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-ink/10">
                  <motion.div
                    className="h-full origin-left rounded-full bg-ink"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
                  />
                </div>
              </div>
            )}

            <ul className="-mx-1 mt-2 flex-1 space-y-2 overflow-y-auto px-1 py-1">
              <AnimatePresence initial={false}>
                {lines.map((l, i) => {
                  const p = bySlug(l.slug);
                  if (!p) return null;
                  return (
                    <motion.li
                      key={l.key}
                      layout
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.06, duration: 0.45, ease: EASE } }}
                      exit={{ opacity: 0, x: 40, height: 0, marginTop: 0, transition: { duration: 0.28 } }}
                      className="relative flex gap-3 overflow-hidden rounded-2xl bg-field p-2"
                    >
                      <div className={`relative grid size-[76px] shrink-0 place-items-center rounded-xl ${toneBg[p.tone]}`}>
                        <Image src={p.image} alt="" width={p.w} height={p.h} sizes="76px" className="max-h-[72%] w-auto max-w-[72%] object-contain" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 pr-1">
                        <div className="pr-7">
                          <p className="truncate text-[13.5px] font-medium">{p.name}</p>
                          {l.finish && <p className="text-[11.5px] text-muted">{l.finish}</p>}
                        </div>
                        <div className="flex items-center justify-between">
                          <Stepper size="sm" tone="card" value={l.qty} onChange={(n) => setQty(l.key, n)} label={`Quantity of ${p.name}`} />
                          <span className="text-[13.5px] font-semibold tabular-nums">{money(p.price * l.qty)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(l.key)}
                        aria-label={`Remove ${p.name}`}
                        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              {lines.length === 0 && (
                <li className="grid h-full place-items-center py-16 text-center">
                  <div>
                    <p className="display text-[20px]">Nothing here yet.</p>
                    <p className="mt-2 text-[13px] text-muted">Pieces you add will wait for you here.</p>
                    <Link href="/shop" onClick={close} className="btn-ink mt-5 h-10 px-5 text-[13px]">
                      Shop the edit <ArrowRight size={14} />
                    </Link>
                  </div>
                </li>
              )}
            </ul>

            {lines.length > 0 && (
              <div className="border-t border-line px-1 pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-[13px] text-ink/80">Subtotal</span>
                  <CountUp value={subtotal} className="display text-[24px]" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    router.push("/checkout");
                  }}
                  className="btn-ink mt-3 h-11 w-full text-[13px]"
                >
                  Checkout <ArrowRight size={14} />
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* --------------------------------- Footer --------------------------------- */

export function Footer() {
  return (
    <footer className="px-3 pb-3 pt-16 sm:px-4 sm:pb-4">
      <div className="grid gap-10 rounded-[28px] bg-ink px-7 py-9 text-card sm:px-10 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <p className="display max-w-[260px] text-[24px] leading-[1.08]">Calm objects, made to be lived with.</p>
          <p className="mt-4 max-w-[300px] text-[13px] leading-relaxed text-card/60">
            Solid oak, wool and clay from small workshops in Denmark, Portugal and Lithuania. Dispatched in 48 hours.
          </p>
        </div>
        <FooterCol title="Shop" links={[["Shop all", "/shop"], ["Seating", "/shop?c=seating"], ["Lighting", "/shop?c=lighting"], ["Textiles", "/shop?c=textiles"]]} />
        <FooterCol title="Account" links={[["Sign in", "/account"], ["Your orders", "/dashboard/orders"], ["Dashboard", "/dashboard"]]} />
        <p className="text-[11.5px] text-card/40 md:col-span-3">
          © {new Date().getFullYear()} {site.name}.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow !text-card/45">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-[13px] text-card/85 transition hover:text-card hover:underline hover:underline-offset-4">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
