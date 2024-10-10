
'use client';

export default function Setting({
    setIsLoading,
    setFilter,
    filter,
    fabricList
}: any){
    return (<div className="md:flex flex-col gap-y-5 md:w-[20%] hidden font-sans text-[.9rem] font-normal">
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
  </div>);
}