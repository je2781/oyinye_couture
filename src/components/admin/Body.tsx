"use client";

import {
  colorsReducer,
  driveList,
  getDataset,
  currentDate,
  currentMonth,
  currentYear,
  currentDay,
  handleBackImageupload,
  handleFrontImagesupload,
  handlePriceChange,
  handleStockChange,
  handleSubmit,
  lineGraphOptions,
  months,
  sizes,
  verticalBarGraphOptions,
  productTypeGraphOptions,
  deliveryOptionsGraphOptions,
} from "@/helpers/getHelpers";
import "./Body.css";
import React from "react";
import toast from "react-hot-toast";
import { EmailType, SizeData, Value } from "@/interfaces";
import axios from "axios";
import Calendar from 'react-calendar';
import { Swiper, SwiperSlide } from "swiper/react";
import FullCalendar from '@fullcalendar/react';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';

import "swiper/css";
import 'react-calendar/dist/Calendar.css';
import useWindowWidth from "../helpers/getWindowWidth";
import { AdminSettingsModal, MobileModal } from "../ui/Modal";
import useGlobal from "@/store/useGlobal";
import AdminPagination from "../layout/AdminPagination";
import { Chart, LinearScale, CategoryScale, BarElement, PointElement, LineElement, Filler, Legend, ArcElement } from 'chart.js';

Chart.register(LinearScale, CategoryScale, BarElement, PointElement, LineElement, Filler, Legend, ArcElement);

import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Link from "next/link";
import { sendMail } from "@/helpers/mailer";


