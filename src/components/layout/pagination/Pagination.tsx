import Link from "next/link";

export default function Pagination({
  currentPage,
  hasPreviousPage,
  previousPage,
  lastPage,
  hasNextPage,
  nextPage,
  searchCat,
  collectionsCat,
  query,
  isActivePage,
  sortBy,
  lowerBoundary,
  upperBoundary,
  dressColor,
  dressFabric,
  dressFeature,
  dressLength,
  neckLine,
  sleeveLength
}: any) {
  return (
    <section className="no-underline space-x-2 text-center mt-2">
      {currentPage !== 1 && (
        <Link
          className={`${
            isActivePage === 1 ? "bg-black" : ""
          } text-white px-2 py-1 text-sm border border-gray-600 rounded-[50%] hover:bg-primary-50 hover:text-white`}
          href={`${searchCat ? `${searchCat}?q=${query}&options[prefix]=last${
            lowerBoundary
              ? `&filter.v.price.gte=${lowerBoundary}`
              : upperBoundary
              ? `&filter.v.price.lte=${upperBoundary}`
              : lowerBoundary && upperBoundary
              ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
              : ""
          }&sort_by=${sortBy}&page=1` 
          : `${collectionsCat}?sort_by=${sortBy}&${
            dressColor
            ? `filter.p.m.custom.colors=${dressColor}`
            : dressFabric
            ?`filter.p.m.custom.fabric=${dressFabric}`
            : dressFeature
            ?`filter.p.m.custom.feature=${dressFeature}`
            : dressLength
            ?`filter.p.m.custom.dress_length=${dressLength}`
            : neckLine
            ?`filter.p.m.custom.neckline=${neckLine}`
            : sleeveLength
            ?`filter.p.m.custom.sleeve_length=${sleeveLength}`
            : ''     
          }&page=1`}`}
        >
          1
        </Link>
      )}

      {currentPage > 3 && (
        <Link
          href={`${searchCat 
            ? `${searchCat}?q=${query}&options[prefix]=last${
              lowerBoundary
                ? `&filter.v.price.gte=${lowerBoundary}`
                : upperBoundary
                ? `&filter.v.price.lte=${upperBoundary}`
                : lowerBoundary && upperBoundary
                ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
                : ""
            }&sort_by=${sortBy}&page=${
              currentPage - 1
            }`
          : `${collectionsCat}?sort_by=${sortBy}&${
            dressColor
            ? `filter.p.m.custom.colors=${dressColor}`
            : dressFabric
            ?`filter.p.m.custom.fabric=${dressFabric}`
            : dressFeature
            ?`filter.p.m.custom.feature=${dressFeature}`
            : dressLength
            ?`filter.p.m.custom.dress_length=${dressLength}`
            : neckLine
            ?`filter.p.m.custom.neckline=${neckLine}`
            : sleeveLength
            ?`filter.p.m.custom.sleeve_length=${sleeveLength}`
            : ''     
          }&page=${
            currentPage - 1
          }`
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
          href={`${searchCat
            ? `${searchCat}?q=${query}&options[prefix]=last${
              lowerBoundary
                ? `&filter.v.price.gte=${lowerBoundary}`
                : upperBoundary
                ? `&filter.v.price.lte=${upperBoundary}`
                : lowerBoundary && upperBoundary
                ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
                : ""
            }&sort_by=${sortBy}&page=${previousPage}`
            : `${collectionsCat}?sort_by=${sortBy}&${
              dressColor
              ? `filter.p.m.custom.colors=${dressColor}`
              : dressFabric
              ?`filter.p.m.custom.fabric=${dressFabric}`
              : dressFeature
              ?`filter.p.m.custom.feature=${dressFeature}`
              : dressLength
              ?`filter.p.m.custom.dress_length=${dressLength}`
              : neckLine
              ?`filter.p.m.custom.neckline=${neckLine}`
              : sleeveLength
              ?`filter.p.m.custom.sleeve_length=${sleeveLength}`
              : ''     
            }&page=${previousPage}`
          }`}
        >
          {previousPage}
        </Link>
      )}
      <Link
        className={`${
          isActivePage === currentPage ? "bg-black" : ""
        } text-white px-2 py-1 text-sm border border-gray-600 rounded-[50%] hover:bg-primary-50 hover:text-white active`}
        href={`${searchCat
          ? `${searchCat}?q=${query}&options[prefix]=last${
            lowerBoundary
              ? `&filter.v.price.gte=${lowerBoundary}`
              : upperBoundary
              ? `&filter.v.price.lte=${upperBoundary}`
              : lowerBoundary && upperBoundary
              ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
              : ""
          }&sort_by=${sortBy}&page=${currentPage}`
          : `${collectionsCat}?sort_by=${sortBy}&${
            dressColor
            ? `filter.p.m.custom.colors=${dressColor}`
            : dressFabric
            ?`filter.p.m.custom.fabric=${dressFabric}`
            : dressFeature
            ?`filter.p.m.custom.feature=${dressFeature}`
            : dressLength
            ?`filter.p.m.custom.dress_length=${dressLength}`
            : neckLine
            ?`filter.p.m.custom.neckline=${neckLine}`
            : sleeveLength
            ?`filter.p.m.custom.sleeve_length=${sleeveLength}`
            : ''    
          }&page=${currentPage}`
        }`}
      >
        {currentPage}
      </Link>
      {hasNextPage && nextPage !== lastPage && (
        <Link
          className={`${
            isActivePage === nextPage ? "bg-black" : ""
          } text-white px-2 py-1 text-sm border border-gray-600 rounded-[50%] hover:bg-primary-50 hover:text-white`}
          href={`${searchCat
            ? `${searchCat}?q=${query}&options[prefix]=last${
              lowerBoundary
                ? `&filter.v.price.gte=${lowerBoundary}`
                : upperBoundary
                ? `&filter.v.price.lte=${upperBoundary}`
                : lowerBoundary && upperBoundary
                ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
                : ""
            }&sort_by=${sortBy}&page=${nextPage}`
            : `${collectionsCat}?sort_by=${sortBy}&${
              dressColor
              ? `filter.p.m.custom.colors=${dressColor}`
              : dressFabric
              ?`filter.p.m.custom.fabric=${dressFabric}`
              : dressFeature
              ?`filter.p.m.custom.feature=${dressFeature}`
              : dressLength
              ?`filter.p.m.custom.dress_length=${dressLength}`
              : neckLine
              ?`filter.p.m.custom.neckline=${neckLine}`
              : sleeveLength
              ?`filter.p.m.custom.sleeve_length=${sleeveLength}`
              : ''    
            }&page=${nextPage}`
          }`}
        >
          {nextPage}
        </Link>
      )}
      {currentPage < lastPage - 2 && (
        <Link
          href={`${searchCat
            ? `${searchCat}?q=${query}&options[prefix]=last${
              lowerBoundary
                ? `&filter.v.price.gte=${lowerBoundary}`
                : upperBoundary
                ? `&filter.v.price.lte=${upperBoundary}`
                : lowerBoundary && upperBoundary
                ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
                : ""
            }&sort_by=${sortBy}&page=${
              currentPage + 1
            }`
            : `${collectionsCat}?sort_by=${sortBy}&${
              dressColor
              ? `filter.p.m.custom.colors=${dressColor}`
              : dressFabric
              ?`filter.p.m.custom.fabric=${dressFabric}`
              : dressFeature
              ?`filter.p.m.custom.feature=${dressFeature}`
              : dressLength
              ?`filter.p.m.custom.dress_length=${dressLength}`
              : neckLine
              ?`filter.p.m.custom.neckline=${neckLine}`
              : sleeveLength
              ?`filter.p.m.custom.sleeve_length=${sleeveLength}`
              : ''    
            }&page=${
              currentPage + 1
            }`
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
          href={`${searchCat
            ? `${searchCat}?q=${query}&options[prefix]=last${
              lowerBoundary
                ? `&filter.v.price.gte=${lowerBoundary}`
                : upperBoundary
                ? `&filter.v.price.lte=${upperBoundary}`
                : lowerBoundary && upperBoundary
                ? `&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
                : ""
            }&sort_by=${sortBy}&page=${lastPage}`
            : `${collectionsCat}?sort_by=${sortBy}&${
              dressColor
              ? `filter.p.m.custom.colors=${dressColor}`
              : dressFabric
              ?`filter.p.m.custom.fabric=${dressFabric}`
              : dressFeature
              ?`filter.p.m.custom.feature=${dressFeature}`
              : dressLength
              ?`filter.p.m.custom.dress_length=${dressLength}`
              : neckLine
              ?`filter.p.m.custom.neckline=${neckLine}`
              : sleeveLength
              ?`filter.p.m.custom.sleeve_length=${sleeveLength}`
              : ''    
            }&page=${lastPage}`
          }`}
        >
          {lastPage}
        </Link>
      )}
    </section>
  );
}
