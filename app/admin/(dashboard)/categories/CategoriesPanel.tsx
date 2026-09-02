"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PencilSimple, Trash, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions";
import { slugify, type FormState } from "@/lib/validation";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-[6px] mb-0 text-[11.5px] text-[#d2cefd]">
      {message}
    </p>
  );
}

export function CategoriesPanel({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [pending, startTransition] = useTransition();

  const action = editing ? updateCategory.bind(null, editing.id) : createCategory;
  const [state, formAction, formPending] = useActionState<FormState, FormData>(action, { ok: true });
  const errors = state.fieldErrors ?? {};
  const borderError = { borderColor: "#b5abfc" };

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      await deleteCategory(target.id);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center gap-[16px]">
        <h2 className="m-0 text-[26px]">หมวดหมู่</h2>
        <span className="text-[13px] text-[#75798c]">{categories.length} หมวด</span>
      </div>

      <div className="grid grid-cols-[1fr_340px] items-start gap-[28px] max-lg:grid-cols-1">
        <table className="table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>Slug</th>
              <th>บทความ</th>
              <th style={{ textAlign: "right" }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="text-[14px]" style={{ paddingBlock: 11 }}>
                  {category.name}
                </td>
                <td className="font-mono text-[12px] text-[#9397ab]">{category.slug}</td>
                <td className="text-[13px] text-[#9397ab]">{category.articleCount}</td>
                <td>
                  <div className="flex justify-end gap-[4px]">
                    <button
                      className="btn btn-icon btn-secondary"
                      title="แก้ไข"
                      onClick={() => setEditing(category)}
                    >
                      <PencilSimple size={15} />
                    </button>
                    <button
                      className="btn btn-icon btn-secondary"
                      title={
                        category.articleCount > 0
                          ? "ลบไม่ได้ — ย้ายบทความออกจากหมวดนี้ก่อน"
                          : "ลบ"
                      }
                      disabled={category.articleCount > 0}
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form
          action={formAction}
          key={editing?.id ?? "new"}
          className="flex flex-col gap-[14px] elev-sm"
          style={{ padding: 20, borderRadius: 8, background: "#232532" }}
        >
          <h4 className="m-0 text-[17px]">{editing ? `แก้ไข ${editing.name}` : "เพิ่มหมวดใหม่"}</h4>

          {state.message && !state.ok && (
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
              <span className="text-[13px] text-[#d2cefd]">{state.message}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="name">ชื่อหมวด</label>
            <input
              id="name"
              name="name"
              className="input"
              placeholder="เช่น Tyres"
              defaultValue={editing?.name ?? ""}
              style={errors.name ? borderError : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              onChange={(event) => {
                if (editing) return;
                const slugInput = event.currentTarget.form?.elements.namedItem("slug");
                if (slugInput instanceof HTMLInputElement && !slugInput.dataset.touched) {
                  slugInput.value = slugify(event.target.value);
                }
              }}
            />
            <FieldError id="name-error" message={errors.name} />
          </div>

          <div className="field">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              name="slug"
              className="input font-mono"
              placeholder="tyres"
              defaultValue={editing?.slug ?? ""}
              style={{ fontSize: 13, ...(errors.slug ? borderError : {}) }}
              aria-describedby={errors.slug ? "slug-error" : undefined}
              onChange={(event) => {
                event.currentTarget.dataset.touched = "1";
              }}
            />
            <FieldError id="slug-error" message={errors.slug} />
          </div>

          <div className="field">
            <label htmlFor="description">คำอธิบายหมวด (ขึ้นหน้า category)</label>
            <textarea
              id="description"
              name="description"
              className="input"
              style={{ minHeight: 74, ...(errors.description ? borderError : {}) }}
              placeholder="อธิบายสั้นๆ 1-2 บรรทัด"
              defaultValue={editing?.description ?? ""}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            <FieldError id="description-error" message={errors.description} />
          </div>

          <button className="btn btn-primary btn-block" disabled={formPending}>
            {editing ? "บันทึกการแก้ไข" : "เพิ่มหมวด"}
          </button>
          {editing && (
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
              ยกเลิกการแก้ไข
            </button>
          )}
        </form>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="ลบหมวดนี้?"
          body={`“${deleteTarget.name}” จะถูกลบถาวร และ URL /category/${deleteTarget.slug} จะกลายเป็น 404 พร้อมถูกถอดออกจาก sitemap`}
          confirmLabel={pending ? "กำลังลบ…" : "ลบหมวด"}
          pending={pending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
