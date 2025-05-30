"use client";

import Image from "next/image";
import React from "react";
import { QuickViewModal } from "../layout/Modal";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";
import useCart from "@/store/useCart";
import Link from "next/link";
import { Base64ImagesObj, DressSizesJsxObj, DressSizesObj } from "@/interfaces";
import { regex, sizes } from "@/helpers/getHelpers";
import axios from "axios";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

const ProductQuickView = ({
  product,
  onHideModal,
  isSearchProduct,
  isOnDetailPage,
  csrf
}: any) => {
  const { totalAmount, addItem, items } = useCart();
  const [quantity, setQuantity] = React.useState("1");
  const [zoomActivated, setZoomActivated] = React.useState(false);
  const [progressIndicator, setProgressIndicator] = React.useState(false);
  const [toastMsgVisible, setToastMsgVisible] = React.useState(false);
  const [isSavingCart, setIsSavingCart] = React.useState(false);
  const [toastError, setToastError] = React.useState(false);
  const path = usePathname();

  let sizesJsxObj: DressSizesJsxObj = {};
  let sizesObj: DressSizesObj = React.useMemo(() => ({}), []);
  let colorsObj: {
    [key: string]: number[];
  } = {};
  let frontBase64ImagesObj: Base64ImagesObj = {};

  let timerId = React.useRef<NodeJS.Timeout | null>(null);

  //sorting extracted sizes for all dress colors and storing them for later use
  for (let color of product.colors) {
    if (!isSearchProduct) {
      color.sizes = color.sizes.filter((size: any) => size.stock > 0);
    }
    color.sizes.sort((a: any, b: any) => a.number - b.number);

    for (let size of color.sizes) {
      colorsObj[color.name]
        ? colorsObj[color.name]!.push(size.number)
        : (colorsObj[color.name] = [size.number]);
    }
  }

  const [selectedColor, setSelectedColor] = React.useState(
    product.colors[0].name
  );

  const [selectedSize, setSelectedSize] = React.useState<string>(
    product.colors[0].sizes[0].number.toString()
  );

  React.useEffect(() => {
    async function sendCartData() {
      if (isSavingCart) {
        let startTime = Date.now();
        setToastMsgVisible(false);
        setToastError(false);
        setProgressIndicator(true);
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_WEB_DOMAIN}/api/products/cart`, {
            price: sizesObj[`${selectedColor}-${selectedSize}`]!.price,
            quantity: parseInt(quantity),
            variantId: sizesObj[`${selectedColor}-${selectedSize}`]!.variant_id,
            id: product.id.toString(),
            totalAmount,
          },{
            withCredentials: true,
            headers: {
              'x-csrf-token': csrf
            }
          });

          if (res.status != 201) {
            throw new Error(res.data.message);
          }
        } catch (error) {
          const e = error as Error;
          return toast.error(e.message);
        } finally {
          let endTime = Date.now();
          let elapsedTime = endTime - startTime;
          let remainingTime = Math.max(3000, elapsedTime);
          timerId.current = setTimeout(() => {
            setProgressIndicator(false);
            setToastMsgVisible(true);
            // Resetting isSavingCart to false
            setIsSavingCart(false);
          }, remainingTime);
        }
      }
    }

    sendCartData();

    return () => clearTimeout(timerId.current!);
  }, [
    isSavingCart,
    product.id,
    quantity,
    selectedColor,
    selectedSize,
    sizesObj,
    totalAmount,
  ]);

  function handleColorChange(e: React.MouseEvent) {
    let activeColorEl = e.currentTarget as HTMLSpanElement;

    let colorNodeList = activeColorEl.parentNode!.querySelectorAll(
      "span"
    ) as NodeListOf<HTMLSpanElement>;
    let otherColorEls = Array.from(colorNodeList);
    let sizeNodeList = activeColorEl
      .closest("section")!
      .parentNode!.querySelectorAll("#size-list > div > span") as NodeListOf<
      HTMLSpanElement
    >;
    let sizeEls = Array.from(sizeNodeList);

    otherColorEls.forEach((el) => {
      if (
        el.classList.contains("bg-black") ||
        el.style.getPropertyValue("background-color") === "black"
      ) {
        el.style.setProperty("background-color", "transparent");
        el.style.setProperty("color", "rgb(75, 85, 99 )");
        el.classList.add(
          "border",
          "border-gray-600",
          "hover:ring-1",
          "ring-gray-600"
        );
        el.classList.remove("bg-black");
      }
    });

    activeColorEl.style.setProperty("background-color", "black");
    activeColorEl.style.setProperty("color", "white");
    activeColorEl.classList.remove(
      "border",
      "border-gray-600",
      "hover:ring-1",
      "ring-gray-600"
    );
    activeColorEl.classList.add("bg-black");

    /**updating active dress color ***/
    for (let color of product.colors) {
      for (let i = 0; i < sizes.length; i++) {
        if (
          color.name ===
            activeColorEl.innerText.charAt(0).toLowerCase() +
              activeColorEl.innerText.slice(1) &&
          !color.sizes.some(
            (size: any) => size.number === colorsObj![selectedColor]![i]
          ) &&
          colorsObj![selectedColor]![i]
        ) {
          // Setting properties of size element not contained in active dress color to 'not in stock'
          sizeEls[
            sizeEls.findIndex(
              (el) =>
                el.innerText.split(" ")[1] ===
                colorsObj[selectedColor]![i]!.toString()
            )
          ]!.style.setProperty("background-color", "transparent");
          sizeEls[
            sizeEls.findIndex(
              (el) =>
                el.innerText.split(" ")[1] ===
                colorsObj[selectedColor]![i]!.toString()
            )
          ]!.style.setProperty("color", "rgb(156, 163, 175)");
          sizeEls[
            sizeEls.findIndex(
              (el) =>
                el.innerText.split(" ")[1] ===
                colorsObj[selectedColor]![i]!.toString()
            )
          ]!.classList.add("border", "border-gray-200");

          // Setting properties of first size element contained in active dress color to 'current selection'
          sizeEls[
            sizeEls.findIndex(
              (el) =>
                el.innerText.split(" ")[1] === color.sizes[0].number.toString()
            )
          ]!.style.setProperty("background-color", "black");
          sizeEls[
            sizeEls.findIndex(
              (el) =>
                el.innerText.split(" ")[1] === color.sizes[0].number.toString()
            )
          ]!.style.setProperty("color", "white");
          sizeEls[
            sizeEls.findIndex(
              (el) =>
                el.innerText.split(" ")[1] === color.sizes[0].number.toString()
            )
          ]!.classList.remove("hover:ring-1", "ring-gray-600");
          // Setting properties of other size elements contained in active dress color to 'available for selection'
          if (color.sizes.slice(1).length > 0) {
            for (let size of color.sizes.slice(1)) {
              sizeEls[
                sizeEls.findIndex(
                  (el) => el.innerText.split(" ")[1] === size.number.toString()
                )
              ]!.style.setProperty("color", "rgb(75, 85, 99)");
            }
          }

          setSelectedSize(color.sizes[0].number.toString());
        }
      }
    }
    setSelectedColor(
      (activeColorEl.innerText.charAt(0).toLowerCase() +
        activeColorEl.innerText.slice(1)) as any
    );
  }

  function handleSizeChange(e: React.MouseEvent) {
    let activeSizeEl = e.currentTarget as HTMLSpanElement;

    let nodeList = activeSizeEl.parentNode!.querySelectorAll(
      "span"
    ) as NodeListOf<HTMLSpanElement>;
    let otherSizeEls = Array.from(nodeList);

    otherSizeEls.forEach((el) => {
      if (
        el.classList.contains("bg-black") ||
        el.style.getPropertyValue("background-color") === "black"
      ) {
        el.style.setProperty("background-color", "transparent");
        el.style.setProperty("color", "rgb(75, 85, 99 )");
        el.classList.add(
          "border",
          "border-gray-600",
          "hover:ring-1",
          "ring-gray-600"
        );
        el.classList.remove("bg-black");
      }
    });

    activeSizeEl.style.setProperty("background-color", "black");
    activeSizeEl.style.setProperty("color", "white");
    activeSizeEl.classList.remove(
      "border",
      "border-gray-600",
      "hover:ring-1",
      "ring-gray-600"
    );
    activeSizeEl.classList.add("bg-black");
    //updating active dress size
    setSelectedSize(activeSizeEl.innerText.split(" ")[1]!);
  }

  product.colors.forEach((color: any, i: number) => {
    sizesJsxObj[color.name] = sizes.map((size: number, i: number) =>
      color.sizes[0] &&
      color.sizes[0].number === size &&
      color.sizes[0].stock === 0 &&
      color.is_available ? (
        <span
          key={i}
          className="font-sans bg-black px-6 py-2 rounded-3xl cursor-pointer text-gray-400 line-through"
        >
          UK {size}
        </span>
      ) : color.sizes[0] &&
        color.sizes[0].number === size &&
        color.sizes[0].stock > 0 &&
        color.is_available ? (
        <span
          key={i}
          onClick={handleSizeChange}
          className="font-sans bg-black px-6 py-2 rounded-3xl cursor-pointer text-white"
        >
          UK {size}
        </span>
      ) : color.sizes[1] &&
        color.sizes[1].number === size &&
        color.sizes[1].stock > 0 &&
        color.is_available ? (
        <span
          key={i}
          onClick={handleSizeChange}
          className="font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600"
        >
          UK {size}
        </span>
      ) : color.sizes[2] &&
        color.sizes[2].number === size &&
        color.sizes[2].stock > 0 &&
        color.is_available ? (
        <span
          key={i}
          onClick={handleSizeChange}
          className="font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600"
        >
          UK {size}
        </span>
      ) : color.sizes[3] &&
        color.sizes[3].number === size &&
        color.sizes[3].stock > 0 &&
        color.is_available ? (
        <span
          key={i}
          onClick={handleSizeChange}
          className="font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600"
        >
          UK {size}
        </span>
      ) : color.sizes[4] &&
        color.sizes[4].number === size &&
        color.sizes[4].stock > 0 &&
        color.is_available ? (
        <span
          key={i}
          onClick={handleSizeChange}
          className="font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600"
        >
          UK {size}
        </span>
      ) : color.sizes[5] &&
        color.sizes[5].number === size &&
        color.sizes[5].stock > 0 &&
        color.is_available ? (
        <span
          key={i}
          onClick={handleSizeChange}
          className="font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600"
        >
          UK {size}
        </span>
      ) : (
        <span
          key={i}
          className="font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-400 line-through border border-gray-200"
        >
          UK {size}
        </span>
      )
    );

    frontBase64ImagesObj[color.name] = color.image_front_base64;
    color.sizes.forEach((size: any) => {
      sizesObj[`${color.name}-${size.number}`] = {
        price: size.price,
        variant_id: size.variant_id,
        stock: size.stock,
        color: color.name,
      };
    });
  });

  return (
    <QuickViewModal onClose={onHideModal}>
      <Swiper
        modules={[Navigation]}
        slidesPerView={1}
        navigation
        className="lg:w-[40%] w-full h-[40%] lg:h-full"
      >
        {(frontBase64ImagesObj[selectedColor]
          ? frontBase64ImagesObj[selectedColor]
          : product.colors[0].image_front_base64
        ).map((image: string, i: number) => (
          <SwiperSlide key={i}>
            <div
              id="image-zoom"
              className={`${
                zoomActivated ? "cursor-zoom-out" : "cursor-zoom-in"
              } relative h-full`}
              style={
                {
                  "--url": `url(${image})`,
                  "--zoom-x": "0%",
                  "--zoom-y": "0%",
                  "--display": "none",
                } as React.CSSProperties
              }
              onMouseMove={(e) => {
                if (zoomActivated) {
                  const item = e.currentTarget;
                  item.style.setProperty("--display", "block");
                  let pointer = {
                    x:
                      (e.nativeEvent.offsetX * 100) /
                      e.currentTarget.offsetWidth,
                    y:
                      (e.nativeEvent.offsetY * 100) /
                      e.currentTarget.offsetHeight,
                  };

                  item.style.setProperty("--zoom-x", `${pointer.x}` + "%");
                  item.style.setProperty("--zoom-y", `${pointer.y}` + "%");
                }
              }}
              onClick={(e) => {
                const item = e.currentTarget;
                if (!zoomActivated) {
                  item.style.setProperty("--display", "block");
                  let pointer = {
                    x:
                      (e.nativeEvent.offsetX * 100) /
                      e.currentTarget.offsetWidth,
                    y:
                      (e.nativeEvent.offsetY * 100) /
                      e.currentTarget.offsetHeight,
                  };

                  item.style.setProperty("--zoom-x", `${pointer.x}` + "%");
                  item.style.setProperty("--zoom-y", `${pointer.y}` + "%");
                } else {
                  item.style.setProperty("--display", "none");
                }
                setZoomActivated((prevState) => !prevState);
              }}
              onMouseLeave={(e) => {
                const item = e.currentTarget;
                if (zoomActivated) {
                  setZoomActivated(false);
                }
                item.style.setProperty("--display", "none");
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image}
                  role="presentation"
                  alt="featured-Image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <section className="lg:p-12 p-6 lg:w-[60%] flex flex-col w-full gap-y-5 lg:overflow-y-scroll h-[60%] lg:h-full">
        <header className="flex flex-col items-start gap-y-0">
          <h2 className="font-sans text-xs text-gray-400 font-thin">
            OYINYE COUTURE
          </h2>
          <h1 className="font-medium font-sans lg:text-4xl text-2xl">
            {product.title}
          </h1>
        </header>
        <section className="border border-l-0 border-r-0 border-gray-300 w-full py-4 font-medium my-2 font-sans text-gray-600">
          <button
            onClick={() => {
              if (isOnDetailPage) {
                const pathParts = path.split("/");
                const newPath = `/${
                  pathParts[1]
                }/products/${product.title
                  .replace(" ", "-")
                  .toLowerCase()}/${sizesObj[
                  `${selectedColor}-${selectedSize}`
                ]!.color!.toLowerCase()}/${sizesObj[
                  `${selectedColor}-${selectedSize}`
                ]!.variant_id!}`;

                const url = new URL(`${window.location.origin}${newPath}`);
                window.location.href = url.toString();
              } else {
                window.location.href =
                  `/products/${product.title
                    .replace(" ", "-")
                    .toLowerCase()}/${sizesObj[
                    `${selectedColor}-${selectedSize}`
                  ]!.color!.toLowerCase()}/${sizesObj[
                    `${selectedColor}-${selectedSize}`
                  ]!.variant_id!}`
                ;
              }
            }}
            className="cursor-pointer transition-all m-0 ease-in-out duration-200 hover:ml-2"
          >
            <i className="fa-solid fa-arrow-right-long text-gray-600"></i>
            &nbsp;&nbsp;Go to product page
          </button>
        </section>
        <section className="text-lg text-gray-600 flex flex-row gap-x-4 font-sans items-center">
          <h1 className="font-sans font-bold text-black">
            &#8358;
            {sizesObj[`${selectedColor}-${selectedSize}`]!.price.toLocaleString(
              "en-US"
            )}
          </h1>
          {sizesObj[`${selectedColor}-${selectedSize}`]!.stock === 0 && (
            <h2 className="bg-red-600 text-white h-6 px-2 py-1 w-[70px] text-sm text-center font-semibold flex items-center justify-center">
              Sold out
            </h2>
          )}
        </section>
        <section className="flex flex-col items-start gap-y-2" id="color-list">
          <h1 className="text-sm text-gray-500">Color</h1>
          <div className="flex flex-row justify-start gap-x-2 flex-wrap gap-y-2">
            {product.colors.map((color: any, i: number) =>
              sizesObj[`${selectedColor}-${selectedSize}`]!.stock === 0 ? (
                <span
                  key={i}
                  onClick={handleColorChange}
                  className={
                    color.is_available && i === 0
                      ? `cursor-pointer bg-black px-6 py-2 rounded-3xl text-gray-400 line-through`
                      : `cursor-pointer bg-transparent border border-gray-200 px-6 py-2 rounded-3xl text-gray-400 line-through`
                  }
                >
                  {color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                </span>
              ) : (
                <span
                  key={i}
                  onClick={handleColorChange}
                  className={
                    color.is_available && i === 0
                      ? `bg-black px-6 py-2 rounded-3xl text-white cursor-pointer`
                      : `cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600 px-6 py-2 rounded-3xl bg-transparent`
                  }
                >
                  {color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                </span>
              )
            )}
          </div>
        </section>
        <section className="flex flex-col items-start gap-y-2" id="size-list">
          <h1 className="text-sm text-gray-500">Size</h1>
          <div className="flex flex-row justify-start flex-wrap gap-x-2 gap-y-2">
            {sizesJsxObj[selectedColor]
              ? sizesJsxObj[selectedColor]
              : sizes.map((size: number, i: number) => (
                  <span
                    key={i}
                    className="font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-400 line-through border border-gray-200"
                  >
                    UK {size}
                  </span>
                ))}
          </div>
        </section>
        <section className="flex flex-row items-center justify-start gap-x-6 relative w-full mt-2">
          <div className="flex flex-row">
            <button
              onClick={() => {
                setQuantity((prevState) => {
                  if (parseInt(prevState) === 1) {
                    return prevState;
                  } else {
                    return parseInt(prevState) - 1 + "";
                  }
                });
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.classList.add("mouseleave");
                timerId.current = setTimeout(() => {
                  el.classList.remove("mouseleave");
                }, 400);
              }}
              className="font-sans relative rounded-[50%] px-[11px] py-[5px] bg-gray-100 cursor-pointer"
              id="minus-icon"
            >
              <i className="fa-solid fa-minus text-gray-600 text-xs relative"></i>
            </button>
            <input
              onBlur={(e) => {
                const el = e.target;
                el.classList.add("border-none");
                el.classList.remove("shadow-md");
              }}
              onFocus={(e) => {
                const el = e.currentTarget;
                el.classList.remove("border-none");
                el.classList.add("border");
                el.classList.add("shadow-md");
              }}
              onChange={(e) => {
                const input = e.currentTarget;
                if (!regex.test(input.value)) {
                  input.value = "";
                  return;
                }
                setQuantity(input.value);
              }}
              type="text"
              className="
                         bg-transparent w-16
                          text-lg font-sans text-gray-600 focus:outline-none text-center
                         px-2"
              value={quantity}
            />
            <button
              onClick={() => {
                setQuantity((prevState) => parseInt(prevState) + 1 + "");
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.classList.add("mouseleave");
                timerId.current = setTimeout(() => {
                  el.classList.remove("mouseleave");
                }, 400);
              }}
              id="plus-icon"
              className="relative rounded-[50%] cursor-pointer px-[11px] py-[5px] bg-gray-100"
            >
              <i className="fa-solid fa-plus text-gray-600 text-xs relative"></i>
            </button>
          </div>
          {progressIndicator ? (
            <div
              className="progress-bar"
              style={{ "--animate-duration": "3s" } as React.CSSProperties}
            ></div>
          ) : (
            <button
              onClick={(e) => {
                if (
                  items.some(
                    (item: any) =>
                      item.variantId ===
                      sizesObj[`${selectedColor}-${selectedSize}`]!.variant_id!
                  )
                ) {
                  setToastError(true);
                  setToastMsgVisible(false);
                } else {
                  //adding item to cart
                  addItem({
                    price: sizesObj[`${selectedColor}-${selectedSize}`]!.price,
                    quantity: parseInt(quantity),
                    variantId: sizesObj[`${selectedColor}-${selectedSize}`]!
                      .variant_id!,
                    id: product.id.toString(),
                  });
                  //sending cart data to data layer
                  setIsSavingCart(true);
                }
              }}
              disabled={
                sizesObj[`${selectedColor}-${selectedSize}`]!.stock === 0
                  ? true
                  : false
              }
              className={`${
                sizesObj[`${selectedColor}-${selectedSize}`]!.stock === 0
                  ? "cursor-not-allowed"
                  : ""
              } hover:opacity-70 md:px-6 px-8 md:py-3 py-2
                         text-blue-600 lg:text-[1rem] font-sans text-[.9rem]`}
              id="add-to-cart"
            >
              <span className="md:inline-block hidden">Add&nbsp;</span>
              <span className="md:inline-block hidden">To&nbsp;</span>
              <span>Cart</span>
            </button>
          )}
        </section>
        {toastMsgVisible && (
          <p
            className="border-[#a8e8e2] border bg-[#a8e8e226] px-4 py-3 font-sans text-[1rem] text-gray-500 font-light relative"
            id="toast-msg"
          >
            {product.title} has been added to your cart.{" "}
            <Link href={`/cart`} className="underline underline-offset-2">
              View Cart
            </Link>
          </p>
        )}
        {toastError && (
          <p
            className="border-[#e8b7a8] border bg-[#e8b7a826] px-4 py-3 font-sans text-[1rem] text-gray-500 font-light relative"
            id="toast-error"
          >
            You can&apos;t add more {product.title} to the cart
          </p>
        )}
      </section>
    </QuickViewModal>
  );
};

export default ProductQuickView;
