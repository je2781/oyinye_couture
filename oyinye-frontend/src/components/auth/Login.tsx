"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import useAuth from "@/store/useAuth";

export default function LoginPage({ message, success, csrf }: any) {
  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });

  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const {setAuthStatus} = useAuth();

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user, setButtonDisabled]);

  useEffect(() => {
    if (success === true) {
      toast.success(message, {
        duration: 5000,
        position: "top-center",
      });
    } else if (success === false) {
      toast.error(message, {
        duration: 5000,
        position: "top-center",
      });
    }
  }, [success, message]);

  async function onLogin() {
    try {
      if (!user.email.includes("@")) {
        return toast.error("Invalid email", {
          position: "top-center",
        });
      }

      if (user.password.length < 3) {
        return toast.error("password must be greater than 3 characters", {
          position: "top-center",
        });
      }

      setIsLoading(true);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_WEB_DOMAIN}/api/users/login`, user, {
        withCredentials: true,
        headers: {
          "x-csrf-token": csrf,
        },
      });

      const extractedUser = res.data.user;

      if (extractedUser && res.status === 201) {
        if (!extractedUser.account_is_verified) {
          toast.error(`Check ${extractedUser.email} for verification link`, {
            position: "top-center",
          });
        } else {
          setAuthStatus(true);

          toast.success("Login successful!");
          if (extractedUser.is_admin) {
            window.location.href = `/admin/summary`;
          } else {
            window.location.href = `/`;
          }
        }
      } else {
        throw new Error(res.data.message);
      }
    } catch (error) {
      const e = error as Error;
      setIsLoading(false);
      return toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if(!isLoading){
          await onLogin();
        }
      }}
      className="flex flex-col items-center justify-start gap-y-4 bg-[#f7f7f7] pt-12 min-h-screen"
    >
      <h1 className="lg:text-5xl text-3xl font-sans lg:pb-5 pb-2 font-light">
        Login
      </h1>
      <div className="flex flex-col lg:w-[480px] max-w-[80%] w-[360px]">
        <input
          className="p-4 bg-transparent border border-gray-300 focus:outline-none focus:border-gray-600 placeholder:font-sans placeholder:text-lg"
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
            type={`${isVisible ? "text" : "password"}`}
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            placeholder="password"
          />
          <div className="w-[5%] inline-block">
            <i
              className="fa-solid fa-eye cursor-pointer w-full"
              onClick={() => setIsVisible((prevState) => !prevState)}
            ></i>
          </div>
        </section>
        <section className="flex flex-row justify-start">
          <Link
            href={`/resetpassword`}
            className="btn text-center text-gray-700 font-sans underline underline-offset-4 hover:decoration-2"
          >
            Forgot your password?
          </Link>
        </section>
      </div>
      <div className="flex flex-col gap-y-4 items-center pt-6">
        <button
          disabled={buttonDisabled || isLoading}
          type="submit"
          className={`px-9 py-3 font-sans text-white ${
            buttonDisabled || isLoading ? "bg-black/70 cursor-not-allowed" : "bg-black hover:ring-2 ring-black cursor-pointer"
          } `}
        >
          {isLoading ? "Processing.." : "Sign In"}
        </button>
        <Link
          href={`/signup`}
          className=" text-center text-gray-700 underline-offset-4 underline font-sans hover:decoration-2"
        >
          Create account
        </Link>
      </div>
    </form>
  );
}
