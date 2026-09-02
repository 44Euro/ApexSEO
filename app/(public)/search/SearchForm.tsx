"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const DEBOUNCE_MS = 250;

export function SearchForm({ query }: { query: string }) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const latest = useRef(query);

  useEffect(() => {
    if (value === latest.current) return;

    const timer = setTimeout(() => {
      latest.current = value;
      const trimmed = value.trim();
      // replace, not push, so a search does not leave one history entry per keystroke
      router.replace(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search", {
        scroll: false,
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, router]);

  return (
    <form
      method="GET"
      action="/search"
      className="flex gap-[10px]"
      onSubmit={(event) => event.preventDefault()}
    >
      <input
        className="input"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="เช่น undercut, budget cap, ground effect"
        style={{ minHeight: 44, fontSize: 15 }}
        aria-label="คำค้นหา"
        autoComplete="off"
      />
      <button className="btn btn-primary" style={{ minHeight: 44, paddingInline: 18 }}>
        ค้นหา
      </button>
    </form>
  );
}
