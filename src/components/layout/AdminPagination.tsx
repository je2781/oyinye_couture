import Link from "next/link";

export default function AdminPagination({
  currentPage,
  hasPreviousPage,
  previousPage,
  lastPage,
  hasNextPage,
  nextPage,
  isActivePage}: any) {
  return (
    <section className="no-underline space-x-2 text-center mt-2">
      {currentPage !== 1 && (
        <Link
          className={`${
            isActivePage === 1 ? "bg-accent" : ""
          } text-white px-2 py-1 text-sm border border-secondary-400 hover:bg-accent/70 hover:text-white`}
          href={`?page=1`}
        >
          1
        </Link>
      )}

      {currentPage > 3 && (
        <Link
          href={`?page=${
            currentPage - 1
          }`}
        >
          <i className="fa-solid fa-backward text-white"></i>
        </Link>
      )}

      {hasPreviousPage && previousPage > 1 && (
        <Link
          className={`${
            isActivePage === previousPage ? "bg-accent" : ""
          } text-white px-2 py-1 text-sm border border-secondary-400 hover:bg-accent/70 hover:text-white`}
          href={`?page=${previousPage}`}
        >
          {previousPage}
        </Link>
      )}
      <Link
        className={`${
          isActivePage === currentPage ? "bg-accent" : ""
        } text-white px-2 py-1 text-sm border border-secondary-400 hover:bg-accent/70 hover:text-white active`}
        href={`?page=${currentPage}`}
      >
        {currentPage}
      </Link>
      {hasNextPage && nextPage !== lastPage && (
        <Link
          className={`${
            isActivePage === nextPage ? "bg-accent" : ""
          } text-white px-2 py-1 text-sm border border-secondary-400 hover:bg-accent/70 hover:text-white`}
          href={`?page=${nextPage}`}
        >
          {nextPage}
        </Link>
      )}
      {currentPage < lastPage - 2 && (
        <Link
          href={`?page=${
            currentPage + 1
          }`}
        >
          <i className="fa-solid fa-forward text-white"></i>
        </Link>
      )}
      {lastPage !== currentPage && (
        <Link
          className={`${
            isActivePage === lastPage ? "bg-accent" : ""
          } text-white px-2 py-1 text-sm border border-secondary-400 hover:bg-accent/70 hover:text-white`}
          href={`?page=${lastPage}`}
        >
          {lastPage}
        </Link>
      )}
    </section>
  );
}
