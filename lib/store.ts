"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { bySlug } from "./products";
import { site } from "./site";

export type Line = { key: string; slug: string; finish?: string; qty: number };
export type User = { name: string; email: string; admin?: boolean };
export type OrderStatus = "Paid" | "Packing" | "Shipped" | "Delivered";
export type Order = {
  id: string;
  customer: string;
  city: string;
  items: number;
  total: number;
  status: OrderStatus;
  placedAt: number;
};

type ShopState = {
  lines: Line[];
  user: User | null;
  myOrders: Order[];
  lastOrder: Order | null;
  add: (slug: string, finish?: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  signIn: (user: User) => void;
  signOut: () => void;
  placeOrder: (order: Order) => void;
};

/** Persisted to localStorage. Rehydrated after mount (see StoreHydrator) so SSR markup always matches. */
export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      lines: [],
      user: null,
      myOrders: [],
      lastOrder: null,
      add: (slug, finish, qty = 1) =>
        set((s) => {
          const key = finish ? `${slug}::${finish}` : slug;
          const found = s.lines.find((l) => l.key === key);
          return {
            lines: found
              ? s.lines.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
              : [...s.lines, { key, slug, finish, qty }],
          };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => l.key !== key) : s.lines.map((l) => (l.key === key ? { ...l, qty } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      placeOrder: (order) => set((s) => ({ myOrders: [order, ...s.myOrders].slice(0, 20), lastOrder: order, lines: [] })),
    }),
    { name: "shop-v1", skipHydration: true },
  ),
);

export function totals(lines: Line[]) {
  let subtotal = 0;
  let count = 0;
  for (const l of lines) {
    const p = bySlug(l.slug);
    if (!p) continue;
    subtotal += p.price * l.qty;
    count += l.qty;
  }
  const shipping = subtotal === 0 || subtotal >= site.freeDeliveryOver ? 0 : site.standardShipping;
  return { subtotal, count, shipping };
}

/* ---------- transient UI state (drawer, toast, fly-to-bag) ---------- */

export type Flight = {
  id: number;
  src: string;
  from: { x: number; y: number; w: number; h: number };
  onLand: () => void;
};

type UIState = {
  hydrated: boolean;
  drawerOpen: boolean;
  toast: { id: number; text: string } | null;
  flights: Flight[];
  bagPulse: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  showToast: (text: string) => void;
  hideToast: () => void;
  launch: (f: Omit<Flight, "id">) => void;
  land: (id: number) => void;
};

let seq = 1;

export const useUI = create<UIState>((set, get) => ({
  hydrated: false,
  drawerOpen: false,
  toast: null,
  flights: [],
  bagPulse: 0,
  openDrawer: () => set({ drawerOpen: true, toast: null }),
  closeDrawer: () => set({ drawerOpen: false }),
  showToast: (text) => set({ toast: { id: seq++, text } }),
  hideToast: () => set({ toast: null }),
  launch: (f) => set((s) => ({ flights: [...s.flights, { ...f, id: seq++ }] })),
  land: (id) => {
    const f = get().flights.find((x) => x.id === id);
    set((s) => ({ flights: s.flights.filter((x) => x.id !== id), bagPulse: s.bagPulse + 1 }));
    f?.onLand();
  },
}));

/**
 * Add to bag with the fly-to-bag animation: a copy of the product image lifts off
 * from `el`, arcs up to the bag button, and only then the count and toast update.
 */
export function addToBag(opts: { slug: string; finish?: string; qty?: number; el?: Element | null }) {
  const p = bySlug(opts.slug);
  if (!p) return;
  const commit = () => {
    useShop.getState().add(opts.slug, opts.finish, opts.qty ?? 1);
    useUI.getState().showToast(`${p.name} added to your bag`);
  };
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const r = opts.el?.getBoundingClientRect();
  if (!r || reduce || r.width === 0) {
    commit();
    useUI.setState((s) => ({ bagPulse: s.bagPulse + 1 }));
    return;
  }
  useUI.getState().launch({ src: p.image, from: { x: r.left, y: r.top, w: r.width, h: r.height }, onLand: commit });
}

export function newOrderId() {
  return `${site.orderPrefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}
