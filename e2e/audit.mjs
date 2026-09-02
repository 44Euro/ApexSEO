import { chromium } from "playwright";
const BASE = process.env.BASE ?? "http://localhost:3001";
const out = [];
function eq(name, actual, expected) {
  const ok = String(actual) === String(expected);
  out.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  got=${actual}${ok ? "" : `  want=${expected}`}`);
}
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1400, height: 1000 } });
const p = await ctx.newPage();

const css = (sel, prop) => p.locator(sel).first().evaluate((el, pr) => getComputedStyle(el)[pr], prop);

// ---- tokens on the home page ----
await p.goto(`${BASE}/`, { waitUntil: "load" });
eq("page ground = #161826", await css("body", "backgroundColor"), "rgb(22, 24, 38)");
eq("body text = #e9e9ed", await css("body", "color"), "rgb(233, 233, 237)");
eq("hero h1 = 52px", await css("h1", "fontSize"), "52px");
eq("hero h1 weight 500", await css("h1", "fontWeight"), "500");
eq("hero h1 line-height 1.08", Math.round(parseFloat(await css("h1", "lineHeight")) * 100) / 100, 56.16);
eq("kicker accent #9184d9", await css(".font-mono.uppercase", "color"), "rgb(145, 132, 217)");
eq("lede #b2b6ca", await css("p.text-\\[17px\\]", "color"), "rgb(178, 182, 202)");
eq("nav padding 14px 32px", await css("nav.nav", "padding"), "14px 32px");
eq("brand 18px", await css(".nav-brand", "fontSize"), "18px");
eq("featured h2 = 34px", await css("article h2", "fontSize"), "34px");
eq("card title colour = body text", await css(".card-title", "color"), "rgb(233, 233, 237)");
eq("card kicker = accent", await css(".card-kicker", "color"), "rgb(145, 132, 217)");
eq("card hairline = #3f424d", await css(".card.elev-sm", "boxShadow"), "rgb(63, 66, 77) 0px 0px 0px 1px");
eq("tag-accent bg = accent-800", await css(".tag-accent", "backgroundColor"), "rgb(66, 58, 106)");
eq("footer text #75798c", await css("footer", "color"), "rgb(117, 121, 140)");
const grid = await p.locator("div.grid.grid-cols-3").first().evaluate(el => getComputedStyle(el).gap);
eq("card grid gap 18px", grid, "18px");

// ---- article page ----
await p.goto(`${BASE}/blog/undercut-vs-overcut`, { waitUntil: "load" });
eq("article h1 = 44px", await css("article h1", "fontSize"), "44px");
eq("lede 18px #cfd3e5", await css("article p.text-\\[18px\\]", "color"), "rgb(207, 211, 229)");
eq("prose 17px", await css(".article-prose", "fontSize"), "17px");
eq("prose line-height 1.75", await css(".article-prose", "lineHeight"), `${17 * 1.75}px`);
eq("prose colour = neutral-200", await css(".article-prose", "color"), "rgb(228, 231, 245)");
eq("prose h2 = 29px", await css(".article-prose h2", "fontSize"), "29px");
eq("prose p margin-bottom 20px", await css(".article-prose p", "marginBottom"), "20px");
const contentWidth = await p.locator("article").first().evaluate(el => getComputedStyle(el).maxWidth);
eq("content column 760px", contentWidth, "760px");

// related section on a category that has siblings
await p.goto(`${BASE}/blog/ground-effect`, { waitUntil: "load" });
const related = await p.locator("section h6").count();
eq("related section renders when siblings exist", related, 1);

// ---- admin ----
await p.goto(`${BASE}/admin/login`, { waitUntil: "load" });
await p.waitForTimeout(1000);
await p.fill("#email", "admin@apexnotes.dev");
await p.fill("#password", "demo1234");
await p.click("button.btn-primary.btn-block");
await p.waitForURL("**/admin/articles", { timeout: 20000 });
await p.waitForTimeout(600);
eq("sidebar ground #13151f", await css("aside", "backgroundColor"), "rgb(19, 21, 31)");
eq("sidebar width 216px", await p.locator("aside").first().evaluate(el => el.getBoundingClientRect().width), 216);
eq("active nav item bg #2b2741", await css('aside a[href="/admin/articles"]', "backgroundColor"), "rgb(43, 39, 65)");
eq("active nav item text #d2cefd", await css('aside a[href="/admin/articles"]', "color"), "rgb(210, 206, 253)");
eq("admin h2 = 26px", await css("h2", "fontSize"), "26px");

// ---- editor SEO panel maths ----
await p.goto(`${BASE}/admin/articles?status=DRAFT`);
await p.locator("table.table tbody tr").first().locator('a[title="แก้ไข"]').click();
await p.waitForSelector("#metaTitle", { timeout: 20000 });
await p.waitForTimeout(400);
eq("SEO panel ground #13151f", await css("aside:has(#metaTitle)", "backgroundColor"), "rgb(19, 21, 31)");
eq("SEO panel width 372px", await p.locator("aside:has(#metaTitle)").evaluate(el => el.getBoundingClientRect().width), 372);

await p.fill("#metaTitle", "a".repeat(30));
await p.waitForTimeout(150);
const bar = await p.locator("aside:has(#metaTitle) .field").first().locator("div > div").last();
eq("title bar width = 30/60 = 50%", await bar.evaluate(el => el.style.width), "50%");
eq("title bar colour in range", await bar.evaluate(el => getComputedStyle(el).backgroundColor), "rgb(117, 121, 140)");
await p.fill("#metaTitle", "a".repeat(90));
await p.waitForTimeout(150);
eq("title bar caps at 100%", await bar.evaluate(el => el.style.width), "100%");
eq("title bar colour out of range", await bar.evaluate(el => getComputedStyle(el).backgroundColor), "rgb(181, 171, 252)");

const checks = await p.locator("aside:has(#metaTitle) > div").last().locator("> div").evaluateAll(
  els => els.map(el => ({ text: el.textContent.trim(), fill: el.querySelector("svg")?.getAttribute("fill") })));
console.log("checklist:", JSON.stringify(checks, null, 1));
eq("cover missing = warn colour #b5abfc", checks[3]?.fill, "#b5abfc");
eq("alt-text row = info colour #75798c", checks[4]?.fill, "#75798c");
eq("h1 row = pass colour #9184d9", checks[0]?.fill, "#9184d9");

await b.close();
const failed = out.filter(x => !x).length;
console.log(`\n${out.length - failed}/${out.length} passed`);
process.exit(failed ? 1 : 0);
