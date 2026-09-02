import { describe, expect, it } from "vitest";
import { countWords, readingMinutes } from "../reading-time";

const thai =
  "การเข้าพิทใน F1 เสียเวลาประมาณ 20-25 วินาที นับรวมช่วงชะลอเข้าเลนพิทและเร่งออก";

describe("countWords", () => {
  it("segments Thai instead of splitting on whitespace", () => {
    expect(countWords(thai)).toBeGreaterThan(thai.trim().split(/\s+/).length * 3);
  });

  it("returns 0 for empty input", () => {
    expect(countWords("   ")).toBe(0);
  });
});

describe("readingMinutes", () => {
  it("never drops below one minute", () => {
    expect(readingMinutes("สั้น")).toBe(1);
  });

  it("keeps a long Thai article above the one-minute floor", () => {
    expect(readingMinutes(thai.repeat(80))).toBeGreaterThan(5);
  });
});
