"use client";

import { useCallback, useEffect, useState } from "react";
import type { Catalog, Pic } from "./products";

/** Call an admin action. Throws with a readable message on failure. */
export async function admin(action: string, payload: Record<string, unknown> = {}) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
  if (r.status === 401) throw new Error("Your admin session has expired. Sign in again.");
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { error?: string }).error ?? "Something went wrong. Try again.");
}

/** Upload a picture. Measures it and notes whether it sits on a white background. */
export async function uploadImage(file: File): Promise<Pic> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("That file is not an image we can read."));
    i.src = url;
  });
  let blend = false;
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0, 16, 16);
    const corners = [g.getImageData(0, 0, 1, 1), g.getImageData(15, 0, 1, 1), g.getImageData(0, 15, 1, 1), g.getImageData(15, 15, 1, 1)].map((d) => d.data);
    blend = corners.every((d) => d[3]! > 250 && d[0]! > 232 && d[1]! > 232 && d[2]! > 232);
  } catch {
    /* leave blend off */
  }
  URL.revokeObjectURL(url);
  const body = new FormData();
  body.append("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body });
  if (r.status === 401) throw new Error("Your admin session has expired. Sign in again.");
  if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { error?: string }).error ?? "Upload failed. Try again.");
  return { src: ((await r.json()) as { src: string }).src, w: img.naturalWidth, h: img.naturalHeight, blend };
}

export function useAdminCatalog() {
  const [data, setData] = useState<Catalog | null>(null);
  const reload = useCallback(
    () =>
      fetch("/api/catalog", { cache: "no-store" })
        .then((r) => r.json())
        .then((c: Catalog) => setData(c)),
    [],
  );
  useEffect(() => void reload(), [reload]);
  return { data, reload };
}
