"use client";

import { create } from "zustand";
import { site } from "./site";
import type { Order, OrderStatus } from "./store";

/* Demo data for the dashboard: deterministic history plus a simulated stream of live orders. */

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Day = { date: Date; revenue: number; orders: number };
export type Range = 7 | 30 | 90;

const DAY = 86_400_000;
const HOUR = 3_600_000;

export function buildDays(now: number): Day[] {
  const r = rng(42);
  const days: Day[] = [];
  for (let i = 89; i >= 0; i--) {
    const wave = Math.sin(i / 2.3) * 2.2 + Math.cos(i / 5.1) * 1.6;
    let orders = Math.round(15.5 + wave + (r() - 0.5) * 5);
    if (i === 24) orders = 31; // one big day, like the reference
    if (i === 27) orders = 22;
    const aov = 330 + r() * 70 + (i === 24 ? 20 : 0);
    days.push({ date: new Date(now - i * DAY), orders: Math.max(8, orders), revenue: Math.round(Math.max(8, orders) * aov) });
  }
  return days;
}

const people: [string, string][] = [
  ["Theo Mensah", "Copenhagen"],
  ["Elias Costa", "Copenhagen"],
  ["Hugo Moreau", "Oslo"],
  ["Felix Nakamura", "London"],
  ["Lukas Haddad", "London"],
  ["Elias Rahman", "Berlin"],
  ["Selma Holm", "Toronto"],
  ["Lukas Lindqvist", "Stockholm"],
  ["Ines Duarte", "Lisbon"],
  ["Maja Berg", "Malmö"],
  ["Noor Hassan", "Amsterdam"],
  ["Astrid Lund", "Aarhus"],
  ["Oskar Wren", "Helsinki"],
  ["Clara Voss", "Hamburg"],
  ["Jonas Petit", "Paris"],
  ["Freya Dahl", "Bergen"],
];
const livePeople: [string, string][] = [
  ["Felix Sato", "Copenhagen"],
  ["Mira Solberg", "Oslo"],
  ["Anton Reyes", "Madrid"],
  ["Liv Andersson", "Gothenburg"],
  ["Samir Okafor", "London"],
  ["Elin Brandt", "Berlin"],
  ["Tomas Novak", "Prague"],
  ["Yuki Tanaka", "Stockholm"],
];
const prices = [1280, 241, 640, 112, 206, 249, 890, 189, 420, 96, 318, 1079, 129, 538, 64, 729];

const id = (r: () => number) => `${site.orderPrefix}-${Math.floor(10000 + r() * 89999)}`;

/** 8 paid, 15 packing, 26 shipped and 12 delivered rows are listed; the rest of the delivered pile is a count only. */
export const DELIVERED_ARCHIVE = 2468;

export function buildOrders(now: number): Order[] {
  const r = rng(7);
  const plan: [OrderStatus, number][] = [
    ["Paid", 8],
    ["Packing", 15],
    ["Shipped", 26],
    ["Delivered", 12],
  ];
  const out: Order[] = [];
  let age = 2 * HOUR;
  let n = 0;
  for (const [status, count] of plan) {
    for (let i = 0; i < count; i++) {
      const [customer, city] = people[n % people.length]!;
      out.push({ id: id(r), customer, city, items: 1 + Math.floor(r() * 3), total: prices[(n * 3 + 1) % prices.length]!, status, placedAt: now - age });
      age += (0.5 + r() * 1.6) * HOUR * (status === "Paid" ? 1 : 1.8);
      n++;
    }
  }
  return out;
}

type DashState = {
  ready: boolean;
  days: Day[];
  orders: Order[];
  fresh: string[];
  live: boolean;
  liveRevenue: number;
  liveOrders: number;
  toast: Order | null;
  lastOrderAt: number;
  init: (mine: Order[]) => void;
  setLive: (on: boolean) => void;
  simulate: () => void;
  advance: (id: string) => void;
  hideToast: () => void;
};

const next: Record<OrderStatus, OrderStatus | null> = { Paid: "Packing", Packing: "Shipped", Shipped: "Delivered", Delivered: null };
export const nextStatus = (s: OrderStatus) => next[s];

let liveSeq = 0;

export const useDash = create<DashState>((set, get) => ({
  ready: false,
  days: [],
  orders: [],
  fresh: [],
  live: true,
  liveRevenue: 0,
  liveOrders: 0,
  toast: null,
  lastOrderAt: 0,
  init: (mine) => {
    const now = Date.now();
    const s = get();
    const base = s.ready ? s.orders : buildOrders(now);
    const known = new Set(base.map((o) => o.id));
    const add = mine.filter((o) => !known.has(o.id));
    const orders = [...add, ...base].sort((a, b) => b.placedAt - a.placedAt);
    set({
      ready: true,
      days: s.ready ? s.days : buildDays(now),
      orders,
      liveRevenue: s.liveRevenue + add.reduce((t, o) => t + o.total, 0),
      liveOrders: s.liveOrders + add.length,
      lastOrderAt: orders[0]?.placedAt ?? now,
    });
  },
  setLive: (live) => set({ live }),
  simulate: () => {
    const [customer, city] = livePeople[liveSeq % livePeople.length]!;
    const total = prices[(liveSeq * 5) % prices.length]!;
    liveSeq++;
    const order: Order = {
      id: `${site.orderPrefix}-${Math.floor(10000 + Math.random() * 89999)}`,
      customer,
      city,
      items: 1 + (liveSeq % 3),
      total,
      status: "Paid",
      placedAt: Date.now(),
    };
    set((s) => ({
      orders: [order, ...s.orders],
      fresh: [order.id, ...s.fresh].slice(0, 3),
      liveRevenue: s.liveRevenue + total,
      liveOrders: s.liveOrders + 1,
      toast: order,
      lastOrderAt: order.placedAt,
    }));
  },
  advance: (orderId) => {
    const to = next[get().orders.find((o) => o.id === orderId)?.status ?? "Delivered"];
    // Saved orders are updated in the database; sample rows simply return "updated: 0".
    if (to) void fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: to }) }).catch(() => {});
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId && next[o.status] ? { ...o, status: next[o.status]! } : o)),
    }));
  },
  hideToast: () => set({ toast: null }),
}));

export function statusCounts(orders: Order[]) {
  const c = { All: 0, Paid: 0, Packing: 0, Shipped: 0, Delivered: DELIVERED_ARCHIVE };
  for (const o of orders) c[o.status]++;
  c.All = c.Paid + c.Packing + c.Shipped + c.Delivered;
  return c;
}

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). */
export function smoothPath(pts: [number, number][], tension = 0.18) {
  if (pts.length < 2) return "";
  let d = `M${pts[0]![0].toFixed(1)},${pts[0]![1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) * tension;
    const c1y = p1[1] + (p2[1] - p0[1]) * tension;
    const c2x = p2[0] - (p3[0] - p1[0]) * tension;
    const c2y = p2[1] - (p3[1] - p1[1]) * tension;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
