import { describe, expect, it } from "vitest";
import {
  COUNTER_IN_RANGE,
  COUNTER_OUT_OF_RANGE,
  deriveSeoPanel,
  type SeoDraft,
} from "../seo-panel";

const base: SeoDraft = {
  title: "Undercut vs Overcut ต่างกันยังไง",
  slug: "undercut-vs-overcut",
  excerpt: "เข้าพิทก่อนคู่แข่งเพื่อวิ่งบนยางใหม่ กับอยู่ต่อเพื่อรอ track ว่าง",
  content: "เนื้อหาบทความ",
  metaTitle: "",
  metaDescription: "",
  coverImageUrl: "",
};

function panel(overrides: Partial<SeoDraft>) {
  return deriveSeoPanel({ ...base, ...overrides });
}

describe("meta fallbacks", () => {
  it("falls back to the article title when meta title is empty", () => {
    const seo = panel({});
    expect(seo.serpTitle).toBe(base.title);
    expect(seo.titleHint).toBe("ว่างอยู่ — จะ fallback ไปใช้ชื่อบทความ");
  });

  it("falls back to the excerpt when meta description is empty", () => {
    const seo = panel({});
    expect(seo.serpDescription).toBe(base.excerpt);
    expect(seo.descriptionHint).toBe("ว่างอยู่ — จะ fallback ไปใช้ excerpt");
  });

  it("prefers explicit meta values", () => {
    const seo = panel({ metaTitle: "ตั้งเอง", metaDescription: "คำอธิบายเอง" });
    expect(seo.serpTitle).toBe("ตั้งเอง");
    expect(seo.serpDescription).toBe("คำอธิบายเอง");
  });
});

describe("counter colours flip at the documented boundaries", () => {
  it.each([
    [24, COUNTER_OUT_OF_RANGE],
    [25, COUNTER_IN_RANGE],
    [60, COUNTER_IN_RANGE],
    [61, COUNTER_OUT_OF_RANGE],
  ])("title length %i", (length, expected) => {
    expect(panel({ metaTitle: "a".repeat(length) }).titleColor).toBe(expected);
  });

  it.each([
    [79, COUNTER_OUT_OF_RANGE],
    [80, COUNTER_IN_RANGE],
    [155, COUNTER_IN_RANGE],
    [156, COUNTER_OUT_OF_RANGE],
  ])("description length %i", (length, expected) => {
    expect(panel({ metaDescription: "a".repeat(length) }).descriptionColor).toBe(expected);
  });
});

describe("progress bars", () => {
  it("caps at 100%", () => {
    expect(panel({ metaTitle: "a".repeat(200) }).titleBarWidth).toBe("100%");
    expect(panel({ metaDescription: "a".repeat(400) }).descriptionBarWidth).toBe("100%");
  });
});

describe("og description", () => {
  it("truncates to 90 characters", () => {
    expect(panel({ metaDescription: "a".repeat(120) }).ogDescription).toHaveLength(90);
  });
});

describe("pre-publish checklist", () => {
  it("warns when the slug is missing", () => {
    expect(panel({ slug: "" }).checks[1]).toEqual({ kind: "warn", label: "ยังไม่ได้ตั้ง slug" });
  });

  it("warns when the slug is taken by another article", () => {
    const seo = deriveSeoPanel(base, ["undercut-vs-overcut"]);
    expect(seo.checks[1].kind).toBe("warn");
  });

  it("passes when the slug is free", () => {
    expect(deriveSeoPanel(base, ["other-slug"]).checks[1].kind).toBe("pass");
  });

  it("warns when meta title runs past 60 characters", () => {
    expect(panel({ metaTitle: "a".repeat(61) }).checks[2].kind).toBe("warn");
  });

  it("warns when there is no cover image", () => {
    expect(panel({}).checks[3].kind).toBe("warn");
    expect(panel({ coverImageUrl: "https://cdn.example.com/a.jpg" }).checks[3].kind).toBe("pass");
  });

  it("warns about markdown images that have no alt text", () => {
    expect(panel({ content: "![](a.jpg)" }).checks[4].kind).toBe("warn");
    expect(panel({ content: "![รถเข้าพิท](a.jpg)" }).checks[4].kind).toBe("info");
  });
});
