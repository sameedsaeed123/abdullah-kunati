"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ImageDrop, Label, Notice, PageHead, SlideOver, TonePicker } from "@/components/admin";
import { Spinner } from "@/components/ui";
import { admin, useAdminCatalog } from "@/lib/admin-client";
import { money } from "@/lib/format";
import { toneBg, type Pic, type Product, type Tone } from "@/lib/products";

type Draft = {
  id?: number;
  name: string;
  price: string;
  categorySlug: string;
  subcategory: string;
  badge: string;
  tone: Tone;
  blurb: string;
  pic: Pic | null;
  fit: number;
  finishes: string;
  details: string;
  dimensions: string;
  care: string;
};

const blank = (categorySlug = ""): Draft => ({ name: "", price: "", categorySlug, subcategory: "", badge: "", tone: "sage", blurb: "", pic: null, fit: 0.76, finishes: "", details: "", dimensions: "", care: "" });
const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export default function ProductsPage() {
  const { data, reload } = useAdminCatalog();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<number | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  if (!data) return <p className="p-8 text-[13px] text-muted">Loading products…</p>;
  const cats = data.categories;
  const subs = cats.find((c) => c.slug === draft?.categorySlug)?.children ?? [];

  const edit = (p: Product) => {
    setError("");
    setDraft({
      id: p.id,
      name: p.name,
      price: String(p.price),
      categorySlug: p.categorySlug,
      subcategory: p.subcategory ?? "",
      badge: p.badge ?? "",
      tone: p.tone,
      blurb: p.blurb,
      pic: { src: p.image, w: p.w, h: p.h, blend: p.blend },
      fit: p.fit,
      finishes: p.finishes.map((f) => `${f.name}, ${f.color}`).join("\n"),
      details: p.details.join("\n"),
      dimensions: p.dimensions.join("\n"),
      care: p.care.join("\n"),
    });
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.categorySlug || draft.price === "" || !draft.pic) return setError("Add a name, price, category and picture.");
    setBusy(true);
    setError("");
    try {
      await admin("saveProduct", {
        id: draft.id,
        name: draft.name,
        price: Number(draft.price),
        categorySlug: draft.categorySlug,
        subcategory: draft.subcategory,
        badge: draft.badge,
        tone: draft.tone,
        blurb: draft.blurb,
        image: draft.pic.src,
        w: draft.pic.w,
        h: draft.pic.h,
        blend: draft.pic.blend,
        fit: draft.fit,
        finishes: lines(draft.finishes).map((l) => {
          const [name, color] = l.split(",").map((x) => x.trim());
          return { name, color };
        }),
        details: lines(draft.details),
        dimensions: lines(draft.dimensions),
        care: lines(draft.care),
      });
      await reload();
      setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    setConfirm(null);
    try {
      await admin("deleteProduct", { id });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    }
  };

  return (
    <div>
      <PageHead sub={`${data.products.length} products in ${cats.length} categories`} title="Products">
        <button
          type="button"
          disabled={cats.length === 0}
          onClick={() => {
            setError("");
            setDraft(blank(cats[0]?.slug));
          }}
          className="btn-ink h-10 px-5 text-[13px] disabled:opacity-50"
        >
          <Plus size={15} /> Add product
        </button>
      </PageHead>
      {cats.length === 0 && <p className="card mt-5 !rounded-[22px] p-6 text-[13.5px]">Create a category first, then add products to it.</p>}
      {error && !draft && (
        <p role="alert" className="mt-4 text-[12.5px] text-[#b3402f]">
          {error}
        </p>
      )}

      <ul className="mt-5 grid grid-cols-2 gap-3.5 lg:grid-cols-3 2xl:grid-cols-4">
        {data.products.map((p) => (
          <li key={p.slug} className="card !rounded-[22px] p-2.5">
            <div className={`relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[16px] ${toneBg[p.tone]}`}>
              {p.badge && <span className="absolute left-2.5 top-2.5 rounded-full bg-card/90 px-2 py-0.5 text-[10.5px] font-medium">{p.badge}</span>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className={`max-h-[74%] max-w-[74%] object-contain ${p.blend ? "mix-blend-multiply" : ""}`} />
            </div>
            <div className="flex items-start justify-between gap-2 px-1.5 pb-1 pt-3">
              <div className="min-w-0">
                <p className="truncate text-[11px] text-muted">
                  {p.category}
                  {p.subcategoryName ? ` · ${p.subcategoryName}` : ""}
                </p>
                <p className="truncate text-[13.5px] font-medium">{p.name}</p>
                <p className="text-[13px] font-semibold tabular-nums">{money(p.price)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                {confirm === p.id ? (
                  <>
                    <button type="button" onClick={() => remove(p.id!)} className="h-8 rounded-full bg-[#b3402f] px-3 text-[11.5px] font-medium text-white">
                      Delete
                    </button>
                    <button type="button" onClick={() => setConfirm(null)} className="h-8 rounded-full bg-field px-3 text-[11.5px]">
                      Keep
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" aria-label={`Edit ${p.name}`} onClick={() => edit(p)} className="grid size-8 place-items-center rounded-full bg-field transition hover:bg-ink hover:text-card">
                      <Pencil size={13} />
                    </button>
                    <button type="button" aria-label={`Delete ${p.name}`} onClick={() => setConfirm(p.id!)} className="grid size-8 place-items-center rounded-full bg-field text-muted transition hover:bg-[#b3402f] hover:text-white">
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <SlideOver
        open={!!draft}
        title={draft?.id ? "Edit product" : "Add product"}
        onClose={() => setDraft(null)}
        footer={
          <>
            <Notice error={error} />
            <button type="button" onClick={() => setDraft(null)} className="btn-ghost h-10 px-5 text-[13px]">
              Cancel
            </button>
            <button type="button" onClick={save} disabled={busy} className="btn-ink h-10 px-5 text-[13px] disabled:opacity-60">
              {busy && <Spinner />} {draft?.id ? "Save changes" : "Add product"}
            </button>
          </>
        }
      >
        {draft && (
          <>
            <ImageDrop pic={draft.pic} tone={draft.tone} fit={draft.fit} onPick={(p) => set("pic", p)} />
            <div className="grid grid-cols-[1fr_auto] items-end gap-4">
              <div>
                <Label hint={`${Math.round(draft.fit * 100)}%`} htmlFor="p-fit">
                  Size in tile
                </Label>
                <input id="p-fit" type="range" min={0.4} max={0.95} step={0.01} value={draft.fit} onChange={(e) => set("fit", Number(e.target.value))} className="w-full accent-[#191b16]" />
              </div>
              <div>
                <Label>Tile colour</Label>
                <TonePicker value={draft.tone} onChange={(t) => set("tone", t)} />
              </div>
            </div>
            <div>
              <Label htmlFor="p-name">Name</Label>
              <input id="p-name" className="field" value={draft.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label htmlFor="p-price">Price ($)</Label>
                <input id="p-price" type="number" min={0} step="0.01" inputMode="decimal" className="field" value={draft.price} onChange={(e) => set("price", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="p-badge">Badge</Label>
                <select id="p-badge" className="field" value={draft.badge} onChange={(e) => set("badge", e.target.value)}>
                  {["", "New", "Bestseller", "Low stock", "Sale"].map((b) => (
                    <option key={b} value={b}>
                      {b || "None"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="p-cat">Category</Label>
                <select id="p-cat" className="field" value={draft.categorySlug} onChange={(e) => setDraft({ ...draft, categorySlug: e.target.value, subcategory: "" })}>
                  {cats.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="p-sub">Subcategory</Label>
                <select id="p-sub" className="field disabled:opacity-50" disabled={subs.length === 0} value={draft.subcategory} onChange={(e) => set("subcategory", e.target.value)}>
                  <option value="">{subs.length ? "None" : "No subcategories"}</option>
                  {subs.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="p-blurb">Description</Label>
              <textarea id="p-blurb" rows={3} className="field !h-auto resize-y py-2.5 leading-relaxed" value={draft.blurb} onChange={(e) => set("blurb", e.target.value)} />
            </div>
            <Area id="p-fin" label="Finishes" hint="One per line: Name, #hex" value={draft.finishes} onChange={(v) => set("finishes", v)} placeholder={"Oiled oak, #d2a56b\nSmoked oak, #7a5a3c"} />
            <Area id="p-det" label="Details" hint="One per line" value={draft.details} onChange={(v) => set("details", v)} />
            <Area id="p-dim" label="Dimensions" hint="One per line" value={draft.dimensions} onChange={(v) => set("dimensions", v)} />
            <Area id="p-care" label="Care" hint="One per line" value={draft.care} onChange={(v) => set("care", v)} />
          </>
        )}
      </SlideOver>
    </div>
  );
}

function Area({ id, label, hint, value, onChange, placeholder }: { id: string; label: string; hint: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <textarea id={id} rows={3} placeholder={placeholder} className="field !h-auto resize-y py-2.5 leading-relaxed" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
