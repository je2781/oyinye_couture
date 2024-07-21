import { SearchResults } from "@/interfaces";
import Link from "next/link";

export default function Pagination({
  currentPage,
  hasPreviousPage,
  previousPage,
  lastPage,
  hasNextPage,
  nextPage,
  searchCat,
  query,
  isActivePage,
  sortBy,
  lowerBoundary,
  upperBoundary,
}: SearchResults) {
  return (
    <section className="no-underline space-x-2 text-center mt-2">
      {currentPage !== 1 && (
        <Link
          className={`${
            isActivePage === 1 ? "bg-black" : ""
          } text-white px-2 py-1 text-sm border border-gray-600 rounded-[50%] hover:bg-primary-50 hover:text-white`}
          href={`${searchCat}?q=${query}&options[prefix]=last${
            lowerBoundary
              ? `&filter.v.price.gte=${lowerBoundary}`
              : upperBoundary
              ? `&filter.v.price.lte=${upperBoundary}`
              : lowerBoundary && upperBoundary
              ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
              : ""
          }&sort_by=${sortBy}&page=1`}
        >
          1
        </Link>
      )}

      {currentPage > 3 && (
        <Link
          href={`${searchCat}?q=${query}&options[prefix]=last${
            lowerBoundary
              ? `&filter.v.price.gte=${lowerBoundary}`
              : upperBoundary
              ? `&filter.v.price.lte=${upperBoundary}`
              : lowerBoundary && upperBoundary
              ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
              : ""
          }&sort_by=${sortBy}&page=${
            currentPage - 1
          }`}
        >
          <i className="fa-solid fa-backward text-white"></i>
        </Link>
      )}

      {hasPreviousPage && previousPage > 1 && (
        <Link
          className={`${
            isActivePage === previousPage ? "bg-black" : ""
          } text-white px-2 py-1 text-sm border border-gray-600 rounded-[50%] hover:bg-primary-50 hover:text-white`}
          href={`${searchCat}?q=${query}&options[prefix]=last${
            lowerBoundary
              ? `&filter.v.price.gte=${lowerBoundary}`
              : upperBoundary
              ? `&filter.v.price.lte=${upperBoundary}`
              : lowerBoundary && upperBoundary
              ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
              : ""
          }&sort_by=${sortBy}&page=${previousPage}`}
        >
          {previousPage}
        </Link>
      )}
      <Link
        className={`${
          isActivePage === currentPage ? "bg-black" : ""
        } text-white px-2 py-1 text-sm border border-gray-600 rounded-[50%] hover:bg-primary-50 hover:text-white active`}
        href={`${searchCat}?q=${query}&options[prefix]=last${
          lowerBoundary
            ? `&filter.v.price.gte=${lowerBoundary}`
            : upperBoundary
            ? `&filter.v.price.lte=${upperBoundary}`
            : lowerBoundary && upperBoundary
            ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
            : ""
        }&sort_by=${sortBy}&page=${currentPage}`}
      >
        {currentPage}
      </Link>
      {hasNextPage && nextPage !== lastPage && (
        <Link
          className={`${
            isActivePage === nextPage ? "bg-black" : ""
          } text-white px-2 py-1 text-sm border border-gray-600 rounded-[50%] hover:bg-primary-50 hover:text-white`}
          href={`${searchCat}?q=${query}&options[prefix]=last${
            lowerBoundary
              ? `&filter.v.price.gte=${lowerBoundary}`
              : upperBoundary
              ? `&filter.v.price.lte=${upperBoundary}`
              : lowerBoundary && upperBoundary
              ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
              : ""
          }&sort_by=${sortBy}&page=${nextPage}`}
        >
          {nextPage}
        </Link>
      )}
      {currentPage < lastPage - 2 && (
        <Link
          href={`${searchCat}?q=${query}&options[prefix]=last${
            lowerBoundary
              ? `&filter.v.price.gte=${lowerBoundary}`
              : upperBoundary
              ? `&filter.v.price.lte=${upperBoundary}`
              : lowerBoundary && upperBoundary
              ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
              : ""
          }&sort_by=${sortBy}&page=${
            currentPage + 1
          }`}
        >
          <i className="fa-solid fa-forward text-white"></i>
        </Link>
      )}
      {lastPage !== currentPage && (
        <Link
          className={`${
            isActivePage === lastPage ? "bg-black" : ""
          } text-white px-2 py-1 text-sm border border-gray-600 rounded-[50%] hover:bg-primary-50 hover:text-white`}
          href={`${searchCat}?q=${query}&options[prefix]=last${
            lowerBoundary
              ? `&filter.v.price.gte=${lowerBoundary}`
              : upperBoundary
              ? `&filter.v.price.lte=${upperBoundary}`
              : lowerBoundary && upperBoundary
              ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
              : ""
          }&sort_by=${sortBy}&page=${lastPage}`}
        >
          {lastPage}
        </Link>
      )}
    </section>
  );
}
