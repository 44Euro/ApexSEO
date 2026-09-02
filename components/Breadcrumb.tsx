import Link from "next/link";

export type Crumb = { name: string; href?: string };

export function Breadcrumb({ trail, className = "" }: { trail: Crumb[]; className?: string }) {
  return (
    <nav aria-label="breadcrumb" className={`text-[12px] text-[#75798c] ${className}`}>
      {trail.map((crumb, index) => (
        <span key={crumb.name}>
          {index > 0 && <span className="opacity-50 mx-[5px]">/</span>}
          {crumb.href ? <Link href={crumb.href}>{crumb.name}</Link> : crumb.name}
        </span>
      ))}
    </nav>
  );
}
