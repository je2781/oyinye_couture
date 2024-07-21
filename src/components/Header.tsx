"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect } from "react";
import logo from "../../public/oyinye.png";
import useAuth from "../store/useAuth";
import HeaderCartButton from "./layout/HeaderCartButton";
import SearchBar from "./ui/SearchBar";
import useProduct from "@/store/useProduct";

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
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [prevScrollPos, setPrevScrollPos] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible]);

  
  // Handling scroll
  const handleScroll = () => {
    const currentScrollPos = window.scrollY;

    setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
    if(!visible){
        setIsModalOpen(false);
    }
    setPrevScrollPos(currentScrollPos);
  };

  const showModalHandler = (e: React.MouseEvent) => {
    setIsModalOpen(true);
  };

  const hideModalHandler = () => {
    setIsModalOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full bg-white transition-transform duration-300 z-10 shadow-md ${
        visible ? "transform translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between py-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          id="toggle-button"
          className="hover:bg-gray-600/10 focus:bg-gray-600/10  px-2 py-1 bg-transparent rounded-md lg:hidden inline-block"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <i className="fa-solid fa-bars text-gray-600 text-lg"></i>
          <span className="sr-only">Open dashboard mobile navbar</span>
        </button>
        <Link href={"/"} className="inline-block w-[150px] max-w-[170px]">
          <Image src={logo} alt="logo" className="bg-cover" />
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
          <i
            className="fa-solid cursor-pointer fa-search text-lg text-gray-600 hover:text-[1.2rem]"
            onClick={showModalHandler}
          ></i>
          <Link
            href={authStatus ? "/profile" : "/login"}
            className="hidden lg:inline-block"
          >
            <i className="fa-solid cursor-pointer fa-user text-lg text-gray-600 hover:text-[1.2rem]"></i>
          </Link>
          <Link href={authStatus ? "/cart" : "/login"}>
            <HeaderCartButton />
          </Link>
        </div>
      </div>
      {isModalOpen && <SearchBar onHideModal={hideModalHandler}/>}
    </nav>
  );
}
