
'use client';

import Image from "next/image";
import On from "../../../public/on.png";
import Off from "../../../public/off.png";
import React, { SyntheticEvent, useRef } from "react";
import { FilterModal} from "../ui/Modal";
import { regex } from "@/helpers/getHelpers";
import Slider from "@mui/material/Slider";
import './SecondaryHeader.css';
import { time } from "console";

export default function SecondaryHeader({
    setFilter,
    filter,
    sort,
    setSort,
    sortByList,
    productsLength,
    isGridView,
    setIsGridView,
    classes,
    windowWidth,
    newPriceBoundary,
    setPrice,
    setSliderVal,
    setIsLoading,
    price,
    prodType,
    setNewPriceBoundary,
    currentPriceBoundary,
    productTypeList,
    sliderVal,
}: any){
    const headerClass = classes
        ? ``
        : 'px-7 mx-auto container secondary-header';

    const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
    const lowerInputRef = useRef<HTMLInputElement>(null);
    const upperInputRef = useRef<HTMLInputElement>(null);
    let timerId: NodeJS.Timeout | null = null;

    React.useEffect(() => {
        let filterSettings = document.querySelector('#filter-settings') as HTMLElement;
        if (isFilterModalOpen && filterSettings) {
            filterSettings.classList.add('forward');
            filterSettings.classList.remove('backward');
        }

        return () => {
            if(timerId){
                clearTimeout(timerId);
            }
        }
        
    }, [isFilterModalOpen]);
    
    
    const showFilterModalHandler = (e: React.MouseEvent) => {
        setIsFilterModalOpen(true);
    };
    
    const hideFilterModalHandler = () => {
        let filterSettings = document.querySelector('#filter-settings') as HTMLElement;
        if (filterSettings) {
        filterSettings.classList.remove('forward');
        filterSettings.classList.add('backward');
        timerId = setTimeout(() => {
            setIsFilterModalOpen(false);
        }, 300); 
        } else {
        setIsFilterModalOpen(false);
        }
    };
      


    function handleValueChange(e: Event | SyntheticEvent<Element, Event>, val: number | number[]){
        let values = val as number[];
        setSliderVal(values);
        setPrice(values[0]);
        setNewPriceBoundary(values[1]);
        if (
            values[0] === 0 &&
            values[1] === currentPriceBoundary
        ) {
            setFilter((prevState: any) => ({
            ...prevState,
            noOfFilters:
                prevState.noOfFilters > 0
                ? prevState.noOfFilters - 1
                : prevState.noOfFilters,
            priceRange: ``,

            }));
        } else {
            setFilter((prevState: any) => ({
                ...prevState,
                noOfFilters:
                  prevState.noOfFilters < 3 && prevState.priceRange.length === 0 
                    ? prevState.noOfFilters + 1
                    : prevState.noOfFilters,
                priceRange: `₦${price.toLocaleString()} - ₦${newPriceBoundary.toLocaleString()}`,
              }));
        }


        //reloading page
        setIsLoading(true);
            
    }

    return(
        <>
            <header className={`${headerClass} flex flex-row justify-between items-start w-full relative mb-2`} >
                <div
                    id='toggle-settings'
                    className="hidden md:inline-flex flex-row gap-x-4 items-center cursor-pointer absolute left-0"
                    onClick={(e) => {
                        let leftAngle = e.currentTarget.querySelector("i");
                        if (leftAngle) {
                        if (!leftAngle.classList.contains("al-rotate")) {
                            leftAngle.classList.add("al-rotate");
                            leftAngle.classList.remove("al-rotate-clock");
                        } else {
                            leftAngle.classList.remove("al-rotate");
                            leftAngle.classList.add("al-rotate-clock");
                        }
                        }

                        setFilter((prevState: any) => ({
                        ...prevState,
                        isVisible: !prevState.isVisible
                        }));
                       
                    }}
                    >
                    <div className="inline-flex flex-row gap-x-2">
                        {filter.isVisible ? (
                        <Image src={On} alt="slider-activated" height={19} />
                        ) : (
                        <Image src={Off} alt="slider-deactivated" height={19} />
                        )}
                        <h5 className="font-sans text-[.9rem] text-gray-500 font-bold">
                        Filter{filter.noOfFilters > 0 && <span>&nbsp;&#40;{filter.noOfFilters}&#x29;</span>}
                        </h5>
                    </div>
                    <div className="inline-block">
                        <i className="fa-solid fa-angle-left text-[1.2rem]"></i>
                    </div>
                        
                </div>
                <div
                    className="md:hidden inline-flex flex-row gap-x-4 items-center cursor-pointer absolute left-0"
                    onClick={showFilterModalHandler}
                    >
                    <div className="inline-flex flex-row gap-x-2">
                        <Image src={On} alt="slider-activated" height={19} />
                        <h5 className="font-sans text-[.9rem] text-gray-500 font-bold">
                        Filter{filter.noOfFilters > 0 && <span>&nbsp;&#40;{filter.noOfFilters}&#x29;</span>}
                        </h5>
                    </div>
                    <div className="md:inline-block hidden">
                        <i className="fa-solid fa-angle-left text-[1.2rem]"></i>
                    </div>
                        
                </div>
                <h3 className="font-sans text-[.9rem] text-gray-500 absolute left-[40%]">
                We found {productsLength} result(s)
                </h3>
                <div
                    className="flex-col gap-y-2 cursor-pointer absolute pb-3 pt-14 right-0 w-[205px] z-10 md:inline-flex hidden"
                        onClick={(e) => {
                            let downAngle = e.currentTarget.querySelector("header i");
                            let section = e.currentTarget;
                            let text = section.querySelector("h5");
                            let ul = section.querySelector("ul");

                            if (downAngle && ul && section && text) {
                                if (!downAngle.classList.contains("ad-rotate")) {
                                    if (sort === "Relevance") {
                                        text.classList.add("slide-left");
                                        text.classList.remove("reverse-slide-left");
                                    }
                                    downAngle.classList.add("ad-rotate");
                                    downAngle.classList.remove("ad-rotate-anticlock");
                                    section.classList.remove("top-0");
                                    section.classList.add("-top-[18px]", "shadow-xl", 'bg-white');
                                    ul.classList.remove("hidden");
                                    ul.classList.add("flex");
                                } else {
                                    downAngle.classList.remove("ad-rotate");
                                    if (sort === "Relevance") {
                                        text.classList.add("reverse-slide-left");
                                        text.classList.remove("slide-left");
                                    }
                                    downAngle.classList.add("ad-rotate-anticlock");
                                    section.classList.add("top-0");
                                    section.classList.remove("-top-[18px]", "shadow-xl", 'bg-white');
                                    ul.classList.add("hidden");
                                    ul.classList.remove("flex");
                                }
                            }
                        }}
                    >
                    <i className="fa-solid fa-angle-down text-[1.2rem] absolute right-[13%] top-[16%]"></i>
                    <h5 className="font-sans text-[.9rem] text-gray-500 font-bold absolute right-[28.5%] top-[15%]">
                        {sort}
                    </h5>
                    <ul className="flex-col font-sans text-[.9rem] text-gray-500 hidden">
                        {sortByList.map((item: any, i: number) => (
                        <li
                            onClick={() => {
                            setSort(item);
                            //reloading page
                            setIsLoading(true);
                            }}
                            key={i}
                            className={`${
                            sort === item ? "bg-gray-100" : ""
                            } hover:bg-gray-100 pl-[29px] pr-7 py-2`}
                        >
                            {item}
                        </li>
                        ))}
                    </ul>
                </div>
                <div className="inline-flex flex-row gap-x-2 md:hidden absolute right-0">
                    <i onClick={() => setIsGridView((prevState: any) => !prevState)} className={`fa-solid fa-grip cursor-pointer text-[1.35rem] ${isGridView ? 'text-gray-500': 'text-gray-300'}`}></i>
                    <i onClick={() => setIsGridView((prevState: any) => !prevState)} className={`fa-regular fa-square cursor-pointer text-[1.35rem] ${!isGridView ? 'text-gray-500': 'text-gray-300'}`}></i>
                </div>
            </header>
            {isFilterModalOpen && windowWidth < 768  && <FilterModal onClose={hideFilterModalHandler}>
            <section className="w-full inline-flex flex-col gap-y-7">
                <div className="flex flex-row justify-between items-center w-full">
                    <h5 className="font-sans text-[.9rem] text-gray-500 font-semibold">
                    Out of stock
                    </h5>
                    <div className="cursor-pointer inline-flex flex-row font-sans text-[.9rem] text-gray-400 bg-gray-100 px-1 py-2 items-center h-8 w-[106px]">
                    <span
                        onClick={async () => {
                        setFilter((prevState: any) => ({
                            ...prevState,
                            noOfFilters:
                            prevState.noOfFilters > 0
                                ? prevState.noOfFilters - 1
                                : prevState.noOfFilters,
                            showOutOfStock: true,
                        }));
                        
                        //reloading page
                        setIsLoading(true);
                        }}
                        className={`px-2 py-1 font-medium ${
                        filter.showOutOfStock
                            ? "border border-gray-400 bg-white text-gray-500"
                            : "text-gray-400"
                        }`}
                    >
                        Show
                    </span>
                    <span
                        onClick={async () => {
                        setFilter((prevState: any) => ({
                            ...prevState,
                            noOfFilters:
                            prevState.noOfFilters < 3 && prevState.showOutOfStock 
                            ? prevState.noOfFilters + 1
                            : prevState.noOfFilters,
                            showOutOfStock: false,
                            }));
                        
                        //reloading page
                        setIsLoading(true);
                        }}
                        className={`px-2 py-1 font-medium ${
                        !filter.showOutOfStock
                            ? "border border-gray-400 bg-white text-gray-500"
                            : "text-gray-400"
                        }`}
                    >
                        Hide
                    </span>
                    </div>
                </div>
                <div className="flex flex-col gap-y-5">
                    <div className="flex flex-col gap-y-5">
                        <header
                            className="flex flex-row justify-between items-center cursor-pointer"
                            onClick={(e) => {
                                let upAngle = e.currentTarget.querySelector("header i");
                                let header = e.currentTarget;
                                let content = header.parentNode?.querySelector("#price-content");

                                if (upAngle && header) {
                                if (!upAngle.classList.contains("au-rotate")) {
                                    upAngle.classList.add("au-rotate");
                                    upAngle.classList.remove("au-rotate-clock");
                                    content?.classList.remove("show");
                                    content?.classList.add("hide");
                                } else {
                                    upAngle.classList.remove("au-rotate");
                                    upAngle.classList.add("au-rotate-clock");
                                    content?.classList.add("show");
                                    content?.classList.remove("hide");
                                }
                                }
                            }}
                        >
                            <h5 className="font-sans text-[.9rem] text-gray-500 font-semibold">
                                Price
                            </h5>
                            <i className="fa-solid fa-angle-up text-[1.2rem]"></i>
                        </header>
                        <div
                        id="price-content"
                        className="flex flex-col gap-y-5"
                        >
                        <div className="flex flex-row gap-x-3">
                            <span className="w-[50%] flex flex-row items-center h-11 p-3 border border-gray-200 hover:border-gray-400 focus-within:border-gray-700 font-sans">
                            <span>&#8358;&nbsp;</span>
                            
                            <input
                                className="focus:outline-none h-full w-full"
                                ref={lowerInputRef}
                                onBlur={(e) => {
                                  const input = e.currentTarget;
                                  const upperValue = upperInputRef.current!.value;
              
                                  // validation check to prevent lower boundary from becoming greater than upper boundary
                                  if (parseInt(input.value) > parseInt(upperValue)) {
                                    //updating lower boundary of price
                                    setPrice(price);
                                    //updating slider range
                                    setSliderVal([price, newPriceBoundary]);
                                  } else if (
                                    parseInt(input.value) === 0 &&
                                    newPriceBoundary === currentPriceBoundary
                                  ) {
                                    setFilter((prevState: any) => ({
                                      ...prevState,
                                      noOfFilters:
                                        prevState.noOfFilters > 0
                                          ? prevState.noOfFilters - 1
                                          : prevState.noOfFilters,
                                      priceRange: "",
                                    }));
                                  } else {
                                    setFilter((prevState: any) => ({
                                      ...prevState,
                                      noOfFilters:
                                        prevState.noOfFilters < 3 && prevState.priceRange.length === 0 
                                          ? prevState.noOfFilters + 1
                                          : prevState.noOfFilters,
                                      priceRange: `₦${price.toLocaleString()} - ₦${newPriceBoundary.toLocaleString()}`,
                                    }));
                                  }
                                  
                                  //reloading page
                                  setIsLoading(true);
                                }}
                                onInput={async (e) => {
                                  const input = e.currentTarget;
              
                                  if (!regex.test(input.value)) {
                                    input.value = price;
                                    return;
                                  }
              
                                  //updating lower boundary of price
                                  setPrice(parseInt(input.value));
                                  //updating slider range
                                  setSliderVal([parseInt(input.value), newPriceBoundary]);
              
                                  
                                }}
                                value={price}
                            />
                            </span>
                            <span className="w-[50%] flex flex-row items-center h-11 p-3 border border-gray-200 hover:border-gray-400 focus-within:border-gray-700 font-sans">
                            <span>&#8358;&nbsp;</span>
                            <input
                                className="focus:outline-none h-full w-full"
                                ref={upperInputRef}
                                onBlur={(e) => {
                                    const input = e.currentTarget;
                
                                    const lowerValue = lowerInputRef.current!.value;
                                    
                                    if(parseInt(input.value) < parseInt(lowerValue)){  //validation check to prevent  upper boundary from becoming less than lower boundary
                                      //updating upper boundary of price
                                      setNewPriceBoundary(newPriceBoundary);
                                      //updating slider range
                                      setSliderVal([price, newPriceBoundary]);
                                    } else if (
                                      parseInt(input.value) === currentPriceBoundary &&
                                      price === 0
                                    ) {
                
                                      setFilter((prevState: any) => ({
                                        ...prevState,
                                        noOfFilters:
                                          prevState.noOfFilters > 0
                                            ? prevState.noOfFilters - 1
                                            : prevState.noOfFilters,
                                        priceRange: ``,
                                      }));
                                    } else {
                                      setFilter((prevState: any) => ({
                                        ...prevState,
                                        noOfFilters:
                                          prevState.noOfFilters < 3 && prevState.priceRange.length === 0 
                                            ? prevState.noOfFilters + 1
                                            : prevState.noOfFilters,
                                        priceRange: `₦${price.toLocaleString()} - ₦${newPriceBoundary.toLocaleString()}`,
                
                                      }));
                                    }
                                    
                                    //reloading page
                                    setIsLoading(true);
                                  }}
                                  onInput={async (e) => {
                                    const input = e.currentTarget;
                
                                    if (!regex.test(input.value)) {
                                      input.value = newPriceBoundary;
                                      return;
                                    }
                                    //updating upper boundary of price
                                    setNewPriceBoundary(parseInt(input.value));
                                    //updating slider range
                                    setSliderVal([price, parseInt(input.value)]);
                
                                    
                                  }}
                                value={newPriceBoundary}
                            />
                            </span>
                        </div>
                        <div className="w-full flex flex-row">
                            <div className="w-[7%]"></div>
                            <Slider
                            getAriaLabel={() => "price range"}
                            value={sliderVal}
                            max={currentPriceBoundary}
                            onChangeCommitted={handleValueChange}
                            valueLabelDisplay="auto"
                            sx={{
                                color: "black", // Primary colo
                                "& .MuiSlider-thumb": {
                                backgroundColor: "white",
                                border: "2px solid black",
                                },
                                "& .MuiSlider-track": {
                                backgroundColor: "black",
                                },
                                "& .MuiSlider-rail": {
                                backgroundColor: "grey.400",
                                },
                            }}
                            color="secondary"
                            />
                            <div className="w-[7%]"></div>
                        </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-5">
                        <header
                            className="flex flex-row justify-between items-center cursor-pointer"
                            onClick={(e) => {
                                let upAngle = e.currentTarget.querySelector("header i");
                                let header = e.currentTarget;
                                let content = header.parentNode?.querySelector("#sortby-content");

                                if (upAngle && header) {
                                if (!upAngle.classList.contains("au-rotate")) {
                                    upAngle.classList.add("au-rotate");
                                    upAngle.classList.remove("au-rotate-clock");
                                    content?.classList.remove("show");
                                    content?.classList.add("hide");
                                } else {
                                    upAngle.classList.remove("au-rotate");
                                    upAngle.classList.add("au-rotate-clock");
                                    content?.classList.add("show");
                                    content?.classList.remove("hide");
                                }
                                }
                            }}
                            >
                            <h5 className="font-sans text-[.9rem] text-gray-500 font-semibold">
                                Sort by
                            </h5>
                            <i className="fa-solid fa-angle-up text-[1.2rem]"></i>
                        </header>
                        <div
                        id="sortby-content"
                        className="flex flex-col gap-y-5"
                        >
                            <ul className="flex-col font-sans text-[.9rem] text-gray-500 flex gap-y-2">
                            {sortByList.map((item: any, i: number) => (
                                <li className="inline-flex flex-row gap-x-3 items-center" key={i}>
                                    <input 
                                    onChange={() => {
                                        setSort(item);
                                        //reloading page
                                        setIsLoading(true);
                                    }}
                                    type="checkbox" className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-500 rounded-sm relative
                                        cursor-pointer outline-none checked:bg-gray-500 checked:after:absolute checked:after:content-[''] checked:after:top-[1.5px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                                        checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                                        checked:after:rotate-45" checked={sort === item ? true : false}/>
                                    <span

                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-5">
                        <header
                            className="flex flex-row justify-between items-center cursor-pointer"
                            onClick={(e) => {
                                let upAngle = e.currentTarget.querySelector("header i");
                                let header = e.currentTarget;
                                let content = header.parentNode?.querySelector("#productType-content");

                                if (upAngle && header) {
                                if (!upAngle.classList.contains("au-rotate")) {
                                    upAngle.classList.add("au-rotate");
                                    upAngle.classList.remove("au-rotate-clock");
                                    content?.classList.remove("show");
                                    content?.classList.add("hide");
                                } else {
                                    upAngle.classList.remove("au-rotate");
                                    upAngle.classList.add("au-rotate-clock");
                                    content?.classList.add("show");
                                    content?.classList.remove("hide");
                                }
                                }
                            }}
                            >
                            <h5 className="font-sans text-[.9rem] text-gray-500 font-semibold">
                                Product Type
                            </h5>
                            <i className="fa-solid fa-angle-up text-[1.2rem]"></i>
                        </header>
                        <div
                        id="productType-content"
                        className="flex flex-col gap-y-5"
                        >
                            <ul className="flex-col font-sans text-[.9rem] text-gray-500 flex gap-y-2">
                            {productTypeList.map((item: any, i: number) => (
                                <li className="inline-flex flex-row gap-x-3 items-center" key={i}>
                                    <input 
                                    onChange={(e) => {
                                        let el = e.currentTarget;
                                        setFilter((prevState: any) => ({
                                            ...prevState,
                                            noOfFilters:
                                            prevState.noOfFilters < 3 && el.checked && !prodType
                                            ? prevState.noOfFilters + 1
                                            : prevState.noOfFilters > 0 && !el.checked && prodType
                                            ? prevState.noOfFilters - 1
                                            : prevState.noOfFilters,
                                            productType: el.checked ? item : '',
                                          }));
                                        //reloading page
                                        setIsLoading(true);
                                    }}
                                    type="checkbox" className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-500 rounded-sm relative
                                        cursor-pointer outline-none checked:bg-gray-500 checked:after:absolute checked:after:content-[''] checked:after:top-[1.5px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                                        checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                                        checked:after:rotate-45" checked={filter.productType === item ? true : false}/>
                                    <span
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            </FilterModal>}
        </>
    );
}