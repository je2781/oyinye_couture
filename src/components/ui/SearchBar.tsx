"use client";

import React from "react";
import Image from "next/image";
import { SearchModal } from "./Modal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useProduct from "@/store/useProduct";
import useGlobal from "@/store/useGlobal";

const SearchBar = ({ onHideModal}: any) => {
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const {allProducts} = useProduct();
  const [isLoading, setIsLoading] = React.useState(false);
  const {locale} = useGlobal();

  let currentUrl = `/search/products?q=${query}&options[prefix]=last&sort_by=relevance&page=1`;

  React.useEffect(() => {
    if(isLoading){
      if(location.href.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)[1] === currentUrl){
        location.replace(currentUrl);
      }else{
        router.push(`/search/products?q=${query}&options[prefix]=last&sort_by=relevance&page=1`);
      }
    }

  }, [isLoading]);


  const pages = [
    { title: "Contact Us", route: `/pages/contact` },
    { title: "About", route: `/pages/about` },
    { title: "Login", route: `/login` },
    { title: "Signup", route: `/signup` },
    { title: "Shipping Policy", route: `/pages/shipping-policy` },
    {title: "Returns Policy", route: `/pages/returns-policy`},
    {title: "Privacy Policy", route: `/pages/privacy-policy`},
    {title: "Size Guide", route: `/pages/size-guide`},
  ];

  let productSuggestions = allProducts.slice(0, 6).some((product: any)=> product.title.includes(query.charAt(0).toUpperCase() + query.slice(1)));
  let otherSuggestions =  pages.some(page => page.title.includes(query.charAt(0).toUpperCase() + query.slice(1)));

  let otherSearchResults = productSuggestions || otherSuggestions;

  return (
    <SearchModal onClose={onHideModal}>
      <form onSubmit={(e) => {
        e.preventDefault();
        setIsLoading(true);
      }} className="mx-auto container h-full border border-gray-500 max-w-7xl md:w-[55%] w-[90%] focus-within:border-2 focus-within:border-gray-600 relative">
        <section className="flex flex-row items-center justify-between px-4 py-[6px]">
          <div className="flex flex-col items-start w-full">
            <h5 className="text-[.7rem] font-thin font-sans text-gray-600">
              Search
            </h5>
            <input
              className="max-w-7xl flex-grow focus:outline-none text-[1rem] text-gray-800 w-full"
              onInput={(e) => {
                let input = e.currentTarget;
                setQuery(input.value);
              }}
              autoFocus
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
              <i className="fa-solid fa-search text-lg text-gray-400 cursor-pointer" onClick={() => {
                setIsLoading(true);
              }}></i>
            </div>
          </section>
        </section>
        {query.length > 0 && allProducts.length === 0 &&
          <div className="flex items-center justify-center bg-white pt-1 h-[38px] absolute left-0 top-[55px] w-full">
              <span className="loader"></span>
          </div>
        }
        {query.length > 0 && allProducts.length > 0 &&
          <div className="absolute left-0 top-[55px] bg-white pt-3 h-fit w-full flex flex-col">
            <section className="flex flex-row">
              { otherSearchResults &&
                <section className="flex flex-col md:w-[30%] w-[35%] gap-y-5">
                  {productSuggestions && <section className="flex flex-col w-full">
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
                            onClick={() => router.push(`/products/${product.title.replace(' ', '-').toLowerCase()}/${product.colors[0].type.toLowerCase()}/${product.colors[0].sizes[0].variantId!}`)} 
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
                  </section>}
                  {otherSuggestions && <section className="flex flex-col w-full">
                    <h4 className="font-sans text-gray-300 text-[.8rem] border border-t-0 border-l-0 border-r-0 pb-2 ml-5 mr-5">
                      PAGES
                    </h4>
                    <ul className="flex flex-col">
                      {pages
                        .filter(page =>
                          page.title.includes(
                            query.charAt(0).toUpperCase() + query.slice(1)
                          )
                        )
                        .map(page => (
                          <li
                            className=" hover:underline-offset-1 hover:underline cursor-pointer hover:bg-gray-100 px-5 py-2"
                            key={page.title}
                          >
                            <Link href={page.route} className="font-sans text-gray-500 text-[.8rem]">
                                {page.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </section>}
                </section>}
                <section className={`flex flex-col ${otherSearchResults ? 'md:w-[70%] w-[65%]' : 'w-full'}`}>
                  <h4 className="font-sans text-gray-300 text-[.8rem] border border-t-0 border-l-0 border-r-0 pb-2 ml-4 mr-4">
                    PRODUCTS
                  </h4>
                  <ul className="flex flex-col">
                    {allProducts.slice(0, 4).map((product: any, i: number) => (
                      <li key={i}>
                        <article onClick={() => router.push(`/products/${product.title.replace(' ', '-').toLowerCase()}/${product.colors[0].type.toLowerCase()}/${product.colors[0].sizes[0].variantId!}`)} 
                        className="flex flex-row items-start gap-x-5 px-4 py-3 hover:bg-gray-100 cursor-pointer">
                          <Image
                            alt={`Product ${i + 1}`}
                            src={product.colors[0].imageFrontBase64[0]}
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
            <footer  onClick={() => {
                setIsLoading(true);
            }} className="relative bottom-0 cursor-pointer flex flex-row justify-between items-center font-sans hover:bg-gray-100 text-[.8rem] border border-b-0 border-l-0 border-r-0 py-2 px-5 mt-4 group">
                  <h5 className="font-sans text-gray-500 text-sm">Search for "{query}"</h5>
                  {isLoading ? <div className="loader"></div> :
                    <i className="absolute right-5 cursor-pointer fa-solid fa-arrow-right-long text-gray-600 font-semibold transition-all duration-300 group-hover:right-4"></i>}
            </footer>
          </div>
        }
      </form>
    </SearchModal>
  );
};

export default SearchBar;
