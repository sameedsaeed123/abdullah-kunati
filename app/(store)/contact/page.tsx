"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { useCatalog } from "@/components/catalog";
import { ProductObject } from "@/components/store/product";
import { EASE, MaskText, Spinner } from "@/components/ui";

export default function ContactPage() {
  const { settings, products } = useCatalog();
  const c = settings.contact;
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Tell us your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.message.trim().length < 5) next.message = "Write a short message.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) return void document.getElementById(`c-${first}`)?.focus();
    setState("sending");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      setState(r.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  };

  const tel = c.phone.replace(/[^+\d]/g, "");
  const wa = c.whatsapp.replace(/\D/g, "");
  const tiles = [
    c.address && { tone: "bg-sage", icon: MapPin, label: "Visit", value: c.address, href: `https://maps.google.com/?q=${encodeURIComponent(c.address)}`, cta: "Get directions" },
    c.phone && { tone: "bg-butter", icon: Phone, label: "Call", value: c.phone, href: `tel:${tel}`, cta: "Call now" },
    c.email && { tone: "bg-sky", icon: Mail, label: "Write", value: c.email, href: `mailto:${c.email}`, cta: "Send an email" },
    c.whatsapp && { tone: "bg-blush", icon: MessageCircle, label: "WhatsApp", value: c.whatsapp, href: `https://wa.me/${wa}`, cta: "Start a chat" },
    c.hours && { tone: "bg-sand", icon: Clock, label: "Hours", value: c.hours, href: "", cta: "" },
  ].filter(Boolean) as { tone: string; icon: typeof MapPin; label: string; value: string; href: string; cta: string }[];
  const piece = products[0];

  return (
    <div className="grid items-start gap-3.5 pt-3 lg:grid-cols-[1.25fr_1fr]">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="card p-6 sm:p-9">
        <p className="eyebrow">Contact</p>
        <MaskText as="h1" lines={["Let’s talk about", "your space."]} className="display mt-3 text-[clamp(38px,5.2vw,76px)]" />
        <p className="mt-5 max-w-[420px] text-[14px] leading-relaxed text-ink/70">
          Questions about a piece, a custom order or delivery? Send a note and we’ll get back to you within one working day.
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {state === "sent" ? (
            <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-9 rounded-[22px] bg-field p-7">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.15, 1] }}
                transition={{ duration: 0.5, ease: EASE }}
                className="grid size-12 place-items-center rounded-full bg-leaf text-white"
              >
                <Check size={22} strokeWidth={3} />
              </motion.span>
              <p className="display mt-5 text-[28px]">Message sent.</p>
              <p className="mt-2 text-[13.5px] text-ink/70">Thanks, {form.name.split(" ")[0]}. We’ll reply to {form.email} soon.</p>
              <button
                type="button"
                onClick={() => {
                  setForm({ name: "", email: "", phone: "", message: "" });
                  setState("idle");
                }}
                className="btn-ghost mt-5 h-10 px-5 text-[13px]"
              >
                Send another
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -8 }} className="mt-9 grid gap-x-2.5 gap-y-3.5 sm:grid-cols-2">
              <Field id="c-name" label="Full name" error={errors.name}>
                <input id="c-name" className="field !h-[46px]" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!errors.name} />
              </Field>
              <Field id="c-email" label="Email" error={errors.email}>
                <input id="c-email" type="email" className="field !h-[46px]" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} />
              </Field>
              <div className="sm:col-span-2">
                <Field id="c-phone" label="Phone (optional)">
                  <input id="c-phone" type="tel" className="field !h-[46px]" autoComplete="tel" value={form.phone} onChange={set("phone")} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field id="c-message" label="How can we help?" error={errors.message}>
                  <textarea id="c-message" rows={5} className="field !h-auto resize-y py-3 leading-relaxed" value={form.message} onChange={set("message")} aria-invalid={!!errors.message} />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <button type="submit" disabled={state === "sending"} className="btn-ink h-[46px] px-7 text-[13.5px] disabled:opacity-60">
                  {state === "sending" ? <Spinner /> : null} Send message <ArrowRight size={14} />
                </button>
                {state === "failed" && (
                  <p role="alert" className="text-[12.5px] text-[#b3402f]">
                    We couldn’t send that. Check your connection and try again.
                  </p>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.section>

      <div className="grid gap-3.5 sm:grid-cols-2">
        {tiles.map((t, i) => {
          const Tag = t.href ? "a" : "div";
          return (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.07 }}
              className={tiles.length % 2 === 1 && i === 0 ? "sm:col-span-2" : ""}
            >
              <Tag
                {...(t.href ? { href: t.href, target: t.href.startsWith("http") ? "_blank" : undefined, rel: "noreferrer" } : {})}
                className={`group flex h-full min-h-[170px] flex-col justify-between rounded-[24px] p-5 ${t.tone}`}
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-9 place-items-center rounded-full bg-card/70">
                    <t.icon size={15} />
                  </span>
                  {t.href && (
                    <span className="grid size-8 place-items-center rounded-full bg-card/60 transition-all duration-300 group-hover:bg-ink group-hover:text-card">
                      <ArrowUpRight size={14} />
                    </span>
                  )}
                </div>
                <div>
                  <p className="eyebrow">{t.label}</p>
                  <p className="mt-1.5 whitespace-pre-line break-words text-[16px] font-medium leading-snug tracking-[-0.01em]">{t.value}</p>
                  {t.cta && <p className="mt-2 text-[12px] text-ink/65">{t.cta}</p>}
                </div>
              </Tag>
            </motion.div>
          );
        })}
        {piece && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            className={`group relative min-h-[260px] overflow-hidden rounded-[24px] bg-stone sm:col-span-2 ${tiles.length === 0 ? "lg:min-h-[520px]" : ""}`}
          >
            <p className="eyebrow absolute left-5 top-5">Made slowly, on purpose</p>
            <div className="absolute inset-0 animate-bob">
              <ProductObject p={piece} fit={0.6} sizes="40vw" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[11.5px] text-[#b3402f]">
          {error}
        </p>
      )}
    </div>
  );
}
