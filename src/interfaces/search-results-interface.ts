export interface SearchResults{
    products: any[],
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    lastPage: number,
    isActivePage: number,
    nextPage: number,
    currentPage: number,
    previousPage: number,
    searchCat?: string,
   query?: string,
   sortBy?: string,
   lowerBoundary?: string,
   upperBoundary?: string
  }