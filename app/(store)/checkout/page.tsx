"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Banknote, Landmark, Lock, Truck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CountUp, EASE, MaskText, Spinner } from "@/components/ui";
import { money } from "@/lib/format";
import { bySlug, toneBg } from "@/lib/products";
import { site } from "@/lib/site";
import { newOrderId, totals, useShop, useUI } from "@/lib/store";

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useUI((s) => s.hydrated);
  const storeLines = useShop((s) => s.lines);
  const user = useShop((s) => s.user);
  const placeOrder = useShop((s) => s.placeOrder);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [speed, setSpeed] = useState<"standard" | "express">("standard");
  const [pay, setPay] = useState<"cod" | "bank">("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (user) {
      setName((n) => n || user.name);
      setCity((c) => c || "Copenhagen");
    }
  }, [user]);

  // Once the order is being placed the bag empties; keep showing what was ordered.
  const [frozen, setFrozen] = useState<typeof storeLines | null>(null);
  const lines = frozen ?? storeLines;
  const { subtotal, count, shipping } = totals(lines);
  const express = speed === "express" ? site.expressSurcharge : 0;
  const total = subtotal + shipping + express;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (city.trim().length < 2) next.city = "Enter a city.";
    if (street.trim().length < 4) next.street = "Enter a street address.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }
    setFrozen(storeLines);
    setPlacing(true);
    setFailed(false);
    const id = newOrderId();
    const started = Date.now();
    fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, customer: name, city, street, delivery: speed, payment: pay, lines: storeLines.map(({ slug, finish, qty }) => ({ slug, finish, qty })) }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((saved: { total: number; items: number }) => {
        setTimeout(() => {
          placeOrder({ id, customer: name.trim(), city: city.trim(), items: saved.items, total: saved.total, status: "Paid", placedAt: Date.now() });
          router.push("/checkout/success");
        }, Math.max(0, 1200 - (Date.now() - started)));
      })
      .catch(() => {
        setPlacing(false);
        setFrozen(null);
        setFailed(true);
      });
  };

  if (hydrated && lines.length === 0 && !placing) {
    return (
      <div className="grid min-h-[60svh] place-items-center">
        <div className="card max-w-[420px] p-10 text-center">
          <p className="display text-[30px]">Your bag is empty.</p>
          <p className="mt-3 text-[13.5px] text-muted">Add a piece or two and come back — checkout takes under a minute.</p>
          <Link href="/shop" className="btn-ink mt-6 h-11 px-6 text-[13px]">
            Shop the edit <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-3.5 pt-3 lg:grid-cols-[1.41fr_1fr]">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="card p-7 sm:p-8"
      >
        <p className="eyebrow">Checkout</p>
        <MaskText as="h1" lines={["Almost yours."]} className="display mt-3 text-[clamp(38px,4.1vw,54px)]" />

        <Step n={1} title="Delivery address" />
        <div className="grid gap-x-2.5 gap-y-3 sm:grid-cols-2">
          <TextField id="name" label="Full name" value={name} onChange={setName} error={errors.name} autoComplete="name" />
          <TextField id="city" label="City" value={city} onChange={setCity} error={errors.city} autoComplete="address-level2" />
          <div className="sm:col-span-2">
            <TextField id="street" label="Street address" value={street} onChange={setStreet} error={errors.street} autoComplete="street-address" />
          </div>
        </div>

        <Step n={2} title="Delivery speed" />
        <div role="radiogroup" aria-label="Delivery speed" className="grid gap-2.5 sm:grid-cols-2">
          <Option on={speed === "standard"} onClick={() => setSpeed("standard")} icon={<Truck size={15} />} title="Standard" sub={`3–5 days · ${shipping === 0 ? "Included" : money(shipping)}`} />
          <Option on={speed === "express"} onClick={() => setSpeed("express")} icon={<Zap size={15} />} title="Express" sub={`Next day · +${money(site.expressSurcharge)}`} />
        </div>

        <Step n={3} title="Payment" />
        <div role="radiogroup" aria-label="Payment" className="grid gap-2.5 sm:grid-cols-2">
          <Option on={pay === "cod"} onClick={() => setPay("cod")} icon={<Banknote size={15} />} title="Pay on delivery" />
          <Option on={pay === "bank"} onClick={() => setPay("bank")} icon={<Landmark size={15} />} title="Bank transfer" />
        </div>
      </motion.section>

      <motion.aside
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
        className="card p-6 sm:p-7 lg:sticky lg:top-[78px]"
      >
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Order summary</h2>
        <ul className="mt-4 space-y-2.5">
          {lines.map((l, i) => {
            const p = bySlug(l.slug);
            if (!p) return null;
            return (
              <motion.li
                key={l.key}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className={`relative grid size-[50px] shrink-0 place-items-center rounded-xl ${toneBg[p.tone]}`}>
                  <Image src={p.image} alt="" width={p.w} height={p.h} sizes="50px" className="max-h-[70%] w-auto max-w-[70%] object-contain" />
                  <span className="absolute -right-1.5 -top-1.5 grid size-[18px] place-items-center rounded-full bg-ink text-[10px] font-semibold text-card">{l.qty}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium">{p.name}</p>
                  {l.finish && <p className="text-[11.5px] text-muted">{l.finish}</p>}
                </div>
                <span className="text-[13px] tabular-nums">{money(p.price * l.qty)}</span>
              </motion.li>
            );
          })}
        </ul>

        <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[13px]">
          <Row label="Subtotal" value={money(subtotal)} />
          <Row label="Shipping" value={shipping === 0 ? "Free" : money(shipping)} />
          <AnimatePresence initial={false}>
            {express > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -6 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden"
              >
                <Row label="Express" value={money(express)} />
              </motion.div>
            )}
          </AnimatePresence>
        </dl>
        <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
          <span className="text-[13px] text-ink/80">Total</span>
          <CountUp value={total} from={Math.round(total * 0.85)} className="display text-[30px]" />
        </div>
        <button type="submit" disabled={placing || !hydrated} className="btn-ink mt-5 h-[46px] w-full text-[13.5px] disabled:bg-ink/55">
          {placing ? (
            <>
              <Spinner /> Placing order…
            </>
          ) : (
            <>
              Place order <ArrowRight size={14} />
            </>
          )}
        </button>
        {failed && (
          <p role="alert" className="mt-3 text-center text-[12px] text-[#b3402f]">
            We couldn’t place your order. Check your connection and try again.
          </p>
        )}
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <Lock size={11} /> No card details are collected.
        </p>
      </motion.aside>
    </form>
  );
}

