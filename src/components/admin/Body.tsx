"use client";

import {
  colorsReducer,
  driveList,
  generateBase64FromImage,
  handleBackImageupload,
  handleFrontImagesupload,
  handlePriceChange,
  handleStockChange,
  handleSubmit,
  sizes,
} from "@/helpers/getHelpers";
import "./Body.css";
import React from "react";
import toast from "react-hot-toast";
import { SizeData } from "@/interfaces";
import mongoose from "mongoose";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import useWindowWidth from "../helpers/getWindowWidth";
import { AdminSettingsModal, MobileModal } from "../ui/Modal";
import useGlobal from "@/store/useGlobal";
import AdminPagination from "../layout/AdminPagination";

export default function Body({
  pathName,
  extractedOrders,
  data
}: any) {
  const colorList = [
    "bg-yellow-950",
    "bg-red-800",
    "bg-blue-800",
    "bg-green-800",
    "bg-purple-800",
    "bg-slate-400",
  ];


  const [dressColorsState, dispatchAction] = React.useReducer(
    colorsReducer,
    []
  );
  const frontUploadRef = React.useRef<HTMLInputElement>(null);
  const backUploadRef = React.useRef<HTMLInputElement>(null);
  const [isChecked, setIsChecked] = React.useState(false);
  const [orders, setOrders] = React.useState<any[]>(extractedOrders);
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
  const [price, setPrice] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  let width = useWindowWidth();
  const { isMobileModalOpen, setIsMobileModalOpen } = useGlobal();

  let file: File | null;
  let timerId: NodeJS.Timeout | null = null;
  let updatedOrders: any[] = [];

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
    let adminOptions = document.querySelector(
      "#admin-settings-modal"
    ) as HTMLElement;
    if (isAdminSettingsOpen && adminOptions) {
      adminOptions.classList.add("slide-down");
      adminOptions.classList.remove("slide-up");
    } else if (!isAdminSettingsOpen && adminOptions) {
      adminOptions.classList.remove("slide-down");
      adminOptions.classList.add("slide-up");
    }
  }, [isAdminSettingsOpen]);

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
    let adminOptions = document.querySelector(
      "#admin-settings-modal"
    ) as HTMLElement;
    if (adminOptions) {
      adminOptions.classList.remove("slide-down");
      adminOptions.classList.add("slide-up");
      timerId = setTimeout(() => {
        setIsAdminSettingsOpen(false);
      }, 300);
    } else {
      setIsAdminSettingsOpen(false);
    }
  };

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
  //extracting order details
  for (let order of orders) {
    updatedOrders.push({
      totalItems: order.items
        .map((item: any) => item.quantity)
        .reduce((prev: number, current: number) => prev + current, 0),
      orderItemVariantIds: order.items.map((item: any) => item.variantId),
      status: order.status,
      paymentType: order.paymentType,
      paymentStatus: order.paymentStatus,
      id: order.id,
    });
  }

  return (
    <main
      className="bg-primary-950 min-h-screen pt-4 md:pl-64 pl-7 lg:pr-3 pr-7 w-full py-12"
      id="admin-content"
      role="main"
    >
      {pathName === "file-manager" && (
        <section className="flex flex-row gap-x-6 pl-5 pr-1 w-full h-full">
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
                        frontUploadRef,
                        file
                      )
                    }
                    ref={frontUploadRef}
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
                        dispatchAction,
                        currentBgColors,
                        setImgData,
                        setBackFilename,
                        backUploadRef,
                        file
                      )
                    }
                    ref={backUploadRef}
                  />
                </div>
              </section>
              <div className="text-secondary flex flex-col gap-y-7 text-sm w-full">
                <input
                  placeholder="Title"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary bg-transparent placeholder:text-secondary"
                />
                <textarea
                  className="w-full bg-transparent focus:outline-none border border-t-0 border-l-0 border-r-0 border-secondary"
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
                  className="w-full focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary bg-transparent placeholder:text-secondary"
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
                  className="w-full focus:outline-none border border-t-0 border-l-0 border-r-0 border-secondary bg-transparent placeholder:text-secondary"
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
                      className="w-[60%] focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary bg-transparent placeholder:text-secondary"
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
            <section className="px-3 flex flex-col gap-y-5 text-[1rem] py-2 mt-3">
              <header className="text-white font-sans font-medium">
                My Drive
              </header>
              <ul className="flex flex-col gap-y-5">
                {driveList.map((item: string, i: number) => (
                  <div
                    key={i}
                    className="cursor-pointer transition-all duration-200 pl-0 hover:pl-2 ease-out  inline-flex flex-row gap-x-3 items-center text-secondary"
                  >
                    <i className="fa-regular fa-folder"></i>
                    <h3>{item}</h3>
                  </div>
                ))}
              </ul>
            </section>
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
                        <span className="text-secondary">{datum.size}kb</span>
                      </footer>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
            <section className="flex flex-col items-start lg:gap-y-10 gap-y-5 font-sans w-full">
              <h1 className="font-medium lg:text-lg text-white text-[1rem]">
                Folders
              </h1>
              <div className="flex flex-row gap-x-4 text-secondary lg:pl-5 items-center">
                <i className="fa-regular fa-folder-open lg:text-4xl text-3xl"></i>
                <header className="flex flex-col items-start lg:text-[1rem] text-sm">
                  <h3>Photos</h3>
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
            </section>
            <section className="flex flex-col items-start lg:gap-y-4 gap-y-2 font-sans w-full">
              <h1 className="font-medium lg:text-lg text-white text-[1rem] text-left">
                Files
              </h1>
              <div className="text-secondary lg:text-[1rem] text-sm">
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
                          <span className="text-secondary">{datum.size}kb</span>
                        </footer>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </section>
        </section>
      )}
      {pathName === "order-management" && (
        <section className="flex flex-col items-center justify-center w-full gap-y-16">
          <div className={`flex flex-col items-start ${orders.length > 0 ? 'gap-y-7': 'gap-y-24'} w-full`}>
            <header className="inline-flex flex-row gap-x-3 text-secondary text-sm items-center">
              <span>Show</span>
              <input
                autoFocus
                defaultValue={10}
                onBlur={async (e) => {
                  try {
                    
                    const res = await axios.get(`/api/orders/${e.target.value}?page=1`);
                    setOrders(res.data.orders);
                  } catch (error) {
                    
                  }
                }}
                className="text-white text-center w-10 h-8 px-2 py-1 bg-transparent border border-secondary/20 rounded-[5px] focus:outline-none "
              />
              <span>entries</span>
            </header>
            {orders.length === 0
            ? <section className="flex flex-row justify-center items-end text-white w-full">
                <h1 className="font-sans text-xl">No Order has been created!</h1>
            </section>
            :
            <>
              <table className="w-full border-spacing-y-2 text-secondary text-xs md:table hidden">
                <thead>
                  <tr>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[20%]">
                      <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                        <span>ORDER ID</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[25%] py-1">
                      <div className="inline-flex flex-row justify-between gap-x-14 items-center w-full pl-9 pr-1 py-2">
                        <span>VAR ID(s)</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary/20"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[10%] py-1">
                      <div className="inline-flex flex-row justify-end gap-x-4 items-center w-full px-1 py-2">
                        <span>TOTAL</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary/20"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[15%] py-1">
                      <div className="inline-flex flex-row justify-end gap-x-11 items-center w-full px-1 py-2">
                        <span>STATE</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary/20"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[12.5%] py-1">
                      <div className="inline-flex flex-row justify-end gap-x-9 items-center w-full px-1 py-2">
                        <span>TYPE</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary/20"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[12.5%] py-1">
                      <div className="inline-flex flex-row justify-end gap-x-7 items-center w-full px-1 py-2">
                        <span>STATUS</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary/20"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[5%] py-1"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {updatedOrders.map((order: any, i: number) => (
                    <tr key={i}>
                      <td className="bg-transparent text-start border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[20%] py-5 pl-9 pr-1 font-medium">
                        {order.id}
                      </td>
                      <td className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[25%] py-5 font-medium pl-9 pr-1">
                        {order.orderItemVariantIds.map((variantId: string, i: number) => (
                          <span key={i}>{variantId},&nbsp;</span>
                        ))}
                      </td>
                      <td className="bg-transparent text-center border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[10%] py-5 font-medium">
                        {order.totalItems}
                      </td>
                      <td className="bg-transparent text-center border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[15%] py-5 font-medium">
                        {order.status}
                      </td>
                      <td className="bg-transparent text-center border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[12.5%] py-5 font-medium">
                        {order.paymentType.length === 0 ? "---" : order.paymentType}
                      </td>
                      <td className="bg-transparent text-center border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[12.5%] py-5 font-medium">
                        {order.paymentStatus.length === 0
                          ? "---"
                          : order.paymentStatus}
                      </td>
                      <td className="bg-transparent relative border-secondary/20 border-t-0 border-l-0 border-r-0 border w-[5%]">
                        <i
                          className="fa-solid fa-ellipsis-vertical text-lg cursor-pointer"
                          onClick={(e) => {
                            let item = e.currentTarget;
                            let menu = item.parentNode?.querySelector(
                              "#options-menu"
                            ) as HTMLDivElement;
                            menu.classList.toggle("hidden");
                          }}
                          id="options-ellipsis-icon"
                        ></i>
                        <span className="sr-only">Open admin options</span>
                        <div
                          id="options-menu"
                          className="space-y-4 hidden absolute right-8 z-10 mt-2 w-40 origin-top-right rounded-md text-secondary bg-primary-800 shadow-lg ring-1 ring-black ring-opacity-5 py-4 px-3 focus:outline-none"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="options-ellipsis-icon"
                        >
                          <h3
                            onClick={() => setIsAdminSettingsOpen(true)}
                            className="hover:text-accent text-xs cursor-pointer"
                          >
                            Update Payment status
                          </h3>
                          {order.paymentType === "streetzwyze" && (
                            <h3
                              onClick={() => setIsAdminSettingsOpen(true)}
                              className="hover:text-accent text-xs cursor-pointer"
                            >
                              Send Payment request
                            </h3>
                          )}
                          {order.status === "add to cart" && (
                            <button onClick={async (e) => {
                              try {
                                setIsLoading(true);
                                await axios.post('/api/orders/send/reminder');
                              } catch (error: any) {
                                toast.error(error.message);
                              }finally{
                                setIsLoading(false);
                              }
                            }} className="hover:text-accent text-xs">
                              {isLoading ? 'Processing..' : 'Send Reminder'}
                            </button>
                          )}
                        </div>
                      </td>
                      {isAdminSettingsOpen && (
                        <AdminSettingsModal onClose={hideAdminSettingsModalHandler}>
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
                                    <option hidden>choose status</option>
                                    <option value="pending">pending</option>
                                    <option value="paid">paid</option>
                                    <option value="failed">failed</option>
                                  </select>
                                </div>
                                <button onClick={async (e) => {
                                  let selectedStatus = document.querySelector('#payment-status') as HTMLSelectElement;
                                  try {
                                    setIsLoading(true);
                                    await axios.post('/api/orders/update/payment-status', {
                                      paymentStatus: selectedStatus.value
                                    });
                                  } catch (error: any) {
                                    toast.error(error.message);
                                  }finally{
                                    setIsLoading(false);
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
                                      try {
                                        setIsLoading(true);
                                        await axios.post('/api/orders/send/payment-request', {
                                          content: content.value.trim()
                                        });
                                      } catch (error: any) {
                                        toast.error(error.message);
                                      }finally{
                                        setIsLoading(false);
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
              <table className="w-full border-spacing-y-2 text-secondary text-xs md:hidden table">
                <thead>
                  <tr>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                      <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                        <span>ORDER ID</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer ">
                          <i className="fa-solid fa-angle-up text-secondary"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {updatedOrders.map((order: any, i: number) => (
                    <tr key={i}>
                      <td className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium flex flex-row justify-between items-center">
                        <span>{order.id}</span>
                        <div className="inline-block pr-1">
                          <i
                            className="fa-solid fa-ellipsis-vertical text-lg cursor-pointer"
                            onClick={(e) => setIsMobileModalOpen(true)}
                          ></i>
                          <span className="sr-only">Open admin options</span>
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full border-spacing-y-2 text-secondary text-xs md:hidden table">
                <thead>
                  <tr>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                      <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                        <span>VAR ID(s)</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary/20"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {updatedOrders.map((order: any, i: number) => (
                    <tr key={i}>
                      <td className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-5 font-medium pl-9 pr-1">
                        {order.orderItemVariantIds.map((variantId: string, i: number) => (
                          <span key={i}>{variantId},&nbsp;</span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full border-spacing-y-2 text-secondary text-xs md:hidden table">
                <thead>
                  <tr>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                      <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                        <span>TOTAL</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary/20"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {updatedOrders.map((order: any, i: number) => (
                    <tr key={i}>
                      <td className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium">
                        {order.totalItems}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full border-spacing-y-2 text-secondary text-xs md:hidden table">
                <thead>
                  <tr>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                      <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                        <span>STATE</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary/20"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {updatedOrders.map((order: any, i: number) => (
                    <tr key={i}>
                      <td className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium">
                        {order.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full border-spacing-y-2 text-secondary text-xs md:hidden table">
                <thead>
                  <tr>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                      <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                        <span>TYPE</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary/20"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {updatedOrders.map((order: any, i: number) => (
                    <tr key={i}>
                      <td className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium">
                        {order.paymentType.length === 0 ? "---" : order.paymentType}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full border-spacing-y-2 text-secondary text-xs md:hidden table">
                <thead>
                  <tr>
                    <th className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                      <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                        <span>STATUS</span>
                        <div className="flex flex-col text-[1rem] cursor-pointer">
                          <i className="fa-solid fa-angle-up text-secondary/20"></i>
                          <i className="fa-solid fa-angle-down text-secondary/20 -mt-2"></i>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {updatedOrders.map((order: any, i: number) => (
                    <tr key={i}>
                      <td className="bg-transparent border-secondary/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium">
                        {order.paymentStatus.length === 0
                          ? "---"
                          : order.paymentStatus}
                      </td>
                      {isMobileModalOpen && pathName === "order-management" &&  (
                        <MobileModal onClose={hideMobileModalHandler} classes='bg-white'>
                          <div
                            className="flex flex-col items-start gap-y-11 text-gray-600 pt-4 px-6"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="options-ellipsis-icon"
                          >
                            <header className="text-xl font-bold">
                              Options&nbsp;&nbsp;
                              <i className="text-lg fa-solid fa-wrench text-gray-400"></i>
                            </header>
                            <section className="flex flex-col items-start gap-y-5">
                              <h3
                                onClick={() => {
                                  setIsMobileModalOpen(false);
                                  setIsAdminSettingsOpen(true);
                                }}
                                className="hover:text-accent text-sm cursor-pointer"
                              >
                                Update Payment status
                              </h3>
                              {order.paymentType === "" && (
                                <h3
                                  onClick={() => {
                                    setIsMobileModalOpen(false);
                                    setIsAdminSettingsOpen(true);
                                  }}
                                  className="hover:text-accent text-sm cursor-pointer"
                                >
                                  Send Payment request
                                </h3>
                              )}
                              {order.status === "add to cart" && (
                                <button onClick={async (e) => {
                                  try {
                                    setIsLoading(true);
                                    await axios.post('/api/orders/send/reminder');
                                  } catch (error: any) {
                                    toast.error(error.message);
                                  }finally{
                                    setIsLoading(false);
                                  }
                                }}
                                className="hover:text-accent text-sm">
                                  {isLoading ? 'Processing..' : 'Send Reminder'}
                                </button>
                              )}
                            </section>
                          </div>
                          
                        </MobileModal>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>}
          </div>
          {orders.length > 0 && <AdminPagination {...data} />}
        </section>
      )}
      {isMobileModalOpen && pathName === "file-manager" && (
        <MobileModal
          onClose={hideMobileModalHandler}
          classes={"bg-primary-950 px-7"}
        >
          <section className="lg:flex flex-col gap-y-6 items-start w-full">
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
                        frontUploadRef,
                        file
                      )
                    }
                    ref={frontUploadRef}
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
                        dispatchAction,
                        currentBgColors,
                        setImgData,
                        setBackFilename,
                        backUploadRef,
                        file
                      )
                    }
                    ref={backUploadRef}
                  />
                </div>
              </section>
              <div className="text-secondary flex flex-col gap-y-7 text-sm w-full">
                <input
                  placeholder="Title"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary bg-transparent placeholder:text-secondary"
                />
                <textarea
                  className="w-full bg-transparent focus:outline-none border border-t-0 border-l-0 border-r-0 border-secondary"
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
                  className="w-full focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary bg-transparent placeholder:text-secondary"
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
                  className="w-full focus:outline-none border border-t-0 border-l-0 border-r-0 border-secondary bg-transparent placeholder:text-secondary"
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
                      className="w-[60%] focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary bg-transparent placeholder:text-secondary"
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
        </MobileModal>
      )}
    </main>
  );
}
