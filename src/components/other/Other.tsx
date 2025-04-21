"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

export default function OthersComponent({ name, csrf }: any) {
  const [email, setEmail] = React.useState("");
  const [loader, setLoader] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const router = useRouter();
  let content: JSX.Element = <></>;

  React.useEffect(() => {
    if (
      firstName.length > 0 &&
      lastName.length > 0 &&
      email.includes("@") &&
      subject.length > 0 &&
      message.length > 0
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [firstName, lastName, email, subject, message, setButtonDisabled]);

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
        `/api/enquiries/contact`,
        {
          email,
          name: `${firstName} ${lastName}`,
          subject,
          message,
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
      toast.success("Contact Request has been sent");

      router.push(`/`);
    }
  }

  switch (name) {
    case "contact":
      content = (
        <main className="container mx-auto bg-white min-h-screen max-w-7xl lg:pb-12 lg:pt-16 py-8 lg:px-8 px-6 flex flex-row font-sans">
          <article className="flex flex-col w-full gap-y-11 lg:w-[50%]">
            <header className="lg:text-6xl text-4xl font-light">
              Our Studio
            </header>
            <div className="w-full flex flex-col gap-y-6">
              <h1 className="lg:text-4xl text-3xl font-light">Find Us</h1>
              <p className="font-light">
                Oyinye Couture LLC.
                <br />
                Flat 4 Park Avenue Cooperative Villas,
                <br /> Lekki, Lagos, Nigeria
              </p>
              <p className="font-light">
                Please call us on{" "}
                <Link
                  href="tel:+2349061681807"
                  className="underline underline-offset-2 text-checkout-300"
                >
                  +2349061681807
                </Link>{" "}
                or email us if you would like to visit our studio
                <br />
                <Link
                  href="mailto:hello@oyinye.com"
                  className="underline underline-offset-2 text-checkout-300"
                >
                  hello@oyinye.com
                </Link>
              </p>
            </div>
            <div className="w-full flex flex-col gap-y-6">
              <h1 className="lg:text-4xl text-3xl font-light">Contact Us</h1>
              <p className="font-light">
                Have a question or looking for more information about our
                products,
                <br /> please fill out the form below or email us at{" "}
                <Link
                  href="mailto:hello@oyinye.com"
                  className="underline underline-offset-2 text-checkout-300"
                >
                  hello@oyinye.com
                </Link>{" "}
                and we&apos;ll be in touch.
              </p>
            </div>
            <form
              className="space-y-5 lg:w-[130%] w-full text-sm"
              onSubmit={handleFormSubmit}
            >
              <header className="lg:text-4xl text-3xl font-light">
                Contact Form
              </header>
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
                <div className="w-full flex flex-col gap-y-2 ">
                  <label htmlFor="subject" className="tracking-widest">
                    SUBJECT
                  </label>
                  <input
                    onChange={(e) => setSubject(e.target.value)}
                    value={subject}
                    onBlur={(e) => {
                      if (e.target.value.length === 0) {
                        document
                          .querySelector("#subject-error")
                          ?.classList.remove("hidden");
                      } else {
                        document
                          .querySelector("#subject-error")
                          ?.classList.add("hidden");
                      }
                    }}
                    id="subject"
                    className="focus:outline-none text-[1rem] focus:rounded-md placeholder:text-[1rem] placeholder:font-light focus:border-2 focus:border-gray-600 font-light px-3 py-2 border border-gray-300"
                  />
                </div>
                <p
                  id="subject-error"
                  className="text-red-600 text-xs font-sans hidden -mt-1"
                >
                  Provide a subject for your message
                </p>
              </div>
              <div className="w-full flex flex-col gap-y-2">
                <div className="w-full flex flex-col gap-y-2">
                  <label htmlFor="message" className="tracking-widest">
                    MESSAGE
                  </label>
                  <textarea
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                    onBlur={(e) => {
                      if (e.target.value.length === 0) {
                        document
                          .querySelector("#message-error")
                          ?.classList.remove("hidden");
                      } else {
                        document
                          .querySelector("#message-error")
                          ?.classList.add("hidden");
                      }
                    }}
                    id="message"
                    cols={50}
                    rows={5}
                    className="focus:outline-none text-[1rem] focus:rounded-md placeholder:text-[1rem] placeholder:font-light focus:border-2 focus:border-gray-600 font-light px-3 py-2 border border-gray-300"
                  ></textarea>
                </div>
                <p
                  id="message-error"
                  className="text-red-600 text-xs font-sans hidden -mt-1"
                >
                  Why are you contacting us?
                </p>
              </div>
              <div className="pt-7 w-full">
                <button
                  disabled={buttonDisabled}
                  type="submit"
                  className={`text-white py-4  w-full text-[1rem] ${
                    buttonDisabled
                      ? "bg-black/70 cursor-not-allowed"
                      : "bg-black hover:ring-2 ring-black cursor-pointer"
                  }`}
                >
                  {loader ? "Processing" : "Submit Form"}
                </button>
              </div>
            </form>
          </article>
          <div className="w-[50%] lg:inline-block hidden pl-12">
            <div
              className="w-[500px] h-[500px] rounded-[50%] bg-contain bg-center bg-red-500"
              // style={{backgroundImage: `url(${StudioDress})`}}
            ></div>
          </div>
        </main>
      );
      break;

    default:
      break;
  }
  return content;
}
