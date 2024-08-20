"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import useWindowWidth from "../helpers/getWindowWidth";
import Sidebar from "../layout/Sidebar";
import SearchBar from "../ui/SearchBar";
import useAuth from "@/store/useAuth";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useGlobal from "@/store/useGlobal";

export default function AdminHeader({sectionName, pathName}: any) {

  const { authStatus } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const router = useRouter();
  const {isMobileModalOpen, setIsMobileModalOpen} = useGlobal();
  let width = useWindowWidth();

  useEffect(() => {
    if(width >= 1024){
      setIsMobileModalOpen(false);
    }
  }, [width]);

  
  useEffect(() => {
    const dashboardMenu = document.querySelector('#dashboard-menu');
    const orderManagementOptions = document.querySelector('#options-menu');
    const orderManagementOptionsForSmScreens = document.querySelector('#options-menu-for-sm-screen');
    const mainContent = document.querySelector('#admin-content') as HTMLElement;

    const handleContentClick = (event: MouseEvent) => {
      if(dashboardMenu && !dashboardMenu.classList.contains('hidden')){
        dashboardMenu.classList.add('hidden');
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



  const showSearchModalHandler = (e: React.MouseEvent) => {
    setIsSearchModalOpen(true);
  };

  const hideSearchModalHandler = () => {
    setIsSearchModalOpen(false);
  };



  const onLogout = async () => {
    try {
      await axios.get("/api/users/logout");
      router.replace("/login");
    } catch (error: any) {
      toast.error(error.message);
    }
  };


  


  return (
    <nav className="flex flex-row w-full ">
      <Sidebar pathName={pathName} />
      <nav
        id="main-nav"
        className={`fixed top-0 w-full h-[96px] bg-primary-950 lg:pl-64 pl-3 pr-3 z-20`}
      >
        <div className="flex items-center justify-between lg:justify-start lg:py-4 py-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border border-l-0 border-r-0 border-t-0 border-secondary/20">
          <button
            id="toggle-button"
            className="hover:bg-gray-600/10 focus:bg-gray-600/10  px-2 py-1 bg-transparent rounded-md lg:hidden inline-block"
            aria-haspopup="true"
            aria-expanded="false"
            onClick={() => setIsMobileModalOpen(true)}
          >
            <i className="fa-solid fa-bars text-white text-lg"></i>
            <span className="sr-only">Open dashboard mobile navbar</span>
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
            <Link
              href={authStatus ? "/profile" : "/login"}
              className="hidden lg:inline-block"
            >
              <i className="fa-solid cursor-pointer fa-user text-lg text-white transition-all duration-300 ease-out transform hover:scale-110"></i>
            </Link>
            <div className="relative">
              <button 
              onClick={(e) => {
                let item = e.currentTarget;
                let menu = item.parentNode?.querySelector('#dashboard-menu') as HTMLDivElement;
                menu.classList.toggle('hidden');
              }}
              id="user-menu-button" aria-expanded="false" aria-haspopup="true" type="button" className="rounded-full bg-transparent p-1  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-950">
                  <span className="absolute -inset-1.5"></span>
                  <span className="sr-only">Open admin menu</span>
                  <Image width={30} height={30} className="rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="profile-pic"/>
              </button>
  
              <div id='dashboard-menu' className="hidden absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md text-secondary bg-primary-800 shadow-lg ring-1 ring-black ring-opacity-5 py-3 px-2 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" >
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
        
      </nav>
    </nav>
  );
}
