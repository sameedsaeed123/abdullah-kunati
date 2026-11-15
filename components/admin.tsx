"use client";

import { AnimatePresence, motion } from "motion/react";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui";
import { uploadImage } from "@/lib/admin-client";
import { toneBg, tones, type Pic, type Tone } from "@/lib/products";

export function PageHead({ sub, title, children }: { sub: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[12px] text-muted">{sub}</p>
        <h1 className="display mt-1.5 text-[clamp(30px,3.1vw,40px)]">{title}</h1>
      </div>
      <div className="flex items-center gap-2.5">{children}</div>
    </header>
  );
}

export function Label({ children, hint, htmlFor }: { children: React.ReactNode; hint?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-3 text-[12px] font-medium">
      {children}
      {hint && <span className="font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function TonePicker({ value, onChange }: { value: Tone; onChange: (t: Tone) => void }) {
  return (
    <div role="radiogroup" aria-label="Tile colour" className="flex gap-2">
      {tones.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={value === t}
          aria-label={t}
          onClick={() => onChange(t)}
          className={`size-8 rounded-full ${toneBg[t]} transition ${value === t ? "ring-2 ring-ink ring-offset-2 ring-offset-card" : "shadow-[inset_0_0_0_1px_rgba(25,27,22,0.12)] hover:scale-110"}`}
        />
      ))}
    </div>
  );
}

export function ImageDrop({ pic, tone, onPick, fit = 0.76 }: { pic: Pic | null; tone: Tone; onPick: (p: Pic) => void; fit?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const take = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onPick(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void take(e.dataTransfer.files[0]);
        }}
        className={`group relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-[20px] ${toneBg[tone]}`}
      >
        {pic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pic.src} alt="" className={`object-contain ${pic.blend ? "mix-blend-multiply" : ""}`} style={{ maxHeight: `${fit * 100}%`, maxWidth: `${fit * 100}%` }} />
        ) : null}
        <span
          className={`absolute flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-[12px] font-medium text-card shadow-float transition ${pic ? "bottom-3 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" : ""}`}
        >
          {busy ? <Spinner size={12} /> : <ImagePlus size={14} />} {pic ? "Change picture" : "Upload picture"}
        </span>
      </button>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="sr-only" onChange={(e) => (void take(e.target.files?.[0]), (e.target.value = ""))} />
      <p className={`mt-1.5 text-[11.5px] ${error ? "text-[#b3402f]" : "text-muted"}`} role={error ? "alert" : undefined}>
        {error || "PNG with a transparent background looks best. White-background photos are blended in automatically. Max 4 MB."}
      </p>
    </div>
  );
}

/** Right-hand panel used for add/edit forms. */
export function SlideOver({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div className="absolute inset-0 bg-[#55564c]/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: "106%" }}
            animate={{ x: 0 }}
            exit={{ x: "106%", transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: "spring", stiffness: 330, damping: 34 }}
            className="absolute bottom-2 right-2 top-2 flex w-[460px] max-w-[calc(100vw-16px)] flex-col rounded-[26px] bg-card shadow-float"
          >
            <div className="flex items-center justify-between px-6 pb-3 pt-5">
              <h2 className="display text-[24px]">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-field transition hover:rotate-90">
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">{children}</div>
            <div className="flex items-center justify-end gap-2.5 border-t border-line px-6 py-4">{footer}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Notice({ error, saved }: { error?: string; saved?: boolean }) {
  if (error)
    return (
      <p role="alert" className="mr-auto text-[12.5px] text-[#b3402f]">
        {error}
      </p>
    );
  if (saved) return <p className="mr-auto text-[12.5px] text-leaf">Saved. It’s live on the site.</p>;
  return null;
}