function Step({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="mb-3.5 mt-8 flex items-center gap-3 text-[14.5px] font-medium">
      <span className="grid size-[22px] place-items-center rounded-full bg-ink text-[11px] font-semibold text-card">{n}</span>
      {title}
    </h2>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium">
        {label}
      </label>
      <input
        id={id}
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-[11.5px] text-[#b3402f]">
          {error}
        </p>
      )}
    </div>
  );
}

function Option({ on, onClick, icon, title, sub }: { on: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`relative flex h-[62px] items-center gap-3 rounded-[14px] px-3.5 text-left transition-colors duration-300 ${on ? "bg-card" : "bg-field hover:bg-[#ebebdf]"}`}
    >
      <span
        className={`absolute inset-0 rounded-[14px] border-2 transition-all duration-300 ease-out-soft ${on ? "scale-100 border-ink opacity-100" : "scale-[0.98] border-transparent opacity-0"}`}
      />
      <span className={`relative grid size-8 place-items-center rounded-[10px] transition-colors duration-300 ${on ? "bg-ink text-card" : "bg-card text-ink"}`}>{icon}</span>
      <span className="relative">
        <span className="block text-[13.5px] font-medium">{title}</span>
        {sub && <span className="block text-[11.5px] text-muted">{sub}</span>}
      </span>
    </motion.button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink/75">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
