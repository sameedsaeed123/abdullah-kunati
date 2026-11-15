import { db } from "@/lib/db";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { name?: string; email?: string; phone?: string; message?: string };
  const name = b.name?.trim() ?? "";
  const email = b.email?.trim() ?? "";
  const message = b.message?.trim() ?? "";
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || message.length < 5) return Response.json({ error: "Invalid message" }, { status: 400 });
  await db()`insert into messages (name, email, phone, message) values (${name.slice(0, 120)}, ${email.slice(0, 160)}, ${(b.phone ?? "").trim().slice(0, 40)}, ${message.slice(0, 4000)})`;
  return Response.json({ ok: true });
}
