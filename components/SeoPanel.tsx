"use client";

import {
  MagnifyingGlass,
  CheckCircle,
  WarningCircle,
  Info,
} from "@phosphor-icons/react/dist/ssr";
import {
  CHECK_INFO,
  CHECK_PASS,
  CHECK_WARN,
  META_DESC_MAX,
  META_TITLE_MAX,
  deriveSeoPanel,
  type SeoDraft,
} from "@/lib/seo-panel";
import { SITE_DOMAIN, SITE_NAME } from "@/lib/site";

type Props = {
  draft: SeoDraft;
  takenSlugs: string[];
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
};

const checkIcon = {
  pass: { Icon: CheckCircle, color: CHECK_PASS },
  warn: { Icon: WarningCircle, color: CHECK_WARN },
  info: { Icon: Info, color: CHECK_INFO },
};

export function SeoPanel({ draft, takenSlugs, onMetaTitleChange, onMetaDescriptionChange }: Props) {
  const seo = deriveSeoPanel(draft, takenSlugs);

  return (
    <aside
      className="flex flex-col gap-[22px] overflow-hidden"
      style={{ padding: "24px 22px", background: "#13151f" }}
    >
      <div className="flex items-center gap-[8px]">
        <MagnifyingGlass size={16} color="#9184d9" />
        <h6 className="m-0 text-[var(--color-text)]">SEO</h6>
      </div>

      <div className="field">
        <div className="mb-[5px] flex items-baseline gap-[8px]">
          <label className="m-0" htmlFor="metaTitle">
            Meta title
          </label>
          <span
            className="ml-auto font-mono text-[11px]"
            style={{ color: seo.titleColor }}
          >
            {seo.titleLength}/{META_TITLE_MAX}
          </span>
        </div>
        <input
          id="metaTitle"
          name="metaTitle"
          className="input"
          style={{ fontSize: 13 }}
          value={draft.metaTitle}
          onChange={(event) => onMetaTitleChange(event.target.value)}
        />
        <div
          className="mt-[6px] overflow-hidden"
          style={{ height: 3, borderRadius: 2, background: "#292b31" }}
        >
          <div style={{ height: "100%", width: seo.titleBarWidth, background: seo.titleColor }} />
        </div>
        <p className="mt-[6px] mb-0 text-[11px] text-[#75798c]">{seo.titleHint}</p>
      </div>

      <div className="field">
        <div className="mb-[5px] flex items-baseline gap-[8px]">
          <label className="m-0" htmlFor="metaDescription">
            Meta description
          </label>
          <span className="ml-auto font-mono text-[11px]" style={{ color: seo.descriptionColor }}>
            {seo.descriptionLength}/{META_DESC_MAX}
          </span>
        </div>
        <textarea
          id="metaDescription"
          name="metaDescription"
          className="input"
          style={{ minHeight: 78, fontSize: 13 }}
          value={draft.metaDescription}
          onChange={(event) => onMetaDescriptionChange(event.target.value)}
        />
        <div
          className="mt-[6px] overflow-hidden"
          style={{ height: 3, borderRadius: 2, background: "#292b31" }}
        >
          <div
            style={{ height: "100%", width: seo.descriptionBarWidth, background: seo.descriptionColor }}
          />
        </div>
        <p className="mt-[6px] mb-0 text-[11px] text-[#75798c]">{seo.descriptionHint}</p>
      </div>

      <div className="flex flex-col gap-[9px]">
        <span className="text-[11px] uppercase tracking-[.08em] text-[#75798c]">Google preview</span>
        <div
          className="flex flex-col gap-[5px] elev-sm"
          style={{ padding: "14px 15px", borderRadius: 8, background: "#232532" }}
        >
          <div className="flex items-center gap-[8px]">
            <div
              className="flex-none"
              style={{ width: 17, height: 17, borderRadius: "50%", background: "#3f424d" }}
            />
            <div className="flex flex-col leading-[1.25]">
              <span className="text-[11.5px] text-[#cfd3e5]">{SITE_NAME}</span>
              <span className="font-mono text-[10.5px] text-[#9397ab]">
                {SITE_DOMAIN} › blog › {draft.slug}
              </span>
            </div>
          </div>
          <span className="mt-[3px] text-[16px] leading-[1.3] text-[#b5abfc]">{seo.serpTitle}</span>
          <span className="text-[12.5px] leading-[1.5] text-[#b2b6ca]">{seo.serpDescription}</span>
        </div>
      </div>

      <div className="flex flex-col gap-[9px]">
        <span className="text-[11px] uppercase tracking-[.08em] text-[#75798c]">OG / social card</span>
        <div
          className="overflow-hidden elev-sm"
          style={{ borderRadius: 8, background: "#232532" }}
        >
          <div
            className="grid place-items-center"
            style={{
              aspectRatio: "1200/630",
              background: "repeating-linear-gradient(135deg,#282a38 0 8px,#1f2130 8px 16px)",
              borderBottom: "1px solid #3f424d",
            }}
          >
            <span className="font-mono text-[10px] text-[#9397ab]">og image 1200×630</span>
          </div>
          <div className="flex flex-col gap-[3px]" style={{ padding: "11px 13px" }}>
            <span className="font-mono text-[10px] uppercase tracking-[.06em] text-[#75798c]">
              {SITE_DOMAIN}
            </span>
            <span className="text-[13.5px] leading-[1.3]">{seo.serpTitle}</span>
            <span className="text-[11.5px] leading-[1.45] text-[#9397ab]">{seo.ogDescription}</span>
          </div>
        </div>
        <p className="m-0 text-[11px] text-[#595d6c]">
          ถ้าไม่มี coverImageUrl จะ fallback เป็น default OG image ของเว็บ
        </p>
      </div>

      <div
        className="flex flex-col gap-[8px]"
        style={{ paddingTop: 16, borderTop: "1px solid rgba(233,233,237,.1)" }}
      >
        <span className="text-[11px] uppercase tracking-[.08em] text-[#75798c]">ก่อน publish</span>
        {seo.checks.map((check) => {
          const { Icon, color } = checkIcon[check.kind];
          return (
            <div
              key={check.label}
              className="flex items-start gap-[8px] text-[12.5px] text-[#b2b6ca]"
            >
              <Icon size={15} color={color} style={{ marginTop: 1 }} />
              <span>{check.label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
