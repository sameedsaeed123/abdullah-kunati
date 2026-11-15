"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/admin";
import { Avatar } from "@/components/dashboard";

type Msg = { id: number; name: string; email: string; phone: string; message: string; created_at: string };

export default function MessagesPage() {
  const [rows, setRows] = useState<Msg[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/admin")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status === 401 ? "Your admin session has expired. Sign in again." : "Could not load messages."))))
      .then(setRows)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div>
      <PageHead sub="Sent from the contact page" title="Messages" />
      {error && (
        <p role="alert" className="mt-5 text-[13px] text-[#b3402f]">
          {error}
        </p>
      )}
      {rows?.length === 0 && <p className="card mt-5 !rounded-[22px] p-8 text-center text-[13.5px] text-muted">No messages yet. They’ll appear here as soon as someone writes in.</p>}
      <ul className="mt-5 grid gap-3.5 lg:grid-cols-2">
        {rows?.map((m) => (
          <li key={m.id} className="card !rounded-[22px] p-5">
            <div className="flex items-center gap-3">
              <Avatar name={m.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">{m.name}</p>
                <p className="truncate text-[11.5px] text-muted">
                  <a href={`mailto:${m.email}`} className="hover:text-ink hover:underline">
                    {m.email}
                  </a>
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
              </div>
              <time className="shrink-0 text-[11px] text-muted">{new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</time>
            </div>
            <p className="mt-3.5 whitespace-pre-line text-[13.5px] leading-relaxed text-ink/80">{m.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
