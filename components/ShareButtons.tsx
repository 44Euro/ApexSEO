"use client";

import { useState } from "react";
import { XLogo, FacebookLogo, LinkSimple, Check } from "@phosphor-icons/react/dist/ssr";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="ml-auto flex items-center gap-[6px]">
      <span className="mr-[2px] text-[12px] text-[#75798c]">แชร์</span>
      <a
        className="btn btn-icon btn-secondary"
        title="แชร์บน X"
        href={`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <XLogo size={16} />
      </a>
      <a
        className="btn btn-icon btn-secondary"
        title="แชร์บน Facebook"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FacebookLogo size={16} />
      </a>
      <button
        className="btn btn-icon btn-secondary"
        title={copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
        onClick={copyLink}
      >
        {copied ? <Check size={16} /> : <LinkSimple size={16} />}
      </button>
    </div>
  );
}
