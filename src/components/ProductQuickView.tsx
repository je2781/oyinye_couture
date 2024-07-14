'use client';

import { useEffect } from "react";
import Image from "next/image";
import React from "react";
import Modal from "./ui/Modal";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { Pagination, Navigation } from 'swiper/modules';
import useCart from "@/store/useCart";
import Link from "next/link";
import { Base64ImagesObj, SizesJsxObj, SizesObj } from "@/interfaces";
import { useRouter } from "next/navigation";
import useAuth from "@/store/useAuth";


const sizes = [8, 10, 12, 14, 16, 18];

const ProductQuickView = ({ product, onHideModal }: any) => {
    const {totalAmount, addItem, items} = useCart();
    const {authStatus} = useAuth();
    const [quantity, setQuantity] = React.useState('1');
    const [selectedColor, setSelectedColor] = React.useState(product.colors[0].type);

    //sorting extracted sizes for all dress colors
    for(let color of product.colors){
        color.sizes = color.sizes.filter((size: any) => size.stock > 0);
        color.sizes.sort((a: any, b: any) => a.number - b.number);
    }

    const [selectedSize, setSelectedSize] = React.useState<string>(product.colors[0].sizes[0].number.toString());
    const [progressIndicator, setProgressIndicator] = React.useState(false);
    const [toastMsgVisible, setToastMsgVisible] = React.useState(false);

    const router = useRouter();


    let sizesJsxObj: SizesJsxObj  = {};
    let sizesObj: SizesObj  = {};
    let frontBase64ImagesObj: Base64ImagesObj = {};

    function handleColorChange(e: React.MouseEvent){
        let activeColorEl = e.currentTarget as HTMLSpanElement;

        let colorNodeList = activeColorEl.parentNode!.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
        let otherColorEls = Array.from(colorNodeList);
        let sizeNodeList = activeColorEl.closest('p')!.parentNode!.querySelectorAll('#size-list > div > span') as NodeListOf<HTMLSpanElement>;
        let sizeEls = Array.from(sizeNodeList);

        otherColorEls.forEach(el => {
            if(el.classList.contains('bg-black')){
                el.style.setProperty('background-color', 'transparent');
                el.style.setProperty('color', 'rgb(75 85 99 )');
                el.classList.add('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
                el.classList.remove('bg-black');
            }
        });

        activeColorEl.style.setProperty('background-color', 'black');
        activeColorEl.style.setProperty('color', 'white');
        activeColorEl.classList.remove('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
        activeColorEl.classList.add('bg-black');

        /**updating active dress color ***/
        for(let color of product.colors){
            if(color.type === activeColorEl.innerText && !color.sizes.some((size: any) => size.number === parseInt(selectedSize))){
                //setting properties of size element not contained in active dress color to 'not in stock'
                sizeEls.forEach(el => {
                    if(el.classList.contains('bg-black')){
                        el.style.setProperty('background-color', 'transparent');
                        el.style.setProperty('color', 'rgb(156 163 175)');
                        el.classList.add('border', 'border-gray-200');
                    }
                });

                sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].style.setProperty('background-color', 'black');
                sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].style.setProperty('color', 'white');
                sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === color.sizes[0].number.toString())].classList.add('border', 'none');

                // for(let size of color.sizes.slice(1)){
                //     sizeEls[sizeEls.findIndex(el => el.innerText.split(' ')[1] === size.number.toString())].style.setProperty('color', 'rgb(75 85 99)');
                // }
                
                setSelectedSize(color.sizes[0].number.toString());

                
            }
        }
        setSelectedColor(activeColorEl.innerText);

        
    }

    function handleSizeChange(e: React.MouseEvent){
        let activeSizeEl = e.currentTarget as HTMLSpanElement;

        let nodeList = activeSizeEl.parentNode!.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;
        let otherSizeEls = Array.from(nodeList);

        otherSizeEls.forEach(el => {
            if(el.classList.contains('bg-black')){
                el.style.setProperty('background-color', 'transparent');
                el.style.setProperty('color', 'rgb(75 85 99 )');
                el.classList.add('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
            }
        });

        activeSizeEl.style.setProperty('background-color', 'black');
        activeSizeEl.style.setProperty('color', 'white');
        activeSizeEl.classList.remove('border', 'border-gray-600' , 'hover:ring-1', 'ring-gray-600');
        activeSizeEl.classList.add('bg-black');
        //updating active dress size
        setSelectedSize(activeSizeEl.innerText.split(' ')[1]);
    }

    product.colors.forEach((color: any, i: number) => {
        sizesJsxObj[color.type] = sizes.map((size: number, i: number) => color.sizes[0] && color.sizes[0].number === size && color.sizes[0].stock === 0 && color.isAvailable ?
        <span key={i} className='font-sans bg-black px-6 py-2 rounded-3xl cursor-pointer text-gray-400 line-through'>UK {size}</span>
        : color.sizes[0] && color.sizes[0].number === size && color.sizes[0].stock > 0 && color.isAvailable ?
        <span key={i} onClick={handleSizeChange} className='font-sans bg-black px-6 py-2 rounded-3xl cursor-pointer text-white'>UK {size}</span>
        : color.sizes[1] && color.sizes[1].number === size && color.sizes[1].stock > 0 && color.isAvailable ?
        <span key={i} onClick={handleSizeChange} className='font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600'>UK {size}</span>
        : color.sizes[2] && color.sizes[2].number === size && color.sizes[2].stock > 0 && color.isAvailable ?
        <span key={i} onClick={handleSizeChange} className='font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600'>UK {size}</span>
        : color.sizes[3] && color.sizes[3].number === size && color.sizes[3].stock > 0 && color.isAvailable ?
        <span key={i} onClick={handleSizeChange} className='font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600'>UK {size}</span>
        : color.sizes[4] && color.sizes[4].number === size && color.sizes[4].stock > 0 && color.isAvailable ?
        <span key={i} onClick={handleSizeChange} className='font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600'>UK {size}</span>
        : color.sizes[5] && color.sizes[5].number === size && color.sizes[5].stock > 0 && color.isAvailable ?
        <span key={i} onClick={handleSizeChange} className='font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600'>UK {size}</span>
       
        : <span key={i} className='font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-400 line-through border border-gray-200'>UK {size}</span>
         
        );

        frontBase64ImagesObj[color.type] = color.imageFrontBase64;
        color.sizes.forEach((size: any) => {
            sizesObj[`${color.type}-${size.number}`] =  {
                price: size.price,
                id: size.id.toString(),
                stock: size.stock
            };
        });
        
    });

    return (
        <Modal onClose={onHideModal}>
            <Swiper
                modules={[Pagination, Navigation]}
                slidesPerView={1}
                pagination={{ clickable: true}}
                navigation
                className="h-full lg:w-[40%] w-full "

                >
                {(frontBase64ImagesObj[selectedColor] ? frontBase64ImagesObj[selectedColor] : product.colors[0].imageFrontBase64).map((image: string) => <SwiperSlide>
                    <div  id='image-zoom' className="relative cursor-zoom-in h-full"
                        style={{ "--url": `url(${image})`, "--zoom-x": "0%", "--zoom-y": "0%", "--display": "none" } as React.CSSProperties}
                        onMouseMove={(e) => {
                            const item = e.currentTarget;
                            item.style.setProperty('--display', 'block');
                            let pointer = {
                                x: (e.nativeEvent.offsetX * 100)/ e.currentTarget.offsetWidth,
                                y: (e.nativeEvent.offsetY * 100)/ e.currentTarget.offsetHeight,
                            }
                    
                            item.style.setProperty('--zoom-x', `${pointer.x}` + "%");
                            item.style.setProperty('--zoom-y', `${pointer.y}` + "%");
                        }}
                        onMouseLeave={(e) => {
                            const item = e.currentTarget;
                            item.style.setProperty('--display', 'none');

                        }}
                    >
                        <img
                        src={image}
                        alt="featured-Image"
                        className="w-full h-full object-cover"
                        />
                    </div>
                </SwiperSlide>)}
            </Swiper>
                
            <section className="lg:p-12 p-6 bg-white lg:w-[60%] h-full flex flex-col w-full gap-y-5 overflow-y-scroll">
                <header className="flex flex-col items-start gap-y-0">
                    <h3 className="font-sans text-xs text-gray-400 font-thin">OYINYE COUTURE</h3>
                    <h1 className="font-medium font-sans lg:text-4xl text-2xl">{product.title}</h1>
                </header>
                <section className="border border-l-0 border-r-0 border-gray-300 w-full py-4 font-medium my-2 font-sans text-gray-600" id='go-to__ppage__section'>
                    <Link href={`/products/${product.title}?variant=${sizesObj[`${selectedColor}-${selectedSize}`].id}`} className="cursor-pointer"><i className="fa-solid fa-arrow-right-long text-gray-600"></i>&nbsp;&nbsp;Go to product page</Link>
                </section>
                <p className="text-lg text-gray-600 flex flex-row gap-x-4 font-sans items-center">
                    <h1 className="font-sans font-bold text-black">&#8358;{sizesObj[`${selectedColor}-${selectedSize}`].price.toLocaleString("en-US")}</h1>
                    {sizesObj[`${selectedColor}-${selectedSize}`].stock === 0 && <h3 className="bg-red-600 text-white h-6 px-2 py-1 w-[70px] text-sm text-center font-semibold flex items-center justify-center">Sold out</h3>}
                </p>
                <p className="text-sm"><Link href='/policies/shipping-policy' className="underline text-gray-500 text-sm font-sans">Shipping</Link> calculated at checkout</p>
                <p className="flex flex-col items-start gap-y-2" id='color-list'>
                    <h1 className="text-sm text-gray-500">Color</h1>
                    <div className="flex flex-row justify-start gap-x-2 flex-wrap gap-y-2">
                        {product.colors.map((color: any, i: number) => 
                        sizesObj[`${selectedColor}-${selectedSize}`].stock === 0 ?  
                        <span key={i} onClick={handleColorChange} className={`cursor-pointer bg-transparent px-6 py-2 rounded-3xl text-gray-400 border border-gray-200 line-through`}>{color.type}</span>
                        : <span key={i} onClick={handleColorChange} className={color.isAvailable && i === 0 ? `bg-black px-6 py-2 rounded-3xl text-white cursor-pointer` : color.isAvailable && i > 0 ? `cursor-pointer text-gray-600 border border-gray-600 hover:ring-1 ring-gray-600 px-6 py-2 rounded-3xl bg-transparent` : `cursor-pointer bg-transparent px-6 py-2 rounded-3xl text-gray-400 border border-gray-200 line-through`}>{color.type}</span>)}
                    </div>
                </p>
                <p className="flex flex-col items-start gap-y-2" id="size-list">
                    <h1 className="text-sm text-gray-500">Size</h1>
                    <div className="flex flex-row justify-start flex-wrap gap-x-2 gap-y-2">
                        {sizesJsxObj[selectedColor] ? sizesJsxObj[selectedColor] :
                        sizes.map((size: number) => <span className={`font-sans bg-transparent px-6 py-2 rounded-3xl cursor-pointer text-gray-400 line-through border border-gray-200`}>UK {size}</span>)
                    
                        } 
                    </div>
                
                </p>
                {/* <p className="flex flex-col items-start gap-y-2 relative ">
                    <h1 className="text-sm text-gray-500">Quantity</h1>
                    <div className="flex flex-row gap-x-7 text-gray-600 border border-gray-600 px-5 py-2 w-36 h-12 items-center">
                        <button onClick={() => {
                            setQuantity((prevState) => {
                                if(parseInt(prevState) === 1){
                                    return prevState;
                                }else{
                                    return (parseInt(prevState) - 1) + '';
                                }
                            });
                            
                        }} disabled={totalquantity === 0 ? true : false} className={totalquantity === 0 ? `text-lg font-sans text-gray-400 cursor-not-allowed` : `text-lg font-sans text-gray-600 font-semibold`}>
                        -</button>
                        <div className="w-14"></div>
                        <button className="text-lg font-sans cursor-pointer text-gray-600 font-semibold" onClick={() => {
                            setQuantity((prevState) => (parseInt(prevState) + 1) + '');
                            // addItem({
                            //     price: product.price,
                            //     quantity: parseInt(quantity),
                            //     id: product._id.toString()
                            // })
                        }}>+</button>
                    </div>
                    <input 
                        onBlur={(e) => {
                            const el = e.currentTarget;
                            el.classList.add('border-none');
                            el.style.setProperty('height', '48px');
                            el.classList.remove('shadow-4xl');
                            el.style.setProperty('left', '42px');
                            el.style.setProperty('bottom', '0');
                            el.style.setProperty('background-color', 'transparent');
                        }} 
                        onFocus={(e) => {
                            const el = e.currentTarget;
                            el.classList.remove('border-none');
                            el.style.setProperty('height', '58px');
                            el.classList.add('shadow-4xl');
                            el.classList.add('border-2');
                            el.classList.add('border-[#665d5d]');
                            el.style.setProperty('left', '42px');
                            el.style.setProperty('bottom', '-5px');
                            el.style.setProperty('background-color', 'white');
                        }}
                        onInput={(e) => {
                            const input = e.currentTarget;
                            const regex = /^[0-9]+$/;
                            if(!regex.test(input.value)){
                                input.value = '';
                            }else{
                                setQuantity(input.value);
                            }
                        }}
                        className="
                         bg-transparent w-14 absolute left-[42px] bottom-0 border-none h-12
                          text-sm font-sans text-gray-600 focus:outline-none text-center z-10
                         p-2" value={quantity}/>
                    
                </p> */}
                <p className="flex flex-row items-center justify-start gap-x-6 relative w-full mt-2">
                    <div className="flex flex-row">
                        <button onClick={() => {
                            setQuantity((prevState) => {
                                if(parseInt(prevState) === 1){
                                    return prevState;
                                }else{
                                    return (parseInt(prevState) - 1) + '';
                                }
                            });
                            
                        }} 
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.classList.add('mouseleave');
                            setTimeout(() => {
                                el.classList.remove('mouseleave');
                            }, 400); 
                        }}
                        className="font-sans relative rounded-[50%] px-[11px] py-[5px] bg-gray-100 cursor-pointer"
                        id='minus-icon'><i className="fa-solid fa-minus text-gray-600 text-xs relative"></i></button>
                        <input 
                        onBlur={(e) => {
                            const el = e.currentTarget;
                            el.classList.add('border-none');
                            el.classList.remove('shadow-md');
                    
                        }} 
                        onFocus={(e) => {
                            const el = e.currentTarget;
                            el.classList.remove('border-none');
                            el.classList.add('border');
                            el.classList.add('shadow-md');
                          
                        }}
                        onInput={(e) => {
                            const input = e.currentTarget;
                            const regex = /^[0-9]+$/;
                            if(!regex.test(input.value)){
                                input.value = '';
                            }else{
                                setQuantity(input.value);
                            }
                        }}
                        type="text"
                        className="
                         bg-transparent w-16
                          text-lg font-sans text-gray-600 focus:outline-none text-center
                         px-2" value={quantity}/>
                        <button 
                        onClick={() => {
                            setQuantity((prevState) => (parseInt(prevState) + 1) + '');
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.classList.add('mouseleave');
                            setTimeout(() => {
                                el.classList.remove('mouseleave');
                            }, 400); 
                        }}  
                        id='plus-icon' 
                        className="relative rounded-[50%] cursor-pointer px-[11px] py-[5px] bg-gray-100"><i className="fa-solid fa-plus text-gray-600 text-xs relative"></i></button>
                    </div>
                    { 
                        progressIndicator ?  <div className="progress-bar"></div>:
                        <button 
                        onClick={(e) => {
                            setProgressIndicator(true);
                            setTimeout(() => {
                                setProgressIndicator(false);
                                setToastMsgVisible(true);
                            }, 2000);
                            //adding item to cart
                            addItem({
                                price: sizesObj[`${selectedColor}-${selectedSize}`].price,
                                quantity: parseInt(quantity),
                                variantId: sizesObj[`${selectedColor}-${selectedSize}`].id,
                                id: product._id.toString()
                            });
                            
                        }} 
                        disabled={sizesObj[`${selectedColor}-${selectedSize}`].stock === 0 ? true : false} 
                        className={`${sizesObj[`${selectedColor}-${selectedSize}`].stock === 0 ? 'cursor-not-allowed' : ''} hover:opacity-70 px-6 py-3
                         text-blue-600 text-[1rem] font-sans`} id='add-to-cart'>Add To Cart</button>
                    }
                </p>
                {toastMsgVisible && <p className="border-[#a8e8e2] border bg-[#a8e8e226] px-4 py-3 font-sans text-[1rem] text-gray-500 font-light relative" id='toast-msg'>{product.title} has been added to your cart. <Link href='/cart' className="underline underline-offset-2">View Cart</Link></p>}
            </section>
        </Modal>
  );
};

export default ProductQuickView;
