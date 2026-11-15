import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const allowed = ["Paid", "Packing", "Shipped", "Delivered"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { status } = (await req.json().catch(() => ({}))) as { status?: string };
  if (!status || !allowed.includes(status)) return Response.json({ error: "Invalid status" }, { status: 400 });
  const rows = await db()`update orders set status = ${status} where id = ${(await params).id} returning id`;
  return Response.json({ updated: rows.length });
}
