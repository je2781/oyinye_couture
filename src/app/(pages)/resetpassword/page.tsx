"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
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
      await axios.post("/api/users/reset", user);
      toast.success('Reset password email has been sent!', {
        duration: 5000
      });
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSetNewPassword() {
    try {
      setIsLoading(true);
      await axios.post("/api/users/newpassword", { ...user, token });
      toast.success('Login with your new password', {
        duration: 5000
      });
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen gap-y-4 bg-[#f7f7f7] pt-12">
      <h1 className="lg:text-5xl text-3xl font-sans pb-2 font-light">
        {token.length > 0
          ? "New Password"
          : "Reset your password"}
      </h1>
      {token.length === 0 && <h1 className="lg:text-xl text-lg font-sans font-extralight pb-2">
        We will send you an email to reset your password
      </h1>}
      <hr />
      {token.length === 0 && (
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
      )}
      {token.length > 0 && (
        <div className="flex flex-col lg:w-[480px] max-w-[80%] w-[360px] gap-y-0">
        <input
          className="p-4 border border-gray-300 focus:outline-none focus:border-gray-600 placeholder:font-sans placeholder:text-lg"
          id="password"
          type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder="Password"
        />
      </div>
      )}
      {token.length > 0 && (
        <div className="flex flex-col lg:w-[480px] max-w-[80%] w-[360px] gap-y-0">
        <input
          className="p-4 border border-gray-300 focus:outline-none focus:border-gray-600 placeholder:font-sans placeholder:text-lg"
          id="confirmPassword"
          type="password"
          value={user.confirmPassword}
          onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
          placeholder="Confirm Password"
        />
      </div>
      )}
      <div className="flex flex-col gap-y-4 items-center pt-6">
        <button
        disabled={buttonDisabled}
        onClick={token.length > 0 ? onSetNewPassword : onReset}
        className={`px-9 py-3 font-sans text-white ${
            buttonDisabled ? "bg-gray-400" : "bg-black hover:ring-2 ring-black"
          } `}
        >
          {isLoading
          ? "Processing.."
          : "Submit"}
        </button>
        {token.length === 0 && <Link
          href="/login"
          className=" text-center text-gray-700 underline-offset-4 underline font-sans hover:decoration-2"
        >
          Cancel
        </Link>}
      </div>
    </div>
  );
}
