"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus,
  PencilSimple,
  Eye,
  Trash,
  FolderOpen,
  NotePencil,
} from "@phosphor-icons/react/dist/ssr";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Toast } from "@/components/Toast";
import { deleteArticle } from "@/app/admin/actions";

export type AdminRow = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  categoryName: string;
  updatedLabel: string;
};

type Props = {
  rows: AdminRow[];
  status: "ALL" | "PUBLISHED" | "DRAFT";
  publishedCount: number;
  draftCount: number;
  totalCount: number;
};

const filters = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
] as const;

export function ArticlesTable({ rows, status, publishedCount, draftCount, totalCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminRow | null>(null);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = rows.filter((row) => row.title.toLowerCase().includes(query.trim().toLowerCase()));

  function setStatus(next: string) {
    router.push(next === "ALL" ? pathname : `${pathname}?status=${next}`);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      await deleteArticle(target.id);
      setDeleteTarget(null);
      setToast({
        title: "ลบบทความแล้ว",
        body: "revalidate /blog และ /sitemap.xml เรียบร้อย",
      });
      router.refresh();
    });
  }

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center gap-[13px] text-center" style={{ padding: "56px 32px" }}>
        <NotePencil size={38} color="#595d6c" />
        <h3 className="m-0 text-[22px]">ยังไม่มีบทความ</h3>
        <p className="m-0 max-w-[44ch] text-[14px] text-[#9397ab] [text-wrap:pretty]">
          เขียนบทความแรกได้เลย ระบบจะสร้าง URL, sitemap entry และ metadata ให้อัตโนมัติเมื่อ publish
        </p>
        <Link href="/admin/articles/new" className="btn btn-primary mt-[6px]">
          เขียนบทความแรก
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-[16px]">
        <h2 className="m-0 text-[26px]">บทความ</h2>
        <span className="text-[13px] text-[#75798c]">
          {publishedCount} published · {draftCount} draft
        </span>
        <Link href="/admin/articles/new" className="btn btn-primary ml-auto" style={{ gap: 7 }}>
          <Plus size={15} />
          เขียนบทความใหม่
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-[12px]">
        <div className="seg">
          {filters.map((filter) => (
            <label key={filter.value} className="seg-opt">
              <input
                type="radio"
                name="status"
                checked={status === filter.value}
                onChange={() => setStatus(filter.value)}
              />
              {filter.label}
            </label>
          ))}
        </div>
        <input
          className="input max-w-[240px]"
          placeholder="ค้นหาในชื่อบทความ"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="ค้นหาในชื่อบทความ"
        />
      </div>

      {visible.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>ชื่อบทความ</th>
              <th>หมวด</th>
              <th>สถานะ</th>
              <th>อัปเดต</th>
              <th style={{ textAlign: "right" }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td style={{ paddingBlock: 11 }}>
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-[14px]">{row.title}</span>
                    <span className="font-mono text-[11px] text-[#75798c]">/blog/{row.slug}</span>
                  </div>
                </td>
                <td>
                  <span className="tag tag-neutral">{row.categoryName}</span>
                </td>
                <td>
                  <span className={row.status === "PUBLISHED" ? "tag tag-accent" : "tag tag-neutral"}>
                    {row.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="text-[13px] text-[#9397ab]">{row.updatedLabel}</td>
                <td>
                  <div className="flex justify-end gap-[4px]">
                    <Link
                      href={`/admin/articles/${row.id}/edit`}
                      className="btn btn-icon btn-secondary"
                      title="แก้ไข"
                    >
                      <PencilSimple size={15} />
                    </Link>
                    <Link
                      href={
                        row.status === "PUBLISHED"
                          ? `/blog/${row.slug}`
                          : `/admin/articles/${row.id}/preview`
                      }
                      className="btn btn-icon btn-secondary"
                      title={row.status === "PUBLISHED" ? "ดูหน้าจริง" : "ดู preview ของ draft"}
                    >
                      <Eye size={15} />
                    </Link>
                    <button
                      className="btn btn-icon btn-secondary"
                      title="ลบ"
                      onClick={() => setDeleteTarget(row)}
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div
          className="flex flex-col items-center gap-[12px] text-center"
          style={{ padding: "70px 0" }}
        >
          <FolderOpen size={34} color="#595d6c" />
          <h3 className="m-0 text-[21px]">ไม่มีบทความในสถานะนี้</h3>
          <p className="m-0 max-w-[42ch] text-[14px] text-[#9397ab]">
            เปลี่ยน filter หรือเริ่มเขียนบทความใหม่ได้เลย
          </p>
          <Link href="/admin/articles/new" className="btn btn-primary mt-[6px]">
            เขียนบทความใหม่
          </Link>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="ลบบทความนี้?"
          body={`“${deleteTarget.title}” จะถูกลบถาวร และ URL /blog/${deleteTarget.slug} จะกลายเป็น 404 พร้อมถูกถอดออกจาก sitemap`}
          confirmLabel={pending ? "กำลังลบ…" : "ลบบทความ"}
          pending={pending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {toast && (
        <Toast title={toast.title} body={toast.body} duration={4000} onDismiss={() => setToast(null)} />
      )}
    </>
  );
}
