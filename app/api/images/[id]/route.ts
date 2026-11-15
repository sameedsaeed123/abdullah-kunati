import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const rows = await db()`select mime, data from images where id = ${(await params).id}`;
  const img = rows[0];
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(img.data as string, "base64"), {
    headers: { "content-type": img.mime as string, "cache-control": "public, max-age=31536000, immutable" },
  });
}
