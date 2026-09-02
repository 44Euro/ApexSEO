# Apex Notes

บล็อก Formula 1 เชิงลึกพร้อม CMS สำหรับผู้ดูแลคนเดียว — สร้างเพื่อพิสูจน์การทำ SEO บน Next.js App Router ที่ทำงานได้จริง ไม่ใช่แค่ใส่ meta tag แล้วจบ

**Demo admin:** `admin@apexnotes.dev` / `demo1234`

---

## ทำอะไรได้บ้าง

**ฝั่งผู้อ่าน** — หน้าแรก, รายการบทความพร้อม pagination, หน้าบทความ, หน้าหมวดหมู่, ค้นหา

**ฝั่งแอดมิน** — ล็อกอิน, CRUD บทความพร้อม markdown editor ที่มี SEO panel เรียลไทม์, จัดการหมวดหมู่, preview บทความ draft

## Stack

Next.js 15 (App Router) · TypeScript · Prisma 6 · PostgreSQL (Neon) · NextAuth v5 · Tailwind CSS v4

## SEO ที่ทำไว้

| เรื่อง | รายละเอียด |
|---|---|
| Metadata | `generateMetadata` ทุกหน้า — `metaTitle ?? title`, `metaDescription ?? excerpt`, canonical ของตัวเอง, Open Graph `type=article` พร้อม `publishedTime`/`modifiedTime`, Twitter `summary_large_image` |
| OG image | ใช้ `coverImageUrl` ถ้ามี ถ้าไม่มี fallback ไปที่ OG image ของเว็บที่ generate ด้วย `next/og` |
| Structured data | `BlogPosting` + `BreadcrumbList` บนหน้าบทความ · `WebSite` + `SearchAction` บนหน้าแรก · `CollectionPage` บนหน้าหมวด |
| Rendering | หน้าบทความเป็น SSG (`generateStaticParams`) · หน้าแรกกับหน้าหมวดเป็น ISR 1 ชั่วโมง · หน้าค้นหาเป็น SSR + `noindex` |
| On-demand revalidation | ตอน publish/แก้/ลบ server action เรียก `revalidatePath` ที่ `/blog/[slug]`, `/blog`, `/`, `/category/[slug]`, `/sitemap.xml` และ `/rss.xml` — หน้า public อัปเดตทันทีโดยไม่ต้อง redeploy |
| Sitemap / robots | `app/sitemap.ts` ดึงเฉพาะบทความ `PUBLISHED` พร้อม `lastModified` จาก `updatedAt` · `robots.txt` บล็อก `/admin` และ `/search` |
| Thin content | คำอธิบายหมวดเขียนแยกต่อหมวด เก็บใน DB ไม่ใช่ template ซ้ำ |
| SEO panel | ตัวนับ, Google SERP preview, OG card preview และ checklist ก่อน publish คำนวณจาก `lib/seo-panel.ts` ตัวเดียวกับที่ `generateMetadata` ใช้ — ที่เห็นในหน้า editor คือสิ่งที่ออกจริง |

reading time นับคำภาษาไทยด้วย `Intl.Segmenter` ไม่ใช่การ split ช่องว่าง เพราะภาษาไทยไม่เว้นวรรคระหว่างคำ (`lib/reading-time.ts`)

## รันบนเครื่อง

ต้องมี Node 20+ และ PostgreSQL สักตัว (แนะนำ [Neon](https://neon.tech) free tier)

```bash
npm install
cp .env.example .env      # แล้วใส่ DATABASE_URL กับ AUTH_SECRET
npm run db:migrate
npm run db:seed           # 4 หมวด, 8 บทความ, admin 1 คน
npm run dev
```

`AUTH_SECRET` generate ด้วย `openssl rand -base64 32`

## ทดสอบ

```bash
npm test          # unit test ของ SEO logic
npm run build     # typecheck + build
npm run test:e2e  # ต้อง npm run build แล้ว ./e2e/serve.sh ก่อน
```

`npm run test:e2e` ครอบคลุมการ์ด `/admin`, flow ล็อกอิน, filter, confirm dialog, SEO panel แบบเรียลไทม์, การตรวจค่าสีและระยะเทียบ design token และที่สำคัญที่สุดคือพิสูจน์ว่า publish แล้วหน้า public กับ sitemap อัปเดตทันทีบน production build จริง

## Deploy

1. **Neon** — สร้าง project แล้วคัดลอก connection string แบบ pooled
2. **Vercel** — import repo แล้วตั้ง environment variables:
   - `DATABASE_URL` — connection string จาก Neon
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `NEXT_PUBLIC_SITE_URL` — โดเมนจริง เช่น `https://apexnotes.vercel.app`
3. ตั้ง Build Command เป็น `prisma generate && next build`
4. หลัง deploy ครั้งแรก รัน `npm run db:deploy` และ `npm run db:seed` โดยชี้ `DATABASE_URL` ไปที่ Neon

ถ้า Neon อยู่ region Singapore ให้ตั้ง Vercel function region เป็น `sin1` เพื่อให้ app กับ DB อยู่โซนเดียวกัน

## โครงสร้าง

```
app/
  (public)/          หน้าแรก, /blog, /blog/[slug], /category/[slug], /search
  admin/             login + dashboard (articles, editor, preview, categories)
  sitemap.ts  robots.ts  rss.xml/  opengraph-image.tsx
components/          UI ที่ใช้ร่วมกันทั้ง public และ admin
lib/
  seo.ts             metadata + JSON-LD builders
  seo-panel.ts       ตรรกะที่ SEO panel กับ generateMetadata ใช้ร่วมกัน
  reading-time.ts    นับคำภาษาไทย
prisma/              schema, migrations, seed + เนื้อหาบทความ markdown
e2e/                 Playwright — flow, การพิสูจน์ revalidation, การตรวจ design token
```
# ApexSEO
