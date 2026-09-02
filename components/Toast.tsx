"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

type Props = {
  title: string;
  body: string;
  duration: number;
  onDismiss: () => void;
  action?: { label: string; href: string };
};

export function Toast({ title, body, duration, onDismiss, action }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      role="status"
      className="absolute right-[24px] bottom-[24px] flex max-w-[410px] items-start gap-[10px]"
      style={{
        padding: "14px 16px",
        borderRadius: 8,
        background: "#232532",
        boxShadow: "0 0 0 1px #9397ab, 0 16px 40px rgba(0,0,0,.65)",
      }}
    >
      <CheckCircle size={18} color="#b5abfc" style={{ marginTop: 1 }} />
      <div className="flex flex-col gap-[3px]">
        <span className="text-[14px]">{title}</span>
        <span className="text-[12px] text-[#9397ab]">{body}</span>
      </div>
      {action && (
        <Link href={action.href} className="btn btn-ghost ml-[6px] flex-none">
          {action.label}
        </Link>
      )}
    </div>
  );
}
