

import Footer from '@ui/src/components/footer/Footer';
import Header from '@ui/src/components/layout/header/Header';
import SearchResults from '@ui/src/components/search/SearchResults';
import { cookies, headers} from 'next/headers';
import { redirect } from 'next/navigation';

async function getSearchData(query: string, sortBy: string, page: string, lowerBoundary?: string, upperBoundary?: string, availability?: string, productType?: string){

  const queryParams = [
    `q=${query}`,
    availability ? `filter.v.availability=${availability}` : '',
    productType ? `filter.p.product_type=${productType}` : '',
    lowerBoundary ? `filter.v.price.gte=${lowerBoundary}` : '',
    upperBoundary ? `filter.v.price.lte=${upperBoundary}` : '',
    upperBoundary && lowerBoundary ? `filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}` : '',
    `sort_by=${sortBy}`,
    `page=${page}`
  ];
  // Filter out empty parameters
  const filteredParams = queryParams.filter(param => param !== '');

  // Join the parameters to construct the query string
  const queryString = filteredParams.join('&');
  
  const uri = `${process.env.WEB_DOMAIN!}/api/products/search?${queryString}`;

  const res = await fetch(
    uri, {cache: 'no-cache'}
    );
    const data = await res.json();

    return data;
}


async function getCart() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cart')?.value;

  if(cartId && cartId.length > 0){
    const res = await fetch(`${process.env.WEB_DOMAIN!}/api/products/cart/${cartId}`, {cache: 'no-cache'});
    const data = await res.json();
  
    return data.cartItems;
  }else{
    return [];
  }
}

const SearchPage = async ({ params, searchParams}: any) => {
    const keyword = searchParams.q;
    const sortBy = searchParams.sort_by;
    const page = searchParams.page;
    const upperBoundary = searchParams['filter.v.price.lte'];
    const lowerBoundary = searchParams['filter.v.price.gte'];
    const availability = searchParams['filter.v.availability'];
    const productType = searchParams['filter.p.product_type'];

    const searchData = await getSearchData(keyword, sortBy, page, lowerBoundary, upperBoundary, availability, productType);
    const cartItems = await getCart();

    const h = await headers();
    const csrfToken = h.get('X-CSRF-Token') || 'missing';
 
  //protecting public routes
    const cookieStore = await cookies();
    const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
    const token = cookieStore.get("access_token")?.value;
  
    if (token && isAdmin) {
      redirect(`${process.env.ADMIN_DOMAIN}/admin/summary`);
    }

  return (
    <>
    <Header cartItems={cartItems} />
    <SearchResults  {...{
      searchCat: params.cat,
      keyword,
      data: searchData,
      lowerBoundary,
      upperBoundary,
      sortBy,
      productType,
      availability,
      page,
      csrf: csrfToken
    }} />
    <Footer csrf={csrfToken}/>
    </>
  );
};

export default SearchPage;
