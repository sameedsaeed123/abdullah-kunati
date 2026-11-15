// Creates tables and the admin account. Run: npm run db:setup
import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync } from "node:crypto";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Set DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");
const sql = neon(DATABASE_URL);

await sql`create table if not exists admins (
  email text primary key, name text not null, password_hash text not null, created_at timestamptz not null default now())`;
await sql`create table if not exists orders (
  id text primary key, customer text not null, city text not null, street text not null default '',
  items int not null, total numeric(10,2) not null, status text not null default 'Paid',
  delivery text not null default 'standard', payment text not null default 'cod',
  lines jsonb not null default '[]', placed_at timestamptz not null default now())`;

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(ADMIN_PASSWORD, salt, 64).toString("hex");
await sql`insert into admins (email, name, password_hash) values (${ADMIN_EMAIL.toLowerCase()}, 'Store Admin', ${salt + ":" + hash})
  on conflict (email) do update set password_hash = excluded.password_hash`;
console.log("Database ready. Admin account:", ADMIN_EMAIL);
