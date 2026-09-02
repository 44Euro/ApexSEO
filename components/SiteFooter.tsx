import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      className="flex items-center justify-between text-[13px] text-[#75798c]"
      style={{ padding: "28px 32px", borderTop: "1px solid rgba(233,233,237,.1)" }}
    >
      <span>© 2026 Apex Notes</span>
      <div className="flex gap-[20px]">
        <a href="/sitemap.xml">sitemap.xml</a>
        <a href="/rss.xml">RSS</a>
        <Link href="/admin/articles">Admin</Link>
      </div>
    </footer>
  );
}
