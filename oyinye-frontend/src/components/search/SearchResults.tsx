"use client";

import Link from "next/link";
import Pagination from "../layout/pagination/Pagination";
import React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ProductComponent from "../product/Product";
import useProduct from "@/store/useProduct";
import useWindowWidth from "../helpers/getWindowWidth";
import SecondaryHeader from "./filter/SecondaryHeader";
import FilterSettings from "./filter/Settings";
import axios from "axios";
import toast from "react-hot-toast";

export default function SearchResults({
  searchCat,
  keyword,
  data,
  lowerBoundary,
  upperBoundary,
  sortBy,
  productType,
  page,
  csrf
}: any) {
  const sortByList = React.useMemo(
    () => ["Relevance", "Price, low to high", "Price, high to low"],
    []
  );
  const path = usePathname();
  const productTypeList = ["Dresses", "Pants", "Jumpsuits"];
  //updating sortby product type params
  switch (
    sortBy.split("-").length === 1 ? sortBy.split("-")[0] : sortBy.split("-")[1]
  ) {
    case "relevance":
      sortBy = "Relevance";
      break;
    case "ascending":
      sortBy = "Price, low to high";
      break;

    default:
      sortBy = "Price, high to low";
      break;
  }

  const [query, setQuery] = React.useState(keyword);
  const { allProducts } = useProduct();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGridView, setIsGridView] = React.useState(true);
  const [filter, setFilter] = React.useState({
    noOfFilters:
      data.filterSettings && data.filterSettings.length > 0
        ? data.filterSettings[0].collection.no_of_Filters
        : 0,
    isVisible:
      data.filterSettings && data.filterSettings.length > 0
        ? data.filterSettings[0].collection.is_visible
        : true,
    showOutOfStock:
      data.filterSettings && data.filterSettings.length > 0
        ? data.filterSettings[0].search.show_out_of_stock
        : true,
    productType:
      data.filterSettings && data.filterSettings.length > 0
        ? data.filterSettings[0].search.product_type
        : "",
    priceRange:
      data.filterSettings && data.filterSettings.length > 0
        ? data.filterSettings[0].search.price_range
        : "",
    currentPriceBoundary:
      data.filterSettings && data.filterSettings.length > 0
        ? data.filterSettings[0].search.current_price_boundary
        : Math.floor(data.highestPrice),
  });
  const [isTyping, setIsTyping] = React.useState(false);
  const [sort, setSort] = React.useState<string>(sortBy);
  const [newPriceBoundary, setNewPriceBoundary] = React.useState<number>(
    upperBoundary ? upperBoundary : filter.currentPriceBoundary
  );
  const [price, setPrice] = React.useState<number>(
    lowerBoundary ? lowerBoundary : 0
  );
  const [sliderVal, setSliderVal] = React.useState<number[]>([
    lowerBoundary ? lowerBoundary : price,
    upperBoundary ? upperBoundary : filter.currentPriceBoundary,
  ]);
  let windowWidth = useWindowWidth();
  const [visible, setVisible] = React.useState(false);
  const [prevScrollPos, setPrevScrollPos] = React.useState(0);

  React.useEffect(() => {
    // Handling scroll
    const handleScroll = () => {
      const docScrollPos = window.scrollY;
      const element = document.querySelector(
        ".secondary-header"
      ) as HTMLElement;
      const main = document.querySelector(
        ".no-products-section"
      ) as HTMLElement;

      if (element) {
        const rect = element.getBoundingClientRect();
        const SHScrollPos = docScrollPos + rect.top;

        setVisible(prevScrollPos > docScrollPos && docScrollPos > SHScrollPos);
        setPrevScrollPos(docScrollPos);
      } else {
        const rect = main.getBoundingClientRect();
        const SHScrollPos = docScrollPos + rect.top;

        setVisible(prevScrollPos > docScrollPos && docScrollPos > SHScrollPos);
        setPrevScrollPos(docScrollPos);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible]);

  React.useEffect(() => {
    async function reloadPage() {
      if (isLoading) {
        if (filter.noOfFilters > 0) {
          try {
            const res = await axios.post(`/api/products/filter?type=search`,filter, {
              headers: {
                "x-csrf-token": csrf
              }
            });
  
            if(res.status != 201){
              throw new Error(res.data.message);
            }
          } catch (error) {
            const e = error as Error;
            return toast.error(e.message);
          }

        }

        const queryParams = [
          `q=${query}`,
          `options[prefix]=last`,
          !filter.showOutOfStock ? `filter.v.availability=1` : "",
          filter.productType.length > 0
            ? `filter.p.product_type=${filter.productType}`
            : "",
          price > 0 && newPriceBoundary === filter.currentPriceBoundary
            ? `filter.v.price.gte=${price}`
            : "",
          price > 0 && newPriceBoundary < filter.currentPriceBoundary
            ? `filter.v.price.gte=${price}&filter.v.price.lte=${newPriceBoundary}`
            : "",
          newPriceBoundary < filter.currentPriceBoundary && price === 0
            ? `filter.v.price.lte=${newPriceBoundary}`
            : "",
          `sort_by=${
            sort === sortByList[1]
              ? "price-ascending"
              : sort === sortByList[2]
              ? "price-descending"
              : "relevance"
          }`,
          `page=${page}`,
        ];
        // Filter out empty parameters
        const filteredParams = queryParams.filter((param) => param !== "");

        // Join the parameters to construct the query string
        const queryString = filteredParams.join("&");

        // Construct the new path
        const url = new URL(`${window.location.origin}${path}`);

        // Construct the final URL and replace the location
        window.location.href = url.toString() + "?" + queryString;
      }
    }
    reloadPage();
  }, [
    isLoading,
    filter,
    newPriceBoundary,
    page,
    price,
    query,
    sort,
    sortByList,
    path,
    csrf
  ]);

  React.useEffect(() => {
    if (windowWidth > 768) {
      const element = document.querySelector(
        ".secondary-header"
      ) as HTMLElement;
      const main = document.querySelector(
        ".no-products-section"
      ) as HTMLElement;

      if (element) {
        const rect = element.getBoundingClientRect();
        const docScrollPos = window.scrollY;
        const SHScrollPos = docScrollPos + rect.top;

        if (docScrollPos > SHScrollPos || SHScrollPos > docScrollPos) {
          window.scrollTo({
            top: SHScrollPos,
            behavior: "smooth",
          });
        }
      } else {
        const rect = main.getBoundingClientRect();
        const docScrollPos = window.scrollY;
        const SHScrollPos = docScrollPos + rect.top;

        if (docScrollPos > SHScrollPos || SHScrollPos > docScrollPos) {
          window.scrollTo({
            top: SHScrollPos,
            behavior: "smooth",
          });
        }
      }
    }
  }, [windowWidth]);

  //updating products with available products for the current price range
  data.products = data.products.filter((product: any) =>
    product.colors.every((color: any) => color.sizes.length > 0)
  );

  data.searchCat = searchCat;
  data.query = query;
  data.sortBy = sort;
  data.lowerBoundary = lowerBoundary;
  data.upperBoundary = upperBoundary;

  const pages = [
    { title: "Contact Us", route: `/other/contact` },
    { title: "About", route: `/other/about` },
    { title: "Login", route: `/login` },
    { title: "Signup", route: `/signup` },
    { title: "Shipping Policy", route: `/other/shipping-policy` },
    { title: "Returns Policy", route: `/other/returns-policy` },
    { title: "Privacy Policy", route: `/other/privacy-policy` },
    { title: "Size Guide", route: `/other/size-guide` },
  ];

  let productSuggestions = allProducts
    .slice(0, 6)
    .some((product: any) =>
      product.title.includes(
        query.charAt(0).toUpperCase() + query.slice(1)
      )
    );
  let otherSuggestions = pages.some((page) =>
    page.title.includes(query.charAt(0).toUpperCase() + query.slice(1))
  );

  let otherSearchResults = productSuggestions || otherSuggestions;

  return (
    <>
      <div
        className={`${
          visible ? "show" : "hide"
        } mx-auto container px-7 fixed top-[95px] z-10 bg-white h-[46px] shadow-md py-2 md:hidden max-w-7xl`}
      >
        <SecondaryHeader
          setFilter={setFilter}
          filter={filter}
          sort={sort}
          setSort={setSort}
          setIsLoading={setIsLoading}
          sortByList={sortByList}
          productsLength={data.products.length}
          isGridView={isGridView}
          setIsGridView={setIsGridView}
          classes
          windowWidth={windowWidth}
          newPriceBoundary={newPriceBoundary}
          currentPriceBoundary={filter.currentPriceBoundary}
          setPrice={setPrice}
          setSliderVal={setSliderVal}
          price={price}
          prodType={productType}
          setNewPriceBoundary={setNewPriceBoundary}
          sliderVal={sliderVal}
          productTypeList={productTypeList}
        />
      </div>
      <main
        className={`bg-white w-full min-h-screen md:pt-12 pt-5 pb-6 flex flex-col pl-2 pr-3 lg:pl-0 lg:pr-6 container mx-auto relative no-products-section ${
          data.products.length === 0 &&
          !lowerBoundary &&
          !upperBoundary &&
          !productType &&
          filter.showOutOfStock
            ? "space-y-36"
            : "space-y-6"
        }`}
      >
        <header className="flex flex-col items-center gap-y-4 justify-center mb-7">
          <h1 className="text-3xl font-sans md:inline-block hidden">
            Search Results
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsLoading(true);
            }}
            className="mx-auto h-full border border-gray-500 max-w-7xl md:w-[55%] w-full focus-within:border-2 focus-within:border-gray-600 relative"
          >
            <div className="flex flex-row items-center justify-between px-4 py-[6px]">
              <div className="flex flex-col items-start w-full">
                <h5 className="text-[.7rem] font-thin font-sans text-gray-600">
                  Search
                </h5>
                <input
                  className="max-w-7xl flex-grow focus:outline-none text-[1rem] text-gray-800 w-full"
                  onInput={(e) => {
                    let input = e.currentTarget;
                    setQuery(input.value);
                    if (!isTyping) {
                      setIsTyping(true);
                    }
                  }}
                  value={query}
                />
              </div>
              <section className="flex flex-row items-center">
                {query.length > 0 && (
                  <div className="inline-flex flex-row pr-3">
                    <i
                      className="fa-regular fa-circle-xmark text-[1rem] text-gray-400 cursor-pointer"
                      onClick={() => setQuery("")}
                    ></i>
                  </div>
                )}
                {query.length > 0 && (
                  <span className="border border-l-0 border-t-0 border-b-0 border-gray-400 text-gray-400 h-6 w-px"></span>
                )}
                <div className="pl-3 pt-1">
                  <i
                    className="fa-solid fa-search text-lg text-gray-400 cursor-pointer"
                    onClick={() => setIsLoading(true)}
                  ></i>
                </div>
              </section>
            </div>
            {isTyping && allProducts.length === 0 && (
              <div className="z-10 shadow-md flex items-center justify-center bg-white pt-1 h-[38px] absolute left-0 top-[53.5px] w-full">
                <span className="loader spin"></span>
              </div>
            )}
            {isTyping && allProducts.length > 0 && (
              <div className="z-10 shadow-md absolute left-0 top-[53.5px] bg-white pt-3 h-fit w-full flex flex-col">
                <section className="flex flex-row">
                  {otherSearchResults && (
                    <section className="flex flex-col w-[30%] gap-y-5">
                      {productSuggestions && (
                        <section className="flex flex-col w-full">
                          <h4 className="font-sans text-gray-300 text-[.8rem] border border-t-0 border-l-0 border-r-0 pb-2 ml-5 mr-5">
                            SUGGESTIONS
                          </h4>
                          <ul className="flex flex-col">
                            {allProducts
                              .filter((product: any) =>
                                product.title.includes(
                                  query.charAt(0).toUpperCase() + query.slice(1)
                                )
                              )
                              .map((product: any, i: number) => (
                                <li
                                  className=" hover:underline-offset-1 hover:underline cursor-pointer hover:bg-gray-100 px-5 py-2"
                                  key={i}
                                  onClick={() =>
                                    window.location.href =
                                      `/products/${product.title
                                        .replace(" ", "-")
                                        .toLowerCase()}/${JSON.stringify(
                                        product.colors[0].name
                                      )}/${product.colors[0].sizes[0]
                                        .variant_id!}`
                                    
                                  }
                                >
                                  <span className="font-sans text-gray-400 text-[.8rem]">
                                    {product.title.charAt(0)}
                                  </span>
                                  <span className="font-sans font-semibold text-[.8rem]">
                                    {product.title.slice(1)}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        </section>
                      )}
                      {otherSuggestions && (
                        <section className="flex flex-col w-full">
                          <h4 className="font-sans text-gray-300 text-[.8rem] border border-t-0 border-l-0 border-r-0 pb-2 ml-5 mr-5">
                            PAGES
                          </h4>
                          <ul className="flex flex-col">
                            {pages
                              .filter((page) =>
                                page.title.includes(
                                  query.charAt(0).toUpperCase() + query.slice(1)
                                )
                              )
                              .map((page) => (
                                <li
                                  className=" hover:underline-offset-1 hover:underline cursor-pointer hover:bg-gray-100 px-5 py-2"
                                  key={page.title}
                                >
                                  <Link
                                    href={page.route}
                                    className="font-sans text-gray-500 text-[.8rem]"
                                  >
                                    {page.title}
                                  </Link>
                                </li>
                              ))}
                          </ul>
                        </section>
                      )}
                    </section>
                  )}
                  <section
                    className={`flex flex-col ${
                      otherSearchResults ? "w-[70%]" : "w-full"
                    }`}
                  >
                    <h4 className="font-sans text-gray-300 text-[.8rem] border border-t-0 border-l-0 border-r-0 pb-2 ml-4 mr-4">
                      PRODUCTS
                    </h4>
                    <ul className="flex flex-col">
                      {allProducts
                        .slice(0, 4)
                        .map((product: any, i: number) => (
                          <li key={i}>
                            <article
                              onClick={() =>
                                window.location.href =
                                  `/products/${product.title
                                    .replace(" ", "-")
                                    .toLowerCase()}/${
                                    product.colors[0].name
                                  }/${product.colors[0].sizes[0].variant_id!}`
                                
                              }
                              className="flex flex-row items-start gap-x-5 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                            >
                              <Image
                                alt={`Product ${i + 1}`}
                                src={product.colors[0].image_front_base64[0]}
                                width={50}
                                height={65}
                              />
                              <section>
                                <h2 className="font-sans text-[1rem] font-medium hover:underline-offset-1 hover:underline">
                                  {product.title}
                                </h2>
                                <h2 className="font-sans font-thin text-gray-400 text-[.9rem]">
                                  &#8358;
                                  {product.colors[0].sizes[0].price.toLocaleString()}
                                </h2>
                              </section>
                            </article>
                          </li>
                        ))}
                    </ul>
                  </section>
                </section>
                <footer
                  onClick={() => {
                    setIsLoading(true);
                  }}
                  className="relative bottom-0 cursor-pointer flex flex-row justify-between items-center font-sans hover:bg-gray-100 text-[.8rem] border border-b-0 border-l-0 border-r-0 py-2 px-5 mt-4 group"
                >
                  <h5 className="font-sans text-gray-500 text-sm">
                    Search for &quot;{query}&quot;
                  </h5>
                  {isLoading ? (
                    <div className="loader spin"></div>
                  ) : (
                    <i className="absolute right-5 cursor-pointer fa-solid fa-arrow-right-long text-gray-600 font-semibold transition-all duration-300 group-hover:right-4"></i>
                  )}
                </footer>
              </div>
            )}
          </form>
        </header>
        {(data.products.length > 0 ||
          (data.products.length === 0 &&
            (upperBoundary ||
              lowerBoundary ||
              productType ||
              !filter.showOutOfStock))) && (
          <SecondaryHeader
            setFilter={setFilter}
            filter={filter}
            sort={sort}
            setSort={setSort}
            setIsLoading={setIsLoading}
            sortByList={sortByList}
            productsLength={data.products.length}
            isGridView={isGridView}
            setIsGridView={setIsGridView}
            windowWidth={windowWidth}
            newPriceBoundary={newPriceBoundary}
            currentPriceBoundary={filter.currentPriceBoundary}
            setPrice={setPrice}
            productTypeList={productTypeList}
            setSliderVal={setSliderVal}
            prodType={productType}
            price={price}
            setNewPriceBoundary={setNewPriceBoundary}
            sliderVal={sliderVal}
          />
        )}
        <section
          className={`${
            data.products.length === 0 &&
            !lowerBoundary &&
            !upperBoundary &&
            !productType &&
            filter.showOutOfStock
              ? "justify-center flex-col"
              : "justify-evenly md:flex-row flex-col"
          } flex items-center w-full flex-wrap md:gap-x-5 gap-y-9`}
        >
          {data.products.length === 0 &&
          !lowerBoundary &&
          !upperBoundary &&
          !productType &&
          filter.showOutOfStock ? (
            <section className="flex items-center flex-col">
              <h1 className="font-sans text-xl">No {searchCat} available!</h1>
              <h1 className="font-sans text-sm">
                Try a different search parameter
              </h1>
            </section>
          ) : data.products.length === 0 &&
            (upperBoundary ||
              lowerBoundary ||
              productType ||
              !filter.showOutOfStock) ? (
            <section
              className={`flex flex-row pt-5 w-full md:gap-x-[40px] md:justify-start justify-center`}
            >
              {filter.isVisible && (
                <FilterSettings
                  setFilter={setFilter}
                  filter={filter}
                  newPriceBoundary={newPriceBoundary}
                  currentPriceBoundary={filter.currentPriceBoundary}
                  setPrice={setPrice}
                  setSliderVal={setSliderVal}
                  setIsLoading={setIsLoading}
                  price={price}
                  prodType={productType}
                  productTypeList={productTypeList}
                  setNewPriceBoundary={setNewPriceBoundary}
                  sliderVal={sliderVal}
                />
              )}
              <section
                className={`${
                  filter.isVisible ? "md:w-[50%]" : "w-full"
                } flex items-center flex-col mt-24`}
              >
                <h1 className="font-sans text-xl">No {searchCat} available!</h1>
                <h1 className="font-sans text-sm">
                  Try a different search parameter
                </h1>
              </section>
            </section>
          ) : (
            <section className="flex flex-row pt-5 w-full gap-x-[40px] h-full">
              {filter.isVisible && (
                <FilterSettings
                  setFilter={setFilter}
                  filter={filter}
                  newPriceBoundary={newPriceBoundary}
                  currentPriceBoundary={filter.currentPriceBoundary}
                  setPrice={setPrice}
                  setSliderVal={setSliderVal}
                  setIsLoading={setIsLoading}
                  price={price}
                  prodType={productType}
                  productTypeList={productTypeList}
                  setNewPriceBoundary={setNewPriceBoundary}
                  sliderVal={sliderVal}
                />
              )}
              <div
                className={`${
                  filter.isVisible ? "md:w-[80%]" : "w-full"
                } flex md:flex-row ${
                  isGridView ? "flex-row" : "flex-col"
                } items-center h-full overflow-y-auto hide-scrollbar justify-evenly flex-wrap gap-x-1 gap-y-4`}
              >
                {data.products.map((product: any, i: number) => (
                  <ProductComponent
                    key={i}
                    product={product}
                    isSearchProduct
                    imageH={filter.isVisible ? 650 : null}
                    imageW={filter.isVisible ? 229 : null}
                    isGridView={isGridView}
                    setIsGridView={setIsGridView}
                    csrf={csrf}
                  />
                ))}
              </div>
            </section>
          )}
        </section>
        {isLoading && (
          <section className="absolute top-[60px] z-20 left-0 bg-white/50 w-full h-full">
            <div className="loader spin absolute top-4 right-4"></div>
          </section>
        )}
        {data.products.length > 0 && <Pagination {...data} />}
      </main>
    </>
  );
}
