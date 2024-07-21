

import Header from '@/components/Header';
import SearchResults from '@/components/SearchResults';

export const dynamicParams = true;
 
export async function generateStaticParams() {
  return [];
}
 
async function getSearchData(query: string, sortBy: string, page: string, lowerBoundary?: string, upperBoundary?: string){
  let uri = `${process.env.DOMAIN}/api/products/search?q=${query}&sort_by=${sortBy}&page=${page}`;

  if(lowerBoundary){
    uri = `${process.env.DOMAIN}/api/products/search?q=${query}&filter.v.price.gte=${lowerBoundary}&sort_by=${sortBy}&page=${page}`;
  }
  if(upperBoundary){
    uri = `${process.env.DOMAIN}/api/products/search?q=${query}&filter.v.price.lte=${upperBoundary}&sort_by=${sortBy}&page=${page}`;
  }
  if(upperBoundary && lowerBoundary){
    uri = `${process.env.DOMAIN}/api/products/search?q=${query}&filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}&sort_by=${sortBy}&page=${page}`;
  }
  const res = await fetch(
    uri, {cache: 'no-cache'}
    );
    const data = await res.json();

    return data;
}

const SearchPage = async ({ params, searchParams}: any) => {
    const keyword = searchParams.q;
    const sortBy = searchParams.sort_by;
    const page = searchParams.page;
    const upperBoundary = searchParams['filter.v.price.lte'];
    const lowerBoundary = searchParams['filter.v.price.gte'];

    const searchData = await getSearchData(keyword, sortBy, page, lowerBoundary, upperBoundary);
  return (
    <>
    <Header/>
    <SearchResults  {...{
      searchCat: params.cat,
      keyword,
      data: searchData,
      lowerBoundary,
      upperBoundary,
      sortBy,
      page
    }} />
    </>
  );
};

export default SearchPage;
