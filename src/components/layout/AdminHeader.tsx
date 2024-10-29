"use client";

import React, { useEffect } from "react";
import useWindowWidth from "../helpers/getWindowWidth";
import Sidebar from "./Sidebar";
import SearchBar from "../ui/SearchBar";
import useAuth from "@/store/useAuth";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from "next/navigation";
import useGlobal from "@/store/useGlobal";
import { AdminSettingsModal, MobileModal } from "../ui/Modal";
import { appsList, generateBase64FromMedia, getRouteNames, insightList, reloadPageWithLocale, viewsList } from "@/helpers/getHelpers";

export default function AdminHeader({sectionName, pathName, userName, userEmail, userTitle, id, avatar, locale}: any) {
  let timerId: NodeJS.Timeout | null  = null;

  const path = usePathname();
  const searchParams = useSearchParams();
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = React.useState({
    profile: false,
    settings: false
  });
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const router = useRouter();
  const {isMobileModalOpen, setIsMobileModalOpen} = useGlobal();
  let width = useWindowWidth();
  const [imageBase64, setImageBase64] = React.useState('');
  const [email, setEmail] = React.useState(userEmail);
  const [password, setPassword] = React.useState('*********');
  const [name, setName] = React.useState(userName);
  const [title, setTitle] = React.useState(userTitle);
  const [loader, setLoader] = React.useState(false);
  const {lang, setLang} = useGlobal();

  useEffect(() => {
    setIsMobileModalOpen(false);
    
  }, [setIsMobileModalOpen]);

  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  useEffect(() => {
    let adminModal = document.querySelector('#admin-settings-modal') as HTMLElement;
    if (isAdminSettingsOpen && adminModal) {
      adminModal.classList.add('slide-down');
      adminModal.classList.remove('slide-up');
    }
  }, [isAdminSettingsOpen]);

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

  React.useEffect(() => {
    if (isAdminSettingsOpen.profile || isAdminSettingsOpen.settings) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAdminSettingsOpen]);


  const hideAdminSettingsModalHandler = (item: string) => {
    let adminModal = document.querySelector('#admin-settings-modal') as HTMLElement;
    if (adminModal) {
      adminModal.classList.remove('slide-down');
      adminModal.classList.add('slide-up');
      timerId = setTimeout(() => {
      setIsAdminSettingsOpen({
        settings: false,
        profile: false,
      });
      }, 300); 
    } else {
      setIsAdminSettingsOpen({
        settings: false,
        profile: false,
      });
    }

  }

  const onLogout = async () => {
    try {
      await axios.get("/api/users/logout");
      // Construct the new path
      const newPath = `/${locale}/login`;

      const url = new URL(`${window.location.origin}${newPath}`);
      
      router.push(url.toString());

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
        className={`fixed top-0 w-full h-[96px] bg-primary-950 lg:pl-64 md:pl-52 pl-3 pr-3 z-20`}
      >
        <div className="flex items-center justify-between md:justify-start md:py-4 py-2 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full border border-l-0 border-r-0 border-t-0 border-secondary-400/20">
          <button
            id="toggle-button"
            className="hover:bg-gray-600/10 focus:bg-gray-600/10  px-2 py-1 bg-transparent rounded-md md:hidden inline-block"
            aria-haspopup="true"
            aria-expanded="false"
            onClick={() => setIsMobileModalOpen(true)}
          >
            <i className="fa-solid fa-bars text-white text-md"></i>
            <span className="sr-only">Open insight mobile navbar</span>
          </button>

          <div className="grow items-start md:inline-block hidden">
            <h1 className="text-white text-xl">
              {sectionName}
            </h1>
          </div>
          <div className="flex flex-row items-center md:gap-x-7 gap-x-4">
            <i
              className="fa-solid cursor-pointer fa-search text-md text-white transition-all duration-300 ease-out transform hover:scale-110"
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
                  <Image width={40} height={40} className="rounded-full" src={`${avatar ?? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}`} alt="profile-pic"/>
              </button>
  
              <div id='admin-menu' className="hidden absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md text-secondary-400 bg-primary-800 shadow-md ring-1 ring-black ring-opacity-5 py-3 px-2 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" >
                  <div className="inline-flex flex-row items-center gap-x-3 px-4 py-2 hover:text-accent">
                    <i className="fa-regular fa-user"></i>
                    <button onClick={() => {
                      setIsAdminSettingsOpen(prevState => ({
                        ...prevState,
                        profile: true
                      }));
                      document.querySelector('#admin-menu')?.classList.add('hidden');
                    }} className="text-[1rem] font-sans" role="menuitem"  id="user-menu-item-0">Profile</button>
                  </div>
                  <div className="inline-flex flex-row items-center gap-x-3 px-4 py-2 hover:text-accent">
                    <i className="fa-solid fa-gear"></i>
                    <button onClick={() => {
                      setIsAdminSettingsOpen(prevState => ({
                        ...prevState,
                        settings: true
                      }));
                      document.querySelector('#admin-menu')?.classList.add('hidden');
                    }} className="text-[1rem] font-sans" role="menuitem"  id="user-menu-item-1">Settings</button>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    await onLogout();
                  }} className="px-4 py-2 hover:text-accent text-[1rem] font-sans inline-flex flex-row items-center gap-x-3">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    <button
                      type='submit'
                      role="menuitem"  id="user-menu-item-2"
                    >
                    Logout
                    </button>
                  </form>
                  {
                      isAdminSettingsOpen.profile  && <AdminSettingsModal onClose={hideAdminSettingsModalHandler} left='20rem' width='40rem' classes='h-fit bg-white !top-[7vh]'>
                            {
                                  <section className='font-sans font-light flex flex-col gap-y-11 text-gray-500 pb-6 pt-16'>
                              
                                    <form onSubmit={async (e) => {
                                      e.preventDefault();
                                      try {
                                        setLoader(true);
                                        await axios.patch(`/api/users/${id}`, {
                                          firstName: name.split(' ')[0],
                                          lastName: name.split(' ')[1],
                                          password,
                                          email,
                                          avatar: imageBase64
                                        });
                                      } catch (error) {
                                        
                                      }finally{
                                        setLoader(false);
                                        setIsAdminSettingsOpen({
                                          settings: false,
                                          profile: false
                                        });
                                      }
                                    }}  className='flex flex-col gap-y-9 max-h-[75vh]' encType="multipart/form-data">
                                        <div className="flex md:flex-row flex-col w-full items-start px-5 gap-y-4">
                                          <div className='flex flex-row justify-center md:w-[30%] w-full'>
                                              <label htmlFor='avatar' id='avatar-container' className='rounded-[50%] md:w-40 md:h-40 h-28 w-28 cursor-pointer bg-gray-300 flex items-center justify-center flex-row bg-cover'>
                                                  <i className="fa-solid fa-camera text-2xl text-white"></i>
                                              </label>
                                              <input type='file' className='hidden' id='avatar' onChange={async(e) => {
                                                  const base64String = await generateBase64FromMedia(e.target.files![0]);
                                                  const picContainer = document.getElementById('avatar-container') as HTMLLabelElement;
                                                  //clearing reviewer picture container
                                                  picContainer.innerHTML = '';

                                                  if(picContainer){
                                                      setImageBase64(base64String as string);
                                                      picContainer.style.backgroundImage = `url(${base64String})`;
                                                  }

                                              }}/>
                                          </div>
                                          <div className="w-[10%] hidden md:block"></div>
                                          <div className="md:w-[60%] w-full flex flex-col items-center md:items-start justify-start gap-y-3 font-sans font-normal">
                                            <h1 className="leading-5 md:text-3xl text-2xl font-medium">{userName ?? 'Tester'}</h1>
                                            <p className="md:text-[.95rem] text-[.825rem]">
                                              <Link className="text-blue-600" href={`mailto:${userEmail ?? 'test@test.com'}`}>{userEmail ?? 'test@test.com'}</Link>
                                              &nbsp;-&nbsp;Administrator
                                            </p>
                                          </div>
                                        </div>
                                        
                                        <section className="flex flex-col items-start w-full max-h-[500px] overflow-y-auto hide-scrollbar">
                                          <header className="font-medium font-sans text-lg px-5">Account</header>
                                          <hr className="border border-gray-100 mt-3 w-full border-l-0 border-r-0 border-t-0" />
                                          <div className="p-5 w-full text-gray-400 font-medium font-sans text-sm flex flex-col gap-y-5">
                                              <div className="w-full flex md:flex-row flex-col md:items-center items-start gap-y-2">
                                                <h3 className="md:w-[50%] w-full">Email</h3>
                                                <input value={email} onChange={(e) => setEmail(e.target.value)} className="focus:outline-none font-normal border border-gray-200 p-2 rounded-sm h-8 md:w-[50%] w-full"/>
                                              </div>
                                              <div className="w-full flex md:flex-row flex-col md:items-center items-start gap-y-2">
                                                <h3 className="md:w-[50%] w-full">Password</h3>
                                                <input value={password} onChange={(e) => setPassword(e.target.value)} className="focus:outline-none font-normal border border-gray-200 p-2 bg-gray-50 rounded-sm h-8 md:w-[50%] w-full"/>
                                              </div>
                                              <div className="w-full flex md:flex-row flex-col md:items-center items-start gap-y-2">
                                                <h3 className="md:w-[50%] w-full">Full Name</h3>
                                                <input value={name} onChange={(e) => setName(e.target.value)} className="focus:outline-none font-normal border border-gray-200 bg-gray-50 p-2 rounded-sm h-8 md:w-[50%] w-full"/>
                                              </div>
                                              <div className="w-full flex md:flex-row flex-col md:items-center items-start gap-y-2">
                                                <h3 className="md:w-[50%] w-full">Title</h3>
                                                <input value={title ?? 'Administrator'} onChange={(e) => setTitle(e.target.value)} disabled className="focus:outline-none font-normal border border-gray-200 bg-gray-50 p-2 rounded-sm h-8 md:w-[50%] w-full"/>
                                              </div>
                                              <div className="w-full flex md:flex-row flex-col md:items-center items-start gap-y-2">
                                                <h3 className="md:w-[50%] w-full">Language</h3>
                                                <div 
                                                  onClick={() => {
                                                      let downAngle = document.querySelector('i.lang-angle-down');
                                                      if(!downAngle?.classList.contains("ad-rotate")){
                                                          downAngle?.classList.add("ad-rotate");
                                                          downAngle?.classList.remove("ad-rotate-anticlock");
                                                      }else{
                                                          downAngle?.classList.remove("ad-rotate");
                                                          downAngle?.classList.add("ad-rotate-anticlock");
                                                      }
                                                  }}
                                                  className="relative border border-gray-400 rounded-sm p-1 focus:border-gray-600 md:w-[30%] w-full">
                                                      <select 
                                                      id='lang-select'
                                                      className="focus:outline-none p-2 appearance-none"
                                                      onChange={(e) => {
                                                        setLang(e.target.value);
                                                        reloadPageWithLocale(path, locale, searchParams, e.target.value);

                                                      }}>
                                                          <option hidden value=''>{lang === 'en' ? 'English' : lang === 'fr' ? 'French' : lang === 'nl' ? 'Dutch' : lang === 'pt-PT' ? 'Portugese (Portugal)' : lang === 'zh-TW' ? 'Chinese (traditional)' : 'Spanish'}</option>
                                                          {
                                                              ['en',
                                                              'fr',
                                                              'nl',
                                                              'pt-PT',
                                                              'zh-TW',
                                                              'es'].map((val, i) => <option className='underline underline-offset-1' value={val} key={i}>
                                                                  {val === 'en' ? 'English' : val === 'fr' ? 'French' : val === 'nl' ? 'Dutch' : val === 'pt-PT' ? 'Portugese (Portugal)' : val === 'zh-TW' ? 'Chinese (traditional)' : 'Spanish'}
                                                              </option>)
                                                          }
                                                      </select>
                                                      <i onClick={(e) => {
                                                          e.preventDefault();
                                                          e.stopPropagation();
                                                      }} className="fa-solid fa-angle-down lang-angle-down absolute top-[36%] right-3"

                                                      ></i>
                                                  </div>
                                              </div>
                                          </div>
                                        </section>
                                        <div className='flex flex-row justify-end px-5 w-full'>
                                          <button type='submit' className='px-10 py-2 rounded-md bg-accent text-white outline-none'>{loader ? 'Processing' : 'Edit Profile'}</button>
                                        </div>
                                        
                                    </form>
                              </section>
                              
                            }
                      </AdminSettingsModal>
                    }
                  {
                      isAdminSettingsOpen.settings  && <AdminSettingsModal onClose={hideAdminSettingsModalHandler} left='20rem' width='40rem' classes='h-fit bg-white !top-[7vh]'>
                            {
                                <section className='font-sans font-light flex flex-col gap-y-11 text-gray-500 pb-6 pt-16'>
                              
                                    
                              </section>
                              
                            }
                      </AdminSettingsModal>
                    }
              </div>
          </div>
          </div>
        </div>
        {isSearchModalOpen && (
          <SearchBar onHideModal={hideSearchModalHandler} isAdmin={true} locale={locale} />
        )}
        {isMobileModalOpen && <MobileModal onClose={hideModalHandler} classes='bg-primary-800 px-4 pt-8'>
          
            <section className="gap-y-12 flex flex-col items-start">
                <Link href='/admin/summary' className="inline-block w-[150px] max-w-[170px]">
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
                                    router.push(`/admin/orders`);
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
