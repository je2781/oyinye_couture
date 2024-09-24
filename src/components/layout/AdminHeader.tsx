"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import useWindowWidth from "../helpers/getWindowWidth";
import Sidebar from "./Sidebar";
import SearchBar from "../ui/SearchBar";
import useAuth from "@/store/useAuth";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useGlobal from "@/store/useGlobal";
import { MobileModal } from "../ui/Modal";
import { appsList, getRouteNames, insightList, viewsList } from "@/helpers/getHelpers";

export default function AdminHeader({sectionName, pathName}: any) {
  let timerId: NodeJS.Timeout | null  = null;

  const { authStatus } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const router = useRouter();
  const {isMobileModalOpen, setIsMobileModalOpen} = useGlobal();
  let width = useWindowWidth();

  useEffect(() => {
    setIsMobileModalOpen(false);
    
  }, [width]);

  
  useEffect(() => {
    const adminMenu = document.querySelector('#admin-menu');
    const orderManagementOptions = document.querySelector('#options-menu');
    const orderManagementOptionsForSmScreens = document.querySelector('#options-menu-sm-screen');
    const mainContent = document.querySelector('#admin-content') as HTMLElement;

    const handleContentClick = (event: MouseEvent) => {
      if(adminMenu && !adminMenu.classList.contains('hidden')){
        adminMenu.classList.add('hidden');
      }
      if(orderManagementOptions && !orderManagementOptions.classList.contains('hidden')){
        orderManagementOptions.classList.add('hidden');
      }
      if(orderManagementOptionsForSmScreens && !orderManagementOptionsForSmScreens.classList.contains('hidden')){
        orderManagementOptionsForSmScreens.classList.add('hidden');
      }
    };


    // Adding the event listener to the body element
    mainContent.addEventListener('click', handleContentClick);


    // Cleanup the event listener when the component unmounts
    return () => {
      mainContent.removeEventListener('click', handleContentClick);
    };
  }, []);

  useEffect(() => {
    let mobileNav = document.querySelector('#mobile-nav') as HTMLElement;
    if (isMobileModalOpen && mobileNav) {
      mobileNav.classList.add('forward');
      mobileNav.classList.remove('backward');
    }
    
    return () => {
      if(timerId){
        clearTimeout(timerId);
      }
    };
  }, [isMobileModalOpen]);

  const showSearchModalHandler = (e: React.MouseEvent) => {
    setIsSearchModalOpen(true);
  };

  const hideSearchModalHandler = () => {
    setIsSearchModalOpen(false);
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

  const onLogout = async () => {
    try {
      await axios.get("/api/users/logout");
      router.replace("/login");
    } catch (error: any) {
      toast.error(error.message);
    }
  };


  
  let routeNames = getRouteNames(appsList);


  return (
    <nav className="flex flex-row w-full ">
      <Sidebar pathName={pathName} />
      <nav
        id="main-nav"
        className={`fixed top-0 w-full h-[96px] bg-primary-950 lg:pl-64 pl-3 pr-3 z-20`}
      >
        <div className="flex items-center justify-between lg:justify-start lg:py-4 py-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border border-l-0 border-r-0 border-t-0 border-secondary-400/20">
          <button
            id="toggle-button"
            className="hover:bg-gray-600/10 focus:bg-gray-600/10  px-2 py-1 bg-transparent rounded-md lg:hidden inline-block"
            aria-haspopup="true"
            aria-expanded="false"
            onClick={() => setIsMobileModalOpen(true)}
          >
            <i className="fa-solid fa-bars text-white text-lg"></i>
            <span className="sr-only">Open insight mobile navbar</span>
          </button>

          <div className="grow items-start lg:inline-block hidden">
            <h1 className="text-white text-xl">
              {sectionName}
            </h1>
          </div>
          <div className="flex flex-row items-center lg:gap-x-7 gap-x-4">
            <i
              className="fa-solid cursor-pointer fa-search text-lg text-white transition-all duration-300 ease-out transform hover:scale-110"
              onClick={showSearchModalHandler}
            ></i>
            <div className="relative">
              <button 
              onClick={(e) => {
                let item = e.currentTarget;
                let menu = item.parentNode?.querySelector('#admin-menu') as HTMLDivElement;
                menu.classList.toggle('hidden');
              }}
              id="user-menu-button" aria-expanded="false" aria-haspopup="true" type="button" className="rounded-full bg-transparent p-1  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-950">
                  <span className="absolute -inset-1.5"></span>
                  <span className="sr-only">Open admin menu</span>
                  <Image width={30} height={30} className="rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="profile-pic"/>
              </button>
  
              <div id='admin-menu' className="hidden absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md text-secondary-400 bg-primary-800 shadow-lg ring-1 ring-black ring-opacity-5 py-3 px-2 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" >
                  <div className="inline-flex flex-row items-center gap-x-3 px-4 py-2 hover:text-accent">
                    <i className="fa-regular fa-user"></i>
                    <Link href="#" className="text-[1rem] font-sans" role="menuitem"  id="user-menu-item-0">Profile</Link>
                  </div>
                  <div className="inline-flex flex-row items-center gap-x-3 px-4 py-2 hover:text-accent">
                    <i className="fa-solid fa-gear"></i>
                    <Link href="#" className="text-[1rem] font-sans" role="menuitem"  id="user-menu-item-1">Settings</Link>
                  </div>
                  <div className="px-4 py-2 hover:text-accent text-[1rem] font-sans inline-flex flex-row items-center gap-x-3">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    <button
                      onClick={onLogout}
                      role="menuitem"  id="user-menu-item-2"
                    >
                    Logout
                    </button>
                  </div>
              </div>
          </div>
          </div>
        </div>
        {isSearchModalOpen && (
          <SearchBar onHideModal={hideSearchModalHandler} />
        )}
        {isMobileModalOpen && <MobileModal onClose={hideModalHandler} classes='bg-primary-800 px-4 pt-8'>
          
            <section className="gap-y-12 flex flex-col items-start">
                <Link href='/admin/insight/summary' className="inline-block w-[150px] max-w-[170px]">
                    <h1 className="text-3xl italic text-accent font-sans text-center">Oyinye</h1>
                </Link>
                <ul className={`inline-flex items-start flex-col gap-y-6 w-full`}>
                    <li
                    className="w-full px-4 py-[2px] flex flex-col gap-y-5 items-center">
                        <header 
                          onClick={(e) => {
                            let rightA = e.currentTarget.querySelector("header i.fa-angle-right");
                            let headerSection = e.currentTarget.querySelector("header section");
                            let header = e.currentTarget;
                            let content = header.parentNode?.querySelector("#insight-content");
        
                            if (rightA && header && headerSection && content) {
                                if (!rightA.classList.contains("ar-rotate")) {
                                    rightA.classList.add("ar-rotate");
                                    rightA.classList.remove("ar-rotate-anticlock");
                                    content.classList.add("show");
                                    content.classList.remove("hide");
                                    headerSection.classList.remove('transition-all', 'duration-300', 'ease-out', 'p-0', 'hover:pl-2');
                                } else {
                                    rightA.classList.remove("ar-rotate");
                                    rightA.classList.add("ar-rotate-anticlock");
                                    content.classList.remove("show");
                                    content.classList.add("hide");
                                    headerSection.classList.add('transition-all', 'duration-300', 'ease-out', 'p-0', 'hover:pl-2');
                                }
                            }
                        }} 
                        className={`${pathName === 'insight' ? 'text-accent' : 'text-secondary-400'} flex flex-row items-center w-full cursor-pointer`}>
                            <section className="flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2  w-[90%]">
                                <i id='item-icon' className="fa-solid fa-file-waveform text-xl"></i>
                                <h1 aria-current="page" className="text-sm font-medium font-sans">Insight</h1>
                            </section>
                            <div className="inline-block w-[10%]">
                                <i className="fa-solid fa-angle-right text-sm " ></i>
                            </div>
                        </header>
                        <section id="insight-content" className="w-full pl-[6px] hide">
                            <ul className="flex-col text-secondary-400 flex gap-y-3">
                            {insightList.map((item: any, i: number) => (
                                <li
                                onClick={() => {
                                    router.push(`/admin/summary`);
                                }} 
                                className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2" key={i}>
                                    <div 
                                        className={`${pathName === 'summary' ? 'text-white' : 'text-secondary-400'} inline-flex flex-row gap-x-4 items-center`}
                                    >
                                        <i className="fa-regular fa-circle  text-[0.6rem]"></i>
                                        <span
                                        className="text-sm font-medium font-sans"
                                        >
                                            {item}
                                        </span>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </section>
                    </li>
                    <li  
                        className="w-full px-4 py-[2px] flex flex-col gap-y-5 items-center"
                    >
                        <header  
                            onClick={(e) => {
                                let rightA = e.currentTarget.querySelector("header i.fa-angle-right");
                                let headerSection = e.currentTarget.querySelector("header section");
                                let header = e.currentTarget;
                                let content = header.parentNode?.querySelector("#apps-content");
            
                                if (rightA && header && headerSection && content) {
                                    if (!rightA.classList.contains("ar-rotate")) {
                                        rightA.classList.add("ar-rotate");
                                        rightA.classList.remove("ar-rotate-anticlock");
                                        content.classList.add("show");
                                        content.classList.remove("hide");
                                        headerSection.classList.remove('transition-all', 'duration-300', 'ease-out', 'p-0', 'hover:pl-2');
                                    } else {
                                        rightA.classList.remove("ar-rotate");
                                        rightA.classList.add("ar-rotate-anticlock");
                                        content.classList.remove("show");
                                        content.classList.add("hide");
                                        headerSection.classList.add('transition-all', 'duration-300', 'ease-out', 'p-0', 'hover:pl-2');
                                    }
                                }
                            }}
                            className={`${(pathName === 'product-listing' || pathName === 'calendar' || pathName === 'email') ? 'text-accent' : 'text-secondary-400'} flex flex-row items-center w-full cursor-pointer peer`}
                            
                        >
                            <section className="flex flex-row gap-x-3 transition-all duration-300 ease-out p-0 hover:pl-2 items-center w-[90%]">
                                <i id='item-icon' className="fa-brands fa-chrome text-xl"></i>
                                <h1 aria-current="page" className="text-sm font-medium font-sans">Apps</h1>
                            </section>
                            <div className="inline-block w-[10%]">
                                <i className="fa-solid fa-angle-right text-sm "></i>
                            </div>
                        </header>
                        <section id="apps-content" className="w-full pl-[6px] hide">
                            <ul className="flex-col text-secondary-400 flex gap-y-3">
                            {appsList.map((item: any, i: number) => (
                                <li
                                onClick={() => {
                                    router.push(`/admin/${routeNames[i]}`);
                                }} 
                                className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2" key={i}>
                                    <div 
                                        className={`${pathName == routeNames[i] ? 'text-white' : 'text-secondary-400'} inline-flex flex-row gap-x-4 items-center`}
                                    >
                                        <i className="fa-regular fa-circle  text-[0.6rem]"></i>
                                        <span
                                        className="text-sm font-medium font-sans"
                                        >
                                            {item}
                                        </span>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </section>
                        
                    </li>
                    <li className="w-full px-4 py-[2px] flex flex-col gap-y-5 items-center">
                        <header
                        onClick={(e) => {
                            let rightA = e.currentTarget.querySelector("header i.fa-angle-right");
                            let headerSection = e.currentTarget.querySelector("header section");
                            let header = e.currentTarget;
                            let content = header.parentNode?.querySelector("#tables-content");
        
                            if (rightA && header && headerSection && content) {
                                if (!rightA.classList.contains("ar-rotate")) {
                                    rightA.classList.add("ar-rotate");
                                    rightA.classList.remove("ar-rotate-anticlock");
                                    content.classList.add("show");
                                    content.classList.remove("hide");
                                    headerSection.classList.remove('transition-all', 'duration-300', 'ease-out', 'p-0', 'hover:pl-2');
                                } else {
                                    rightA.classList.remove("ar-rotate");
                                    rightA.classList.add("ar-rotate-anticlock");
                                    content.classList.remove("show");
                                    content.classList.add("hide");
                                    headerSection.classList.add('transition-all', 'duration-300', 'ease-out', 'p-0', 'hover:pl-2');
                                }
                            }
                        }}
                        className={`${pathName === 'tables' ? 'text-accent' : 'text-secondary-400'} flex flex-row items-center w-full cursor-pointer`}>
                            <section className="flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2 w-[90%]">
                                <i id='item-icon' className="fa-solid fa-grip text-xl"></i>
                                <h1 aria-current="page" className="text-sm font-medium font-sans">Views</h1>
                            </section>
                            <div className="inline-block w-[10%]">
                                <i className="fa-solid fa-angle-right text-sm" ></i>
                            </div>
                        </header>
                        <section id="tables-content" className="w-full pl-[6px] hide">
                            <ul className="flex-col text-secondary-400 flex gap-y-3">
                            {viewsList.map((item: any, i: number) => (
                                <li
                                onClick={() => {
                                    router.push(`/admin/orders?page=1`);
                                }} 
                                className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-[3px]" key={i}>
                                    <div 
                                        className={`${pathName === 'orders' ? 'text-white' : 'text-secondary-400'} inline-flex flex-row gap-x-4 items-center`}
                                    >
                                        <i className="fa-regular fa-circle  text-[0.6rem]"></i>
                                        <span
                                        className="text-sm font-medium font-sans"
                                        >
                                            {item}
                                        </span>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </section>
                    </li>
                </ul>
            </section>
          </MobileModal>}
        
      </nav>
    </nav>
  );
}
