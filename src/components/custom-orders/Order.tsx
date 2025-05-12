"use client";

import { generateBase64FromMedia } from "@/helpers/getHelpers";
import axios from "axios";
import { Country } from "country-state-city";
import React from "react";
import toast from "react-hot-toast";

export default function Order({ country, csrf }: any) {
  const [countryName, setCountryName] = React.useState(
    Country.getCountryByCode(country)!.name
  );
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const [uploadedFiles, setUploadedFiles] = React.useState<string[]>([]);
  const [base64Images, setBase64Images] = React.useState<string[]>([]);
  const [phonePlaceholder, setPhonePlaceholder] = React.useState(
    `Phone: +${Country.getCountryByCode(country)!.phonecode}...`
  );
  const [loader, setLoader] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [size, setSize] = React.useState("");
  const [eventDate, setEventDate] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  React.useEffect(() => {
    if (
      firstName.length > 0 &&
      lastName.length > 0 &&
      phone.length > 0 &&
      email.length > 0
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [firstName, lastName, phone, email, setButtonDisabled]);

  async function handleUploads(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files![0];
    //retrieving uploaded file data
    setUploadedFiles((prevFiles) => [...prevFiles, file.name]);
    const base64Image = await generateBase64FromMedia(file);
    setBase64Images((prevImages) => [...prevImages, base64Image as string]);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    let errorsCount = 0;

    //validation checks
    const errors = document.querySelectorAll(`[id$=error]`);

    errors.forEach((error) => {
      if (!error.classList.contains("hidden")) {
        errorsCount++;
      }
    });

    if (errorsCount > 0) {
      return toast.error("The values entered are invalid");
    }

    try {
      setLoader(true);
      await axios.post(
        `/api/enquiries/custom-order`,
        {
          email,
          name: `${firstName} ${lastName}`,
          content,
          country: countryName,
          size: parseInt(size),
          phone,
          eventDate,
          styles: uploadedFiles.map((file) => ({
            image: base64Images,
            fileName: file,
          })),
        },
        {
          headers: {
            "x-csrf-token": csrf,
          },
        }
      );
    } catch (error: any) {
      setLoader(false);
      return toast.error(error.message);
    } finally {
      setLoader(false);
      toast.success("Appointment Request Sent");

      const url = new URL(`${window.location.origin}`);

      window.location.href = url.toString();
    }
  }

  return (
    <main className="container mx-auto bg-white w-full min-h-screen max-w-7xl lg:py-12 py-8 lg:px-12 px-8 flex flex-col gap-y-9 items-center">
      <article className="space-y-11">
        <header className="flex flex-col md:items-start items-center gap-y-4">
          <h1 className="text-4xl font-serif">Your Bespoke Order</h1>
          <p className="font-sans text-[1rem] text-center">
            Please complete the form below to place your order. We aim to
            respond to all requests within 24 - 48 hours.
          </p>
        </header>
        <form
          className="space-y-5 text-gray-500 font-sans text-sm"
          onSubmit={handleFormSubmit}
        >
          <div className="w-full flex md:flex-row flex-col gap-y-4">
            <div className="flex flex-col gap-y-2 md:w-[49%] w-full">
              <div className="w-full flex flex-col gap-y-2">
                <label htmlFor="fName" className="tracking-widest">
                  FIRST NAME
                </label>
                <input
                  onChange={(e) => setFirstName(e.target.value)}
                  value={firstName}
                  onBlur={(e) => {
                    if (e.target.value.length < 3) {
                      document
                        .querySelector("#fname-error")
                        ?.classList.remove("hidden");
                    } else {
                      document
                        .querySelector("#fname-error")
                        ?.classList.add("hidden");
                    }
                  }}
                  placeholder="First Name"
                  id="fName"
                  className="focus:outline-none text-[1rem] focus:rounded-md placeholder:text-[1rem] placeholder:font-light focus:border-2 focus:border-gray-600 font-light px-3 py-2 border border-gray-300"
                />
              </div>
              <p
                id="fname-error"
                className="text-red-600 text-xs font-sans hidden -mt-1"
              >
                A first name is required
              </p>
            </div>
            <div className="w-[2%] hidden md:block"></div>
            <div className="md:w-[49%] w-full flex flex-col gap-y-2">
              <div className="w-full flex flex-col gap-y-2">
                <label htmlFor="lName" className="tracking-widest">
                  LAST NAME
                </label>
                <input
                  onChange={(e) => setLastName(e.target.value)}
                  value={lastName}
                  onBlur={(e) => {
                    if (e.target.value.length < 3) {
                      document
                        .querySelector("#lname-error")
                        ?.classList.remove("hidden");
                    } else {
                      document
                        .querySelector("#lname-error")
                        ?.classList.add("hidden");
                    }
                  }}
                  placeholder="Last Name"
                  className="focus:outline-none text-[1rem] focus:rounded-md placeholder:text-[1rem] placeholder:font-light focus:border-2 focus:border-gray-600 font-light px-3 py-2 border border-gray-300"
                  id="lName"
                />
              </div>
              <p
                id="lname-error"
                className="text-red-600 text-xs font-sans hidden -mt-1"
              >
                A last name is required
              </p>
            </div>
          </div>
          <div className="w-full flex flex-col gap-y-2">
            <div className="w-full flex flex-col gap-y-2 ">
              <label htmlFor="email" className="tracking-widest">
                EMAIL
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                onBlur={(e) => {
                  if (!e.target.value.includes("@")) {
                    document
                      .querySelector("#email-error")
                      ?.classList.remove("hidden");
                  } else {
                    document
                      .querySelector("#email-error")
                      ?.classList.add("hidden");
                  }
                }}
                placeholder="hello@email.com"
                id="email"
                className="focus:outline-none text-[1rem] focus:rounded-md placeholder:text-[1rem] placeholder:font-light focus:border-2 focus:border-gray-600 font-light px-3 py-2 border border-gray-300"
              />
            </div>
            <p
              id="email-error"
              className="text-red-600 text-xs font-sans hidden -mt-1"
            >
              An email is required
            </p>
          </div>
          <div className="w-full flex flex-col gap-y-2">
            <div className="w-full flex flex-col gap-y-2">
              <label htmlFor="phone" className="tracking-widest">
                PHONE NUMBER
              </label>
              <input
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                placeholder={`${phonePlaceholder}`}
                onBlur={(e) => {
                  if (e.target.value.length < 10) {
                    document
                      .querySelector("#phone-error")
                      ?.classList.remove("hidden");
                  } else {
                    document
                      .querySelector("#phone-error")
                      ?.classList.add("hidden");
                  }
                }}
                id="phone"
                type="tel"
                className="focus:outline-none text-[1rem] focus:rounded-md placeholder:text-[1rem] placeholder:font-light focus:border-2 focus:border-gray-600 font-light px-3 py-2 border border-gray-300"
              />
            </div>
            <p
              id="phone-error"
              className="text-red-600 text-xs font-sans hidden -mt-1"
            >
              A phone number is required
            </p>
          </div>
          <div className="w-full flex flex-col gap-y-2">
            <div className="w-full flex flex-col gap-y-2">
              <label htmlFor="event-date" className="tracking-widest">
                DATE OF EVENT?
              </label>
              <input
                onChange={(e) => setEventDate(e.target.value)}
                value={eventDate}
                onBlur={(e) => {
                  if (e.target.value.length === 0) {
                    document
                      .querySelector("#event-date-error")
                      ?.classList.remove("hidden");
                  } else {
                    document
                      .querySelector("#event-date-error")
                      ?.classList.add("hidden");
                  }
                }}
                type="date"
                id="event-date"
                className="focus:outline-none text-[1rem] focus:rounded-md placeholder:text-[1rem] placeholder:font-light focus:border-2 focus:border-gray-600 font-light px-3 py-2 border border-gray-300"
              />
            </div>
            <p
              id="event-date-error"
              className="text-red-600 text-xs font-sans hidden -mt-1"
            >
              An event date is required
            </p>
          </div>
          <div className="w-full flex flex-col gap-y-2">
            <div className="w-full flex flex-col gap-y-2">
              <label htmlFor="size" className="tracking-widest">
                YOUR STANDARD SIZE (UK/US)
              </label>
              <select
                onChange={(e) => setSize(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value.length === 0) {
                    document
                      .querySelector("#size-error")
                      ?.classList.remove("hidden");
                  } else {
                    document
                      .querySelector("#size-error")
                      ?.classList.add("hidden");
                  }
                }}
                id="size"
                className="focus:outline-none text-[1rem] focus:rounded-md placeholder:text-[1rem] placeholder:font-light focus:border-2 focus:border-gray-600 font-light px-3 py-2 border border-gray-300 appearance-none"
              >
                <option selected value="">
                  Select your size
                </option>
                <option value={8}>UK 8/ US 6</option>
                <option value={10}>UK 10/ US 8</option>
                <option value={12}>UK 12/ US 10</option>
                <option value={14}>UK 14/ US 12</option>
                <option value={16}>UK 16/ US 14</option>
                <option value={18}>UK 18/ US 16</option>
              </select>
            </div>
            <p
              id="size-error"
              className="text-red-600 text-xs font-sans hidden -mt-1"
            >
              A standard size is required
            </p>
          </div>
          <div className="w-full flex flex-col gap-y-2 ">
            <label htmlFor="country" className="tracking-widest">
              COUNTRY
            </label>
            <select
              id="country"
              onChange={(e) => {
                setCountryName(Country.getCountryByCode(e.target.value)!.name);
              }}
              className="focus:outline-none text-[1rem] focus:rounded-md placeholder:text-[1rem] placeholder:font-light focus:border-2 focus:border-gray-600 font-light px-3 py-2 border border-gray-300 appearance-none"
            >
              <option hidden>{countryName}</option>
              {Country.getAllCountries().map((country, index) => (
                <option key={index} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full flex flex-col gap-y-2">
            <div className="w-full flex flex-col gap-y-2">
              <label htmlFor="info" className="tracking-widest">
                WHAT WOULD YOU LIKE TO ORDER FROM OYINYE?
              </label>
              <textarea
                onChange={(e) => setContent(e.target.value)}
                value={content}
                onBlur={(e) => {
                  if (e.target.value.length === 0) {
                    document
                      .querySelector("#content-error")
                      ?.classList.remove("hidden");
                  } else {
                    document
                      .querySelector("#content-error")
                      ?.classList.add("hidden");
                  }
                }}
                id="info"
                cols={50}
                rows={5}
                className="focus:outline-none text-[1rem] focus:rounded-md placeholder:text-[1rem] placeholder:font-light focus:border-2 focus:border-gray-600 font-light px-3 py-2 border border-gray-300"
              ></textarea>
            </div>
            <p
              id="content-error"
              className="text-red-600 text-xs font-sans hidden -mt-1"
            >
              What would you like to order from oyinye?
            </p>
          </div>
          <div className="w-full flex flex-col gap-y-2 ">
            <label
              htmlFor="info"
              className="tracking-widest text-gray-700 font-medium text-[1rem]"
            >
              Do you have any style ideas?
            </label>
            <div className="flex flex-row gap-x-3">
              <div className="inline-flex flex-row gap-x-2 items-center">
                <input
                  type="checkbox"
                  id="yes"
                  onChange={() => {
                    let uploads = document.getElementById("upload-container");
                    (document.getElementById(
                      "no"
                    ) as HTMLInputElement).checked = false;

                    if (uploads?.classList.contains("hidden")) {
                      uploads?.classList.remove("hidden");
                      uploads?.classList.add("inline-flex");
                    } else {
                      uploads?.classList.add("hidden");
                      uploads?.classList.remove("inline-flex");
                    }
                  }}
                  className="text-white bg-white appearance-none w-[16px] h-[16px] border border-checkout-200 rounded-sm relative
                                cursor-pointer outline-none checked:bg-checkout-200 checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                                checked:after:border-black checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                                checked:after:rotate-45"
                />
                <p className="text-[.85rem] font-sans">Yes</p>
              </div>
              <div className="inline-flex flex-row gap-x-2 items-center">
                <input
                  type="checkbox"
                  id="no"
                  onChange={() => {
                    (document.getElementById(
                      "yes"
                    ) as HTMLInputElement).checked = false;
                    let uploads = document.getElementById("upload-container");

                    uploads?.classList.add("hidden");
                    uploads?.classList.remove("inline-flex");

                    setUploadedFiles([]);
                    setBase64Images([]);
                  }}
                  className="text-white bg-white appearance-none w-[16px] h-[16px] border border-checkout-200 rounded-sm relative
                                cursor-pointer outline-none checked:bg-checkout-200 checked:after:absolute checked:after:content-[''] checked:after:top-[2px] checked:after:left-[5px] checked:after:w-[5px] checked:after:h-[8px]
                                checked:after:border-black checked:after:border-r-2 checked:after:border-b-2 checked:after:border-t-0 checked:after:border-l-0
                                checked:after:rotate-45"
                />
                <p className="text-[.85rem] font-sans">No</p>
              </div>
            </div>
          </div>
          <div className="flex-col w-full hidden gap-y-3" id="upload-container">
            <div className="flex flex-col items-start">
              {uploadedFiles.map((fileName: string, index: number) => (
                <p key={index}>{fileName}</p>
              ))}
            </div>
            <div className="flex-col flex w-full">
              <label
                htmlFor="uploads"
                className="flex flex-row gap-x-3 items-center justify-center focus:outline-none text-[1rem] hover:ring-1 hover:ring-gray-300 font-light py-4 border border-gray-300 cursor-pointer text-center"
              >
                <i className="fa-solid fa-camera text-lg"></i>
                <span>Upload Image(s)</span>
              </label>

              <input
                id="uploads"
                type="file"
                onChange={(e) => handleUploads(e)}
                className="hidden"
              />
            </div>
          </div>
          <div className="pt-7 w-full">
            <button
              disabled={buttonDisabled}
              type="submit"
              className={`${
                buttonDisabled
                  ? "bg-black/70 cursor-not-allowed"
                  : "bg-black hover:ring-2 ring-black cursor-pointer"
              } text-white w-full text-[1rem] py-4`}
            >
              {loader ? "Processing" : "Submit Order Request"}
            </button>
          </div>
        </form>
      </article>
    </main>
  );
}
