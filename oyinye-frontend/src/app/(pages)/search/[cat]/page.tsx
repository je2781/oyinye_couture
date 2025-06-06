import Footer from "@/components/footer/Footer";
import Header from "@/components/layout/header/Header";
import SearchResults from "@/components/search/SearchResults";
import api from "@/helpers/axios";
import { getCsrfToken } from "@/helpers/getHelpers";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

async function getSearchData(
  query: string,
  sortBy: string,
  page: string,
  lowerBoundary?: string,
  upperBoundary?: string,
  availability?: string,
  productType?: string
) {
  const queryParams = [
    `q=${query}`,
    availability ? `filter.v.availability=${availability}` : "",
    productType ? `filter.p.product_type=${productType}` : "",
    lowerBoundary ? `filter.v.price.gte=${lowerBoundary}` : "",
    upperBoundary ? `filter.v.price.lte=${upperBoundary}` : "",
    upperBoundary && lowerBoundary
      ? `filter.v.price.gte=${lowerBoundary}&filter.v.price.lte=${upperBoundary}`
      : "",
    `sort_by=${sortBy}`,
    `page=${page}`,
  ];
  // Filter out empty parameters
  const filteredParams = queryParams.filter((param) => param !== "");

  // Join the parameters to construct the query string
  const queryString = filteredParams.join("&");

  let uri = `${process.env.WEB_DOMAIN}/api/products/search?${queryString}`;

  const res = await api.get(uri, {
    headers: {
      "Cache-Control": "no-store",
    },
  });

  return res.data;
}

async function getCart() {
  const cookieStore = cookies();
  const cartId = cookieStore.get("cart")?.value;

  if (cartId && cartId.length > 0) {
    const res = await api.get(
      `${process.env.WEB_DOMAIN}/api/products/cart/${cartId}`,
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    return res.data.cartItems;
  } else {
    return [];
  }
}

const SearchPage = async ({ params, searchParams }: any) => {
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;
  const csrfToken = await getCsrfToken();

  if (token && isAdmin) {
    redirect("/admin/summary");
  }

  const keyword = searchParams.q;
  const sortBy = searchParams.sort_by;
  const page = searchParams.page;
  const upperBoundary = searchParams["filter.v.price.lte"];
  const lowerBoundary = searchParams["filter.v.price.gte"];
  const availability = searchParams["filter.v.availability"];
  const productType = searchParams["filter.p.product_type"];

  const searchData = await getSearchData(
    keyword,
    sortBy,
    page,
    lowerBoundary,
    upperBoundary,
    availability,
    productType
  );
  const cartItems = await getCart();

  return (
    <>
      <Header cartItems={cartItems} />
      <SearchResults
        {...{
          searchCat: params.cat,
          keyword,
          data: searchData,
          lowerBoundary,
          upperBoundary,
          sortBy,
          productType,
          availability,
          page,
          csrf: csrfToken,
        }}
      />
      <Footer csrfToken={csrfToken} />
    </>
  );
};

export default SearchPage;
