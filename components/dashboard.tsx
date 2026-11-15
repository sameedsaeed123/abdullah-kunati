"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { LayoutGrid, LogOut, MessageSquare, Package, PanelsTopLeft, ReceiptText, Store, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { EASE, Logo } from "@/components/ui";
import { smoothPath, useDash, type Day } from "@/lib/dashboard";
import { initials, money } from "@/lib/format";
import { useShop, type OrderStatus } from "@/lib/store";

export function useNow(every = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(t);
  }, [every]);
  return now;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e!.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const avatarTones = ["#e7e4d9", "#e8e1d6", "#dae2d3", "#d6dde6", "#ecdfd7", "#e6e0c4"];
export function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const tone = avatarTones[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarTones.length];
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-ink/75"
      style={{ width: size, height: size, background: tone, fontSize: Math.round(size * 0.34) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

const pill: Record<OrderStatus, string> = {
  Paid: "bg-[#dce4f8] text-indigo",
  Packing: "bg-[#f4e3c4] text-[#8a5a14]",
  Shipped: "bg-sage text-leaf",
  Delivered: "bg-field text-muted",
};
export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: 0.8, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -6 }}
        transition={{ type: "spring", stiffness: 480, damping: 30 }}
        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${pill[status]}`}
      >
        {status}
      </motion.span>
    </AnimatePresence>
  );
}

/* --------------------------------- Sidebar --------------------------------- */

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/orders", label: "Orders", icon: ReceiptText },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/site", label: "Site editor", icon: PanelsTopLeft },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/", label: "Storefront", icon: Store },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useShop((s) => s.user);
  const signOut = useShop((s) => s.signOut);
  const live = useDash((s) => s.live);
  const setLive = useDash((s) => s.setLive);

  return (
    <aside className="card sticky top-2.5 z-30 flex shrink-0 flex-col !rounded-[22px] p-3 md:h-[calc(100svh-20px)] md:w-[200px]">
      <div className="flex items-center justify-between px-2 pb-4 pt-2">
        <Logo small href="/dashboard" />
        <span className="rounded-md bg-field px-1.5 py-1 font-mono text-[9px] tracking-[0.14em] text-muted">ADMIN</span>
      </div>
      <LayoutGroup id="side">
        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {nav.map((n) => {
            const active = n.href === pathname;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-[38px] shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 text-[13px] transition-colors md:flex-none ${active ? "font-medium text-card" : "text-ink/80 hover:bg-ink/5 hover:text-ink"}`}
              >
                {active && <motion.span layoutId="side-pill" className="absolute inset-0 rounded-xl bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <n.icon size={15} className="relative" />
                <span className="relative">{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </LayoutGroup>

      <div className="mt-auto hidden space-y-2 md:block">
        <div className="flex items-center justify-between rounded-xl bg-field p-3">
          <div>
            <p className="flex items-center gap-1.5 text-[12.5px] font-medium">
              <span className="relative flex size-1.5">
                {live && <span className="absolute inset-0 animate-ping rounded-full bg-leaf/70" />}
                <span className={`relative size-1.5 rounded-full ${live ? "bg-leaf" : "bg-faint"}`} />
              </span>
              Live traffic
            </p>
            <p className="mt-0.5 text-[10.5px] text-muted">{live ? "Simulating shoppers" : "Paused"}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={live}
            aria-label="Live traffic"
            onClick={() => setLive(!live)}
            className={`flex h-[22px] w-[38px] items-center rounded-full p-[3px] transition-colors duration-300 ${live ? "justify-end bg-leaf" : "justify-start bg-ink/20"}`}
          >
            <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 34 }} className="size-4 rounded-full bg-white shadow" />
          </button>
        </div>
        {user && (
          <div className="flex items-center gap-2.5 rounded-xl bg-field p-2.5">
            <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-indigo text-[10px] font-semibold text-white">{initials(user.name)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium">{user.name}</p>
              <p className="truncate text-[10.5px] text-muted">{user.email}</p>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              onClick={() => {
                void fetch("/api/login", { method: "DELETE" }).catch(() => {});
                signOut();
                router.push("/");
              }}
              className="grid size-7 place-items-center rounded-lg text-muted transition hover:bg-ink/5 hover:text-ink"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------ New-order toast ------------------------------ */

export function LiveToast() {
  const toast = useDash((s) => s.toast);
  const hide = useDash((s) => s.hideToast);
  const pathname = usePathname();
  const here = pathname === "/dashboard" || pathname === "/dashboard/orders";
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, 5200);
    return () => clearTimeout(t);
  }, [toast, hide]);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50" role="status" aria-live="polite">
      <AnimatePresence mode="wait">
        {toast && here && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.94, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 30, filter: "blur(6px)", transition: { duration: 0.3 } }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="flex w-[272px] items-center gap-3 rounded-2xl bg-ink p-2.5 pr-4 text-card shadow-float"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-card/10 text-[11px] font-semibold">{initials(toast.customer)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] text-card/55">New order · {toast.city}</p>
              <p className="truncate text-[13px] font-medium">{toast.customer}</p>
            </div>
            <span className="text-[15px] font-semibold tabular-nums">{money(toast.total)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------- Charts --------------------------------- */

export function Sparkline({ values }: { values: number[] }) {
  const gid = useId();
  const W = 92;
  const H = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - 4 - ((v - min) / (max - min || 1)) * (H - 8)] as [number, number]);
  const d = smoothPath(pts, 0.2);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-leaf)" stopOpacity="0.2" />
          <stop offset="1" stopColor="var(--color-leaf)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${W},${H} L0,${H} Z`} fill={`url(#${gid})`} />
      <motion.path d={d} fill="none" stroke="var(--color-leaf)" strokeWidth="1.4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.2 }} />
    </svg>
  );
}

