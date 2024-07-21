'use client';

import Link from "next/link";
import Pagination from "./layout/Pagination";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProductComponent from "./Product";
import useProduct from "@/store/useProduct";
import On from '../../public/on.png';
import Off from '../../public/off.png';
import './SearchResults.css';

export default function SearchResults({searchCat, keyword, data, lowerBoundary, upperBoundary, sortBy, page}: any){
    const [query, setQuery] = React.useState(keyword);
    const router = useRouter();
    const {allProducts} = useProduct();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isActivated, setIsActivated] = React.useState(true);
    const [isTyping, setIsTyping] = React.useState(false);
    const [sort, setSort] = React.useState(sortBy.charAt(0).toUpperCase() + sortBy.slice(1));
    const [state, setState] = React.useState<null>();

    const sortByList = ['Relevance', 'Price, low to high', 'Price, high to low'];

    React.useEffect(() => {
        
        if(isLoading){
            router.push(`/search/products?q=${query}&options[prefix]=last&sort_by=${sortBy}&page=${page}`);
        }
    
      }, [isLoading]);

    data.searchCat = searchCat;
    data.query = query;
    data.sortBy = sort;
    data.lowerBoundary = lowerBoundary;
    data.upperBoundary = upperBoundary;

    const pages = [{title: "Contact Us", route: '/contact'}, {title: "About", route: '/about'}, {title: "Login", route: '/login'}, {title: "Signup", route: '/signup'}, {title: "Shipping Policy", route: '/policies/shipping-policy'}];

    let productSuggestions = allProducts.slice(0, 6).some((product: any)=> product.title.includes(query.charAt(0).toUpperCase() + query.slice(1)));
    let otherSuggestions =  pages.some(page => page.title.includes(query.charAt(0).toUpperCase() + query.slice(1)));
  
    let otherSearchResults = productSuggestions || otherSuggestions;
    
    return (
        <main className={`bg-white w-full min-h-screen pt-12 pb-6 flex flex-col px-7 ${data.products.length === 0 ? 'space-y-36': 'space-y-6'}`}>
            <header className="flex flex-col items-center gap-y-4 justify-center mb-7">
                <h1 className="text-3xl font-sans">Search Results</h1>
                <section className="mx-auto h-full border border-gray-500 max-w-7xl md:w-[55%] w-[80%] focus-within:border-2 focus-within:border-gray-600 relative">
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
                            if(!isTyping){
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
                            <i className="fa-solid fa-search text-lg text-gray-400 cursor-pointer" onClick={() => router.push(`/search/products?keyword=${query}&page=1`)}></i>
                            </div>
                        </section>
                    </div>
                    {isTyping && allProducts.length === 0 &&
                    <div className="flex items-center justify-center bg-white pt-1 h-[38px] shadow-md">
                        <span className="loader"></span>
                    </div>
                    }
                    {isTyping &&
                    <div className="shadow-md absolute left-0 top-[53.5px] bg-white pt-3 h-fit w-full flex flex-col">
                        <section className="flex flex-row">
                        { otherSearchResults &&
                            <section className="flex flex-col w-[30%] gap-y-5">
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
                            <section className={`flex flex-col ${otherSearchResults ? 'w-[70%]' : 'w-full'}`}>
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
                        <footer  onClick={() => {
                            setIsLoading(true);
                        }} className="relative bottom-0 cursor-pointer flex flex-row justify-between items-center font-sans hover:bg-gray-100 text-[.8rem] border border-b-0 border-l-0 border-r-0 py-2 px-5 mt-4 group">
                            <h5 className="font-sans text-gray-500 text-sm">Search for "{query}"</h5>
                            {isLoading ? <div className="loader"></div> :
                                <i className="absolute right-5 cursor-pointer fa-solid fa-arrow-right-long text-gray-600 font-semibold transition-all duration-300 group-hover:right-4"></i>}
                        </footer>
                    </div>
                    }
                </section>
            </header>
            <header className="flex flex-row justify-between items-start w-full mx-auto container px-7 relative">
                <section className="inline-flex flex-row gap-x-4 items-center cursor-pointer absolute left-0" onClick={(e) => {
                    let leftAngle = e.currentTarget.querySelector('i');
                    if(leftAngle){
                        if(!leftAngle.classList.contains('al-rotate')){
                            leftAngle.classList.add('al-rotate');
                            leftAngle.classList.remove('al-rotate-clock');
                        }else{
                            leftAngle.classList.remove('al-rotate');
                            leftAngle.classList.add('al-rotate-clock');
                        }
                    }
                    
                    setIsActivated(prevState => !prevState);
                }}>
                    <div className="inline-flex flex-row gap-x-2">
                        {isActivated ? <Image src={On} alt="slider-activated" height={19}/> : <Image src={Off} alt="slider-deactivated" height={19}/>}
                        <h5 className="font-sans text-[.9rem] text-gray-500 font-bold">Filter</h5>
                    </div>
                    <i className="fa-solid fa-angle-left text-[1.2rem]"></i>
                     
                </section>
                <h3 className="font-sans text-[.9rem] text-gray-500 absolute left-[40%]">We found {data.products.length} result(s)</h3>
                <section className="flex-col gap-y-2 cursor-pointer absolute pb-3 pt-14 right-0 w-[205px]" 
                    onClick={(e) => {
                        let downAngle = e.currentTarget.querySelector('header i');
                        let section = e.currentTarget;
                        let text = section.querySelector('h5');
                        let ul = section.querySelector('ul');

                        if (downAngle && ul && section && text) {
                            if (!downAngle.classList.contains('ad-rotate')) {
                                if(sort === 'Relevance'){
                                    text.classList.add('slide-left');
                                    text.classList.remove('reverse-slide-left');
                                }
                                downAngle.classList.add('ad-rotate');
                                downAngle.classList.remove('ad-rotate-anticlock');
                                section.classList.remove('top-0');
                                section.classList.add('-top-[18px]', 'shadow-xl');
                                ul.classList.remove('hidden');
                                ul.classList.add('flex');
                            } else {
                                downAngle.classList.remove('ad-rotate');
                                if(sort === 'Relevance'){
                                    text.classList.add('reverse-slide-left');
                                    text.classList.remove('slide-left');
                                }
                                downAngle.classList.add('ad-rotate-anticlock');
                                section.classList.add('top-0');
                                section.classList.remove('-top-[18px]', 'shadow-xl');
                                ul.classList.add('hidden');
                                ul.classList.remove('flex');
                            }
                        }
                    }}>
                    <header className="inline-flex flex-row gap-x-3 items-center absolute right-[13%] top-[16%]">
                        <i className="fa-solid fa-angle-down text-[1.2rem]"></i>
                    </header>
                    <h5 className="font-sans text-[.9rem] text-gray-500 font-bold absolute right-[28.5%] top-[15%]">{sort}</h5>
                    <ul className="flex-col font-sans text-[.9rem] text-gray-500 hidden">
                        {sortByList.map((item, i) => <li onClick={() => {
                            setSort(item);
                        }} key={i} className={`${sort === item ? 'bg-gray-100' : ''} hover:bg-gray-100 pl-[29px] pr-7 py-2`}>{item}</li>)}
                    </ul>
                </section>

            </header>
            <section className={`${data.products.length === 0 ? 'justify-center flex-col' : 'justify-evenly md:flex-row flex-col'} flex items-center w-full flex-wrap md:gap-x-5 gap-y-9`}>
            {data.products.length === 0 
                ? <section className="flex items-center flex-col">
                    <h1 className="font-sans text-xl">No {searchCat} available!</h1>
                    <h1 className="font-sans text-sm">Try a different search parameter</h1>
                </section> 
                :<section className="flex flex-row pt-5 w-full gap-x-[40px]">
                    <div className="md:w-[20%] md:inline-block hidden">
                        <section className="flex flex-row justify-between items-center w-full">
                            <h5 className="font-sans text-[.9rem] text-gray-500">Out of stock</h5>
                            <div className="cursor-pointer inline-flex flex-row font-sans text-[.9rem] text-gray-400 bg-gray-100 px-1 py-2 items-center h-8 w-[106px]">
                                <span className="border border-gray-400 px-2 py-1 bg-white text-gray-500">Show</span>
                                <span className="text-gray-400 px-2 py-1">Hide</span>
                            </div>
                        </section>     
                    </div> 
                    <div className="md:w-[80%] w-full flex md:flex-row flex-col items-center justify-evenly flex-wrap md:gap-x-2">
                        {data.products.map((product: any, i: number) => <ProductComponent key={i} product={product} isSearchProduct imageH={700} imageW={250}/>)}
                    </div>
                </section>
            }
            </section>
        {data.products.length > 0 && <Pagination {...data}/>}
    </main>
    );
}