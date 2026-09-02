import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

type Props = {
  categories: { name: string; slug: string }[];
  current?: string;
  showSearchButton?: boolean;
};

export function SiteNav({ categories, current, showSearchButton = true }: Props) {
  return (
    <nav
      className="nav"
      style={{ padding: "14px 32px", borderBottom: "1px solid rgba(233,233,237,.1)" }}
    >
      <Link href="/" className="nav-brand text-[18px]">
        Apex&nbsp;Notes
      </Link>
      <Link href="/blog" aria-current={current === "blog" ? "page" : undefined}>
        บทความทั้งหมด
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          aria-current={current === category.slug ? "page" : undefined}
        >
          {category.name}
        </Link>
      ))}
      {showSearchButton && (
        <Link href="/search" className="btn btn-secondary" style={{ gap: 7 }}>
          <MagnifyingGlass size={15} />
          ค้นหา
        </Link>
      )}
    </nav>
  );
}
