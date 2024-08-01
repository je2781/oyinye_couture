"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect } from "react";
import logo from "../../public/oyinye.png";
import useAuth from "../store/useAuth";
import HeaderCartButton from "./layout/HeaderCartButton";
import SearchBar from "./ui/SearchBar";
import useProduct from "@/store/useProduct";
import useWindowWidth from "./helpers/getWindowWidth";
import './Header.css';
import { MobileModal } from "./ui/Modal";
import useCart from "@/store/useCart";

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

export default function Header({cartItems}: any) {
  const { authStatus } = useAuth();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [prevScrollPos, setPrevScrollPos] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  const {updateCart} = useCart();
  let windowWidth = useWindowWidth();

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible]);
  
  //updating local cart data with data from current public session
  useEffect(() => {
    if(cartItems){
      updateCart(cartItems);
    }
  }, []);
  
  // Handling scroll
  const handleScroll = () => {
    const currentScrollPos = window.scrollY;

    setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
    if(!visible){
      setIsModalOpen(false);
    }
    setPrevScrollPos(currentScrollPos);
  };
  
  useEffect(() => {
    let mobileNav = document.querySelector('#mobile-nav') as HTMLElement;
    if (isModalOpen && mobileNav) {
      mobileNav.classList.add('forward');
      mobileNav.classList.remove('backward');
    }
    
  }, [isModalOpen]);
  
  const showSearchModalHandler = (e: React.MouseEvent) => {
    setIsSearchModalOpen(true);
  };
  
  const hideSearchModalHandler = () => {
    setIsSearchModalOpen(false);
  };

  const showModalHandler = (e: React.MouseEvent) => {
    setIsModalOpen(true);
  };

  const hideModalHandler = () => {
    let mobileNav = document.querySelector('#mobile-nav') as HTMLElement;
    if (mobileNav) {
      mobileNav.classList.remove('forward');
      mobileNav.classList.add('backward');
      setTimeout(() => {
        setIsModalOpen(false);
      }, 300); 
    } else {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full bg-white ${windowWidth > 768 ? 'transition-transform duration-300 shadow-md': ''} z-10 ${
          visible && windowWidth > 768 ? "transform translate-y-0" : !visible && windowWidth > 768 ? "-translate-y-full" : ''
        }`}
      >
        <div className="flex items-center justify-between md:py-5 py-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            id="toggle-button"
            className="hover:bg-gray-600/10 focus:bg-gray-600/10  px-2 py-1 bg-transparent rounded-md lg:hidden inline-block"
            aria-haspopup="true"
            aria-expanded="false"
            onClick={showModalHandler}
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
              className="fa-solid cursor-pointer fa-search text-lg text-gray-600 transition-all duration-300 ease-out transform hover:scale-110"
              onClick={showSearchModalHandler}
            ></i>
            <Link
              href={authStatus ? "/profile" : "/login"}
              className="hidden lg:inline-block"
            >
              <i className="fa-solid cursor-pointer fa-user text-lg text-gray-600 transition-all duration-300 ease-out transform hover:scale-110"></i>
            </Link>
            <Link href={`/cart`}>
              <HeaderCartButton />
            </Link>
          </div>
        </div>
        {isSearchModalOpen && <SearchBar onHideModal={hideSearchModalHandler}/>}
      {isModalOpen && <MobileModal onClose={hideModalHandler}>
        <ul className="inline-flex flex-col gap-y-6">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center text-lg font-medium text-gray-500 font-sans"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
        </ul>
      </MobileModal>}
      </nav>
    </>
  );
}
