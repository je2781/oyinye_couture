"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect } from "react";
import Logo from "../../../public/oyinye.png";
import useProduct from "@/store/useProduct";
import useCart from "@/store/useCart";
import useWindowWidth from "../helpers/getWindowWidth";
import Sidebar from "../layout/Sidebar";
import { MobileModal } from "../ui/Modal";
import SearchBar from "../ui/SearchBar";
import useAuth from "@/store/useAuth";
import HeaderCartButton from "../layout/HeaderCartButton";


export default function Header({cartItems}: any) {
  const { authStatus } = useAuth();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [prevScrollPos, setPrevScrollPos] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  const {updateCart} = useCart();
  let windowWidth = useWindowWidth();
  let pathName = location.pathname.split('/')[1];

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
    <main className="flex flex-row w-full h-screen">
      <Sidebar pathName={pathName}/>
      <nav
      id='main-nav'
        className={`fixed top-0 w-full h-fit bg-primary-950 pl-60 pr-7 py-2`}
      >
        <div className="flex items-center justify-between lg:justify-start md:py-5 py-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <button
            id="toggle-button"
            className="hover:bg-gray-600/10 focus:bg-gray-600/10  px-2 py-1 bg-transparent rounded-md lg:hidden inline-block"
            aria-haspopup="true"
            aria-expanded="false"
            onClick={showModalHandler}
          >
            <i className="fa-solid fa-bars text-white text-lg"></i>
            <span className="sr-only">Open dashboard mobile navbar</span>
          </button>

          <div className="grow items-start lg:inline-block hidden">
            <h1 className="text-white text-xl">{pathName.charAt(0).toUpperCase() + pathName.slice(1)}</h1>
          </div>
          <div className="flex flex-row items-center gap-x-7">
            <i className="fa-solid cursor-pointer fa-search text-lg text-white transition-all duration-300 ease-out transform hover:scale-110"
              onClick={showSearchModalHandler}
            ></i>
            <Link
              href={authStatus ? "/profile" : "/login"}
              className="hidden lg:inline-block"
            >
              <i className="fa-solid cursor-pointer fa-user text-lg text-white transition-all duration-300 ease-out transform hover:scale-110"></i>
            </Link>
            
          </div>
        </div>
        {isSearchModalOpen && <SearchBar onHideModal={hideSearchModalHandler}/>}
      {isModalOpen && <MobileModal onClose={hideModalHandler}>
        {/* <ul className="inline-flex flex-col gap-y-6">
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
        </ul> */}
      </MobileModal>}
      </nav>
    </main>
  );
}
