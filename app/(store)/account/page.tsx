"use client";

import { LayoutGroup, motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, LayoutGrid, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EASE, Logo, MaskText, Spinner } from "@/components/ui";
import { ProductObject } from "@/components/store/product";
import { bySlug, toneBg } from "@/lib/products";
import { site } from "@/lib/site";
import { useShop } from "@/lib/store";

const mosaic = ["linne-table-lamp", "dyn-vase", "bolle-lounge-chair", "rand-wool-throw"];

export default function AccountPage() {
  const router = useRouter();
  const user = useShop((s) => s.user);
  const signIn = useShop((s) => s.signIn);
  const signOut = useShop((s) => s.signOut);
  const hasBag = useShop((s) => s.lines.length > 0);

  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState<null | "form" | "demo">(null);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const finish = (u: { name: string; email: string; admin?: boolean }) => {
    signIn(u);
    router.push(hasBag ? "/checkout" : u.admin ? "/dashboard" : "/");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (mode === "up" && name.trim().length < 2) next.name = "Tell us your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy("form");
    const local = () => finish({ name: mode === "up" ? name.trim() : email.split("@")[0]!.replace(/[._-]+/g, " "), email });
    if (mode === "up") return void setTimeout(local, 700);
    // Admin accounts live in the database; anyone else gets a browser-only customer session.
    fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) })
      .then(async (r) => (r.ok ? finish({ ...((await r.json()) as { name: string; email: string }), admin: true }) : local()))
      .catch(local);
  };

  const demo = () => {
    setBusy("demo");
    setTimeout(() => finish({ name: "Demo Admin", email: `demo@${site.domain}`, admin: true }), 1000);
  };

  return (
    <div className="grid gap-3.5 pt-3 lg:min-h-[calc(100svh-104px)] lg:grid-cols-[minmax(0,512px)_1fr]">
      <motion.section
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="card grid place-items-center px-6 py-14"
      >
        <div className="w-full max-w-[320px]">
          {user ? (
            <>
              <p className="eyebrow">Signed in</p>
              <MaskText as="h1" lines={[`Hi, ${user.name.split(" ")[0]}`]} className="display mt-3 text-[44px]" />
              <p className="mt-3 text-[13px] text-muted">{user.email}</p>
              <Link href="/dashboard" className="btn-ink mt-7 h-[42px] w-full text-[13px]">
                <LayoutGrid size={14} /> Open dashboard
              </Link>
              <button type="button" onClick={signOut} className="btn-ghost mt-2.5 h-[42px] w-full text-[13px]">
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <>
              <p className="eyebrow">{mode === "in" ? "Welcome back" : "New here"}</p>
              <MaskText key={mode} as="h1" lines={[mode === "in" ? "Sign in" : "Create account"]} className="display mt-3 text-[44px]" />

              <LayoutGroup id="auth">
                <div role="tablist" className="mt-6 grid grid-cols-2 rounded-full bg-field p-1">
                  {(
                    [
                      ["in", "Sign in"],
                      ["up", "Create account"],
                    ] as const
                  ).map(([m, label]) => (
                    <button
                      key={m}
                      role="tab"
                      type="button"
                      aria-selected={mode === m}
                      onClick={() => {
                        setMode(m);
                        setErrors({});
                      }}
                      className={`relative h-[34px] rounded-full text-[13px] transition-colors ${mode === m ? "font-medium text-ink" : "text-ink/70 hover:text-ink"}`}
                    >
                      {mode === m && (
                        <motion.span layoutId="auth-pill" className="absolute inset-0 rounded-full bg-card shadow-card" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                      )}
                      <span className="relative">{label}</span>
                    </button>
                  ))}
                </div>
              </LayoutGroup>

              <form onSubmit={submit} noValidate className="mt-5 space-y-2.5">
                {mode === "up" && (
                  <Field id="name" label="Full name" error={errors.name}>
                    <input id="name" className="field !h-[46px]" placeholder="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
                  </Field>
                )}
                <Field id="email" label="Email" error={errors.email}>
                  <input id="email" type="email" className="field !h-[46px]" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
                </Field>
                <Field id="password" label="Password" error={errors.password}>
                  <div className="relative">
                    <input
                      id="password"
                      type={show ? "text" : "password"}
                      className="field !h-[46px] pr-11"
                      placeholder="Password"
                      autoComplete={mode === "in" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink/70 hover:text-ink"
                    >
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
                <button type="submit" disabled={!!busy} className="btn-ink !mt-3 h-[42px] w-full text-[13px] disabled:opacity-60">
                  {busy === "form" ? <Spinner /> : null}
                  {mode === "in" ? "Sign in" : "Create account"} <ArrowRight size={14} />
                </button>
              </form>

              <div className="my-5 flex items-center gap-3 text-[11px] text-muted">
                <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
              </div>

              <button type="button" onClick={demo} disabled={!!busy} className="btn-ghost h-[42px] w-full text-[13px] disabled:opacity-70">
                {busy === "demo" ? <Spinner /> : <LayoutGrid size={14} />} Continue as demo admin
              </button>
              <p className="mx-auto mt-3.5 max-w-[300px] text-center text-[11px] leading-relaxed text-muted">
                Store admins sign in with their email and password. The demo button shows the dashboard with sample data.
              </p>
            </>
          )}
        </div>
      </motion.section>

      <section aria-hidden className="relative hidden grid-cols-2 grid-rows-[0.8fr_1fr] gap-3.5 lg:grid">
        {mosaic.map((slug, i) => {
          const p = bySlug(slug)!;
          return (
            <motion.div
              key={slug}
              initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.09 }}
              className={`group relative overflow-hidden rounded-[28px] ${toneBg[p.tone]}`}
            >
              <div className="absolute inset-0 animate-bob" style={{ animationDelay: `${-i * 1.4}s` }}>
                <ProductObject p={p} fit={0.62} sizes="30vw" />
              </div>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
          className="absolute bottom-6 left-1/2 w-[350px] -translate-x-1/2"
        >
          <div className="animate-bob rounded-[22px] bg-card/85 p-4 shadow-float backdrop-blur-md">
            <Logo small />
            <p className="mt-2.5 text-[13px] leading-relaxed text-ink/75">Track orders, save your favourites and check out in seconds.</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 px-1 text-[11.5px] text-[#b3402f]">
          {error}
        </p>
      )}
    </div>
  );
}
