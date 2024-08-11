"use client";

import { Country, State, City } from "country-state-city";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import "./Checkout.css";
import PaymentLogo from "../../../public/streetzwyze.png";
import {
  checkout,
  convertToNumericCode,
  extractProductDetails,
} from "@/helpers/getHelpers";
import { Base64ImagesObj, CartItemObj } from "@/interfaces";
import axios from "axios";
import toast from "react-hot-toast";

export default function Checkout({ cartItems, total, orderId }: any) {
  let cartItemObj: CartItemObj = {};
  let tax = 250;

  let frontBase64ImagesObj: Base64ImagesObj = {};

  const [country, setCountry] = React.useState('');
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("interswitch");
  const [shippingMethod, setShippingMethod] = React.useState(5000);
  const [billing, setBilling] = React.useState("");
  const [phonePlaceholder, setPhonePlaceholder] = React.useState(
    "Phone: +234..."
  );

  if (cartItems.length > 0) {
    //extracting product details to populate the cart page
    extractProductDetails(cartItems, cartItemObj, frontBase64ImagesObj);
  }
  const quantities = Object.values(cartItemObj).map((item: any) => parseInt(item.quantity));
  const itemTotalAmounts =  Object.values(cartItemObj).map((item: any) => parseFloat(item.quantity) * parseFloat(item.price));

  React.useEffect(() => {
    (document.querySelector(".standard") as HTMLInputElement).checked = true;
    (document.querySelector(".interswitch") as HTMLInputElement).checked = true;
    (document.querySelector(
      ".same-billing"
    ) as HTMLInputElement).checked = true;

    document.body.style.backgroundColor = "rgb(243, 244, 246 )";
    document.body.style.paddingTop = "0px";
  }, []);

  async function completeOrder() {
    try {
      
      if (paymentMethod === "interswitch") {
        checkout(
          parseInt(total).toFixed(2),
          convertToNumericCode(country)!,
          orderId,
          "jezeadiebuo5@gmail.com"
        );
      } else {
        await axios.get(
          `https://wa.me/+2347036374586?text=I%20want%20to%20make%20a%20purchase%20on%20your%20website%20for%20item(s)%20with%20id%20${orderId}`
        );
      }
    } catch (error: any) {
      toast.error(error);
    }
  }

  return (
    <main className="min-h-screen w-full mx-auto flex flex-row">
      <form className="flex w-[55%] flex-col h-full gap-y-9 border bg-white border-gray-300 border-l-0 border-t-0 border-b-0 pb-5 pt-7 md:pl-28 pl-8 pr-9">
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
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
            />
          </div>
          <div className="inline-flex flex-row gap-x-2 items-center">
            <input
              type="checkbox"
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
                    setCountry(e.target.value);
                    setPhonePlaceholder(
                      `Phone: +${
                        Country.getCountryByCode(e.target.value)!.phonecode
                      }...`
                    );
                  }}
                  className="w-full h-6 appearance-none bg-transparent focus:outline-none pt-1 placeholder:text-gray-600 placeholder:text-sm text-sm"
                >
                  <option hidden>
                    {Country.getCountryByCode("NG")!.name}
                  </option>
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
              <div className="w-[49%] flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3  h-14">
                <label
                  htmlFor="fname"
                  className="text-xs hide-label text-gray-500"
                >
                  First name
                </label>
                <input
                  placeholder="First name"
                  onBlur={(e) => {
                    let item = e.currentTarget;
                    item.placeholder = "First name";
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
                  id="fname"
                  className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                />
              </div>
              <div className="w-[2%]"></div>
              <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-[49%] h-14">
                <label
                  htmlFor="lname"
                  className="text-xs hide-label text-gray-500"
                >
                  Last name
                </label>
                <input
                  placeholder="Last name"
                  onBlur={(e) => {
                    let item = e.currentTarget;
                    item.placeholder = "Last name";
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
                  id="lname"
                  className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                />
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
                onBlur={(e) => {
                  let item = e.currentTarget;
                  item.placeholder = "Address";
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
                id="address"
                className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
              />
            </div>
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
                className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
              />
            </div>
            <div className="w-full flex flex-row">
              {City.getCitiesOfCountry(country)!.length > 0 ? (
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
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none pt-1 text-sm"
                    >
                      {City.getCitiesOfCountry(country)!.map((city, index) => (
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
                <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-[32%] h-14">
                  <label
                    htmlFor="city"
                    className="text-xs hide-label text-gray-500"
                  >
                    City
                  </label>
                  <input
                    placeholder="City"
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
                    id="city"
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>
              )}
              <div className="w-[2%]"></div>
              {State.getStatesOfCountry(country)!.length > 0 ? (
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
                      }}
                      className="w-full h-6 bg-transparent focus:outline-none pt-1 placeholder:text-gray-600 placeholder:text-sm text-sm"
                    >
                      {State.getStatesOfCountry(country)!.map(
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
                <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-[32%] h-14">
                  <label
                    htmlFor="state"
                    className="text-xs hide-label text-gray-500"
                  >
                    State
                  </label>
                  <input
                    placeholder="State"
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
                    id="state"
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
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
                  className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
              <label
                htmlFor="phone"
                className="text-xs hide-label text-gray-500"
              >
                Phone
              </label>
              <div className="flex flex-row justify-between items-center">
                <input
                  placeholder={`${phonePlaceholder}`}
                  onBlur={(e) => {
                    let item = e.currentTarget;
                    item.placeholder = `${phonePlaceholder}`;
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
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                />
                <span className="icon-container">
                  <i className="fa-regular fa-circle-question cursor-pointer"></i>
                  <span className="hint text-[.7rem]">
                    In case we need to contact you about your order
                  </span>
                </span>
              </div>
            </div>
            <div className="inline-flex flex-row gap-x-2 items-center">
              <input
                type="checkbox"
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

                setShippingMethod(5000);
              }}
              className="bg-checkout-100 rounded-tl-md rounded-tr-md border border-checkout-300 cursor-pointer flex flex-row justify-between items-center px-4 py-5 text-sm font-sans w-full"
            >
              <div className="flex flex-row gap-x-3 items-center">
                <input type="checkbox" className="checkbox standard" />
                <h3>Standard shipping (8 - 14 business days)</h3>
              </div>
              <h5 className="font-medium">&#8358;5,000</h5>
            </div>
            <div
              onClick={(e) => {
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

                setShippingMethod(8500);
              }}
              className=" cursor-pointer rounded-bl-md rounded-br-md border border-gray-300 flex flex-row justify-between items-center px-4 py-5 text-sm font-sans w-full"
            >
              <div className="flex flex-row gap-x-3 items-center">
                <input type="checkbox" className="checkbox" />
                <h3>Express shipping (5 - 7 business days)</h3>
              </div>
              <h5 className="font-medium">&#8358;8,500</h5>
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
              <div className="flex flex-col focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full bg-white">
                <h5 className="text-xs text-gray-500">Country/Region</h5>
                <div className="select-container">
                  <select
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setPhonePlaceholder(
                        `Phone: +${
                          Country.getCountryByCode(e.target.value)!.phonecode
                        }...`
                      );
                    }}
                    className="w-full h-6 appearance-none bg-transparent focus:outline-none pt-1 placeholder:text-gray-600 placeholder:text-sm text-sm"
                  >
                    <option hidden>
                      {Country.getCountryByCode("NG")!.name}
                    </option>
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
                <div className="w-[49%] flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg bg-white border-gray-300 border py-2 px-3  h-14">
                  <label
                    htmlFor="fname"
                    className="text-xs hide-label text-gray-500"
                  >
                    First name
                  </label>
                  <input
                    placeholder="First name"
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "First name";
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
                    id="fname"
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>
                <div className="w-[2%]"></div>
                <div className="flex flex-col bg-white justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-[49%] h-14">
                  <label
                    htmlFor="lname"
                    className="text-xs hide-label text-gray-500"
                  >
                    Last name
                  </label>
                  <input
                    placeholder="Last name"
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = "Last name";
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
                    id="lname"
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>
              </div>
              <div className="flex bg-white flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
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
                  className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                />
              </div>
              <div className="flex bg-white flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
                <label
                  htmlFor="address"
                  className="text-xs hide-label text-gray-500"
                >
                  Address
                </label>
                <input
                  placeholder="Address"
                  onBlur={(e) => {
                    let item = e.currentTarget;
                    item.placeholder = "Address";
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
                  id="address"
                  className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                />
              </div>
              <div className="flex bg-white flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
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
                  className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                />
              </div>
              <div className="w-full flex flex-row">
                {City.getCitiesOfCountry(country)!.length > 0 ? (
                  <div className="w-[32%] bg-white flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3  h-14">
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
                        }}
                        className="w-full h-6 bg-transparent focus:outline-none pt-1 text-sm"
                      >
                        {City.getCitiesOfCountry(country)!.map(
                          (city, index) => (
                            <option key={index} value={city.name}>
                              {city.name}
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
                  <div className="flex flex-col justify-center gap-y-1 bg-white focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-[32%] h-14">
                    <label
                      htmlFor="city"
                      className="text-xs hide-label text-gray-500"
                    >
                      City
                    </label>
                    <input
                      placeholder="City"
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
                      id="city"
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                )}
                <div className="w-[2%]"></div>
                {State.getStatesOfCountry(country)!.length > 0 ? (
                  <div className="w-[32%] bg-white flex flex-col justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3  h-14">
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
                        }}
                        className="w-full h-6 bg-transparent focus:outline-none pt-1 placeholder:text-gray-600 placeholder:text-sm text-sm"
                      >
                        {State.getStatesOfCountry(country)!.map(
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
                  <div className="flex flex-col bg-white justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-[32%] h-14">
                    <label
                      htmlFor="state"
                      className="text-xs hide-label text-gray-500"
                    >
                      State
                    </label>
                    <input
                      placeholder="State"
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
                      id="state"
                      className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                    />
                  </div>
                )}
                <div className="w-[2%]"></div>
                <div className="flex flex-col bg-white justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-[32%] h-14">
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
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col bg-white justify-center gap-y-1 focus-within:border-checkout-200 rounded-lg border-gray-300 border py-2 px-3 w-full h-14">
                <label
                  htmlFor="phone"
                  className="text-xs hide-label text-gray-500"
                >
                  Phone
                </label>
                <div className="flex flex-row justify-between items-center">
                  <input
                    placeholder={`${phonePlaceholder}`}
                    onBlur={(e) => {
                      let item = e.currentTarget;
                      item.placeholder = `${phonePlaceholder}`;
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
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-6 bg-transparent focus:outline-none py-1 placeholder:text-gray-500 placeholder:text-sm placeholder:font-sans text-sm"
                  />
                  <span className="icon-container">
                    <i className="fa-regular fa-circle-question cursor-pointer"></i>
                    <span className="hint text-[.7rem]">
                      In case we need to contact you about your order
                    </span>
                  </span>
                </div>
              </div>
              <div className="inline-flex flex-row gap-x-2 items-center">
                <input
                  type="checkbox"
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
        <button
          onClick={completeOrder}
          className="px-7 w-full h-12 py-3 bg-gray-700 hover:bg-gray-800 hover:ring-1 ring-gray-800 text-white"
        >
          Complete order
        </button>
      </form>

      <section className="pt-12 w-[45%] flex flex-col h-full pl-11 gap-y-7 sticky top-0">
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
                    alt={`cart-item${i + 1}`}
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
      </section>
    </main>
  );
}
