import { randomBytes } from "node:crypto";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX = 4 * 1024 * 1024;
const types = ["image/png", "image/jpeg", "image/webp", "image/avif"];

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (!types.includes(file.type)) return Response.json({ error: "Use a PNG, JPG, WebP or AVIF image." }, { status: 400 });
  if (file.size > MAX) return Response.json({ error: "Image is larger than 4 MB." }, { status: 400 });
  const id = randomBytes(9).toString("hex");
  await db()`insert into images (id, mime, data) values (${id}, ${file.type}, ${Buffer.from(await file.arrayBuffer()).toString("base64")})`;
  return Response.json({ src: `/api/images/${id}` });
}
