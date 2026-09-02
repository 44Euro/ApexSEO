import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

function pageHref(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({ currentPage, totalPages, basePath }: Props) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center gap-[8px]" style={{ padding: "26px 32px 48px" }}>
      {hasPrev ? (
        <Link href={pageHref(basePath, currentPage - 1)} className="btn btn-secondary">
          ← ก่อนหน้า
        </Link>
      ) : (
        <button className="btn btn-secondary" disabled>
          ← ก่อนหน้า
        </button>
      )}

      <div className="flex gap-[6px] mx-[6px]">
        {pages.map((page) =>
          page === currentPage ? (
            <span key={page} className="btn btn-primary min-w-[36px]" aria-current="page">
              {page}
            </span>
          ) : (
            <Link key={page} href={pageHref(basePath, page)} className="btn btn-ghost min-w-[36px]">
              {page}
            </Link>
          ),
        )}
      </div>

      {hasNext ? (
        <Link href={pageHref(basePath, currentPage + 1)} className="btn btn-secondary">
          ถัดไป →
        </Link>
      ) : (
        <button className="btn btn-secondary" disabled>
          ถัดไป →
        </button>
      )}

      <span className="ml-auto text-[12px] text-[#75798c]">
        หน้า {currentPage} จาก {totalPages}
      </span>
    </div>
  );
}
