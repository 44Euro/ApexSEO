import Link from "next/link";

type Props = {
  name: string;
  slug?: string;
  variant?: "accent" | "neutral" | "outline";
};

export function CategoryTag({ name, slug, variant = "accent" }: Props) {
  const className = `tag tag-${variant}`;
  if (!slug) return <span className={className}>{name}</span>;
  return (
    <Link href={`/category/${slug}`} className={className}>
      {name}
    </Link>
  );
}
