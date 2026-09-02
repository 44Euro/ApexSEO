const WORDS_PER_MINUTE = 180;

// Thai has no word spaces, so a whitespace split reports ~6 words for a
// sentence that actually holds ~21. Intl.Segmenter does real Thai segmentation.
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("th", { granularity: "word" });
    let words = 0;
    for (const segment of segmenter.segment(trimmed)) {
      if (segment.isWordLike) words++;
    }
    return words;
  }

  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(text: string): number {
  return Math.max(1, Math.round(countWords(text) / WORDS_PER_MINUTE));
}
