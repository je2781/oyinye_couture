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
  handleSubmit,
  lineGraphOptions,
  months,
  sizes,
  verticalBarGraphOptions,
  productTypeGraphOptions,
  deliveryOptionsGraphOptions,
  generateBase64FromMedia,
  extractProductDetail,
  handleProductEdit,
} from "../../helpers/getHelpers";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import React from "react";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import {
  Base64ImagesObj,
  CartItemObj,
  EmailType,
  Locale,
  SizeData,
  Value,
} from "../../interfaces";
import axios from "axios";
import Calendar from "react-calendar";
import FullCalendar from "@fullcalendar/react";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import "react-calendar/dist/Calendar.css";
import useWindowWidth from "../helpers/getWindowWidth";
import { AdminSettingsModal } from "../layout/Modal";
import crypto from "crypto";
import AdminPagination from "../layout/pagination/AdminPagination";
import {
  Chart,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Legend,
  ArcElement,
} from "chart.js";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import Link from "next/link";
import ProductComponent from "../product/Product";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Body.css";
import { useSearchParams } from "next/navigation";

Chart.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Legend,
  ArcElement
);

export default function Body({
  pathName,
  extractedOrders,
  data,
  enquiriesData,
  searchData,
  csrf,
}: any) {
  const colorList = [
    "#422006",
    "#0000FF",
    "#FFC0CB",
    "#065F46",
    "#BC8F8F",
    "#94A3B8",
  ];
  const productListingColorList = [
    "bg-[#422006]",
    "bg-[#0000FF]",
    "bg-[#FFC0CB]",
    "bg-[#065F46]",
    "bg-[#BC8F8F]",
    "bg-[#94A3B8]",
  ];

  let listOfFeatures = "";
  const path = usePathname();
  const searchParams = useSearchParams();
  let productObj = React.useRef<CartItemObj>({});
  let frontBase64ImagesObj = React.useRef<Base64ImagesObj>({});
  let backBase64ImagesObj = React.useRef<Base64ImagesObj>({});
  let selectedProduct = React.useRef<any>(null);

  const [
    dailyData,
    dailyProductTypeData,
    dailyVisitorsData,
    dailyDeliveryOptionsData,
    dailyPaymentTypeData,
    monthData,
    monthProductTypeData,
    monthVisitorsData,
    monthDeliveryOptionsData,
    monthPaymentTypeData,
    annualData,
    annualProductTypeData,
    annualVisitorsData,
    annualDeliveryOptionsData,
    annualPaymentTypeData,
  ] = getDataset(extractedOrders);
  const [dressColorsState, dispatchAction] = React.useReducer(
    colorsReducer,
    []
  );
  const [selectedColor, setSelectedColor] = React.useState("");
  const [selectedColors, setSelectedColors] = React.useState<any[]>([]);
  const [hasStock, setHasStock] = React.useState(false);

  const [visibleImages, setVisibleImages] = React.useState<{
    position: string;
    imagesFront: string[];
    imagesBack: string[];
  }>({
    position: "front",
    imagesFront: [],
    imagesBack: [],
  });
  const [extractedProducts, setExtractedProducts] = React.useState<any[]>(
    searchData.products
  );
  const [isFeature, setIsFeature] = React.useState({
    listing: false,
    edit: false,
  });
  const [orders, setOrders] = React.useState<any[]>(extractedOrders);
  const [enquiries, setEnquiries] = React.useState<any[]>(
    enquiriesData.enquiries
  );
  const [orderListLength, setOrderListLength] = React.useState("10");
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
  const [calendarStart, setCalendarStart] = React.useState<string>(
    `${
      currentDate - 29 <= 0 && currentMonth === 0
        ? currentYear - 1
        : currentYear
    }-${
      currentDate - 29 <= 0
        ? ("0" + (currentMonth === 0 ? 8 : currentMonth - 4)).slice(-2)
        : ("0" + (currentMonth - 3)).slice(-2)
    }-${
      currentDate - 29 <= 0
        ? (
            "0" +
            (new Date(
              currentDate - 29 <= 0 && currentMonth === 0
                ? currentYear - 1
                : currentYear,
              currentDate - 29 <= 0 && currentMonth === 0
                ? 8
                : currentMonth - 4,
              0
            ).getDate() -
              Math.abs(currentDate - 29))
          ).slice(-2)
        : ("0" + (currentDate - 29)).slice(-2)
    }`
  );
  const [calendarEnd, setCalendarEnd] = React.useState<string>(
    `${currentYear}-${("0" + (currentMonth + 1)).slice(-2)}-${(
      "0" + currentDate
    ).slice(-2)}`
  );
  const [startDate, setStartDate] = React.useState(
    `${
      currentDate - 29 <= 0
        ? new Date(
            currentDate - 29 <= 0 && currentMonth === 0
              ? currentYear - 1
              : currentYear,
            currentDate - 29 <= 0 && currentMonth === 0 ? 8 : currentMonth - 4,
            0
          ).getDate() - Math.abs(currentDate - 29)
        : currentDate - 29
    } ${
      currentDate - 29 <= 0
        ? currentMonth === 0
          ? months[7]
          : months[currentMonth - 5]
        : months[currentMonth - 4]
    } ${
      currentDate - 29 <= 0 && currentMonth === 0
        ? currentYear - 1
        : currentYear
    }`
  );
  const [endDate, setEndDate] = React.useState(
    `${new Date().getDate()} ${
      months[currentMonth]
    } ${new Date().getFullYear()}`
  );
  const [endValue, setEndValue] = React.useState<Value>(new Date(endDate));
  const [startValue, setStartValue] = React.useState<Value>(
    new Date(startDate)
  );
  const [price, setPrice] = React.useState({
    listing: "",
    edit: {
      size: 0,
      value: "",
    },
  });
  const [stock, setStock] = React.useState({
    listing: "",
    edit: {
      size: 0,
      value: "",
    },
  });
  const [title, setTitle] = React.useState({
    listing: "",
    edit: "",
  });
  const [fabric, setFabric] = React.useState("");
  const [embelishment, setEmbelishment] = React.useState("");
  const [dressLength, setDressLength] = React.useState("");
  const [neckLine, setNeckLine] = React.useState("");
  const [sleeveL, setSleeveL] = React.useState("");
  const [type, setType] = React.useState({
    listing: "",
    edit: "",
  });
  const [desc, setDesc] = React.useState({
    listing: "",
    edit: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [dressFeatures, setDressFeatures] = React.useState("");
  const [range, setRange] = React.useState<number | null>(5);
  const [period, setPeriod] = React.useState<string | null>("monthly");
  const [lineGraphData, setLineGraphData] = React.useState(
    Object.values(monthData!)[4]
  );
  const [productTypeBarGraphData, setProductTypeBarGraphData] = React.useState(
    Object.values(monthProductTypeData!)[4]
  );
  const [visitorsBarGraphData, setVisitorsBarGraphData] = React.useState(
    Object.values(monthVisitorsData!)[4]
  );
  const [deliveryOptionsData, setDeliveryOptionsData] = React.useState(
    Object.values(monthDeliveryOptionsData!)[4]
  );
  const [paymentTypeData, setPaymentTypeData] = React.useState(
    Object.values(monthPaymentTypeData!)[4]
  );
  let width = useWindowWidth();
  const [loader, setLoader] = React.useState(false);

  let timerId = React.useRef<NodeJS.Timeout | null>(null);

  let currentBgColors: string[] = [];

  dressColorsState.forEach((colorObj) => {
    currentBgColors.push(Object.keys(colorObj)[0]!);
  });

  React.useEffect(() => {
    return () => clearTimeout(timerId.current!);
  }, [timerId]);

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
          setPrice((prevPrice) => ({
            ...prevPrice,
            listing: updatedSizeData[updatedSizeData.length - 1]!.price!,
          }));
          setHasStock(
            updatedSizeData[updatedSizeData.length - 1]!.stock
              ? updatedSizeData[updatedSizeData.length - 1]!.stock! > 0
              : false
          );
          setStock((prevStock) => ({
            ...prevStock,
            listing: updatedSizeData[updatedSizeData.length - 1]!.stock
              ? updatedSizeData[updatedSizeData.length - 1]!.stock!.toString()
              : "",
          }));
        } else {
          //updating price and stock input elements for active size

          setPrice((prevPrice) => ({
            ...prevPrice,
            listing: "",
          }));
          setHasStock(false);
          setStock((prevPrice) => ({
            ...prevPrice,
            listing: "",
          }));

          setSizeData(updatedSizeData);
        }
      } else {
        if (
          sizeData.length > 0 &&
          price.listing.length === 0 &&
          sizeData.some(
            (datum) =>
              datum.color === currentBgColors[currentBgColors.length - 1]
          )
        ) {
          return toast.error(
            `size ${
              sizeData[sizeData.length - 1]?.number
            } is missing price, and stock`,
            {
              position: "top-center",
            }
          );
        }
        //storing size data of previous active size
        setSizeData((prevState: any) => [
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
        setPrice((prevPrice) => ({
          ...prevPrice,
          listing: "",
        }));
        setHasStock(false);
        setStock((prevPrice) => ({
          ...prevPrice,
          listing: "",
        }));

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
            if (sizeEls[i]!.innerText === datum.number!.toString()) {
              if (sizeEls[i]!.classList.contains("text-white")) {
                sizeEls[i]!.classList.remove(`${selectedColor}`);
                sizeEls[i]!.classList.add(`${datum.color}`);
              } else {
                sizeEls[i]!.classList.remove(`bg-white`, "text-black");
                sizeEls[i]!.classList.add(`${datum.color}`, "text-white");
              }
            }
          }
        }
        setPrice((prevPrice) => ({
          ...prevPrice,
          listing: updatedSizeData[updatedSizeData.length - 1]!.price!,
        }));
        setStock((prevStock) => ({
          ...prevStock,
          listing: updatedSizeData[updatedSizeData.length - 1]!.stock
            ? updatedSizeData[updatedSizeData.length - 1]!.stock!.toString()
            : "",
        }));
        setHasStock(
          updatedSizeData[updatedSizeData.length - 1]!.stock
            ? updatedSizeData[updatedSizeData.length - 1]!.stock! > 0
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
        setPrice((prevPrice) => ({
          ...prevPrice,
          listing: "",
        }));
        setHasStock(false);
        setStock((prevPrice) => ({
          ...prevPrice,
          listing: "",
        }));
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
      setPrice((prevPrice) => ({
        ...prevPrice,
        listing: "",
      }));
      setHasStock(false);
      setStock((prevPrice) => ({
        ...prevPrice,
        listing: "",
      }));
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
    timerId.current = setTimeout(async () => {
      if (orderListLength !== "10") {
        try {
          setLoader(true);
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/orders/${orderListLength}?page=1`,
            {
              withCredentials: true,
            }
          );
          setOrders(res.data.orders);
        } catch (error) {
          const e = error as Error;
          setLoader(false);
          return toast.error(e.message);
        } finally {
          setLoader(false);
        }
      }
    }, 3000);

    return () => clearTimeout(timerId.current!);
  }, [orderListLength]);

  React.useEffect(() => {
    if (isAdminSettingsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAdminSettingsOpen]);

  const hideAdminSettingsModalHandler = () => {
    const optionsMenus = document.querySelectorAll("[id^=options-menu]");
    let adminModal = document.querySelector(
      "#admin-settings-modal"
    ) as HTMLElement;

    optionsMenus.forEach((menu) => {
      if (!menu.classList.contains("hidden")) {
        menu.classList.add("hidden");
      }
    });

    if (adminModal) {
      adminModal.classList.remove("slide-down");
      adminModal.classList.add("slide-up");
      timerId.current = setTimeout(() => {
        setIsAdminSettingsOpen(false);
      }, 300);
    } else {
      setIsAdminSettingsOpen(false);
    }
  };

  const sortOrderList = (e: React.MouseEvent, type: string, key = "id") => {
    let item = e.currentTarget;
    let angleUp = item.querySelector("i.fa-angle-up");
    let angleDown = item.querySelector("i.fa-angle-down");
    let angleDowns = document.querySelectorAll(`i.fa-angle-down:not(#${type})`);
    let angleUps = document.querySelectorAll(
      `i.fa-angle-up:not(#${type}):not(#${
        width > 768 ? "order-id-sm-screen" : "order-id"
      })`
    );

    // Make a copy of the orders array to avoid mutating the original array
    let sortedOrders = [...orders];

    // Update angleDown's appearance accordingly
    if (
      angleDown?.classList.contains("text-secondary-400/20") &&
      angleUp?.classList.contains("text-secondary-400")
    ) {
      angleDown.classList.remove("text-secondary-400/20");
      angleDown.classList.add("text-secondary-400");
    } else {
      angleDown?.classList.remove("text-secondary-400");
      angleDown?.classList.add("text-secondary-400/20");
    }

    if (angleUp?.classList.contains("text-secondary-400")) {
      // Sort in descending order if angleUp is active
      angleUp.classList.remove("text-secondary-400");
      angleUp.classList.add("text-secondary-400/20");
      sortedOrders.sort((a, b) => {
        if (a[key] < b[key]) return 1;
        if (a[key] > b[key]) return -1;
        return 0;
      });
    } else {
      // Sort in ascending order if angleUp is not active
      angleUp?.classList.add("text-secondary-400");
      angleUp?.classList.remove("text-secondary-400/20");
      sortedOrders.sort((a, b) => {
        if (a[key] > b[key]) return 1;
        if (a[key] < b[key]) return -1;
        return 0;
      });
    }

    angleDowns.forEach((angleDown) => {
      angleDown.classList.remove("text-secondary-400");
      angleDown.classList.add("text-secondary-400/20");
    });

    angleUps.forEach((angleUp) => {
      angleUp.classList.remove("text-secondary-400");
      angleUp.classList.add("text-secondary-400/20");
    });

    // Set the sorted orders state to trigger a re-render
    setOrders(sortedOrders);
  };

  React.useEffect(() => {
    let adminModal = document.querySelector(
      "#admin-settings-modal"
    ) as HTMLElement;
    if (isAdminSettingsOpen && adminModal) {
      adminModal.classList.add("slide-down");
      adminModal.classList.remove("slide-up");
    }
  }, [isAdminSettingsOpen]);

  function editProduct(product: any) {
    productObj.current = {};
    frontBase64ImagesObj.current = {};
    backBase64ImagesObj.current = {};
    selectedProduct.current = product;
    setSelectedColors(selectedProduct.current.colors);

    listOfFeatures = "";
    //collecting and concatenating dress features
    for (let feature of selectedProduct.current.features) {
      listOfFeatures = listOfFeatures + feature + ", ";
    }
    setDressFeatures(listOfFeatures);

    setTitle((prevTitle) => ({
      ...prevTitle,
      edit: selectedProduct.current.title,
    }));
    setType((prevType) => ({
      ...prevType,
      edit: selectedProduct.current.type,
    }));
    setDesc((prevDesc) => ({
      ...prevDesc,
      edit: selectedProduct.current.description,
    }));
    setIsFeature((prevIsFeature) => ({
      ...prevIsFeature,
      edit: selectedProduct.current.is_feature,
    }));
    setSelectedColor(selectedProduct.current.colors[0].hex_code);
    setSelectedColors(
      selectedProduct.current.colors.map((color: any) => color.hex_code)
    );
    extractProductDetail(
      product,
      frontBase64ImagesObj.current,
      backBase64ImagesObj.current,
      productObj.current
    );

    setVisibleImages((prevVisibleImgs) => ({
      ...prevVisibleImgs,
      imagesFront: Object.values(frontBase64ImagesObj.current).flat(),
      imagesBack: Object.values(backBase64ImagesObj.current).flat(),
    }));
    setPrice((prevPrice) => ({
      ...prevPrice,
      edit: {
        ...prevPrice.edit,
        size: Object.values(productObj.current)[0]!.number!,
        value: Object.values(productObj.current)[0]!.price.toString(),
      },
    }));
    setStock((prevStock) => ({
      ...prevStock,
      edit: {
        ...prevStock.edit,
        size: Object.values(productObj.current)[0]!.number!,
        value: Object.values(productObj.current)[0]!.stock.toString(),
      },
    }));

    setIsAdminSettingsOpen(true);
  }

  async function deleteProduct(id: string) {
    // setExtractedProducts(prevProducts => prevProducts.filter((prod: any) => prod.id !== id));
    await axios.patch(
      `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/products/update/${id}?hide=true`,
      {
        withCredentials: true,
        headers: {
          "x-csrf-token": csrf,
        },
      },
    );
  }

  async function handleSizeEdit(
    e: React.MouseEvent<HTMLSpanElement>,
    item: number
  ) {
    if (!productObj.current[`${selectedColor}-${item}`]) {
      const newSizeObj = {
        price: 0,
        stock: 1,
        variant_id: (await crypto.randomBytes(6)).toString("hex"),
        number: item,
        color: selectedColor,
      };
      productObj.current[`${selectedColor}-${item}`] = newSizeObj;
    }

    setPrice((prevPrice) => ({
      ...prevPrice,
      edit: {
        ...prevPrice.edit,
        size: productObj.current[`${selectedColor}-${item}`]?.number!,
        value: productObj.current[`${selectedColor}-${item}`]!.price.toString(),
      },
    }));
    setStock((prevStock) => ({
      ...prevStock,
      edit: {
        ...prevStock.edit,
        size: productObj.current[`${selectedColor}-${item}`]?.number!,
        value: productObj.current[`${selectedColor}-${item}`]!.stock.toString(),
      },
    }));
  }

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
      className="bg-primary-950 min-h-screen pt-4 lg:pl-64 md:pl-52 pl-7 md:pr-3 pr-7 w-full py-12"
      id="admin-content"
      role="main"
    >
      {pathName === "product-listing" && (
        <section className="flex md:flex-row flex-col gap-y-12 md:gap-x-6 pl-5 pr-1 w-full h-full">
          <section className="md:flex flex-col gap-y-6 items-start xl:w-[22%] md:w-[30%] hidden">
            <form
              onSubmit={(e) =>
                handleSubmit(
                  e,
                  title.listing,
                  desc.listing,
                  type.listing,
                  embelishment,
                  fabric,
                  sleeveL,
                  dressLength,
                  neckLine,
                  isFeature.listing,
                  dressColorsState,
                  currentBgColors,
                  sizeData,
                  setIsLoading,
                  csrf
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
                        setFrontFilename
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
                    disabled={
                      currentBgColors.length === 0 || backFilename !== null
                    }
                    className="hidden"
                    onChange={(e) =>
                      handleBackImageupload(
                        e,
                        dispatchAction,
                        currentBgColors,
                        setImgData,
                        setBackFilename
                      )
                    }
                  />
                </div>
              </div>
              <div className="text-secondary-400 flex flex-col gap-y-7 text-sm w-full">
                <div className="flex flex-col justify-center gap-y-1 focus:outline-none w-full h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                  <label
                    htmlFor="title"
                    className="text-xs hide-label text-gray-500"
                  >
                    Title
                  </label>
                  <input
                    placeholder="Title"
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Title";
                      let label = item.previousElementSibling;
                      if (label && item.value.length === 0) {
                        label.classList.add("hide-label");
                        label.classList.remove("show-label");
                      }
                    }}
                    onKeyDown={(e) => {
                      let item = e.currentTarget;
                      let label = item.previousElementSibling;
                      if (e.key === "Backspace" && label) {
                        label.classList.remove("hide-label");
                        label.classList.add("show-label");
                      }
                    }}
                    onInput={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length === 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }
                    }}
                    id="title"
                    value={title.listing}
                    onChange={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length >= 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }
                      setTitle((prevTitle) => ({
                        ...prevTitle,
                        listing: e.target.value,
                      }));
                    }}
                    className="w-full h-6 bg-transparent focus:outline-none placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>
                <div className="flex flex-col justify-center gap-y-1 focus:outline-none w-full border border-t-0 border-l-0 border-r-0 border-secondary-400">
                  <label
                    htmlFor="desc"
                    className="text-xs hide-label text-gray-500"
                  >
                    Description
                  </label>
                  <textarea
                    cols={15}
                    rows={5}
                    placeholder="Description..."
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Description...";
                      let label = item.previousElementSibling;
                      if (label && item.value.length === 0) {
                        label.classList.add("hide-label");
                        label.classList.remove("show-label");
                      }
                    }}
                    onKeyDown={(e) => {
                      let item = e.currentTarget;
                      let label = item.previousElementSibling;
                      if (e.key === "Backspace" && label) {
                        label.classList.remove("hide-label");
                        label.classList.add("show-label");
                      }
                    }}
                    onInput={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length === 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }
                    }}
                    id="desc"
                    value={desc.listing}
                    onChange={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length >= 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }

                      setDesc((prevDesc) => ({
                        ...prevDesc,
                        listing: e.target.value,
                      }));
                    }}
                    className="w-full bg-transparent focus:outline-none placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  ></textarea>
                </div>
                <div className="w-full flex flex-row">
                  <div className="flex flex-col justify-center w-[45%] gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="type"
                      className="text-xs hide-label text-gray-500"
                    >
                      Type
                    </label>
                    <input
                      placeholder="Type"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Type";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="type"
                      value={type.listing}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setType((prevType) => ({
                          ...prevType,
                          listing: e.target.value,
                        }));
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                  <div className="w-[10%]"></div>
                  <div className="flex flex-col w-[45%] justify-center gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="slength"
                      className="text-xs hide-label text-gray-500"
                    >
                      Sleeve length
                    </label>
                    <input
                      placeholder="Sleeve length"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Sleeve length";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="slength"
                      value={sleeveL}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setSleeveL(e.target.value);
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                </div>
                <div className="w-full flex flex-row">
                  <div className="flex flex-col justify-center w-[45%] gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="embelish"
                      className="text-xs hide-label text-gray-500"
                    >
                      Embelishment
                    </label>
                    <input
                      placeholder="Embelishment"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Embelishment";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="embelish"
                      value={embelishment}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setEmbelishment(e.target.value);
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                  <div className="w-[10%]"></div>
                  <div className="flex flex-col w-[45%] justify-center gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="fabric"
                      className="text-xs hide-label text-gray-500"
                    >
                      Fabric
                    </label>
                    <input
                      placeholder="Fabric"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Fabric";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="fabric"
                      value={fabric}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setFabric(e.target.value);
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                </div>
                <div className="w-full flex flex-row">
                  <div className="flex flex-col justify-center w-[45%] gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="dresslength"
                      className="text-xs hide-label text-gray-500"
                    >
                      Dress length
                    </label>
                    <input
                      placeholder="Dress length"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "dress Length";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="dresslength"
                      value={dressLength}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setDressLength(e.target.value);
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                  <div className="w-[10%]"></div>
                  <div className="flex flex-col w-[45%] justify-center gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="neckLine"
                      className="text-xs hide-label text-gray-500"
                    >
                      Neck line
                    </label>
                    <input
                      placeholder="Neck line"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Neck line";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="neckLine"
                      value={neckLine}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setNeckLine(e.target.value);
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                </div>
                <section className="flex flex-col gap-y-2 items-start w-full">
                  <h5>Color</h5>
                  <div
                    className="flex flex-row flex-wrap gap-x-[6px] gap-y-2"
                    id="colors-list"
                  >
                    {productListingColorList.map((val, i: number) => (
                      <span
                        key={i}
                        onClick={(e) => handleSelectedColor(e, i)}
                        className={`rounded-sm cursor-pointer] w-6 h-6 ${val} cursor-pointer`}
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
                <div className="flex flex-col justify-center gap-y-1 h-10 focus:outline-none w-full border border-t-0 border-l-0 border-r-0 border-secondary-400">
                  <label
                    htmlFor="price"
                    className="text-xs hide-label focus:outline-none text-gray-500"
                  >
                    Price
                  </label>
                  <input
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Price";
                      let label = item.previousElementSibling;
                      if (label && item.value.length === 0) {
                        label.classList.add("hide-label");
                        label.classList.remove("show-label");
                      }
                    }}
                    onKeyDown={(e) => {
                      let item = e.currentTarget;
                      let label = item.previousElementSibling;
                      if (e.key === "Backspace" && label) {
                        label.classList.remove("hide-label");
                        label.classList.add("show-label");
                      }
                    }}
                    onInput={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length === 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }
                    }}
                    id="price"
                    placeholder="Price"
                    type="number"
                    min={0}
                    step={50}
                    value={price.listing}
                    onChange={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length >= 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }
                      handlePriceChange(
                        e,
                        currentBgColors,
                        sizeData,
                        setSizeData,
                        setPrice
                      );
                    }}
                    className="w-full h-6 bg-transparent focus:outline-none placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>

                <div className="flex flex-row w-full items-end h-8">
                  <div className="flex flex-row gap-x-2 w-[40%]">
                    <h5>In Stock</h5>
                    <input
                      onChange={(e) => {
                        if (currentBgColors.length === 0) {
                          return toast.error(`Select a dress color`, {
                            position: "top-center",
                          });
                        }
                        if (
                          currentBgColors.length > 0 &&
                          sizeData.length === 0
                        ) {
                          return toast.error(
                            `Select a dress size for ${
                              currentBgColors[currentBgColors.length - 1]
                            }`,
                            {
                              position: "top-center",
                            }
                          );
                        }

                        setHasStock(e.currentTarget.checked!);
                      }}
                      checked={hasStock}
                      id="stock-check"
                      type="checkbox"
                      className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-500 rounded-sm relative
                      cursor-pointer outline-none checked:bg-accent checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                      checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                      checked:after:rotate-45"
                    />
                  </div>
                  {hasStock && (
                    <input
                      placeholder="Stock"
                      type="number"
                      min={0}
                      step={1}
                      id="stock"
                      onChange={(e) => {
                        setStock((prevStock) => ({
                          ...prevStock,
                          listing: e.target.value,
                        }));
                        //storing size data of previous active size
                        setSizeData((prevState: any) => [
                          ...prevState,
                          {
                            ...prevState[prevState.length - 1],
                            color: currentBgColors[currentBgColors.length - 1],
                            stock: parseInt(e.target.value),
                          },
                        ]);
                      }}
                      value={stock.listing}
                      className="w-[60%] focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary-400 bg-transparent placeholder:text-secondary-400"
                    />
                  )}
                </div>
                <div className="flex flex-row gap-x-2 w-[70%]">
                  <h5>Set As Feature</h5>
                  <input
                    onChange={(e) => {
                      if (currentBgColors.length === 0) {
                        return toast.error(`Select a dress color`, {
                          position: "top-center",
                        });
                      }
                      if (currentBgColors.length > 0 && sizeData.length === 0) {
                        return toast.error(
                          `Select a dress size for ${
                            currentBgColors[currentBgColors.length - 1]
                          }`,
                          {
                            position: "top-center",
                          }
                        );
                      }
                      setIsFeature((prevIsFeature) => ({
                        ...prevIsFeature,
                        listing: e.currentTarget.checked!,
                      }));
                    }}
                    checked={isFeature.listing}
                    id="feature-check"
                    type="checkbox"
                    className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-500 rounded-sm relative
                    cursor-pointer outline-none checked:bg-accent checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                    checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                    checked:after:rotate-45"
                  />
                </div>
                <button
                  type="submit"
                  className="flex flex-row justify-center items-center bg-white mt-7 w-full text-accent text-[1rem] py-3 px-5 rounded-lg hover:bg-accent hover:text-white font-medium"
                >
                  {isLoading ? (
                    <div className="border-2 border-transparent rounded-full border-t-accent border-r-accent w-[15px] h-[15px] spin spin"></div>
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
          <section className="md:w-[70%] w-full h-full flex flex-col gap-y-16">
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
                        <span className="text-secondary-400">
                          {datum.size}kb
                        </span>
                      </footer>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
            <div className="flex flex-col items-start md:gap-y-10 gap-y-5 font-sans w-full">
              <h1 className="font-medium md:text-lg text-white text-[1rem]">
                Folders
              </h1>
              <div className="flex flex-row gap-x-4 text-secondary-400 md:pl-5 items-center">
                <i className="fa-regular fa-folder-open md:text-4xl text-3xl"></i>
                <header className="flex flex-col items-start md:text-[1rem] text-sm">
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
            <div className="flex flex-col items-start md:gap-y-4 gap-y-2 font-sans w-full">
              <h1 className="font-medium md:text-lg text-white text-[1rem] text-left">
                Files
              </h1>
              <div className="text-secondary-400 md:text-[1rem] text-sm">
                {imgData.length === 0 ? (
                  <p>No files uploaded.</p>
                ) : (
                  <div className="flex flex-row justify-start flex-wrap items-center gap-x-5 gap-y-9 w-full">
                    {imgData.map((datum, index) => (
                      <article className="flex flex-col gap-y-3" key={index}>
                        <div className="flex flex-row justify-center items-center bg-primary-800 md:px-[5.8rem] px-16 py-8 md:py-11 h-fit rounded-sm">
                          <i className="fa-solid fa-file-image text-red-400 text-[2.5rem] leading-tight"></i>
                        </div>
                        <footer className="flex flex-col px-4 font-sans">
                          <span className="text-white font-medium">
                            {datum.filename}
                          </span>
                          <span className="text-secondary-400">
                            {datum.size}kb
                          </span>
                        </footer>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
          <section className="md:hidden flex flex-col gap-y-6 items-start w-full">
            <form
              onSubmit={(e) =>
                handleSubmit(
                  e,
                  title.listing,
                  desc.listing,
                  type.listing,
                  embelishment,
                  fabric,
                  sleeveL,
                  dressLength,
                  neckLine,
                  isFeature.listing,
                  dressColorsState,
                  currentBgColors,
                  sizeData,
                  setIsLoading,
                  csrf
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
                        setFrontFilename
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
                        setBackFilename
                      )
                    }
                  />
                </div>
              </section>
              <div className="text-secondary-400 flex flex-col gap-y-7 text-sm w-full">
                <div className="flex flex-col justify-center gap-y-1 focus:outline-none w-full h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                  <label
                    htmlFor="title"
                    className="text-xs hide-label text-gray-500"
                  >
                    Title
                  </label>
                  <input
                    placeholder="Title"
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Title";
                      let label = item.previousElementSibling;
                      if (label && item.value.length === 0) {
                        label.classList.add("hide-label");
                        label.classList.remove("show-label");
                      }
                    }}
                    onKeyDown={(e) => {
                      let item = e.currentTarget;
                      let label = item.previousElementSibling;
                      if (e.key === "Backspace" && label) {
                        label.classList.remove("hide-label");
                        label.classList.add("show-label");
                      }
                    }}
                    onInput={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length === 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }
                    }}
                    id="title"
                    value={title.listing}
                    onChange={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length >= 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }
                      setTitle((prevTitle) => ({
                        ...prevTitle,
                        listing: e.target.value,
                      }));
                    }}
                    className="w-full h-6 bg-transparent focus:outline-none placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>
                <div className="flex flex-col justify-center gap-y-1 focus:outline-none w-full border border-t-0 border-l-0 border-r-0 border-secondary-400">
                  <label
                    htmlFor="desc"
                    className="text-xs hide-label text-gray-500"
                  >
                    Description
                  </label>
                  <textarea
                    cols={15}
                    rows={5}
                    placeholder="Description..."
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Description...";
                      let label = item.previousElementSibling;
                      if (label && item.value.length === 0) {
                        label.classList.add("hide-label");
                        label.classList.remove("show-label");
                      }
                    }}
                    onKeyDown={(e) => {
                      let item = e.currentTarget;
                      let label = item.previousElementSibling;
                      if (e.key === "Backspace" && label) {
                        label.classList.remove("hide-label");
                        label.classList.add("show-label");
                      }
                    }}
                    onInput={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length === 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }
                    }}
                    id="desc"
                    value={desc.listing}
                    onChange={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length >= 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }

                      setDesc((prevDesc) => ({
                        ...prevDesc,
                        listing: e.target.value,
                      }));
                    }}
                    className="w-full bg-transparent focus:outline-none placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  ></textarea>
                </div>
                <div className="w-full flex flex-row">
                  <div className="flex flex-col justify-center w-[45%] gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="type"
                      className="text-xs hide-label text-gray-500"
                    >
                      Type
                    </label>
                    <input
                      placeholder="Type"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Type";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="type"
                      value={type.listing}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setType((prevType) => ({
                          ...prevType,
                          listing: e.target.value,
                        }));
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                  <div className="w-[10%]"></div>
                  <div className="flex flex-col w-[45%] justify-center gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="slength"
                      className="text-xs hide-label text-gray-500"
                    >
                      Sleeve length
                    </label>
                    <input
                      placeholder="Sleeve length"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Sleeve length";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="slength"
                      value={sleeveL}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setSleeveL(e.target.value);
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                </div>
                <div className="w-full flex flex-row">
                  <div className="flex flex-col justify-center w-[45%] gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="embelish"
                      className="text-xs hide-label text-gray-500"
                    >
                      Embelishment
                    </label>
                    <input
                      placeholder="Embelishment"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Embelishment";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="embelish"
                      value={embelishment}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setEmbelishment(e.target.value);
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                  <div className="w-[10%]"></div>
                  <div className="flex flex-col w-[45%] justify-center gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="fabric"
                      className="text-xs hide-label text-gray-500"
                    >
                      Fabric
                    </label>
                    <input
                      placeholder="Fabric"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Fabric";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="fabric"
                      value={fabric}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setFabric(e.target.value);
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                </div>
                <div className="w-full flex flex-row">
                  <div className="flex flex-col justify-center w-[45%] gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="dresslength"
                      className="text-xs hide-label text-gray-500"
                    >
                      Dress length
                    </label>
                    <input
                      placeholder="Dress length"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "dress Length";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="dresslength"
                      value={dressLength}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setDressLength(e.target.value);
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                  <div className="w-[10%]"></div>
                  <div className="flex flex-col w-[45%] justify-center gap-y-1 focus:outline-none h-10 border border-t-0 border-l-0 border-r-0 border-secondary-400">
                    <label
                      htmlFor="neckLine"
                      className="text-xs hide-label text-gray-500"
                    >
                      Neck line
                    </label>
                    <input
                      placeholder="Neck line"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Neck line";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }
                      }}
                      onKeyDown={(e) => {
                        let item = e.currentTarget;
                        let label = item.previousElementSibling;
                        if (e.key === "Backspace" && label) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }}
                      onInput={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length === 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                      }}
                      id="neckLine"
                      value={neckLine}
                      onChange={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "";
                        let label = item.previousElementSibling;
                        if (label) {
                          if (item.value.length >= 1) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                        }
                        setNeckLine(e.target.value);
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                </div>
                <section className="flex flex-col gap-y-2 items-start w-full">
                  <h5>Color</h5>
                  <div
                    className="flex flex-row flex-wrap gap-x-[6px] gap-y-2"
                    id="colors-list"
                  >
                    {productListingColorList.map((val, i: number) => (
                      <span
                        key={i}
                        onClick={(e) => handleSelectedColor(e, i)}
                        className={`rounded-sm cursor-pointer w-6 h-6 ${val} cursor-pointer`}
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
                <div className="flex flex-col justify-center gap-y-1 h-10 focus:outline-none w-full border border-t-0 border-l-0 border-r-0 border-secondary-400">
                  <label
                    htmlFor="price"
                    className="text-xs hide-label focus:outline-none text-gray-500"
                  >
                    Price
                  </label>
                  <input
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Price";
                      let label = item.previousElementSibling;
                      if (label && item.value.length === 0) {
                        label.classList.add("hide-label");
                        label.classList.remove("show-label");
                      }
                    }}
                    onKeyDown={(e) => {
                      let item = e.currentTarget;
                      let label = item.previousElementSibling;
                      if (e.key === "Backspace" && label) {
                        label.classList.remove("hide-label");
                        label.classList.add("show-label");
                      }
                    }}
                    onInput={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length === 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }
                    }}
                    id="price"
                    placeholder="Price"
                    type="number"
                    min={0}
                    step={50}
                    value={price.listing}
                    onChange={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "";
                      let label = item.previousElementSibling;
                      if (label) {
                        if (item.value.length >= 1) {
                          label.classList.remove("hide-label");
                          label.classList.add("show-label");
                        }
                      }
                      handlePriceChange(
                        e,
                        currentBgColors,
                        sizeData,
                        setSizeData,
                        setPrice
                      );
                    }}
                    className="w-full h-6 bg-transparent focus:outline-none placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>

                <div className="flex flex-row w-full items-end h-8">
                  <div className="flex flex-row gap-x-2 w-[40%]">
                    <h5>In Stock</h5>
                    <input
                      onChange={(e) => {
                        if (currentBgColors.length === 0) {
                          return toast.error(`Select a dress color`, {
                            position: "top-center",
                          });
                        }
                        if (
                          currentBgColors.length > 0 &&
                          sizeData.length === 0
                        ) {
                          return toast.error(
                            `Select a dress size for ${
                              currentBgColors[currentBgColors.length - 1]
                            }`,
                            {
                              position: "top-center",
                            }
                          );
                        }

                        setHasStock(e.currentTarget.checked!);
                      }}
                      checked={hasStock}
                      id="stock-check"
                      type="checkbox"
                      className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-500 rounded-sm relative
                      cursor-pointer outline-none checked:bg-accent checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                      checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                      checked:after:rotate-45"
                    />
                  </div>
                  {hasStock && (
                    <input
                      placeholder="Stock"
                      type="number"
                      min={0}
                      step={1}
                      id="stock"
                      onChange={(e) => {
                        setStock((prevStock) => ({
                          ...prevStock,
                          listing: e.target.value,
                        }));
                        //storing size data of previous active size
                        setSizeData((prevState: any) => [
                          ...prevState,
                          {
                            ...prevState[prevState.length - 1],
                            color: currentBgColors[currentBgColors.length - 1],
                            stock: parseInt(e.target.value),
                          },
                        ]);
                      }}
                      value={stock.listing}
                      className="w-[60%] focus:outline-none h-8 border border-t-0 border-l-0 border-r-0 border-secondary-400 bg-transparent placeholder:text-secondary-400"
                    />
                  )}
                </div>
                <div className="flex flex-row gap-x-2 w-[70%]">
                  <h5>Set As Feature</h5>
                  <input
                    onChange={(e) => {
                      if (currentBgColors.length === 0) {
                        return toast.error(`Select a dress color`, {
                          position: "top-center",
                        });
                      }
                      if (currentBgColors.length > 0 && sizeData.length === 0) {
                        return toast.error(
                          `Select a dress size for ${
                            currentBgColors[currentBgColors.length - 1]
                          }`,
                          {
                            position: "top-center",
                          }
                        );
                      }

                      setIsFeature((prevIsFeature) => ({
                        ...prevIsFeature,
                        listing: e.currentTarget.checked!,
                      }));
                    }}
                    checked={isFeature.listing}
                    id="feature-check"
                    type="checkbox"
                    className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-500 rounded-sm relative
                    cursor-pointer outline-none checked:bg-accent checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                    checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                    checked:after:rotate-45"
                  />
                </div>
                <button
                  type="submit"
                  className="flex flex-row justify-center items-center bg-white mt-7 w-full text-accent text-[1rem] py-3 px-5 rounded-lg hover:bg-accent hover:text-white font-medium"
                >
                  {isLoading ? (
                    <div className="border-2 border-transparent rounded-full border-t-accent border-r-accent w-[15px] h-[15px] spin spin"></div>
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
        <section className="flex flex-col items-center justify-center w-full h-full gap-y-16">
          <div
            className={`flex flex-col items-start ${
              orders.length > 0 ? "gap-y-7" : "gap-y-24"
            } w-full`}
          >
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
            {orders.length === 0 ? (
              <section className="flex flex-row justify-center text-white w-full">
                <h1 className="font-sans text-lg">
                  No Order has been created!
                </h1>
              </section>
            ) : (
              <>
                <table className="w-full border-spacing-y-2 text-secondary-400 text-xs md:table hidden">
                  <thead className="w-full relative">
                    <tr>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[20%]">
                        <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                          <span>ORDER ID</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) => sortOrderList(e, "order-id")}
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400"
                              id="order-id"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="order-id"
                            ></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[25%] py-1">
                        <div className="inline-flex flex-row justify-between gap-x-14 items-center w-full pl-9 pr-1 py-2">
                          <span>VAR ID(s)</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) => sortOrderList(e, "var-id")}
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400/20"
                              id="var-id"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="var-id"
                            ></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[10%] py-1">
                        <div className="inline-flex flex-row justify-end gap-x-4 items-center w-full px-1 py-2">
                          <span>TOTAL</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) => sortOrderList(e, "total", "total")}
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400/20"
                              id="total"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="total"
                            ></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[15%] py-1">
                        <div className="inline-flex flex-row justify-end gap-x-11 items-center w-full px-1 py-2">
                          <span>STATE</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) => sortOrderList(e, "state", "status")}
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400/20"
                              id="state"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="state"
                            ></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[12.5%] py-1">
                        <div className="inline-flex flex-row justify-end gap-x-9 items-center w-full px-1 py-2">
                          <span>TYPE</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) =>
                              sortOrderList(e, "type", "paymentType")
                            }
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400/20"
                              id="type"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="type"
                            ></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[12.5%] py-1">
                        <div className="inline-flex flex-row justify-end gap-x-7 items-center w-full px-1 py-2">
                          <span>STATUS</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) =>
                              sortOrderList(e, "status", "paymentStatus")
                            }
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400/20"
                              id="status"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="status"
                            ></i>
                          </div>
                        </div>
                      </th>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-[5%] py-1"></th>
                    </tr>
                    {loader && (
                      <div className="absolute bottom-0 left-0 w-full h-[4px]">
                        <div className="trailing-progress-bar w-full">
                          <div className="trailing-progress loading bg-blue-500 h-full"></div>
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
                          {order.paymentType.length === 0
                            ? "---"
                            : order.paymentType}
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
                              if (!loader) {
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
                              <button
                                onClick={async (e) => {
                                  try {
                                    setIsLoading(true);
                                    const res = await axios.post(
                                      `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/orders/${order.id}/reminder`,
                                      {
                                        items: order.items,
                                      },
                                      {
                                        withCredentials: true,
                                        headers: {
                                          "x-csrf-token": csrf,
                                        },
                                      },
                                    );
        
                                    if (res.status != 201) {
                                      throw new Error(res.data.message);
                                    }
                                  } catch (error) {
                                    const e = error as Error;
                                    setIsLoading(false);
                                    return toast.error(e.message);
                                  } finally {
                                    setIsLoading(false);
                                    toast.success("reminder sent", {
                                      position: "top-center",
                                    });
                                  }
                                }}
                                className="hover:text-accent text-xs"
                              >
                                {isLoading ? "Processing.." : "Send Reminder"}
                              </button>
                            )}
                          </div>
                        </td>
                        {isAdminSettingsOpen && pathName === "orders" && (
                          <AdminSettingsModal
                            onClose={hideAdminSettingsModalHandler}
                            left="17.5rem"
                            width="35rem"
                          >
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
                                    <select
                                      id="payment-status"
                                      className="text-sm text-gray-600 focus:outline-none w-[50%] md:w-[30%]"
                                    >
                                      <option hidden selected value="">
                                        choose status
                                      </option>
                                      <option value="pending">pending</option>
                                      <option value="paid">paid</option>
                                      <option value="failed">failed</option>
                                    </select>
                                  </div>
                                  <button
                                    onClick={async (e) => {
                                      let selectedStatus = document.querySelector(
                                        "#payment-status"
                                      ) as HTMLSelectElement;
                                      if (
                                        selectedStatus &&
                                        selectedStatus.value.length === 0
                                      ) {
                                        return;
                                      }
                                      try {
                                        setIsLoading(true);
                                        await axios.post(
                                          `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/orders/${order.id}/payment-status`,
                                          {
                                            paymentStatus: selectedStatus.value,
                                          },
                                          {
                                            withCredentials: true,
                                            headers: {
                                              "x-csrf-token": csrf,
                                            },
                                          }
                                        );
                                      } catch (error) {
                                        const e = error as Error;
                                        setIsLoading(false);
                                        return toast.error(e.message);
                                      } finally {
                                        setIsLoading(false);
                                        //resetting payment status
                                        selectedStatus.value = "";
                                        toast.success(
                                          "payment status updated",
                                          {
                                            position: "top-center",
                                          }
                                        );
                                      }
                                    }}
                                    className="px-7 py-2 bg-accent text-white hover:ring-accent hover:ring-1 rounded-md text-xs"
                                  >
                                    {isLoading ? (
                                      <span className="border-2 border-transparent rounded-full border-t-white border-r-white w-[15px] h-[15px] spin spin"></span>
                                    ) : (
                                      "Update Status"
                                    )}
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
                                        id="request-link"
                                        cols={25}
                                        rows={15}
                                      ></textarea>
                                      <button
                                        onClick={async (e) => {
                                          let link = document.querySelector(
                                            "#request-link"
                                          ) as HTMLTextAreaElement;
                                          if (link && link.value.length === 0) {
                                            return;
                                          }
                                          try {
                                            setIsLoading(true);
                                            const res = await axios.post(
                                              `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/orders/${order.id}/payment-request`,
                                              {
                                                link: link.value.trim(),
                                                id: order.id,
                                                total: order.sales,
                                              },
                                              {
                                                withCredentials: true,
                                                headers: {
                                                  "x-csrf-token": csrf,
                                                },
                                              }
                                            );

                                            if (res.status != 201) {
                                              throw new Error(res.data.message);
                                            }
                                          } catch (error) {
                                            const e = error as Error;
                                            setIsLoading(false);
                                            return toast.error(e.message);
                                          } finally {
                                            setIsLoading(false);
                                            //restting payment link
                                            link.value = "";
                                            toast.success(
                                              "payment request sent",
                                              {
                                                position: "top-center",
                                              }
                                            );
                                          }
                                        }}
                                        className="px-7 py-2 w-full bg-accent text-white hover:ring-accent hover:ring-1 rounded-md text-xs"
                                      >
                                        {isLoading ? (
                                          <span className="border-2 border-transparent rounded-full border-t-white border-r-white w-[15px] h-[15px] spin spin"></span>
                                        ) : (
                                          <span>
                                            Send&nbsp;&nbsp;
                                            <i className="fa-solid fa-paper-plane text-white hover:text-accent text-xs"></i>
                                          </span>
                                        )}
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
                  <thead className="w-full relative">
                    <tr>
                      <th className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-1">
                        <div className="inline-flex flex-row justify-between items-center w-full pl-9 pr-1 py-2">
                          <span>ORDER ID</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) =>
                              sortOrderList(e, "order-id-sm-screen")
                            }
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400"
                              id="order-id-sm-screen"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="order-id-sm-screen"
                            ></i>
                          </div>
                        </div>
                      </th>
                    </tr>
                    {loader && (
                      <div className="absolute bottom-0 left-0 w-full h-[4px]">
                        <div className="trailing-progress-bar w-full">
                          <div className="trailing-progress loading bg-blue-500 h-full"></div>
                        </div>
                      </div>
                    )}
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
                                if (!loader) {
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
                                <button
                                  onClick={async (e) => {
                                    try {
                                      setIsLoading(true);
                                      const res = await axios.post(
                                        `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/orders/${order.id}/reminder`,
                                        {
                                          items: order.items,
                                        },
                                        {
                                          withCredentials: true,
                                          headers: {
                                            "x-csrf-token": csrf,
                                          },
                                        }
                                      );

                                       if (res.status != 201) {
                                        throw new Error(res.data.message);
                                      }
                                    } catch (error) {
                                      const e = error as Error;
                                      setIsLoading(false);
                                      return toast.error(e.message);
                                    } finally {
                                      setIsLoading(false);
                                      toast.success("reminder sent", {
                                        position: "top-center",
                                      });
                                    }
                                  }}
                                  className="hover:text-accent text-xs"
                                >
                                  {isLoading ? "Processing.." : "Send Reminder"}
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
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) =>
                              sortOrderList(e, "var-id-sm-screen")
                            }
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400/20"
                              id="var-id-sm-screen"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="var-id-sm-screen"
                            ></i>
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
                            <span key={i}>
                              {item.variantId},{i === 1 ? <br /> : " "}
                            </span>
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
                          <span>TOTAL ITEMS</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) =>
                              sortOrderList(e, "total-id-sm-screen", "total")
                            }
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400/20"
                              id="total-id-sm-screen"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="total-id-sm-screen"
                            ></i>
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
                          <span>ORDER STATE</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) =>
                              sortOrderList(e, "state-id-sm-screen", "status")
                            }
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400/20"
                              id="state-id-sm-screen"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="state-id-sm-screen"
                            ></i>
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
                          <span>PAYMENT TYPE</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) =>
                              sortOrderList(
                                e,
                                "type-id-sm-screen",
                                "paymentType"
                              )
                            }
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400/20"
                              id="type-id-sm-screen"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="type-id-sm-screen"
                            ></i>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((order: any, i: number) => (
                      <tr key={i}>
                        <td className="bg-transparent border-secondary-400/20 border-t-0 border-l-0 border-r-0 border w-full py-5 pl-9 pr-1 font-medium">
                          {order.paymentType.length === 0
                            ? "---"
                            : order.paymentType}
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
                          <span>PAYMENT STATUS</span>
                          <div
                            className="flex flex-col text-[1rem] cursor-pointer"
                            onClick={(e) =>
                              sortOrderList(
                                e,
                                "status-id-sm-screen",
                                "paymentStatus"
                              )
                            }
                          >
                            <i
                              className="fa-solid fa-angle-up text-secondary-400/20"
                              id="status-id-sm-screen"
                            ></i>
                            <i
                              className="fa-solid fa-angle-down text-secondary-400/20 -mt-2"
                              id="status-id-sm-screen"
                            ></i>
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
              </>
            )}
          </div>
          {orders.length > 0 && <AdminPagination {...data} />}
        </section>
      )}
      {pathName === "summary" && (
        <section className="flex flex-col gap-y-8 md:gap-y-8 w-full h-full relative justify-between md:pr-8">
          <span
            id="report-settings"
            onClick={() => {
              setIsAdminSettingsOpen(true);
            }}
            className="cursor-pointer flex flex-row items-center absolute md:right-10 right-4 -top-4"
          >
            <span className="sr-only">Open report settings</span>
            <i className="text-sm fa-solid fa-wrench text-gray-400"></i>&nbsp;
            <i className="text-sm fa-solid fa-caret-down text-gray-400"></i>
          </span>
          <article
            className="w-full h-[33%] md:h-[25vh] xl:h-[32vh]"
            id="total-sales-graph"
          >
            <Line options={lineGraphOptions} data={lineGraphData}></Line>
          </article>
          <article className="flex md:flex-row flex-col w-full h-[33%] xl:h-[35vh] md:h-[25vh] gap-y-8">
            <div className={`md:w-[50%] w-full md:pr-3 h-full`}>
              <Bar
                options={productTypeGraphOptions}
                data={productTypeBarGraphData}
              ></Bar>
            </div>
            <div className="md:w-[50%] w-full md:pl-3 h-[92%]">
              <Bar
                options={verticalBarGraphOptions}
                data={visitorsBarGraphData}
              ></Bar>
            </div>
          </article>
          <article
            className={`w-full h-[34%] xl:h-[33vh] md:h-[26vh] flex md:flex-row flex-col gap-y-7 items-start lg:items-center gap-x-2 lg:gap-0`}
          >
            <div className="w-full md:w-[50%] lg:h-full">
              <Bar
                options={deliveryOptionsGraphOptions}
                data={deliveryOptionsData}
              ></Bar>
            </div>
            {paymentTypeData.datasets[0].data.reduce(
              (a: number, b: number) => a + b,
              0
            ) > 0 && (
              <div className="flex md:w-[50%] w-full flex-row items-center md:justify-start justify-center gap-x-2">
                <div className="md:w-[60%] lg:w-[70%] w-full h-full">
                  <Doughnut
                    options={{
                      plugins: {
                        legend: {
                          display: width < 768 ? true : false,
                        },
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                    data={paymentTypeData}
                  ></Doughnut>
                </div>
                <ul className="md:inline-flex flex-col items-start gap-y-2 lg:w-[30%] md:w-[40%] hidden">
                  <li className="flex flex-row gap-x-2 items-center">
                    <i className="fa-solid fa-circle text-[#FFA500] text-[8px] align-middle"></i>
                    <span className="text-xs font-sans text-secondary-400">
                      Streetzwyze
                    </span>
                  </li>
                  <li className="flex flex-row gap-x-2 items-center">
                    <i className="fa-solid fa-circle text-[#51b2ca] text-[8px] align-middle"></i>
                    <span className="text-xs font-sans text-secondary-400">
                      Interswitch
                    </span>
                  </li>
                  {/* <li className="flex flex-row gap-x-2 items-center"><i className="fa-solid fa-circle text-[#4a48c7] text-[8px] align-middle"></i><span className="text-xs font-sans text-secondary-400">Opera</span></li> */}
                </ul>
              </div>
            )}
          </article>
          {isAdminSettingsOpen && pathName === "summary" && (
            <AdminSettingsModal
              onClose={hideAdminSettingsModalHandler}
              left="20rem"
              width="40rem"
              classes="h-fit bg-white"
            >
              <section className="flex-col gap-y-6 items-start px-5 py-6 justify-center flex h-full">
                <header className="text-xl font-bold">
                  Settings&nbsp;&nbsp;
                  <i className="text-lg fa-solid fa-wrench text-gray-400"></i>
                </header>
                <div className="flex flex-row gap-x-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => {
                        //extracting date data from input
                        let extractedDate, extractedYear;
                        let extractedMonth = 0;

                        //validtion check to keep spaces between date string
                        if (e.target.value.split(" ").length <= 2) {
                          e.target.value = startDate;
                          return;
                        }

                        extractedDate = parseInt(
                          e.target.value.split(" ")[0]!!
                        );

                        //validation check to prevent characters from being used
                        if (isNaN(extractedDate) || extractedDate < 1) {
                          e.target.value = startDate;
                          return;
                        }
                        for (let i = 0; i < months.length; i++) {
                          if (months[i] === e.target.value.split(" ")[1]) {
                            extractedMonth = i;
                          }
                        }
                        extractedYear = parseInt(e.target.value.split(" ")[2]!);
                        //validation check to prevent characters from being used or wrong year format
                        if (isNaN(extractedYear)) {
                          e.target.value = startDate;
                          return;
                        }

                        const timeDiff =
                          new Date(
                            currentYear,
                            currentMonth + 1,
                            currentDate
                          ).getTime() -
                          new Date(
                            extractedYear,
                            extractedMonth! + 1,
                            extractedDate
                          ).getTime();
                        //validation check
                        if (timeDiff < 86400000) {
                          e.target.value = startDate;
                          alert(
                            "start date has to be at least 1 day apart from end date"
                          );
                          return;
                        } else {
                          //binding value to change event
                          setStartDate(e.target.value);

                          setCalendarStart(
                            `${extractedYear}-${(
                              "0" +
                              (extractedMonth! + 1)
                            ).slice(-2)}-${("0" + extractedDate).slice(-2)}`
                          );

                          //clearing factory range and period
                          setRange(null);
                          setPeriod(null);

                          if (timeDiff <= 2505600000) {
                            let range = timeDiff / 86400000;

                            setLineGraphData(
                              Object.values(dailyData!!)[Math.round(range - 1)]
                            );
                            setProductTypeBarGraphData(
                              Object.values(dailyProductTypeData!!)[
                                Math.round(range - 1)
                              ]
                            );
                            setVisitorsBarGraphData(
                              Object.values(dailyVisitorsData!!)[
                                Math.round(range - 1)
                              ]
                            );
                          }

                          if (
                            timeDiff > 31560000000 &&
                            timeDiff <= 378720000000
                          ) {
                            let range = timeDiff / 31560000000;

                            setLineGraphData(
                              Object.values(annualData!)[Math.round(range - 1)]
                            );
                            setProductTypeBarGraphData(
                              Object.values(annualProductTypeData!)[
                                Math.round(range - 1)
                              ]
                            );
                            setVisitorsBarGraphData(
                              Object.values(annualVisitorsData!)[
                                Math.round(range - 1)
                              ]
                            );
                          }

                          if (
                            timeDiff > 2505600000 &&
                            timeDiff <= 31560000000
                          ) {
                            let range = timeDiff / 2505600000;

                            setLineGraphData(
                              Object.values(monthData!)[Math.round(range - 1)]
                            );
                            setProductTypeBarGraphData(
                              Object.values(monthProductTypeData!)[
                                Math.round(range - 1)
                              ]
                            );
                            setVisitorsBarGraphData(
                              Object.values(monthVisitorsData!)[
                                Math.round(range - 1)
                              ]
                            );
                          }
                        }
                      }}
                      id="start-date"
                      placeholder="1 Jan 1960"
                      className="peer rounded-md placeholder:text-xs focus:outline-secondary-400 p-2 text-xs focus:ring-1  border border-gray-400 focus:border-secondary-400 w-28"
                    />
                    <label className="text-xs font-bold absolute peer-focus:text-secondary-400 top-[-6px] left-[10px] bg-white px-[5px] text-gray-400 ">
                      Start date
                    </label>
                  </div>
                  <div className="text-lg text-gray-400">-</div>
                  <div className="relative">
                    <input
                      onChange={(e) => {
                        //extracting date data from input
                        let extractedStartDate,
                          extractedStartYear,
                          extractedEndDate,
                          extractedEndYear;
                        let extractedEndMonth = 0;
                        let extractedStartMonth = 0;

                        //validtion check to keep spaces between date string
                        if (e.target.value.split(" ").length <= 2) {
                          e.target.value = endDate;
                          return;
                        }

                        extractedStartDate = parseInt(
                          calendarStart.split(" ")[0]!
                        );
                        for (let i = 0; i < months.length; i++) {
                          if (months[i] === calendarStart.split(" ")[1]) {
                            extractedStartMonth = i;
                          }
                        }
                        extractedStartYear = parseInt(
                          calendarStart.split(" ")[2]!
                        );

                        extractedEndDate = parseInt(
                          e.target.value.split(" ")[0]!
                        );
                        //validation check to prevent characters from being used
                        if (isNaN(extractedEndDate) || extractedEndDate < 1) {
                          e.target.value = endDate;
                          return;
                        }

                        for (let i = 0; i < months.length; i++) {
                          if (months[i] === e.target.value.split(" ")[1]) {
                            extractedEndMonth = i;
                          }
                        }
                        extractedEndYear = parseInt(
                          e.target.value.split(" ")[2]!
                        );
                        //validation check to prevent characters from being used or wrong year format
                        if (isNaN(extractedEndYear)) {
                          e.target.value = endDate;
                          return;
                        }

                        const currentTime =
                          new Date(
                            extractedEndYear,
                            extractedEndMonth + 1,
                            extractedEndDate
                          ).getTime() -
                          new Date(
                            currentYear,
                            currentMonth + 1,
                            currentDate
                          ).getTime();

                        //validation check to prevent user from inputing an end date greater than current time
                        if (currentTime > 0) {
                          e.target.value = endDate;
                          alert("end date cannot be greater than current date");

                          return;
                        } else if (currentTime < 0) {
                          e.target.value = endDate;
                          alert("end date cannot be less than current date");

                          return;
                        }
                        const timeDiff =
                          new Date(
                            extractedEndYear,
                            extractedEndMonth + 1,
                            extractedEndDate
                          ).getTime() -
                          new Date(
                            extractedStartYear,
                            extractedStartMonth + 1,
                            extractedStartDate
                          ).getTime();

                        //validation check
                        if (timeDiff < 86400000 && timeDiff >= 0) {
                          e.target.value = endDate;

                          alert(
                            "start date has to be at least 1 day apart from end date"
                          );
                          return;
                        } else {
                          //binding value to change event
                          setEndDate(e.target.value);

                          setCalendarStart(
                            `${extractedStartYear}-${(
                              "0" +
                              (extractedStartMonth + 1)
                            ).slice(-2)}-${("0" + extractedStartDate).slice(
                              -2
                            )}`
                          );
                          setCalendarEnd(
                            `${extractedEndYear}-${(
                              "0" +
                              (extractedEndMonth + 1)
                            ).slice(-2)}-${("0" + extractedEndDate).slice(-2)}`
                          );

                          //clearing factory range and period
                          setRange(null);
                          setPeriod(null);

                          if (timeDiff <= 2505600000) {
                            let range = timeDiff / 86400000;

                            setLineGraphData(
                              Object.values(dailyData!)[Math.round(range - 1)]
                            );
                            setProductTypeBarGraphData(
                              Object.values(dailyProductTypeData!)[
                                Math.round(range - 1)
                              ]
                            );
                            setVisitorsBarGraphData(
                              Object.values(dailyVisitorsData!)[
                                Math.round(range - 1)
                              ]
                            );
                          }

                          if (
                            timeDiff > 31560000000 &&
                            timeDiff <= 378720000000
                          ) {
                            let range = timeDiff / 31560000000;

                            setLineGraphData(
                              Object.values(annualData!)[Math.round(range - 1)]
                            );
                            setProductTypeBarGraphData(
                              Object.values(annualProductTypeData!)[
                                Math.round(range - 1)
                              ]
                            );
                            setVisitorsBarGraphData(
                              Object.values(annualVisitorsData!)[
                                Math.round(range - 1)
                              ]
                            );
                          }

                          if (
                            timeDiff > 2505600000 &&
                            timeDiff <= 31560000000
                          ) {
                            let range = timeDiff / 2505600000;

                            setLineGraphData(
                              Object.values(monthData!)[Math.round(range - 1)]
                            );
                            setProductTypeBarGraphData(
                              Object.values(monthProductTypeData!)[
                                Math.round(range - 1)
                              ]
                            );
                            setVisitorsBarGraphData(
                              Object.values(monthVisitorsData!)[
                                Math.round(range - 1)
                              ]
                            );
                          }
                        }
                      }}
                      type="text"
                      id="end-date"
                      value={endDate}
                      placeholder="1 Jan 1960"
                      className="peer rounded-md placeholder:text-xs focus:outline-secondary-400 p-2 text-xs focus:ring-1  border border-gray-400 focus:border-secondary-400 w-28"
                    />
                    <label className="text-xs font-bold absolute peer-focus:text-secondary-400 top-[-6px] left-[10px] bg-white px-[5px] text-gray-400">
                      End date
                    </label>
                  </div>
                </div>

                <div className="flex flex-row items-start gap-x-2 w-full h-[300px]">
                  <ul className="h-full w-[25%] border border-b-0 border-l-0 border-t-0 border-gray-400 md:flex hidden flex-col gap-y-2 pr-[2px] pl-[1px] py-2">
                    <li
                      onClick={(e) => {
                        if (
                          !e.currentTarget.classList.contains("active-range")
                        ) {
                          e.currentTarget.classList.add("active-range");
                          document
                            .querySelector("#last-12m")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-7d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-60d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-28d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-5m")
                            ?.classList.remove("active-range");
                        }

                        setRange(1);
                        setPeriod("daily");

                        setLineGraphData(Object.values(dailyData!!)[0]);
                        setProductTypeBarGraphData(
                          Object.values(dailyProductTypeData!!)[0]
                        );
                        setVisitorsBarGraphData(
                          Object.values(dailyVisitorsData!!)[0]
                        );

                        let startDate = `${
                          currentDate - 1 <= 0 && currentMonth === 0
                            ? currentYear - 1
                            : currentYear
                        }-${
                          currentDate - 1 <= 0
                            ? (
                                "0" + (currentMonth === 0 ? 12 : currentMonth)
                              ).slice(-2)
                            : ("0" + (currentMonth + 1)).slice(-2)
                        }-${
                          currentDate - 1 <= 0
                            ? (
                                "0" +
                                (new Date(
                                  currentMonth === 0
                                    ? currentYear - 1
                                    : currentYear,
                                  currentMonth === 0 ? 11 : currentMonth,
                                  0
                                ).getDate() -
                                  Math.abs(currentDate - 1))
                              ).slice(-2)
                            : ("0" + (currentDate - 1)).slice(-2)
                        }`;
                        setCalendarStart(startDate);
                        setCalendarEnd(
                          `${currentYear}-${("0" + (currentMonth + 1)).slice(
                            -2
                          )}-${("0" + currentDate).slice(-2)}`
                        );
                        setStartDate(
                          `${
                            startDate.split("-")[2]!.slice(-2).split("")[0] ===
                            "0"
                              ? startDate.split("-")[2]!.slice(-1)
                              : startDate.split("-")[2]!.slice(-2)
                          } ${
                            months[
                              parseInt(startDate.split("-")[1]!.slice(-1)) - 1
                            ]
                          } ${startDate.split("-")[0]}`
                        );
                      }}
                      className={`${
                        range === 1 && period === "daily" ? "active-range" : ""
                      } text-xs text-gray-600 hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`}
                      id="yesterday"
                    >
                      yesterday
                    </li>
                    <li
                      onClick={(e) => {
                        if (
                          !e.currentTarget.classList.contains("active-range")
                        ) {
                          e.currentTarget.classList.add("active-range");
                          document
                            .querySelector("#yesterday")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-12m")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-60d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-28d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-5m")
                            ?.classList.remove("active-range");
                        }

                        setRange(7);
                        setPeriod("daily");

                        setLineGraphData(Object.values(dailyData!)[6]);
                        setProductTypeBarGraphData(
                          Object.values(dailyProductTypeData!)[6]
                        );
                        setVisitorsBarGraphData(
                          Object.values(dailyVisitorsData!)[6]
                        );

                        let startDate = `${
                          currentDate - 7 <= 0 && currentMonth === 0
                            ? currentYear - 1
                            : currentYear
                        }-${
                          currentDate - 7 <= 0
                            ? (
                                "0" + (currentMonth === 0 ? 12 : currentMonth)
                              ).slice(-2)
                            : ("0" + (currentMonth + 1)).slice(-2)
                        }-${
                          currentDate - 7 <= 0
                            ? (
                                "0" +
                                (new Date(
                                  currentMonth === 0
                                    ? currentYear - 1
                                    : currentYear,
                                  currentMonth === 0 ? 12 : currentMonth,
                                  0
                                ).getDate() -
                                  Math.abs(currentDate - 7))
                              ).slice(-2)
                            : ("0" + (currentDate - 7)).slice(-2)
                        }`;
                        setCalendarStart(startDate);
                        setCalendarEnd(
                          `${currentYear}-${("0" + (currentMonth + 1)).slice(
                            -2
                          )}-${("0" + currentDate).slice(-2)}`
                        );
                        setStartDate(
                          `${
                            startDate.split("-")[2]!.slice(-2).split("")[0] ===
                            "0"
                              ? startDate.split("-")[2]!.slice(-1)
                              : startDate.split("-")[2]!.slice(-2)
                          } ${
                            months[
                              parseInt(startDate.split("-")[1]!.slice(-1)) - 1
                            ]
                          } ${startDate.split("-")[0]}`
                        );
                      }}
                      className={`${
                        range === 7 && period === "daily" ? "active-range" : ""
                      } text-xs text-gray-600 hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`}
                      id="last-7d"
                    >
                      last 7 days
                    </li>
                    <li
                      onClick={(e) => {
                        if (
                          !e.currentTarget.classList.contains("active-range")
                        ) {
                          e.currentTarget.classList.add("active-range");
                          document
                            .querySelector("#yesterday")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-7d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-60d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-12m")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-5m")
                            ?.classList.remove("active-range");
                        }

                        setRange(28);
                        setPeriod("daily");

                        setLineGraphData(Object.values(dailyData!)[27]);
                        setProductTypeBarGraphData(
                          Object.values(dailyProductTypeData!)[27]
                        );
                        setVisitorsBarGraphData(
                          Object.values(dailyVisitorsData!)[27]
                        );

                        let startDate = `${
                          currentDate - 28 <= 0 && currentMonth === 0
                            ? currentYear - 1
                            : currentYear
                        }-${
                          currentDate - 28 <= 0
                            ? (
                                "0" + (currentMonth === 0 ? 12 : currentMonth)
                              ).slice(-2)
                            : ("0" + (currentMonth + 1)).slice(-2)
                        }-${
                          currentDate - 28 <= 0
                            ? (
                                "0" +
                                (new Date(
                                  currentMonth === 0
                                    ? currentYear - 1
                                    : currentYear,
                                  currentMonth === 0 ? 12 : currentMonth,
                                  0
                                ).getDate() -
                                  Math.abs(currentDate - 28))
                              ).slice(-2)
                            : ("0" + (currentDate - 28)).slice(-2)
                        }`;
                        setCalendarStart(startDate);
                        setCalendarEnd(
                          `${currentYear}-${("0" + (currentMonth + 1)).slice(
                            -2
                          )}-${("0" + currentDate).slice(-2)}`
                        );
                        setStartDate(
                          `${
                            startDate.split("-")[2]!.slice(-2).split("")[0] ===
                            "0"
                              ? startDate.split("-")[2]!.slice(-1)
                              : startDate.split("-")[2]!.slice(-2)
                          } ${
                            months[
                              parseInt(startDate.split("-")[1]!.slice(-1)) - 1
                            ]
                          } ${startDate.split("-")[0]}`
                        );
                      }}
                      className={`${
                        range === 28 && period === "daily" ? "active-range" : ""
                      } text-xs text-gray-600 hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`}
                      id="last-28d"
                    >
                      last 28 days
                    </li>
                    <li
                      onClick={(e) => {
                        if (
                          !e.currentTarget.classList.contains("active-range")
                        ) {
                          e.currentTarget.classList.add("active-range");
                          document
                            .querySelector("#yesterday")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-7d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-12m")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-28d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-5m")
                            ?.classList.remove("active-range");
                        }

                        setRange(2);
                        setPeriod("monthly");

                        setLineGraphData(Object.values(monthData!)[1]);
                        setProductTypeBarGraphData(
                          Object.values(monthProductTypeData!)[1]
                        );
                        setVisitorsBarGraphData(
                          Object.values(monthVisitorsData!)[1]
                        );

                        let startDate = `${
                          currentDate - 29 <= 0 && currentMonth === 0
                            ? currentYear - 1
                            : currentYear
                        }-${
                          currentDate - 29 <= 0
                            ? (
                                "0" +
                                (currentMonth === 0 ? 11 : currentMonth - 1)
                              ).slice(-2)
                            : ("0" + (currentMonth - 1)).slice(-2)
                        }-${
                          currentDate - 29 <= 0
                            ? (
                                "0" +
                                (new Date(
                                  currentDate - 29 <= 0 && currentMonth === 0
                                    ? currentYear - 1
                                    : currentYear,
                                  currentDate - 29 <= 0 && currentMonth === 0
                                    ? 11
                                    : currentMonth - 1,
                                  0
                                ).getDate() -
                                  Math.abs(currentDate - 29))
                              ).slice(-2)
                            : ("0" + (currentDate - 29)).slice(-2)
                        }`;
                        setCalendarStart(startDate);
                        setCalendarEnd(
                          `${currentYear}-${("0" + (currentMonth + 1)).slice(
                            -2
                          )}-${("0" + currentDate).slice(-2)}`
                        );
                        setStartDate(
                          `${
                            startDate.split("-")[2]!.slice(-2).split("")[0] ===
                            "0"
                              ? startDate.split("-")[2]!.slice(-1)
                              : startDate.split("-")[2]!.slice(-2)
                          } ${
                            months[
                              parseInt(startDate.split("-")[1]!.slice(-1)) - 1
                            ]
                          } ${startDate.split("-")[0]}`
                        );
                      }}
                      className={`${
                        range === 2 && period === "monthly"
                          ? "active-range"
                          : ""
                      } text-xs text-gray-600 hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`}
                      id="last-60d"
                    >
                      last 60 days
                    </li>
                    <li
                      onClick={(e) => {
                        if (
                          !e.currentTarget.classList.contains("active-range")
                        ) {
                          e.currentTarget.classList.add("active-range");
                          document
                            .querySelector("#yesterday")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-7d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-60d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-28d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-12m")
                            ?.classList.remove("active-range");
                        }

                        setRange(5);
                        setPeriod("monthly");

                        setLineGraphData(Object.values(monthData!)[4]);
                        setProductTypeBarGraphData(
                          Object.values(monthProductTypeData!)[4]
                        );
                        setVisitorsBarGraphData(
                          Object.values(monthVisitorsData!)[4]
                        );

                        let startDate = `${
                          currentDate - 29 <= 0 && currentMonth === 0
                            ? currentYear - 1
                            : currentYear
                        }-${
                          currentDate - 29 <= 0
                            ? (
                                "0" +
                                (currentMonth === 0 ? 8 : currentMonth - 4)
                              ).slice(-2)
                            : ("0" + (currentMonth - 3)).slice(-2)
                        }-${
                          currentDate - 29 <= 0
                            ? (
                                "0" +
                                (new Date(
                                  currentDate - 29 <= 0 && currentMonth === 0
                                    ? currentYear - 1
                                    : currentYear,
                                  currentDate - 29 <= 0 && currentMonth === 0
                                    ? 8
                                    : currentMonth - 4,
                                  0
                                ).getDate() -
                                  Math.abs(currentDate - 29))
                              ).slice(-2)
                            : ("0" + (currentDate - 29)).slice(-2)
                        }`;
                        setCalendarStart(startDate);
                        setCalendarEnd(
                          `${currentYear}-${("0" + (currentMonth + 1)).slice(
                            -2
                          )}-${("0" + currentDate).slice(-2)}`
                        );
                        setStartDate(
                          `${
                            startDate.split("-")[2]!.slice(-2).split("")[0] ===
                            "0"
                              ? startDate.split("-")[2]!.slice(-1)
                              : startDate.split("-")[2]!.slice(-2)
                          } ${
                            months[
                              parseInt(startDate.split("-")[1]!.slice(-1)) - 1
                            ]
                          } ${startDate.split("-")[0]}`
                        );
                      }}
                      className={`${
                        range === 5 && period === "monthly"
                          ? "active-range"
                          : ""
                      } text-gray-600 text-xs hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`}
                      id="last-5m"
                    >
                      last 5 months
                    </li>
                    <li
                      onClick={(e) => {
                        if (
                          !e.currentTarget.classList.contains("active-range")
                        ) {
                          e.currentTarget.classList.add("active-range");
                          document
                            .querySelector("#yesterday")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-7d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-60d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-28d")
                            ?.classList.remove("active-range");
                          document
                            .querySelector("#last-5m")
                            ?.classList.remove("active-range");
                        }

                        setRange(13);
                        setPeriod("monthly");

                        setLineGraphData(Object.values(monthData!)[12]);
                        setProductTypeBarGraphData(
                          Object.values(monthProductTypeData!)[12]
                        );
                        setVisitorsBarGraphData(
                          Object.values(monthVisitorsData!)[12]
                        );

                        let startDate = `${currentYear - 1}-${
                          currentDate - 29 <= 0
                            ? (
                                "0" + (currentMonth === 0 ? 1 : currentMonth)
                              ).slice(-2)
                            : ("0" + (currentMonth + 1)).slice(-2)
                        }-${
                          currentDate - 29 <= 0
                            ? (
                                "0" +
                                (new Date(
                                  currentYear - 1,
                                  currentMonth === 0 ? 1 : currentMonth,
                                  0
                                ).getDate() -
                                  Math.abs(currentDate - 29))
                              ).slice(-2)
                            : ("0" + (currentDate - 29)).slice(-2)
                        }`;
                        setCalendarStart(startDate);
                        setCalendarEnd(
                          `${currentYear}-${("0" + (currentMonth + 1)).slice(
                            -2
                          )}-${("0" + currentDate).slice(-2)}`
                        );
                        setStartDate(
                          `${
                            startDate.split("-")[2]!.slice(-2).split("")[0] ===
                            "0"
                              ? startDate.split("-")[2]!.slice(-1)
                              : startDate.split("-")[2]!.slice(-2)
                          } ${
                            months[
                              parseInt(startDate.split("-")[1]!.slice(-1)) - 1
                            ]
                          } ${startDate.split("-")[0]}`
                        );
                      }}
                      className={`${
                        range === 13 && period === "monthly"
                          ? "active-range"
                          : ""
                      } text-xs text-gray-600 hover:text-primary-800/70 px-3 py-2 hover:bg-primary-50 cursor-pointer`}
                      id="last-12m"
                    >
                      last 12 months
                    </li>
                  </ul>
                  <div className="w-full md:w-[75%] h-full overflow-hidden">
                    <FullCalendar
                      plugins={[multiMonthPlugin, interactionPlugin]}
                      key={calendarStart + calendarEnd}
                      initialView="multiMonthYear"
                      headerToolbar={{
                        left: "title",
                        center: "",
                        right: "prev,today",
                      }}
                      // validRange={{
                      //   end: new Date(new Date().getTime() + Math.abs(new Date().getTimezoneOffset()) * 60 * 1000).toISOString()
                      // }}
                      slotMaxTime={new Date(
                        new Date().getTime() +
                          Math.abs(new Date().getTimezoneOffset()) * 60 * 1000
                      )
                        .toISOString()
                        .substring(11, 19)}
                      events={[
                        {
                          start: calendarStart,
                          end: calendarEnd,
                          allDay: true,
                        },
                      ]}
                      editable={true}
                      eventResize={({ event }) => {
                        if (!event.start || !event.end) {
                          console.error("Invalid event dates:", event);
                          return;
                        }

                        let timeDiff =
                          event.end.getTime() - event.start.getTime();

                        //clearing factory range and period
                        setRange(null);
                        setPeriod(null);

                        if (timeDiff <= 2505600000) {
                          let range = timeDiff / 86400000;

                          setLineGraphData(
                            Object.values(dailyData!)[Math.round(range - 1)]
                          );
                          setProductTypeBarGraphData(
                            Object.values(dailyProductTypeData!)[
                              Math.round(range - 1)
                            ]
                          );
                          setVisitorsBarGraphData(
                            Object.values(dailyVisitorsData!)[
                              Math.round(range - 1)
                            ]
                          );
                          setPaymentTypeData(
                            Object.values(dailyPaymentTypeData!)[
                              Math.round(range - 1)
                            ]
                          );
                          setVisitorsBarGraphData(
                            Object.values(dailyVisitorsData!)[
                              Math.round(range - 1)
                            ]
                          );
                        }

                        if (
                          timeDiff > 31560000000 &&
                          timeDiff <= 378720000000
                        ) {
                          let range = timeDiff / 31560000000;

                          setLineGraphData(
                            Object.values(annualData!)[Math.round(range - 1)]
                          );
                          setProductTypeBarGraphData(
                            Object.values(annualProductTypeData!)[
                              Math.round(range - 1)
                            ]
                          );
                          setVisitorsBarGraphData(
                            Object.values(annualVisitorsData!)[
                              Math.round(range - 1)
                            ]
                          );
                        }

                        if (timeDiff > 2505600000 && timeDiff <= 31560000000) {
                          let range = timeDiff / 2505600000;

                          setLineGraphData(
                            Object.values(monthData!)[Math.round(range - 1)]
                          );
                          setProductTypeBarGraphData(
                            Object.values(monthProductTypeData!)[
                              Math.round(range - 1)
                            ]
                          );
                          setVisitorsBarGraphData(
                            Object.values(monthVisitorsData!)[
                              Math.round(range - 1)
                            ]
                          );
                        }
                      }}
                      eventBackgroundColor="#0EA5E9"
                    />
                  </div>
                </div>
              </section>
            </AdminSettingsModal>
          )}
        </section>
      )}
      {pathName === "emails" && (
        <section className="flex flex-col w-full h-full gap-y-5 md:px-8 text-secondary-400 font-sans">
          <header className="text-lg pb-4 border font-medium border-l-0 border-t-0 border-r-0 border-secondary-400/20">
            Inbox
          </header>
          <p className="text-[.8rem]">
            This page contains messages from clients regarding appointments and
            other enquiries
          </p>

          {enquiries.length > 0 ? (
            <>
              <section className="md:max-w-[60%] w-full flex flex-row flex-wrap lg:flex-nowrap justify-start items-center text-sm gap-x-2 gap-y-2 mt-6">
                <div className="lg:inline-block lg:max-w-[28%] hidden relative">
                  <button
                    onClick={(e) => {
                      let downAngle = e.currentTarget.querySelector(
                        "i.actions-angle-down"
                      );
                      let actionsDropdown = document.getElementById(
                        "actions-dropdown"
                      );
                      let dropdowns = document.querySelectorAll(
                        "[id$=-dropdown]:not(#actions-dropdown)"
                      );
                      let calendarAngleDown = document.querySelector(
                        "i.calendar-angle-down"
                      );
                      let filterAngleDown = document.querySelector(
                        "i.filter-angle-down"
                      );
                      let activeActionAngleDown = document.querySelector(
                        "i.active-action-angle-down"
                      );

                      if (calendarAngleDown?.classList.contains("ad-rotate")) {
                        calendarAngleDown?.classList.remove("ad-rotate");
                        calendarAngleDown?.classList.add("ad-rotate-anticlock");
                      }
                      if (filterAngleDown?.classList.contains("ad-rotate")) {
                        filterAngleDown?.classList.remove("ad-rotate");
                        filterAngleDown?.classList.add("ad-rotate-anticlock");
                      }
                      if (
                        activeActionAngleDown?.classList.contains("ad-rotate")
                      ) {
                        activeActionAngleDown?.classList.remove("ad-rotate");
                        activeActionAngleDown?.classList.add(
                          "ad-rotate-anticlock"
                        );
                      }

                      dropdowns.forEach((dropdown) => {
                        if (dropdown.classList.contains("show")) {
                          dropdown.classList.add("hide", "hidden");
                          dropdown.classList.remove("show");
                        }
                      });

                      if (downAngle && actionsDropdown) {
                        if (!downAngle.classList.contains("ad-rotate")) {
                          downAngle.classList.add("ad-rotate");
                          downAngle.classList.remove("ad-rotate-anticlock");
                          actionsDropdown.classList.remove("hide", "hidden");
                          actionsDropdown.classList.add("show");
                        } else {
                          downAngle.classList.remove("ad-rotate");
                          downAngle.classList.add("ad-rotate-anticlock");
                          actionsDropdown.classList.add("hide", "hidden");
                          actionsDropdown.classList.remove("show");
                        }
                      }
                    }}
                    id="actions-button"
                    className="w-full rounded-sm font-medium px-2 py-[6px] gap-x-2 cursor-pointer bg-transparent border border-secondary-400 inline-flex flex-row items-end"
                  >
                    <i className="fa-solid fa-circle-play"></i>
                    <span className="text-xs">Action</span>
                    <i className="fa-solid fa-angle-down text-xs actions-angle-down"></i>
                  </button>
                  <ul
                    id="actions-dropdown"
                    className="absolute z-30 w-[130%] text-xs text-gray-600 font-medium bg-white rounded-md shadow-sm shadow-white flex-col hide hidden"
                  >
                    {[
                      "Mark As Read",
                      "Mark As Unread",
                      "Save Messages",
                      "Remove",
                    ].map((action: string, i: number) => (
                      <div key={i}>
                        <li
                          onClick={async (e) => {
                            let downAngle = e.currentTarget.querySelector(
                              "i.actions-angle-down"
                            );
                            let actionsDropdown = document.getElementById(
                              "actions-dropdown"
                            );
                            const subjectCheck = document.getElementById(
                              "all"
                            ) as HTMLInputElement;
                            const emailItemChecks = document.querySelectorAll(
                              "#single"
                            ) as NodeListOf<HTMLInputElement>;
                            const emailItems = document.querySelectorAll(
                              "#email-item"
                            ) as NodeListOf<HTMLDivElement>;
                            const newEmailItems = Array.from(emailItems);
                            const newEmailItemChecks = Array.from(
                              emailItemChecks
                            );
                            //clearing email checks
                            newEmailItemChecks.forEach(
                              (itemCheck) => (itemCheck.checked = false)
                            );

                            subjectCheck.checked = true;

                            for (let i = 0; i < newEmailItems.length; i++) {
                              try {
                                if (action === "Remove") {
                                  setEnquiries((prevEnqs) =>
                                    prevEnqs.filter(
                                      (prevEnq) =>
                                        prevEnq.id.toString() !==
                                        newEmailItems[i]!.dataset.enqId
                                    )
                                  );
                                  await axios.delete(
                                    `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/enquiries/delete/${
                                      newEmailItems[i]!.dataset.enqId
                                    }`,
                                    {
                                      withCredentials: true,
                                      headers: {
                                        "x-csrf-token": csrf,
                                      },
                                    }
                                  );
                                } else {
                                  if (action === "Mark As Read") {
                                    if (
                                      newEmailItems[i]!.dataset.read === "false"
                                    ) {
                                      newEmailItems[i]!.classList.add(
                                        "bg-primary-500"
                                      );

                                      newEmailItemChecks[i]!.checked = true;

                                      setEnquiries((prevEnqs) => {
                                        const updatedEnqs = [...prevEnqs];
                                        const extractedIndex = updatedEnqs.findIndex(
                                          (enq) =>
                                            enq.id.toString() ===
                                            newEmailItems[i]!.dataset.enqId
                                        );
                                        let updatedEnq =
                                          updatedEnqs[extractedIndex];

                                        updatedEnqs[extractedIndex] = {
                                          ...updatedEnq,
                                          order: {
                                            ...updatedEnq.order,
                                            read:
                                              newEmailItems[i]!.dataset
                                                .hasOrder === "true",
                                          },
                                          contact: {
                                            ...updatedEnq.contact,
                                            read:
                                              newEmailItems[i]!.dataset
                                                .hasContact === "true",
                                          },
                                        };
                                        return updatedEnqs;
                                      });

                                      await axios.patch(
                                        `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/enquiries/update/${
                                          newEmailItems[i]!.dataset.enqId
                                        }`,
                                        {
                                          isRead: true,
                                          isUnRead: false,
                                          isBooking:
                                            newEmailItems[i]!.dataset
                                              .hasOrder === "true",
                                          isContact:
                                            newEmailItems[i]!.dataset
                                              .hasContact === "true",
                                        },
                                        {
                                          withCredentials: true,
                                          headers: {
                                            "x-csrf-token": csrf,
                                          },
                                        }
                                      );
                                    }
                                  }
                                  if (action === "Mark As Unread") {
                                    if (
                                      newEmailItems[i]!.dataset.unread ===
                                      "false"
                                    ) {
                                      newEmailItems[i]!.classList.remove(
                                        "bg-primary-500"
                                      );

                                      newEmailItemChecks[i]!.checked = true;

                                      setEnquiries((prevEnqs) => {
                                        const updatedEnqs = [...prevEnqs];
                                        const extractedIndex = updatedEnqs.findIndex(
                                          (enq) =>
                                            enq.id.toString() ===
                                            newEmailItems[i]!.dataset.enqId
                                        );
                                        let updatedEnq =
                                          updatedEnqs[extractedIndex];

                                        updatedEnqs[extractedIndex] = {
                                          ...updatedEnq,
                                          order: {
                                            ...updatedEnq.order,
                                            unRead:
                                              newEmailItems[i]!.dataset
                                                .hasOrder === "true",
                                          },
                                          contact: {
                                            ...updatedEnq.contact,
                                            unRead:
                                              newEmailItems[i]!.dataset
                                                .hasContact === "true",
                                          },
                                        };
                                        return updatedEnqs;
                                      });

                                      await axios.patch(
                                        `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/enquiries/update/${
                                          newEmailItems[i]!.dataset.enqId
                                        }`,
                                        {
                                          isRead: false,
                                          isUnRead: true,
                                          isBooking:
                                            newEmailItems[i]!.dataset
                                              .hasOrder === "true",
                                          isContact:
                                            newEmailItems[i]!.dataset
                                              .hasContact === "true",
                                        },
                                        {
                                          withCredentials: true,
                                          headers: {
                                            "x-csrf-token": csrf,
                                          },
                                        }
                                      );
                                    }
                                  }
                                }
                              } catch (error) {
                                const e = error as Error;
                                toast.error(e.message);
                              }
                            }

                            if (downAngle && actionsDropdown) {
                              if (!downAngle.classList.contains("ad-rotate")) {
                                downAngle.classList.add("ad-rotate");
                                downAngle.classList.remove(
                                  "ad-rotate-anticlock"
                                );
                                actionsDropdown.classList.remove(
                                  "hide",
                                  "hidden"
                                );
                                actionsDropdown.classList.add("show");
                              } else {
                                downAngle.classList.remove("ad-rotate");
                                downAngle.classList.add("ad-rotate-anticlock");
                                actionsDropdown.classList.add("hide", "hidden");
                                actionsDropdown.classList.remove("show");
                              }
                            }
                          }}
                          className="cursor-pointer flex flex-row items-center justify-between p-2"
                        >
                          {action}
                        </li>
                        {action !== "Remove" && (
                          <hr className="border-secondary-400" />
                        )}
                      </div>
                    ))}
                  </ul>
                </div>
                <div className="lg:inline-block lg:max-w-[15%] hidden relative">
                  <button
                    onClick={(e) => {
                      let downAngle = e.currentTarget.querySelector(
                        "i.calendar-angle-down"
                      );
                      let calendarDropdown = document.getElementById(
                        "calendar-dropdown"
                      );
                      let actionsAngleDown = document.querySelector(
                        "i.actions-angle-down"
                      );
                      let dropdowns = document.querySelectorAll(
                        "[id$=-dropdown]:not(#calendar-dropdown)"
                      );
                      let filterAngleDown = document.querySelector(
                        "i.filter-angle-down"
                      );
                      let activeActionAngleDown = document.querySelector(
                        "i.active-action-angle-down"
                      );

                      if (actionsAngleDown?.classList.contains("ad-rotate")) {
                        actionsAngleDown?.classList.remove("ad-rotate");
                        actionsAngleDown?.classList.add("ad-rotate-anticlock");
                      }
                      if (filterAngleDown?.classList.contains("ad-rotate")) {
                        filterAngleDown?.classList.remove("ad-rotate");
                        filterAngleDown?.classList.add("ad-rotate-anticlock");
                      }
                      if (
                        activeActionAngleDown?.classList.contains("ad-rotate")
                      ) {
                        activeActionAngleDown?.classList.remove("ad-rotate");
                        activeActionAngleDown?.classList.add(
                          "ad-rotate-anticlock"
                        );
                      }

                      dropdowns.forEach((dropdown) => {
                        if (dropdown.classList.contains("show")) {
                          dropdown.classList.add("hide", "hidden");
                          dropdown.classList.remove("show");
                        }
                      });

                      if (downAngle && calendarDropdown) {
                        if (!downAngle.classList.contains("ad-rotate")) {
                          downAngle.classList.add("ad-rotate");
                          downAngle.classList.remove("ad-rotate-anticlock");
                          calendarDropdown.classList.remove("hide", "hidden");
                          calendarDropdown.classList.add("show");
                        } else {
                          downAngle.classList.remove("ad-rotate");
                          downAngle.classList.add("ad-rotate-anticlock");
                          calendarDropdown.classList.add("hide", "hidden");
                          calendarDropdown.classList.remove("show");
                        }
                      }
                    }}
                    className="w-full rounded-sm font-medium px-2 py-[7px] gap-x-2 cursor-pointer bg-transparent border border-secondary-400 inline-flex flex-row items-end"
                  >
                    <i className="fa-regular fa-calendar-days"></i>
                    <i className="fa-solid fa-angle-down text-xs calendar-angle-down"></i>
                  </button>
                  <div
                    className="hide hidden absolute z-30 flex-col gap-y-3 pt-5 pb-4 px-3 h-fit w-[1100%] bg-white rounded-md"
                    id="calendar-dropdown"
                  >
                    <div className="flex flex-row gap-x-2 mb-2 items-center">
                      <span>From</span>
                      <div className="relative">
                        <input
                          type="text"
                          value={startDate}
                          onChange={(e) => {
                            //extracting date data from input
                            let extractedDate, extractedYear;
                            let extractedMonth = 0;

                            //validtion check to keep spaces between date string
                            if (e.target.value.split(" ").length <= 2) {
                              e.target.value = startDate;
                              return;
                            }

                            extractedDate = parseInt(
                              e.target.value.split(" ")[0]!
                            );

                            //validation check to prevent characters from being used
                            if (isNaN(extractedDate) || extractedDate < 1) {
                              e.target.value = startDate;
                              return;
                            }
                            for (let i = 0; i < months.length; i++) {
                              if (months[i] === e.target.value.split(" ")[1]) {
                                extractedMonth = i;
                              }
                            }
                            extractedYear = parseInt(
                              e.target.value.split(" ")[2]!
                            );
                            //validation check to prevent characters from being used or wrong year format
                            if (isNaN(extractedYear)) {
                              e.target.value = startDate;
                              return;
                            }

                            const timeDiff =
                              new Date(
                                currentYear,
                                currentMonth + 1,
                                currentDate
                              ).getTime() -
                              new Date(
                                extractedYear,
                                extractedMonth! + 1,
                                extractedDate
                              ).getTime();
                            //validation check
                            if (timeDiff < 86400000) {
                              e.target.value = startDate;
                              alert(
                                "start date has to be at least 1 day apart from end date"
                              );
                              return;
                            }
                            //binding value to change event
                            setStartDate(e.target.value);
                            //setting start value of calendar component
                            setStartValue(new Date(e.target.value));
                          }}
                          id="start-date"
                          placeholder="1 Jan 1960"
                          className="peer rounded-md placeholder:text-xs focus:outline-secondary-400 p-2 text-xs focus:ring-1  border border-gray-400 focus:border-secondary-400 w-28"
                        />
                        <label className="text-xs font-bold absolute peer-focus:text-secondary-400 top-[-6px] left-[10px] bg-white px-[5px] text-gray-400 ">
                          Start date
                        </label>
                      </div>
                      <span>To</span>
                      <div className="relative">
                        <input
                          onChange={(e) => {
                            //extracting date data from input
                            let extractedStartDate,
                              extractedStartYear,
                              extractedEndDate,
                              extractedEndYear;
                            let extractedEndMonth = 0;
                            let extractedStartMonth = 0;

                            //validtion check to keep spaces between date string
                            if (e.target.value.split(" ").length <= 2) {
                              e.target.value = endDate;
                              return;
                            }

                            extractedStartDate = parseInt(
                              calendarStart.split(" ")[0]!
                            );
                            for (let i = 0; i < months.length; i++) {
                              if (months[i] === calendarStart.split(" ")[1]) {
                                extractedStartMonth = i;
                              }
                            }
                            extractedStartYear = parseInt(
                              calendarStart.split(" ")[2]!
                            );

                            extractedEndDate = parseInt(
                              e.target.value.split(" ")[0]!
                            );
                            //validation check to prevent characters from being used
                            if (
                              isNaN(extractedEndDate) ||
                              extractedEndDate < 1
                            ) {
                              e.target.value = endDate;
                              return;
                            }

                            for (let i = 0; i < months.length; i++) {
                              if (months[i] === e.target.value.split(" ")[1]) {
                                extractedEndMonth = i;
                              }
                            }
                            extractedEndYear = parseInt(
                              e.target.value.split(" ")[2]!
                            );
                            //validation check to prevent characters from being used or wrong year format
                            if (isNaN(extractedEndYear)) {
                              e.target.value = endDate;
                              return;
                            }

                            const currentTime =
                              new Date(
                                extractedEndYear,
                                extractedEndMonth + 1,
                                extractedEndDate
                              ).getTime() - new Date().getTime();

                            //validation check to prevent user from inputing an end date greater than current time
                            if (currentTime > 0) {
                              e.target.value = endDate;
                              alert(
                                "end date cannot be greater than current date"
                              );
                              return;
                            } else if (currentTime < 0) {
                              e.target.value = endDate;
                              alert(
                                "end date cannot be less than current date"
                              );

                              return;
                            }
                            const timeDiff =
                              new Date(
                                extractedEndYear,
                                extractedEndMonth + 1,
                                extractedEndDate
                              ).getTime() -
                              new Date(
                                extractedStartYear,
                                extractedStartMonth + 1,
                                extractedStartDate
                              ).getTime();

                            //validation check
                            if (timeDiff < 86400000) {
                              e.target.value = endDate;
                              alert(
                                "start date has to be at least 1 day apart from end date"
                              );
                              return;
                            }
                            //binding value to change event
                            setEndDate(e.target.value);
                            //setting end value of calendar component
                            setEndValue(new Date(e.target.value));
                          }}
                          type="text"
                          id="end-date"
                          value={endDate}
                          placeholder="1 Jan 1960"
                          className="peer rounded-md placeholder:text-xs focus:outline-secondary-400 p-2 text-xs focus:ring-1  border border-gray-400 focus:border-secondary-400 w-28"
                        />
                        <label className="text-xs font-bold absolute peer-focus:text-secondary-400 top-[-6px] left-[10px] bg-white px-[5px] text-gray-400">
                          End date
                        </label>
                      </div>
                      <div className="inline-flex flex-row gap-x-4 justify-center px-2">
                        <button
                          onClick={() => {
                            let downAngle = document.querySelector(
                              "i.calendar-angle-down"
                            );
                            let calendarDropdown = document.getElementById(
                              "calendar-dropdown"
                            );

                            setEnquiries((prevEnqs) => {
                              let newEnqs = [...prevEnqs];
                              newEnqs = newEnqs.filter(
                                (enq) =>
                                  new Date(enq.createdAt).getTime() >=
                                    new Date(startDate).getTime() &&
                                  new Date(enq.createdAt).getTime() <=
                                    new Date(endDate).getTime()
                              );
                              return newEnqs;
                            });

                            if (downAngle && calendarDropdown) {
                              if (!downAngle.classList.contains("ad-rotate")) {
                                downAngle.classList.add("ad-rotate");
                                downAngle.classList.remove(
                                  "ad-rotate-anticlock"
                                );
                                calendarDropdown.classList.remove(
                                  "hide",
                                  "hidden"
                                );
                                calendarDropdown.classList.add("show");
                              } else {
                                downAngle.classList.remove("ad-rotate");
                                downAngle.classList.add("ad-rotate-anticlock");
                                calendarDropdown.classList.add(
                                  "hide",
                                  "hidden"
                                );
                                calendarDropdown.classList.remove("show");
                              }
                            }
                          }}
                          className="bg-accent text-white px-3 py-2 rounded-md hover:ring-1 hover:ring-accent"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => {
                            //resetting calendar and enquiries
                            setStartDate(
                              `${
                                currentDate - 29 <= 0
                                  ? new Date(
                                      currentDate - 29 <= 0 &&
                                      currentMonth === 0
                                        ? currentYear - 1
                                        : currentYear,
                                      currentDate - 29 <= 0 &&
                                      currentMonth === 0
                                        ? 8
                                        : currentMonth - 4,
                                      0
                                    ).getDate() - Math.abs(currentDate - 29)
                                  : currentDate - 29
                              } ${
                                currentDate - 29 <= 0
                                  ? currentMonth === 0
                                    ? months[7]
                                    : months[currentMonth - 5]
                                  : months[currentMonth - 4]
                              } ${
                                currentDate - 29 <= 0 && currentMonth === 0
                                  ? currentYear - 1
                                  : currentYear
                              }`
                            );
                            //setting start value of calStartar component
                            setStartValue(
                              new Date(
                                `${
                                  currentDate - 29 <= 0
                                    ? new Date(
                                        currentDate - 29 <= 0 &&
                                        currentMonth === 0
                                          ? currentYear - 1
                                          : currentYear,
                                        currentDate - 29 <= 0 &&
                                        currentMonth === 0
                                          ? 8
                                          : currentMonth - 4,
                                        0
                                      ).getDate() - Math.abs(currentDate - 29)
                                    : currentDate - 29
                                } ${
                                  currentDate - 29 <= 0
                                    ? currentMonth === 0
                                      ? months[7]
                                      : months[currentMonth - 5]
                                    : months[currentMonth - 4]
                                } ${
                                  currentDate - 29 <= 0 && currentMonth === 0
                                    ? currentYear - 1
                                    : currentYear
                                }`
                              )
                            );

                            setEndDate(
                              `${new Date().getDate()} ${
                                months[currentMonth]
                              } ${new Date().getFullYear()}`
                            );
                            //setting end value of calendar component
                            setEndValue(
                              new Date(
                                `${new Date().getDate()} ${
                                  months[currentMonth]
                                } ${new Date().getFullYear()}`
                              )
                            );

                            setEnquiries(enquiriesData.enquiries);
                          }}
                          className="text-accent bg-transparen"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-row gap-x-4 w-full">
                      <Calendar
                        onChange={(val, e) => {
                          let date =
                            val!.toString().split(" ")[2]!.split("")[0] === "0"
                              ? val!.toString().split(" ")[2]!.slice(-1)
                              : val!.toString().split(" ")[2]!;
                          let month = val!.toString().split(" ")[1];
                          let year = val!.toString().split(" ")[3];
                          setStartDate(`${date} ${month} ${year}`);

                          setStartValue(val);
                        }}
                        value={startValue}
                        maxDate={
                          new Date(
                            new Date().getTime() +
                              Math.abs(new Date().getTimezoneOffset()) *
                                60 *
                                1000 -
                              3600000
                          )
                        }
                      />
                      <Calendar
                        onChange={(val, e) => {
                          let date =
                            val!.toString().split(" ")[2]!.split("")[0] === "0"
                              ? val!.toString().split(" ")[2]!.slice(-1)
                              : val!.toString().split(" ")[2]!;
                          let month = val!.toString().split(" ")[1];
                          let year = val!.toString().split(" ")[3];
                          setEndDate(`${date} ${month} ${year}`);
                          setEndValue(val);
                        }}
                        value={endValue}
                        maxDate={
                          new Date(
                            new Date().getTime() +
                              Math.abs(new Date().getTimezoneOffset()) *
                                60 *
                                1000
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="lg:inline-block lg:max-w-[27%] hidden relative">
                  <button
                    onClick={(e) => {
                      let downAngle = e.currentTarget.querySelector(
                        "i.filter-angle-down"
                      );
                      let filterDropdown = document.getElementById(
                        "filter-dropdown"
                      );
                      let dropdowns = document.querySelectorAll(
                        "[id$=-dropdown]:not(#filter-dropdown)"
                      );
                      let calendarAngleDown = document.querySelector(
                        "i.calendar-angle-down"
                      );
                      let actionsAngleDown = document.querySelector(
                        "i.actions-angle-down"
                      );
                      let activeActionAngleDown = document.querySelector(
                        "i.active-action-angle-down"
                      );

                      if (calendarAngleDown?.classList.contains("ad-rotate")) {
                        calendarAngleDown?.classList.remove("ad-rotate");
                        calendarAngleDown?.classList.add("ad-rotate-anticlock");
                      }
                      if (actionsAngleDown?.classList.contains("ad-rotate")) {
                        actionsAngleDown?.classList.remove("ad-rotate");
                        actionsAngleDown?.classList.add("ad-rotate-anticlock");
                      }
                      if (
                        activeActionAngleDown?.classList.contains("ad-rotate")
                      ) {
                        activeActionAngleDown?.classList.remove("ad-rotate");
                        activeActionAngleDown?.classList.add(
                          "ad-rotate-anticlock"
                        );
                      }

                      dropdowns.forEach((dropdown) => {
                        if (dropdown.classList.contains("show")) {
                          dropdown.classList.add("hide", "hidden");
                          dropdown.classList.remove("show");
                        }
                      });

                      if (downAngle && filterDropdown) {
                        if (!downAngle.classList.contains("ad-rotate")) {
                          downAngle.classList.add("ad-rotate");
                          downAngle.classList.remove("ad-rotate-anticlock");
                          filterDropdown.classList.remove("hide", "hidden");
                          filterDropdown.classList.add("show");
                        } else {
                          downAngle.classList.remove("ad-rotate");
                          downAngle.classList.add("ad-rotate-anticlock");
                          filterDropdown.classList.add("hide", "hidden");
                          filterDropdown.classList.remove("show");
                        }
                      }
                    }}
                    id="filter-button"
                    className="w-full rounded-sm font-medium px-2 py-[6px] gap-x-2 cursor-pointer bg-transparent border border-secondary-400 inline-flex flex-row items-end"
                  >
                    <i className="fa-solid fa-filter"></i>
                    <span className="text-xs">Filter</span>
                    <i className="fa-solid fa-angle-down text-xs filter-angle-down"></i>
                  </button>
                  <ul
                    id="filter-dropdown"
                    className="absolute z-30 w-[130%] text-gray-600 font-medium text-xs bg-white pt-3 pb-2 rounded-md shadow-sm shadow-white flex-col hide hidden"
                  >
                    <li className="mb-2 pl-4 text-gray-700">State</li>
                    {["Read", "Unread", "Saved"].map(
                      (action: string, i: number) => (
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
                          />
                          <span>{action}</span>
                        </li>
                      )
                    )}
                    <hr className="bg-gray-400 mt-3 h-[2px]" />
                    <div className="inline-flex flex-row gap-x-4 justify-center mt-3 px-2">
                      <button
                        onClick={(e) => {
                          const readFilter = document.querySelector(
                            "#filter-dropdown > li > #Read"
                          ) as HTMLInputElement;
                          const unReadFilter = document.querySelector(
                            "#filter-dropdown > li > #Unread"
                          ) as HTMLInputElement;
                          const savedFilter = document.querySelector(
                            "#filter-dropdown > li > #Saved"
                          ) as HTMLInputElement;

                          if (readFilter.checked) {
                            setEnquiries((prevEnqs) =>
                              prevEnqs.filter(
                                (enq: any) =>
                                  enq.order.read === true ||
                                  enq.contact.read === true
                              )
                            );
                          }

                          if (unReadFilter.checked) {
                            setEnquiries((prevEnqs) =>
                              prevEnqs.filter(
                                (enq: any) =>
                                  enq.order.unRead === true ||
                                  enq.contact.unRead === true
                              )
                            );
                          }

                          if (savedFilter.checked) {
                            setEnquiries((prevEnqs) =>
                              prevEnqs.filter(
                                (enq: any) =>
                                  enq.order.saved === true ||
                                  enq.contact.saved === true
                              )
                            );
                          }
                        }}
                        className="bg-accent text-white px-3 py-2 rounded-md hover:ring-1 hover:ring-accent"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => {
                          setEnquiries(enquiriesData.enquiries);
                        }}
                        className="text-accent bg-transparen"
                      >
                        Clear
                      </button>
                    </div>
                  </ul>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    let item = e.currentTarget;
                    const inputValue = item.search.value;

                    setEnquiries((prevEnqs) =>
                      prevEnqs.filter(
                        (enq: any) =>
                          enq.order.content.includes(inputValue) ||
                          enq.contact.subject.includes(inputValue)
                      )
                    );
                  }}
                  className="inline-flex w-[60%] relative flex-row items-center border border-secondary-400 rounded-sm px-2"
                >
                  <input
                    name="search"
                    type="search"
                    className="bg-transparent py-[5px] focus:outline-none w-full placeholder:text-secondary-400"
                    placeholder="search"
                  />
                  <i className="fa-solid fa-magnifying-glass text-secondary-400 cursor-pointer"></i>
                </form>
              </section>
              <hr className="border-secondary-400/30 border -mt-2" />
              <div className="w-full inline-flex flex-row -my-1 text-sm pl-3">
                <div className="md:w-[60%] w-[70%] inline-flex flex-row gap-x-2 items-center">
                  <input
                    type="checkbox"
                    id="all"
                    onChange={(e) => {
                      let msgs = document.querySelectorAll(
                        "[id=single]"
                      ) as NodeListOf<HTMLInputElement>;

                      msgs.forEach((msg) => {
                        if (e.currentTarget.checked) {
                          msg.checked = true;
                        } else {
                          msg.checked = false;
                        }
                      });
                    }}
                    className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-300 rounded-sm relative
                      cursor-pointer outline-none checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                      checked:after:border-accent checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                      checked:after:rotate-45"
                  />
                  <span className="font-medium">Subject</span>
                </div>
                <div className="md:w-[40%] w-[30%] font-medium">Date</div>
              </div>
              <hr className="border-secondary-400/30 border" />
              {enquiries.map((enq: any, i: number) => {
                return (
                  <>
                    <div
                      id="email-item"
                      data-enq-id={enq.id.toString()}
                      data-has-contact={!!enq.contact.message}
                      data-read={
                        !!enq.contact.message
                          ? enq.contact.read
                          : enq.order.read
                      }
                      data-unread={
                        !!enq.contact.message
                          ? enq.contact.unRead
                          : enq.order.unRead
                      }
                      data-has-order={!!enq.order.content}
                      key={i}
                      className={`${
                        enq.contact.read || enq.order.read
                          ? "bg-primary-500"
                          : ""
                      } w-full inline-flex flex-row -my-5 text-sm py-4 items-center pl-3`}
                    >
                      <div className="md:w-[60%] w-[70%] inline-flex flex-row gap-x-2 items-center relative">
                        <input
                          type="checkbox"
                          id="single"
                          className="text-white bg-white appearance-none w-[16px] h-[16px] border border-gray-300 rounded-sm relative
                            cursor-pointer outline-none checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                            checked:after:border-accent checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                            checked:after:rotate-45"
                        />
                        <span className="font-light">
                          <i className="fa-regular fa-envelope-open text-accent/30"></i>
                          &nbsp;&nbsp;
                          {enq.order.content
                            ? `Appointment by ${enq.author.fullName}`
                            : enq.contact.message
                            ? enq.contact.subject
                            : `Testing by ${enq.author.fullName}`}
                        </span>
                        <div className="lg:hidden inline-block w-[40%] absolute left-0 top-10">
                          <div className="w-[156%] rounded-sm font-medium bg-transparent inline-flex flex-row items-center">
                            <button
                              className="text-xs border-secondary-400 border px-2 py-[6px] hover:ring-1 hover:ring-secondary-400"
                              onClick={async () => {
                                let activeActionAngleDown = document.querySelector(
                                  "i.active-action-angle-down-for-sm-screen"
                                );
                                let dropdown = document.getElementById(
                                  "active-action-dropdown-for-sm-screen"
                                );
                                document
                                  .getElementById("email-item")
                                  ?.classList.add("bg-primary-500");

                                if (
                                  activeActionAngleDown?.classList.contains(
                                    "ad-rotate"
                                  )
                                ) {
                                  activeActionAngleDown?.classList.remove(
                                    "ad-rotate"
                                  );
                                  activeActionAngleDown?.classList.add(
                                    "ad-rotate-anticlock"
                                  );
                                }

                                if (dropdown?.classList.contains("show")) {
                                  dropdown?.classList.add("hide", "hidden");
                                  dropdown?.classList.remove("show");
                                }

                                setIsAdminSettingsOpen(true);
                                setIsReading(true);
                                setIsReplying(false);

                                setEnquiries((prevEnqs) => {
                                  const updatedEnqs = [...prevEnqs];
                                  const extractedIndex = updatedEnqs.findIndex(
                                    (updatedEnq) =>
                                      updatedEnq.id.toString() ===
                                      enq.id.toString()
                                  );
                                  let updatedEnq = updatedEnqs[extractedIndex];

                                  updatedEnqs[extractedIndex] = {
                                    ...updatedEnq,
                                    order: {
                                      ...updatedEnq.order,
                                      read: !!enq.order.content,
                                    },
                                    contact: {
                                      ...updatedEnq.contact,
                                      read: !!enq.contact.message,
                                    },
                                  };
                                  return updatedEnqs;
                                });

                                try {
                                  await axios.patch(
                                    `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/enquiries/update/${enq.id.toString()}`,
                                    {
                                      isRead: true,
                                      isUnRead: false,
                                      isBooking: !!enq.order.content,
                                      isContact: !!enq.contact.message,
                                    },
                                    {
                                      withCredentials: true,
                                      headers: {
                                        "x-csrf-token": csrf,
                                      },
                                    }
                                  );
                                } catch (error) {
                                  const e = error as Error;
                                  toast.error(e.message);
                                }
                              }}
                            >
                              READ MESSAGE
                            </button>
                            <div
                              className="px-2 py-[4px] border border-secondary-400"
                              onClick={(e) => {
                                let downAngle = e.currentTarget.querySelector(
                                  "i.active-action-angle-down-for-sm-screen"
                                );
                                let activeActionDropdown = document.getElementById(
                                  "active-action-dropdown-for-sm-screen"
                                );

                                if (downAngle && activeActionDropdown) {
                                  if (
                                    !downAngle.classList.contains("ad-rotate")
                                  ) {
                                    downAngle.classList.add("ad-rotate");
                                    downAngle.classList.remove(
                                      "ad-rotate-anticlock"
                                    );
                                    activeActionDropdown.classList.remove(
                                      "hide",
                                      "hidden"
                                    );
                                    activeActionDropdown.classList.add("show");
                                  } else {
                                    downAngle.classList.remove("ad-rotate");
                                    downAngle.classList.add(
                                      "ad-rotate-anticlock"
                                    );
                                    activeActionDropdown.classList.add(
                                      "hide",
                                      "hidden"
                                    );
                                    activeActionDropdown.classList.remove(
                                      "show"
                                    );
                                  }
                                }
                              }}
                            >
                              <i className="fa-solid fa-angle-down text-xs active-action-angle-down-for-sm-screen cursor-pointer"></i>
                            </div>
                          </div>
                          <ul
                            id="active-action-dropdown-for-sm-screen"
                            className="absolute z-30 w-[132%] text-xs bg-white rounded-md text-gray-600 font-medium shadow-sm shadow-white flex-col hide hidden"
                          >
                            {["Reply", "Unread", "Save Message", "Remove"].map(
                              (action: string, i: number) => (
                                <div key={i}>
                                  <li
                                    onClick={async (e) => {
                                      let activeActionAngleDown = document.querySelector(
                                        "i.active-action-angle-down-for-sm-screen"
                                      );
                                      let dropdowns = document.querySelectorAll(
                                        "[id$=-dropdown]:not(#active-action-dropdown-for-sm-screen)"
                                      );

                                      if (
                                        activeActionAngleDown?.classList.contains(
                                          "ad-rotate"
                                        )
                                      ) {
                                        activeActionAngleDown?.classList.remove(
                                          "ad-rotate"
                                        );
                                        activeActionAngleDown?.classList.add(
                                          "ad-rotate-anticlock"
                                        );
                                      }

                                      dropdowns.forEach((dropdown) => {
                                        if (
                                          dropdown.classList.contains("show")
                                        ) {
                                          dropdown.classList.add(
                                            "hide",
                                            "hidden"
                                          );
                                          dropdown.classList.remove("show");
                                        }
                                      });

                                      switch (action) {
                                        case "Reply":
                                          setIsAdminSettingsOpen(true);
                                          setIsReplying(true);
                                          setIsReading(false);
                                          break;

                                        case "Unread":
                                          document
                                            .getElementById("email-item")
                                            ?.classList.remove(
                                              "bg-primary-500"
                                            );

                                          setEnquiries((prevEnqs) => {
                                            const updatedEnqs = [...prevEnqs];
                                            const extractedIndex = updatedEnqs.findIndex(
                                              (updatedEnq) =>
                                                updatedEnq.id.toString() ===
                                                enq.id.toString()
                                            );
                                            let updatedEnq =
                                              updatedEnqs[extractedIndex];

                                            updatedEnqs[extractedIndex] = {
                                              ...updatedEnq,
                                              order: {
                                                ...updatedEnq.order,
                                                unRead: !!enq.order.content,
                                              },
                                              contact: {
                                                ...updatedEnq.contact,
                                                unRead: !!enq.contact.message,
                                              },
                                            };
                                            return updatedEnqs;
                                          });

                                          try {
                                            await axios.patch(
                                              `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/enquiries/update/${enq.id.toString()}`,
                                              {
                                                isRead: false,
                                                isUnRead: true,
                                                isBooking: !!enq.order.content,
                                                isContact: !!enq.contact
                                                  .message,
                                              },
                                              {
                                                withCredentials: true,
                                                headers: {
                                                  "x-csrf-token": csrf,
                                                },
                                              }
                                            );
                                          } catch (error) {
                                            const e = error as Error;
                                            toast.error(e.message);
                                          }
                                          break;
                                        case "Remove":
                                          try {
                                            setEnquiries((prevEnqs) =>
                                              prevEnqs.filter(
                                                (prevEnq) =>
                                                  prevEnq.id.toString() !==
                                                  enq.id.toString()
                                              )
                                            );
                                            await axios.delete(
                                              `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/enquiries/delete/${enq.id.toString()}`,
                                              {
                                                withCredentials: true,
                                                headers: {
                                                  "x-csrf-token": csrf,
                                                },
                                              }
                                            );
                                          } catch (error) {
                                            const e = error as Error;
                                            toast.error(e.message);
                                          }
                                        default:
                                          break;
                                      }
                                    }}
                                    className="cursor-pointer flex flex-row items-center justify-between p-2"
                                  >
                                    {action}
                                  </li>
                                  {action !== "Remove" && (
                                    <hr className="border-secondary-400" />
                                  )}
                                </div>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="md:w-[40%] w-[30%] font-light relative flex flex-row items-center">
                        <span>{`${
                          months[new Date(enq.createdAt).getMonth()]
                        } ${new Date(enq.createdAt).getDate()}, ${new Date(
                          enq.createdAt
                        ).getFullYear()}`}</span>
                        <div className="lg:inline-block max-w-[33%] absolute md:right-8 xl:right-1 hidden">
                          <div className="w-[156%] rounded-sm font-medium bg-transparent inline-flex flex-row items-center">
                            <button
                              className="text-xs border-secondary-400 border px-2 py-[6px] hover:ring-1 hover:ring-secondary-400"
                              onClick={async () => {
                                let activeActionAngleDown = document.querySelector(
                                  "i.active-action-angle-down"
                                );
                                let calendarAngleDown = document.querySelector(
                                  "i.calendar-angle-down"
                                );
                                let actionsAngleDown = document.querySelector(
                                  "i.actions-angle-down"
                                );
                                let filterAngleDown = document.querySelector(
                                  "i.filter-angle-down"
                                );
                                let dropdowns = document.querySelectorAll(
                                  "[id$=-dropdown]"
                                );
                                document
                                  .getElementById("email-item")
                                  ?.classList.add("bg-primary-500");

                                if (
                                  calendarAngleDown?.classList.contains(
                                    "ad-rotate"
                                  )
                                ) {
                                  calendarAngleDown?.classList.remove(
                                    "ad-rotate"
                                  );
                                  calendarAngleDown?.classList.add(
                                    "ad-rotate-anticlock"
                                  );
                                }
                                if (
                                  filterAngleDown?.classList.contains(
                                    "ad-rotate"
                                  )
                                ) {
                                  filterAngleDown?.classList.remove(
                                    "ad-rotate"
                                  );
                                  filterAngleDown?.classList.add(
                                    "ad-rotate-anticlock"
                                  );
                                }
                                if (
                                  actionsAngleDown?.classList.contains(
                                    "ad-rotate"
                                  )
                                ) {
                                  actionsAngleDown?.classList.remove(
                                    "ad-rotate"
                                  );
                                  actionsAngleDown?.classList.add(
                                    "ad-rotate-anticlock"
                                  );
                                }
                                if (
                                  activeActionAngleDown?.classList.contains(
                                    "ad-rotate"
                                  )
                                ) {
                                  activeActionAngleDown?.classList.remove(
                                    "ad-rotate"
                                  );
                                  activeActionAngleDown?.classList.add(
                                    "ad-rotate-anticlock"
                                  );
                                }

                                dropdowns.forEach((dropdown) => {
                                  if (dropdown.classList.contains("show")) {
                                    dropdown.classList.add("hide", "hidden");
                                    dropdown.classList.remove("show");
                                  }
                                });

                                setIsAdminSettingsOpen(true);
                                setIsReading(true);
                                setIsReplying(false);

                                setEnquiries((prevEnqs) => {
                                  const updatedEnqs = [...prevEnqs];
                                  const extractedIndex = updatedEnqs.findIndex(
                                    (updatedEnq) =>
                                      updatedEnq.id.toString() ===
                                      enq.id.toString()
                                  );
                                  let updatedEnq = updatedEnqs[extractedIndex];

                                  updatedEnqs[extractedIndex] = {
                                    ...updatedEnq,
                                    order: {
                                      ...updatedEnq.order,
                                      read: !!enq.order.content,
                                    },
                                    contact: {
                                      ...updatedEnq.contact,
                                      read: !!enq.contact.message,
                                    },
                                  };
                                  return updatedEnqs;
                                });

                                try {
                                  await axios.patch(
                                    `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/enquiries/update/${enq.id.toString()}`,
                                    {
                                      isRead: true,
                                      isUnRead: false,
                                      isBooking: !!enq.order.content,
                                      isContact: !!enq.contact.message,
                                    },
                                    {
                                      withCredentials: true,
                                      headers: {
                                        "x-csrf-token": csrf,
                                      },
                                    }
                                  );
                                } catch (error) {
                                  const e = error as Error;
                                  toast.error(e.message);
                                }
                              }}
                            >
                              READ MESSAGE
                            </button>
                            <div
                              className="px-2 py-[4px] border border-secondary-400 "
                              onClick={(e) => {
                                let downAngle = e.currentTarget.querySelector(
                                  "i.active-action-angle-down"
                                );
                                let activeActionDropdown = document.getElementById(
                                  "active-action-dropdown"
                                );
                                let calendarAngleDown = document.querySelector(
                                  "i.calendar-angle-down"
                                );
                                let actionsAngleDown = document.querySelector(
                                  "i.actions-angle-down"
                                );
                                let filterAngleDown = document.querySelector(
                                  "i.filter-angle-down"
                                );
                                let dropdowns = document.querySelectorAll(
                                  "[id$=-dropdown]:not(#active-action-dropdown)"
                                );

                                if (
                                  calendarAngleDown?.classList.contains(
                                    "ad-rotate"
                                  )
                                ) {
                                  calendarAngleDown?.classList.remove(
                                    "ad-rotate"
                                  );
                                  calendarAngleDown?.classList.add(
                                    "ad-rotate-anticlock"
                                  );
                                }
                                if (
                                  filterAngleDown?.classList.contains(
                                    "ad-rotate"
                                  )
                                ) {
                                  filterAngleDown?.classList.remove(
                                    "ad-rotate"
                                  );
                                  filterAngleDown?.classList.add(
                                    "ad-rotate-anticlock"
                                  );
                                }
                                if (
                                  actionsAngleDown?.classList.contains(
                                    "ad-rotate"
                                  )
                                ) {
                                  actionsAngleDown?.classList.remove(
                                    "ad-rotate"
                                  );
                                  actionsAngleDown?.classList.add(
                                    "ad-rotate-anticlock"
                                  );
                                }

                                dropdowns.forEach((dropdown) => {
                                  if (dropdown.classList.contains("show")) {
                                    dropdown.classList.add("hide", "hidden");
                                    dropdown.classList.remove("show");
                                  }
                                });

                                if (downAngle && activeActionDropdown) {
                                  if (
                                    !downAngle.classList.contains("ad-rotate")
                                  ) {
                                    downAngle.classList.add("ad-rotate");
                                    downAngle.classList.remove(
                                      "ad-rotate-anticlock"
                                    );
                                    activeActionDropdown.classList.remove(
                                      "hide",
                                      "hidden"
                                    );
                                    activeActionDropdown.classList.add("show");
                                  } else {
                                    downAngle.classList.remove("ad-rotate");
                                    downAngle.classList.add(
                                      "ad-rotate-anticlock"
                                    );
                                    activeActionDropdown.classList.add(
                                      "hide",
                                      "hidden"
                                    );
                                    activeActionDropdown.classList.remove(
                                      "show"
                                    );
                                  }
                                }
                              }}
                            >
                              <i className="fa-solid fa-angle-down text-xs active-action-angle-down cursor-pointer"></i>
                            </div>
                          </div>
                          <ul
                            id="active-action-dropdown"
                            className="hide hidden flex-col absolute z-30 w-full text-xs bg-white rounded-md text-gray-600 font-medium shadow-sm shadow-white"
                          >
                            {["Reply", "Unread", "Save Message", "Remove"].map(
                              (action: string, i: number) => (
                                <div key={i}>
                                  <li
                                    onClick={async (e) => {
                                      let activeActionAngleDown = document.querySelector(
                                        "i.active-action-angle-down"
                                      );
                                      let calendarAngleDown = document.querySelector(
                                        "i.calendar-angle-down"
                                      );
                                      let actionsAngleDown = document.querySelector(
                                        "i.actions-angle-down"
                                      );
                                      let filterAngleDown = document.querySelector(
                                        "i.filter-angle-down"
                                      );
                                      let dropdowns = document.querySelectorAll(
                                        "[id$=-dropdown]"
                                      );

                                      if (
                                        calendarAngleDown?.classList.contains(
                                          "ad-rotate"
                                        )
                                      ) {
                                        calendarAngleDown?.classList.remove(
                                          "ad-rotate"
                                        );
                                        calendarAngleDown?.classList.add(
                                          "ad-rotate-anticlock"
                                        );
                                      }
                                      if (
                                        filterAngleDown?.classList.contains(
                                          "ad-rotate"
                                        )
                                      ) {
                                        filterAngleDown?.classList.remove(
                                          "ad-rotate"
                                        );
                                        filterAngleDown?.classList.add(
                                          "ad-rotate-anticlock"
                                        );
                                      }
                                      if (
                                        actionsAngleDown?.classList.contains(
                                          "ad-rotate"
                                        )
                                      ) {
                                        actionsAngleDown?.classList.remove(
                                          "ad-rotate"
                                        );
                                        actionsAngleDown?.classList.add(
                                          "ad-rotate-anticlock"
                                        );
                                      }
                                      if (
                                        activeActionAngleDown?.classList.contains(
                                          "ad-rotate"
                                        )
                                      ) {
                                        activeActionAngleDown?.classList.remove(
                                          "ad-rotate"
                                        );
                                        activeActionAngleDown?.classList.add(
                                          "ad-rotate-anticlock"
                                        );
                                      }

                                      dropdowns.forEach((dropdown) => {
                                        if (
                                          dropdown.classList.contains("show")
                                        ) {
                                          dropdown.classList.add(
                                            "hide",
                                            "hidden"
                                          );
                                          dropdown.classList.remove("show");
                                        }
                                      });

                                      switch (action) {
                                        case "Reply":
                                          setIsAdminSettingsOpen(true);
                                          setIsReplying(true);
                                          setIsReading(false);
                                          break;
                                        case "Unread":
                                          document
                                            .getElementById("email-item")
                                            ?.classList.remove(
                                              "bg-primary-500"
                                            );

                                          setEnquiries((prevEnqs) => {
                                            const updatedEnqs = [...prevEnqs];
                                            const extractedIndex = updatedEnqs.findIndex(
                                              (updatedEnq) =>
                                                updatedEnq.id.toString() ===
                                                enq.id.toString()
                                            );
                                            let updatedEnq =
                                              updatedEnqs[extractedIndex];

                                            updatedEnqs[extractedIndex] = {
                                              ...updatedEnq,
                                              order: {
                                                ...updatedEnq.order,
                                                unRead: !!enq.order.content,
                                              },
                                              contact: {
                                                ...updatedEnq.contact,
                                                unRead: !!enq.contact.message,
                                              },
                                            };
                                            return updatedEnqs;
                                          });

                                          try {
                                            await axios.patch(
                                              `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/enquiries/update/${enq.id.toString()}`,
                                              {
                                                isRead: false,
                                                isUnRead: true,
                                                isBooking: !!enq.order.content,
                                                isContact: !!enq.contact
                                                  .message,
                                              },
                                              {
                                                withCredentials: true,
                                                headers: {
                                                  "x-csrf-token": csrf,
                                                },
                                              }
                                            );
                                          } catch (error) {
                                            const e = error as Error;
                                            toast.error(e.message);
                                          }
                                          break;
                                        case "Remove":
                                          try {
                                            setEnquiries((prevEnqs) =>
                                              prevEnqs.filter(
                                                (prevEnq) =>
                                                  prevEnq.id.toString() !==
                                                  enq.id.toString()
                                              )
                                            );
                                            await axios.delete(
                                              `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/enquiries/delete/${enq.id.toString()}`,
                                              {
                                                withCredentials: true,
                                                headers: {
                                                  "x-csrf-token": csrf,
                                                },
                                              }
                                            );
                                          } catch (error) {
                                            const e = error as Error;
                                            toast.error(e.message);
                                          }

                                        default:
                                          break;
                                      }
                                    }}
                                    className="cursor-pointer flex flex-row items-center justify-between p-2"
                                  >
                                    {action}
                                  </li>
                                  {action !== "Remove" && (
                                    <hr className="border-secondary-400" />
                                  )}
                                </div>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                    {isAdminSettingsOpen && pathName === "emails" && (
                      <AdminSettingsModal
                        onClose={hideAdminSettingsModalHandler}
                        left="20rem"
                        width="40rem"
                        classes="h-fit bg-white"
                      >
                        <section className="flex flex-col items-start gap-x-2 w-full h-full px-5 pb-6 pt-16 font-sans gap-y-9">
                          <header className="text-sm flex md:flex-row flex-col items-start md:justify-between md:items-center w-full">
                            <h2>
                              From:&nbsp;
                              <span className="font-normal">
                                {isReading
                                  ? enq.author.email
                                  : "hello@oyinye.com"}
                              </span>
                            </h2>
                            <h2>{`${
                              months[
                                new Date(
                                  isReading ? enq.createdAt : new Date()
                                ).getMonth()
                              ]
                            } ${new Date(
                              isReading ? enq.createdAt : new Date()
                            ).getDate()}, ${new Date(
                              isReading ? enq.createdAt : new Date()
                            ).getFullYear()}, ${new Date(
                              new Date(
                                isReading ? enq.createdAt : new Date()
                              ).getTime() +
                                Math.abs(new Date().getTimezoneOffset()) *
                                  60 *
                                  1000
                            )
                              .toISOString()
                              .substring(11, 16)}${
                              new Date(
                                isReading ? enq.createdAt : new Date()
                              ).getHours() >= 11
                                ? "PM"
                                : "AM"
                            }`}</h2>
                          </header>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              let adminContent = document.getElementById(
                                "admin-letter"
                              ) as HTMLTextAreaElement;
                              if (
                                adminContent &&
                                adminContent.value.length === 0
                              ) {
                                return;
                              }
                              try {
                                setLoader(true);
                                const res = await axios.post(
                                  `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/enquiries/send-reminder`,
                                  {
                                    email: enq.author.email,
                                    message: adminContent.value,
                                    contact: enq.author.fullName,
                                    date: `${
                                      months[
                                        new Date(
                                          isReading ? enq.createdAt : new Date()
                                        ).getMonth()
                                      ]
                                    } ${new Date(
                                      isReading ? enq.createdAt : new Date()
                                    ).getDate()}. ${new Date(
                                      isReading ? enq.createdAt : new Date()
                                    ).getFullYear()}`,
                                  },
                                  {
                                    withCredentials: true,
                                    headers: {
                                      "x-csrf-token": csrf,
                                    },
                                  }
                                );

                                 if (res.status != 201) {
                                  throw new Error(res.data.message);
                                }
                              } catch (error) {
                                const e = error as Error;
                                setLoader(false);
                                return toast.error(e.message);
                              } finally {
                                setLoader(false);
                                adminContent.value = "";
                                toast.success("reminder sent", {
                                  position: "top-center",
                                });
                              }
                            }}
                            className="flex flex-col items-start gap-y-4 text-gray-600 font-sans w-full"
                          >
                            <p className="leading-tight tracking-wider text-sm font-medium cursive">
                              Hi{" "}
                              {isReading
                                ? "Oyinye Couture team"
                                : enq.author.full_name}
                              ,
                            </p>

                            {isReading ? (
                              <p className="text-base leading-relaxed text-wrap tracking-wider text-gray-500 w-full">
                                {enq.order.content
                                  ? enq.order.content
                                  : enq.contact.message
                                  ? enq.contact.message
                                  : "I am writing to inform you."}
                              </p>
                            ) : (
                              <textarea
                                cols={50}
                                rows={5}
                                placeholder="Compose letter here..."
                                id="admin-letter"
                                className="focus:outline-none w-full border border-gray-300 rounded-md p-2 text-base leading-relaxed text-wrap tracking-wider text-gray-500"
                              ></textarea>
                            )}
                            {isReading ? (
                              <p className="leading-tight tracking-wider text-sm font-medium cursive">
                                Best Regards,
                                <br />
                                {enq.author.fullName}
                                <br />
                                {enq.order.content && (
                                  <span>
                                    Phone:&nbsp;
                                    <Link
                                      href={`tel:${
                                        enq.order.phone ?? "070333748920"
                                      }`}
                                    >
                                      {enq.order.phone ?? "070333748920"}
                                    </Link>
                                    <br />
                                    Standard Size: {enq.order.size ?? 8}
                                    <br />
                                    Date of Event:{" "}
                                    {`${new Date(
                                      enq.order.eventDate
                                    ).getDate()} ${
                                      months[
                                        new Date(enq.order.eventDate).getMonth()
                                      ]
                                    }, ${new Date(
                                      enq.order.eventDate
                                    ).getFullYear()}`}
                                  </span>
                                )}
                              </p>
                            ) : (
                              <p className="leading-tight tracking-wider text-sm font-medium cursive">
                                Best Regards,
                                <br />
                                Oyinye Couture Team
                              </p>
                            )}

                            {isReplying && (
                              <div className="w-full flex justify-end flex-row">
                                <button
                                  type="submit"
                                  className="px-7 py-2 text-sm bg-accent text-white hover:ring-1 hover:ring-accent rounded-md"
                                >
                                  {loader ? "Sending.." : "Send"}
                                </button>
                              </div>
                            )}
                          </form>
                          {enq.order.content &&
                            isReading &&
                            enq.order.styles.length > 0 &&
                            enq.order.styles.map((data: any, i: number) => (
                              <div
                                key={i}
                                className="flex flex-row flex-wrap gap-x-3 gap-y-2 w-full"
                              >
                                <div className="flex flex-col items-center gap-y-1">
                                  <div
                                    className="w-24 h-24 rounded-md"
                                    style={{
                                      backgroundImage: `url(${data.image})`,
                                    }}
                                  ></div>
                                  <p className="font-sans text-xs">
                                    {data.fileName}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </section>
                      </AdminSettingsModal>
                    )}
                  </>
                );
              })}
              <AdminPagination {...enquiriesData} />
            </>
          ) : (
            <section className="flex items-center flex-row w-full md:mt-36 mt-16 justify-center">
              <h1 className="font-sans md:text-xl text-lg text-white">
                No emails available!
              </h1>
            </section>
          )}
        </section>
      )}
      {pathName === "products" && (
        <section className="w-full text-secondary-400 font-sans h-full">
          {extractedProducts.length > 0 ? (
            <>
              <div
                className={`w-full flex md:flex-row flex-col items-center py-4 h-full overflow-y-auto hide-scrollbar justify-evenly flex-wrap gap-x-1 gap-y-4`}
              >
                {extractedProducts.map((product: any, i: number) => (
                  <ProductComponent
                    key={i}
                    imageW={250}
                    imageH={300}
                    handleEdit={() => editProduct(product)}
                    handleDelete={() => deleteProduct(product.id)}
                    product={product}
                    isAdmin={true}
                    isSearchProduct
                    csrf={csrf}
                  />
                ))}
              </div>
              <AdminPagination {...searchData} />
            </>
          ) : (
            <div className="flex items-center flex-row w-full md:mt-36 mt-16 justify-center">
              <h1 className="font-sans md:text-xl text-lg text-white">
                No products found. Try a differnt search parameter!
              </h1>
            </div>
          )}
          {isAdminSettingsOpen && (
            <AdminSettingsModal
              onClose={hideAdminSettingsModalHandler}
              left="20rem"
              width="40rem"
              classes="h-fit bg-white !top-[7vh]"
            >
              <section className="font-sans font-light flex flex-col gap-y-11 text-gray-500 pb-6 pt-16">
                <form
                  onSubmit={(e) =>
                    handleProductEdit(
                      e,
                      frontBase64ImagesObj.current,
                      backBase64ImagesObj.current,
                      desc.edit,
                      type.edit,
                      selectedProduct.current,
                      productObj.current,
                      dressFeatures,
                      visibleImages,
                      isFeature.edit,
                      setLoader,
                      path,
                      searchParams,
                      csrf
                    )
                  }
                  className="flex flex-col gap-y-5 max-h-[75vh] items-center w-full"
                  encType="multipart/form-data"
                >
                  <article
                    className={`flex flex-col gap-y-2 lg:w-[45%] w-[75%] h-fit items-center relative`}
                  >
                    <Swiper
                      modules={[Pagination]}
                      key={JSON.stringify(
                        visibleImages.imagesFront.concat(
                          visibleImages.imagesBack
                        )
                      )}
                      slidesPerView={1}
                      pagination={{
                        clickable: true,
                        el: ".custom-pagination",
                        renderBullet: (index, className) => {
                          return `<span class="${className}" style="background-image: url(${
                            visibleImages.position === "front"
                              ? visibleImages.imagesFront[index]
                              : visibleImages.imagesBack[index]
                          });"></span>`;
                        },
                      }}
                      className="h-36 w-full"
                    >
                      {visibleImages.position === "front"
                        ? visibleImages.imagesFront.map(
                            (image: string, i: number) => {
                              return (
                                <SwiperSlide key={i}>
                                  <div className="flex flex-row justify-center items-center">
                                    {image.length > 0 ? (
                                      <label
                                        htmlFor={`avatar-${i}`}
                                        style={{
                                          backgroundImage: `url(${image})`,
                                        }}
                                        id={`avatar-container-${i}`}
                                        className="rounded-[50%] w-36 h-36 cursor-pointer bg-gray-300 flex items-center justify-center flex-row bg-cover"
                                      ></label>
                                    ) : (
                                      <label
                                        htmlFor={`avatar-${i}`}
                                        id={`avatar-container-${i}`}
                                        className="rounded-[50%] w-36 h-36 cursor-pointer bg-gray-300 flex items-center justify-center flex-row bg-cover"
                                      >
                                        <i className="fa-solid fa-camera text-2xl text-white"></i>
                                      </label>
                                    )}
                                    <input
                                      type="file"
                                      className="hidden"
                                      id={`avatar-${i}`}
                                      onChange={async (e) => {
                                        const base64String = await generateBase64FromMedia(
                                          e.target.files![0]!
                                        );
                                        const picContainer = document.getElementById(
                                          `avatar-container-${i}`
                                        ) as HTMLLabelElement;
                                        picContainer.style.backgroundImage = `url(${base64String})`;

                                        setVisibleImages((prevImgs) => {
                                          prevImgs.imagesFront.splice(
                                            i,
                                            1,
                                            base64String as string
                                          );
                                          return {
                                            ...prevImgs,
                                            imagesFront: prevImgs.imagesFront,
                                          };
                                        });
                                      }}
                                    />
                                  </div>
                                </SwiperSlide>
                              );
                            }
                          )
                        : visibleImages.imagesBack.map(
                            (image: string, i: number) => {
                              return (
                                <SwiperSlide key={i}>
                                  <div className="flex flex-row justify-center items-center">
                                    {image.length > 0 ? (
                                      <label
                                        htmlFor={`avatar-${i}`}
                                        style={{
                                          backgroundImage: `url(${image})`,
                                        }}
                                        id={`avatar-container-${i}`}
                                        className="rounded-[50%] w-36 h-36 cursor-pointer bg-gray-300 flex items-center justify-center flex-row bg-cover"
                                      ></label>
                                    ) : (
                                      <label
                                        htmlFor={`avatar-${i}`}
                                        id={`avatar-container-${i}`}
                                        className="rounded-[50%] w-36 h-36 cursor-pointer bg-gray-300 flex items-center justify-center flex-row bg-cover"
                                      >
                                        <i className="fa-solid fa-camera text-2xl text-white"></i>
                                      </label>
                                    )}
                                    <input
                                      type="file"
                                      className="hidden"
                                      id={`avatar-${i}`}
                                      onChange={async (e) => {
                                        const base64String = await generateBase64FromMedia(
                                          e.target.files![0]!
                                        );
                                        const picContainer = document.getElementById(
                                          `avatar-container-${i}`
                                        ) as HTMLLabelElement;
                                        picContainer.style.backgroundImage = `url(${base64String})`;

                                        setVisibleImages((prevImgs) => {
                                          prevImgs.imagesBack.splice(
                                            i,
                                            1,
                                            base64String as string
                                          );

                                          return {
                                            ...prevImgs,
                                            imagesBack: prevImgs.imagesBack,
                                          };
                                        });
                                      }}
                                    />
                                  </div>
                                </SwiperSlide>
                              );
                            }
                          )}
                    </Swiper>
                    <div className="custom-pagination"></div>
                    <div
                      id="switch-pos"
                      onClick={() => {
                        setVisibleImages((prevVisibleImgs) => {
                          const newPosition =
                            prevVisibleImgs.position === "front"
                              ? "back"
                              : "front";

                          return {
                            ...prevVisibleImgs,
                            position: newPosition,
                          };
                        });
                      }}
                      className={`left-0 bottom-16 z-10 rounded-md absolute flex h-6 px-2 py-4 w-[100px] flex-row items-center gap-x-1 font-serif cursor-pointer text-blue-400`}
                    >
                      <i className="fa-solid fa-eye text-xs"></i>
                      <h4 className="text-[.8rem]">
                        Show{" "}
                        {visibleImages.position === "front" ? "back" : "front"}
                      </h4>
                    </div>
                  </article>
                  <section className="flex flex-col items-start w-full max-h-[500px] overflow-y-auto hide-scrollbar">
                    <header className="font-medium font-sans text-lg px-5 flex flex-row w-full justify-between">
                      <h1>{selectedProduct.current.title}</h1>
                      <button
                        onClick={async (e) => {
                          try {
                            setIsLoading(true);
                            if (selectedProduct.current.is_hidden) {
                              await axios.patch(
                                `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/products/update/${selectedProduct.current.id}?hide=false`,
                                {
                                  withCredentials: true,
                                  headers: {
                                    "x-csrf-token": csrf,
                                  },
                                }
                              );
                            } else {
                              await axios.patch(
                                `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/products/update/${selectedProduct.current.id}?hide=true`,
                                {
                                  withCredentials: true,
                                  headers: {
                                    "x-csrf-token": csrf,
                                  },
                                }
                              );
                            }

                            const url = new URL(
                              `${window.location.origin}${path}`
                            );

                            searchParams.forEach(
                              (value: string, key: string) => {
                                url.searchParams.set(key, value);
                              }
                            );

                            window.location.href = url.toString();
                          } catch (error) {
                            const e = error as Error;
                            toast.error(e.message);
                          }
                        }}
                        type="button"
                        className={`${
                          selectedProduct.current.is_hidden
                            ? "text-red-400 hover:text-red-500"
                            : "text-green-400 hover:text-green-500"
                        } bg-transparent border-none focus:outline-none `}
                      >
                        {isLoading
                          ? "Processing.."
                          : selectedProduct.current.is_hidden
                          ? "Activate"
                          : "Hide"}
                      </button>
                    </header>
                    <hr className="border border-gray-100 mt-3 w-full border-l-0 border-r-0 border-t-0" />

                    <div className="p-5 w-full text-gray-400 font-medium font-sans text-sm flex flex-col gap-y-5">
                      <div className="w-full flex md:flex-row flex-col items-start gap-y-2 md:items-center">
                        <h3 className="md:w-[50%] w-full">Description</h3>
                        <input
                          value={desc.edit}
                          onChange={(e) =>
                            setDesc((prevDesc) => ({
                              ...prevDesc,
                              edit: e.target.value,
                            }))
                          }
                          className="focus:outline-none font-normal border border-gray-200 p-2 rounded-sm h-8 md:w-[50%] w-full"
                        />
                      </div>
                      <div className="w-full flex md:flex-row flex-col items-start gap-y-2 md:items-center">
                        <h3 className="md:w-[50%] w-full">Type</h3>
                        <input
                          value={type.edit}
                          onChange={(e) =>
                            setType((prevType) => ({
                              ...prevType,
                              edit: e.target.value,
                            }))
                          }
                          className="focus:outline-none font-normal border border-gray-200 p-2 bg-gray-50 rounded-sm h-8 md:w-[50%] w-full"
                        />
                      </div>
                      <div className="w-full flex md:flex-row flex-col items-start gap-y-2 md:items-center">
                        <h3 className="md:w-[50%] w-full">Set As feature</h3>
                        <div
                          onClick={() => {
                            let downAngle = document.querySelector(
                              "i.feature-angle-down"
                            );
                            if (!downAngle?.classList.contains("ad-rotate")) {
                              downAngle?.classList.add("ad-rotate");
                              downAngle?.classList.remove(
                                "ad-rotate-anticlock"
                              );
                            } else {
                              downAngle?.classList.remove("ad-rotate");
                              downAngle?.classList.add("ad-rotate-anticlock");
                            }
                          }}
                          className="relative border border-gray-400 rounded-sm p-1 focus:border-gray-600 md:w-[26%] w-[60%]"
                        >
                          <select
                            id="feature-select"
                            className="focus:outline-none p-2 appearance-none"
                            onChange={(e) => {
                              setIsFeature((prevFeature) => ({
                                ...prevFeature,
                                edit: e.target.value === "Set" ? true : false,
                              }));
                            }}
                          >
                            <option
                              hidden
                              value={isFeature.edit ? "Featured" : "Not"}
                            >
                              {isFeature.edit
                                ? "Featured Product"
                                : "Not featured"}
                            </option>
                            {["Not featured", "Featured Product"].map(
                              (val, i) => (
                                <option
                                  className="underline underline-offset-1"
                                  value={val.split(" ")[0]}
                                  key={i}
                                >
                                  {val}
                                </option>
                              )
                            )}
                          </select>
                          <i
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="fa-solid fa-angle-down feature-angle-down absolute top-[36%] right-3"
                          ></i>
                        </div>
                      </div>
                      <div className="w-full flex md:flex-row flex-col items-start gap-y-2 md:items-center">
                        <h3 className="md:w-[50%] w-full">Features</h3>
                        <textarea
                          onChange={(e) => setDressFeatures(e.target.value)}
                          value={dressFeatures}
                          cols={70}
                          rows={150}
                          className="focus:outline-none font-normal border border-gray-200 p-2 bg-gray-50 rounded-sm h-14 md:w-[50%] w-full"
                        ></textarea>
                      </div>
                      <div className="w-full flex flex-col items-start gap-y-3">
                        <h3 className="md:w-[50%] w-full">Colors</h3>
                        <div
                          className="flex flex-row flex-wrap gap-x-[7px] gap-y-2"
                          id="colors-list"
                        >
                          {colorList.map((val, i: number) => {
                            if (selectedColors.includes(val)) {
                              return (
                                <span
                                  key={i}
                                  onClick={(e) => {
                                    if (
                                      Object.values(productObj.current).filter(
                                        (obj) => obj.hex_code === selectedColor
                                      ).length > 0
                                    ) {
                                      if (
                                        Object.values(
                                          productObj.current
                                        ).filter(
                                          (obj) =>
                                            obj.hex_code === selectedColor
                                        )[0]!.price > 0
                                      ) {
                                        setSelectedColor(val);
                                        setPrice((prevPrice) => ({
                                          ...prevPrice,
                                          edit: {
                                            ...prevPrice.edit,
                                            size: Object.values(
                                              productObj.current
                                            ).filter(
                                              (obj) => obj.hex_code! === val
                                            )[0]!.number!,
                                            value: Object.values(
                                              productObj.current
                                            )
                                              .filter(
                                                (obj) => obj.hex_code! === val
                                              )[0]!
                                              .price.toString(),
                                          },
                                        }));
                                        setStock((prevStock) => ({
                                          ...prevStock,
                                          edit: {
                                            ...prevStock.edit,
                                            size: Object.values(
                                              productObj.current
                                            ).filter(
                                              (obj) => obj.hex_code! === val
                                            )[0]!.number!,
                                            value: Object.values(
                                              productObj.current
                                            )
                                              .filter(
                                                (obj) => obj.hex_code! === val
                                              )[0]!
                                              .stock.toString(),
                                          },
                                        }));
                                      } else {
                                        toast.error(
                                          "new color size data is incomplete",
                                          {
                                            position: "top-center",
                                          }
                                        );
                                      }
                                    } else {
                                      toast.error(
                                        "new color size data is missing",
                                        {
                                          position: "top-center",
                                        }
                                      );
                                    }
                                  }}
                                  style={{ backgroundColor: val }}
                                  className={`rounded-sm cursor-pointer w-6 h-6 ring-4 ring-accent`}
                                ></span>
                              );
                            } else {
                              return (
                                <span
                                  key={i}
                                  onClick={(e) => {
                                    e.currentTarget.classList.add(
                                      "ring-4",
                                      "ring-accent"
                                    );
                                    setSelectedColor(val);
                                    setSelectedColors((prevColors) => [
                                      val,
                                      ...prevColors,
                                    ]);
                                    setPrice((prevPrice) => ({
                                      ...prevPrice,
                                      edit: {
                                        ...prevPrice.edit,
                                        size: 0,
                                        value: "",
                                      },
                                    }));
                                    setStock((prevStock) => ({
                                      ...prevStock,
                                      edit: {
                                        ...prevStock.edit,
                                        size: 0,
                                        value: "",
                                      },
                                    }));
                                  }}
                                  style={{ backgroundColor: val }}
                                  className={`rounded-sm cursor-pointer w-6 h-6`}
                                ></span>
                              );
                            }
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-3 items-start w-full">
                        <h5>Size</h5>
                        <div
                          className="flex flex-row flex-wrap gap-x-[6px] gap-y-6"
                          id="edit-size-list"
                        >
                          {sizes.map((item: number, i: number) => {
                            if (
                              Object.values(productObj.current).some(
                                (size) =>
                                  size.number === item &&
                                  size.hex_code === selectedColor
                              )
                            ) {
                              return (
                                <div className="relative" key={i}>
                                  <span
                                    onClick={(e) => handleSizeEdit(e, item)}
                                    id={`edit-size${i}`}
                                    style={{ backgroundColor: selectedColor }}
                                    className={`text-white rounded-[50%] cursor-pointer py-2 px-[10px] w-8 h-8 text-xs font-medium text-center`}
                                  >
                                    {item}
                                  </span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="relative" key={i}>
                                  <span
                                    id={`edit-size${i}`}
                                    onClick={(e) => handleSizeEdit(e, item)}
                                    className={`rounded-[50%] cursor-pointer py-2 px-[10px] bg-black w-8 h-8 text-xs font-medium text-white text-center`}
                                  >
                                    {item}
                                  </span>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                      <div className="w-full flex md:flex-row flex-col items-start gap-y-2 md:items-center">
                        <h3 className="md:w-[50%] w-full">Price</h3>
                        <input
                          value={price.edit.value}
                          onChange={(e) => {
                            setPrice((prevPrice) => ({
                              ...prevPrice,
                              edit: {
                                ...prevPrice.edit,
                                size: prevPrice.edit.size,
                                value: e.target.value,
                              },
                            }));
                            productObj.current[
                              `${selectedColor}-${price.edit.size}`
                            ] = {
                              ...productObj.current[
                                `${selectedColor}-${price.edit.size}`
                              ]!,
                              price: parseFloat(e.target.value),
                            };
                          }}
                          className="focus:outline-none font-normal border border-gray-200 p-2 rounded-sm h-8 md:w-[50%] w-full"
                        />
                      </div>
                      <div className="w-full flex md:flex-row flex-col items-start gap-y-2 md:items-center">
                        <h3 className="md:w-[50%] w-full">Stock</h3>
                        <input
                          type="number"
                          value={stock.edit.value}
                          onChange={(e) => {
                            setStock((prevStock) => ({
                              ...prevStock,
                              edit: {
                                ...prevStock.edit,
                                size: prevStock.edit.size,
                                value: e.target.value,
                              },
                            }));
                            productObj.current[
                              `${selectedColor}-${stock.edit.size}`
                            ] = {
                              ...productObj.current[
                                `${selectedColor}-${stock.edit.size}`
                              ]!,
                              stock: parseInt(e.target.value),
                            };
                          }}
                          className="focus:outline-none font-normal border border-gray-200 p-2 rounded-sm h-8 md:w-[50%] w-full"
                        />
                      </div>
                    </div>
                  </section>
                  <div className="flex flex-row justify-end px-5 w-full">
                    <button
                      type="submit"
                      className="px-10 py-2 rounded-md bg-accent text-white outline-none"
                    >
                      {loader ? "Processing" : "Edit Product"}
                    </button>
                  </div>
                </form>
              </section>
            </AdminSettingsModal>
          )}
        </section>
      )}
    </main>
  );
}
