'use client';

import { emailPattern, extractProductDetails, regex } from "@/helpers/getHelpers";
import { Base64ImagesObj, CartItemObj} from "@/interfaces";
import useCart from "@/store/useCart";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import './Cart.css';
import { useRouter } from "next/navigation";
import Link from "next/link";
import useWindowWidth from "../helpers/getWindowWidth";

interface InitialCartData {
    price: number, 
    quantity: number, 
    variantId: string, 
    id?: string, 
    totalAmount?: number
};

export default function CartInfo({
    total,
    cartItems,
    userEmail
}: any){
    let cartItemObj: CartItemObj = {};
    let timerId: NodeJS.Timeout | null  = null;

    let frontBase64ImagesObj: Base64ImagesObj = {};

    const {deductItem, addItem, updateCart} = useCart();

    const [loader, setLoader] = useState(false);
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const [isCreatingUserProfile, setIsCreatingUserProfile] = useState(false);
    const [totalAmount, setTotalAmount] = useState(total);
    const [cartI, setCartI] = useState(cartItems);
    const [isIncrementingCart, setIsIncrementingCart] = useState<InitialCartData>();
    const router = useRouter();
    const [email, setEmail] = useState(userEmail);
    const [isDeductingCart, setIsDeductingCart] = useState<InitialCartData>();
    let windowWidth = useWindowWidth();
    
    if(cartI.length > 0){

        //extracting product details to populate the cart page
        extractProductDetails(cartI, cartItemObj, frontBase64ImagesObj);
    }
    const [quantities, setQuantities] = useState<number[]>(Object.values(cartItemObj).map((item: any) => item.quantity));
    const [itemTotalAmounts, setItemTotalAmounts] = useState<number[]>(Object.values(cartItemObj).map((item: any) => item.quantity * item.price));
           

    useEffect(() => {
        async function sendCartData(){
            if(isIncrementingCart){
                setLoader(true);
                try {
                    const res = await axios.post('/api/products/cart', {
                        price: isIncrementingCart.price,
                        quantity: isIncrementingCart.quantity,
                        variantId: isIncrementingCart.variantId,
                        id: isIncrementingCart.id,
                        totalAmount: isIncrementingCart.totalAmount
                       });
                    const items = res.data.items;

                    //reseting objects for new data entry
                    cartItemObj = {};
                    frontBase64ImagesObj = {};

                    setCartI(items);
                    updateCart(items);
                    extractProductDetails(items, cartItemObj, frontBase64ImagesObj);
                    setQuantities(Object.values(cartItemObj).map((item: any) => item.quantity));
                    setItemTotalAmounts(Object.values(cartItemObj).map((item: any) => item.quantity * item.price));
                    setTotalAmount(res.data.totalAmount);
                

                } catch (error: any) {
                    toast.error(error.message);
                }finally{
                    setLoader(false);
                    setIsIncrementingCart(undefined);
                }

            }
        }

        sendCartData();

    }, [isIncrementingCart]);
    
    useEffect(() => {
        async function removeCartData(){
            if(isDeductingCart){
                setLoader(true);
                try {
                   const res =  await axios.post(`/api/products/cart/remove`, {
                    price: isDeductingCart.price,
                    quantity: isDeductingCart.quantity,
                    variantId: isDeductingCart.variantId
                   });
                   const items = res.data.items;

                    //reseting objects for new data entry
                    cartItemObj = {};
                    frontBase64ImagesObj = {};

                    setCartI(items);
                    updateCart(items);
                    extractProductDetails(items, cartItemObj, frontBase64ImagesObj);
                    setQuantities(Object.values(cartItemObj).map((item: any) => item.quantity));
                    setItemTotalAmounts(Object.values(cartItemObj).map((item: any) => item.quantity * item.price));
                    setTotalAmount(res.data.totalAmount);
                } catch (error: any) {
                    toast.error(error.message);
                }finally{
                    setLoader(false);
                    setIsDeductingCart(undefined);
                }
            }
        }

        removeCartData();

    }, [isDeductingCart]);


    useEffect(() => {
        setIsCreatingUserProfile(true);
        
        timerId = setTimeout(async () => {
            if(emailPattern.test(email)){
                try {
                    const res = await axios.post('/api/users/signup', {
                        email
                    });
                    
                    if(res.data.id){
                        await axios.patch('/api/products/cart/update', {
                            userId: res.data.id
                        });
                    }
                } catch (error: any) {
                    toast.error(error.message);
                }finally{
                    setIsCreatingUserProfile(false);
                }
            }
        }, 3000);
        

        return () => {
            if(timerId){
                clearTimeout(timerId);
            }
        };

    }, [email]);

    const handleQuantityChange = (index: number, delta: number, price: number, variantId: string, id: string, total: number) => {
        setQuantities(prevQuantities => {
            const newQuantities = [...prevQuantities];
            newQuantities[index] = Math.max(newQuantities[index] + delta, 1); // Ensure quantity is at least 1
            
            return newQuantities;
        });
        
        if(delta === -1){
            if(quantities[index] > 1){
                deductItem(variantId, Math.abs(delta), price);
                //updating cart data in backend
                setIsDeductingCart({
                    quantity: Math.abs(delta),
                    variantId,
                    price
                });
            }
        }else{
            if(quantities[index] >= 1){
                addItem({
                    price,
                    quantity: delta,
                    variantId,
                });
                //sending cart data to backend 
                setIsIncrementingCart({
                    price,
                    quantity: delta,
                    variantId,
                    id,
                    totalAmount: total
                });
            }
        }
    };

    const handleCheckout = async () => {
        //validation checks
        if(!email){
            return toast.error("You're email is missing");
        }
        if(!email.includes('@')){
            return toast.error("Invalid email");
        }

        if(isCreatingUserProfile){
            return;
        }

       try {
        setIsCreatingCheckout(true);
        const res = await axios.get('/api/checkouts');

        router.push(`/checkouts/cn/${res.data.checkout_session_token}`);
       } catch (error: any) {
        toast.error(error);
       }
    }

    

    return (
        <>

        {
            totalAmount === 0
            ?  <main className="min-h-screen w-full container mx-auto md:px-16 px-8 md:pt-12 pt-5 flex flex-col gap-y-5 justify-center items-center">
                <i className="fa-solid cursor-pointer fa-bag-shopping text-gray-600 text-3xl"></i>
                <h1 className="font-sans text-2xl italic">Cart is Empty!</h1>
                <button className="bg-gray-700 text-[1rem] font-sans text-white px-7 py-3 hover:ring-2 ring-gray-700 border-0">Start shopping</button>
            </main>
            : <main className="min-h-screen w-full container mx-auto md:pl-16 px-8 md:pt-12 py-5 flex flex-col gap-y-9">
                <header className="flex md:flex-row flex-col gap-y-5 justify-between items-start md:items-center pt-6 w-full">
                    <h1 className="font-sans md:text-4xl text-2xl text-gray-600">Your Cart</h1>
                    <div className="inline-flex flex-col gap-y-1 md:w-[40%] w-full text-gray-600">
                        <h1 className="font-semibold md:text-lg text-sm">Contact</h1>
                        <div id='email-container' className="flex flex-row justify-between items-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-12">
                            <div className="flex flex-col justify-center w-full">
                                <label htmlFor="email" className="text-xs hide-label text-gray-500">
                                    Email
                                </label>
                                <input
                                    placeholder="Email"
                                    onBlur={(e) => {
                                        let item = e.currentTarget;
                                        item.placeholder = "Email";
                                        let label = item.previousElementSibling;
                                        if (label && item.value.length === 0) {
                                            label.classList.add("hide-label");
                                            label.classList.remove("show-label");
                                        }

                                        if(!e.target.value.includes('@')){
                                            document.querySelector('#email-error')?.classList.remove('hidden');
                                            document.querySelector('#email-container')?.classList.remove('border-gray-300', 'border');
                                            document.querySelector('#email-container')?.classList.add('border-red-500', 'border-2');
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

                                        document.querySelector('#email-error')?.classList.add('hidden');
                                        document.querySelector('#email-container')?.classList.add('border-gray-300', 'border');
                                        document.querySelector('#email-container')?.classList.remove('border-red-500', 'border-2');
                                    }}
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                                />
                            </div>
                            {windowWidth > 768 && <span className="icon-container">
                                <i className="fa-regular fa-circle-question cursor-pointer"></i>
                                <span className="hint text-[.7rem]">
                                    In case we need to contact you about your cart
                                </span>
                            </span>}
                        </div>
                        <p id='email-error' className="text-red-600 text-sm font-sans hidden">Enter a valid email</p>
                    </div>
                </header>
                <section className="w-ful">
                    
                    <header className="w-full flex flex-row justify-between items-center font-sans text-xs text-gray-400 font-extralight
                    border-[0.7px] border-gray-300 border-l-0 border-r-0 border-t-0 py-5">
                        <h3 className="tracking-widest md:w-[65%] w-[90%]">PRODUCT</h3>
                        <div className="inline-flex flex-row justify-between items-center md:gap-x-32 gap-x-8 md:w-[35%] w-[10%]">
                            <h3 className="tracking-widest md:inline-block hidden">QUANTITY</h3>
                            <h3 className="tracking-widest">TOTAL</h3>
                        </div>
                    </header>
                    {loader && <div className="trailing-progress-bar">
                        <div className="trailing-progress" ></div>
                    </div>}
                    {Object.values(cartItemObj).map((item: any, i: number) => quantities[i] > 0 && <section key={i}
                        className="border-[0.7px] border-gray-300 border-l-0 border-r-0 border-t-0 w-full py-7"
                    >
                        <section className="flex md:flex-row flex-col justify-between md:items-center items-start w-full gap-y-4">
                            <article className="md:w-[62%] w-full flex-row flex justify-between items-start cursor-pointer"
                                onClick={() => router.push(`/products/${item.title.replace(' ', '-').toLowerCase()}/${item.color.toLowerCase()}/${item.variantId}`)}
                                >
                                <div className="flex flex-row md:gap-x-7 gap-x-3 items-start">
                                    <Image src={Object.values(frontBase64ImagesObj)[i][0]} width={100} height={175} alt={`cart-item${i+1}`}/>
                                    <div className="font-sans inline-block">
                                        <h3 className="text-[1rem] font-normal">{item.title}</h3>
                                        <p className="text-sm font-extralight">&#8358;{item.price}</p>
                                        <p className="text-sm font-extralight">Color: {item.color}</p>
                                        <p className="text-sm font-extralight">Size: UK {item.number}</p>
                                    </div>
                                </div>
                                <h1 className="text-lg font-sans font-extralight md:hidden">&#8358;{(parseFloat(itemTotalAmounts[i].toFixed(2))).toLocaleString("en-US")}</h1>
                            </article>
                            <section className="inline-flex flex-row md:justify-between justify-end items-center md:gap-x-32 gap-x-8 md:w-[38%] w-full">
                                <div className="flex flex-row gap-x-6 items-center">
                                    <div className={`flex flex-col items-start gap-y-2 relative`}>
                                        <div className="flex flex-row gap-x-7 text-gray-600 border border-gray-600 px-5 py-2 w-36 h-12 items-center">
                                            <button
                                                onClick={() => handleQuantityChange(i, -1, item.price, item.variantId, item.id, totalAmount)}
                                                className={`text-lg font-sans text-gray-600 font-semibold ${loader ? 'cursor-not-allowed': 'cursor-pointer'}`}
                                                disabled={loader}

                                            >
                                                -
                                            </button>
                                            <div className="w-14"></div>
                                            <button
                                                className={`text-lg font-sans text-gray-600 font-semibold ${loader ? 'cursor-not-allowed': 'cursor-pointer'}`}
                                                disabled={loader}
                                                onClick={() => handleQuantityChange(i, 1, item.price, item.variantId, item.id, totalAmount)}
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

                                            if(quantities[i] < item.quantity){
                                                deductItem(item.variantId, item.quantity - quantities[i], item.price);
                                                //updating cart data in backend
                                                setIsDeductingCart({
                                                    quantity: item.quantity - quantities[i],
                                                    variantId: item.variantId,
                                                    price: item.price
        
                                                });
                                            }else{
                                                addItem({
                                                    price: item.price,
                                                    quantity: quantities[i] - item.quantity,
                                                    variantId: item.variantId,
                                                });
                                                //sending cart data to backend 
                                                setIsIncrementingCart({
                                                    price: item.price,
                                                    quantity:  quantities[i] - item.quantity,
                                                    variantId: item.variantId,
                                                    id: item.id,
                                                    totalAmount
                                                });
                                            }

                                        }}
                                        disabled={loader}
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

                                        onInput={(e) => {
                                            const el = e.currentTarget;

                                            if (!regex.test(el.value)) {
                                                el.value = '';
                                                return;
                                            }

                                            setQuantities(prevQuantities => {
                                                const newQuantities = [...prevQuantities];
                                                newQuantities[i] = parseInt(el.value); 
                                                
                                                return newQuantities;
                                            });

                                            
                                            
                                        }}
                                        
                                        className="bg-transparent w-14 absolute left-[42px] bottom-0 border-none h-12
                                            text-sm font-sans text-gray-600 focus:outline-none text-center z-10
                                            p-2"
                                        value={quantities[i]}
                                        />
                                    </div>
                                    <i className={`fa-solid fa-trash-can ${loader ? 'cursor-not-allowed' : ' cursor-pointer'} text-sm text-gray-600`} 
                                    onClick={() => {
                                        if(!loader){
                                            deductItem(item.variantId, quantities[i], item.price);
                                            //updating cart data in backend
                                            setIsDeductingCart({
                                                quantity: quantities[i],
                                                variantId: item.variantId,
                                                price: item.price
                                            });
                                        }
                                    }}></i>
                                </div>
                                <h1 className="text-lg font-sans font-extralight hidden md:inline-block text-start">&#8358;{(parseFloat(itemTotalAmounts[i].toFixed(2))).toLocaleString("en-US")}</h1>
                            </section>
                        </section>

                    </section>)}
                </section>
                <footer className="w-full flex md:items-end flex-col font-sans gap-y-5 items-stretch">
                    <div className="inline-flex flex-col md:items-end items-center">
                        <p className="md:text-[1rem] text-xs font-extralight">SUBTOTAL&nbsp;&nbsp;&nbsp;<span className="md:text-2xl text-xl font-normal">&#8358;{totalAmount.toLocaleString("en-US")}</span></p>
                        <p className="italic md:text-[1rem] text-xs font-light underline underline-offset-1 cursor-pointer">Shipping &#38; taxes calculated at checkout</p>
                    </div>
                    <button onClick={handleCheckout} disabled={loader} className={` text-white text-sm px-24 py-3 flex flex-row justify-center items-center ${isCreatingCheckout ? 'md:w-[256px]': ''} ${loader ? 'bg-gray-200 cursor-not-allowed': 'bg-gray-700 hover:ring-gray-700 cursor-pointer hover:ring-2'}`}>{isCreatingCheckout ? <div className="border-2 border-transparent rounded-full border-t-white border-r-white w-[15px] h-[15px] spin"></div> : 'CHECKOUT'}</button>
                </footer>
            </main>
            
        }    
    
        </>
    );
}