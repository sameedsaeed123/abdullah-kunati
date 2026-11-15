"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Label, PageHead, TonePicker } from "@/components/admin";
import { admin, useAdminCatalog } from "@/lib/admin-client";
import { toneBg, type CategoryNode, type Tone } from "@/lib/products";

export default function CategoriesPage() {
  const { data, reload } = useAdminCatalog();
  const [name, setName] = useState("");
  const [tone, setTone] = useState<Tone>("sage");
  const [error, setError] = useState("");

  const run = async (action: string, payload: Record<string, unknown>) => {
    setError("");
    try {
      await admin(action, payload);
      await reload();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      return false;
    }
  };

  if (!data) return <p className="p-8 text-[13px] text-muted">Loading categories…</p>;

  return (
    <div>
      <PageHead sub="Categories shape the menu. A category with subcategories becomes a hover dropdown." title="Categories" />

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (name.trim() && (await run("saveCategory", { name, tone }))) setName("");
        }}
        className="card mt-5 flex flex-wrap items-end gap-4 !rounded-[22px] p-5"
      >
        <div className="min-w-[220px] flex-1">
          <Label htmlFor="new-cat">New category</Label>
          <input id="new-cat" className="field" placeholder="e.g. Bedroom" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Tile colour</Label>
          <TonePicker value={tone} onChange={setTone} />
        </div>
        <button type="submit" className="btn-ink h-[42px] px-5 text-[13px]">
          <Plus size={15} /> Add category
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-[12.5px] text-[#b3402f]">
          {error}
        </p>
      )}

      <ul className="mt-3.5 grid gap-3.5 lg:grid-cols-2">
        {data.categories.map((c) => (
          <CategoryCard key={c.id} c={c} count={data.products.filter((p) => p.categorySlug === c.slug).length} run={run} />
        ))}
      </ul>
    </div>
  );
}

function CategoryCard({ c, count, run }: { c: CategoryNode; count: number; run: (a: string, p: Record<string, unknown>) => Promise<boolean> }) {
  const [name, setName] = useState(c.name);
  const [sub, setSub] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [confirm, setConfirm] = useState(false);
  const save = (patch: Partial<{ name: string; tone: Tone; inNav: boolean }>) => run("saveCategory", { id: c.id, name: c.name, description: c.description, tone: c.tone, inNav: c.inNav, ...patch });

  return (
    <li className="card !rounded-[22px] p-5">
      <div className="flex items-center gap-3">
        <span className={`size-10 shrink-0 rounded-xl ${toneBg[c.tone]}`} />
        <input
          aria-label="Category name"
          className="min-w-0 flex-1 rounded-lg bg-transparent px-1 text-[18px] font-medium tracking-[-0.02em] outline-none focus:bg-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== c.name && save({ name })}
        />
        <span className="shrink-0 text-[12px] text-muted">
          {count} {count === 1 ? "product" : "products"}
        </span>
        {confirm ? (
          <>
            <button type="button" onClick={() => (setConfirm(false), run("deleteCategory", { id: c.id }))} className="h-8 rounded-full bg-[#b3402f] px-3 text-[11.5px] font-medium text-white">
              Delete
            </button>
            <button type="button" onClick={() => setConfirm(false)} className="h-8 rounded-full bg-field px-3 text-[11.5px]">
              Keep
            </button>
          </>
        ) : (
          <button type="button" aria-label={`Delete ${c.name}`} onClick={() => setConfirm(true)} className="grid size-8 shrink-0 place-items-center rounded-full bg-field text-muted transition hover:bg-[#b3402f] hover:text-white">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <TonePicker value={c.tone} onChange={(t) => save({ tone: t })} />
        <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px]">
          Show in menu
          <button
            type="button"
            role="switch"
            aria-checked={c.inNav}
            onClick={() => save({ inNav: !c.inNav })}
            className={`flex h-[22px] w-[38px] items-center rounded-full p-[3px] transition-colors ${c.inNav ? "justify-end bg-leaf" : "justify-start bg-ink/20"}`}
          >
            <span className="size-4 rounded-full bg-white shadow" />
          </button>
        </label>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="eyebrow">Subcategories</p>
        {c.children.length > 0 ? (
          <ul className="mt-2.5 space-y-1.5">
            {c.children.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl bg-field px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{s.name}</p>
                  {s.description && <p className="truncate text-[11.5px] text-muted">{s.description}</p>}
                </div>
                <button type="button" aria-label={`Remove ${s.name}`} onClick={() => run("deleteCategory", { id: s.id })} className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-ink/10 hover:text-ink">
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[12.5px] text-muted">None yet. Add one and “{c.name}” turns into a dropdown in the menu.</p>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (sub.trim() && (await run("saveCategory", { name: sub, description: subDesc, parentId: c.id }))) {
              setSub("");
              setSubDesc("");
            }
          }}
          className="mt-3 grid gap-2 sm:grid-cols-[1fr_1.3fr_auto]"
        >
          <input aria-label="Subcategory name" className="field !h-10" placeholder="Name" value={sub} onChange={(e) => setSub(e.target.value)} />
          <input aria-label="Short description" className="field !h-10" placeholder="Short description (optional)" value={subDesc} onChange={(e) => setSubDesc(e.target.value)} />
          <button type="submit" className="btn-ghost h-10 px-4 text-[12.5px]">
            <Plus size={14} /> Add
          </button>
        </form>
      </div>
    </li>
  );
}
