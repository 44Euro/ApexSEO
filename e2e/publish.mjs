import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3001";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/admin/login`);
await page.fill('#email', 'admin@apexnotes.dev');
await page.fill('#password', 'demo1234');
await page.click('button.btn-primary.btn-block');
await page.waitForURL('**/admin/articles', { timeout: 20000 });

// baseline: draft must 404 publicly and be absent from sitemap
const SLUG = 'tyre-compounds';
const before = await ctx.request.get(`${BASE}/blog/${SLUG}`);
check("ก่อน publish: /blog/tyre-compounds เป็น 404", before.status() === 404, String(before.status()));
const sitemapBefore = await (await ctx.request.get(`${BASE}/sitemap.xml`)).text();
check("ก่อน publish: ไม่อยู่ใน sitemap", !sitemapBefore.includes(`/blog/${SLUG}`));

// open the draft editor
await page.goto(`${BASE}/admin/articles?status=DRAFT`);
await page.locator(`tr:has-text("Tyre compound")`).locator('a[title="แก้ไข"]').click();
await page.waitForSelector('#metaTitle', { timeout: 20000 });
check("editor เปิดได้ + status tag = Draft", (await page.locator('.tag').first().textContent()).includes('Draft'));

// publish through the confirm dialog
await page.click('button.btn-primary:has-text("Publish")');
await page.waitForSelector('[role=dialog]', { timeout: 8000 });
const dialogText = await page.textContent('[role=dialog]');
check("dialog ยืนยัน publish ขึ้นถูกต้อง",
  dialogText.includes('Publish บทความนี้?') && dialogText.includes(`/blog/${SLUG}`) && dialogText.includes('sitemap.xml'));

await page.click('[role=dialog] button.btn-primary');
await page.waitForSelector('[role=status]', { timeout: 20000 });
const toast = await page.textContent('[role=status]');
check("toast หลัง publish บอก revalidate ครบ 3 เส้นทาง",
  toast.includes('Publish แล้ว') && toast.includes(`/blog/${SLUG}`) && toast.includes('/blog') && toast.includes('/sitemap.xml'),
  toast.replace(/\s+/g, ' ').slice(0, 90));
check("status tag เปลี่ยนเป็น Published", (await page.locator('.tag').first().textContent()).includes('Published'));

// the real proof: public page live without a restart
await page.waitForTimeout(1200);
const after = await ctx.request.get(`${BASE}/blog/${SLUG}`);
check("หลัง publish: /blog/tyre-compounds ขึ้นทันที (ไม่ต้อง restart)", after.status() === 200, String(after.status()));
const html = await after.text();
check("หน้าใหม่มี h1 เดียว", (html.match(/<h1/g) || []).length === 1);
check("หน้าใหม่มี JSON-LD BlogPosting", html.includes('"@type":"BlogPosting"'));

const sitemapAfter = await (await ctx.request.get(`${BASE}/sitemap.xml`)).text();
check("sitemap.xml มี URL ใหม่ทันที", sitemapAfter.includes(`/blog/${SLUG}`));

const blogList = await (await ctx.request.get(`${BASE}/blog`)).text();
check("/blog แสดงบทความใหม่ทันที", blogList.includes(SLUG));

const adminAfter = await (await ctx.request.get(`${BASE}/admin/articles`)).text();
check("admin นับใหม่เป็น 7 published · 1 draft", adminAfter.replace(/<!--.*?-->/gs, '').includes('7 published · 1 draft'));

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
