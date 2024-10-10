'use client';

import React from "react";
import ProductComponent from "../product/Product";
import SecondaryHeader from "./filter/SecondaryHeader";
import Pagination from "../layout/Pagination";
import Setting from "./filter/Setting";

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
    "Date, old to new",
    "Date, new to old"
  ];
  const fabricList = [
    "Crepe", "Cotton", "Linen", "Wool","Chiffon", "Organza", "Mikado Silk", "Damask"
  ];

  //filtering for basic collection of trousers and jumpsuits
  if(collectionsCat === 'basics'){
    data.products = data.products.filter((product: any) => product.type !== 'Dresses');
  }

  //updating sortby product type params
  switch (sortBy) {
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
      customProp: data.filterSettings && data.filterSettings.length > 0 ? data.filterSettings[0].collection.customProperty : {
        type: '',
        name: ''
      },
    });
    const [sort, setSort] = React.useState<string>(
      sortBy
    );

    React.useEffect(() => {
      async function reloadPage(){
        if (isLoading) {
          if(filter.noOfFilters > 0){
            await fetch('/api/products/filter?type=collections',{
              method: 'POST',
              body: JSON.stringify(filter)
            })
          }
  
          const queryParams = [
            `sort_by=${
              sort === sortByList[0]
                ? "manual"
                : sort === sortByList[2]
                ? "title-ascending"
                : sort === sortByList[2]
                ? "title-ascending"
                : sort === sortByList[3]
                ? "title-descending"
                : sort === sortByList[4]
                ? "price-ascending"
                : sort === sortByList[5]
                ? "price-descending"
                : sort === sortByList[6]
                ? "created-ascending"
                : sort === sortByList[7]
                ? "created-descending"
                : "best-selling"
            }`,
            filter.customProp.name.length > 0 && filter.customProp.type === 'dressColor' ? `filter.p.m.custom.colors=${filter.customProp.name}` : '',
            filter.customProp.name.length > 0 && filter.customProp.type === 'dressFabric' ? `filter.p.m.custom.fabric=${filter.customProp.name}` : '',
            filter.customProp.name.length > 0 && filter.customProp.type === 'dressFeature' ? `filter.p.m.custom.feature=${filter.customProp.name}` : '',
            filter.customProp.name.length > 0 && filter.customProp.type === 'dressLength' ? `filter.p.m.custom.dress_length=${filter.customProp.name}` : '',
            filter.customProp.name.length > 0 && filter.customProp.type === 'neckline' ? `filter.p.m.custom.neckline=${filter.customProp.name}` : '',
            filter.customProp.name.length > 0 && filter.customProp.type === 'sleeveLength' ? `filter.p.m.custom.sleeve_length=${filter.customProp.name}` : '',
            `page=${page}`
            
          ];
          // Filter out empty parameters
          const filteredParams = queryParams.filter(param => param !== '');
  
          // Join the parameters to construct the query string
          const queryString = filteredParams.join('&');
  
          // Construct the final URL and replace the location
          location.replace(`/collections/${collectionsCat}?${queryString}`);
        }
      }
      reloadPage();
    }, [isLoading]);

    data.collectionsCat = collectionsCat;
    data.sortBy = sort;
    

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
            category={collectionsCat}
            productsLength={data.products.length}
            isGridView={isGridView}
            setIsGridView={setIsGridView}
          /> 
      </section>
      <main
      className={`w-full min-h-screen font-sans md:pt-12 pt-5 pb-6 gap-y-9 flex flex-col items-start relative`}
      >
        <header className="w-full container mx-auto px-12 max-w-7xl">
          <h1 className="lg:text-4xl text-2xl">{collectionsCat === 'all' ? 'Products' : 'All Dresses'}</h1>
        </header>
        {data.products.length > 0
        ? <section className="w-full bg-gray-50 pb-7 flex flex-col py-7 gap-y-5" >
          <SecondaryHeader 
            setFilter={setFilter}
            filter={filter}
            sort={sort}
            setSort={setSort}
            setIsLoading={setIsLoading}
            category={collectionsCat}
            sortByList={sortByList}
            productsLength={data.products.length}
            isGridView={isGridView}
            setIsGridView={setIsGridView}
          />
          <div className="flex flex-row pl-12 pr-2 container mx-auto max-w-7xl gap-x-4">
            {filter.isVisible && collectionsCat !== 'basics' && <Setting 
              {...{ setIsLoading, setFilter, filter, fabricList }}
            />}
            <div className={`${filter.isVisible && collectionsCat !== 'basics' ? 'md:w-[80%]': 'w-full'} flex md:flex-row ${isGridView ? 'flex-row': 'flex-col'} items-center md:h-full md:overflow-y-auto hide-scrollbar justify-evenly flex-wrap gap-x-1 gap-y-4`}>
                {data.products.map((product: any, i: number) => (
                  <ProductComponent
                    key={i}
                    product={product}
                    isSearchProduct
                    imageH={filter.isVisible && collectionsCat !== 'basics' ? 650: null}
                    imageW={filter.isVisible && collectionsCat !== 'basics' ? 228: null}
                    isGridView={isGridView}
                    setIsGridView={setIsGridView}
                  />
                ))}
            </div>
          </div>
          {isLoading && <section className="absolute top-[60px] z-20 left-0 bg-white/50 w-full h-full">
          <div className="loader absolute top-4 right-4"></div>
          </section>}
          {data.products.length > 0 && <Pagination {...data} />}
        </section>
        : <section className="flex items-center flex-col w-full bg-gray-50 min-h-screen justify-center">
        <h1 className="font-sans md:text-2xl text-xl">No {collectionsCat} available!</h1>
        <h1 className="font-sans md:text-lg text-sm">
          Try a different collection
        </h1>
      </section>}
      </main>
    </>
}