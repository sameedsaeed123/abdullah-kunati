import { endSession, startSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) return Response.json({ error: "Missing credentials" }, { status: 400 });
  const rows = await db()`select email, name, password_hash from admins where email = ${email.toLowerCase()}`;
  const admin = rows[0];
  if (!admin || !verifyPassword(password, admin.password_hash as string)) return Response.json({ error: "Invalid credentials" }, { status: 401 });
  await startSession(admin.email as string);
  return Response.json({ name: admin.name, email: admin.email });
}

export async function DELETE() {
  await endSession();
  return Response.json({ ok: true });
}
