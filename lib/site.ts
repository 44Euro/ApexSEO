export const SITE_NAME = "Apex Notes";
export const SITE_DOMAIN = "apexnotes.dev";
export const SITE_TAGLINE = "อธิบาย F1 ให้เข้าใจจริง ทีละเรื่อง";
export const SITE_DESCRIPTION =
  "บล็อก Formula 1 เชิงลึก 4 หมวด — Regulations, Strategy, Engineering, History เขียนยาว อ่านจบแล้วเข้าใจ ไม่ต้องตามข่าวทุกสัปดาห์";
export const ARTICLES_PER_PAGE = 6;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export function formatThaiDate(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    calendar: "gregory",
  }).format(date);
}