export default function Body({
  pathName,
  extractedOrders,
  data, 
  appointmentsData,
  visitors
}: any) {
  const colorList = [
    "bg-yellow-950",
    "bg-red-800",
    "bg-blue-800",
    "bg-green-800",
    "bg-purple-800",
    "bg-slate-400",
  ];

  const [dailyData, dailyProductTypeData, dailyVisitorsData, dailyDeliveryOptionsData, dailyPaymentTypeData, monthData, monthProductTypeData, monthVisitorsData, monthDeliveryOptionsData, monthPaymentTypeData, annualData, annualProductTypeData, annualVisitorsData, annualDeliveryOptionsData, annualPaymentTypeData] = getDataset(extractedOrders);

  const [dressColorsState, dispatchAction] = React.useReducer(
    colorsReducer,
    []
  );
  const [isChecked, setIsChecked] = React.useState(false);
  const [orders, setOrders] = React.useState<any[]>(extractedOrders);
  const [appts, setAppts] = React.useState<any[]>(appointmentsData.appointments);
  const [orderListLength, setOrderListLength] = React.useState('10');
  const [isReading, setIsReading] = React.useState(false);
  const [isReplying, setIsReplying] = React.useState(false);
  const [frontFilename, setFrontFilename] = React.useState<string | null>(null);
  const [backFilename, setBackFilename] = React.useState<string | null>(null);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = React.useState(false);
  const [imgData, setImgData] = React.useState<
    {
      size: string;
      filename: string;
    }[]
  >([]);
  const [sizeData, setSizeData] = React.useState<SizeData[]>([]);
  const [start, setStart] = React.useState<string>(`${(currentDate - 29) <= 0 && currentMonth === 0 ? currentYear - 1 : currentYear}-${(currentDate - 29) <= 0 ? ('0' + (currentMonth === 0 ? 8 : currentMonth-4)).slice(-2) : ('0' + (currentMonth -3)).slice(-2)}-${(currentDate - 29) <= 0 ? ('0' + (new Date(currentDate -29 <= 0 && currentMonth === 0 ? currentYear-1 : currentYear, currentDate -29 <= 0 && currentMonth === 0 ? 8 : currentMonth-4, 0).getDate() - Math.abs(currentDate - 29))).slice(-2) : ('0' + (currentDate - 29)).slice(-2)}`);
  const [end, setEnd] = React.useState<string>(`${currentYear}-${('0' + (currentMonth + 1)).slice(-2)}-${('0' + currentDate).slice(-2)}`);
  const [startDate, setStartDate] = React.useState(`${(currentDate - 29) <= 0 ? new Date(currentDate -29 <= 0 && currentMonth === 0 ? currentYear-1 : currentYear, currentDate -29 <= 0 && currentMonth === 0 ? 8 : currentMonth-4, 0).getDate() - Math.abs(currentDate - 29) : currentDate - 29} ${(currentDate - 29) <= 0 ? (currentMonth === 0 ? months[7] : months[currentMonth-5]) : months[currentMonth -4]} ${(currentDate - 29) <= 0 && currentMonth === 0 ? currentYear - 1 : currentYear}`);
  const [endDate, setEndDate] = React.useState(`${new Date().getDate()} ${months[currentMonth]} ${new Date().getFullYear()}`);
  const [endValue, setEndValue] = React.useState<Value>(new Date(endDate));
  const [startValue, setStartValue] = React.useState<Value>(new Date(startDate));
  const [price, setPrice] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [range, setRange] = React.useState<number | null>(5);
  const [period, setPeriod] = React.useState<string | null>('monthly');
  const [lineGraphData, setLineGraphData] = React.useState(Object.values(monthData)[4]);
  const [productTypeBarGraphData, setProductTypeBarGraphData] = React.useState(Object.values(monthProductTypeData)[4]);
  const [visitorsBarGraphData, setVisitorsBarGraphData] = React.useState(Object.values(monthVisitorsData)[4]);
  const [deliveryOptionsData, setDeliveryOptionsData] = React.useState(Object.values(monthDeliveryOptionsData)[4]);
  const [paymentTypeData, setPaymentTypeData] = React.useState(Object.values(monthPaymentTypeData)[4]);
  let width = useWindowWidth();
  const { isMobileModalOpen, setIsMobileModalOpen } = useGlobal();
  const [loader, setLoader] = React.useState(false);
 

  let timerId: NodeJS.Timeout | null = null;

  let currentBgColors: string[] = [];

  dressColorsState.forEach((colorObj) => {
    currentBgColors.push(Object.keys(colorObj)[0]);
  });


  function handleSelectedSize(e: React.MouseEvent, index: number) {
    let selectedSize = document.querySelector(
      `#size${index}`
    ) as HTMLSpanElement;
    let sizeEls = document.querySelectorAll("[id^=size]") as NodeListOf<
      HTMLSpanElement
    >;

    if (currentBgColors.length > 0) {
      if (selectedSize.classList.contains("text-white")) {
        let activeSizes: string[] = [];

        selectedSize.classList.remove(
          "text-white",
          `${currentBgColors[currentBgColors.length - 1]}`
        );
        selectedSize.classList.add("bg-white", "text-black");

        //filtering size data for size that has been removed
        let updatedSizeData = sizeData.filter(
          (datum, index) => datum.number!.toString() !== selectedSize.innerText
        );

        //retrieving sizes that are still active
        sizeEls.forEach((el) => {
          if (el.classList.contains("text-white")) {
            activeSizes.push(el.innerText);
          }
        });

        if (activeSizes.length >= 1) {
          setSizeData(updatedSizeData);
          setPrice(updatedSizeData[updatedSizeData.length - 1].price!);
          setIsChecked(
            updatedSizeData[updatedSizeData.length - 1].stock
              ? updatedSizeData[updatedSizeData.length - 1].stock! > 0
              : false
          );
          setStock(
            updatedSizeData[updatedSizeData.length - 1].stock
              ? updatedSizeData[updatedSizeData.length - 1].stock!.toString()
              : ""
          );
        } else {
          //updating price and stock input elements for active size

          setPrice("");
          setIsChecked(false);
          setStock("");

          setSizeData(updatedSizeData);
        }
      } else {
        if (
          sizeData.length > 0 &&
          price.length === 0 &&
          sizeData.some(
            (datum) =>
              datum.color === currentBgColors[currentBgColors.length - 1]
          )
        ) {
          return toast.error(
            `size ${
              sizeData[sizeData.length - 1].number
            } is missing price, and stock`,
            {
              position: "top-center",
            }
          );
        }
        //storing size data of previous active size
        setSizeData((prevState) => [
          ...prevState,
          {
            ...prevState[prevState.length - 1],
            color: currentBgColors[currentBgColors.length - 1],
            number: parseInt(selectedSize.innerText),
            price: "",
            stock: undefined,
          },
        ]);

        // reseting price and stock input element value for active size
        setPrice("");
        setIsChecked(false);
        setStock("");

        selectedSize.classList.remove("text-black", "bg-white");
        selectedSize.classList.add(
          "text-white",
          `${currentBgColors[currentBgColors.length - 1]}`
        );
      }
    } else {
      toast.error("You need to select a color", {
        position: "top-center",
      });
    }
  }

  function handleSelectedColor(e: React.MouseEvent, index: number) {
    let item = e.currentTarget;

    let selectedColor = Array.from(item.classList).find((className) =>
      className.includes("bg-")
    )!;
    let priceInput = document.querySelector("#price") as HTMLInputElement;
    let stock = document.querySelector("#stock") as HTMLInputElement;
    let sizeEls = document.querySelectorAll("[id^=size]") as NodeListOf<
      HTMLSpanElement
    >;

    if (item.classList.contains("ring-2")) {
      item.classList.remove("ring-2", "ring-white");
      setSizeData(
        sizeData.filter(
          (datum) => datum.color !== currentBgColors[currentBgColors.length - 1]
        )
      );
      //retrieving size data of active color
      let updatedSizeData = sizeData.filter(
        (datum) => datum.color === currentBgColors[currentBgColors.length - 2]
      );

      if (updatedSizeData.length > 0) {
        //updating size elements, price and stock for active color
        for (let datum of updatedSizeData) {
          for (let i = 0; i < sizeEls.length; i++) {
            if (sizeEls[i].innerText === datum.number!.toString()) {
              if (sizeEls[i].classList.contains("text-white")) {
                sizeEls[i].classList.remove(`${selectedColor}`);
                sizeEls[i].classList.add(`${datum.color}`);
              } else {
                sizeEls[i].classList.remove(`bg-white`, "text-black");
                sizeEls[i].classList.add(`${datum.color}`, "text-white");
              }
            }
          }
        }
        setPrice(updatedSizeData[updatedSizeData.length - 1].price!);
        setStock(
          updatedSizeData[updatedSizeData.length - 1].stock
            ? updatedSizeData[updatedSizeData.length - 1].stock!.toString()
            : ""
        );
        setIsChecked(
          updatedSizeData[updatedSizeData.length - 1].stock
            ? updatedSizeData[updatedSizeData.length - 1].stock! > 0
            : false
        );
      } else {
        //reseting size elements for zero selected colors
        sizeEls.forEach((size) => {
          let bgClass = Array.from(size.classList).find((className) =>
            className.includes("bg-")
          );
          if (bgClass) {
            size.classList.remove(bgClass, "text-white");
            size.classList.add("bg-white", "text-black");
          }
        });

        // reseting price, stock input element values for zero selected colors
        setPrice("");
        setStock("");
        setIsChecked(false);
      }

      dispatchAction({
        type: "REMOVE",
        color: {
          type: selectedColor,
        },
      });
    } else {
      //validation check to prevent changing to new color without fully populating size data
      let updatedSizeData = sizeData.filter(
        (datum) => datum.color === currentBgColors[currentBgColors.length - 1]
      );
      if (
        currentBgColors.length > 0 &&
        (updatedSizeData.length === 0 ||
          updatedSizeData.every((datum) => datum.price!.length === 0))
      ) {
        return toast.error(
          `fill size data for ${currentBgColors[currentBgColors.length - 1]}`,
          {
            position: "top-center",
          }
        );
      }

      //reseting size elements for active color
      sizeEls.forEach((size) => {
        let bgClass = Array.from(size.classList).find((className) =>
          className.includes("bg-")
        );
        if (bgClass) {
          size.classList.remove(bgClass, "text-white");
          size.classList.add("bg-white", "text-black");
        }
      });

      // reseting price, stock input element values and image names for active color
      setPrice("");
      setStock("");
      setIsChecked(false);
      setBackFilename(null);
      setFrontFilename(null);

      item.classList.add("ring-2", "ring-white");
      dispatchAction({
        type: "ADD",
        color: {
          type: selectedColor,
        },
      });
    }
  }

  React.useEffect(() => {
    const timerId = setTimeout(async () => {
      if(orderListLength !== '10'){
        try {
          setLoader(true);
          const res = await axios.get(`/api/orders/${orderListLength}?page=1`);
          setOrders(res.data.orders);
        } catch (error: any) {
          toast.error(error.message);
        }finally{
          setLoader(false);
        }
      }
    }, 3000);

    return () => clearTimeout(timerId);
  }, [orderListLength]);

  React.useEffect(() => {
    if (isAdminSettingsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isAdminSettingsOpen]);

  React.useEffect(() => {
    let mobileNav = document.querySelector("#mobile-nav") as HTMLElement;
    if (isMobileModalOpen && mobileNav) {
      mobileNav.classList.add("forward");
      mobileNav.classList.remove("backward");
    }
  }, [isMobileModalOpen]);

  const hideAdminSettingsModalHandler = () => {
      const optionsMenus = document.querySelectorAll('[id^=options-menu]');

      optionsMenus.forEach(menu => {
        if(!menu.classList.contains('hidden')){
          menu.classList.add("hidden");
        }
      })
      setIsAdminSettingsOpen(false);
  }

  const hideMobileModalHandler = () => {
    let mobileNav = document.querySelector("#mobile-nav") as HTMLElement;
    if (mobileNav) {
      mobileNav.classList.remove("forward");
      mobileNav.classList.add("backward");
      timerId = setTimeout(() => {
        setIsMobileModalOpen(false);
      }, 300);
    } else {
      setIsMobileModalOpen(false);
    }
  };

  const sortOrderList = (e: React.MouseEvent, type: string, key = 'id') => {
    let item = e.currentTarget;
    let angleUp = item.querySelector('i.fa-angle-up');
    let angleDown = item.querySelector('i.fa-angle-down');
    let angleDowns = document.querySelectorAll(`i.fa-angle-down:not(#${type})`);
    let angleUps = document.querySelectorAll(`i.fa-angle-up:not(#${type})`);
  
    // Make a copy of the orders array to avoid mutating the original array
    let sortedOrders = [...orders];
  
    // Update angleDown's appearance accordingly
    if (angleDown?.classList.contains('text-secondary-400/20') && angleUp?.classList.contains('text-secondary-400')) {
      angleDown.classList.remove('text-secondary-400/20');
      angleDown.classList.add('text-secondary-400');
    } else {
      angleDown?.classList.remove('text-secondary-400');
      angleDown?.classList.add('text-secondary-400/20');
    }

    if (angleUp?.classList.contains('text-secondary-400')) {
      // Sort in descending order if angleUp is active
      angleUp.classList.remove('text-secondary-400');
      angleUp.classList.add('text-secondary-400/20');
      sortedOrders.sort((a, b) => {
        if (a[key] < b[key]) return 1;
        if (a[key] > b[key]) return -1;
        return 0;
      });
    }else {
      // Sort in ascending order if angleUp is not active
      angleUp?.classList.add('text-secondary-400');
      angleUp?.classList.remove('text-secondary-400/20');
      sortedOrders.sort((a, b) => {
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;
        return 0;
      });
    }
  
    angleDowns.forEach(angleDown => {
      angleDown.classList.remove('text-secondary-400');
      angleDown.classList.add('text-secondary-400/20');
    });

    angleUps.forEach(angleUp => {
        angleUp.classList.remove('text-secondary-400');
        angleUp.classList.add('text-secondary-400/20');
    });
  
    // Set the sorted orders state to trigger a re-render
    setOrders(sortedOrders);
  };
  

  // const browserUsageData = {
  //   chrome: visitors.filter((visitor: any) => visitor.browser === 'Chrome').length,
  //   safari: visitors.filter((visitor: any) => visitor.browser === 'Safari').length,
  //   firefox: visitors.filter((visitor: any) => visitor.browser === 'Firefox').length,
  //   ie: visitors.filter((visitor: any) => visitor.browser === 'IE').length,
  //   edgeL: visitors.filter((visitor: any) => visitor.browser === 'Edge (Legacy)').length,
  //   opera: visitors.filter((visitor: any) => visitor.browser === 'Opera').length,
  //   edgeC: visitors.filter((visitor: any) => visitor.browser === 'Edge (Chromium)').length,
  // };

  return (
      <main
        className="bg-primary-950 min-h-screen pt-4 md:pl-64 pl-7 lg:pr-3 pr-7 w-full py-12"
        id="admin-content"
        role="main"
      >
        {pathName === "product-listing" && (
          <section className="flex lg:flex-row flex-col gap-y-12 lg:gap-x-6 pl-5 pr-1 w-full h-full">
            <section className="lg:flex flex-col gap-y-6 items-start xl:w-[22%] lg:w-[30%] hidden">
              <form
                onSubmit={(e) =>
                  handleSubmit(
                    e,
                    title,
                    desc,
                    type,
                    dressColorsState,
                    currentBgColors,
                    sizeData,
                    setIsLoading
                  )
                }
                className="flex flex-col gap-y-5 w-full"
                noValidate
              >
                <div className="flex flex-col gap-y-4 w-full">
                  <div className="inline-flex flex-col w-full">
                    <label
                      htmlFor="upload-front"
                      onClick={() => {
                        if (currentBgColors.length === 0) {
                          toast.error("Select a dress color first", {
                            position: "top-center",
                          });
                        }
                      }}
                      className="cursor-pointer px-10 py-3 bg-accent text-white rounded-sm text-[1rem] text-center"
                    >
                      {frontFilename ? `${frontFilename}` : "Front Upload"}
                    </label>

                    <input
                      id="upload-front"
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        handleFrontImagesupload(
                          e,
                          dispatchAction,
                          currentBgColors,
                          setImgData,
                          setFrontFilename,
                        )
                      }
                      disabled={currentBgColors.length === 0}
                    />
                  </div>
                  <div className="inline-flex flex-col w-full">
                    <label
                      htmlFor="upload-back"
                      onClick={() => {
                        if (currentBgColors.length === 0) {
                          toast.error("Select a dress color first", {
                            position: "top-center",
                          });
                        }
                      }}
                      className={`${
                        backFilename ? "cursor-not-allowed" : "cursor-pointer"
                      } px-10 py-3 bg-accent text-white rounded-sm text-[1rem] text-center`}
                    >
                      {backFilename ? `${backFilename}` : "Back Upload"}
                    </label>

                    <input
                      id="upload-back"
                      type="file"
                      disabled={currentBgColors.length === 0 || backFilename !== null}
                      className="hidden"
                      onChange={(e) =>
                        handleBackImageupload(
                          e,
                          dispatchAction,
                          currentBgColors,
                          setImgData,
                          setBackFilename,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="text-secondary-400 flex flex-col gap-y-7 text-sm w-full">
                  <input
                    placeholder="Title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary-400 bg-transparent placeholder:text-secondary-400"
                  />
                  <textarea
                    className="w-full bg-transparent focus:outline-none border border-t-0 border-l-0 border-r-0 border-secondary-400"
                    cols={15}
                    rows={5}
                    id="description"
                    placeholder="Description..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  ></textarea>
                  <input
                    placeholder="Type"
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary-400 bg-transparent placeholder:text-secondary-400"
                  />
                  <section className="flex flex-col gap-y-2 items-start w-full">
                    <h5>Color</h5>
                    <div
                      className="flex flex-row flex-wrap gap-x-[6px] gap-y-2"
                      id="colors-list"
                    >
                      {colorList.map((_, i: number) => (
                        <span
                          key={i}
                          onClick={(e) => handleSelectedColor(e, i)}
                          className={`rounded-sm cursor-pointer ${colorList[i]} w-6 h-6`}
                        ></span>
                      ))}
                    </div>
                  </section>
                  <section className="flex flex-col gap-y-3 items-start w-full">
                    <h5>Size</h5>
                    <div
                      className="flex flex-row flex-wrap gap-x-[6px] gap-y-6"
                      id="size-list"
                    >
                      {sizes.map((item: number, i: number) => (
                        <div className="relative" key={i}>
                          <span
                            onClick={(e) => handleSelectedSize(e, i)}
                            id={`size${i}`}
                            className={`rounded-[50%] cursor-pointer py-2 px-[10px] bg-white w-8 h-8 text-xs font-medium text-black text-center`}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <input
                    placeholder="Price"
                    type="number"
                    min={0}
                    step={50}
                    id="price"
                    onChange={(e) =>
                      handlePriceChange(
                        e,
                        currentBgColors,
                        sizeData,
                        setSizeData,
                        setPrice
                      )
                    }
                    value={price}
                    className="w-full focus:outline-none border border-t-0 border-l-0 border-r-0 border-secondary-400 bg-transparent placeholder:text-secondary-400"
                  />
                  <section className="flex flex-row w-full items-end h-8">
                    <div className="flex flex-row gap-x-2 w-[40%]">
                      <h5>In Stock</h5>
                      <input
                        onChange={(e) =>
                          handleStockChange(
                            e,
                            currentBgColors,
                            sizeData,
                            setIsChecked
                          )
                        }
                        checked={isChecked}
                        id="stock-check"
                        type="checkbox"
                        className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-500 rounded-sm relative
                      cursor-pointer outline-none checked:bg-accent checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                      checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                      checked:after:rotate-45"
                      />
                    </div>
                    {isChecked && (
                      <input
                        placeholder="Stock"
                        type="number"
                        min={0}
                        step={1}
                        id="stock"
                        onChange={(e) => {
                          setStock(e.target.value);
                          //storing size data of previous active size
                          setSizeData((prevState) => [
                            ...prevState,
                            {
                              ...prevState[prevState.length - 1],
                              color: currentBgColors[currentBgColors.length - 1],
                              stock: parseInt(e.target.value),
                            },
                          ]);
                        }}
                        value={stock}
                        className="w-[60%] focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary-400 bg-transparent placeholder:text-secondary-400"
                      />
                    )}
                  </section>
                  <button
                    type="submit"
                    className="flex flex-row justify-center items-center bg-white mt-7 w-full text-accent text-[1rem] py-3 px-5 rounded-lg hover:bg-accent hover:text-white font-medium"
                  >
                    {isLoading ? (
                      <div className="border-2 border-transparent rounded-full border-t-accent border-r-accent w-[15px] h-[15px] spin"></div>
                    ) : (
                      <span>
                        <i className="fa-solid fa-paper-plane"></i>
                        &nbsp;&nbsp;Submit Product
                      </span>
                    )}
                  </button>
                </div>
              </form>
              <div className="px-3 flex flex-col gap-y-5 text-[1rem] py-2 mt-3">
                <header className="text-white font-sans font-medium">
                  My Drive
                </header>
                <ul className="flex flex-col gap-y-5">
                  {driveList.map((item: string, i: number) => (
                    <div
                      key={i}
                      className="cursor-pointer transition-all duration-200 pl-0 hover:pl-2 ease-out  inline-flex flex-row gap-x-3 items-center text-secondary-400"
                    >
                      <i className="fa-regular fa-folder"></i>
                      <h2>{item}</h2>
                    </div>
                  ))}
                </ul>
              </div>
            </section>
            <section className="lg:w-[70%] w-full h-full flex flex-col gap-y-16">
              {imgData.length > 0 && (
                <Swiper
                  slidesPerView={width < 1024 ? 2 : 4}
                  spaceBetween={width < 1024 ? 100 : 200}
                  className="h-fit w-full"
                >
                  {imgData.map((datum, index) => (
                    <SwiperSlide
                      key={index}
                      className="w-full text-ellipsis text-nowrap"
                    >
                      <article className="flex flex-col gap-y-3">
                        <div className="flex flex-row justify-center items-center bg-primary-800 px-[6.7rem] py-11 h-fit rounded-sm">
                          <i className="fa-solid fa-file-image text-red-400 text-[2.5rem] leading-tight"></i>
                        </div>
                        <footer className="flex flex-col px-4 font-sans">
                          <span className="text-white font-medium">
                            {datum.filename}
                          </span>
                          <span className="text-secondary-400">{datum.size}kb</span>
                        </footer>
                      </article>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
              <div className="flex flex-col items-start lg:gap-y-10 gap-y-5 font-sans w-full">
                <h1 className="font-medium lg:text-lg text-white text-[1rem]">
                  Folders
                </h1>
                <div className="flex flex-row gap-x-4 text-secondary-400 lg:pl-5 items-center">
                  <i className="fa-regular fa-folder-open lg:text-4xl text-3xl"></i>
                  <header className="flex flex-col items-start lg:text-[1rem] text-sm">
                    <h2>Photos</h2>
                    <p>
                      {imgData.length}files,&nbsp;
                      {(
                        imgData
                          .map((datum) => parseFloat(datum.size))
                          .reduce((a, b) => a + b, 0.0) * 1024
                      ).toFixed(1)}
                      mb
                    </p>
                  </header>
                </div>
              </div>
              <div className="flex flex-col items-start lg:gap-y-4 gap-y-2 font-sans w-full">
                <h1 className="font-medium lg:text-lg text-white text-[1rem] text-left">
                  Files
                </h1>
                <div className="text-secondary-400 lg:text-[1rem] text-sm">
                  {imgData.length === 0 ? (
                    <p>No files uploaded.</p>
                  ) : (
                    <div className="flex flex-row justify-start flex-wrap items-center gap-x-5 gap-y-9 w-full">
                      {imgData.map((datum, index) => (
                        <article className="flex flex-col gap-y-3" key={index}>
                          <div className="flex flex-row justify-center items-center bg-primary-800 lg:px-[5.8rem] px-16 py-8 lg:py-11 h-fit rounded-sm">
                            <i className="fa-solid fa-file-image text-red-400 text-[2.5rem] leading-tight"></i>
                          </div>
                          <footer className="flex flex-col px-4 font-sans">
                            <span className="text-white font-medium">
                              {datum.filename}
                            </span>
                            <span className="text-secondary-400">{datum.size}kb</span>
                          </footer>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
            <section className="lg:hidden flex flex-col gap-y-6 items-start w-full">
              <form
                onSubmit={(e) =>
                  handleSubmit(
                    e,
                    title,
                    desc,
                    type,
                    dressColorsState,
                    currentBgColors,
                    sizeData,
                    setIsLoading
                  )
                }
                className="flex flex-col gap-y-5 w-full"
                noValidate
              >
                <section className="flex flex-col gap-y-4 w-full">
                  <div className="inline-flex flex-col w-full">
                    <label
                      htmlFor="upload-front"
                      onClick={() => {
                        if (currentBgColors.length === 0) {
                          toast.error("Select a dress color first", {
                            position: "top-center",
                          });
                        }
                      }}
                      className="cursor-pointer px-10 py-3 bg-accent text-white rounded-sm text-[1rem] text-center"
                    >
                      {frontFilename ? `${frontFilename}` : "Front Upload"}
                    </label>

                    <input
                      id="upload-front"
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        handleFrontImagesupload(
                          e,
                          dispatchAction,
                          currentBgColors,
                          setImgData,
                          setFrontFilename,
                        )
                      }
                      disabled={currentBgColors.length === 0}
                    />
                  </div>
                  <div className="inline-flex flex-col w-full">
                    <label
                      htmlFor="upload-back"
                      onClick={() => {
                        if (currentBgColors.length === 0) {
                          toast.error("Select a dress color first", {
                            position: "top-center",
                          });
                        }
                      }}
                      className={`${
                        backFilename ? "cursor-not-allowed" : "cursor-pointer"
                      } px-10 py-3 bg-accent text-white rounded-sm text-[1rem] text-center`}
                    >
                      {backFilename ? `${backFilename}` : "Back Upload"}
                    </label>

                    <input
                      id="upload-back"
                      type="file"
                      disabled={currentBgColors.length === 0}
                      className="hidden"
                      onChange={(e) =>
                        handleBackImageupload(
                          e,
                          dispatchAction,
                          currentBgColors,
                          setImgData,
                          setBackFilename,
                        )
                      }
                    />
                  </div>
                </section>
                <div className="text-secondary-400 flex flex-col gap-y-7 text-sm w-full">
                  <input
                    placeholder="Title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary-400 bg-transparent placeholder:text-secondary-400"
                  />
                  <textarea
                    className="w-full bg-transparent focus:outline-none border border-t-0 border-l-0 border-r-0 border-secondary-400"
                    cols={15}
                    rows={5}
                    id="description"
                    placeholder="Description..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  ></textarea>
                  <input
                    placeholder="Type"
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary-400 bg-transparent placeholder:text-secondary-400"
                  />
                  <section className="flex flex-col gap-y-2 items-start w-full">
                    <h5>Color</h5>
                    <div
                      className="flex flex-row flex-wrap gap-x-[6px] gap-y-2"
                      id="colors-list"
                    >
                      {colorList.map((_, i: number) => (
                        <span
                          key={i}
                          onClick={(e) => handleSelectedColor(e, i)}
                          className={`rounded-sm cursor-pointer ${colorList[i]} w-6 h-6`}
                        ></span>
                      ))}
                    </div>
                  </section>
                  <section className="flex flex-col gap-y-3 items-start w-full">
                    <h5>Size</h5>
                    <div
                      className="flex flex-row flex-wrap gap-x-[6px] gap-y-6"
                      id="size-list"
                    >
                      {sizes.map((item: number, i: number) => (
                        <div className="relative" key={i}>
                          <span
                            onClick={(e) => handleSelectedSize(e, i)}
                            id={`size${i}`}
                            className={`rounded-[50%] cursor-pointer py-2 px-[10px] bg-white w-8 h-8 text-xs font-medium text-black text-center`}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <input
                    placeholder="Price"
                    type="number"
                    min={0}
                    step={50}
                    id="price"
                    onChange={(e) =>
                      handlePriceChange(
                        e,
                        currentBgColors,
                        sizeData,
                        setSizeData,
                        setPrice
                      )
                    }
                    value={price}
                    className="w-full focus:outline-none border border-t-0 border-l-0 border-r-0 border-secondary-400 bg-transparent placeholder:text-secondary-400"
                  />
                  <section className="flex flex-row w-full items-end h-8">
                    <div className="flex flex-row gap-x-2 w-[40%]">
                      <h5>In Stock</h5>
                      <input
                        onChange={(e) =>
                          handleStockChange(
                            e,
                            currentBgColors,
                            sizeData,
                            setIsChecked
                          )
                        }
                        checked={isChecked}
                        id="stock-check"
                        type="checkbox"
                        className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-500 rounded-sm relative
                        cursor-pointer outline-none checked:bg-accent checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                        checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                        checked:after:rotate-45"
                      />
                    </div>
                    {isChecked && (
                      <input
                        placeholder="Stock"
                        type="number"
                        min={0}
                        step={1}
                        id="stock"
                        onChange={(e) => {
                          setStock(e.target.value);
                          //storing size data of previous active size
                          setSizeData((prevState) => [
                            ...prevState,
                            {
                              ...prevState[prevState.length - 1],
                              color: currentBgColors[currentBgColors.length - 1],
                              stock: parseInt(e.target.value),
                            },
                          ]);
                        }}
                        value={stock}
                        className="w-[60%] focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary-400 bg-transparent placeholder:text-secondary-400"
                      />
                    )}
                  </section>
                  <button
                    type="submit"
                    className="flex flex-row justify-center items-center bg-white mt-7 w-full text-accent text-[1rem] py-3 px-5 rounded-lg hover:bg-accent hover:text-white font-medium"
                  >
                    {isLoading ? (
                      <div className="border-2 border-transparent rounded-full border-t-accent border-r-accent w-[15px] h-[15px] spin"></div>
                    ) : (
                      <span>
                        <i className="fa-solid fa-paper-plane"></i>
                        &nbsp;&nbsp;Submit Product
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </section>
        )}
        {pathName === "orders" && (
          <section className="flex flex-col items-center justify-center w-full gap-y-16">
            <div className={`flex flex-col items-start ${orders.length > 0 ? 'gap-y-7': 'gap-y-24'} w-full`}>
              <header className="inline-flex flex-row gap-x-3 text-secondary-400 text-sm items-center">
                <span>Show</span>
                <input
                  autoFocus
                  value={orderListLength}
                  onChange={(e) => setOrderListLength(e.target.value)}
                  className="text-white text-center w-10 h-8 px-2 py-1 bg-transparent border border-secondary-400/20 rounded-[5px] focus:outline-none "
                />
                <span>entries</span>
              </header>
              {orders.length === 0
              ? <section className="flex flex-row justify-center items-end text-white w-full">
                  <h1 className="font-sans text-lg">No Order has been created!</h1>
              </section>
              :
              <>
                <table className="w-full border-spacing-y-2 text-secondary-400 text-xs md:table hidden">
                  <thead className="w-full relative">
                    <tr>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[20%]">
                        <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                          <span>ORDER ID</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'order-id')}>
                            <i className="fa-solid fa-angle-up text-secondary-400" id='order-id'></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='order-id'></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[25%] py-1">
                        <div className="inline-flex flex-row justify-between gap-x-14 items-center w-full pl-9 pr-1 py-2">
                          <span>VAR ID(s)</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'var-id')}>
                            <i className="fa-solid fa-angle-up text-secondary-400/20" id="var-id"></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='var-id'></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[10%] py-1">
                        <div className="inline-flex flex-row justify-end gap-x-4 items-center w-full px-1 py-2">
                          <span>TOTAL</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'total', 'total')} >
                            <i className="fa-solid fa-angle-up text-secondary-400/20" id='total'></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='total'></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[15%] py-1">
                        <div className="inline-flex flex-row justify-end gap-x-11 items-center w-full px-1 py-2">
                          <span>STATE</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'state', 'status')}>
                            <i className="fa-solid fa-angle-up text-secondary-400/20" id="state"></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='state'></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[12.5%] py-1">
                        <div className="inline-flex flex-row justify-end gap-x-9 items-center w-full px-1 py-2">
                          <span>TYPE</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'type', 'paymentType')}>
                            <i className="fa-solid fa-angle-up text-secondary-400/20" id='type'></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='type'></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[12.5%] py-1">
                        <div className="inline-flex flex-row justify-end gap-x-7 items-center w-full px-1 py-2">
                          <span>STATUS</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'status', 'paymentStatus')}>
                            <i className="fa-solid fa-angle-up text-secondary-400/20" id='status'></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='status'></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[5%] py-1"></th>
                    </tr>
                    {loader && (
                      <div className="absolute bottom-0 left-0 w-full h-[4px]">
                        <div className="trailing-progress-bar w-full">
                          <div className="trailing-progress bg-blue-500 h-full"></div>
                        </div>
                      </div>
                    )}
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((order: any, i: number) => (
                      <tr key={i}>
                        <td className="bg-transparent text-start border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[20%] py-5 pl-9 pr-1 font-medium">
                          {order.id}
                        </td>
                        <td className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[25%] py-5 font-medium pl-9 pr-1">
                          {order.items.map((item: any, i: number) => (
                            <span key={i}>{item.variantId},&nbsp;</span>
                          ))}
                        </td>
                        <td className="bg-transparent text-center border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[10%] py-5 font-medium">
                          {order.totalQuantity}
                        </td>
                        <td className="bg-transparent text-center border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[15%] py-5 font-medium">
                          {order.status}
                        </td>
                        <td className="bg-transparent text-center border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[12.5%] py-5 font-medium">
                          {order.paymentType.length === 0 ? "---" : order.paymentType}
                        </td>
                        <td className="bg-transparent text-center border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[12.5%] py-5 font-medium">
                          {order.paymentStatus.length === 0
                            ? "---"
                            : order.paymentStatus}
                        </td>
                        <td className="bg-transparent relative border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[5%]">
                          <i
                            className="fa-solid fa-ellipsis-vertical text-lg cursor-pointer"
                            onClick={(e) => {
                              let item = e.currentTarget;
                              if(!loader){
                                let menu = item.parentNode?.querySelector(
                                  "#options-menu"
                                ) as HTMLDivElement;
                                menu.classList.toggle("hidden");
                              }
                            }}
                            id="options-ellipsis-icon"
                          ></i>
                          <span className="sr-only">Open admin options</span>
                          <div
                            id="options-menu"
                            className="space-y-4 hidden absolute right-8 z-10 mt-2 w-40 origin-top-right rounded-md text-secondary-400 bg-primary-800 shadow-lg ring-1 ring-black ring-opacity-5 py-4 px-3 focus:outline-none"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="options-ellipsis-icon"
                          >
                            <h2
                              onClick={() => setIsAdminSettingsOpen(true)}
                              className="hover:text-accent text-xs cursor-pointer"
                            >
                              Update Payment status
                            </h2>
                            {order.paymentType === "streetzwyze" && (
                              <h2
                                onClick={() => setIsAdminSettingsOpen(true)}
                                className="hover:text-accent text-xs cursor-pointer"
                              >
                                Send Payment request
                              </h2>
                            )}
                            {order.status === "add to cart" && (
                              <button onClick={async (e) => {
                                try {
                                  setIsLoading(true);
                                  await axios.post('/api/orders/send/reminder',{
                                    items: order.items
                                  });
                                } catch (error: any) {
                                  toast.error(error.message);
                                }finally{
                                  setIsLoading(false);
                                  toast.success('reminder sent', {
                                    position: 'top-center'
                                  });
                                }
                              }} className="hover:text-accent text-xs">
                                {isLoading ? 'Processing..' : 'Send Reminder'}
                              </button>
                            )}
                          </div>
                        </td>
                        {isAdminSettingsOpen && pathName === "orders" && (
                          <AdminSettingsModal onClose={hideAdminSettingsModalHandler} left='17.5rem' width='35rem'>
                            <section
                              id="admin-options"
                              className="flex flex-col gap-y-7 items-start px-4 py-4 justify-center"
                            >
                              <header className="text-xl font-bold">
                                Options&nbsp;&nbsp;
                                <i className="text-lg fa-solid fa-wrench text-gray-400"></i>
                              </header>
                              <div className="flex flex-col gap-y-7 w-full">
                                <div className="flex flex-col w-full gap-y-6">
                                  <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-y-3 w-full">
                                    <div className="flex flex-col">
                                      <h2 className="text-left text-sm">
                                        Payment Status
                                      </h2>
                                      <h2 className="text-left text-xs text-gray-400">
                                        Sets the status of order payments
                                      </h2>
                                    </div>
                                    <select id='payment-status' className="text-sm text-gray-600 focus:outline-none w-[50%] md:w-[30%]">
                                      <option hidden selected value=''>choose status</option>
                                      <option value="pending">pending</option>
                                      <option value="paid">paid</option>
                                      <option value="failed">failed</option>
                                    </select>
                                  </div>
                                  <button onClick={async (e) => {
                                    let selectedStatus = document.querySelector('#payment-status') as HTMLSelectElement;
                                    if(selectedStatus && selectedStatus.value.length === 0){
                                      return;
                                    }
                                    try {
                                      setIsLoading(true);
                                      await axios.post('/api/orders/update/payment-status', {
                                        paymentStatus: selectedStatus.value
                                      });
                                    } catch (error: any) {
                                      toast.error(error.message);
                                    }finally{
                                      setIsLoading(false);
                                      toast.success('payment status updated', {
                                        position: 'top-center'
                                      });
                                    }
                                  }} className="px-7 py-2 bg-accent text-white hover:ring-accent hover:ring-1 rounded-md text-xs">
                                    {isLoading ? <span className="border-2 border-transparent rounded-full border-t-white border-r-white w-[15px] h-[15px] spin"></span> : 'Update Status'}
                                  </button>
                                </div>
                                {order.paymentType === "streetzwyze" && (
                                  <div className="flex flex-col gap-y-3 w-full">
                                    <div className="flex flex-col cursor-pointer">
                                      <h2 className="text-left text-sm">
                                        Payment Request
                                      </h2>
                                      <h2 className="text-left text-xs text-gray-400">
                                        Send email with payment link to customer
                                      </h2>
                                    </div>
                                    <div className="h-24 flex flex-col items-start gap-y-2 w-full">
                                      <textarea
                                        className="bg-[#f3f3f3] w-full text-xs rounded-sm placeholder:text-gray-600 placeholder:text-xs p-2 focus:outline-none"
                                        placeholder="add payment link here"
                                        id='request-content'
                                        cols={25}
                                        rows={15}
                                      ></textarea>
                                      <button onClick={async (e) => {
                                        let content = document.querySelector('#request-content') as HTMLSelectElement;
                                        if(content && content.value.length === 0){
                                          return;
                                        }
                                        try {
                                          setIsLoading(true);
                                          await axios.post('/api/orders/send/payment-request', {
                                            link: content.value.trim(),
                                            id: order.id,
                                            total: order.sales
                                          });
                                        } catch (error: any) {
                                          toast.error(error.message);
                                        }finally{
                                          setIsLoading(false);
                                          toast.success('payment request sent', {
                                            position: 'top-center'
                                          });
                                        }
                                      }} className="px-7 py-2 w-full bg-accent text-white hover:ring-accent hover:ring-1 rounded-md text-xs">
                                        {isLoading ? <span className="border-2 border-transparent rounded-full border-t-white border-r-white w-[15px] h-[15px] spin"></span> : <span>Send&nbsp;&nbsp;
                                        <i className="fa-solid fa-paper-plane text-white hover:text-accent text-xs"></i></span>}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </section>
                          </AdminSettingsModal>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="w-full border-spacing-y-2 text-secondary-400 text-xs md:hidden table">
                  <thead>
                    <tr>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                        <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                          <span>ORDER ID</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'order-id-sm-screen')}>
                            <i className="fa-solid fa-angle-up text-secondary-400" id='order-id-sm-screen'></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='order-id-sm-screen'></i>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((order: any, i: number) => (
                      <tr key={i}>
                        <td className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium flex flex-row justify-between items-center">
                          <span>{order.id}</span>
                          <div className="inline-block pr-1 relative">
                            <i
                              className="fa-solid fa-ellipsis-vertical text-lg cursor-pointer"
                              onClick={(e) => {
                                let item = e.currentTarget;
                                if(!loader){
                                  let menu = item.parentNode?.querySelector(
                                    "#options-menu-sm-screen"
                                  ) as HTMLDivElement;
                                  menu.classList.toggle("hidden");
                                }
                              }}
                            ></i>
                            <span className="sr-only">Open admin options</span>
                            <div
                              id="options-menu-sm-screen"
                              className="space-y-4 hidden absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md text-secondary-400 bg-primary-800 shadow-lg ring-1 ring-black ring-opacity-5 py-4 px-3 focus:outline-none"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby="options-ellipsis-icon"
                            >
                              <h2
                                onClick={() => setIsAdminSettingsOpen(true)}
                                className="hover:text-accent text-xs cursor-pointer"
                              >
                                Update Payment status
                              </h2>
                              {order.paymentType === "streetzwyze" && (
                                <h2
                                  onClick={() => setIsAdminSettingsOpen(true)}
                                  className="hover:text-accent text-xs cursor-pointer"
                                >
                                  Send Payment request
                                </h2>
                              )}
                              {order.status === "add to cart" && (
                                <button onClick={async (e) => {
                                  try {
                                    setIsLoading(true);
                                    await axios.post('/api/orders/send/reminder',{
                                      items: order.items
                                    });
                                  } catch (error: any) {
                                    toast.error(error.message);
                                  }finally{
                                    setIsLoading(false);
                                    toast.success('reminder sent', {
                                      position: 'top-center'
                                    })
                                  }
                                }} className="hover:text-accent text-xs">
                                  {isLoading ? 'Processing..' : 'Send Reminder'}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="w-full border-spacing-y-2 text-secondary-400 text-xs md:hidden table">
                  <thead>
                    <tr>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                        <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                          <span>VAR ID(s)</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'var-id-sm-screen')}>
                            <i className="fa-solid fa-angle-up text-secondary-400/20" id='var-id-sm-screen'></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='var-id-sm-screen'></i>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((order: any, i: number) => (
                      <tr key={i}>
                        <td className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-5 font-medium pl-9 pr-1">
                          {order.items.map((item: any, i: number) => (
                            <span key={i}>{item.variantId},&nbsp;</span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="w-full border-spacing-y-2 text-secondary-400 text-xs md:hidden table">
                  <thead>
                    <tr>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                        <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                          <span>TOTAL</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'total-id-sm-screen', 'total')}>
                            <i className="fa-solid fa-angle-up text-secondary-400/20" id='total-id-sm-screen'></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='total-id-sm-screen'></i>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((order: any, i: number) => (
                      <tr key={i}>
                        <td className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium">
                          {order.totalQuantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="w-full border-spacing-y-2 text-secondary-400 text-xs md:hidden table">
                  <thead>
                    <tr>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                        <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                          <span>STATE</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'state-id-sm-screen', 'status')}>
                            <i className="fa-solid fa-angle-up text-secondary-400/20" id='state-id-sm-screen'></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='state-id-sm-screen'></i>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((order: any, i: number) => (
                      <tr key={i}>
                        <td className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium">
                          {order.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="w-full border-spacing-y-2 text-secondary-400 text-xs md:hidden table">
                  <thead>
                    <tr>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                        <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                          <span>TYPE</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'type-id-sm-screen', 'paymentType')}>
                            <i className="fa-solid fa-angle-up text-secondary-400/20" id='type-id-sm-screen'></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='type-id-sm-screen'></i>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((order: any, i: number) => (
                      <tr key={i}>
                        <td className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium">
                          {order.paymentType.length === 0 ? "---" : order.paymentType}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="w-full border-spacing-y-2 text-secondary-400 text-xs md:hidden table">
                  <thead>
                    <tr>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                        <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                          <span>STATUS</span>
                          <div className="flex flex-col text-[1rem] cursor-pointer" onClick={(e) => sortOrderList(e, 'status-id-sm-screen', 'paymentStatus')}>
                            <i className="fa-solid fa-angle-up text-secondary-400/20" id='status-id-sm-screen'></i>
                            <i className="fa-solid fa-angle-down text-secondary-400/20 -mt-2" id='status-id-sm-screen'></i>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((order: any, i: number) => (
                      <tr key={i}>
                        <td className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium">
                          {order.paymentStatus.length === 0
                            ? "---"
                            : order.paymentStatus}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>}
            </div>
            {orders.length > 0 && <AdminPagination {...data} />}
          </section>
        )}
        {
          pathName === 'summary' && (
            <section className="flex flex-col gap-y-12 md:gap-y-8 w-full relative justify-between lg:pr-8">
              <span id="report-settings" onClick={() => {
                setIsAdminSettingsOpen(true);
              }} className="cursor-pointer flex flex-row items-center absolute md:right-10 right-4 -top-4">
                  <span className="sr-only">Open report settings</span>
                  <i className="text-sm fa-solid fa-wrench text-gray-400"></i>&nbsp;
                  <i className="text-sm fa-solid fa-caret-down text-gray-400"></i>
              </span>
              <article className="w-full h-[32%] md:h-[32vh]" id='total-sales-graph'>
                  <Line options={lineGraphOptions}
                    data={lineGraphData}
                  >
                  </Line>
              </article>
              <article className="flex md:flex-row flex-col w-full h-[35%] md:h-[35vh] gap-y-8">
                <div className={`${paymentTypeData.datasets[0].data.reduce((a: number,b: number) => a+b, 0) > 0 ? 'md:w-[40%]' : 'md:w-[50%]'} w-full md:pr-3`}>
                  <Bar options={productTypeGraphOptions}
                    data={productTypeBarGraphData}
                  >
                  </Bar>
                </div>
                <div className={`${paymentTypeData.datasets[0].data.reduce((a: number,b: number) => a+b, 0) > 0 ? 'md:w-[35%]' : 'md:w-[50%]'} w-full md:pl-3 h-[92%]`}>
                  <Bar options={verticalBarGraphOptions}
                    data={visitorsBarGraphData}
                  >
                  </Bar>
                </div>
                {paymentTypeData.datasets[0].data.reduce((a: number,b: number) => a+b, 0) > 0 && <div className="md:w-[25%] w-full flex flex-row items-center md:justify-start justify-center gap-x-2">
                  <div className="md:w-[70%] w-full">
                    <Doughnut options={{
                          plugins: {
                              legend: {
                                  display: width <= 768 ? true : false
                              },
                          },
                          responsive: true,
                          maintainAspectRatio: false
                      }}
                      data={paymentTypeData}
                    >

                    </Doughnut>
                  </div>
                  <ul className="md:inline-flex flex-col items-start gap-y-2 w-[30%] hidden">
                      <li className="flex flex-row gap-x-2 items-center"><i className="fa-solid fa-circle text-[#FFA500] text-[8px] align-middle"></i><span className="text-xs font-sans text-secondary-400">Streetzwyze</span></li>
                      <li className="flex flex-row gap-x-2 items-center"><i className="fa-solid fa-circle text-[#51b2ca] text-[8px] align-middle"></i><span className="text-xs font-sans text-secondary-400">Interswitch</span></li>
                      {/* <li className="flex flex-row gap-x-2 items-center"><i className="fa-solid fa-circle text-[#4a48c7] text-[8px] align-middle"></i><span className="text-xs font-sans text-secondary-400">Opera</span></li> */}
                  </ul>
                </div>}
              </article>
              <article className={`${paymentTypeData.datasets[0].data.reduce((a: number,b: number) => a+b, 0) > 0 ? 'md:w-[40%]' : 'md:w-[50%]'} w-full h-[33%] md:h-[33vh]`}>
                <Bar options={deliveryOptionsGraphOptions}
                  data={deliveryOptionsData}
                >

                </Bar>
              </article>
              {
                isAdminSettingsOpen && pathName === "summary" && <AdminSettingsModal onClose={hideAdminSettingsModalHandler} left='20rem' width='40rem' classes='h-fit bg-white'>
                  
                  <section className="flex-col gap-y-6 items-start px-5 py-6 justify-center flex h-full">
                      
                      <header className="text-xl font-bold">Settings&nbsp;&nbsp;<i className="text-lg fa-solid fa-wrench text-gray-400"></i></header>
                      <div className="flex flex-row gap-x-1">
                          <div className="relative">
                              <input 
                              type="text"
                              value={startDate}
                              onChange={(e) => {
                                //extracting date data from input
                                let extractedDate, extractedYear;
                                let extractedMonth = 0;
                                
                                extractedDate = parseInt(e.target.value.split(' ')[0]);
                                for(let i = 0; i < months.length; i++){
                                  if(months[i] === e.target.value.split(' ')[1]){
                                    extractedMonth = i; 
                                  }
                                }
                                extractedYear = parseInt(e.target.value.split(' ')[2]);
                                //binding value to change event
                                setStartDate(e.target.value);

                              const timeDiff = new Date(currentYear, currentMonth+1, currentDate).getTime() - new Date(extractedYear, extractedMonth!+1, extractedDate).getTime();
                              //validation check
                              if(timeDiff  < 86400000){
                                setIsAdminSettingsOpen(false);
                                alert('start date has to be at least 1 day apart from end date');
                                return;
                              }else{
                                setStart(`${extractedYear}-${('0' + (extractedMonth! + 1)).slice(-2)}-${('0' + extractedDate).slice(-2)}`);

                                //clearing factory range and period
                                setRange(null);
                                setPeriod(null);

                                if(timeDiff <= 2505600000){
                                  let range = timeDiff/86400000;

                                  setLineGraphData(Object.values(dailyData)[Math.round(range-1)]);
                                  setProductTypeBarGraphData(Object.values(dailyProductTypeData)[Math.round(range-1)]);
                                  setVisitorsBarGraphData(Object.values(dailyVisitorsData)[Math.round(range-1)]);
                                  
                                }

                                if(timeDiff > 31560000000 && timeDiff <= 378720000000){
                                  let range = timeDiff/31560000000;

                                  setLineGraphData(Object.values(annualData)[Math.round(range-1)]);
                                  setProductTypeBarGraphData(Object.values(annualProductTypeData)[Math.round(range-1)]);
                                  setVisitorsBarGraphData(Object.values(annualVisitorsData)[Math.round(range-1)]);

                                }

                                if(timeDiff > 2505600000 && timeDiff <= 31560000000){
                                  let range = timeDiff/2505600000;

                                  setLineGraphData(Object.values(monthData)[Math.round(range-1)]);
                                  setProductTypeBarGraphData(Object.values(monthProductTypeData)[Math.round(range-1)]);
                                  setVisitorsBarGraphData(Object.values(monthVisitorsData)[Math.round(range-1)]);

                                }
                                
                              }
                            }}  id="start-date" placeholder="1 Jan 1960" className="peer rounded-md placeholder:text-xs focus:outline-secondary-400 p-2 text-xs focus:ring-1  border border-gray-400 focus:border-secondary-400 w-28"
                              />
                              <label className="text-xs font-bold absolute peer-focus:text-secondary-400 top-[-6px] left-[10px] bg-white px-[5px] text-gray-400 ">Start date</label>
                          </div>
                          <div className="text-lg text-gray-400">-</div>
                          <div className="relative">
                              <input 
                                onChange={(e) => {
                                
                                  //extracting date data from input
                                  let extractedStartDate, extractedStartYear, extractedEndDate, extractedEndYear;
                                  let extractedEndMonth = 0;
                                  let extractedStartMonth = 0;
                                  
                                  extractedStartDate = parseInt(start.split(' ')[0]);
                                  for(let i = 0; i < months.length; i++){
                                      if(months[i] === start.split(' ')[1]){
                                          extractedStartMonth = i; 
                                      }
                                  }
                                  extractedStartYear = parseInt(start.split(' ')[2]);
                                  
                                  extractedEndDate = parseInt(e.target.value.split(' ')[0]);
                                  for(let i = 0; i < months.length; i++){
                                      if(months[i] === e.target.value.split(' ')[1]){
                                          extractedEndMonth = i; 
                                      }
                                  }
                                  extractedEndYear = parseInt(e.target.value.split(' ')[2]);
                                  //binding value to change event
                                  setEndDate(e.target.value);
      
                                  const currentTime = new Date(extractedEndYear, extractedEndMonth+1, extractedEndDate).getTime() - new Date(currentYear, currentMonth+1, currentDate).getTime();
      
                                  //validation check to prevent user from inputing an end date greater than current time
                                  if(currentTime > 0){
                                      setIsAdminSettingsOpen(false);
                                      alert('end date cannot be greater than current date');
                                      return;
                                  }
                                  const timeDiff = new Date(extractedEndYear,extractedEndMonth+1,extractedEndDate).getTime() - new Date(extractedStartYear, extractedStartMonth+1, extractedStartDate).getTime();
                                  
                                  //validation check
                                  if(timeDiff  < 86400000){
                                      setIsAdminSettingsOpen(false);
                                      alert('start date has to be at least 1 day apart from end date');
                                      return;
                                  }else{
                                    setStart(`${extractedStartYear}-${('0' + (extractedStartMonth + 1)).slice(-2)}-${('0' + extractedStartDate).slice(-2)}`);
                                    setEnd(`${extractedEndYear}-${('0' + (extractedEndMonth + 1)).slice(-2)}-${('0' + extractedEndDate).slice(-2)}`);

                                    //clearing factory range and period
                                    setRange(null);
                                    setPeriod(null);

                                    if(timeDiff <= 2505600000){
                                      let range = timeDiff/86400000;
    
                                      setLineGraphData(Object.values(dailyData)[Math.round(range-1)]);
                                      setProductTypeBarGraphData(Object.values(dailyProductTypeData)[Math.round(range-1)]);
                                      setVisitorsBarGraphData(Object.values(dailyVisitorsData)[Math.round(range-1)]);
                                      
                                    }
    
                                    if(timeDiff > 31560000000 && timeDiff <= 378720000000){
                                      let range = timeDiff/31560000000;
    
                                      setLineGraphData(Object.values(annualData)[Math.round(range-1)]);
                                      setProductTypeBarGraphData(Object.values(annualProductTypeData)[Math.round(range-1)]);
                                      setVisitorsBarGraphData(Object.values(annualVisitorsData)[Math.round(range-1)]);
    
                                    }
    
                                    if(timeDiff > 2505600000 && timeDiff <= 31560000000){
                                      let range = timeDiff/2505600000;
    
                                      setLineGraphData(Object.values(monthData)[Math.round(range-1)]);
                                      setProductTypeBarGraphData(Object.values(monthProductTypeData)[Math.round(range-1)]);
                                      setVisitorsBarGraphData(Object.values(monthVisitorsData)[Math.round(range-1)]);
    
                                    }
                                  }
                                }} 
                                type="text" 
                                id="end-date" 
                                value={endDate}
                                placeholder="1 Jan 1960" 
                                className="peer rounded-md placeholder:text-xs focus:outline-secondary-400 p-2 text-xs focus:ring-1  border border-gray-400 focus:border-secondary-400 w-28"
                                />
                              <label className="text-xs font-bold absolute peer-focus:text-secondary-400 top-[-6px] left-[10px] bg-white px-[5px] text-gray-400">End date</label>
                          </div>
                      </div>
                      
                      <div className="flex flex-row items-start gap-x-2 w-full h-[300px]">
                          <ul className="h-full w-[25%] border border-b-0 border-l-0 border-t-0 border-gray-400 md:flex hidden flex-col gap-y-2 pr-[2px] pl-[1px] py-2">
                              <li onClick={(e) => {
                                if(!e.currentTarget.classList.contains('active-range')){
                                  e.currentTarget.classList.add('active-range');
                                  document.querySelector('#last-12m')?.classList.remove('active-range');
                                  document.querySelector('#last-7d')?.classList.remove('active-range');
                                  document.querySelector('#last-60d')?.classList.remove('active-range');
                                  document.querySelector('#last-28d')?.classList.remove('active-range');
                                  document.querySelector('#last-5m')?.classList.remove('active-range');
                                }
                                
                                setRange(1);
                                setPeriod('daily');
                                
                                setLineGraphData(Object.values(dailyData)[0]);
                                setProductTypeBarGraphData(Object.values(dailyProductTypeData)[0]);
                                setVisitorsBarGraphData(Object.values(dailyVisitorsData)[0]);

                                
                                let startDate = `${(currentDate - 1) <= 0 && currentMonth === 0 ? currentYear - 1 : currentYear}-${(currentDate - 1) <= 0 ? ('0' + (currentMonth === 0 ? 12 : currentMonth)).slice(-2) : ('0' + (currentMonth + 1)).slice(-2)}-${(currentDate - 1) <= 0 ? ('0' + (new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 11 : currentMonth, 0).getDate() - Math.abs(currentDate - 1))).slice(-2) : ('0' + (currentDate - 1)).slice(-2)}`;
                                setStart(startDate);
                                setEnd(`${currentYear}-${('0' + (currentMonth + 1)).slice(-2)}-${('0' + currentDate).slice(-2)}`);
                                setStartDate(`${startDate.split('-')[2].slice(-2).split('')[0] === '0' ? startDate.split('-')[2].slice(-1) : startDate.split('-')[2].slice(-2)} ${months[parseInt(startDate.split('-')[1].slice(-1))-1]} ${startDate.split('-')[0]}`);

                              
                              }} className={`${range === 1 && period === 'daily' ? 'active-range': ''} text-xs text-gray-600 hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`} id="yesterday">yesterday</li>
                              <li onClick={(e) => {
                                if(!e.currentTarget.classList.contains('active-range')){
                                  e.currentTarget.classList.add('active-range');
                                  document.querySelector('#yesterday')?.classList.remove('active-range');
                                  document.querySelector('#last-12m')?.classList.remove('active-range');
                                  document.querySelector('#last-60d')?.classList.remove('active-range');
                                  document.querySelector('#last-28d')?.classList.remove('active-range');
                                  document.querySelector('#last-5m')?.classList.remove('active-range');
                                }
                                
                                setRange(7);
                                setPeriod('daily');
                                
                                setLineGraphData(Object.values(dailyData)[6]);
                                setProductTypeBarGraphData(Object.values(dailyProductTypeData)[6]);
                                setVisitorsBarGraphData(Object.values(dailyVisitorsData)[6]);

                                let startDate = `${(currentDate - 7) <= 0 && currentMonth === 0 ? currentYear - 1 : currentYear}-${(currentDate - 7) <= 0 ? ('0' + (currentMonth === 0 ? 12 : currentMonth)).slice(-2) : ('0' + (currentMonth + 1)).slice(-2)}-${(currentDate - 7) <= 0 ? ('0' + (new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 12 : currentMonth, 0).getDate() - Math.abs(currentDate - 7))).slice(-2) : ('0' + (currentDate - 7)).slice(-2)}`;
                                setStart(startDate);
                                setEnd(`${currentYear}-${('0' + (currentMonth + 1)).slice(-2)}-${('0' + currentDate).slice(-2)}`);
                                setStartDate(`${startDate.split('-')[2].slice(-2).split('')[0] === '0' ? startDate.split('-')[2].slice(-1) : startDate.split('-')[2].slice(-2)} ${months[parseInt(startDate.split('-')[1].slice(-1))-1]} ${startDate.split('-')[0]}`);
                              }}
                              className={`${range === 7 && period === 'daily' ? 'active-range': ''} text-xs text-gray-600 hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`} id="last-7d">last 7 days</li>
                              <li onClick={(e) => {
                                if(!e.currentTarget.classList.contains('active-range')){
                                  e.currentTarget.classList.add('active-range');
                                  document.querySelector('#yesterday')?.classList.remove('active-range');
                                  document.querySelector('#last-7d')?.classList.remove('active-range');
                                  document.querySelector('#last-60d')?.classList.remove('active-range');
                                  document.querySelector('#last-12m')?.classList.remove('active-range');
                                  document.querySelector('#last-5m')?.classList.remove('active-range');
                                }
                                
                                setRange(28);
                                setPeriod('daily');
                                
                                setLineGraphData(Object.values(dailyData)[27]);
                                setProductTypeBarGraphData(Object.values(dailyProductTypeData)[27]);
                                setVisitorsBarGraphData(Object.values(dailyVisitorsData)[27]);

                                let startDate = `${(currentDate - 28) <= 0 && currentMonth === 0 ? currentYear - 1 : currentYear}-${(currentDate - 28) <= 0 ? ('0' + (currentMonth === 0 ? 12 : currentMonth)).slice(-2) : ('0' + (currentMonth + 1)).slice(-2)}-${(currentDate - 28) <= 0 ? ('0' + (new Date(currentMonth === 0 ? currentYear-1 : currentYear, currentMonth === 0 ? 12 : currentMonth, 0).getDate() - Math.abs(currentDate - 28))).slice(-2) : ('0' + (currentDate - 28)).slice(-2)}`;
                                setStart(startDate);
                                setEnd(`${currentYear}-${('0' + (currentMonth + 1)).slice(-2)}-${('0' + currentDate).slice(-2)}`);
                                setStartDate(`${startDate.split('-')[2].slice(-2).split('')[0] === '0' ? startDate.split('-')[2].slice(-1) : startDate.split('-')[2].slice(-2)} ${months[parseInt(startDate.split('-')[1].slice(-1))-1]} ${startDate.split('-')[0]}`);
                              
                              }} className={`${range === 28 && period === 'daily' ? 'active-range': ''} text-xs text-gray-600 hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`} id="last-28d">last 28 days</li>
                              <li onClick={(e) => {
                                if(!e.currentTarget.classList.contains('active-range')){
                                  e.currentTarget.classList.add('active-range');
                                  document.querySelector('#yesterday')?.classList.remove('active-range');
                                  document.querySelector('#last-7d')?.classList.remove('active-range');
                                  document.querySelector('#last-12m')?.classList.remove('active-range');
                                  document.querySelector('#last-28d')?.classList.remove('active-range');
                                  document.querySelector('#last-5m')?.classList.remove('active-range');
                                }
                                
                                setRange(2);
                                setPeriod('monthly');
                                
                                setLineGraphData(Object.values(monthData)[1]);
                                setProductTypeBarGraphData(Object.values(monthProductTypeData)[1]);
                                setVisitorsBarGraphData(Object.values(monthVisitorsData)[1]);

                                let startDate = `${(currentDate - 29) <= 0 && currentMonth === 0 ? currentYear - 1 : currentYear}-${(currentDate - 29) <= 0 ? ('0' + (currentMonth === 0 ? 11 : currentMonth-1)).slice(-2) : ('0' + (currentMonth -1)).slice(-2)}-${(currentDate - 29) <= 0 ? ('0' + (new Date(currentDate -29 <= 0 && currentMonth === 0 ? currentYear-1 : currentYear, currentDate -29 <= 0 && currentMonth === 0 ? 11 : currentMonth-1, 0).getDate() - Math.abs(currentDate - 29))).slice(-2) : ('0' + (currentDate - 29)).slice(-2)}`;
                                setStart(startDate);
                                setEnd(`${currentYear}-${('0' + (currentMonth + 1)).slice(-2)}-${('0' + currentDate).slice(-2)}`);
                                setStartDate(`${startDate.split('-')[2].slice(-2).split('')[0] === '0' ? startDate.split('-')[2].slice(-1) : startDate.split('-')[2].slice(-2)} ${months[parseInt(startDate.split('-')[1].slice(-1))-1]} ${startDate.split('-')[0]}`);
                              
                              }}
                              className={`${range === 2 && period === 'monthly' ? 'active-range': ''} text-xs text-gray-600 hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`} id="last-60d">last 60 days</li>
                              <li onClick={(e) => {
                                if(!e.currentTarget.classList.contains('active-range')){
                                  e.currentTarget.classList.add('active-range');
                                  document.querySelector('#yesterday')?.classList.remove('active-range');
                                  document.querySelector('#last-7d')?.classList.remove('active-range');
                                  document.querySelector('#last-60d')?.classList.remove('active-range');
                                  document.querySelector('#last-28d')?.classList.remove('active-range');
                                  document.querySelector('#last-12m')?.classList.remove('active-range');
                                }
                                
                                setRange(5);
                                setPeriod('monthly');
                                
                                setLineGraphData(Object.values(monthData)[4]);
                                setProductTypeBarGraphData(Object.values(monthProductTypeData)[4]);
                                setVisitorsBarGraphData(Object.values(monthVisitorsData)[4]);

                                let startDate = `${(currentDate - 29) <= 0 && currentMonth === 0 ? currentYear - 1 : currentYear}-${(currentDate - 29) <= 0 ? ('0' + (currentMonth === 0 ? 8 : currentMonth-4)).slice(-2) : ('0' + (currentMonth -3)).slice(-2)}-${(currentDate - 29) <= 0 ? ('0' + (new Date(currentDate -29 <= 0 && currentMonth === 0 ? currentYear-1 : currentYear, currentDate -29 <= 0 && currentMonth === 0 ? 8 : currentMonth-4, 0).getDate() - Math.abs(currentDate - 29))).slice(-2) : ('0' + (currentDate - 29)).slice(-2)}`;
                                setStart(startDate);
                                setEnd(`${currentYear}-${('0' + (currentMonth + 1)).slice(-2)}-${('0' + currentDate).slice(-2)}`);
                                setStartDate(`${startDate.split('-')[2].slice(-2).split('')[0] === '0' ? startDate.split('-')[2].slice(-1) : startDate.split('-')[2].slice(-2)} ${months[parseInt(startDate.split('-')[1].slice(-1))-1]} ${startDate.split('-')[0]}`);
                              }}
                              className={`${range === 5 && period === 'monthly' ? 'active-range': ''} text-gray-600 text-xs hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`} id="last-5m">last 5 months</li>
                              <li onClick={(e) => {
                                if(!e.currentTarget.classList.contains('active-range')){
                                  e.currentTarget.classList.add('active-range');
                                  document.querySelector('#yesterday')?.classList.remove('active-range');
                                  document.querySelector('#last-7d')?.classList.remove('active-range');
                                  document.querySelector('#last-60d')?.classList.remove('active-range');
                                  document.querySelector('#last-28d')?.classList.remove('active-range');
                                  document.querySelector('#last-5m')?.classList.remove('active-range');
                                }

                                setRange(13);
                                setPeriod('monthly');
                                
                                setLineGraphData(Object.values(monthData)[12]);
                                setProductTypeBarGraphData(Object.values(monthProductTypeData)[12]);
                                setVisitorsBarGraphData(Object.values(monthVisitorsData)[12]);

                                let startDate = `${currentYear - 1}-${(currentDate - 29) <= 0 ? ('0' + (currentMonth === 0 ? 1 : currentMonth)).slice(-2) : ('0' + (currentMonth+1)).slice(-2)}-${(currentDate - 29) <= 0 ? ('0' + (new Date(currentYear-1, currentMonth === 0 ? 1 : currentMonth, 0).getDate() - Math.abs(currentDate - 29))).slice(-2) : ('0' + (currentDate - 29)).slice(-2)}`;
                                setStart(startDate);
                                setEnd(`${currentYear}-${('0' + (currentMonth + 1)).slice(-2)}-${('0' + currentDate).slice(-2)}`);
                                setStartDate(`${startDate.split('-')[2].slice(-2).split('')[0] === '0' ? startDate.split('-')[2].slice(-1) : startDate.split('-')[2].slice(-2)} ${months[parseInt(startDate.split('-')[1].slice(-1))-1]} ${startDate.split('-')[0]}`);
                              }}
                              className={`${range === 13 && period === 'monthly' ? 'active-range': ''} text-xs text-gray-600 hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`} id="last-12m">last 12 months</li>
                          </ul>
                          <div className="w-full md:w-[75%] h-full overflow-hidden">
                            <FullCalendar
                              plugins={[multiMonthPlugin, interactionPlugin]}
                              key={start + end}
                              initialView='multiMonthYear'
                              headerToolbar={{
                                left: "title",
                                center: "",
                                right: "prev,today",
                              }}
                              // validRange={{
                              //   end: new Date(new Date().getTime() + Math.abs(new Date().getTimezoneOffset()) * 60 * 1000).toISOString()
                              // }}
                              slotMaxTime={new Date(new Date().getTime() + Math.abs(new Date().getTimezoneOffset()) * 60 * 1000).toISOString().substring(11, 19)}
                              events={[
                                {
                                    start: start,
                                    end: end,
                                    allDay: true,
                                }
                              ]}
                              editable={true}
                              eventResize={({event}) => {
                                if (!event.start || !event.end) {
                                  console.error("Invalid event dates:", event);
                                  return;
                                }

                                let timeDiff = event.end.getTime() - event.start.getTime();

                                //clearing factory range and period
                                setRange(null);
                                setPeriod(null);

                                if(timeDiff <= 2505600000){
                                  let range = timeDiff/86400000;

                                  setLineGraphData(Object.values(dailyData)[Math.round(range-1)]);
                                  setProductTypeBarGraphData(Object.values(dailyProductTypeData)[Math.round(range-1)]);
                                  setVisitorsBarGraphData(Object.values(dailyVisitorsData)[Math.round(range-1)]);
                                  setPaymentTypeData(Object.values(dailyPaymentTypeData)[Math.round(range-1)]);
                                  setVisitorsBarGraphData(Object.values(dailyVisitorsData)[Math.round(range-1)]);
                                  
                                }

                                if(timeDiff > 31560000000 && timeDiff <= 378720000000){
                                  let range = timeDiff/31560000000;

                                  setLineGraphData(Object.values(annualData)[Math.round(range-1)]);
                                  setProductTypeBarGraphData(Object.values(annualProductTypeData)[Math.round(range-1)]);
                                  setVisitorsBarGraphData(Object.values(annualVisitorsData)[Math.round(range-1)]);

                                }

                                if(timeDiff > 2505600000 && timeDiff <= 31560000000){
                                  let range = timeDiff/2505600000;

                                  setLineGraphData(Object.values(monthData)[Math.round(range-1)]);
                                  setProductTypeBarGraphData(Object.values(monthProductTypeData)[Math.round(range-1)]);
                                  setVisitorsBarGraphData(Object.values(monthVisitorsData)[Math.round(range-1)]);

                                }
                                
                              }}
                              eventBackgroundColor="#0EA5E9"
                            />
                          </div>
                      </div>

                      
                  </section>
                </AdminSettingsModal>
              }
            </section>
          )
        }
        {
          pathName === 'email' && (
            <section className="flex flex-col w-full gap-y-5 lg:px-8 text-secondary-400 font-sans">
              <header className="text-lg pb-4 border font-medium border-l-0 border-t-0 border-r-0 border-secondary-400/20">
                  Inbox
              </header>
              <p className="text-[.8rem]">This page contains messages from clients regarding appointments and other enquiries</p>
              <section className='md:w-[45%] w-full flex flex-row flex-wrap justify-start items-center text-sm gap-x-2 gap-y-2 mt-6'>
                <div className="md:inline-block md:w-[21%] hidden relative">
                    <button 
                    onClick={(e) => {
                        let downAngle = e.currentTarget.querySelector("i.actions-angle-down");
                        let actionsDropdown = document.getElementById("actions-dropdown");
                        let dropdowns = document.querySelectorAll('[id$=-dropdown]:not(#actions-dropdown)');
                        let calendarAngleDown = document.querySelector('i.calendar-angle-down');
                        let filterAngleDown = document.querySelector('i.filter-angle-down');
                        let activeActionAngleDown = document.querySelector("i.active-action-angle-down");

                        if(calendarAngleDown?.classList.contains('ad-rotate')){
                          calendarAngleDown?.classList.remove("ad-rotate");
                          calendarAngleDown?.classList.add("ad-rotate-anticlock");
                        }
                        if(filterAngleDown?.classList.contains('ad-rotate')){
                          filterAngleDown?.classList.remove("ad-rotate");
                          filterAngleDown?.classList.add("ad-rotate-anticlock");
                        }
                        if(activeActionAngleDown?.classList.contains('ad-rotate')){
                          activeActionAngleDown?.classList.remove("ad-rotate");
                          activeActionAngleDown?.classList.add("ad-rotate-anticlock");
                        }

                        dropdowns.forEach(dropdown => {
                          if(dropdown.classList.contains('show')){
                            dropdown.classList.add('hide');
                            dropdown.classList.remove('show');
                          }
                        });

                        if(downAngle && actionsDropdown){
                            if(!downAngle.classList.contains("ad-rotate")){
                                downAngle.classList.add("ad-rotate");
                                downAngle.classList.remove("ad-rotate-anticlock");
                                actionsDropdown.classList.remove('hide');
                                actionsDropdown.classList.add('show');
                            }else{
                                downAngle.classList.remove("ad-rotate");
                                downAngle.classList.add("ad-rotate-anticlock");
                                actionsDropdown.classList.add('hide');
                                actionsDropdown.classList.remove('show');
                            }
                        }
                    }}
                    id='actions-button'
                    className="w-full rounded-sm font-medium px-2 py-[6px] gap-x-2 cursor-pointer bg-transparent border border-secondary-400 inline-flex flex-row items-end">
                        <i className="fa-solid fa-circle-play"></i>
                        <span className="text-xs">Action</span>
                        <i className="fa-solid fa-angle-down text-xs actions-angle-down"></i>
                    </button>
                    <ul id='actions-dropdown' className="absolute z-30 w-[130%] text-xs text-gray-600 font-medium bg-white rounded-md shadow-sm shadow-white flex-col hide">
                        {[
                          'Mark As Read',
                          'Mark As Unread',
                          'Save Messages',
                          'Remove'
                        ].map((action: string, i: number) => (
                            <div>
                                <li
                                key={action}
                                // onClick={(e) => handleSelect(rating, e)}
                                className="cursor-pointer flex flex-row items-center justify-between p-2"
                              >
                                  {action}
                              </li>
                              {action !== 'Remove' && <hr className="border-secondary-400"/>}
                            </div>
                        ))}
                    </ul>
                </div>
                <div className="md:inline-block md:w-[12%] hidden relative">
                    <button 
                      onClick={(e) => {
                        let downAngle = e.currentTarget.querySelector("i.calendar-angle-down");
                        let calendarDropdown = document.getElementById("calendar-dropdown");
                        let actionsAngleDown = document.querySelector('i.actions-angle-down');
                        let dropdowns = document.querySelectorAll('[id$=-dropdown]:not(#calendar-dropdown)');
                        let filterAngleDown = document.querySelector('i.filter-angle-down');
                        let activeActionAngleDown = document.querySelector("i.active-action-angle-down");

                        if(actionsAngleDown?.classList.contains('ad-rotate')){
                          actionsAngleDown?.classList.remove("ad-rotate");
                          actionsAngleDown?.classList.add("ad-rotate-anticlock");
                        }
                        if(filterAngleDown?.classList.contains('ad-rotate')){
                          filterAngleDown?.classList.remove("ad-rotate");
                          filterAngleDown?.classList.add("ad-rotate-anticlock");
                        }
                        if(activeActionAngleDown?.classList.contains('ad-rotate')){
                          activeActionAngleDown?.classList.remove("ad-rotate");
                          activeActionAngleDown?.classList.add("ad-rotate-anticlock");
                        }
                        
                        dropdowns.forEach(dropdown => {
                          if(dropdown.classList.contains('show')){
                            dropdown.classList.add('hide');
                            dropdown.classList.remove('show');
                          }
                        });

                        if(downAngle && calendarDropdown){
                            if(!downAngle.classList.contains("ad-rotate")){
                                downAngle.classList.add("ad-rotate");
                                downAngle.classList.remove("ad-rotate-anticlock");
                                calendarDropdown.classList.remove('hide');
                                calendarDropdown.classList.add('show');
                            }else{
                                downAngle.classList.remove("ad-rotate");
                                downAngle.classList.add("ad-rotate-anticlock");
                                calendarDropdown.classList.add('hide');
                                calendarDropdown.classList.remove('show');
                            }
                        }
                      }}
                    className="w-full rounded-sm font-medium px-2 py-[7px] gap-x-2 cursor-pointer bg-transparent border border-secondary-400 inline-flex flex-row items-end">
                        <i className="fa-regular fa-calendar-days"></i>
                        <i className="fa-solid fa-angle-down text-xs calendar-angle-down"></i>
                    </button>
                    <div className="hide absolute z-30 flex-col gap-y-3 pt-5 pb-4 px-3 h-fit w-[1000%] bg-white rounded-md" id='calendar-dropdown'>
                      <div className="flex flex-row gap-x-1 mb-2">
                          <div className="relative">
                              <input 
                              type="text"
                              value={startDate}
                              onChange={(e) => {
                                //extracting date data from input
                                let extractedDate, extractedYear;
                                let extractedMonth = 0;
                                
                                extractedDate = parseInt(e.target.value.split(' ')[0]);
                                for(let i = 0; i < months.length; i++){
                                  if(months[i] === e.target.value.split(' ')[1]){
                                    extractedMonth = i; 
                                  }
                                }
                                extractedYear = parseInt(e.target.value.split(' ')[2]);
                                //binding value to change event
                                setStartDate(e.target.value);
    
                              const timeDiff = new Date(currentYear, currentMonth+1, currentDate).getTime() - new Date(extractedYear, extractedMonth!+1, extractedDate).getTime();
                              //validation check
                              if(timeDiff  < 86400000){
                                alert('start date has to be at least 1 day apart from end date');
                                return;
                              }else{
                                setStart(`${extractedYear}-${('0' + (extractedMonth! + 1)).slice(-2)}-${('0' + extractedDate).slice(-2)}`);
    
                                //clearing factory range and period
                                setRange(null);
                                setPeriod(null);
    
                                if(timeDiff <= 2505600000){
                                  let range = timeDiff/86400000;
    
                                  setLineGraphData(Object.values(dailyData)[Math.round(range-1)]);
                                  setProductTypeBarGraphData(Object.values(dailyProductTypeData)[Math.round(range-1)]);
                                  setVisitorsBarGraphData(Object.values(dailyVisitorsData)[Math.round(range-1)]);
                                  
                                }
    
                                if(timeDiff > 31560000000 && timeDiff <= 378720000000){
                                  let range = timeDiff/31560000000;
    
                                  setLineGraphData(Object.values(annualData)[Math.round(range-1)]);
                                  setProductTypeBarGraphData(Object.values(annualProductTypeData)[Math.round(range-1)]);
                                  setVisitorsBarGraphData(Object.values(annualVisitorsData)[Math.round(range-1)]);
    
                                }
    
                                if(timeDiff > 2505600000 && timeDiff <= 31560000000){
                                  let range = timeDiff/2505600000;
    
                                  setLineGraphData(Object.values(monthData)[Math.round(range-1)]);
                                  setProductTypeBarGraphData(Object.values(monthProductTypeData)[Math.round(range-1)]);
                                  setVisitorsBarGraphData(Object.values(monthVisitorsData)[Math.round(range-1)]);
    
                                }
                                
                              }
                            }}  id="start-date" placeholder="1 Jan 1960" className="peer rounded-md placeholder:text-xs focus:outline-secondary-400 p-2 text-xs focus:ring-1  border border-gray-400 focus:border-secondary-400 w-28"
                              />
                              <label className="text-xs font-bold absolute peer-focus:text-secondary-400 top-[-6px] left-[10px] bg-white px-[5px] text-gray-400 ">Start date</label>
                          </div>
                          <div className="text-lg text-gray-400">-</div>
                          <div className="relative">
                              <input 
                                onChange={(e) => {
                                
                                  //extracting date data from input
                                  let extractedStartDate, extractedStartYear, extractedEndDate, extractedEndYear;
                                  let extractedEndMonth = 0;
                                  let extractedStartMonth = 0;
                                  
                                  extractedStartDate = parseInt(start.split(' ')[0]);
                                  for(let i = 0; i < months.length; i++){
                                      if(months[i] === start.split(' ')[1]){
                                          extractedStartMonth = i; 
                                      }
                                  }
                                  extractedStartYear = parseInt(start.split(' ')[2]);
                                  
                                  extractedEndDate = parseInt(e.target.value.split(' ')[0]);
                                  for(let i = 0; i < months.length; i++){
                                      if(months[i] === e.target.value.split(' ')[1]){
                                          extractedEndMonth = i; 
                                      }
                                  }
                                  extractedEndYear = parseInt(e.target.value.split(' ')[2]);
                                  //binding value to change event
                                  setEndDate(e.target.value);
      
                                  const currentTime = new Date(extractedEndYear, extractedEndMonth+1, extractedEndDate).getTime() - new Date(currentYear, currentMonth+1, currentDate).getTime();
      
                                  //validation check to prevent user from inputing an end date greater than current time
                                  if(currentTime > 0){
                                      setIsAdminSettingsOpen(false);
                                      alert('end date cannot be greater than current date');
                                      return;
                                  }
                                  const timeDiff = new Date(extractedEndYear,extractedEndMonth+1,extractedEndDate).getTime() - new Date(extractedStartYear, extractedStartMonth+1, extractedStartDate).getTime();
                                  
                                  //validation check
                                  if(timeDiff  < 86400000){
                                      setIsAdminSettingsOpen(false);
                                      alert('start date has to be at least 1 day apart from end date');
                                      return;
                                  }else{
                                    setStart(`${extractedStartYear}-${('0' + (extractedStartMonth + 1)).slice(-2)}-${('0' + extractedStartDate).slice(-2)}`);
                                    setEnd(`${extractedEndYear}-${('0' + (extractedEndMonth + 1)).slice(-2)}-${('0' + extractedEndDate).slice(-2)}`);
    
                                    //clearing factory range and period
                                    setRange(null);
                                    setPeriod(null);
    
                                    if(timeDiff <= 2505600000){
                                      let range = timeDiff/86400000;
    
                                      setLineGraphData(Object.values(dailyData)[Math.round(range-1)]);
                                      setProductTypeBarGraphData(Object.values(dailyProductTypeData)[Math.round(range-1)]);
                                      setVisitorsBarGraphData(Object.values(dailyVisitorsData)[Math.round(range-1)]);
                                      
                                    }
    
                                    if(timeDiff > 31560000000 && timeDiff <= 378720000000){
                                      let range = timeDiff/31560000000;
    
                                      setLineGraphData(Object.values(annualData)[Math.round(range-1)]);
                                      setProductTypeBarGraphData(Object.values(annualProductTypeData)[Math.round(range-1)]);
                                      setVisitorsBarGraphData(Object.values(annualVisitorsData)[Math.round(range-1)]);
    
                                    }
    
                                    if(timeDiff > 2505600000 && timeDiff <= 31560000000){
                                      let range = timeDiff/2505600000;
    
                                      setLineGraphData(Object.values(monthData)[Math.round(range-1)]);
                                      setProductTypeBarGraphData(Object.values(monthProductTypeData)[Math.round(range-1)]);
                                      setVisitorsBarGraphData(Object.values(monthVisitorsData)[Math.round(range-1)]);
    
                                    }
                                  }
                                }} 
                                type="text" 
                                id="end-date" 
                                value={endDate}
                                placeholder="1 Jan 1960" 
                                className="peer rounded-md placeholder:text-xs focus:outline-secondary-400 p-2 text-xs focus:ring-1  border border-gray-400 focus:border-secondary-400 w-28"
                                />
                              <label className="text-xs font-bold absolute peer-focus:text-secondary-400 top-[-6px] left-[10px] bg-white px-[5px] text-gray-400">End date</label>
                          </div>
                      </div>
                      <div className="flex flex-row gap-x-4 w-full">
                          <Calendar onChange={setStartValue} value={startValue} maxDate={new Date(new Date().getTime() + Math.abs(new Date().getTimezoneOffset()) * 60 * 1000 - 3600000)}/>
                          <Calendar onChange={setEndValue} value={endValue} maxDate={new Date(new Date().getTime() + Math.abs(new Date().getTimezoneOffset()) * 60 * 1000)}/>
                      </div>
                    </div>
                </div>
                <div className="md:inline-block md:w-[21%] hidden relative">
                    <button 
                    onClick={(e) => {
                        let downAngle = e.currentTarget.querySelector("i.filter-angle-down");
                        let filterDropdown = document.getElementById("filter-dropdown");
                        let dropdowns = document.querySelectorAll('[id$=-dropdown]:not(#filter-dropdown)');
                        let calendarAngleDown = document.querySelector('i.calendar-angle-down');
                        let actionsAngleDown = document.querySelector('i.actions-angle-down');
                        let activeActionAngleDown = document.querySelector("i.active-action-angle-down");

                        if(calendarAngleDown?.classList.contains('ad-rotate')){
                          calendarAngleDown?.classList.remove("ad-rotate");
                          calendarAngleDown?.classList.add("ad-rotate-anticlock");
                        }
                        if(actionsAngleDown?.classList.contains('ad-rotate')){
                          actionsAngleDown?.classList.remove("ad-rotate");
                          actionsAngleDown?.classList.add("ad-rotate-anticlock");
                        }
                        if(activeActionAngleDown?.classList.contains('ad-rotate')){
                          activeActionAngleDown?.classList.remove("ad-rotate");
                          activeActionAngleDown?.classList.add("ad-rotate-anticlock");
                        }

                        dropdowns.forEach(dropdown => {
                          if(dropdown.classList.contains('show')){
                            dropdown.classList.add('hide');
                            dropdown.classList.remove('show');
                          }
                        });

                        if(downAngle && filterDropdown){
                            if(!downAngle.classList.contains("ad-rotate")){
                                downAngle.classList.add("ad-rotate");
                                downAngle.classList.remove("ad-rotate-anticlock");
                                filterDropdown.classList.remove('hide');
                                filterDropdown.classList.add('show');
                            }else{
                                downAngle.classList.remove("ad-rotate");
                                downAngle.classList.add("ad-rotate-anticlock");
                                filterDropdown.classList.add('hide');
                                filterDropdown.classList.remove('show');
                            }
                        }
                    }}
                    id='filter-button'
                    className="w-full rounded-sm font-medium px-2 py-[6px] gap-x-2 cursor-pointer bg-transparent border border-secondary-400 inline-flex flex-row items-end">
                        <i className="fa-solid fa-filter"></i>
                        <span className="text-xs">Filter</span>
                        <i className="fa-solid fa-angle-down text-xs filter-angle-down"></i>
                    </button>
                    <ul id='filter-dropdown' className="absolute z-30 w-[130%] text-gray-600 font-medium text-xs bg-white pt-3 pb-2 rounded-md shadow-sm shadow-white flex-col hide">
                        <li className="mb-2 pl-4 text-gray-700">State</li>
                        {[
                          'Read',
                          'Unread',
                          'Saved',
                        ].map((action: string, i: number) => (
                              <li
                                key={action}
                                // onClick={(e) => handleSelect(rating, e)}
                                className="cursor-pointer flex flex-row items-center gap-x-1 px-4 py-1"
                              >
                                  <input
                                    type="checkbox"
                                    id={action}
                                    className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-300 rounded-sm relative
                                      cursor-pointer outline-none checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                                      checked:after:border-accent checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                                      checked:after:rotate-45"
                                  /><span>{action}</span>
                              </li>
                        ))}
                        <hr className="bg-gray-400 mt-3 h-[2px]" />
                        <div className="inline-flex flex-row gap-x-4 justify-center mt-3 px-2">
                            <button className="bg-accent text-white px-3 py-2 rounded-md hover:ring-1 hover:ring-accent">Apply</button>
                            <button className="text-accent bg-transparent hover:text-red-700">Clear</button>
                        </div>
                    </ul>
                </div>
                <div className="inline-flex md:w-[40%] w-[60%] relative flex-row items-center border border-secondary-400 rounded-sm px-2">
                    <input className="bg-transparent py-[5px] focus:outline-none w-full placeholder:text-secondary-400" placeholder="search"/>
                    <i className="fa-solid fa-magnifying-glass text-secondary-400 cursor-pointer"></i>
                </div>
              </section>
              <hr className="border-secondary-400/30 border -mt-2" />
              <div className="w-full inline-flex flex-row -my-1 text-sm">
                <div className="md:w-[60%] w-[70%] inline-flex flex-row gap-x-2 items-center">
                  <input
                    type="checkbox"
                    id='all'
                    onChange={(e) => {
                      let msgs = document.querySelectorAll('[id=single]') as NodeListOf<HTMLInputElement>;

                      msgs.forEach(msg => {
                        if(e.currentTarget.checked){
                          msg.checked = true;
                        }else{
                          msg.checked = false;
                        }
                      });
                    }}
                    className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-300 rounded-sm relative
                    cursor-pointer outline-none checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                    checked:after:border-accent checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                    checked:after:rotate-45"
                  /><span className="font-medium">Subject</span>
                </div>
                <div className="md:w-[40%] w-[30%] font-medium">Date</div>
              </div>
              <hr className="border-secondary-400/30 border" />
              {(appts.length === 0 ? [{
                createdAt: new Date(),
                author: {
                  fullName: 'Josh',
                  email: 'test@test.com'
                }
              }] : appts).map((appt: any, i: number) => {

                return (
                  <div key={i} className="w-full inline-flex flex-row -my-1 text-sm">
                    <div className="md:w-[60%] w-[70%] inline-flex flex-row gap-x-2 items-center relative">
                      <input
                        type="checkbox"
                        id='single'
                        className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-300 rounded-sm relative
                        cursor-pointer outline-none checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                        checked:after:border-accent checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                        checked:after:rotate-45"
                      />
                      <span className="font-light">
                        <i className="fa-regular fa-envelope-open text-accent/30"></i>&nbsp;&nbsp;Appointment by {appt.author.fullName}
                      </span>
                      <div className="md:hidden inline-block w-[35%] absolute left-0 top-10">
                          <div className="w-[156%] rounded-sm font-medium bg-transparent inline-flex flex-row items-center">
                              <button className="text-xs border-secondary-400 border px-2 py-[6px] hover:ring-1 hover:ring-secondary-400" onClick={() => {
                                let activeActionAngleDown = document.querySelector("i.active-action-dropdown-for-sm-screen");
                                let calendarAngleDown = document.querySelector('i.calendar-angle-down');
                                let actionsAngleDown = document.querySelector('i.actions-angle-down');
                                let filterAngleDown = document.querySelector('i.filter-angle-down');
                                let dropdowns = document.querySelectorAll('[id$=-dropdown]:not(#active-action-dropdown-for-sm-screen)');

                                if(calendarAngleDown?.classList.contains('ad-rotate')){
                                  calendarAngleDown?.classList.remove("ad-rotate");
                                  calendarAngleDown?.classList.add("ad-rotate-anticlock");
                                }
                                if(filterAngleDown?.classList.contains('ad-rotate')){
                                  filterAngleDown?.classList.remove("ad-rotate");
                                  filterAngleDown?.classList.add("ad-rotate-anticlock");
                                }
                                if(actionsAngleDown?.classList.contains('ad-rotate')){
                                  actionsAngleDown?.classList.remove("ad-rotate");
                                  actionsAngleDown?.classList.add("ad-rotate-anticlock");
                                }
                                if(activeActionAngleDown?.classList.contains('ad-rotate')){
                                  activeActionAngleDown?.classList.remove("ad-rotate");
                                  activeActionAngleDown?.classList.add("ad-rotate-anticlock");
                                }

                                dropdowns.forEach(dropdown => {
                                  if(dropdown.classList.contains('show')){
                                    dropdown.classList.add('hide');
                                    dropdown.classList.remove('show');
                                  }
                                });
                                
                                setIsAdminSettingsOpen(true);
                                setIsReading(true);
                                setIsReplying(false);
                                }}>READ MESSAGE</button>
                              <div className="px-2 py-[4px] border border-secondary-400"
                                  onClick={(e) => {
                                    let downAngle = e.currentTarget.querySelector("i.active-action-angle-down-for-sm-screen");
                                    let activeActionDropdown = document.getElementById("active-action-dropdown-for-sm-screen");
                                    let calendarAngleDown = document.querySelector('i.calendar-angle-down');
                                    let actionsAngleDown = document.querySelector('i.actions-angle-down');
                                    let filterAngleDown = document.querySelector('i.filter-angle-down');
                                    let dropdowns = document.querySelectorAll('[id$=-dropdown]:not(#active-action-dropdown-for-sm-screen)');

                                    if(calendarAngleDown?.classList.contains('ad-rotate')){
                                      calendarAngleDown?.classList.remove("ad-rotate");
                                      calendarAngleDown?.classList.add("ad-rotate-anticlock");
                                    }
                                    if(filterAngleDown?.classList.contains('ad-rotate')){
                                      filterAngleDown?.classList.remove("ad-rotate");
                                      filterAngleDown?.classList.add("ad-rotate-anticlock");
                                    }
                                    if(actionsAngleDown?.classList.contains('ad-rotate')){
                                      actionsAngleDown?.classList.remove("ad-rotate");
                                      actionsAngleDown?.classList.add("ad-rotate-anticlock");
                                    }

                                    dropdowns.forEach(dropdown => {
                                      if(dropdown.classList.contains('show')){
                                        dropdown.classList.add('hide');
                                        dropdown.classList.remove('show');
                                      }
                                    });

                                    if(downAngle && activeActionDropdown){
                                        if(!downAngle.classList.contains("ad-rotate")){
                                            downAngle.classList.add("ad-rotate");
                                            downAngle.classList.remove("ad-rotate-anticlock");
                                            activeActionDropdown.classList.remove('hide');
                                            activeActionDropdown.classList.add('show');
                                        }else{
                                            downAngle.classList.remove("ad-rotate");
                                            downAngle.classList.add("ad-rotate-anticlock");
                                            activeActionDropdown.classList.add('hide');
                                            activeActionDropdown.classList.remove('show');
                                        }
                                    }
                                }}
                              >
                                <i className="fa-solid fa-angle-down text-xs active-action-angle-down-for-sm-screen cursor-pointer"></i>
                              </div>
                          </div>
                          <ul id='active-action-dropdown-for-sm-screen' className="absolute z-30 w-[150%] text-xs bg-white rounded-md text-gray-600 font-medium shadow-sm shadow-white flex-col hide">
                              {[
                                'Reply',
                                'Unread',
                                'Save Message',
                                'Remove'
                              ].map((action: string, i: number) => (
                                  <div>
                                      <li
                                      key={action}
                                      onClick={(e) => {
                                        let activeActionAngleDown = document.querySelector("i.active-action-angle-down-for-sm-screen");
                                        let calendarAngleDown = document.querySelector('i.calendar-angle-down');
                                        let actionsAngleDown = document.querySelector('i.actions-angle-down');
                                        let filterAngleDown = document.querySelector('i.filter-angle-down');
                                        let dropdowns = document.querySelectorAll('[id$=-dropdown]:not(#active-action-dropdown-for-sm-screen)');

                                        if(calendarAngleDown?.classList.contains('ad-rotate')){
                                          calendarAngleDown?.classList.remove("ad-rotate");
                                          calendarAngleDown?.classList.add("ad-rotate-anticlock");
                                        }
                                        if(filterAngleDown?.classList.contains('ad-rotate')){
                                          filterAngleDown?.classList.remove("ad-rotate");
                                          filterAngleDown?.classList.add("ad-rotate-anticlock");
                                        }
                                        if(actionsAngleDown?.classList.contains('ad-rotate')){
                                          actionsAngleDown?.classList.remove("ad-rotate");
                                          actionsAngleDown?.classList.add("ad-rotate-anticlock");
                                        }
                                        if(activeActionAngleDown?.classList.contains('ad-rotate')){
                                          activeActionAngleDown?.classList.remove("ad-rotate");
                                          activeActionAngleDown?.classList.add("ad-rotate-anticlock");
                                        }

                                        dropdowns.forEach(dropdown => {
                                          if(dropdown.classList.contains('show')){
                                            dropdown.classList.add('hide');
                                            dropdown.classList.remove('show');
                                          }
                                        });

                                        switch (action) {
                                          case 'Reply':
                                            setIsAdminSettingsOpen(true);
                                            setIsReplying(true);
                                            setIsReading(false);
                                            break;
                                        
                                          default:
                                            break;
                                        }
                                      }}
                                      className="cursor-pointer flex flex-row items-center justify-between p-2"
                                    >
                                        {action}
                                    </li>
                                    {action !== 'Remove' && <hr className="border-secondary-400"/>}
                                  </div>
                              ))}
                          </ul>
                      </div>
                    </div>
                    <div className="md:w-[40%] w-[30%] font-light relative"><span>{`${months[new Date(appt.createdAt).getMonth()]} ${new Date(appt.createdAt).getDate()}, ${new Date(appt.createdAt).getFullYear()}`}</span>
                      <div className="md:inline-block w-[21%] absolute md:right-[10%] hidden">
                          <div className="w-[156%] rounded-sm font-medium bg-transparent inline-flex flex-row items-center">
                              <button className="text-xs border-secondary-400 border px-2 py-[6px] hover:ring-1 hover:ring-secondary-400" onClick={() => {
                                
                                let activeActionAngleDown = document.querySelector("i.active-action-angle-down");
                                let calendarAngleDown = document.querySelector('i.calendar-angle-down');
                                let actionsAngleDown = document.querySelector('i.actions-angle-down');
                                let filterAngleDown = document.querySelector('i.filter-angle-down');
                                let dropdowns = document.querySelectorAll('[id$=-dropdown]');

                                if(calendarAngleDown?.classList.contains('ad-rotate')){
                                  calendarAngleDown?.classList.remove("ad-rotate");
                                  calendarAngleDown?.classList.add("ad-rotate-anticlock");
                                }
                                if(filterAngleDown?.classList.contains('ad-rotate')){
                                  filterAngleDown?.classList.remove("ad-rotate");
                                  filterAngleDown?.classList.add("ad-rotate-anticlock");
                                }
                                if(actionsAngleDown?.classList.contains('ad-rotate')){
                                  actionsAngleDown?.classList.remove("ad-rotate");
                                  actionsAngleDown?.classList.add("ad-rotate-anticlock");
                                }
                                if(activeActionAngleDown?.classList.contains('ad-rotate')){
                                  activeActionAngleDown?.classList.remove("ad-rotate");
                                  activeActionAngleDown?.classList.add("ad-rotate-anticlock");
                                }

                                dropdowns.forEach(dropdown => {
                                  if(dropdown.classList.contains('show')){
                                    dropdown.classList.add('hide');
                                    dropdown.classList.remove('show');
                                  }
                                });

                                setIsAdminSettingsOpen(true);
                                setIsReading(true);
                                setIsReplying(false);
                              }}>READ MESSAGE</button>
                              <div className="px-2 py-[4px] border border-secondary-400" 
                                  onClick={(e) => {
                                  let downAngle = e.currentTarget.querySelector("i.active-action-angle-down");
                                  let activeActionDropdown = document.getElementById("active-action-dropdown");
                                  let calendarAngleDown = document.querySelector('i.calendar-angle-down');
                                  let actionsAngleDown = document.querySelector('i.actions-angle-down');
                                  let filterAngleDown = document.querySelector('i.filter-angle-down');
                                  let dropdowns = document.querySelectorAll('[id$=-dropdown]:not(#active-action-dropdown)');

                                  if(calendarAngleDown?.classList.contains('ad-rotate')){
                                    calendarAngleDown?.classList.remove("ad-rotate");
                                    calendarAngleDown?.classList.add("ad-rotate-anticlock");
                                  }
                                  if(filterAngleDown?.classList.contains('ad-rotate')){
                                    filterAngleDown?.classList.remove("ad-rotate");
                                    filterAngleDown?.classList.add("ad-rotate-anticlock");
                                  }
                                  if(actionsAngleDown?.classList.contains('ad-rotate')){
                                    actionsAngleDown?.classList.remove("ad-rotate");
                                    actionsAngleDown?.classList.add("ad-rotate-anticlock");
                                  }

                                  dropdowns.forEach(dropdown => {
                                    if(dropdown.classList.contains('show')){
                                      dropdown.classList.add('hide');
                                      dropdown.classList.remove('show');
                                    }
                                  });

                                  if(downAngle && activeActionDropdown){
                                      if(!downAngle.classList.contains("ad-rotate")){
                                          downAngle.classList.add("ad-rotate");
                                          downAngle.classList.remove("ad-rotate-anticlock");
                                          activeActionDropdown.classList.remove('hide');
                                          activeActionDropdown.classList.add('show');
                                      }else{
                                          downAngle.classList.remove("ad-rotate");
                                          downAngle.classList.add("ad-rotate-anticlock");
                                          activeActionDropdown.classList.add('hide');
                                          activeActionDropdown.classList.remove('show');
                                      }
                                  }
                                  }}>
                                <i className="fa-solid fa-angle-down text-xs active-action-angle-down cursor-pointer"></i>
                              </div>
                          </div>
                          <ul id='active-action-dropdown' className="hide flex-col absolute z-30 w-[150%] text-xs bg-white rounded-md text-gray-600 font-medium shadow-sm shadow-white">
                              {[
                                'Reply',
                                'Unread',
                                'Save Message',
                                'Remove'
                              ].map((action: string, i: number) => (
                                  <div>
                                      <li
                                      key={action}
                                      onClick={async (e) => {
                                        let activeActionAngleDown = document.querySelector("i.active-action-angle-down");
                                        let calendarAngleDown = document.querySelector('i.calendar-angle-down');
                                        let actionsAngleDown = document.querySelector('i.actions-angle-down');
                                        let filterAngleDown = document.querySelector('i.filter-angle-down');
                                        let dropdowns = document.querySelectorAll('[id$=-dropdown]');

                                        if(calendarAngleDown?.classList.contains('ad-rotate')){
                                          calendarAngleDown?.classList.remove("ad-rotate");
                                          calendarAngleDown?.classList.add("ad-rotate-anticlock");
                                        }
                                        if(filterAngleDown?.classList.contains('ad-rotate')){
                                          filterAngleDown?.classList.remove("ad-rotate");
                                          filterAngleDown?.classList.add("ad-rotate-anticlock");
                                        }
                                        if(actionsAngleDown?.classList.contains('ad-rotate')){
                                          actionsAngleDown?.classList.remove("ad-rotate");
                                          actionsAngleDown?.classList.add("ad-rotate-anticlock");
                                        }
                                        if(activeActionAngleDown?.classList.contains('ad-rotate')){
                                          activeActionAngleDown?.classList.remove("ad-rotate");
                                          activeActionAngleDown?.classList.add("ad-rotate-anticlock");
                                        }

                                        dropdowns.forEach(dropdown => {
                                          if(dropdown.classList.contains('show')){
                                            dropdown.classList.add('hide');
                                            dropdown.classList.remove('show');
                                          }
                                        });

                                        switch (action) {
                                          case 'Reply':
                                            setIsAdminSettingsOpen(true);
                                            setIsReplying(true);
                                            setIsReading(false);
                                            break;
                                        
                                          default:
                                            break;
                                        }
                                      }}
                                      className="cursor-pointer flex flex-row items-center justify-between p-2"
                                    >
                                        {action}
                                    </li>
                                    {action !== 'Remove' && <hr className="border-secondary-400"/>}
                                  </div>
                              ))}
                          </ul>
                      </div>
                    </div>
                    {
                      isAdminSettingsOpen && pathName === "email" && <AdminSettingsModal onClose={hideAdminSettingsModalHandler} left='20rem' width='40rem' classes='h-fit bg-white'>
                        <section className="flex flex-col items-start gap-x-2 w-full h-full px-5 pb-6 pt-16 font-sans gap-y-9">
                              <header className="text-sm flex flex-row justify-between items-center w-full">
                                <h2>From:&nbsp;<span className="font-normal">{isReading ? appt.author.email : 'hello@oyinye.com'}</span></h2>
                                <h2>{`${months[new Date(isReading ? appt.createdAt: new Date()).getMonth()]} ${new Date(isReading ? appt.createdAt: new Date()).getDate()}, ${new Date(isReading ? appt.createdAt: new Date()).getFullYear()}, ${new Date(new Date(isReading ? appt.createdAt: new Date()).getTime() + Math.abs(new Date().getTimezoneOffset()) * 60 * 1000).toISOString().substring(11, 16)}${new Date(isReading ? appt.createdAt: new Date()).getHours() >= 11 ? 'PM' : 'AM'}`}</h2>
                              </header>
                              <form onSubmit={async (e) => {
                                e.preventDefault();
                                let adminContent = document.getElementById('admin-letter') as HTMLTextAreaElement;
                                if(adminContent && adminContent.value.length === 0){
                                  return;
                                }
                                try {
                                  setLoader(true);
                                  await axios.post('/api/admin/send-reminder', {
                                    email: appt.author.email,
                                    message: adminContent?.value,
                                    contact: appt.author.fullName,
                                    date: `${months[new Date(isReading ? appt.createdAt: new Date()).getMonth()]} ${new Date(isReading ? appt.createdAt: new Date()).getDate()}. ${new Date(isReading ? appt.createdAt: new Date()).getFullYear()}`
                                  });
                                } catch (error: any) {
                                  toast.error(error.message);
                                }finally{
                                  setLoader(false);
                                  toast.success('reminder sent', {
                                    position: 'top-center'
                                  });
                                }
                              }} className="flex flex-col items-start gap-y-4 text-gray-600 font-sans w-full">
                                <p className="leading-tight tracking-wider text-sm font-medium cursive">
                                  Hi {isReading ? 'Oyinye Couture team' : appt.author.fullName},
                                </p>
                                
                                  {isReading 
                                  ? <p className="text-base leading-relaxed text-wrap tracking-wider text-gray-500 w-full">
                                      {appt.content ?? 'I am writing to inform you.'} 
                                    </p>
                                  : <textarea cols={50} rows={5} placeholder="Compose letter here..." id='admin-letter' className="focus:outline-none w-full border border-gray-300 rounded-md p-2 text-base leading-relaxed text-wrap tracking-wider text-gray-500">
                                    
                                    </textarea>}
                                {isReading 
                                  ? <p className="leading-tight tracking-wider text-sm font-medium cursive">Best Regards,<br/>{appt.author.fullName}<br/>Phone:&nbsp;<Link href={`tel:${appt.author.phoneNo ?? '070333748920'}`}>{appt.author.phoneNo ?? '070333748920'}</Link><br/>Standard Size: {appt.author.size ?? 8}</p>
                                  : <p className="leading-tight tracking-wider text-sm font-medium cursive">Best Regards,<br />Oyinye Couture Team</p>}
                                
                                  {isReplying && <div className="w-full flex justify-end flex-row">
                                    <button type='submit' className="px-7 py-2 text-sm bg-accent text-white hover:ring-1 hover:ring-accent rounded-md">{loader ? 'Sending..' : 'Send'}</button>
                                  </div>}
                              </form>
                              {appt.author.styles && isReading && appt.author.styles.length > 0 && appt.author.styles.map(((data: any) => <div className="flex flex-row flex-wrap gap-x-3 gap-y-2 w-full">
                                <div className="flex flex-col items-center gap-y-1">
                                  <div className="w-24 h-24 rounded-md" style={{backgroundImage: `url(${data.image})`}}></div>
                                  <p className="font-sans text-xs">{data.fileName}</p>
                                </div>
                              </div>
                            ))}
                            
                        </section>
                      </AdminSettingsModal>
                    }
                  </div>
                );
              })}
              {appts.length > 0 && <AdminPagination {...appointmentsData} />}

            </section>
          )
          
        }
      </main>
  );
}
