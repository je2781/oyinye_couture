"use client";

import {
  Base64ImagesObj,
  DressSize,
  DressSizesJsxObj,
  DressSizesObj,
} from "@/interfaces";
import axios from "axios";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Link from "next/link";
import Image from "next/image";
import useCart from "@/store/useCart";
import { regex, sizes } from "@/helpers/getHelpers";

import Ruler from '../../../public/ruler.svg';
import Truck from '../../../public/truck.svg';
import Logo from '../../../public/oyinye.png';
import './ProductDetail.css';
import toast from "react-hot-toast";
import Product from "../product/Product";
import Reviews from "../reviews/Reviews";
import { createViewedProductsAction } from "@/app/actions";
import useGlobal from "@/store/useGlobal";
import { useRouter } from "@/i18n/routing";
import {useTranslations} from 'next-intl';

const ProductDetail = ({
    productSizes,
    productColors,
    productFrontBase64Images,
    productTitle,
    productColor,
    productId,
    paramsId,
    relatedProducts,
    productReviews,
}: any) => {
    let sizesJsxObj: DressSizesJsxObj = {};
    let sizesObj: DressSizesObj = React.useMemo(() => ({}), []);
    let colorsObj: {
        [key: string]: number[]
    } = {};
    let frontBase64ImagesObj: Base64ImagesObj = {};
    let timerId =  React.useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const {lang} = useGlobal();
    const t = useTranslations('app');

    React.useEffect(() => {
        async function getServerAction(){
            await createViewedProductsAction(paramsId);
        }
        getServerAction();
    }, [paramsId]);

    const [colorsData, setColorsData] = useState<any[]>(productColors);
    const [imageFrontBase64, setImageFrontBase64] = useState<string[]>(productFrontBase64Images);
    const [selectedColor, setSelectedColor] = useState<string>(productColor['en']);
    const [selectedSize, setSelectedSize] = useState<string>(productSizes.find(
        (size: any) => size.variant_id === paramsId
    ).number.toString());
    const [dragActivated, setDragActivated] = useState(false);
    const [loader, setLoader] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);
    const [quantity, setQuantity] = useState("1");
    const { addItem, totalAmount, items} = useCart();
    const [isSavingCart, setIsSavingCart] = React.useState(false);
    const [toastError, setToastError] = React.useState(false);
    const [articleIsNotSticky, setArticleIsNotSticky] = React.useState(false);

    React.useEffect(() => {
        return () => clearTimeout(timerId.current!);
    }, [timerId]);

    
    React.useEffect(() => {
        // Handling scroll
        const handleScroll = () => {
            const docScrollPos = window.scrollY;
            const AScrollPos = getArticleBottomScrollYPosition();
    
            setArticleIsNotSticky(docScrollPos === AScrollPos);
        };
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [articleIsNotSticky]);
        

    function getArticleBottomScrollYPosition() {
        const element = document.querySelector('article') as HTMLElement;

        if(element){
            const rect = element.getBoundingClientRect();
            return window.scrollY + rect.bottom;
        }

    }

    React.useEffect(() => {

        async function sendCartData(){
            if(isSavingCart){
                let startTime = Date.now();
                setToastError(false);
                setLoader(true);
                try {
                    await axios.post('/api/products/cart', {
                        price: sizesObj[`${selectedColor}-${selectedSize}`].price,
                        quantity: parseInt(quantity),
                        variantId: sizesObj[`${selectedColor}-${selectedSize}`].variant_id!,
                        id: productId,
                        totalAmount
                    });
                    
                } catch (error: any) {
                    toast.error(error.message);
                }finally{
                    let endTime = Date.now();
                    let elapsedTime = endTime - startTime;
                    let remainingTime = Math.max(2000, elapsedTime);
                    timerId.current = setTimeout(() => {
                        setLoader(false);
                        toast.success('item added to cart', {
                            position: 'top-right'
                        });
                        // Resetting isSavingCart to false
                        setIsSavingCart(false);
                    }, remainingTime);
                }

            }
        }

        sendCartData();

    }, [isSavingCart, productId, quantity, selectedColor, selectedSize, sizesObj, totalAmount]);


    function handleColorChange(e: React.MouseEvent){
        let activeColorEl = e.currentTarget as HTMLSpanElement;

        let colorNodeList = activeColorEl.parentNode!.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
        let otherColorEls = Array.from(colorNodeList);
        let sizeNodeList = activeColorEl.closest('section')!.parentNode!.querySelectorAll('#size-list > div > span') as NodeListOf<HTMLSpanElement>;
        let sizeEls = Array.from(sizeNodeList);

        otherColorEls.forEach(el => {
            if(el.classList.contains('bg-black') || el.style.getPropertyValue('background-color') === 'black'){
                el.style.setProperty('background-color', 'transparent');
                el.style.setProperty('color', 'rgb(75, 85, 99 )');
                el.classList.add('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
                el.classList.remove('bg-black');
            }
        });

        activeColorEl.style.setProperty('background-color', 'black');
        activeColorEl.style.setProperty('color', 'white');
        activeColorEl.classList.remove('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
        activeColorEl.classList.add('bg-black');

        /**updating active dress color ***/
        if (colorsData) {
            for(let color of colorsData){
                for (let i = 0; i < sizes.length; i++) {
                    if (color.type['en'] === (activeColorEl.innerText.charAt(0).toLowerCase() + activeColorEl.innerText.slice(1)) && !color.sizes.some((size: any) => size.number === colorsObj[selectedColor][i]) && colorsObj[selectedColor][i]) {
                        // Setting properties of size element not contained in active dress color to 'not in stock'
                        sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === colorsObj[selectedColor][i].toString())].style.setProperty('background-color', 'transparent');
                        sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === colorsObj[selectedColor][i].toString())].style.setProperty('color', 'rgb(156, 163, 175)');
                        sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === colorsObj[selectedColor][i].toString())].classList.add('border', 'border-gray-200');
                        
                        // Setting properties of first size element contained in active dress color to 'current selection'
                        sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].style.setProperty('background-color', 'black');
                        sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].style.setProperty('color', 'white');
                        sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].classList.remove('hover:ring-1', 'ring-gray-600');
                        // Setting properties of other size elements contained in active dress color to 'available for selection'
                        if (color.sizes.slice(1).length > 0) {
                            for (let size of color.sizes.slice(1)) {
                                sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === size.number.toString())].style.setProperty('color', 'rgb(75, 85, 99)');
                            }
                        }
                        //updating active dress size and pathname of current route
                        const extractedColor = colorsData.find(color => color.type['en'] === (activeColorEl.innerText.charAt(0).toLowerCase() + activeColorEl.innerText.slice(1)));
                        const extractedSize = extractedColor.sizes.find((size: any) => size.number === color.sizes[0].number)
                        history.pushState(null, '', `/${lang}/products/${productTitle['en'].replace(' ', '-')}/${extractedColor.type['en'].replace(' ', '-')}/${extractedSize?.variant_id}`);
                
                        setSelectedSize(color.sizes[0].number.toString());
                    }
                }
                
            }
            setSelectedColor(activeColorEl.innerText);
        }


    }


    function handleSizeChange(e: React.MouseEvent){
        let activeSizeEl = e.currentTarget as HTMLSpanElement;

        let nodeList = activeSizeEl.parentNode!.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
        let otherSizeEls = Array.from(nodeList);

        otherSizeEls.forEach(el => {
            if(el.classList.contains('bg-black') || el.style.getPropertyValue('background-color') === 'black'){
                el.style.setProperty('background-color', 'transparent');
                el.style.setProperty('color', 'rgb(75, 85, 99 )');
                el.classList.add('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
                el.classList.remove('bg-black');
            }
        });

        activeSizeEl.style.setProperty('background-color', 'black');
        activeSizeEl.style.setProperty('color', 'white');
        activeSizeEl.classList.remove('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
        activeSizeEl.classList.add('bg-black');

        //updating active dress size and pathname of current route
        const extractedColor = colorsData!.find(color => color.type['en'] === selectedColor);
        const extractedSize = extractedColor.sizes.find((size: any) => size.number === parseInt(activeSizeEl.innerText.split(' ')[1]));
        history.pushState(null, '', `/${lang}/products/${productTitle['en'].replace(' ', '-').toLowerCase()}/${selectedColor.toLowerCase().replace(' ', '-')}/${extractedSize?.variant_id}`);
        setSelectedSize(activeSizeEl.innerText.split(' ')[1]);
    }


    if (colorsData) {
        colorsData.forEach((color: any, i: number) => {
            //sorting extracted sizes for all dress colors and storing them for later use
            color.sizes.sort((a: any, b: any) => a.number - b.number);
            for(let size of color.sizes){
                colorsObj[color.type['en']]
                ? colorsObj[color.type['en']].push(size.number)
                : colorsObj[color.type['en']] = [size.number];
            }

            sizesJsxObj[color.type['en']] = sizes.map((size: number, i: number) =>
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

            frontBase64ImagesObj[color.type['en']] = color.image_front_base64;
            color.sizes.forEach((size: any) => {
                sizesObj[`${color.type['en']}-${size.number}`] = {
                price: size.price,
                variant_id: size.variant_id,
                stock: size.stock,
                color: color.type['en'],
                };
            });
                
        });
    }

    const mainContent = (
        <main className="container mx-auto bg-white lg:gap-y-28 gap-y-14 w-full min-h-screen md:px-7 px-2 max-w-7xl lg:pt-0 pt-8 flex flex-col">
            <section className="flex lg:flex-row flex-col gap-y-7">
                <article className={`flex flex-col gap-y-2 w-full lg:w-[46%] ${articleIsNotSticky ? '' : 'lg:sticky lg:top-0'} lg:h-full lg:pt-8`}>
                    <Swiper
                    modules={[Pagination, Navigation]}
                    key={selectedColor}
                    slidesPerView={1}
                    pagination={{
                        clickable: true,
                        el: '.custom-pagination',
                        renderBullet: (index, className) => {
                            const images = frontBase64ImagesObj[selectedColor] ? frontBase64ImagesObj[selectedColor] : imageFrontBase64;

                            return `<span class="${className}" style="background-image: url(${images[index]}) !important;"></span>`;
                        },
                    }}
                    navigation
                    className="lg:h-[480px] h-64 w-full"
                    >
                        {(frontBase64ImagesObj[selectedColor] ? frontBase64ImagesObj[selectedColor] : imageFrontBase64).map((image: string, i: number) => (
                            <SwiperSlide key={i}>
                            <div
                                id="image-zoom"
                                className={`${
                                dragActivated ? "cursor-grab" : "cursor-zoom-in"
                                } relative h-full flex flex-row`}
                                style={
                                {
                                    "--url": `url(${image})`,
                                    "--zoom-x": "0%",
                                    "--zoom-y": "0%",
                                    "--display": "none",
                                } as React.CSSProperties
                                }
                                onDrag={(e) => {
                                    if (dragActivated) {
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

                                    setDragActivated((prevState) => !prevState);
                                }}
                                onMouseLeave={(e) => {
                                const item = e.currentTarget;
                                setDragActivated(false);
                                item.style.setProperty("--display", "none");
                                }}
                            >
                                <div className="w-[10%]"></div>
                                <div className="relative w-[80%] h-full">
                                    <Image
                                        src={image}
                                        alt={`Slide ${i+1}`}
                                        fill
                                        className="object-cover"
                                        role="presentation"
                                    />
                                </div>
                                <div className="w-[10%]"></div>
                            </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="custom-pagination"></div>
                </article>

                <section className=" w-full lg:px-12 px-6 lg:w-[54%] lg:h-full lg:pt-8 flex flex-col gap-y-5">
                    <header className="flex flex-col items-start gap-y-0">
                        <h2 className="font-sans text-xs text-gray-400 font-thin">
                        OYINYE COUTURE
                        </h2>
                        <h1 className="font-medium font-sans lg:text-4xl text-2xl">
                        {productTitle[lang].charAt(0).toUpperCase() +
                            productTitle[lang].replace("-", " ").slice(1) }
                        </h1>
                    </header>

                    <div className="text-lg text-gray-600 flex flex-row gap-x-4 font-sans items-center">
                        <h2 className="font-sans font-bold text-black">
                        &#8358;
                        {(
                            sizesObj[`${selectedColor}-${selectedSize}`]?.price ?? 0
                        ).toLocaleString("en-US")}
                        </h2>
                        {(sizesObj[`${selectedColor}-${selectedSize}`]?.stock ?? 0) ===
                        0 && (
                        <h2 className="bg-red-600 text-white h-6 px-2 py-1 w-[70px] text-sm text-center font-semibold flex items-center justify-center">
                            {t('detail.soldout.text')}
                        </h2>
                        )}
                    </div>
                    <p className="text-sm">
                        <Link
                        href={`/pages/shipping-policy`}
                        className="underline text-gray-500 text-sm font-sans"
                        >
                        {t('detail.shipping.p1')}
                        </Link>{" "}
                        {t('detail.shipping.p2')}

                    </p>
                    <div
                        className="flex flex-col items-start gap-y-2"
                        id="color-list"
                    >
                        <h1 className="text-sm text-gray-500">{t('detail.section1.header')}</h1>
                        <div className="flex flex-row justify-start gap-x-2 flex-wrap gap-y-2">
                        {colorsData &&
                            colorsData.map((color: any, i: number) =>
                            (sizesObj[`${selectedColor}-${selectedSize}`]?.stock ?? 0) ===
                            0 ? (
                                <span
                                key={i}
                                onClick={handleColorChange}
                                className={
                                    color.is_available && i === 0
                                    ? `cursor-pointer bg-black px-6 py-2 rounded-3xl text-gray-400 line-through`
                                    : `cursor-pointer bg-transparent border border-gray-200 px-6 py-2 rounded-3xl text-gray-400 line-through`
                                }
                                >
                                {color.type['en']}
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
                                {color.type['en']}
                                </span>
                            )
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-y-2" id="size-list">
                        <h1 className="text-sm text-gray-500">{t('detail.section2.header')}</h1>
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
                    </div>
                    <div className="flex flex-col items-start gap-y-2 relative ">
                        <h1 className="text-sm text-gray-500">{t('detail.section3.header')}</h1>
                        <div className="flex flex-row gap-x-7 text-gray-600 border border-gray-600 px-5 py-2 w-36 h-12 items-center">
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
                            className="text-lg font-sans text-gray-600 font-semibold"
                        >
                            -
                        </button>
                        <div className="w-14"></div>
                        <button
                            className="text-lg font-sans cursor-pointer text-gray-600 font-semibold"
                            onClick={() => {
                                setQuantity((prevState) => parseInt(prevState) + 1 + "");

                            }}
                        >
                            +
                        </button>
                        </div>
                        <input
                        onBlur={(e) => {
                            const el = e.currentTarget;
                            el.classList.add("border-none");
                            el.style.setProperty("height", "48px");
                            el.classList.remove("shadow-4xl");
                            el.style.setProperty("left", "42px");
                            el.style.setProperty("bottom", "0");
                            el.style.setProperty("background-color", "transparent");
                        }}
                        onFocus={(e) => {
                            const el = e.currentTarget;
                            el.classList.remove("border-none");
                            el.style.setProperty("height", "58px");
                            el.classList.add("shadow-4xl");
                            el.classList.add("border-2");
                            el.classList.add("border-[#665d5d]");
                            el.style.setProperty("left", "42px");
                            el.style.setProperty("bottom", "-5px");
                            el.style.setProperty("background-color", "white");
                        }}
                        onChange={(e) => {
                            const input = e.currentTarget;
                            if (!regex.test(input.value)) {
                                input.value = '';
                            } else {
                                setQuantity(input.value);
                            }
                        }}

                        className="bg-transparent w-14 absolute left-[42px] bottom-0 border-none h-12
                                    text-sm font-sans text-gray-600 focus:outline-none text-center z-10
                                    p-2"
                        value={quantity}
                        />
                    </div>
                    <div className="mt-2 flex flex-col gap-y-3 lg:w-[80%] w-full">
                        {toastError && <div className="flex flex-row gap-x-2 text-sm font-sans items-center">
                            <i className="fa-solid fa-circle-exclamation text-red-600"></i>
                            <p className="text-gray-400">{t('detail.warning.p1')} {productTitle[lang]} {t('detail.warning.p2')}</p>
                        </div>}
                        <button className="font-sans lg:px-44 px-28 py-2 ring-gray-600 hover:ring-1 border border-gray-600 text-gray-600 flex flex-row justify-center items-center"
                            onClick={() => {
                                if(items.some((item: any) => item.variantId === sizesObj[`${selectedColor}-${selectedSize}`].variant_id)){
                                    setToastError(true);
                                }else{
                                    //adding item to cart
                                    addItem({
                                        price:
                                        sizesObj[`${selectedColor}-${selectedSize}`].price,
                                        quantity: parseInt(quantity),
                                        variantId: sizesObj[`${selectedColor}-${selectedSize}`].variant_id,
                                        id: productId,
                                    });
                                    //sending cart data to data layer
                                    setIsSavingCart(true);
                                }
                            }}
                        >{loader ?  <div className="loader" ></div> : <span>{t('detail.action.text1')}</span>}</button>
                        <button onClick={async() => {
                            try {
                                setIsBuyingNow(true);
                                await axios.post('/api/products/cart', {
                                    price: sizesObj[`${selectedColor}-${selectedSize}`]?.price ?? 0, quantity: parseInt(quantity), variantId: paramsId, id: productId, totalAmount:  sizesObj[`${selectedColor}-${selectedSize}`]?.price ?? 0 * parseInt(quantity)
                                });
                                await axios.patch('/api/products/cart/update');

                                const res = await axios.get('/api/checkouts');
                        
                                router.push(`/checkouts/cn/${res.data.checkout_session_token}`);
                               } catch (error: any) {
                                toast.error(error);
                               }
                        }} className="font-sans lg:px-44 px-28 py-2 ring-[#5a31f4] hover:bg-[#512bd8] hover:ring-1 bg-[#5a31f4] text-white">{isBuyingNow ?  <div className="loader" ></div> : <span>{t('detail.action.text2')}</span>}</button>
                    </div>
                    <div className="gap-y-3 mt-3 w-full flex flex-col">
                        <div className="flex flex-col gap-y-2">
                            <header 
                                onClick={(e) => {
                                    let downAngle = e.currentTarget.querySelector("header i");
                                    let header = e.currentTarget;
                                    let content = document.querySelector("#sizes-content");

                                    if (downAngle && header && content) {
                                        if (!downAngle.classList.contains("ad-rotate")) {
                                            downAngle.classList.add("ad-rotate");
                                            downAngle.classList.remove("ad-rotate-anticlock");
                                            content.classList.add("show-chart");
                                            content.classList.remove("hide-chart");
                                        } else {
                                            downAngle.classList.remove("ad-rotate");
                                            downAngle.classList.add("ad-rotate-anticlock");
                                            content.classList.remove("show-chart");
                                            content.classList.add("hide-chart");
                                        }
                                    }
                                }}
                                className="py-4 cursor-pointer flex flex-row justify-between items-center pr-4 border border-l-0 border-r-0 border-b-0 border-gray-200">
                                <h1 className="flex flex-row gap-x-3">
                                    <Image src={Ruler} alt='ruler' role='presentation' className="w-6 lg:w-[28px]"/>
                                    <span className="text-gray-500 font-sans lg:text-lg text-[1rem]">{t('detail.section4.header')}</span>
                                </h1>
                                <i className={`fa-angle-down fa-solid text-sm text-gray-500`}></i>
                            </header>
                            <div id='sizes-content' className="border border-gray-200 pt-3 pb-6 px-5 lg:ml-3 lg:mr-12 mr-5 flex-col gap-y-4 hidden">
                                <header className="flex flex-row justify-between">
                                    <div className="lg:w-[65%] w-[60%]"></div>
                                    <Image src={Logo} alt="logo" role='presentation' width={240} className="lg:w-[35%] w-[40%]"/>
                                </header>
                                <div className="flex flex-col items-start w-full gap-y-1">
                                    <header className="w-full flex flex-col gap-y-5">
                                        <h5 className="text-[.5rem] font-sans font-thin pl-1">WWW.OYINYE.COM</h5>
                                        <table className="w-full border-separate border-spacing-x-1">
                                            <thead>
                                                <tr>
                                                    <th className="text-[.7rem] text-white text-center bg-black w-[31%]"></th>
                                                    <th className="text-[.7rem] text-white text-center bg-black w-[11.5%] py-1">XS</th>
                                                    <th className="text-[.7rem] text-white text-center bg-black w-[11.5%] py-1">S</th>
                                                    <th className="text-[.7rem] text-white text-center bg-black w-[11.5%] py-1">M</th>
                                                    <th className="text-[.7rem] text-white text-center bg-black w-[11.5%] py-1">L</th>
                                                    <th className="text-[.7rem] text-white text-center bg-black w-[11.5%] py-1">XL</th>
                                                    <th className="text-[.7rem] text-white text-center bg-black w-[11.5%] py-1">XXL</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </header>
                                    <table className="w-full border-separate border-spacing-1">
                                        
                                        <tbody>
                                            <tr >
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[31%] font-bold">BUST</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">33</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">35</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">37</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">39</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">41</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">43</td>
                                            </tr>
                                            <tr>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[31%] font-bold">WAIST</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">26</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">28</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">31</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">32</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">34</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">36</td>
                                            </tr>
                                            <tr>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[31%] font-bold">HIP</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">38</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">40</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">42</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">44</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">46</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">48</td>
                                            </tr>
                                            <tr>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[31%] font-bold">INSEAM</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">35.5</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">35.5</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">35.5</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">35.5</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">35.5</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">35.5</td>
                                            </tr>
                                            <tr>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[31%] font-bold">DRESS SIZE (US)</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">4</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">6</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">8</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">10</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">12</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">14</td>
                                            </tr>
                                            <tr>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[31%] font-bold">DRESS SIZE (UK)</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">8</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">10</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">12</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">14</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">16</td>
                                                <td className="text-[.7rem] text-black text-center bg-transparent border border-gray-400 w-[11.5%] py-1 font-medium">18</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div>
                            <header 
                                onClick={(e) => {
                                    let downAngle = e.currentTarget.querySelector("header i");
                                    let header = e.currentTarget;
                                    let content = header.parentNode?.querySelector("#shipping-content");

                                    if (downAngle && header) {
                                    if (!downAngle.classList.contains("ad-rotate")) {
                                        downAngle.classList.add("ad-rotate");
                                        downAngle.classList.remove("ad-rotate-anticlock");
                                        content?.classList.add("show-chart");
                                        content?.classList.remove("hide-chart");
                                    } else {
                                        downAngle.classList.remove("ad-rotate");
                                        downAngle.classList.add("ad-rotate-anticlock");
                                        content?.classList.remove("show-chart");
                                        content?.classList.add("hide-chart");
                                    }
                                    }
                                }} className="py-4 cursor-pointer flex flex-row justify-between items-center pr-4 border border-l-0 border-r-0 border-b-0 border-gray-200">
                                <h1 className="flex flex-row gap-x-3">
                                    <Image src={Truck} alt='delivery-truck' role='presentation' className="w-6 lg:w-[28px]"/>
                                    <span className="text-gray-500 font-sans lg:text-lg text-[1rem]">{t('detail.section5.header')}</span>
                                </h1>
                                <i className={`fa-angle-down fa-solid text-sm text-gray-500`}></i>
                            </header>
                            
                        </div>
                    </div>
                </section>
            </section>
            <section className="flex flex-col lg:items-start items-center gap-y-5 font-sans">
                {relatedProducts.length > 0 && <>
                    <header className="text-2xl">{t('detail.section6.header')}</header>
                    <section className="flex flex-row items-center justify-evenly flex-wrap gap-x-2 gap-y-4">
                    {relatedProducts.slice(0, 4).map((product: any, i: number) => <Product key={i} product={product} isOnDetailPage={true}/>)}
                    </section>
                </>}
                <Reviews productReviews={productReviews} product={productTitle[lang]}/>
            </section>
        </main>
    );

    return mainContent;
};

export default ProductDetail;
