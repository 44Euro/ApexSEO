import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3001";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

// 1. guard
await page.goto(`${BASE}/admin/articles`);
check("ไม่ล็อกอินเด้งไป login", page.url().includes("/admin/login"));

// 2. wrong password
await page.fill('#email', 'admin@apexnotes.dev');
await page.fill('#password', 'wrongpass');
await page.click('button[type=submit], button.btn-primary');
await page.waitForSelector('form [role=alert]', { timeout: 10000 });
check("รหัสผิดขึ้น alert", (await page.textContent('form [role=alert]')).includes("อีเมลหรือรหัสผ่านไม่ถูกต้อง"));
const pwBorder = await page.locator('#password').evaluate(el => getComputedStyle(el).borderColor);
check("ขอบช่องรหัสผ่านเปลี่ยนเป็นสีเตือน", pwBorder === 'rgb(181, 171, 252)', pwBorder);

// 3. correct login
await page.fill('#email', 'admin@apexnotes.dev');
await page.fill('#password', 'demo1234');
await page.click('button.btn-primary.btn-block');
await page.waitForURL('**/admin/articles', { timeout: 15000 });
check("ล็อกอินถูกเข้าได้ + กลับไปหน้าที่ขอ", page.url().endsWith("/admin/articles"));

// 4. status filter via segmented control
await page.locator('label.seg-opt', { hasText: 'Draft' }).click();
await page.waitForFunction(() => location.search.includes('status=DRAFT'), null, { timeout: 10000 });
await page.waitForTimeout(800);
const draftRows = await page.locator('table.table tbody tr').count();
check("filter Draft = query param + 2 แถว", page.url().includes("status=DRAFT") && draftRows === 2, `rows=${draftRows}`);

// 5. client-side search box
await page.locator('label.seg-opt', { hasText: 'ทั้งหมด' }).click();
await page.waitForFunction(() => !location.search.includes('status='), null, { timeout: 10000 });
await page.waitForTimeout(800);
await page.fill('input[aria-label="ค้นหาในชื่อบทความ"]', 'Ground');
await page.waitForTimeout(300);
const searched = await page.locator('table.table tbody tr').count();
check("ค้นหาในชื่อบทความกรองได้", searched === 1, `rows=${searched}`);
await page.fill('input[aria-label="ค้นหาในชื่อบทความ"]', '');

// 6. delete confirm dialog appears (then cancel)
await page.locator('table.table tbody tr').first().locator('button[title="ลบ"]').click();
await page.waitForSelector('[role=dialog]', { timeout: 5000 });
const dlg = await page.textContent('[role=dialog]');
check("ปุ่มลบเปิด confirm dialog", dlg.includes("ลบบทความนี้?") && dlg.includes("404"));
await page.click('[role=dialog] button.btn-secondary');
await page.waitForTimeout(300);
check("ยกเลิกแล้ว dialog ปิด", (await page.locator('[role=dialog]').count()) === 0);

// 7. draft preview route (eye on a draft must not open public URL)
await page.goto(`${BASE}/admin/articles?status=DRAFT`);
const eyeHref = await page.locator('table.table tbody tr').first().locator('a[title*="preview"]').getAttribute('href');
check("ปุ่มตาของ draft ชี้ไป preview ไม่ใช่ /blog", eyeHref?.includes("/preview"), eyeHref ?? "");

// 8. editor live SEO panel
await page.goto(`${BASE}/admin/articles?status=DRAFT`);
await page.locator('table.table tbody tr').first().locator('a[title="แก้ไข"]').click();
await page.waitForSelector('#metaTitle', { timeout: 15000 });
const titleVal = await page.inputValue('#title');
const serpBefore = await page.locator('aside span.text-\\[16px\\]').first().textContent();
check("meta ว่าง → SERP fallback เป็นชื่อบทความ", serpBefore.trim() === titleVal.trim(), `${serpBefore}`);

await page.fill('#metaTitle', 'สั้น');
await page.waitForTimeout(200);
const shortColor = await page.locator('aside .font-mono.text-\\[11px\\]').first().evaluate(el => getComputedStyle(el).color);
await page.fill('#metaTitle', 'A'.repeat(70));
await page.waitForTimeout(200);
const longColor = await page.locator('aside .font-mono.text-\\[11px\\]').first().evaluate(el => getComputedStyle(el).color);
await page.fill('#metaTitle', 'A'.repeat(40));
await page.waitForTimeout(200);
const okColor = await page.locator('aside .font-mono.text-\\[11px\\]').first().evaluate(el => getComputedStyle(el).color);
const WARN = 'rgb(181, 171, 252)', GOOD = 'rgb(117, 121, 140)';
check("ตัวนับ <25 ตัว = สีเตือน", shortColor === WARN, shortColor);
check("ตัวนับ >60 ตัว = สีเตือน", longColor === WARN, longColor);
check("ตัวนับ 25-60 ตัว = สีปกติ", okColor === GOOD, okColor);

const serpAfter = await page.locator('aside span.text-\\[16px\\]').first().textContent();
check("SERP preview อัปเดตตามที่พิมพ์", serpAfter.trim() === 'A'.repeat(40));

// word count live
const wordsBefore = await page.locator('text=/[0-9]+ คำ/').first().textContent();
check("นับคำภาษาไทยได้จริง (ไม่ใช่ 1)", parseInt(wordsBefore) > 100, wordsBefore.trim());

await browser.close();

const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
