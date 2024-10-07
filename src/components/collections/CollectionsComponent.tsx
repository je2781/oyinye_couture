'use client';

import React from "react";
import SecondaryHeader from "../filter/SecondaryHeader";

export default function Collections({
    collectionsCat,
    data,
    sortBy,
    page
}: any){
  
  const sortByList = [
    "Featured", 
    "Best Selling", 
    "Alphabetically, A-Z", 
    "Alphabetically, Z-A", 
    "Price, low to high", 
    "Price, high to low", 
    "Price, low to high",
    "Date, old to new",
    "Date, new to old"
  ];
  const fabricList = [
    "Crepe", "Cotton", "Linen", "Wool","Chiffon", "Organza", "Mikado Silk", "Damask"
  ];


  //updating sortby product type params
  switch ((sortBy.split('-').length === 1 ? sortBy.split('-')[0] : sortBy.split('-')[1])) {
    case 'manual':
      sortBy = 'Featured';
      break;
    case 'price-ascending':
      sortBy = "Price, low to high";
      break;
    case 'price-descending':
      sortBy = "Price, high to low";
      break;
    case 'created-descending':
      sortBy = "Date, new to old";
      break;
    case 'created-ascending':
      sortBy = "Date, old to new";
      break;
    case 'title-descending':
      sortBy = "Alphabetically, Z-A";
      break;
    case 'title-ascending':
      sortBy = "Alphabetically, A-Z";
      break;
  
    default:
      sortBy = "Best Selling";
      break;
  }

    const [visible, setVisible] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isGridView, setIsGridView] = React.useState(true);
    const [filter, setFilter] = React.useState({
      noOfFilters: data.filterSettings && data.filterSettings.length > 0 ? data.filterSettings[0].collection.noOfFilters : 0,
      isVisible: data.filterSettings && data.filterSettings.length > 0 ? data.filterSettings[0].collection.isVisible : true,
    });
    const [sort, setSort] = React.useState<string>(
      sortBy
    );
    

    return <>
        <section className={`${
            visible ? "show" : "hide"
          } mx-auto container px-7 fixed top-[60px] z-10 bg-white h-11 shadow-md py-2 md:hidden max-w-7xl`}>
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
          /> 
      </section>
      <main
      className={`bg-white w-full min-h-screen md:pt-12 pt-5 px-8 pb-6 gap-y-9 flex flex-col container mx-auto max-w-7xl relative items-start`}
      >
        <h1 className="lg:text-4xl text-2xl font-sans">{collectionsCat === 'all' ? 'Products' : 'All Dresses'}</h1>
        <div>
          <div 
                    onClick={() => {
                        let downAngle = document.querySelector('i.lang-angle-down');
                        if(!downAngle?.classList.contains("ad-rotate")){
                            downAngle?.classList.add("ad-rotate");
                            downAngle?.classList.remove("ad-rotate-anticlock");
                        }else{
                            downAngle?.classList.remove("ad-rotate");
                            downAngle?.classList.add("ad-rotate-anticlock");
                        }
                    }}
                    className="relative border border-gray-400 rounded-sm p-1 focus:border-gray-600 w-[30%]">
                        <select 
                        id='lang-select'
                        className="focus:outline-none p-2 appearance-none"
                        onChange={(e) => {
                            
                        }}>
                            <option hidden selected value=''>{sort}</option>
                            {
                               sortByList.map((val, i) => <option className='underline underline-offset-1' value={val} key={i}>
                                {val}
                                </option>)
                            }
                        </select>
                        <i onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }} className="fa-solid fa-angle-down lang-angle-down absolute top-[40%] right-3"

                        ></i>
          </div>
        </div>
      </main>
    </>
}