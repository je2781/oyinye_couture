
import { regex } from "@/helpers/getHelpers";
import Slider from "@mui/material/Slider";
import { SyntheticEvent, useRef } from "react";

export default function FilterSettings({
  setFilter,
  filter,
  newPriceBoundary,
  currentPriceBoundary,
  setPrice,
  setSliderVal,
  setIsLoading,
  price,
  prodType,
  setNewPriceBoundary,
  sliderVal,
  productTypeList,
}: any) {

  const lowerInputRef = useRef<HTMLInputElement>(null);
  const upperInputRef = useRef<HTMLInputElement>(null);

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
  return (
    <div className="md:w-[20%] md:inline-flex hidden flex-col gap-y-7">
      <section className="flex flex-row justify-between items-center w-full">
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
      </section>
      <section className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-5">
          <header
            className="flex flex-row justify-between items-center cursor-pointer"
            onClick={(e) => {
              let upAngle = e.currentTarget.querySelector("header i");
              let section = e.currentTarget;
              let content = section.parentNode?.querySelector("#price-content");

              if (upAngle && section) {
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
          <section
            id="price-content"
            className="flex flex-col gap-y-7"
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
                  ref={upperInputRef}
                  className="focus:outline-none h-full w-full"
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
                disableSwap
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
          </section>
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
            <section
            id="productType-content"
            className="flex flex-col gap-y-5"
            >
                <ul className="flex-col font-sans text-[.9rem] text-gray-500 flex gap-y-2">
                {productTypeList.map((item: any, i: number) => (
                    <li className="inline-flex flex-row gap-x-3 items-center " key={i}>
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
                            cursor-pointer outline-none checked:bg-gray-500 checked:after:absolute checked:after:content-[''] checked:after:top-[1px] checked:after:left-[3.5px] checked:after:w-[5px] checked:after:h-[8px]
                            checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                            checked:after:rotate-45" checked={filter.productType === item ? true : false}/>
                        <span
                        >
                            {item}
                        </span>
                    </li>
                ))}
                </ul>
            </section>
        </div>
      </section>

    </div>
  );
}
