"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LiveToast, Sidebar } from "@/components/dashboard";
import { StoreHydrator } from "@/components/store/chrome";
import { useDash } from "@/lib/dashboard";
import { useShop, useUI } from "@/lib/store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useUI((s) => s.hydrated);
  const user = useShop((s) => s.user);
  const myOrders = useShop((s) => s.myOrders);
  const ready = useDash((s) => s.ready);
  const live = useDash((s) => s.live);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/account");
      return;
    }
    useDash.getState().init(myOrders);
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((saved) => Array.isArray(saved) && saved.length && useDash.getState().init(saved))
      .catch(() => {});
  }, [hydrated, user, myOrders, router]);

  // Simulated shoppers: a new order every few seconds while "Live traffic" is on.
  useEffect(() => {
    if (!ready || !live) return;
    let t: ReturnType<typeof setTimeout>;
    const tick = (delay: number) => {
      t = setTimeout(() => {
        useDash.getState().simulate();
        tick(9000 + Math.random() * 6000);
      }, delay);
    };
    tick(4500);
    return () => clearTimeout(t);
  }, [ready, live]);

  return (
    <div className="flex min-h-svh flex-col gap-3 p-2.5 md:flex-row">
      <StoreHydrator />
      <Sidebar />
      <main className="min-w-0 flex-1 px-1 pb-6 pt-3 md:px-1.5">{ready && user ? children : null}</main>
      <LiveToast />
    </div>
  );
}
