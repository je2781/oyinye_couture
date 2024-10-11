
'use client';


import Image from "next/image";
import On from "../../../../public/on.png";
import Off from "../../../../public/off.png";
import React from "react";
import { FilterModal } from "@/components/ui/Modal";
import useWindowWidth from "@/components/helpers/getWindowWidth";

export default function SecondaryHeader({
    setFilter,
    filter,
    sort,
    setSort,
    sortByList,
    fabricList,
    category,
    productsLength,
    setIsLoading,
    isGridView,
    setIsGridView,
    classes,
}: any){
    const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
    const windowWidth = useWindowWidth();
    let timerId: NodeJS.Timeout | null = null;

    React.useEffect(() => {
        return () => {
            if(timerId){
                clearTimeout(timerId);
            }
        };
    }, [timerId]);

    React.useEffect(() => {
        let filterSettings = document.querySelector('#filter-settings') as HTMLElement;
        if (isFilterModalOpen && filterSettings) {
            filterSettings.classList.add('forward');
            filterSettings.classList.remove('backward');
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

    const headerClass = classes
    ? ``
    : 'container mx-auto max-w-7xl collections-secondary-header';

    return (
      <>
          <header className={`${headerClass} text-[.9rem] text-gray-500 font-medium font-sans flex flex-row  ${category === 'basics' ? 'justify-center' : 'justify-between'} items-center w-full relative mb-2`} >
          {category !== 'basics' && <div
            id='toggle-settings'
            className="hidden md:inline-block relative cursor-pointer"
            onClick={(e) => {
                let leftAngle = document.querySelector("i.filter-angle-left");
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
                <h5>
                Filter{filter.noOfFilters > 0 && <span>&nbsp;&#40;{filter.noOfFilters}&#x29;</span>}
                </h5>
            </div>
            <i className="fa-solid fa-angle-left filter-angle-left text-sm text-gray-500 absolute -right-6 top-[16%]"></i>
                
          </div>}
          {category !== 'basics' && <div
              className={`md:hidden inline-flex flex-row gap-x-4 items-center cursor-pointer absolute left-3 ${classes ? '' : '-top-6'}`}
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
                  
          </div>}
          <div className="inline-flex flex-row items-center gap-x-2 md:w-fit w-[45%]">
              <span className="md:inline-block hidden w-[20%]">
                Sort by:
              </span>
              <div 
                onClick={(e) => {
                    e.currentTarget.style.border = '2px solid rgb(75, 85, 99)';
                    e.currentTarget.style.boxShadow = '2px 1px 6px 4px #f3f3f3';
                    let downAngle = document.querySelector('i.sort-angle-down');
                    if(!downAngle?.classList.contains("ad-rotate")){
                        downAngle?.classList.add("ad-rotate");
                        downAngle?.classList.remove("ad-rotate-anticlock");
                    }else{
                        downAngle?.classList.remove("ad-rotate");
                        downAngle?.classList.add("ad-rotate-anticlock");
                    }
                }}
                onBlur={(e) => {
                  let downAngle = document.querySelector('i.sort-angle-down');

                  e.currentTarget.style.border = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  downAngle?.classList.remove("ad-rotate");
                  downAngle?.classList.add("ad-rotate-anticlock");
                }}
                className="relative cursor-pointer rounded-sm px-1 py-[3px] w-[60%] md:inline-block hidden">
                <select 
                id='sort-select'
                className="focus:outline-none p-2 appearance-none cursor-pointer bg-transparent"
                onChange={(e) => {
                  setSort(e.target.value);
                  //reloading page
                  setIsLoading(true);
                }}>
                    <option hidden value=''>{sort}</option>
                    {
                        sortByList.map((val: string, i: number) => <option className='underline underline-offset-1' value={val} key={i}>
                        {val}
                        </option>)
                    }
                </select>
                <i onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }} className="fa-solid fa-angle-down sort-angle-down absolute top-[35%] right-3"

                ></i>
              </div>
              <span className="w-[20%] pl-4 md:inline-block hidden">
                {productsLength}&nbsp;products
              </span>
              <span className={`absolute right-[20%] inline-block md:hidden ${classes ? '' : '-top-6'}`}>
                {productsLength}&nbsp;products
              </span>
              <div className={`inline-flex flex-row gap-x-2 md:hidden absolute right-3 ${classes ? '' : '-top-6'}`}>
                  <i onClick={() => setIsGridView((prevState: any) => !prevState)} className={`fa-solid fa-grip cursor-pointer text-[1.35rem] ${isGridView ? 'text-gray-500': 'text-gray-300'}`}></i>
                  <i onClick={() => setIsGridView((prevState: any) => !prevState)} className={`fa-regular fa-square cursor-pointer text-[1.35rem] ${!isGridView ? 'text-gray-500': 'text-gray-300'}`}></i>
              </div>
          </div>
          </header>
          {isFilterModalOpen && windowWidth < 768  && <FilterModal onClose={hideFilterModalHandler}>
            <section className="w-full inline-flex flex-col gap-y-7">
                <div className="flex flex-col gap-y-5">
                   
                    <div className="flex flex-col gap-y-5">
                        <header
                            className="flex flex-row justify-between items-center cursor-pointer border border-l-0 border-r-0 border-b-0 border-gray-300 pt-4"
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
                            <i className="fa-solid fa-angle-up text-sm text-gray-500"></i>
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
                        className="relative cursor-pointer border border-l-0 border-r-0 border-gray-300 py-4"
                        onClick={(e) => {
                            let downAngle = document.querySelector("i.fabric-angle-down");
                            let header = e.currentTarget;
                            let content = header.parentNode?.querySelector("#fabric-content");

                            if (downAngle && header) {
                            if (!downAngle.classList.contains("ad-rotate")) {
                                downAngle.classList.add("ad-rotate");
                                downAngle.classList.remove("ad-rotate-anticlock");
                                content?.classList.add("show");
                                content?.classList.remove("hide", 'hidden');
                                header.classList.add('border-b-0');
                            } else {
                                downAngle.classList.remove("ad-rotate");
                                downAngle.classList.add("ad-rotate-anticlock");
                                content?.classList.remove("show");
                                content?.classList.add("hide", 'hidden');
                                header.classList.remove('border-b-0');

                            }
                            }
                        }}
                        >
                        <h5>
                            Fabric
                        </h5>
                        <i className="fa-solid fa-angle-down fabric-angle-down text-sm text-gray-500 absolute right-0 top-[38%]"></i>
                      </header>
                      <ul id="fabric-content" className="hide hidden border border-l-0 border-r-0 border-t-0 pb-4 border-gray-300 flex-col font-sans text-[.9rem] text-gray-500 gap-y-2 font-normal">
                      {fabricList.map((item: any, i: number) => (
                          <li className="inline-flex flex-row gap-x-3 items-center " key={i}>
                              <input 
                              onChange={(e) => {
                              let el = e.currentTarget;

                              setFilter((prevState: any) => ({
                                  ...prevState,
                                  noOfFilters:
                                  prevState.noOfFilters < 8 && el.checked
                                  ? prevState.noOfFilters + 1
                                  : prevState.noOfFilters > 0 && !el.checked
                                  ? prevState.noOfFilters - 1
                                  : prevState.noOfFilters,
                                  customProp: {
                                  ...prevState.customProp,
                                  name: el.checked ? item : '',
                                  type: 'dressFabric'
                                  },
                              }));
                              //reloading page
                              setIsLoading(true);
                              }}
                              type="checkbox" className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-500 rounded-sm relative
                                  cursor-pointer outline-none checked:bg-gray-500 checked:after:absolute checked:after:content-[''] checked:after:top-[1.5px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                                  checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                                  checked:after:rotate-45" checked={filter.customProp.name === item ? true : false}/>
                              <span
                              >
                                  {item}
                              </span>
                          </li>
                      ))}
                      </ul>
                    </div>
                </div>
            </section>
            </FilterModal>}
      </>
    );
}