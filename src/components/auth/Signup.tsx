"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from '@/i18n/routing';
import axios from "axios";
import toast from "react-hot-toast";
import useGlobal from "@/store/useGlobal";

export default function LoginPage() {
  const [user, setUser] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (
      user.email.includes('@') &&
      user.firstName.length > 0 &&
      user.lastName.length > 0 &&
      user.password.length >= 8
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user, setButtonDisabled]);

  async function onSignup() {
    try {
        setIsLoading(true);
        const res = await axios.post("/api/users/signup", user);

        if(res.data.success){
          router.push(`/login`);
        }else{
          toast.error(res.data.error);
        }
    } catch (error: any) {
        toast.error(error.message);
    }finally{
      setIsLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={(e) => {
        e.preventDefault();
        onSignup();
      }} 
      className="flex flex-col items-center justify-start gap-y-4 bg-[#f7f7f7] pt-12 min-h-screen">
        <h1 className="lg:text-5xl text-3xl font-sans lg:pb-5 pb-2 font-light">Create account</h1>
        <div className="flex flex-col lg:w-[480px] max-w-[80%] w-[360px]">
          <input
            className="p-4 border border-gray-300 focus:outline-none focus:border-gray-600 placeholder:font-sans placeholder:text-lg"
            id="firstName"
            type="text"
            value={user.firstName}
            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            placeholder="First name"
          />
        </div>
        <div className="flex flex-col lg:w-[480px] max-w-[80%] w-[360px] gap-y-0">
          <input
            className="p-4 border border-gray-300 focus:outline-none focus:border-gray-600 placeholder:font-sans placeholder:text-lg"
            id="lastName"
            type="text"
            value={user.lastName}
            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            placeholder="Last name"
          />
        </div>
        <div className="flex flex-col lg:w-[480px] max-w-[80%] w-[360px]">
          <input
            className="p-4 border border-gray-300 focus:outline-none focus:border-gray-600 placeholder:font-sans placeholder:text-lg"
            id="email"
            type="text"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Email"
          />
        </div>
        <div className="flex flex-col lg:w-[480px] max-w-[80%] w-[360px] gap-y-0">
          <section className="focus-within:border focus-within:border-gray-600 w-full px-4 border flex flex-row gap-x-4 items-center bg-transparent border-gray-300 mb-2">
              <input
                className="py-4 focus:outline-none placeholder:font-sans placeholder:text-lg w-[95%] h-full bg-transparent"
                id="password"
                type={`${isVisible ? 'text' : 'password'}`}
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                placeholder="password"
              />
              <div className="w-[5%] inline-block">
                <i className="fa-solid fa-eye cursor-pointer w-full" onClick={() => setIsVisible(prevState => !prevState)}></i>
              </div>
            </section>
        </div>
        <div className="flex flex-col gap-y-4 items-center pt-6">
          <button
          disabled={buttonDisabled}
            onClick={onSignup}
            type="submit"
            className={`px-9 py-3 font-sans text-white ${
              buttonDisabled ? "bg-gray-400" : "bg-black hover:ring-2 ring-black"
            } `}
          >
            {isLoading
            ? "Processing.."
            : "Create"}
          </button>
          
        </div>
        
      </form>
    </>
  );
}
