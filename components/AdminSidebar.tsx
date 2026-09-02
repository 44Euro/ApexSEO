import Link from "next/link";
import { Article, Folders, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { signOut } from "@/auth";

const activeStyle = { background: "#2b2741", color: "#d2cefd" };
const idleStyle = { color: "#b2b6ca" };

function itemClass(active: boolean) {
  return `flex items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-[14px] ${
    active ? "" : "hover:bg-[rgba(233,233,237,.06)]"
  }`;
}

export function AdminSidebar({ current, email }: { current: "articles" | "categories"; email: string }) {
  return (
    <aside
      className="flex flex-col gap-[6px]"
      style={{
        borderRight: "1px solid rgba(233,233,237,.1)",
        padding: "20px 16px",
        background: "#13151f",
      }}
    >
      <div className="nav-brand" style={{ fontSize: 16, padding: "0 8px 16px" }}>
        Apex&nbsp;Notes
      </div>

      <Link
        href="/admin/articles"
        className={itemClass(current === "articles")}
        style={current === "articles" ? activeStyle : idleStyle}
      >
        <Article size={17} />
        บทความ
      </Link>
      <Link
        href="/admin/categories"
        className={itemClass(current === "categories")}
        style={current === "categories" ? activeStyle : idleStyle}
      >
        <Folders size={17} />
        หมวดหมู่
      </Link>
      <Link href="/" className={itemClass(false)} style={idleStyle}>
        <ArrowSquareOut size={17} />
        ดูเว็บจริง
      </Link>

      <div
        className="mt-auto flex flex-col gap-[6px]"
        style={{ padding: "12px 10px", borderTop: "1px solid rgba(233,233,237,.08)" }}
      >
        <span className="text-[12px] text-[#9397ab]">{email}</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button className="text-[12px] text-[#75798c] hover:text-[var(--color-accent)]">
            ออกจากระบบ
          </button>
        </form>
      </div>
    </aside>
  );
}
