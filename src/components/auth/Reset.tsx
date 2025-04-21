"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function ResetPasswordPage({ csrf }: any) {
  const [user, setUser] = React.useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [error, setError] = React.useState(false);
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (user.password.length > 0 && user.confirmPassword.length > 0) {
      setButtonDisabled(false);
    } else if (user.email.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  useEffect(() => {
    const resetPasswordToken = window.location.search.split("=")[1];
    setToken(resetPasswordToken || "");
  }, []);

  async function onReset() {
    try {
      setIsLoading(true);
      await axios.post("/api/users/reset", user,{
        headers: {
          "x-csrf-token": csrf,
        }
      });
      toast.success("Reset password email has been sent!", {
        duration: 5000,
        position: "top-center",
      });
      router.push(`/login`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSetNewPassword() {
    try {
      setIsLoading(true);
      
      const res = await axios.post("/api/users/new-password", {
        ...user,
        token,
      },{
        headers: {
          "x-csrf-token": csrf,
        }
      });
      if (res.data.success === false) {
        toast.error(res.data.message, {
          duration: 5000,
          position: "top-center",
        });
      } else {
        toast.success(res.data.message, {
          duration: 5000,
          position: "top-center",
        });
      }
      router.push(`/login`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (token.length > 0) {
            onSetNewPassword();
          } else {
            onReset();
          }
        }}
        className="flex flex-col items-center justify-start gap-y-4 bg-[#f7f7f7] pt-12 min-h-screen"
      >
        <h1 className="lg:text-5xl text-3xl font-sans pb-2 font-light">
          {token.length > 0 ? "New Password" : "Reset your password"}
        </h1>
        {token.length === 0 && (
          <h1 className="lg:text-xl text-lg font-sans font-extralight pb-2">
            We will send you an email to reset your password
          </h1>
        )}
        <hr />
        {token.length === 0 && (
          <div className="flex flex-col lg:w-[480px] max-w-[80%] w-[360px]">
            <input
              className="p-4 border bg-transparent border-gray-300 focus:outline-none focus:border-gray-600 placeholder:font-sans placeholder:text-lg"
              id="email"
              type="text"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              placeholder="Email"
            />
          </div>
        )}
        {token.length > 0 && (
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
          </div>
        )}
        {token.length > 0 && (
          <div className="flex flex-col lg:w-[480px] max-w-[80%] w-[360px] gap-y-0">
            <input
              className="p-4 border bg-transparent border-gray-300 focus:outline-none focus:border-gray-600 placeholder:font-sans placeholder:text-lg"
              id="confirmPassword"
              type="password"
              value={user.confirmPassword}
              onChange={(e) =>
                setUser({ ...user, confirmPassword: e.target.value })
              }
              placeholder="Confirm Password"
            />
          </div>
        )}
        <div className="flex flex-col gap-y-4 items-center pt-6">
          <button
            disabled={buttonDisabled}
            onClick={token.length > 0 ? onSetNewPassword : onReset}
            type="submit"
            className={`px-9 py-3 font-sans text-white ${
              buttonDisabled
                ? "bg-black/70 cursor-not-allowed"
                : "bg-black hover:ring-2 ring-black cursor-pointer"
            } `}
          >
            {isLoading ? "Processing.." : "Submit"}
          </button>
          {token.length === 0 && (
            <Link
              href={`/login`}
              className=" text-center text-gray-700 underline-offset-4 underline font-sans hover:decoration-2"
            >
              Cancel
            </Link>
          )}
        </div>
      </form>
    </>
  );
}
