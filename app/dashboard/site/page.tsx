"use client";

import { LayoutGroup, motion } from "motion/react";
import { ExternalLink, RotateCcw, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Label, Notice, PageHead } from "@/components/admin";
import { CatalogProvider } from "@/components/catalog";
import { Hero } from "@/components/store/home";
import { Spinner } from "@/components/ui";
import { admin, useAdminCatalog } from "@/lib/admin-client";
import type { Contact, HeroContent } from "@/lib/products";

const CANVAS = 1248;

export default function SiteEditorPage() {
  const { data, reload } = useAdminCatalog();
  const [tab, setTab] = useState<"hero" | "contact">("hero");
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [rev, setRev] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.8);

  useEffect(() => {
    if (data && !dirty) {
      setHero(data.settings.hero);
      setContact(data.settings.contact);
    }
  }, [data, dirty]);

  useEffect(() => {
    if (!frame.current) return;
    const ro = new ResizeObserver(([e]) => setZoom(Math.min(1, e!.contentRect.width / CANVAS)));
    ro.observe(frame.current);
    return () => ro.disconnect();
  }, [tab, hero]);

  if (!data || !hero || !contact) return <p className="p-8 text-[13px] text-muted">Loading the editor…</p>;

  const touch = () => {
    setDirty(true);
    setSaved(false);
  };
  const patchHero = (p: Partial<HeroContent>) => {
    setHero((h) => ({ ...h!, ...p }));
    touch();
  };
  const patchContact = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContact((c) => ({ ...c!, [k]: e.target.value }));
    touch();
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await admin("saveSettings", { key: "hero", value: hero });
      await admin("saveSettings", { key: "contact", value: contact });
      setDirty(false);
      setSaved(true);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };
  const discard = () => {
    setHero(data.settings.hero);
    setContact(data.settings.contact);
    setDirty(false);
    setRev((r) => r + 1);
  };

  return (
    <div>
      <PageHead sub="Click any text to rewrite it. Hover a picture to swap it." title="Site editor">
        <Notice error={error} saved={saved && !dirty} />
        <a href="/" target="_blank" rel="noreferrer" className="btn-ghost h-10 px-4 text-[13px]">
          <ExternalLink size={14} /> View site
        </a>
        <button type="button" onClick={discard} disabled={!dirty || busy} className="btn-ghost h-10 px-4 text-[13px] disabled:opacity-40">
          <RotateCcw size={14} /> Discard
        </button>
        <button type="button" onClick={save} disabled={!dirty || busy} className="btn-ink h-10 px-5 text-[13px] disabled:opacity-40">
          {busy ? <Spinner /> : <Save size={14} />} Publish
        </button>
      </PageHead>

      <LayoutGroup id="site-tabs">
        <div role="tablist" className="mt-4 inline-flex rounded-full bg-card p-1 shadow-card">
          {(
            [
              ["hero", "Home hero"],
              ["contact", "Footer & contact"],
            ] as const
          ).map(([t, label]) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`relative h-[34px] rounded-full px-4 text-[12.5px] transition-colors ${tab === t ? "font-medium text-card" : "text-ink/80 hover:text-ink"}`}
            >
              {tab === t && <motion.span layoutId="site-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      {tab === "hero" ? (
        <div className="mt-4 grid items-start gap-3.5 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="overflow-hidden rounded-[26px] bg-bg p-2 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <div className="flex items-center gap-1.5 px-3 pb-2 pt-1">
              <span className="size-2 rounded-full bg-ink/15" />
              <span className="size-2 rounded-full bg-ink/15" />
              <span className="size-2 rounded-full bg-ink/15" />
              <span className="ml-3 font-mono text-[10px] tracking-[0.12em] text-muted">LIVE PREVIEW · HOME</span>
            </div>
            <div ref={frame}>
              <div key={rev} style={{ width: CANVAS, zoom }}>
                <CatalogProvider catalog={data}>
                  <Hero content={hero} edit={patchHero} />
                </CatalogProvider>
              </div>
            </div>
          </div>

          <aside className="card grid gap-4 !rounded-[22px] p-5 sm:grid-cols-2 2xl:grid-cols-1">
            <div className="sm:col-span-2 2xl:col-span-1">
              <Label htmlFor="h-feat">Featured product</Label>
              <select id="h-feat" className="field" value={hero.featuredSlug} onChange={(e) => patchHero({ featuredSlug: e.target.value, featuredImage: null })}>
                {data.products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
              {hero.featuredImage && (
                <button type="button" onClick={() => patchHero({ featuredImage: null })} className="mt-2 text-[12px] text-ink/70 underline underline-offset-4">
                  Use the product’s own picture
                </button>
              )}
            </div>
            <LinkField id="h-l1" label="Main button goes to" value={hero.cta1Href} onChange={(v) => patchHero({ cta1Href: v })} />
            <LinkField id="h-l2" label="Second button goes to" value={hero.cta2Href} onChange={(v) => patchHero({ cta2Href: v })} />
            <LinkField id="h-l3" label="Yellow card goes to" value={hero.card1Href} onChange={(v) => patchHero({ card1Href: v })} />
            <div>
              <Label htmlFor="h-badge" hint="Up to 30 letters">
                Spinning badge text
              </Label>
              <input id="h-badge" className="field" maxLength={30} value={hero.badgeText} onChange={(e) => patchHero({ badgeText: e.target.value })} />
            </div>
            {hero.card1Image && (
              <button type="button" onClick={() => patchHero({ card1Image: null })} className="text-left text-[12px] text-ink/70 underline underline-offset-4">
                Reset the yellow card picture
              </button>
            )}
            <p className="text-[11.5px] leading-relaxed text-muted sm:col-span-2 2xl:col-span-1">Links can be a page such as /shop, /shop?c=seating or /contact. Nothing changes on the site until you press Publish.</p>
          </aside>
        </div>
      ) : (
        <div className="card mt-4 grid max-w-[860px] gap-x-3 gap-y-4 !rounded-[22px] p-6 sm:grid-cols-2">
          <p className="text-[12.5px] leading-relaxed text-muted sm:col-span-2">
            Anything you fill in appears in the footer, the mobile menu and the contact page. Leave a box empty and it simply isn’t shown.
          </p>
          <div className="sm:col-span-2">
            <Label htmlFor="c-address">Address</Label>
            <textarea id="c-address" rows={3} className="field !h-auto resize-y py-2.5 leading-relaxed" placeholder={"Shop 12, Main Boulevard\nLahore"} value={contact.address} onChange={patchContact("address")} />
          </div>
          <Input id="c-phone" label="Phone" placeholder="+92 300 0000000" value={contact.phone} onChange={patchContact("phone")} />
          <Input id="c-email" label="Email" placeholder="hello@yourstore.com" value={contact.email} onChange={patchContact("email")} />
          <Input id="c-whatsapp" label="WhatsApp number" placeholder="+92 300 0000000" value={contact.whatsapp} onChange={patchContact("whatsapp")} />
          <Input id="c-hours" label="Opening hours" placeholder="Mon–Sat, 10am–8pm" value={contact.hours} onChange={patchContact("hours")} />
          <Input id="c-instagram" label="Instagram" placeholder="@yourstore or full link" value={contact.instagram} onChange={patchContact("instagram")} />
          <Input id="c-facebook" label="Facebook" placeholder="page name or full link" value={contact.facebook} onChange={patchContact("facebook")} />
          <Input id="c-tiktok" label="TikTok" placeholder="@yourstore or full link" value={contact.tiktok} onChange={patchContact("tiktok")} />
        </div>
      )}
    </div>
  );
}

function Input({ id, label, ...rest }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} className="field" {...rest} />
    </div>
  );
}

function LinkField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} className="field font-mono !text-[12px]" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
