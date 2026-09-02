"use client";

import { useActionState } from "react";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { login, type LoginState } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="flex w-[320px] flex-col gap-[16px]">
      <div className="mb-[6px]">
        <div className="nav-brand" style={{ fontSize: 20 }}>
          Apex&nbsp;Notes
        </div>
        <p className="mt-[6px] mb-0 text-[13px] text-[#75798c]">เข้าสู่ระบบเพื่อจัดการบทความ</p>
      </div>

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-[9px]"
          style={{
            padding: "11px 13px",
            borderRadius: 8,
            background: "#2b2741",
            boxShadow: "0 0 0 1px #5d5294",
          }}
        >
          <WarningCircle size={16} color="#b5abfc" style={{ marginTop: 1 }} />
          <span className="text-[13px] text-[#d2cefd]">{state.error}</span>
        </div>
      )}

      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="field">
        <label htmlFor="email">อีเมล</label>
        <input id="email" name="email" type="email" className="input" required autoComplete="email" />
      </div>

      <div className="field">
        <label htmlFor="password">รหัสผ่าน</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          required
          autoComplete="current-password"
          style={state.error ? { borderColor: "#b5abfc" } : undefined}
        />
      </div>

      <button className="btn btn-primary btn-block" style={{ minHeight: 40 }} disabled={pending}>
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>

      <p className="mt-[2px] mb-0 text-[11.5px] leading-[1.6] text-[#595d6c]">
        Demo: admin@apexnotes.dev / demo1234 (ใส่ไว้ใน README)
      </p>
    </form>
  );
}
