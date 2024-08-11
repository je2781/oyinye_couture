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
import { MobileModal } from "../ui/Modal";

export default function Body({ pathName, isModalOpen, setIsModalOpen }: any) {
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
  const [frontFilename, setFrontFilename] = React.useState<string | null>(null);
  const [backFilename, setBackFilename] = React.useState<string | null>(null);
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

  let file: File | null;

  let currentBgColors: string[] = [];

  dressColorsState.forEach((colorObj) => {
    currentBgColors.push(Object.keys(colorObj)[0]);
  });

  
function handleSelectedSize(
  e: React.MouseEvent,
  index: number
) {
  let selectedSize = document.querySelector(`#size${index}`) as HTMLSpanElement;
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
          (datum) => datum.color === currentBgColors[currentBgColors.length - 1]
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


function handleSelectedColor(
  e: React.MouseEvent,
  index: number
) {
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
    let mobileNav = document.querySelector("#mobile-nav") as HTMLElement;
    if (isModalOpen && mobileNav) {
      mobileNav.classList.add("forward");
      mobileNav.classList.remove("backward");
    }
  }, [isModalOpen]);

  const hideModalHandler = () => {
    let mobileNav = document.querySelector("#mobile-nav") as HTMLElement;
    if (mobileNav) {
      mobileNav.classList.remove("forward");
      mobileNav.classList.add("backward");
      setTimeout(() => {
        setIsModalOpen(false);
      }, 300);
    } else {
      setIsModalOpen(false);
    }
  };

  return (
    <main
      className="bg-primary-950 min-h-screen pt-4 lg:pl-64 pl-3 pr-3 w-full"
      id="content"
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
                        onClick={(e) =>
                          handleSelectedColor(
                            e,
                            i
                          )
                        }
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
                          onClick={(e) =>
                            handleSelectedSize(
                              e,
                              i
                            )
                          }
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
                spaceBetween={width < 1024 ? 100 :200}
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
              <h1 className="font-medium lg:text-lg text-white text-[1rem]">Folders</h1>
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
              <h1 className="font-medium lg:text-lg text-white text-[1rem] text-left">Files</h1>
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
      {isModalOpen && (
          <MobileModal onClose={hideModalHandler} classes={'bg-primary-950 px-7'}>
            <section className="lg:flex flex-col gap-y-6 items-start w-full">
              <form
                onSubmit={(e) => handleSubmit(e, title, desc, type, dressColorsState, currentBgColors, sizeData, setIsLoading)}
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
                      onChange={(e) => handleFrontImagesupload(e, dispatchAction, currentBgColors, setImgData, setFrontFilename, frontUploadRef, file)}
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
                      onChange={(e) => handleBackImageupload(dispatchAction, currentBgColors, setImgData, setBackFilename, backUploadRef, file)}
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
                    onChange={(e) => handlePriceChange(e, currentBgColors, sizeData, setSizeData, setPrice)}
                    value={price}
                    className="w-full focus:outline-none border border-t-0 border-l-0 border-r-0 border-secondary bg-transparent placeholder:text-secondary"
                  />
                  <section className="flex flex-row w-full items-end h-8">
                    <div className="flex flex-row gap-x-2 w-[40%]">
                      <h5>In Stock</h5>
                      <input
                        onChange={(e) => handleStockChange(e, currentBgColors, sizeData, setIsChecked)}
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
