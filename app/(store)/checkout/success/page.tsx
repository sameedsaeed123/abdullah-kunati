"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EASE } from "@/components/ui";
import { money } from "@/lib/format";
import { useShop, useUI } from "@/lib/store";

const dots = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2 + (i % 2 ? 0.22 : -0.1);
  const r = 52 + (i % 3) * 16;
  return {
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
    color: ["var(--color-indigo)", "var(--color-ink)", "#b9bdf0", "#c9c9bd"][i % 4],
    size: i % 3 === 0 ? 6 : 4.5,
    delay: 0.38 + (i % 4) * 0.03,
  };
});

export default function SuccessPage() {
  const router = useRouter();
  const hydrated = useUI((s) => s.hydrated);
  const order = useShop((s) => s.lastOrder);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (hydrated && !order) router.replace("/");
  }, [hydrated, order, router]);

  if (!order) return <div className="min-h-[70svh]" />;

  const item = (delay: number) => ({
    initial: { opacity: 0, y: 12, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <div className="grid min-h-[calc(100svh-180px)] place-items-center py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="card w-full max-w-[420px] px-8 pb-9 pt-10 text-center"
      >
        <div className="relative mx-auto size-[66px]">
          {dots.map((d, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{ width: d.size, height: d.size, background: d.color, marginLeft: -d.size / 2, marginTop: -d.size / 2 }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x: [0, d.x, d.x * 1.25], y: [0, d.y, d.y * 1.25 + 10], opacity: [0, 1, 0], scale: [0, 1, 0.6] }}
              transition={{ duration: 1.3, times: [0, 0.4, 1], ease: "easeOut", delay: d.delay }}
            />
          ))}
          <motion.div
            className="grid size-full place-items-center rounded-full bg-leaf text-white"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ duration: 0.55, times: [0, 0.65, 1], ease: EASE, delay: 0.15 }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: "easeOut", delay: 0.42 }} />
            </svg>
          </motion.div>
        </div>

        <motion.p {...item(0.5)} className="eyebrow mt-6">
          Order {order.id}
        </motion.p>
        <motion.h1 {...item(0.6)} className="display mt-2.5 text-[36px]">
          Thank you!
        </motion.h1>
        <motion.p {...item(0.72)} className="mx-auto mt-3 max-w-[300px] text-[13.5px] leading-relaxed text-ink/70">
          {money(order.total)} · {order.items} {order.items === 1 ? "item" : "items"} heading to {order.city}. We’ll email you when it ships.
        </motion.p>
        <motion.div {...item(0.86)} className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Link href="/dashboard/orders" className="btn-ink h-10 px-5 text-[13px]">
            Track your order
          </Link>
          <Link href="/dashboard" className="btn-ghost h-10 px-5 text-[13px]">
            See it in the dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
