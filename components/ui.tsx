"use client";

import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { Minus, Plus, Sprout } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { site } from "@/lib/site";
import { money } from "@/lib/format";

export const EASE = [0.22, 1, 0.36, 1] as const;

export function Logo({ href = "/", small = false }: { href?: string; small?: boolean }) {
  return (
    <Link href={href} className="group flex items-center gap-2" aria-label={`${site.name} home`}>
      <span
        className={`grid place-items-center rounded-full bg-ink text-card transition-transform duration-500 ease-out-soft group-hover:rotate-[20deg] ${small ? "size-[22px]" : "size-6"}`}
      >
        <Sprout size={small ? 11 : 12} strokeWidth={2.4} />
      </span>
      <span className={`font-sans font-bold tracking-[-0.02em] ${small ? "text-[15px]" : "text-[17px]"}`}>{site.name}</span>
    </Link>
  );
}

/** Number that rolls to its new value (bag subtotal, checkout total, dashboard KPIs). */
export function CountUp({
  value,
  from = 0,
  format = money,
  duration = 0.9,
  className,
}: {
  value: number;
  from?: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(from);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      current.current = value;
      el.textContent = format(value);
      return;
    }
    const controls = animate(current.current, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        current.current = v;
        el.textContent = format(Math.round(v * 100) / 100 === value ? value : Math.round(v));
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {format(from)}
    </span>
  );
}

/** Headline whose lines rise out of a clipping mask. */
export function MaskText({
  lines,
  className,
  delay = 0,
  as: Tag = "h2",
  onView = false,
}: {
  lines: string[];
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "p";
  onView?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const show = onView ? inView : true;
  return (
    <Tag ref={ref as never} className={className} aria-label={lines.join(" ")}>
      {lines.map((line, i) => (
        <span key={i} aria-hidden className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
          <motion.span
            className="block will-change-transform"
            initial={{ y: "112%" }}
            animate={show ? { y: 0 } : { y: "112%" }}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Soft blur-up reveal used for sections and tiles as they scroll in. */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 22,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Stepper({
  value,
  onChange,
  size = "md",
  tone = "field",
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
  tone?: "field" | "card";
  label: string;
}) {
  const h = size === "sm" ? "h-[30px]" : "h-[46px]";
  const btn = size === "sm" ? "size-[30px]" : "size-[42px]";
  return (
    <div
      className={`inline-flex items-center rounded-full ${h} ${tone === "field" ? "bg-field" : "bg-card shadow-[inset_0_0_0_1px_var(--color-line)]"}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(value - 1)}
        className={`${btn} grid place-items-center rounded-full text-ink/80 transition hover:bg-ink/5 active:scale-90`}
      >
        <Minus size={size === "sm" ? 12 : 14} />
      </button>
      <span className={`min-w-[18px] text-center font-medium tabular-nums ${size === "sm" ? "text-[12px]" : "text-[13px]"}`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className={`${btn} grid place-items-center rounded-full text-ink/80 transition hover:bg-ink/5 active:scale-90`}
      >
        <Plus size={size === "sm" ? 12 : 14} />
      </button>
    </div>
  );
}

export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-[1.5px] border-current border-r-transparent"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
