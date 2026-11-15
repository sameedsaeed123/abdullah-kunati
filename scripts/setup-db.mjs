// Creates tables, the admin account and (on first run) the starter catalog. Run: npm run db:setup
import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync } from "node:crypto";
import { seedCategories, seedProducts } from "../lib/seed.ts";

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
await sql`create table if not exists categories (
  id serial primary key, slug text unique not null, name text not null,
  parent_id int references categories(id) on delete cascade, description text not null default '',
  tone text not null default 'sage', in_nav boolean not null default true, sort int not null default 0)`;
await sql`create table if not exists products (
  id serial primary key, slug text unique not null, name text not null, category text not null, subcategory text,
  price numeric(10,2) not null, rating numeric(2,1) not null default 4.8, reviews int not null default 0,
  tone text not null default 'sage', badge text, image text not null, w int not null, h int not null,
  fit real not null default 0.76, hang boolean not null default false, blend boolean not null default false,
  blurb text not null default '', finishes jsonb not null default '[]', details jsonb not null default '[]',
  dimensions jsonb not null default '[]', care jsonb not null default '[]', sort int not null default 0,
  created_at timestamptz not null default now())`;
await sql`create table if not exists images (id text primary key, mime text not null, data text not null, created_at timestamptz not null default now())`;
await sql`create table if not exists settings (key text primary key, value jsonb not null)`;
await sql`create table if not exists messages (
  id serial primary key, name text not null, email text not null, phone text not null default '',
  message text not null, created_at timestamptz not null default now())`;

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(ADMIN_PASSWORD, salt, 64).toString("hex");
await sql`insert into admins (email, name, password_hash) values (${ADMIN_EMAIL.toLowerCase()}, 'Store Admin', ${salt + ":" + hash})
  on conflict (email) do update set password_hash = excluded.password_hash`;

const [{ n }] = await sql`select count(*)::int as n from categories`;
if (n === 0) {
  let i = 0;
  for (const c of seedCategories)
    await sql`insert into categories (slug, name, tone, in_nav, sort) values (${c.name.toLowerCase()}, ${c.name}, ${c.tone}, ${c.name !== "Tables"}, ${i++})`;
  i = 0;
  for (const p of seedProducts)
    await sql`insert into products (slug, name, category, price, rating, reviews, tone, badge, image, w, h, fit, hang, blurb, finishes, details, dimensions, care, sort)
      values (${p.slug}, ${p.name}, ${p.category.toLowerCase()}, ${p.price}, ${p.rating}, ${p.reviews}, ${p.tone}, ${p.badge ?? null}, ${p.image}, ${p.w}, ${p.h},
              ${p.fit}, ${!!p.hang}, ${p.blurb}, ${JSON.stringify(p.finishes)}::jsonb, ${JSON.stringify(p.details)}::jsonb,
              ${JSON.stringify(p.dimensions)}::jsonb, ${JSON.stringify(p.care)}::jsonb, ${i++})`;
  console.log(`Seeded ${seedCategories.length} categories and ${seedProducts.length} products.`);
}
console.log("Database ready. Admin account:", ADMIN_EMAIL);
