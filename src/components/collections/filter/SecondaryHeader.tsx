
'use client';


import Image from "next/image";
import On from "../../../../public/on.png";
import Off from "../../../../public/off.png";

export default function SecondaryHeader({
    setFilter,
    filter,
    sort,
    setSort,
    sortByList,
    category,
    productsLength,
    setIsLoading,
    isGridView,
    setIsGridView,
}: any){
    return <header className={`text-[.9rem] text-gray-500 font-medium font-sans flex flex-row ${category === 'basics' ? 'justify-center' : 'justify-between'} items-center w-full px-12 container mx-auto max-w-7xl`} >
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
    <div className="inline-flex flex-row items-center gap-x-2">
        <span className="w-[20%]">
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
      className="relative cursor-pointer rounded-sm px-1 py-[3px] w-[60%]">
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
        <span className="w-[20%] pl-4">
          {productsLength}&nbsp;products
        </span>
    </div>
  </header>
}