"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { Avatar, StatusPill, useNow } from "@/components/dashboard";
import { MaskText, Spinner } from "@/components/ui";
import { nextStatus, statusCounts, useDash } from "@/lib/dashboard";
import { money, timeAgo } from "@/lib/format";
import type { OrderStatus } from "@/lib/store";

type Tab = "All" | OrderStatus;
const tabs: Tab[] = ["All", "Paid", "Packing", "Shipped", "Delivered"];
const cols = "grid grid-cols-[1.1fr_1.7fr_1fr_0.7fr_0.8fr_132px] items-center gap-3";

export default function OrdersPage() {
  const orders = useDash((s) => s.orders);
  const fresh = useDash((s) => s.fresh);
  const advance = useDash((s) => s.advance);
  const [tab, setTab] = useState<Tab>("All");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const now = useNow();

  const counts = statusCounts(orders);
  const needle = q.trim().toLowerCase();
  const rows = orders
    .filter((o) => tab === "All" || o.status === tab)
    .filter((o) => !needle || `${o.id} ${o.customer} ${o.city}`.toLowerCase().includes(needle))
    .slice(0, 40);

  const mark = (id: string) => {
    setBusy(id);
    setTimeout(() => {
      advance(id);
      setBusy(null);
    }, 550);
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] text-muted">
            {counts.All} orders · {counts.Paid} waiting to pack
          </p>
          <MaskText as="h1" lines={["Orders"]} className="display mt-1.5 text-[clamp(30px,3.1vw,40px)]" />
        </div>
        <label className="relative block w-full max-w-[232px]">
          <span className="sr-only">Search orders</span>
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order, customer or city" className="field !h-10 !rounded-full !bg-card !pl-9 shadow-card" />
        </label>
      </header>

      <LayoutGroup id="order-tabs">
        <div role="tablist" aria-label="Filter by status" className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTab(t)}
                className={`relative flex h-[34px] items-center gap-2 rounded-full px-3.5 text-[12.5px] transition-colors ${active ? "font-medium text-card" : "bg-card text-ink/80 shadow-card hover:text-ink"}`}
              >
                {active && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">{t}</span>
                <span className={`relative rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${active ? "bg-card/15" : "bg-field text-muted"}`}>{counts[t]}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="card mt-4 overflow-x-auto !rounded-[22px]">
        <div className="min-w-[760px]" role="table" aria-label="Orders">
          <div role="row" className={`${cols} eyebrow px-5 py-3.5`}>
            <span role="columnheader">Order</span>
            <span role="columnheader">Customer</span>
            <span role="columnheader">Placed</span>
            <span role="columnheader" className="text-right">
              Total
            </span>
            <span role="columnheader">Status</span>
            <span role="columnheader" className="text-right">
              Action
            </span>
          </div>
          <AnimatePresence initial={false}>
            {rows.map((o) => {
              const to = nextStatus(o.status);
              const isNew = fresh.includes(o.id) && now - o.placedAt < 12000;
              return (
                <motion.div
                  key={o.id}
                  role="row"
                  layout="position"
                  initial={{ opacity: 0, y: -18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  className={`${cols} border-t border-line px-5 py-[11px] transition-colors duration-[1600ms]`}
                  style={{ backgroundColor: isNew ? "#dee5f7" : "rgba(222,229,247,0)" }}
                >
                  <span role="cell" className="text-[14px] font-medium tabular-nums">
                    {o.id}
                  </span>
                  <span role="cell" className="flex min-w-0 items-center gap-3">
                    <Avatar name={o.customer} size={26} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">{o.customer}</span>
                      <span className="block truncate text-[11px] text-muted">{o.city}</span>
                    </span>
                  </span>
                  <span role="cell" className="text-[12px] text-muted">
                    {timeAgo(o.placedAt, now)}
                  </span>
                  <span role="cell" className="text-right text-[14px] font-semibold tabular-nums">
                    {money(o.total)}
                  </span>
                  <span role="cell">
                    <StatusPill status={o.status} />
                  </span>
                  <span role="cell" className="flex justify-end">
                    {to ? (
                      <button
                        type="button"
                        disabled={busy === o.id}
                        onClick={() => mark(o.id)}
                        className="btn-ghost group h-8 gap-1.5 whitespace-nowrap px-3 text-[12px] disabled:bg-field disabled:text-muted"
                      >
                        {busy === o.id ? <Spinner size={11} /> : null}
                        Mark {to.toLowerCase()}
                        <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                      </button>
                    ) : (
                      <span className="pr-3 text-[12px] text-faint">Complete</span>
                    )}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {rows.length === 0 && <p className="border-t border-line px-5 py-14 text-center text-[13px] text-muted">No orders match that search.</p>}
        </div>
      </div>
    </div>
  );
}
