"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { DollarSign, ReceiptText, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, Donut, LineChart, Ring, Sparkline, useNow } from "@/components/dashboard";
import { CountUp, EASE, MaskText } from "@/components/ui";
import { useDash, type Range } from "@/lib/dashboard";
import { compactMoney, money, timeAgo } from "@/lib/format";
import { useShop } from "@/lib/store";

const GOAL = 4000;
const deltas: Record<Range, [string, string, string, string]> = {
  7: ["+6.4%", "+3.1%", "+3.2%", "+1.8%"],
  30: ["+19.9%", "+8.9%", "+10.1%", "+3.5%"],
  90: ["+31.2%", "+22.4%", "+7.2%", "+12.6%"],
};
const share = [
  { name: "Seating", pct: 48, color: "var(--color-indigo)" },
  { name: "Lighting", pct: 19, color: "#d9b93c" },
  { name: "Tables", pct: 12, color: "var(--color-ink)" },
  { name: "Textiles", pct: 14, color: "#c8654f" },
  { name: "Ceramics", pct: 7, color: "var(--color-leaf)" },
];

export default function OverviewPage() {
  const user = useShop((s) => s.user)!;
  const { days, orders, fresh, liveRevenue, liveOrders, lastOrderAt } = useDash();
  const [range, setRange] = useState<Range>(30);
  const [mode, setMode] = useState<"revenue" | "orders">("revenue");
  const now = useNow();

  const slice = useMemo(() => days.slice(-range), [days, range]);
  const revenue = slice.reduce((t, d) => t + d.revenue, 0) + liveRevenue;
  const count = slice.reduce((t, d) => t + d.orders, 0) + liveOrders;
  const aov = revenue / count;
  const customers = Math.round(count * 0.672);

  const today = days[days.length - 1]!;
  const todayRevenue = today.revenue + liveRevenue;
  const todayOrders = today.orders + liveOrders;
  const lastHour = orders.filter((o) => now - o.placedAt < 3_600_000).length;

  const hour = new Date(now).getHours();
  const greeting = hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const spark = (pick: (i: number) => number) => slice.slice(-22).map((_, i, a) => pick(slice.length - a.length + i));

  const kpis = [
    { label: "Revenue", icon: DollarSign, value: revenue, format: (n: number) => money(Math.round(n)), delta: deltas[range][0], values: spark((i) => slice[i]!.revenue) },
    { label: "Orders", icon: ShoppingCart, value: count, format: (n: number) => String(Math.round(n)), delta: deltas[range][1], values: spark((i) => slice[i]!.orders) },
    { label: "Avg. order value", icon: ReceiptText, value: aov, format: (n: number) => "$" + n.toFixed(2), delta: deltas[range][2], values: spark((i) => slice[i]!.revenue / slice[i]!.orders) },
    { label: "Customers", icon: Users, value: customers, format: (n: number) => String(Math.round(n)), delta: deltas[range][3], values: spark((i) => slice[i]!.orders * (0.6 + ((i * 7) % 5) / 30)) },
  ];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] text-muted">{new Date(now).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          <MaskText as="h1" lines={[`${greeting}, ${user.name.split(" ")[0]}`]} className="display mt-1.5 text-[clamp(30px,3.1vw,40px)]" />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[12px] text-ink/75">Last order {timeAgo(lastOrderAt, now)}</p>
          <LayoutGroup id="range">
            <div className="flex rounded-full bg-card p-1 shadow-card">
              {([7, 30, 90] as Range[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={range === r}
                  onClick={() => setRange(r)}
                  className={`relative h-[30px] rounded-full px-3 text-[12px] font-medium transition-colors ${range === r ? "text-card" : "text-ink/75 hover:text-ink"}`}
                >
                  {range === r && <motion.span layoutId="range-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative">{r}D</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>
      </header>

      <section aria-label="Key numbers" className="mt-5 grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.05 + i * 0.07 }}
            className="card !rounded-[22px] p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] text-ink/75">{k.label}</p>
              <span className="grid size-7 place-items-center rounded-lg bg-field">
                <k.icon size={14} />
              </span>
            </div>
            <p className="mt-3">
              <CountUp value={k.value} format={k.format} duration={1.1} className="display text-[27px]" />
            </p>
            <div className="mt-2.5 flex items-end justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-leaf/12 px-2 py-1 text-[10.5px] font-medium text-leaf">
                <TrendingUp size={11} /> {k.delta}
              </span>
              <Sparkline values={k.values} />
            </div>
          </motion.div>
        ))}
      </section>

      <div className="mt-3.5 grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_334px]">
        <div className="grid gap-3.5">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.3 }} className="card !rounded-[22px] p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[13.5px] font-medium">
                  {mode === "revenue" ? "Revenue" : "Orders"} · last {range} days
                </h2>
                <p className="mt-0.5 text-[12px] text-muted">{mode === "revenue" ? `${money(Math.round(revenue))} in total` : `${count} orders in total`}</p>
              </div>
              <LayoutGroup id="mode">
                <div className="flex rounded-full bg-field p-1">
                  {(["revenue", "orders"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={mode === m}
                      onClick={() => setMode(m)}
                      className={`relative h-7 rounded-full px-3 text-[12px] capitalize transition-colors ${mode === m ? "font-medium text-ink" : "text-ink/65 hover:text-ink"}`}
                    >
                      {mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-card shadow-card" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                      <span className="relative">{m}</span>
                    </button>
                  ))}
                </div>
              </LayoutGroup>
            </div>
            <LineChart key={range} days={slice} mode={mode} />
          </motion.section>

          <div className="grid gap-3.5 md:grid-cols-2">
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.4 }} className="card !rounded-[22px] p-5">
              <h2 className="text-[13.5px] font-medium">Today</h2>
              <p className="mt-0.5 text-[12px] text-muted">Goal {money(GOAL)}</p>
              <div className="mt-4 flex items-center gap-5">
                <Ring pct={todayRevenue / GOAL}>
                  <div>
                    <CountUp value={todayRevenue} className="text-[15px] font-semibold" />
                    <p className="text-[9.5px] text-muted">{Math.min(100, Math.round((todayRevenue / GOAL) * 100))}% of goal</p>
                  </div>
                </Ring>
                <div>
                  <CountUp value={todayOrders} format={(n) => String(Math.round(n))} className="display text-[32px]" />
                  <p className="text-[11.5px] text-muted">orders so far</p>
                  <div className="mt-3 flex h-8 items-end gap-[3px]" aria-hidden>
                    {[3, 5, 4, 7, 9, 6, 10, 8, 12, 7, 9, 5].map((v, i) => (
                      <motion.span key={i} className="w-[5px] rounded-full bg-ink/15" initial={{ height: 0 }} animate={{ height: `${v * 8}%` }} transition={{ duration: 0.6, ease: EASE, delay: 0.5 + i * 0.03 }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.47 }} className="card !rounded-[22px] p-5">
              <h2 className="text-[13.5px] font-medium">Sales by category</h2>
              <p className="mt-0.5 text-[12px] text-muted">Share of revenue in range</p>
              <div className="mt-4 flex items-center gap-6">
                <Donut parts={share}>
                  <div>
                    <p className="text-[14px] font-semibold tabular-nums">{compactMoney(revenue)}</p>
                    <p className="text-[9.5px] text-muted">All</p>
                  </div>
                </Donut>
                <ul className="flex-1 space-y-2">
                  {share.map((s) => (
                    <li key={s.name} className="flex items-center gap-2.5 text-[12px]">
                      <span className="size-2 rounded-full" style={{ background: s.color }} />
                      <span className="flex-1 text-ink/80">{s.name}</span>
                      <span className="font-medium tabular-nums">{s.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>
          </div>
        </div>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.36 }} className="card self-start overflow-hidden !rounded-[22px] p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[13.5px] font-medium">Live orders</h2>
              <p className="mt-0.5 text-[12px] text-muted">{lastHour} in the last hour</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/12 px-2 py-1 text-[10.5px] font-medium text-leaf">
              <span className="size-1.5 rounded-full bg-leaf" /> Live
            </span>
          </div>
          <ul className="-mx-2 mt-3">
            <AnimatePresence initial={false}>
              {orders.slice(0, 9).map((o) => {
                const isNew = fresh.includes(o.id) && now - o.placedAt < 9000;
                return (
                  <motion.li
                    key={o.id}
                    layout
                    initial={{ opacity: 0, y: -28, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="flex items-center gap-3 rounded-xl px-2 py-[9px] transition-colors duration-[1400ms]"
                    style={{ backgroundColor: isNew ? "#dee5f7" : "rgba(222,229,247,0)" }}
                  >
                    <Avatar name={o.customer} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{o.customer}</p>
                      <p className="truncate text-[11px] text-muted">
                        {o.city} · {o.items} {o.items === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold tabular-nums">{money(o.total)}</p>
                      <p className="text-[10px] text-muted">{timeAgo(o.placedAt, now)}</p>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </motion.section>
      </div>
    </div>
  );
}
