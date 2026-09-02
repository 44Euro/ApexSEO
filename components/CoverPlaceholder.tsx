import Image from "next/image";

type Props = {
  src?: string | null;
  alt: string;
  label: string;
  aspect: "16/9" | "16/10" | "1200/630";
  size?: "sm" | "lg";
  priority?: boolean;
  className?: string;
};

const stripes = {
  sm: "repeating-linear-gradient(135deg,#282a38 0 8px,#1f2130 8px 16px)",
  lg: "repeating-linear-gradient(135deg,#232532 0 9px,#1b1d2b 9px 18px)",
};

export function CoverPlaceholder({
  src,
  alt,
  label,
  aspect,
  size = "sm",
  priority = false,
  className = "",
}: Props) {
  const radius = size === "lg" ? 8 : 6;

  if (src) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio: aspect, borderRadius: radius, border: "1px solid #3f424d" }}
      >
        <Image src={src} alt={alt} fill sizes="(max-width: 900px) 100vw, 800px" priority={priority} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`grid place-items-center px-[20px] text-center ${className}`}
      style={{
        aspectRatio: aspect,
        borderRadius: radius,
        border: "1px solid #3f424d",
        background: stripes[size],
      }}
    >
      <span
        className="font-mono text-[#9397ab]"
        style={{ fontSize: size === "lg" ? 11 : 10, lineHeight: 1.7 }}
      >
        {label.split("\n").map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}
