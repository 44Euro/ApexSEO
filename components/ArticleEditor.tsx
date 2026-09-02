"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadSimple, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { saveArticle } from "@/app/admin/actions";
import { ConfirmDialog } from "./ConfirmDialog";
import { Toast } from "./Toast";
import { SeoPanel } from "./SeoPanel";
import { CoverPlaceholder } from "./CoverPlaceholder";
import { deriveSeoPanel } from "@/lib/seo-panel";
import { slugify, type FormState } from "@/lib/validation";

type Props = {
  articleId: string | null;
  categories: { id: string; name: string }[];
  takenSlugs: string[];
  initialToast?: boolean;
  initial: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImageUrl: string;
    metaTitle: string;
    metaDescription: string;
    categoryId: string;
    status: "DRAFT" | "PUBLISHED";
    updatedLabel: string;
  };
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-[6px] mb-0 text-[11.5px] text-[#d2cefd]">
      {message}
    </p>
  );
}

export function ArticleEditor({ articleId, categories, takenSlugs, initial, initialToast = false }: Props) {
  const [draft, setDraft] = useState(initial);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(initialToast);
  const formRef = useRef<HTMLFormElement>(null);
  const publishRef = useRef<HTMLButtonElement>(null);

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveArticle.bind(null, articleId),
    { ok: true },
  );

  const seo = deriveSeoPanel(draft, takenSlugs);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.ok && state.message === "published") {
      setDraft((current) => ({ ...current, status: "PUBLISHED" }));
      setToastOpen(true);
    }
  }, [state]);

  function update<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function onTitleChange(value: string) {
    setDraft((current) => ({
      ...current,
      title: value,
      slug: slugEdited ? current.slug : slugify(value),
    }));
  }

  function confirmPublish() {
    setPublishDialogOpen(false);
    publishRef.current?.click();
  }

  const borderError = { borderColor: "#b5abfc" };

  return (
    <form ref={formRef} action={formAction} className="relative">
      <div
        className="flex items-center gap-[12px]"
        style={{ padding: "14px 24px", borderBottom: "1px solid rgba(233,233,237,.1)" }}
      >
        <Link href="/admin/articles" className="btn btn-icon btn-secondary" title="กลับ">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex flex-col">
          <span className="text-[15px]">{articleId ? "แก้ไขบทความ" : "เขียนบทความใหม่"}</span>
          <span className="text-[11.5px] text-[#75798c]">
            {initial.updatedLabel} · {draft.status === "PUBLISHED" ? "published" : "draft"}
          </span>
        </div>
        <span
          className={draft.status === "PUBLISHED" ? "tag tag-accent" : "tag tag-neutral"}
          style={{ marginLeft: 8 }}
        >
          {draft.status === "PUBLISHED" ? "Published" : "Draft"}
        </span>
        <div className="ml-auto flex gap-[8px]">
          <button name="publish" value="" className="btn btn-secondary" disabled={pending}>
            {pending ? "กำลังบันทึก…" : "บันทึก draft"}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ gap: 7 }}
            onClick={() => setPublishDialogOpen(true)}
            disabled={pending}
          >
            <UploadSimple size={15} />
            Publish
          </button>
          <button ref={publishRef} name="publish" value="1" className="hidden" tabIndex={-1} />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_372px] max-lg:grid-cols-1" style={{ minHeight: 760 }}>
        <div
          className="flex flex-col gap-[18px]"
          style={{ padding: "26px 28px", borderRight: "1px solid rgba(233,233,237,.1)" }}
        >
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
            <label htmlFor="title">ชื่อบทความ</label>
            <input
              id="title"
              name="title"
              className="input"
              style={{ minHeight: 46, fontSize: 21, fontWeight: 500, ...(errors.title ? borderError : {}) }}
              value={draft.title}
              onChange={(event) => onTitleChange(event.target.value)}
              aria-describedby={errors.title ? "title-error" : undefined}
              aria-invalid={Boolean(errors.title)}
            />
            <FieldError id="title-error" message={errors.title} />
          </div>

          <div className="grid grid-cols-[1fr_190px] gap-[14px] max-md:grid-cols-1">
            <div className="field">
              <label htmlFor="slug">Slug</label>
              <div className="flex items-center gap-[8px]">
                <span className="font-mono text-[12.5px] text-[#75798c]">/blog/</span>
                <input
                  id="slug"
                  name="slug"
                  className="input font-mono"
                  style={{ fontSize: 13, ...(errors.slug ? borderError : {}) }}
                  value={draft.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    update("slug", event.target.value);
                  }}
                  aria-describedby={errors.slug ? "slug-error" : undefined}
                  aria-invalid={Boolean(errors.slug)}
                />
              </div>
              <FieldError id="slug-error" message={errors.slug} />
            </div>
            <div className="field">
              <label htmlFor="categoryId">หมวดหมู่</label>
              <select
                id="categoryId"
                name="categoryId"
                className="input"
                style={{ minHeight: 36 }}
                value={draft.categoryId}
                onChange={(event) => update("categoryId", event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="excerpt">Excerpt — ใช้เป็น meta description ถ้าไม่ตั้งค่าแยก</label>
            <textarea
              id="excerpt"
              name="excerpt"
              className="input"
              style={{ minHeight: 70, fontSize: 14, ...(errors.excerpt ? borderError : {}) }}
              value={draft.excerpt}
              onChange={(event) => update("excerpt", event.target.value)}
              aria-describedby={errors.excerpt ? "excerpt-error" : undefined}
              aria-invalid={Boolean(errors.excerpt)}
            />
            <FieldError id="excerpt-error" message={errors.excerpt} />
          </div>

          <div className="field">
            <label htmlFor="coverImageUrl">Cover image URL</label>
            <div className="flex items-start gap-[10px]">
              <input
                id="coverImageUrl"
                name="coverImageUrl"
                className="input font-mono"
                style={{ fontSize: 12.5, ...(errors.coverImageUrl ? borderError : {}) }}
                value={draft.coverImageUrl}
                onChange={(event) => update("coverImageUrl", event.target.value)}
                placeholder="https://cdn.example.com/covers/article.jpg"
                aria-describedby={errors.coverImageUrl ? "cover-error" : undefined}
              />
              <CoverPlaceholder
                src={null}
                alt=""
                label="1200×630"
                aspect="16/9"
                className="w-[118px] flex-none"
              />
            </div>
            <FieldError id="cover-error" message={errors.coverImageUrl} />
          </div>

          <div className="flex flex-1 flex-col">
            <div className="mb-[7px] flex items-center gap-[10px]">
              <label className="text-[12px] text-[#b2b6ca]" htmlFor="content">
                เนื้อหา (Markdown)
              </label>
              <div className="ml-auto flex gap-[6px] font-mono text-[11px] text-[#75798c]">
                <span>{seo.wordCount} คำ</span>
                <span className="opacity-50">·</span>
                <span>อ่าน ~{seo.readMinutes} นาที</span>
              </div>
            </div>
            <textarea
              id="content"
              name="content"
              className="input font-mono"
              style={{
                flex: 1,
                minHeight: 300,
                fontSize: 13,
                lineHeight: 1.7,
                ...(errors.content ? borderError : {}),
              }}
              value={draft.content}
              onChange={(event) => update("content", event.target.value)}
              aria-describedby={errors.content ? "content-error" : undefined}
            />
            <FieldError id="content-error" message={errors.content} />
            <p className="mt-[8px] mb-0 text-[11.5px] text-[#595d6c]">
              render ด้วย react-markdown · h2/h3 ในเนื้อหาได้ id อัตโนมัติ · ห้ามใส่ h1 ซ้ำกับชื่อบทความ
            </p>
          </div>
        </div>

        <SeoPanel
          draft={draft}
          takenSlugs={takenSlugs}
          onMetaTitleChange={(value) => update("metaTitle", value)}
          onMetaDescriptionChange={(value) => update("metaDescription", value)}
        />
      </div>

      {publishDialogOpen && (
        <ConfirmDialog
          title="Publish บทความนี้?"
          body={`หน้า /blog/${draft.slug} จะขึ้นเว็บทันที และระบบจะ revalidate หน้ารายการกับ sitemap.xml ให้เอง`}
          confirmLabel="Publish"
          onCancel={() => setPublishDialogOpen(false)}
          onConfirm={confirmPublish}
        />
      )}

      {toastOpen && !pending && (
        <Toast
          title="Publish แล้ว"
          body={`revalidate /blog/${draft.slug}, /blog และ /sitemap.xml เรียบร้อย`}
          duration={5000}
          onDismiss={() => setToastOpen(false)}
          action={{ label: "ดูหน้า", href: `/blog/${draft.slug}` }}
        />
      )}
    </form>
  );
}
