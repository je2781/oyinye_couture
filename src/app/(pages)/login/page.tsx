"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import useCart from "@/store/useCart";
import Header from "@/components/Header";

export default function LoginPage() {
  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const {items} = useCart();
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  async function onLogin() {
    try {
      setIsLoading(true);
      await axios.post("/api/users/login", user);
      toast.success("Login successful!");
      if(items.length > 0){
        router.push("/cart");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-start gap-y-4 bg-[#f7f7f7] pt-12">
        <h1 className="lg:text-5xl text-3xl font-sans lg:pb-5 pb-2 font-light">Login</h1>
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
          <input
            className="p-4 border border-gray-300 mb-2 focus:outline-none focus:border-gray-600 placeholder:font-sans placeholder:text-lg"
            id="password"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="password"
          />
          <section className="flex flex-row justify-start">
            <Link
                href="/resetpassword"
                className="btn text-center text-gray-700 font-sans underline underline-offset-4 hover:decoration-2"
              >
                Forgot your password?
            </Link>
          </section>
        </div>
        <div className="flex flex-col gap-y-4 items-center pt-6">
          <button
          disabled={buttonDisabled}
            onClick={onLogin}
            className={`px-9 py-3 font-sans text-white ${
              buttonDisabled ? "bg-gray-400" : "bg-black hover:ring-2 ring-black"
            } `}
          >
            {isLoading
            ? "Processing.."
            : "Sign In"}
          </button>
          <Link
            href="/signup"
            className=" text-center text-gray-700 underline-offset-4 underline font-sans hover:decoration-2"
          >
            Create account
          </Link>
        </div>
        
      </div>
    </>
  );
}
