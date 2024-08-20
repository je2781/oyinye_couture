
"use client";

import { Country, State, City } from "country-state-city";
import CountryFlagSvg from 'country-list-with-dial-code-and-flag/dist/flag-svg';
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Head from 'next/head';

import "./Checkout.css";
import PaymentLogo from "../../../public/streetzwyze.png";
import {
  convertToNumericCode,
  extractProductDetails,
  randomReference,
} from "@/helpers/getHelpers";
import { Base64ImagesObj, CartItemObj } from "@/interfaces";
import axios from "axios";
import toast from "react-hot-toast";
import useWindowWidth from "../helpers/getWindowWidth";
import { useRouter } from "next/navigation";

export default function Checkout({ cartItems, total, orderId, country, userEmail }: any) {
  let cartItemObj: CartItemObj = {};
  let tax = 250;

  let frontBase64ImagesObj: Base64ImagesObj = {};

  const router = useRouter();
  const [showFlag, setShowFlag] = React.useState({
    shipping: false,
    billing: false
  });
  const [loader, setLoader] = React.useState(false);
  const [transactionRef, setTransactionRef] = React.useState(randomReference());
  const [countryCode, setCountryCode] = React.useState('NG');
  const [countryName, setCountryName] = React.useState({
    shipping: Country.getCountryByCode(country)!.name,
    billing: Country.getCountryByCode(country)!.name
  });
  const [phone, setPhone] = React.useState({
    shipping: '',
    billing: ''
  });
  const [email, setEmail] = React.useState(userEmail);
  const [firstName, setFirstName] = React.useState({
    shipping: '',
    billing: ''
  });
  const [lastName, setLastName] = React.useState({
    shipping: '',
    billing: ''
  });
  const [company, setCompany] = React.useState({
    shipping: '',
    billing: ''
  });
  const [address, setAddress] = React.useState({
    shipping: '',
    billing: ''
  });
  const [apartment, setApartment] = React.useState({
    shipping: '',
    billing: ''
  });
  const [city, setCity] = React.useState({
    shipping: '',
    billing: ''
  });
  const [state, setState] = React.useState({
    shipping: '',
    billing: ''
  });
  const [postal, setPostal] = React.useState({
    shipping: '',
    billing: ''
  });
  const [paymentMethod, setPaymentMethod] = React.useState("interswitch");
  const [shippingMethod, setShippingMethod] = React.useState(5000);
  const [billing, setBilling] = React.useState("");
  const [phonePlaceholder, setPhonePlaceholder] = React.useState(
    "Phone: +234..."
  );
  let windowWidth = useWindowWidth();

  if (cartItems.length > 0) {
    //extracting product details to populate the cart page
    extractProductDetails(cartItems, cartItemObj, frontBase64ImagesObj);
  }
  const quantities = Object.values(cartItemObj).map((item: any) =>
    parseInt(item.quantity)
  );
  const itemTotalAmounts = Object.values(cartItemObj).map(
    (item: any) => parseFloat(item.quantity) * parseFloat(item.price)
  );

  React.useEffect(() => {
    (document.querySelector(".within-lagos-island-container > div > input") as HTMLInputElement).checked = true;
    (document.querySelector(".interswitch") as HTMLInputElement).checked = true;
    (document.querySelector(
      ".same-billing"
    ) as HTMLInputElement).checked = true;

    document.body.style.backgroundColor = "rgb(243, 244, 246 )";
    document.body.style.paddingTop = "0px";

    return () => {
      document.body.style.backgroundColor = "white";
      document.body.style.paddingTop = "96px";
    }
  }, []);
  
  async function completeOrder() {
    
    const errors = document.querySelectorAll(`[id$=error]`);
    const enableEmailMarketing = (document.querySelector(`[id=email-offers]`) as HTMLInputElement).checked;
    const saveBillingInfo = (document.querySelector(`[id=billing-save-info`) as HTMLInputElement).checked;
    const saveShippingInfo = (document.querySelector(`[id=save-info]`) as HTMLInputElement).checked;

    //validation check to see if checkout page has errors
    if(!email.includes('@') || phone.shipping.length < 10 || firstName.shipping.length === 0
      || lastName.shipping.length === 0 || company.shipping.length === 0 || address.shipping.length === 0
      || apartment.shipping.length === 0 || city.shipping.length === 0 || state.shipping.length === 0
      || postal.shipping.length === 0
    ){
      
      return toast.error('shipping data is missing vital info');
    }
    if((phone.billing.length < 10 || firstName.billing.length === 0
      || lastName.billing.length === 0 || company.billing.length === 0 || address.billing.length === 0
      || apartment.billing.length === 0 || city.billing.length === 0 || state.billing.length === 0
      || postal.billing.length === 0) && billing === 'different'
    ){
      
      return toast.error('billing data is missing vital info');
    }
    errors.forEach(error => {
      if(!error.classList.contains('hidden')){
        return toast.error('The values entered are invalid');
      }
    });

    try {
      setLoader(true);
      //creating user account
      await axios.post('/api/users/signup', {
        firstName,
        lastName,
        email,
        password: randomReference(),
        enableEmailMarketing
      });

      //updating order
      await axios.post('/api/orders', {
        shippingInfo: {
          firstName: firstName.shipping,
          lastName: lastName.shipping,
          company: company.shipping,
          address: address.shipping,
          apartment: apartment.shipping,
          city: city.shipping,
          state: state.shipping,
          postal: postal.shipping,
          country: countryName,
          contact: {
            email,
            phone: phone.shipping

          }
        },
        billingInfo: {
          firstName: firstName.billing,
          lastName: lastName.billing,
          company: company.billing,
          address: address.billing,
          apartment: apartment.billing,
          city: city.billing,
          state: state.billing,
          postal: postal.billing,
          country: countryName,
          contact: {
            email,
            phone: phone.billing

          }
        },
        saveBillingInfo,
        saveShippingInfo,
        paymentType: paymentMethod,
        status: 'pending payment',
        paymentStatus: 'pending',
        shippingMethod: shippingMethod === 5000 ? 'island' : shippingMethod === 8500 ? 'mainland' : 'outside'
      });
  
      
    } catch (error: any) {
      toast.error(error);
    }finally{
      setLoader(false);
      if(paymentMethod === 'streetzwyze'){
        router.push(`https://wa.me/+2349061681807?text=I%20want%20to%20make%20a%20purchase%20on%20your%20website%20for%20item(s)%20with%20id%20${orderId}`);
      }else{
        window.checkout(
          async (response) => {
            if (response.desc) {
              try {
                
                const res = await axios.post(`/api/orders/update/transaction-status`, {
                  txn_ref: transactionRef,
                  merchant_code: `${process.env.NEXT_PUBLIC_MER_CODE}`,
                  amount: parseFloat(total) * 100
                });
    
                if(res.status === 400){
                  toast.error(res.data.message);
                }else if(res.status === 201){
                  toast.success('Payment successful');
                }
              } catch (error: any) {
                toast.error(error);
              }
            }
          }
        );
      
      }
    }
  }

  return (
    <>
       
      <main className="min-h-screen w-full mx-auto flex md:flex-row flex-col">
        {windowWidth < 768 && <section className="flex flex-col">
          <header className="flex flex-row justify-between h-12 items-center px-7 w-full py-4 shadow-sm bg-gray-100">
            <div
            onClick={(e) => {
              let item = e.currentTarget;
              let summary = document.querySelector('#order-summary');
              let icon = item.querySelector('i');
              let header = item.querySelector('h5');

              if(summary && item && icon && header){
                if(summary.classList.contains('hide-summary')){
                  summary.classList.remove('hide-summary');
                  summary.classList.add('show-summary');
                  header.innerText= `Hide order summary`;
                  icon.classList.remove('fa-angle-down');
                  icon.classList.add('fa-angle-up');
                }else{
                  summary.classList.add('hide-summary');
                  summary.classList.remove('show-summary');
                  header.innerText = `Show order summary`;
                  icon.classList.add('fa-angle-down');
                  icon.classList.remove('fa-angle-up');
                }
              }
            }}
            className="inline-flex flex-row gap-x-2 items-center font-medium">
              <h5 className="text-checkout-200 text-sm font-sans cursor-pointer">Show order summary</h5>
              <i className="fa-solid fa-angle-down text-checkout-200 text-xs "></i>
            </div>
              <p className="text-[1rem] font-sans font-semibold">&#8358;
                {(shippingMethod + parseFloat(total) + tax).toLocaleString(
                  "en-US"
                )}</p>
          </header>
          <section className="py-5 w-full flex-col px-7 gap-y-7 hide-summary" id='order-summary'>
            <div className="flex flex-col gap-y-7">
              {Object.values(cartItemObj).map((item: any, i: number) => (
                <article
                  key={i}
                  className="flex flex-row justify-between items-center w-full"
                >
                  <div className="flex flex-row gap-x-4 items-center">
                    <div className="px-[6px] border border-gray-300 rounded-md relative">
                      <Image
                        src={Object.values(frontBase64ImagesObj)[i][0]}
                        width={65}
                        height={90}
                        alt={`order-item${i + 1}`}
                      />
                      <span className="transition-all duration-300 ease-out transform hover:scale-125 bg-gray-500 px-[8px] py-[4px] text-[0.7rem] rounded-[50%] text-white font-sans absolute -right-[8px] -top-[12px] font-bold">
                        {quantities[i]}
                      </span>
                    </div>
                    <div className="font-sans inline-block">
                      <h3 className="text-sm font-normal">{item.title}</h3>
                      <p className="text-sm font-extralight text-gray-500">
                        {item.color}/UK {item.number}
                      </p>
                    </div>
                  </div>
                  <h5 className="text-sm font-sans font-normal">
                    &#8358;
                    {parseFloat(itemTotalAmounts[i].toFixed(2)).toLocaleString(
                      "en-US"
                    )}
                  </h5>
                </article>
              ))}
            </div>
            <footer className="flex flex-col gap-y-2">
              <div className="w-full flex flex-row justify-between items-center text-sm font-sans font-normal">
                <h5>Subtotal</h5>
                <h5>&#8358;{total.toLocaleString("en-US")}</h5>
              </div>
              <div className="w-full flex flex-row justify-between items-center text-sm font-sans font-normal">
                <h5>Shipping</h5>
                <h5>&#8358;{shippingMethod.toLocaleString("en-US")}</h5>
              </div>
              <div className="w-full flex flex-row justify-between items-center text-sm font-sans font-normal">
                <div className="inline-flex flex-row gap-x-2">
                  <h5>Estimated taxes</h5>
                  <span className="icon-container">
                    <i className="fa-regular fa-circle-question cursor-pointer"></i>
                    <span className="hint text-[.7rem]">
                      The final tax and total will be confirmed by email or text
                      after you place the order
                    </span>
                  </span>
                </div>
                <h5>&#8358;{tax.toLocaleString("en-US")}</h5>
              </div>
              <div className="w-full flex flex-row justify-between items-center text-xl font-sans font-semibold">
                <h5>Total</h5>
                <h5>
                  &#8358;
                  {(shippingMethod + parseFloat(total) + tax).toLocaleString(
                    "en-US"
                  )}
                </h5>
              </div>
            </footer>
          </section>
        </section>}

        <section className="flex md:w-[55%] w-full flex-col md:h-full gap-y-9 border bg-white border-gray-300 border-l-0 border-t-0 border-b-0 pb-5 pt-7 md:pl-28 md:pr-9 px-7">
          <div className="flex flex-col gap-y-3">
            <header className="flex flex-row justify-between items-center font-sans">
              <h1 className="font-semibold text-xl">Contact</h1>
              <Link
                href={"/login"}
                className="underline text-[.9rem] text-checkout-200 hover:text-checkout-300"
              >
                Log in
              </Link>
            </header>
            <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
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
                    item.closest('div')?.classList.remove('border-gray-300', 'border');
                    item.closest('div')?.classList.add('border-red-500', 'border-2');
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
                  item.closest('div')?.classList.add('border-gray-300', 'border');
                  item.closest('div')?.classList.remove('border-red-500', 'border-2');
                }}
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
              />
            </div>
            <p id='email-error' className="text-red-600 text-sm font-sans hidden -mt-2">Enter a valid email</p>
            <div className="inline-flex flex-row gap-x-2 items-center">
              <input
                type="checkbox"
                id='email-offers'
                className="text-white bg-white appearance-none w-[16px] h-[16px] border border-checkout-200 rounded-sm relative
                      cursor-pointer outline-none checked:bg-checkout-200 checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                      checked:after:border-gray-800 checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                      checked:after:rotate-45"
              />
              <p className="text-[.85rem] font-sans">
                Email me with offers or product updates
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-3 items-start">
            <h1 className="font-semibold text-xl font-sans">Delivery</h1>
            <section className="flex flex-col w-full gap-y-3">
              <div className="flex flex-col focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full">
                <h5 className="text-xs text-gray-500">Country/Region</h5>
                <div className="select-container">
                  <select
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      setCountryName(prevState => ({
                        ...prevState,
                        shipping: Country.getCountryByCode(e.target.value)!.name
                      }));
                      setPhonePlaceholder(
                        `Phone: +${
                          Country.getCountryByCode(e.target.value)!.phonecode
                        }...`
                      );
                    }}
                    className="w-full h-6 appearance-none bg-transparent focus:outline-none pt-1 placeholder:text-gray-600 placeholder:text-sm text-sm"
                  >
                    <option hidden>{Country.getCountryByCode("NG")!.name}</option>
                    {Country.getAllCountries().map((country, index) => (
                      <option key={index} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <i
                    className="fa-solid fa-angle-down text-sm"
                    style={{ "--top": "25%" } as React.CSSProperties}
                  ></i>
                </div>
              </div>
              <div className="w-full flex flex-row">
                <div className="w-[49%] flex flex-col items-start gap-y-1">
                  <div className="flex flex-col justify-center w-full gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3  h-14">
                    <label
                      htmlFor="fname"
                      className="text-xs hide-label text-gray-500"
                    >
                      First name
                    </label>
                    <input
                      placeholder="First name"
                      onFocus={(e) => {
                        document.querySelector('#fname-error')?.classList.add('hidden');
                      }}
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "First name";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }

                        if(e.target.value.length === 0){
                          document.querySelector('#fname-error')?.classList.remove('hidden');
                          item.closest('div')?.classList.remove('border-gray-300', 'border');
                          item.closest('div')?.classList.add('border-red-500', 'border-2');
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

                        document.querySelector('#fname-error')?.classList.add('hidden');
                        item.closest('div')?.classList.add('border-gray-300', 'border');
                        item.closest('div')?.classList.remove('border-red-500', 'border-2');
                      }}
                      id="fname"
                      value={firstName.shipping}
                      onChange={(e) => setFirstName(prevState => ({
                        ...prevState,
                        shipping: e.target.value
                      }))}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                  <p id='fname-error' className="text-red-600 text-sm font-sans hidden">Enter a first name</p>
                </div>
                <div className="w-[2%]"></div>
                <div className="w-[49%] flex flex-col items-start gap-y-1">
                  <div className="flex flex-col w-full justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 h-14">
                    <label
                      htmlFor="lname"
                      className="text-xs hide-label text-gray-500"
                    >
                      Last name
                    </label>
                    <input
                      placeholder="Last name"
                      onFocus={(e) => {
                        document.querySelector('#lname-error')?.classList.add('hidden');
                      }}
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Last name";
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }

                        if(e.target.value.length === 0){
                          document.querySelector('#lname-error')?.classList.remove('hidden');
                          item.closest('div')?.classList.remove('border-gray-300', 'border');
                          item.closest('div')?.classList.add('border-red-500', 'border-2');
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

                        document.querySelector('#lname-error')?.classList.add('hidden');
                        item.closest('div')?.classList.add('border-gray-300', 'border');
                        item.closest('div')?.classList.remove('border-red-500', 'border-2');
                      }}
                      id="lname"
                      value={lastName.shipping}
                      onChange={(e) => setLastName(prevState => ({
                        ...prevState,
                        shipping: e.target.value
                      }))}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                  <p id='lname-error' className="text-red-600 text-sm font-sans hidden">Enter a last name</p>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
                <label
                  htmlFor="company"
                  className="text-xs hide-label text-gray-500"
                >
                  Company&nbsp;(optional)
                </label>
                <input
                  placeholder="Company (optional)"
                  onBlur={(e) => {
                    let item = e.currentTarget;
                    item.placeholder = "Company (optional)";
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
                  id="company"
                  value={company.shipping}
                  onChange={(e) => setCompany(prevState => ({
                    ...prevState,
                    shipping: e.target.value
                  }))}
                  className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                />
              </div>
              <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
                <label
                  htmlFor="address"
                  className="text-xs hide-label text-gray-500"
                >
                  Address
                </label>
                <input
                  placeholder="Address"
                  onFocus={(e) => {
                    document.querySelector('#address-error')?.classList.add('hidden');
                  }}
                  onBlur={(e) => {
                    let item = e.currentTarget;
                    item.placeholder = "Address";
                    let label = item.previousElementSibling;
                    if (label && item.value.length === 0) {
                      label.classList.add("hide-label");
                      label.classList.remove("show-label");
                    }

                    if(e.target.value.length === 0){
                      document.querySelector('#address-error')?.classList.remove('hidden');
                      item.closest('div')?.classList.remove('border-gray-300', 'border');
                      item.closest('div')?.classList.add('border-red-500', 'border-2');
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

                    document.querySelector('#address-error')?.classList.add('hidden');
                        item.closest('div')?.classList.add('border-gray-300', 'border');
                        item.closest('div')?.classList.remove('border-red-500', 'border-2');
                  }}
                  value={address.shipping}
                  onChange={(e) => setAddress(prevState => ({
                    ...prevState,
                    shipping: e.target.value
                  }))}
                  id="address"
                  className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                />
              </div>
              <p id='address-error' className="text-red-600 text-sm font-sans hidden -mt-2">Enter an address</p>
              <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
                <label
                  htmlFor="apartment"
                  className="text-xs hide-label text-gray-500"
                >
                  Apartment, suite, etc. (optional)
                </label>
                <input
                  placeholder="Apartment, suite, etc. (optional)"
                  onBlur={(e) => {
                    let item = e.currentTarget;
                    item.placeholder = "Apartment, suite, etc. (optional)";
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
                  id="apartment"
                  value={apartment.shipping}
                  onChange={(e) => setApartment(prevState => ({
                    ...prevState,
                    shipping: e.target.value
                  }))}
                  className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                />
              </div>
              <div className="w-full flex flex-row">
                {City.getCitiesOfCountry(countryCode)!.length > 0 ? (
                  <div className="w-[32%] flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3  h-14">
                    <label
                      htmlFor="city"
                      className="text-xs hide-label text-gray-500"
                    >
                      City
                    </label>
                    <div className="select-container">
                      <select
                        id="city"
                        onChange={(e) => {
                          let item = e.currentTarget;
                          let label = item.previousElementSibling;
                          if (label) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                          setCity(prevState => ({
                            ...prevState,
                            shipping: e.target.value
                          }));
                        }}
                        className="w-full h-6 bg-transparent focus:outline-none pt-1 text-sm"
                      >
                        {City.getCitiesOfCountry(countryCode)!.map((city, index) => (
                          <option key={index} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      <i
                        className="fa-solid fa-angle-down text-xs"
                        style={{ "--top": "55%" } as React.CSSProperties}
                      ></i>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start w-[32%] gap-y-3">
                    <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 h-14">
                      <label
                        htmlFor="city"
                        className="text-xs hide-label text-gray-500"
                      >
                        City
                      </label>
                      <input
                        placeholder="City"
                        onFocus={(e) => {
                          document.querySelector('#city-error')?.classList.add('hidden');
                        }}
                        onBlur={(e) => {
                          let item = e.currentTarget;
                          item.placeholder = "City";
                          let label = item.previousElementSibling;
                          if (
                            label &&
                            item.value.length === 0 &&
                            item.value.length === 0
                          ) {
                            label.classList.add("hide-label");
                            label.classList.remove("show-label");
                          }

                          if(e.target.value.length === 0){
                            document.querySelector('#city-error')?.classList.remove('hidden');
                            item.closest('div')?.classList.remove('border-gray-300', 'border');
                            item.closest('div')?.classList.add('border-red-500', 'border-2');
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

                          document.querySelector('#city-error')?.classList.add('hidden');
                          item.closest('div')?.classList.add('border-gray-300', 'border');
                          item.closest('div')?.classList.remove('border-red-500', 'border-2');
                        }}
                        id="city"
                        value={city.shipping}
                        onChange={(e) => setCity(prevState => ({
                          ...prevState,
                          shipping: e.target.value
                        }))}
                        className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                      />
                    </div>
                    <p id='city-error' className="text-red-600 text-sm font-sans hidden -mt-2">Enter a city</p>
                  </div>
                )}
                <div className="w-[2%]"></div>
                {State.getStatesOfCountry(countryCode)!.length > 0 ? (
                  <div className="w-[32%] flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3  h-14">
                    <label
                      htmlFor="state"
                      className="text-xs hide-label text-gray-500"
                    >
                      State
                    </label>
                    <div className="select-container">
                      <select
                        id="state"
                        onChange={(e) => {
                          let item = e.currentTarget;
                          let label = item.previousElementSibling;
                          if (label) {
                            label.classList.remove("hide-label");
                            label.classList.add("show-label");
                          }
                          setState(prevState => ({
                            ...prevState,
                            shipping: e.target.value
                          }));
                        }}
                        className="w-full h-6 bg-transparent focus:outline-none pt-1 placeholder:text-gray-600 placeholder:text-sm text-sm"
                      >
                        {State.getStatesOfCountry(countryCode)!.map(
                          (state, index) => (
                            <option key={index} value={state.name}>
                              {state.name}
                            </option>
                          )
                        )}
                      </select>
                      <i
                        className="fa-solid fa-angle-down text-xs"
                        style={{ "--top": "55%" } as React.CSSProperties}
                      ></i>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col w-[32%] items-start gap-y-3">
                    <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 h-14">
                      <label
                        htmlFor="state"
                        className="text-xs hide-label text-gray-500"
                      >
                        State
                      </label>
                      <input
                        placeholder="State"
                        onFocus={(e) => {
                          document.querySelector('#state-error')?.classList.add('hidden');
                        }}
                        onBlur={(e) => {
                          let item = e.currentTarget;
                          item.placeholder = "State";
                          let label = item.previousElementSibling;
                          if (
                            label &&
                            item.value.length === 0 &&
                            item.value.length === 0
                          ) {
                            label.classList.add("hide-label");
                            label.classList.remove("show-label");
                          }

                          if(e.target.value.length === 0){
                            document.querySelector('#state-error')?.classList.remove('hidden');
                            item.closest('div')?.classList.remove('border-gray-300', 'border');
                            item.closest('div')?.classList.add('border-red-500', 'border-2');
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

                          document.querySelector('#state-error')?.classList.add('hidden');
                          item.closest('div')?.classList.add('border-gray-300', 'border');
                          item.closest('div')?.classList.remove('border-red-500', 'border-2');
                          
                        }}
                        id="state"
                        value={state.shipping}
                        onChange={(e) => setState(prevState => ({
                          ...prevState,
                          shipping: e.target.value
                        }))}
                        className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                      />
                    </div>
                    <p id='state-error' className="text-red-600 text-sm font-sans hidden">Enter a first name</p>
                  </div>
                )}
                <div className="w-[2%]"></div>
                <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-[32%] h-14">
                  <label
                    htmlFor="postal-code"
                    className="text-xs hide-label text-gray-500"
                  >
                    Postal code (optional)
                  </label>
                  <input
                    placeholder="Postal code (optional)"
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Postal code (optional)";
                      let label = item.previousElementSibling;
                      if (
                        label &&
                        item.value.length === 0 &&
                        item.value.length === 0
                      ) {
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
                    id="postal-code"
                    value={postal.shipping}
                    onChange={(e) => setPostal(prevState => ({
                      ...prevState,
                      shipping: e.target.value
                    }))}
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>
              </div>
              <div id='phone-container' className="flex flex-row justify-between items-center focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 pl-3 pr-5 w-full h-14">
                <div className="inline-flex flex-col justify-center gap-y-1">
                  <label
                    htmlFor="phone"
                    className="text-xs hide-label text-gray-500"
                  >
                    Phone
                  </label>
                  <input
                    placeholder={`${phonePlaceholder}`}
                    onFocus={(e) => {
                      document.querySelector('#phone-error')?.classList.add('hidden');
                    }}
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = `${phonePlaceholder}`;
                      let label = item.previousElementSibling;
                      if (label && item.value.length === 0) {
                        label.classList.add("hide-label");
                        label.classList.remove("show-label");
                      }

                      if(e.target.value.length <= 10){
                        document.querySelector('#phone-error')?.classList.remove('hidden');
                        document.querySelector('#phone-container')?.classList.remove('border-gray-300', 'border');
                        document.querySelector('#phone-container')?.classList.add('border-red-500', 'border-2');
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
                        if(item.value.length === 4){
                          setShowFlag(prevState => ({
                            ...prevState,
                            shipping: true
                          }));
                        }else if(item.value.length === 3){
                          setShowFlag(prevState => ({
                            ...prevState,
                            shipping: false
                          }));
                        }
                      }

                      document.querySelector('#phone-error')?.classList.add('hidden');
                      document.querySelector('#phone-container')?.classList.add('border-gray-300', 'border');
                      document.querySelector('#phone-container')?.classList.remove('border-red-500', 'border-2');
                    }}
                    id="phone"
                    value={phone.shipping}
                    onChange={(e) => setPhone(prevState => ({
                      ...prevState,
                      shipping: e.target.value
                    }))}
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                  
                </div>
                <div className="inline-flex flex-row gap-x-5">
                  <span className="icon-container">
                    <i className="fa-regular fa-circle-question cursor-pointer"></i>
                    <span className="hint text-[.7rem]">
                      In case we need to contact you about your order
                    </span>
                  </span>
                  {showFlag.shipping && <Image width={24} height={24} src={`data:image/svg+xml;utf8,${encodeURIComponent(CountryFlagSvg[countryCode])}`} alt={countryCode}/>}
                </div>
              </div>
              <p id='phone-error' className="text-red-600 text-sm font-sans hidden -mt-2">Enter a valid mobile number</p>
              <div className="inline-flex flex-row gap-x-2 items-center">
                <input
                  type="checkbox"
                  id='save-info'
                  className="text-white bg-white appearance-none w-[16px] h-[16px] border border-checkout-200 rounded-sm relative
                      cursor-pointer outline-none checked:bg-checkout-200 checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                      checked:after:border-black checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                      checked:after:rotate-45"
                />
                <p className="text-[.85rem] font-sans">
                  Save this information for next time
                </p>
              </div>
            </section>
          </div>
          <div className="flex flex-col gap-y-3 items-start w-full">
            <h1 className="font-semibold text-xl font-sans">Shipping method</h1>
            <section className="w-full ">
              <div
                onClick={(e) => {
                  let item = e.currentTarget;
                  let mainland = document.querySelector('.within-lagos-mainland-container');
                  let outside = document.querySelector('.outside-lagos-container');

                  if (mainland && outside) {
                    if (mainland.classList.contains("bg-checkout-100")) {
                      mainland.classList.remove(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      mainland.classList.add("border-gray-300", 'border-t-0');
                      (mainland.querySelector("div > input") as HTMLInputElement).checked = false;
                    }
                    if(outside.classList.contains("bg-checkout-100")){
                      outside.classList.remove(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      outside.classList.add("border-gray-300", 'border-t-0');
                      (outside.querySelector("div > input") as HTMLInputElement).checked = false;
                    }

                    item.classList.add(
                      "bg-checkout-100",
                      "border-checkout-300"
                    );
                    item.classList.remove("border-gray-300");
                    (item.querySelector("div > input") as HTMLInputElement).checked = true;
                    
                  }

                  setShippingMethod(5000);
                }}
                className="within-lagos-island-container bg-checkout-100 rounded-tl-md rounded-tr-md border border-checkout-300 cursor-pointer flex flex-row justify-between items-center px-4 py-5 text-sm font-sans w-full"
              >
                <div className="flex flex-row gap-x-3 items-center">
                  <input type="checkbox" className="checkbox" />
                  <h3>Within Lagos - Island{windowWidth < 768 ? '' : ' (5 - 7 business days)'}</h3>
                </div>
                <h5 className="font-medium">&#8358;5,000</h5>
              </div>
              <div
                onClick={(e) => {
                  let item = e.currentTarget;
                  let island = document.querySelector('.within-lagos-island-container');
                  let outside = document.querySelector('.outside-lagos-container');


                  if (island && outside) {
                    if (island.classList.contains("bg-checkout-100") ) {
                      island.classList.remove(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      island.classList.add("border-gray-300");
                      (island.querySelector("div > input") as HTMLInputElement).checked = false;
                    }
                    if(outside.classList.contains("bg-checkout-100")){
                      outside.classList.remove(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      outside.classList.add("border-gray-300", 'border-t-0');
                      (outside.querySelector("div > input") as HTMLInputElement).checked = false;
                    }

                    item.classList.add(
                      "bg-checkout-100",
                      "border-checkout-300"
                    );
                    item.classList.remove("border-gray-300", 'border-t-0');
                    (item.querySelector("div > input") as HTMLInputElement).checked = true;
                    
                  }

                  setShippingMethod(8500);
                }}
                className="within-lagos-mainland-container cursor-pointer border border-gray-300 flex flex-row justify-between items-center px-4 py-5 text-sm font-sans w-full"
              >
                <div className="flex flex-row gap-x-3 items-center">
                  <input type="checkbox" className="checkbox" />
                  <h3>Within Lagos - Mainland{windowWidth < 768 ? '' : ' (5 - 7 business days)'}</h3>
                </div>
                <h5 className="font-medium">&#8358;8,500</h5>
              </div>
              <div
                onClick={(e) => {
                  let item = e.currentTarget;
                  let island = document.querySelector('.within-lagos-island-container');
                  let mainland = document.querySelector('.within-lagos-mainland-container');

                  if (island && mainland) {
                    if (island.classList.contains("bg-checkout-100")) {
                      island.classList.remove(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      island.classList.add("border-gray-300");
                      (island.querySelector("div > input") as HTMLInputElement).checked = false;
                    }
                    if (mainland.classList.contains("bg-checkout-100")) {

                      mainland.classList.remove(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      mainland.classList.add("border-gray-300", 'border-t-0');
                      (mainland.querySelector("div > input") as HTMLInputElement).checked = false;
                    }

                    item.classList.add(
                      "bg-checkout-100",
                      "border-checkout-300"
                    );
                    item.classList.remove("border-gray-300", 'border-t-0');
                    (item.querySelector("div > input") as HTMLInputElement).checked = true;
                    
                  }

                  setShippingMethod(15000);
                }}
                className="outside-lagos-container cursor-pointer rounded-bl-md rounded-br-md border border-gray-300 flex flex-row justify-between items-center px-4 py-5 text-sm font-sans w-full"
              >
                <div className="flex flex-row gap-x-3 items-center">
                  <input type="checkbox" className="checkbox" />
                  <h3>Outside Lagos{windowWidth < 768 ? '' : ' (5 - 7 business days)'}</h3>
                </div>
                <h5 className="font-medium">&#8358;15,000</h5>
              </div>
            </section>
          </div>
          <div className="flex flex-col gap-y-3 items-start w-full">
            <header className="flex flex-col gap-y-1">
              <h1 className="font-semibold text-xl font-sans leading-tight">
                Payment
              </h1>
              <h4 className="text-[.85rem] font-light font-sans">
                All transactions are secure and encrypted
              </h4>
            </header>
            <section className="rounded-bl-md rounded-br-md w-full ">
              <div
                onClick={(e) => {
                  let item = e.currentTarget;
                  let sibling = item.nextElementSibling;

                  if (sibling) {
                    if (sibling.classList.contains("bg-checkout-100")) {
                      sibling.classList.remove(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      sibling.classList.add("border-gray-300", "border-t-0");
                      sibling.querySelector("input")!.checked = false;
                      item.classList.add(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      item.classList.remove("border-gray-300", "border-b-0");
                      item.querySelector("input")!.checked = true;
                    }
                  }

                  setPaymentMethod("interswitch");
                }}
                className="bg-checkout-100 rounded-tl-md rounded-tr-md border border-checkout-300 cursor-pointer flex flex-row justify-between items-center px-4 py-5 text-sm font-sans w-full"
              >
                <div className="flex flex-row gap-x-3 items-center">
                  <input type="checkbox" className="checkbox interswitch" />
                  <h3>Pay Now</h3>
                </div>
                <Image
                  src="https://www.interswitchgroup.com/assets/images/home/interswitch_logo.svg"
                  height={96}
                  width={96}
                  alt="interswitch logo"
                />
              </div>
              <div
                onClick={async (e) => {
                  let item = e.currentTarget;
                  let sibling = item.previousElementSibling;

                  if (sibling) {
                    if (sibling.classList.contains("bg-checkout-100")) {
                      sibling.classList.remove(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      sibling.classList.add("border-gray-300", "border-b-0");
                      sibling.querySelector("input")!.checked = false;
                      item.classList.add(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      item.classList.remove("border-gray-300", "border-t-0");
                      item.querySelector("input")!.checked = true;
                    }
                  }

                  setPaymentMethod("streetzwyze");
                }}
                className=" cursor-pointer rounded-bl-md rounded-br-md border border-gray-300 flex flex-row justify-between items-center px-4 py-5 text-sm font-sans w-full"
              >
                <div className="flex flex-row gap-x-3 items-center">
                  <input type="checkbox" className="checkbox" />
                  <h3>Pay on Delivery</h3>
                </div>
                <Image
                  src={PaymentLogo}
                  height={96}
                  width={96}
                  alt="streetzwyze logo"
                />
              </div>
            </section>
          </div>
          <div className="flex flex-col gap-y-3 items-start w-full">
            <h1 className="font-semibold text-xl font-sans">Billing address</h1>
            <section className="rounded-bl-md rounded-br-md w-full">
              <div
                onClick={(e) => {
                  let item = e.currentTarget;
                  let sibling = item.nextElementSibling;
                  let billingAdd = item.parentNode?.querySelector(
                    "#billing-address"
                  );

                  if (sibling && billingAdd) {
                    if (sibling.classList.contains("bg-checkout-100")) {
                      sibling.classList.remove(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      sibling.classList.add("border-gray-300", "border-t-0");
                      sibling.querySelector("input")!.checked = false;
                      item.classList.add(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      item.classList.remove("border-gray-300", "border-b-0");
                      item.querySelector("input")!.checked = true;
                    }
                    if (billingAdd.classList.contains("show-billing")) {
                      billingAdd.classList.remove("show-billing");
                      billingAdd.classList.add("hide-billing");
                      sibling.classList.add("rounded-bl-md", "rounded-br-md");
                    }
                  }

                  setBilling("same");
                }}
                className="bg-checkout-100 rounded-tl-md rounded-tr-md border border-checkout-300 cursor-pointer flex flex-row justify-between items-center px-4 py-5 text-sm font-sans w-full"
              >
                <div className="flex flex-row gap-x-3 items-center">
                  <input type="checkbox" className="checkbox same-billing" />
                  <h3>Same as shipping address</h3>
                </div>
              </div>
              <div
                onClick={(e) => {
                  let item = e.currentTarget;
                  let sibling = item.previousElementSibling;
                  let billingAdd = item.parentNode?.querySelector(
                    "#billing-address"
                  );

                  if (sibling && billingAdd) {
                    if (sibling.classList.contains("bg-checkout-100")) {
                      sibling.classList.remove(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      sibling.classList.add("border-gray-300", "border-b-0");
                      sibling.querySelector("input")!.checked = false;
                      item.classList.add(
                        "bg-checkout-100",
                        "border-checkout-300"
                      );
                      item.classList.remove("border-gray-300", "border-t-0");
                      item.querySelector("input")!.checked = true;
                    }
                    if (!billingAdd.classList.contains("show-billing")) {
                      billingAdd.classList.add("show-billing");
                      billingAdd.classList.remove("hide-billing");
                      item.classList.remove("rounded-bl-md", "rounded-br-md");
                    }
                  }

                  setBilling("different");
                }}
                className=" cursor-pointer rounded-bl-md rounded-br-md border border-gray-300 flex flex-row justify-between items-center px-4 py-5 text-sm font-sans w-full"
              >
                <div className="flex flex-row gap-x-3 items-center">
                  <input type="checkbox" className="checkbox" />
                  <h3>Use a different billing address</h3>
                </div>
              </div>
              <section
                className="flex flex-col w-full gap-y-3 bg-gray-100 hide-billing p-5 rounded-bl-md rounded-br-md"
                id="billing-address"
              >
                <div className="flex flex-col focus-within:border-checkout-200 rounded-lg border-gray-300 bg-white border py-2 px-3 w-full">
                  <h5 className="text-xs text-gray-500">Country/Region</h5>
                  <div className="select-container">
                    <select
                      onChange={(e) => {
                        setCountryCode(e.target.value);
                        setCountryName(prevState => ({
                          ...prevState,
                          billing: Country.getCountryByCode(e.target.value)!.name
                        }));
                        setPhonePlaceholder(
                          `Phone: +${
                            Country.getCountryByCode(e.target.value)!.phonecode
                          }...`
                        );
                      }}
                      className="w-full h-6 appearance-none bg-transparent focus:outline-none pt-1 placeholder:text-gray-600 placeholder:text-sm text-sm"
                    >
                      <option hidden>{Country.getCountryByCode("NG")!.name}</option>
                      {Country.getAllCountries().map((country, index) => (
                        <option key={index} value={country.isoCode}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <i
                      className="fa-solid fa-angle-down text-sm"
                      style={{ "--top": "25%" } as React.CSSProperties}
                    ></i>
                  </div>
                </div>
                <div className="w-full flex flex-row">
                  <div className="w-[49%] flex flex-col items-start gap-y-1">
                    <div className="flex flex-col justify-center bg-white gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
                      <label
                        htmlFor="fname"
                        className="text-xs hide-label text-gray-500"
                      >
                        First name
                      </label>
                      <input
                        placeholder="First name"
                        onFocus={(e) => {
                          document.querySelector('#fname-billing-error')?.classList.add('hidden');
                        }}
                        onBlur={(e) => {
                          let item = e.currentTarget;
                          item.placeholder = "First name";
                          let label = item.previousElementSibling;
                          if (label && item.value.length === 0) {
                            label.classList.add("hide-label");
                            label.classList.remove("show-label");
                          }

                          if(e.target.value.length === 0){
                            document.querySelector('#fname-billing-error')?.classList.remove('hidden');
                            item.closest('div')?.classList.remove('border-gray-300', 'border');
                            item.closest('div')?.classList.add('border-red-500', 'border-2');
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

                          document.querySelector('#fname-billing-error')?.classList.add('hidden');
                          item.closest('div')?.classList.add('border-gray-300', 'border');
                          item.closest('div')?.classList.remove('border-red-500', 'border-2');
                        }}
                        id="fname"
                        value={firstName.billing}
                        onChange={(e) => setFirstName(prevState => ({
                          ...prevState,
                          billing: e.target.value
                        }))}
                        className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                      />
                    </div>
                    <p id='fname-billing-error' className="text-red-600 text-sm font-sans hidden">Enter a first name</p>
                  </div>
                  <div className="w-[2%]"></div>
                  <div className="w-[49%] flex flex-col items-start gap-y-1">
                    <div className="flex flex-col justify-center bg-white gap-y-1 w-full focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 h-14">
                      <label
                        htmlFor="lname"
                        className="text-xs hide-label text-gray-500"
                      >
                        Last name
                      </label>
                      <input
                        placeholder="Last name"
                        onFocus={(e) => {
                          document.querySelector('#lname-billing-error')?.classList.add('hidden');
                        }}
                        onBlur={(e) => {
                          let item = e.currentTarget;
                          item.placeholder = "Last name";
                          let label = item.previousElementSibling;
                          if (label && item.value.length === 0) {
                            label.classList.add("hide-label");
                            label.classList.remove("show-label");
                          }

                          if(e.target.value.length === 0){
                            document.querySelector('#lname-billing-error')?.classList.remove('hidden');
                            item.closest('div')?.classList.remove('border-gray-300', 'border');
                            item.closest('div')?.classList.add('border-red-500', 'border-2');
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

                          document.querySelector('#lname-billing-error')?.classList.add('hidden');
                          item.closest('div')?.classList.add('border-gray-300', 'border');
                          item.closest('div')?.classList.remove('border-red-500', 'border-2');
                        }}
                        id="lname"
                        value={lastName.billing}
                        onChange={(e) => setLastName(prevState => ({
                          ...prevState,
                          billing: e.target.value
                        }))}
                        className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                      />
                    </div>
                    <p id='lname-billing-error' className="text-red-600 text-sm font-sans hidden">Enter a last name</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-y-1 bg-white focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
                  <label
                    htmlFor="company"
                    className="text-xs hide-label text-gray-500"
                  >
                    Company&nbsp;(optional)
                  </label>
                  <input
                    placeholder="Company (optional)"
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Company (optional)";
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
                    id="company"
                    value={company.billing}
                    onChange={(e) => setCompany(prevState => ({
                      ...prevState,
                      billing: e.target.value
                    }))}
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>
                <div className="flex flex-col justify-center gap-y-1 bg-white focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
                  <label
                    htmlFor="address"
                    className="text-xs hide-label text-gray-500"
                  >
                    Address
                  </label>
                  <input
                    placeholder="Address"
                    onFocus={(e) => {
                      document.querySelector('#address-billing-error')?.classList.add('hidden');
                    }}
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Address";
                      let label = item.previousElementSibling;
                      if (label && item.value.length === 0) {
                        label.classList.add("hide-label");
                        label.classList.remove("show-label");
                      }

                      if(e.target.value.length === 0){
                        document.querySelector('#address-billing-error')?.classList.remove('hidden');
                        item.closest('div')?.classList.remove('border-gray-300', 'border');
                        item.closest('div')?.classList.add('border-red-500', 'border-2');
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

                      document.querySelector('#address-billing-error')?.classList.add('hidden');
                      item.closest('div')?.classList.add('border-gray-300', 'border');
                      item.closest('div')?.classList.remove('border-red-500', 'border-2');
                    }}
                    id="address"
                    value={address.billing}
                    onChange={(e) => setAddress(prevState => ({
                      ...prevState,
                      billing: e.target.value
                    }))}
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>
                <p id='address-billing-error' className="text-red-600 text-sm font-sans hidden -mt-2">Enter an address</p>
                <div className="flex flex-col bg-white justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
                  <label
                    htmlFor="apartment"
                    className="text-xs hide-label text-gray-500"
                  >
                    Apartment, suite, etc. (optional)
                  </label>
                  <input
                    placeholder="Apartment, suite, etc. (optional)"
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Apartment, suite, etc. (optional)";
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
                    value={apartment.billing}
                    onChange={(e) => setApartment(prevState => ({
                      ...prevState,
                      billing: e.target.value
                    }))}
                    id="apartment"
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>
                <div className="w-full flex flex-row">
                  {City.getCitiesOfCountry(countryCode)!.length > 0 ? (
                    <div className="w-[32%] flex flex-col justify-center bg-white gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3  h-14">
                      <label
                        htmlFor="city"
                        className="text-xs hide-label text-gray-500"
                      >
                        City
                      </label>
                      <div className="select-container">
                        <select
                          id="city"
                          onChange={(e) => {
                            let item = e.currentTarget;
                            let label = item.previousElementSibling;
                            if (label) {
                              label.classList.remove("hide-label");
                              label.classList.add("show-label");
                            }
                            setCity(prevState => ({
                              ...prevState,
                              billing: e.target.value
                            }));
                          }}
                          className="w-full h-6 bg-transparent focus:outline-none pt-1 text-sm"
                        >
                          {City.getCitiesOfCountry(countryCode)!.map((city, index) => (
                            <option key={index} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                        <i
                          className="fa-solid fa-angle-down text-xs"
                          style={{ "--top": "55%" } as React.CSSProperties}
                        ></i>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start w-[32%] gap-y-3">
                      <div className="flex flex-col justify-center gap-y-1 bg-white focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 h-14">
                        <label
                          htmlFor="city"
                          className="text-xs hide-label text-gray-500"
                        >
                          City
                        </label>
                        <input
                          placeholder="City"
                          onFocus={(e) => {
                            document.querySelector('#city-billing-error')?.classList.add('hidden');
                          }}
                          onBlur={(e) => {
                            let item = e.currentTarget;
                            item.placeholder = "City";
                            let label = item.previousElementSibling;
                            if (
                              label &&
                              item.value.length === 0 &&
                              item.value.length === 0
                            ) {
                              label.classList.add("hide-label");
                              label.classList.remove("show-label");
                            }

                            if(e.target.value.length === 0){
                              document.querySelector('#city-billing-error')?.classList.remove('hidden');
                              item.closest('div')?.classList.remove('border-gray-300', 'border');
                              item.closest('div')?.classList.add('border-red-500', 'border-2');
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

                            document.querySelector('#city-billing-error')?.classList.add('hidden');
                            item.closest('div')?.classList.add('border-gray-300', 'border');
                            item.closest('div')?.classList.remove('border-red-500', 'border-2');
                          }}
                          id="city"
                          value={city.billing}
                          onChange={(e) => setCity(prevState => ({
                            ...prevState,
                            billing: e.target.value
                          }))}
                          className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                        />
                      </div>
                      <p id='city-billing-error' className="text-red-600 text-sm font-sans hidden -mt-2">Enter a city</p>
                    </div>
                  )}
                  <div className="w-[2%]"></div>
                  {State.getStatesOfCountry(countryCode)!.length > 0 ? (
                    <div className="w-[32%] flex flex-col bg-white justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3  h-14">
                      <label
                        htmlFor="state"
                        className="text-xs hide-label text-gray-500"
                      >
                        State
                      </label>
                      <div className="select-container">
                        <select
                          id="state"
                          onChange={(e) => {
                            let item = e.currentTarget;
                            let label = item.previousElementSibling;
                            if (label) {
                              label.classList.remove("hide-label");
                              label.classList.add("show-label");
                            }
                            setState(prevState => ({
                              ...prevState,
                              billing: e.target.value
                            }));
                          }}
                          className="w-full h-6 bg-transparent focus:outline-none pt-1 placeholder:text-gray-600 placeholder:text-sm text-sm"
                        >
                          {State.getStatesOfCountry(countryCode)!.map(
                            (state, index) => (
                              <option key={index} value={state.name}>
                                {state.name}
                              </option>
                            )
                          )}
                        </select>
                        <i
                          className="fa-solid fa-angle-down text-xs"
                          style={{ "--top": "55%" } as React.CSSProperties}
                        ></i>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col w-[32%] items-start gap-y-3">
                      <div className="flex flex-col justify-center gap-y-1 bg-white focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 h-14">
                        <label
                          htmlFor="state"
                          className="text-xs hide-label text-gray-500"
                        >
                          State
                        </label>
                        <input
                          placeholder="State"
                          onFocus={(e) => {
                            document.querySelector('#state-billing-error')?.classList.add('hidden');
                          }}
                          onBlur={(e) => {
                            let item = e.currentTarget;
                            item.placeholder = "State";
                            let label = item.previousElementSibling;
                            if (
                              label &&
                              item.value.length === 0 &&
                              item.value.length === 0
                            ) {
                              label.classList.add("hide-label");
                              label.classList.remove("show-label");
                            }

                            if(e.target.value.length === 0){
                              document.querySelector('#state-billing-error')?.classList.remove('hidden');
                              item.closest('div')?.classList.remove('border-gray-300', 'border');
                              item.closest('div')?.classList.add('border-red-500', 'border-2');
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

                            document.querySelector('#state-billing-error')?.classList.add('hidden');
                            item.closest('div')?.classList.add('border-gray-300', 'border');
                            item.closest('div')?.classList.remove('border-red-500', 'border-2');
                            
                          }}
                          id="state"
                          value={state.billing}
                          onChange={(e) => setState(prevState => ({
                            ...prevState,
                            billing: e.target.value
                          }))}
                          className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                        />
                      </div>
                      <p id='state-billing-error' className="text-red-600 text-sm font-sans hidden">Enter a first name</p>
                    </div>
                  )}
                  <div className="w-[2%]"></div>
                  <div className="flex flex-col justify-center gap-y-1 bg-white focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-[32%] h-14">
                    <label
                      htmlFor="postal-code"
                      className="text-xs hide-label text-gray-500"
                    >
                      Postal code (optional)
                    </label>
                    <input
                      placeholder="Postal code (optional)"
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = "Postal code (optional)";
                        let label = item.previousElementSibling;
                        if (
                          label &&
                          item.value.length === 0 &&
                          item.value.length === 0
                        ) {
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
                      id="postal-code"
                      value={postal.billing}
                      onChange={(e) => setPostal(prevState => ({
                        ...prevState,
                        billing: e.target.value
                      }))}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                </div>
                <div id='phone-billing-container' className="flex flex-row justify-between items-center bg-white focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 pl-3 pr-5 w-full h-14">
                  <div className="inline-flex flex-col justify-center gap-y-1">
                    <label
                      htmlFor="phone"
                      className="text-xs hide-label text-gray-500"
                    >
                      Phone
                    </label>
                    <input
                      placeholder={`${phonePlaceholder}`}
                      onFocus={(e) => {
                        document.querySelector('#phone-billing-error')?.classList.add('hidden');
                      }}
                      onBlur={(e) => {
                        let item = e.currentTarget;
                        item.placeholder = `${phonePlaceholder}`;
                        let label = item.previousElementSibling;
                        if (label && item.value.length === 0) {
                          label.classList.add("hide-label");
                          label.classList.remove("show-label");
                        }

                        if(e.target.value.length <= 10){
                          document.querySelector('#phone-billing-error')?.classList.remove('hidden');
                          document.querySelector('#phone-billing-container')?.classList.remove('border-gray-300', 'border');
                          document.querySelector('#phone-billing-container')?.classList.add('border-red-500', 'border-2');
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
                          if(item.value.length === 4){
                            setShowFlag(prevState => ({
                              ...prevState,
                              billing: true
                            }));
                          }else if(item.value.length === 3){
                            setShowFlag(prevState => ({
                              ...prevState,
                              billing: false
                            }));
                          }
                        }

                        document.querySelector('#phone-billing-error')?.classList.add('hidden');
                        document.querySelector('#phone-billing-container')?.classList.add('border-gray-300', 'border');
                        document.querySelector('#phone-billing-container')?.classList.remove('border-red-500', 'border-2');
                      }}
                      id="phone"
                      value={phone.billing}
                      onChange={(e) => setPhone(prevState => ({
                        ...prevState,
                        billing: e.target.value
                      }))}
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                    
                  </div>
                  <div className="inline-flex flex-row gap-x-5">
                    <span className="icon-container">
                      <i className="fa-regular fa-circle-question cursor-pointer"></i>
                      <span className="hint text-[.7rem]">
                        In case we need to contact you about your order
                      </span>
                    </span>
                    {showFlag.billing && <Image width={24} height={24} src={`data:image/svg+xml;utf8,${encodeURIComponent(CountryFlagSvg[countryCode])}`} alt={countryCode}/>}
                  </div>
                </div>
                <p id='phone-billing-error' className="text-red-600 text-sm font-sans hidden -mt-2">Enter a valid mobile number</p>
                <div className="inline-flex flex-row gap-x-2 items-center">
                  <input
                    type="checkbox"
                    id='billing-save-info'
                    className="text-white bg-white appearance-none w-[16px] h-[16px] border border-checkout-200 rounded-sm relative
                        cursor-pointer outline-none checked:bg-checkout-200 checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                        checked:after:border-black checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                        checked:after:rotate-45"
                  />
                  <p className="text-[.85rem] font-sans">
                    Save this information for next time
                  </p>
                </div>
              </section>
            </section>
          </div>
          
          <input type="hidden"  name='currency' value={convertToNumericCode(countryCode.length === 0 ? 'NGA' : countryCode)!}/>
          <input type="hidden"  name='merchant_code' value={`${process.env.NEXT_PUBLIC_MER_CODE}`}/>
          <input type="hidden"  name='pay_item_id' value={`${process.env.NEXT_PUBLIC_PAY_ITEM_ID}`}/>
          <input type="hidden"  name='cust_email' value='jezeadiebuo5@gmail.com'/>
          <input type="hidden"  name='item_name' value={orderId}/>
          <input type="hidden"  name='cust_amount' value={parseFloat(total) * 100}/>
          <input type="hidden"  name='txn_ref' value={transactionRef}/>
          <button
            onClick={completeOrder}
            className="px-7 w-full h-12 py-3 bg-gray-700 hover:bg-gray-800 hover:ring-1 ring-gray-800 text-white flex flex-row justify-center items-center"
          >
            {loader ?  <div className="loader" ></div> : <span>Complete order</span>}
          </button>
          
        </section>

        {windowWidth >= 768 && <section className="pt-12 w-[45%] flex flex-col h-full pl-11 gap-y-7 sticky top-0">
          <div className="flex flex-col gap-y-7">
            {Object.values(cartItemObj).map((item: any, i: number) => (
              <article
                key={i}
                className="flex flex-row justify-between items-center w-[80%]"
              >
                <div className="flex flex-row gap-x-4 items-center">
                  <div className="px-[6px] border border-gray-300 rounded-md relative">
                    <Image
                      src={Object.values(frontBase64ImagesObj)[i][0]}
                      width={65}
                      height={90}
                      alt={`order-item${i + 1}`}
                    />
                    <span className="transition-all duration-300 ease-out transform hover:scale-125 bg-gray-500 px-[8px] py-[4px] text-[0.7rem] rounded-[50%] text-white font-sans absolute -right-[8px] -top-[12px] font-bold">
                      {quantities[i]}
                    </span>
                  </div>
                  <div className="font-sans inline-block">
                    <h3 className="text-sm font-normal">{item.title}</h3>
                    <p className="text-sm font-extralight text-gray-500">
                      {item.color}/UK {item.number}
                    </p>
                  </div>
                </div>
                <h5 className="text-sm font-sans font-normal">
                  &#8358;
                  {parseFloat(itemTotalAmounts[i].toFixed(2)).toLocaleString(
                    "en-US"
                  )}
                </h5>
              </article>
            ))}
          </div>
          <footer className="flex flex-col gap-y-2">
            <div className="w-[80%] flex flex-row justify-between items-center text-sm font-sans font-normal">
              <h5>Subtotal</h5>
              <h5>&#8358;{total.toLocaleString("en-US")}</h5>
            </div>
            <div className="w-[80%] flex flex-row justify-between items-center text-sm font-sans font-normal">
              <h5>Shipping</h5>
              <h5>&#8358;{shippingMethod.toLocaleString("en-US")}</h5>
            </div>
            <div className="w-[80%] flex flex-row justify-between items-center text-sm font-sans font-normal">
              <div className="inline-flex flex-row gap-x-2">
                <h5>Estimated taxes</h5>
                <span className="icon-container">
                  <i className="fa-regular fa-circle-question cursor-pointer"></i>
                  <span className="hint text-[.7rem]">
                    The final tax and total will be confirmed by email or text
                    after you place the order
                  </span>
                </span>
              </div>
              <h5>&#8358;{tax.toLocaleString("en-US")}</h5>
            </div>
            <div className="w-[80%] flex flex-row justify-between items-center text-xl font-sans font-semibold">
              <h5>Total</h5>
              <h5>
                &#8358;
                {(shippingMethod + parseFloat(total) + tax).toLocaleString(
                  "en-US"
                )}
              </h5>
            </div>
          </footer>
        </section>}
      </main>
    </>
  );
}
