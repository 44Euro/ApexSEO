import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3001";
const out = [];
function check(name, ok, detail = "") {
  out.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1400, height: 1000 } });
const p = await ctx.newPage();

const rows = () => p.locator("article").count();
const countLine = async () =>
  (await p.locator("p.text-\\[13px\\]").first().textContent().catch(() => "")).trim();

await p.goto(`${BASE}/search`, { waitUntil: "load" });
await p.waitForTimeout(800);
check("เข้ามาแรก ๆ ยังไม่มีผลลัพธ์", (await rows()) === 0);

// type without touching the button
await p.type('input[name="q"]', "undercut", { delay: 40 });
await p.waitForFunction(() => location.search.includes("q=undercut"), null, { timeout: 5000 });
await p.waitForTimeout(900);
check("พิมพ์อย่างเดียวแล้วผลลัพธ์ขึ้นเอง", (await rows()) > 0, `rows=${await rows()}`);
check("URL อัปเดตให้แชร์ได้", p.url().includes("q=undercut"), p.url());
check("บรรทัดนับผลลัพธ์ขึ้นถูก", (await countLine()).includes("พบ"), await countLine());

// refine the query live
await p.fill('input[name="q"]', "ground effect");
await p.waitForFunction(() => location.search.includes("ground"), null, { timeout: 5000 });
await p.waitForTimeout(900);
const t = await p.locator("article h3").first().textContent();
check("พิมพ์คำใหม่แล้วผลลัพธ์เปลี่ยนตาม", t.includes("Ground effect"), t);

// empty state, still no button press
await p.fill('input[name="q"]', "zzzzzz");
await p.waitForFunction(() => location.search.includes("zzzzzz"), null, { timeout: 5000 });
await p.waitForTimeout(900);
check("ไม่เจอ → ขึ้น empty state", (await p.locator("h3", { hasText: "ไม่พบบทความ" }).count()) === 1);

// clearing the box returns to the bare /search url
await p.fill('input[name="q"]', "");
await p.waitForFunction(() => !location.search.includes("q="), null, { timeout: 5000 });
await p.waitForTimeout(700);
check("ลบข้อความหมด → กลับไป /search เปล่า", p.url().endsWith("/search"), p.url());

// one history entry per search, not one per keystroke
const before = await p.evaluate(() => history.length);
await p.type('input[name="q"]', "budget", { delay: 40 });
await p.waitForTimeout(900);
const after = await p.evaluate(() => history.length);
check("ไม่ยัด history ทุกตัวอักษร", after - before <= 1, `history +${after - before}`);

// the shared URL still renders server-side (crawler / no-JS path)
const direct = await ctx.request.get(`${BASE}/search?q=undercut`);
const html = await direct.text();
check("เปิด URL ตรง ๆ ก็ได้ผลลัพธ์จากเซิร์ฟเวอร์", html.includes("Undercut vs Overcut"));
check("หน้า search ยัง noindex", html.includes('name="robots"') && html.includes("noindex"));

// no-JS fallback: the form still submits by GET
await ctx.close();
const noJs = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1400, height: 1000 } });
const p2 = await noJs.newPage();
await p2.goto(`${BASE}/search`, { waitUntil: "load" });
await p2.fill('input[name="q"]', "budget");
await Promise.all([p2.waitForNavigation({ timeout: 10000 }), p2.click("button.btn-primary")]);
check("ปิด JS แล้วปุ่มค้นหายังทำงาน", p2.url().includes("q=budget"), p2.url());
check("ปิด JS แล้วยังเห็นผลลัพธ์", (await p2.locator("article").count()) > 0);

await b.close();
const failed = out.filter((x) => !x).length;
console.log(`\n${out.length - failed}/${out.length} passed`);
process.exit(failed ? 1 : 0);
