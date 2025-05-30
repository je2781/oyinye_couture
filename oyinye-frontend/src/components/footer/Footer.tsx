"use client";

import toast from "react-hot-toast";
import axios from "axios";
import React from "react";
import Link from "next/link";

export default function Footer({ csrfToken }: {csrfToken: string}) {
  const [loader, setLoader] = React.useState(false);

  return (
    <footer
      className={`flex flex-col lg:gap-y-8 gap-y-5 bg-white items-center font-sans pb-7 md:pt-14 pt-3 px-4 lg:pl-0 lg:pr-6 mx-auto container`}
    >
      <header className="font-medium text-lg w-full flex lg:flex-row flex-col items-center gap-x-16">
        <div className="inline-flex flex-col lg:w-[50%] w-full gap-y-3">
          <h2>Menu</h2>
          <hr className="border border-gray-200/50 inline-block" />
        </div>
        <div className="lg:inline-flex flex-col w-[50%] hidden gap-y-3">
          <h2>Newsletter</h2>
          <hr className="border border-gray-200/50 inline-block" />
        </div>
      </header>
      <section className="text-gray-600 w-full flex lg:flex-row flex-col items-start gap-x-16 lg:text-[.9rem] text-sm max-w-7xl">
        <ul className="flex flex-col gap-y-3 lg:w-[50%] w-full">
          <li>
            <Link
              href={`/other/about`}
              className="hover:underline hover:underline-offset-4"
              style={{ textDecorationThickness: "2px" }}
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              href={`/other/contact`}
              className="hover:underline hover:underline-offset-4"
              style={{ textDecorationThickness: "2px" }}
            >
              Contact Us
            </Link>
          </li>
          <li>
            <Link
              href={`/other/size-guide`}
              className="hover:underline hover:underline-offset-4"
              style={{ textDecorationThickness: "2px" }}
            >
              Size Guide
            </Link>
          </li>
          <li>
            <Link
              href={`/order`}
              className="hover:underline hover:underline-offset-4"
              style={{ textDecorationThickness: "2px" }}
            >
              Bespoke
            </Link>
          </li>
          <li>
            <Link
              href={`/other/shipping-policy`}
              className="hover:underline hover:underline-offset-4"
              style={{ textDecorationThickness: "2px" }}
            >
              Shipping Policy
            </Link>
          </li>
          <li>
            <Link
              href={`/other/returns-policy`}
              className="hover:underline hover:underline-offset-4"
              style={{ textDecorationThickness: "2px" }}
            >
              Returns Policy
            </Link>
          </li>
          <li>
            <Link
              href={`/other/privacy-policy`}
              className="hover:underline hover:underline-offset-4"
              style={{ textDecorationThickness: "2px" }}
            >
              Privacy Policy
            </Link>
          </li>
          {/* <div className="flex flex-col items-start gap-y-4 mt-5">
            <h5>Language</h5>
            <div
              onClick={() => {
                let downAngle = document.querySelector("i.lang-angle-down");
                if (!downAngle?.classList.contains("ad-rotate")) {
                  downAngle?.classList.add("ad-rotate");
                  downAngle?.classList.remove("ad-rotate-anticlock");
                } else {
                  downAngle?.classList.remove("ad-rotate");
                  downAngle?.classList.add("ad-rotate-anticlock");
                }
              }}
              className="relative border border-gray-400 rounded-sm p-1 focus:border-gray-600 md:w-[40%] w-[55%] cursor-pointer"
            >
              <select
                id="lang-select"
                className="focus:outline-none p-2 appearance-none w-full cursor-pointer"
                // onChange={(e) => {
                //   reloadPageWithLocale(
                //     path,
                //     locale,
                //     searchParams,
                //     e.target.value
                //   );
                // }}
              >
                <option hidden value="">
                  {lang === "en"
                    ? "English"
                    : lang === "fr"
                    ? "French"
                    : lang === "nl"
                    ? "Dutch"
                    : lang === "pt-PT"
                    ? "Portugese (Portugal)"
                    : lang === "zh-TW"
                    ? "Chinese (traditional)"
                    : "Spanish"}
                </option>
                {["en", "fr", "nl", "pt-PT", "zh-TW", "es"].map((val, i) => (
                  <option
                    className="underline underline-offset-1"
                    value={val}
                    key={i}
                  >
                    {val === "en"
                      ? "English"
                      : val === "fr"
                      ? "French"
                      : val === "nl"
                      ? "Dutch"
                      : val === "pt-PT"
                      ? "Portugese (Portugal)"
                      : val === "zh-TW"
                      ? "Chinese (traditional)"
                      : "Spanish"}
                  </option>
                ))}
              </select>
              <i
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="fa-solid fa-angle-down lang-angle-down absolute md:top-[38%] top-[35%] right-3"
              ></i>
            </div>
          </div> */}
        </ul>
        <header className="lg:hidden inline-flex flex-col lg:w-[50%] w-full gap-y-3 mt-6 text-lg text-black font-medium">
          <h2>Newsletter</h2>
          <hr className="border border-gray-200/50 inline-block" />
        </header>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            let leadEmail = document.getElementById(
              "subscribe"
            ) as HTMLInputElement;

            //validation checks
            if (leadEmail && !leadEmail.value.includes("@")) {
              document
                .querySelector("#email-error")
                ?.classList.remove("hidden");
              return;
            } else {
              document.querySelector("#email-error")?.classList.add("hidden");
            }

            try {
              setLoader(true);
              const res = await axios.post(
                `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/api/users/signup`,
                {
                  email: leadEmail!.value,
                  enableEmailMarketing: true,
                },
                {
                  withCredentials: true,
                  headers: {
                    "x-csrf-token": csrfToken,
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
              toast.success("Thank you for joining our mailing list");
            }
          }}
          className="lg:w-[50%] w-full flex flex-col gap-y-5 pt-5 lg:pt-0"
        >
          <p className="text-sm">
            Join the oyinye couture community to stay updated on promotions and
            new releases.
          </p>
          <div className="flex flex-col items-start gap-y-1">
            <div className="inline-flex flex-row border border-gray-500/60 w-full pl-2 pr-1 rounded-sm justify-between items-center">
              <input
                className="px-2 py-3 w-full focus:outline-none"
                id="subscribe"
                placeholder="youremail@example.com"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-gray-600 text-white text-[.85rem] rounded-sm"
              >
                {loader ? "Processing" : "Join"}
              </button>
            </div>
            <p id="email-error" className="text-red-500 text-sm hidden">
              email is blank
            </p>
          </div>
        </form>
      </section>
      <section className="py-5 flex flex-col items-center">
        <div className="inline-flex flex-row gap-x-3 items-center">
          <Link href="https://instagram.com/oyinye_couture">
            <i className="fa-brands text-2xl text-gray-600 fa-instagram"></i>
          </Link>
          <Link href="https://facebook.com/oyinye_couture">
            <i className="fa-brands text-2xl text-gray-600 fa-facebook"></i>
          </Link>
        </div>
        <p className="text-gray-600 text-sm mt-8">
          &#64;&nbsp;{new Date().getFullYear()}, Oyinye designed by{" "}
          <Link href="mailto:jezeadiebuo5@gmail.com">Joshua Ezeadiebuo</Link>
        </p>
      </section>
    </footer>
  );
}
