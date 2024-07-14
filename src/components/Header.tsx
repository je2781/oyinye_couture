"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import logo from '../../public/oyinye.png'; 
import useAuth from "../store/useAuth";
import HeaderCartButton from "./layout/HeaderCartButton";

const menuItems = [
    {
        name: "Home",
        href: "/",
    },
    {
        name: "About",
        href: "#",
    },
    {
        name: "Contact",
        href: "#",
    },
];

export default function Header() {
    const { authStatus } = useAuth();
    return (
        <div className="relative w-full bg-white py-2 ">
            <div className="container mx-auto flex items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
                <button id="toggle-button" className="hover:bg-gray-600/10 focus:bg-gray-600/10  px-2 py-1 bg-transparent rounded-md xl:hidden inline-block" aria-haspopup="true" aria-expanded="false">
                    <i className="fa-solid fa-bars text-gray-600 text-xl"></i>
                    <span className="sr-only">Open dashboard mobile navbar</span>
                </button>
                <Link href={"/"} className="inline-block w-full max-w-[170px]">
                    <Image src={logo} alt='logo' className="bg-cover"/>
                </Link>
                <div className="grow items-start lg:flex hidden">
                    <ul className="ml-12 inline-flex space-x-8">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className="inline-flex items-center text-[1rem] font-medium text-gray-600 font-sans"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-row items-center gap-x-7">
                    <Link href='/search'>
                        <i className="fa-solid cursor-pointer fa-search text-xl text-gray-600"></i>
                    </Link>
                    <Link href={authStatus ? '/profile' : '/login'} className="hidden lg:inline-block">
                        <i className="fa-solid cursor-pointer fa-user text-xl text-gray-600"></i>
                    </Link>
                    <Link href={authStatus ? '/cart' : '/login'}>
                        <HeaderCartButton/>
                    </Link>
                </div>
            </div>
        </div>
    );
}