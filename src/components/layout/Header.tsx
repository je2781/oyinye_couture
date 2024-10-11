"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import React, { useEffect, useLayoutEffect } from "react";
import {FormattedMessage } from 'react-intl';
import logo from "../../../public/oyinye.png";
import useAuth from "../../store/useAuth";
import HeaderCartButton from "./HeaderCartButton";
import SearchBar from "../ui/SearchBar";
import useWindowWidth from "../helpers/getWindowWidth";
import { MobileModal } from "../ui/Modal";
import useCart from "@/store/useCart";
import useGlobal from "@/store/useGlobal";


export default function Header({cartItems, isCheckout, isAuth}: any) {
  let timerId: NodeJS.Timeout | null  = null;

  const path = usePathname();
  const { authStatus } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [prevScrollPos, setPrevScrollPos] = React.useState(0);
  const [visible, setVisible] = React.useState(true);
  const {updateCart, items} = useCart();
  const {isMobileModalOpen, setIsMobileModalOpen} = useGlobal();
  let windowWidth = useWindowWidth();
  const {locale} = useGlobal();
  
  const menuItems = [
    {
      name: <FormattedMessage id="app.header.item1" defaultMessage="Home" />,
      href: `/`,
    },
    {
      name: <FormattedMessage id="app.header.item2" defaultMessage="Collections" />,
      href: `/collections/all`,
    },
    {
      name: <FormattedMessage id="app.header.item3" defaultMessage="About" />,
      href: `/pages/about`,
    },
    {
      name: <FormattedMessage id="app.header.item4" defaultMessage="Contact" />,
      href: `/pages/contact`,
    },
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
  
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      if(!visible){
        setIsMobileModalOpen(false);
      }
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible, setIsMobileModalOpen]);
  
  //updating local cart data with data from current public session
  useEffect(() => {
    if(cartItems){

      updateCart(cartItems);
    }
  }, []);

  useEffect(() => {
    return () => {
      if(timerId){
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  //updating route history to reflect new language
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     history.pushState(null, '', `${path}`);

  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, []);

  // useEffect(() => {
  //   timerId = setTimeout(() => {
  //     if(locale !== 'en'){
  //       history.pushState(null, '', `/${locale}${path}`);
  //     }
  //   }, 400);

  //   return () => {
  //     if(timerId){
  //       clearTimeout(timerId);
  //     }
  //   };
  // }, []);
  
  // Handling scroll
  
  useEffect(() => {
    let mobileNav = document.querySelector('#mobile-nav') as HTMLElement;
    if (isMobileModalOpen && mobileNav) {
      mobileNav.classList.add('forward');
      mobileNav.classList.remove('backward');
    }
    
  }, [isMobileModalOpen]);
  
  const showSearchModalHandler = (e: React.MouseEvent) => {
    setIsSearchModalOpen(true);
  };
  
  const hideSearchModalHandler = () => {
    setIsSearchModalOpen(false);
  };

  const showModalHandler = (e: React.MouseEvent) => {
    setIsMobileModalOpen(true);
  };

  const hideModalHandler = () => {
    let mobileNav = document.querySelector('#mobile-nav') as HTMLElement;
    if (mobileNav) {
      mobileNav.classList.remove('forward');
      mobileNav.classList.add('backward');
      timerId = setTimeout(() => {
        setIsMobileModalOpen(false);
      }, 300); 
    } else {
      setIsMobileModalOpen(false);
    }
  };

  useEffect(() => {
    if(windowWidth > 768){
      setIsMobileModalOpen(false);
    }else{
      setIsMobileModalOpen(false);
    }
    
  }, [setIsMobileModalOpen, windowWidth]);

  return (
    <nav
      className={isCheckout ? 'w-full h-[96px] bg-white border border-gray-300 border-t-0 border-l-0 border-r-0' : `z-20 md:shadow-md fixed top-0 w-full h-[96px] bg-white ${windowWidth > 768 ? 'transition-transform duration-300': ''}  ${
        visible && windowWidth > 768 ? "transform translate-y-0" : !visible && windowWidth > 768 ? "-translate-y-full" : ''
      }`}
    >
      <div className="flex items-center justify-between md:py-5 max-w-7xl mx-auto pl-2 pr-3 lg:pl-0 lg:pr-6 h-full">
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
        <Link href={`/`} className="inline-block max-w-[170px]">
          {isCheckout ?
          <Image src={logo} alt="logo" className="bg-cover" width={1240}/>
        : <Image src={logo} alt="logo" className="bg-cover" />}
        </Link>
        <div className="grow items-start lg:flex hidden">
          {!isCheckout && <ul className="inline-flex flex-row gap-x-8 items-center">
            {menuItems.map((item) => (
              <li key={item.name.props.defaultMessage} className={`${path === '/' ? '-mt-3' : ''} cursor-pointer relative`}>
                {item.name.props.defaultMessage !== 'Collections' ? <Link
                  href={item.href}
                  style={{textDecorationThickness: '2px'}}
                  className={`${path === item.href ? 'underline underline-offset-4' : ''} hover:underline hover:underline-offset-4 text-[1rem] font-medium text-gray-600 font-sans`}
                >
                  {item.name}
                </Link>
                : 
                <div className="inline-flex flex-row gap-x-1 items-center"
                onClick={(e) => {
                  let downAngle = document.querySelector("i.fa-angle-down");
                  let collectionsDropdown = document.getElementById("collections-dropdown");
                  if(downAngle && collectionsDropdown){
                    if(!downAngle.classList.contains("ad-rotate")){
                        downAngle.classList.add("ad-rotate");
                        downAngle.classList.remove("ad-rotate-anticlock");
                        collectionsDropdown.classList.remove('hide', 'hidden');
                        collectionsDropdown.classList.add('show');
                    }else{
                        downAngle.classList.remove("ad-rotate");
                        downAngle.classList.add("ad-rotate-anticlock");
                        collectionsDropdown.classList.add('hide', 'hidden');
                        collectionsDropdown.classList.remove('show');
                    }
                  }
                }}
                >
                  <span                     
                      style={{textDecorationThickness: '2px'}}
                      className="hover:underline hover:underline-offset-4 text-gray-600 font-sans text-[1rem] font-medium"
                    >
                    {item.name}
                  </span>
                  <i className="fa-solid fa-angle-down text-sm"></i>
                </div>}
                  <ul id='collections-dropdown' className="hide hidden absolute right-0 z-10 top-8 left-[70px] w-36 origin-top-right flex-col p-1 text-sm bg-white rounded-md text-gray-600 font-light shadow-sm shadow-gray-400">
                    {[
                      'All Dresses',
                      'Basics',
                      'Made To Order',
                      'Bespoke'
                    ].map((item: string, i: number) => (
                        <li
                          key={item}
                          className="cursor-pointer flex flex-row items-center justify-between p-2"
                        >
                              <Link href={`${item !== 'Bespoke' ? `/collections/${item.split(' ').length === 2 
                            ? `${item.split(' ')[0].charAt(0).toLowerCase() + item.split(' ')[0].slice(1)}-${item.split(' ')[1].charAt(0).toLowerCase() + item.split(' ')[1].slice(1)}` 
                            :  item.split(' ').length === 3
                            ? `${item.split(' ')[0].charAt(0).toLowerCase() + item.split(' ')[0].slice(1)}-${item.split(' ')[1].charAt(0).toLowerCase() + item.split(' ')[1].slice(1)}-${item.split(' ')[2].charAt(0).toLowerCase() + item.split(' ')[2].slice(1)}`
                            : item.charAt(0).toLowerCase() + item.slice(1)}`
                            : '/order' }`}>
                              
                            {item}</Link>
                        </li>
                    ))}
                  </ul>
              </li>
            ))}
          </ul>}
        </div>
        <div className="flex flex-row items-center gap-x-7">
          {!isCheckout && <i
            className="fa-solid cursor-pointer fa-search text-lg text-gray-600 transition-all duration-300 ease-out transform hover:scale-110"
            onClick={showSearchModalHandler}
          ></i>}
          {!isCheckout && <Link
            href={authStatus ? `/profile` : `/login`}
            className="hidden lg:inline-block"
          >
            <i className="fa-solid cursor-pointer fa-user text-lg text-gray-600 transition-all duration-300 ease-out transform hover:scale-110"></i>
          </Link>}
          <Link href={`/cart`}>
            <HeaderCartButton isCheckout={isCheckout} isAuth={isAuth}/>
          </Link>
        </div>
      </div>
      {isSearchModalOpen && <SearchBar onHideModal={hideSearchModalHandler}/>}
    {isMobileModalOpen && <MobileModal onClose={hideModalHandler}>
      <ul className="inline-flex flex-col gap-y-6">
              {menuItems.map((item) => (
                <li key={item.name.props.defaultMessage}>
                  {item.name.props.defaultMessage !== 'Collections' 
                  ? <Link
                    href={item.href}
                    className="text-lg font-medium text-gray-500 font-sans"
                  >
                    {item.name}
                  </Link>
                  : <div className="inline-flex flex-col gap-y-2">
                      <div 
                        onClick={(e) => {
                          let downAngle = document.querySelector("i.fa-angle-down-for-sm-screen");
                          let collectionsDropdown = document.getElementById("collections-dropdown-for-sm-screen");
                          if(downAngle && collectionsDropdown){
                            if(!downAngle.classList.contains("ad-rotate")){
                                downAngle.classList.add("ad-rotate");
                                downAngle.classList.remove("ad-rotate-anticlock");
                                collectionsDropdown.classList.remove('hide', 'hidden');
                                collectionsDropdown.classList.add('show');
                            }else{
                                downAngle.classList.remove("ad-rotate");
                                downAngle.classList.add("ad-rotate-anticlock");
                                collectionsDropdown.classList.add('hide', 'hidden');
                                collectionsDropdown.classList.remove('show');
                            }
                          }
                        }}
                      className="inline-flex flex-row gap-x-[5px] items-center">
                        <span                     
                            style={{textDecorationThickness: '2px'}}
                            className="text-gray-500 font-sans text-lg font-medium"
                          >
                          {item.name}
                        </span>
                        <i className="fa-solid fa-angle-down fa-angle-down-for-sm-screen text-lg"></i>
                      </div>
                      <ul id='collections-dropdown-for-sm-screen' className="hide hidden flex-col p-1 text-[1rem] bg-white text-gray-500 font-light">
                        {[
                          'All Dresses',
                          'Basics',
                          'Made To Order',
                          'Bespoke'
                        ].map((item: string, i: number) => (
                            <li
                              key={item}
                              className="cursor-pointer flex flex-row items-center justify-between p-2"
                            >
                            <Link href={`${item !== 'Bespoke' ? `/collections/${item.split(' ').length === 2 
                            ? `${item.split(' ')[0].charAt(0).toLowerCase() + item.split(' ')[0].slice(1)}-${item.split(' ')[1].charAt(0).toLowerCase() + item.split(' ')[1].slice(1)}` 
                            :  item.split(' ').length === 3
                            ? `${item.split(' ')[0].charAt(0).toLowerCase() + item.split(' ')[0].slice(1)}-${item.split(' ')[1].charAt(0).toLowerCase() + item.split(' ')[1].slice(1)}-${item.split(' ')[2].charAt(0).toLowerCase() + item.split(' ')[2].slice(1)}`
                            : item.charAt(0).toLowerCase() + item.slice(1)}`
                            : '/order' }`}>
                            {item}</Link>
                            </li>
                        ))}
                      </ul>
                    </div>}
                    
                </li>
              ))}
      </ul>
    </MobileModal>}
    </nav>
  );
}
