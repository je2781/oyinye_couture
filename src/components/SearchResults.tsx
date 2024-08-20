"use client";

import Link from "next/link";
import Pagination from "./layout/Pagination";
import React from "react";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProductComponent from "./Product";
import useProduct from "@/store/useProduct";
import "./SearchResults.css";
import FilterSettings from "./filter/Settings";
import SecondaryHeader from "./filter/SecondaryHeader";
import useWindowWidth from "./helpers/getWindowWidth";

export default function SearchResults({
  searchCat,
  keyword,
  data,
  lowerBoundary,
  upperBoundary,
  sortBy,
  productType,
  page,
}: any) {
  const sortByList = ["Relevance", "Price, low to high", "Price, high to low"];
  const productTypeList = ["Dresses", "Pants", "Jumpsuits"];
  //updating sortby product type params
  switch ((sortBy.split('-').length === 1 ? sortBy.split('-')[0] : sortBy.split('-')[1])) {
    case 'relevance':
      sortBy = 'Relevance';
      break;
    case 'ascending':
      sortBy = "Price, low to high";
      break;
  
    default:
      sortBy = "Price, high to low";
      break;
  }


  const [query, setQuery] = React.useState(keyword);
  const router = useRouter();
  const { allProducts } = useProduct();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGridView, setIsGridView] = React.useState(true);
  const [filter, setFilter] = React.useState({
    noOfFilters: data.filterSettings.length > 0 ? data.filterSettings[0].noOfFilters : 0,
    isVisible: data.filterSettings.length > 0 ? data.filterSettings[0].isVisible : true,
    showOutOfStock: data.filterSettings.length > 0 ? data.filterSettings[0].showOutOfStock : true,
    productType: data.filterSettings.length > 0 ? data.filterSettings[0].productType : '',
    priceRange: data.filterSettings.length > 0 ? data.filterSettings[0].priceRange : '',
    currentPriceBoundary: data.filterSettings.length > 0 ? data.filterSettings[0].currentPriceBoundary : Math.floor(data.highestPrice)
  });
  const [isTyping, setIsTyping] = React.useState(false);
  const [sort, setSort] = React.useState<string>(
    sortBy
  );
  const [newPriceBoundary, setNewPriceBoundary] = React.useState<number>(
    upperBoundary ? upperBoundary : filter.currentPriceBoundary
  );
  const [price, setPrice] = React.useState<number>(lowerBoundary ? lowerBoundary : 0);
  const [sliderVal, setSliderVal] = React.useState<number[]>([lowerBoundary ? lowerBoundary : price, upperBoundary ? upperBoundary : filter.currentPriceBoundary]);
  let windowWidth = useWindowWidth();
  const [visible, setVisible] = React.useState(false);
  const [prevScrollPos, setPrevScrollPos] = React.useState(0);

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible]);

  
  // Handling scroll
  const handleScroll = () => {
    const docScrollPos = window.scrollY;
    const SHScrollPos = getSecondaryHeaderScrollYPosition();

    setVisible(prevScrollPos > docScrollPos && docScrollPos > SHScrollPos);
    setPrevScrollPos(docScrollPos);
  };


  // Handling scroll
  const handleSearchContentScrollPosition = () => {
    
      const SHScrollPos = getSecondaryHeaderScrollYPosition();
      const docScrollPos = window.scrollY;
  
      if(docScrollPos > SHScrollPos || SHScrollPos > docScrollPos){
        window.scrollTo({
          top: SHScrollPos,
          behavior: 'smooth'
        });
      }
    
  }

  function getSecondaryHeaderScrollYPosition() {
    const element = document.querySelector(`${data.products.length > 0 ? '.secondary-header': '.no-products-section'}`) as HTMLElement;

    const rect = element.getBoundingClientRect();
    return window.scrollY + rect.top;
    
  }

  React.useEffect(() => {
    async function reloadPage(){
      if (isLoading) {
        if(filter.noOfFilters > 0){
          await fetch('/api/products/filter',{
            method: 'POST',
            body: JSON.stringify(filter)
          })
        }

        const queryParams = [
          `q=${query}`,
          `options[prefix]=last`,
          !filter.showOutOfStock ? `filter.v.availability=1` : '',
          filter.productType.length > 0 ? `filter.p.product_type=${filter.productType}` : '',
          price > 0 && newPriceBoundary === filter.currentPriceBoundary ? `filter.v.price.gte=${price}` : '',
          price > 0 && newPriceBoundary < filter.currentPriceBoundary ? `filter.v.price.gte=${price}&filter.v.price.lte=${newPriceBoundary}` : '',
          newPriceBoundary < filter.currentPriceBoundary && price === 0 ? `filter.v.price.lte=${newPriceBoundary}` : '',
          `sort_by=${
            sort === sortByList[1]
              ? "price-ascending"
              : sort === sortByList[2]
              ? "price-descending"
              : "relevance"
          }`,
          `page=${page}`
        ];
        // Filter out empty parameters
        const filteredParams = queryParams.filter(param => param !== '');

        // Join the parameters to construct the query string
        const queryString = filteredParams.join('&');

        // Construct the final URL and replace the location
        location.replace(`/search/products?${queryString}`);
      }
    }
    reloadPage();
  }, [isLoading]);

  React.useEffect(() => {
    if(windowWidth > 768){

      handleSearchContentScrollPosition();
    }

  }, []);

  //updating products with available products for the current price range
  data.products = data.products.filter((product: any) => product.colors.every((color: any) => color.sizes.length > 0));

  data.searchCat = searchCat;
  data.query = query;
  data.sortBy = sort;
  data.lowerBoundary = lowerBoundary;
  data.upperBoundary = upperBoundary;

  const pages = [
    { title: "Contact Us", route: "/contact" },
    { title: "About", route: "/about" },
    { title: "Login", route: "/login" },
    { title: "Signup", route: "/signup" },
    { title: "Shipping Policy", route: "/policies/shipping-policy" },
  ];

  let productSuggestions = allProducts
    .slice(0, 6)
    .some((product: any) =>
      product.title.includes(query.charAt(0).toUpperCase() + query.slice(1))
    );
  let otherSuggestions = pages.some((page) =>
    page.title.includes(query.charAt(0).toUpperCase() + query.slice(1))
  );

  let otherSearchResults = productSuggestions || otherSuggestions;

  return (
    <>
      <section className={`${
            visible ? "show" : "hide"
          } mx-auto container px-7 fixed top-[60px] z-10 bg-white h-11 shadow-md py-2 md:hidden`}>
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
      </section>
      <main
        className={`bg-white w-full min-h-screen md:pt-12 pt-5 pb-6 flex flex-col px-8 max-w-7xl relative ${
          data.products.length === 0  && !lowerBoundary && !upperBoundary && !productType && filter.showOutOfStock ? "space-y-36" : "space-y-6"
        }`}
      >
        <header className="flex flex-col items-center gap-y-4 justify-center mb-7">
          <h1 className="text-3xl font-sans md:inline-block hidden">Search Results</h1>
          <form onSubmit={(e) => {
            e.preventDefault();
            setIsLoading(true);
          }} className="mx-auto h-full border border-gray-500 max-w-7xl md:w-[55%] w-full focus-within:border-2 focus-within:border-gray-600 relative">
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
                <span className="loader"></span>
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
                                    router.push(
                                      `/products/${product.title
                                        .replace(" ", "-")
                                        .toLowerCase()}/${product.colors[0].type.toLowerCase()}/${product
                                        .colors[0].sizes[0].variantId!}`
                                    )
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
                      {allProducts.slice(0, 4).map((product: any, i: number) => (
                        <li key={i}>
                          <article
                            onClick={() =>
                              router.push(
                                `/products/${product.title
                                  .replace(" ", "-")
                                  .toLowerCase()}/${product.colors[0].type.toLowerCase()}/${product
                                  .colors[0].sizes[0].variantId!}`
                              )
                            }
                            className="flex flex-row items-start gap-x-5 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                          >
                            <Image
                              alt={`Product ${i + 1}`}
                              src={product.colors[0].imageFrontBase64[0]}
                              width={50}
                              height={65}
                            />
                            <section>
                              <h3 className="font-sans text-[1rem] font-medium hover:underline-offset-1 hover:underline">
                                {product.title}
                              </h3>
                              <h3 className="font-sans font-thin text-gray-400 text-[.9rem]">
                                &#8358;
                                {product.colors[0].sizes[0].price.toLocaleString()}
                              </h3>
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
                    Search for "{query}"
                  </h5>
                  {isLoading ? (
                    <div className="loader"></div>
                  ) : (
                    <i className="absolute right-5 cursor-pointer fa-solid fa-arrow-right-long text-gray-600 font-semibold transition-all duration-300 group-hover:right-4"></i>
                  )}
                </footer>
              </div>
            )}
          </form>
        </header>
        {(data.products.length > 0 || (data.products.length === 0 && (upperBoundary || lowerBoundary || productType || !filter.showOutOfStock) )) &&
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
        }
        <section
          className={`${
            data.products.length === 0 && !lowerBoundary && !upperBoundary && !productType && filter.showOutOfStock 
              ? "justify-center flex-col"
              : "justify-evenly md:flex-row flex-col"
          } flex items-center w-full flex-wrap md:gap-x-5 gap-y-9`}
        >
          {data.products.length === 0 && !lowerBoundary && !upperBoundary && !productType && filter.showOutOfStock ? (
            <section className="flex items-center flex-col no-products-section">
              <h1 className="font-sans text-xl">No {searchCat} available!</h1>
              <h1 className="font-sans text-sm">
                Try a different search parameter
              </h1>
            </section>
          ) : data.products.length === 0 && (upperBoundary || lowerBoundary || productType || !filter.showOutOfStock)
          ? <section className={`flex flex-row pt-5 w-full md:gap-x-[40px] md:justify-start justify-center`}>
            {filter.isVisible && <FilterSettings 
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
            
            />}
            <section className={`${filter.isVisible ? 'md:w-[50%]': 'w-full'} flex items-center flex-col mt-24 no-products-section `}>
              <h1 className="font-sans text-xl">No {searchCat} available!</h1>
              <h1 className="font-sans text-sm">
                Try a different search parameter
              </h1>
            </section>
            </section>
          : (
            <section className="flex flex-row pt-5 w-full gap-x-[40px] h-full">
              {filter.isVisible && <FilterSettings 
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
                
                />}
              <div className={`${filter.isVisible ? 'md:w-[80%]': 'w-full'} flex md:flex-row ${isGridView ? 'flex-row': 'flex-col'} items-center md:h-full md:overflow-y-auto hide-scrollbar justify-evenly flex-wrap gap-x-4 gap-y-3`}>
                {data.products.map((product: any, i: number) => (
                  <ProductComponent
                    key={i}
                    product={product}
                    isSearchProduct
                    imageH={filter.isVisible ? 600: null}
                    imageW={filter.isVisible ? 200: null}
                    isGridView={isGridView}
                    setIsGridView={setIsGridView}
                  />
                ))}
              </div>
            </section>
          )}
        </section>
        {isLoading && <section className="absolute top-[120px] z-20 left-0 bg-white/50 w-full h-full">
        </section>}
        {data.products.length > 0 && <Pagination {...data} />}
      </main>
    </>
  );
}