const niceRevenue = (v: number) => (v >= 10_000 ? `$${v / 1000}K` : v === 0 ? "$0" : money(v));

export function LineChart({ days, mode }: { days: Day[]; mode: "revenue" | "orders" }) {
  const gid = useId();
  const [ref, W] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 268;
  const pad = { l: 46, r: 14, t: 16, b: 30 };

  const { d, area, pts, ticks, max } = useMemo(() => {
    const vals = days.map((x) => (mode === "revenue" ? x.revenue : x.orders));
    const peak = Math.max(...vals, 1);
    const max = mode === "revenue" ? Math.ceil(peak / 20_000) * 20_000 : Math.ceil(peak / 50) * 50;
    const iw = Math.max(10, W - pad.l - pad.r);
    const ih = H - pad.t - pad.b;
    const pts = vals.map((v, i) => [pad.l + (i / Math.max(1, vals.length - 1)) * iw, pad.t + ih - (v / max) * ih] as [number, number]);
    const d = smoothPath(pts);
    const base = pad.t + ih;
    const area = `${d} L${pts[pts.length - 1]![0].toFixed(1)},${base} L${pts[0]![0].toFixed(1)},${base} Z`;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: max * f, y: base - f * ih }));
    return { d, area, pts, ticks, max };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, mode, W]);

  const step = days.length <= 7 ? 1 : days.length <= 30 ? 5 : 15;
  const fmtDay = (dt: Date) => dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const last = pts[pts.length - 1];
  const h = hover != null ? { p: pts[hover]!, day: days[hover]! } : null;
  const tipW = 104;

  const onMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let best = 0;
    let dist = Infinity;
    pts.forEach((p, i) => {
      const dd = Math.abs(p[0] - x);
      if (dd < dist) {
        dist = dd;
        best = i;
      }
    });
    setHover(best);
  };

  return (
    <div ref={ref} className="relative mt-3 select-none" style={{ height: H }} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
      {W > 0 && (
        <svg width={W} height={H} role="img" aria-label={`${mode === "revenue" ? "Revenue" : "Orders"} per day, last ${days.length} days`}>
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--color-indigo)" stopOpacity="0.16" />
              <stop offset="1" stopColor="var(--color-indigo)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t.y}>
              <line x1={pad.l} x2={W - pad.r} y1={t.y} y2={t.y} stroke="var(--color-ink)" strokeOpacity="0.1" strokeDasharray="2 5" />
              <text x={pad.l - 10} y={t.y + 3.5} textAnchor="end" className="fill-muted font-mono text-[9.5px]">
                {mode === "revenue" ? niceRevenue(t.v) : Math.round(t.v)}
              </text>
            </g>
          ))}
          {days.map((x, i) => {
            const fromEnd = days.length - 1 - i;
            if (fromEnd % step !== 0) return null;
            return (
              <text key={i} x={pts[i]![0]} y={H - 8} textAnchor={fromEnd === 0 ? "end" : "middle"} className="fill-muted font-mono text-[9.5px]">
                {fromEnd === 0 ? "Today" : fmtDay(x.date)}
              </text>
            );
          })}
          <motion.path animate={{ d: area }} initial={false} transition={{ duration: 0.7, ease: EASE }} fill={`url(#${gid})`} />
          <motion.path
            initial={{ pathLength: 0, d }}
            animate={{ pathLength: 1, d }}
            transition={{ pathLength: { duration: 1.4, ease: EASE }, d: { duration: 0.7, ease: EASE } }}
            fill="none"
            stroke="var(--color-indigo)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {h && <line x1={h.p[0]} x2={h.p[0]} y1={pad.t} y2={H - pad.b} stroke="var(--color-ink)" strokeOpacity="0.35" />}
          {last && (
            <motion.g animate={{ x: last[0], y: last[1] }} initial={false} transition={{ duration: 0.7, ease: EASE }}>
              <circle r="9" fill="var(--color-indigo)" opacity="0.14">
                <animate attributeName="r" values="5;11;5" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle r="4" fill="var(--color-card)" stroke="var(--color-indigo)" strokeWidth="2" />
            </motion.g>
          )}
          {h && <circle cx={h.p[0]} cy={h.p[1]} r="4" fill="var(--color-ink)" stroke="var(--color-card)" strokeWidth="1.5" />}
        </svg>
      )}
      <AnimatePresence>
        {h && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: Math.min(Math.max(h.p[0] - tipW / 2, pad.l), W - tipW), y: 4 }}
            animate={{ opacity: 1, scale: 1, x: Math.min(Math.max(h.p[0] - tipW / 2, pad.l), W - tipW), y: Math.max(0, Math.min(h.p[1] - 96, H - 150)) }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 34, opacity: { duration: 0.15 } }}
            className="pointer-events-none absolute left-0 top-0 rounded-xl bg-ink px-3 py-2.5 text-card shadow-float"
            style={{ width: tipW }}
          >
            <p className="text-[10px] text-card/55">{h.day.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
            <p className="mt-0.5 text-[15px] font-semibold tabular-nums">{money(h.day.revenue)}</p>
            <p className="text-[10.5px] text-card/55">{h.day.orders} orders</p>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Peak axis value {max}</span>
    </div>
  );
}

export function Ring({ pct, children }: { pct: number; children: React.ReactNode }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-[112px] shrink-0">
      <svg viewBox="0 0 112 112" className="-rotate-90" aria-hidden>
        <circle cx="56" cy="56" r={r} fill="none" stroke="var(--color-ink)" strokeOpacity="0.08" strokeWidth="9" />
        <motion.circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, pct)) }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Donut({ parts, children }: { parts: { name: string; pct: number; color: string }[]; children: React.ReactNode }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative size-[112px] shrink-0">
      <svg viewBox="0 0 112 112" className="-rotate-90" aria-hidden>
        {parts.map((p, i) => {
          const len = (p.pct / 100) * c;
          const offset = -acc;
          acc += len;
          return (
            <motion.circle
              key={p.name}
              cx="56"
              cy="56"
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth="13"
              strokeDashoffset={offset}
              initial={{ strokeDasharray: `0 ${c}` }}
              animate={{ strokeDasharray: `${Math.max(0, len - 2)} ${c}` }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.1 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
