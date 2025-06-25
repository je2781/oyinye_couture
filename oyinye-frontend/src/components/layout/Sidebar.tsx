'use client';

import './Sidebar.css';
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { appsList, insightList, getRouteNames, viewsList } from "@/helpers/getHelpers";
import { useRouter } from 'next/navigation';

export default function Sidebar({pathName}: any){
    const parentElementRef = useRef<HTMLDivElement>(null);
    const arrowLeftRef = useRef<HTMLElement>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();
    const [animate, setAnimate] = useState({
        apps: false,
        views: false,
        insight: false
    });
    let timerId: NodeJS.Timeout | null = null;


    useEffect(() => {
        return () => {
            if(timerId){
                clearTimeout(timerId);
            }
        };
    }, [timerId]);

    let routeNames = getRouteNames(appsList);


    function handleSidebar(e: React.MouseEvent){
        //reseting state of sidebar secondary lists
        setAnimate({
            apps: false,
            views: false,
            insight: false
        })

        let arrowLeft = arrowLeftRef.current;
        let appsContent = document.querySelector('#apps-content');
        let viewsContent = document.querySelector('#views-content');
        let insightContent = document.querySelector('#insight-content');
        let sidebar = document.querySelector('nav');
        let mainNav = document.querySelector('#main-nav');
        let body = document.querySelector('#admin-content');
        let headerSections = document.querySelectorAll('header section');

        if(appsContent && viewsContent && insightContent){
            appsContent.classList.add('hide');
            appsContent.classList.remove('show');
            viewsContent.classList.add('hide');
            viewsContent.classList.remove('show');
            insightContent.classList.add('hide');
            insightContent.classList.remove('show');
            headerSections.forEach((headerSection) => {
                headerSection.classList.add('transition-all', 'duration-300', 'ease-out', 'p-0', 'hover:pl-2');

            });
        }

        if(!parentElementRef.current?.classList.contains('collapse-bar') && arrowLeft && mainNav && body && sidebar){
            timerId = setTimeout(() => {
                setIsCollapsed(true);
            }, 50);
            parentElementRef.current?.classList.add('collapse-bar');
            parentElementRef.current?.classList.remove('expand-bar');
            arrowLeft.classList.add('arrowl-rotate');
            arrowLeft.classList.remove('arrowl-rotate-clock');
            mainNav.classList.remove('lg:pl-64');
            mainNav.classList.remove('md:pl-52');
            mainNav.classList.add('md:pl-32');
            body.classList.remove('lg:pl-64');
            body.classList.remove('md:pl-52');
            body.classList.add('md:pl-32');
        }else{
            timerId = setTimeout(() => {
                setIsCollapsed(false);
            }, 100);
            parentElementRef.current?.classList.add('expand-bar');
            parentElementRef.current?.classList.remove('collapse-bar');
            arrowLeft?.classList.remove('arrowl-rotate');
            arrowLeft?.classList.add('arrowl-rotate-clock');
            mainNav?.classList.add('md:pl-64');
            mainNav?.classList.add('md:pl-52');
            mainNav?.classList.remove('md:pl-32');
            body?.classList.add('md:pl-64');
            body?.classList.add('md:pl-52');
            body?.classList.remove('md:pl-32');
        }
    }
    return(
        <nav id='sidebar' ref={parentElementRef} className="bg-primary-800 fixed left-0 top-0 z-30 h-full py-6 px-3 hidden xl:w-[16%] md:w-[23%] 
        shadow-2xl md:flex flex-col justify-between">
            <section className="gap-y-12 flex flex-col items-center">
                <Link href='/admin/summary' className="inline-block w-[150px] max-w-[170px]">
                    <h1 className="text-3xl italic text-accent font-sans text-center"><span>O</span>{!isCollapsed && <span>yinye</span>}</h1>
                </Link>
                <ul className={`inline-flex items-start flex-col ${isCollapsed ? 'gap-y-11' : 'gap-y-6'} w-full`}>
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
                        onMouseEnter={() => {
                            setAnimate((prevState) => ({
                                ...prevState,
                                apps: false,
                                views: false,
                                insight: true
                            }));
                        }}
                        className={`${pathName === 'summary' ? 'text-accent' : 'text-secondary-400'} flex flex-row items-center w-full cursor-pointer`}>
                            <section className="flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2  w-[90%]">
                                <i id='item-icon' className="fa-solid fa-file-waveform text-xl"></i>
                                {!isCollapsed && <h1 aria-current="page" className="text-sm font-medium font-sans">Insight</h1>}
                            </section>
                            {!isCollapsed && <div className="inline-block w-[10%]">
                                <i className="fa-solid fa-angle-right text-sm " ></i>
                            </div>}
                        </header>
                        {isCollapsed && animate.insight &&
                        <section 
                            onMouseLeave={() => {
                                setAnimate((prevState) => ({
                                    ...prevState,
                                    insight: false
                                }));
                            }}
                            id='tooltip' className={`${animate ? 'fade-in-out' : ''} absolute left-full ml-9 top-[5.8rem] bg-primary-800 rounded-2xl px-5 py-7 w-44 opacity-0`}>
                            <ul className="flex-col text-secondary-400 flex gap-y-3">
                            {insightList.map((item: any, i: number) => (
                                <li 
                                    className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2"
                                    key={i}
                                    onClick={() => router.push(`/admin/summary`)}
                                >
                                    <div 
                                    className={`${pathName === 'summary' ? 'text-white' : 'text-secondary-400'} inline-flex flex-row gap-x-4 items-center`}>
                                        <i className="fa-regular fa-circle text-[0.6rem]"></i>
                                        <span
                                        className="text-sm font-medium font-sans"
                                        >
                                            {item}
                                        </span>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </section>}
                        <section id="insight-content" className="w-full pl-[6px] hide">
                            <ul className="flex-col text-secondary-400 flex gap-y-3">
                            {insightList.map((item: any, i: number) => (
                                <li
                                onClick={() => {
                                    router.push('/admin/summary');
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
                            onMouseEnter={() => {
                                setAnimate((prevState) => ({
                                    ...prevState,
                                    apps: true,
                                    views: false,
                                    insight: false
                                }));
        
                            }}
                        >
                            <section className="flex flex-row gap-x-3 transition-all duration-300 ease-out p-0 hover:pl-2 items-center w-[90%]">
                                <i id='item-icon' className="fa-brands fa-chrome text-xl"></i>
                                {!isCollapsed && <h1 aria-current="page" className="text-sm font-medium font-sans">Apps</h1>}
                            </section>
                            {!isCollapsed && <div className="inline-block w-[10%]">
                                <i className="fa-solid fa-angle-right text-sm "></i>
                            </div>}
                        </header>
                        {isCollapsed && animate.apps &&
                        <section 
                            onMouseLeave={() => {
                                setAnimate((prevState) => ({
                                    ...prevState,
                                    apps: false
                                }));
                            }}
                            id='tooltip' className={`${animate ? 'fade-in-out' : ''} absolute left-full ml-9 top-[9.1rem] bg-primary-800 rounded-2xl px-5 py-7 w-44 opacity-0`}>
                            <ul className="flex-col text-secondary-400 flex gap-y-3">
                            {appsList.map((item: any, i: number) => (
                                <li 
                                    className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2"
                                    key={i}
                                    onClick={() => {
                                        router.push(`/admin/${routeNames[i]}`);
                                    }}
                                >
                                    <div 
                                    className={`${pathName == routeNames[i] ? 'text-white' : 'text-secondary-400'} inline-flex flex-row gap-x-4 items-center`}>
                                        <i className="fa-regular fa-circle text-[0.6rem]"></i>
                                        <span
                                        className="text-sm font-medium font-sans"
                                        >
                                            {item}
                                        </span>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </section>}
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
                        onMouseEnter={() => {
                            setAnimate((prevState) => ({
                                ...prevState,
                                apps: false,
                                views: true,
                                insight: false
                            }));
                        }}
                        onClick={(e) => {
                            let rightA = e.currentTarget.querySelector("header i.fa-angle-right");
                            let headerSection = e.currentTarget.querySelector("header section");
                            let header = e.currentTarget;
                            let content = header.parentNode?.querySelector("#views-content");
        
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
                        className={`${pathName === 'orders' ? 'text-accent' : 'text-secondary-400'} flex flex-row items-center w-full cursor-pointer`}>
                            <section className="flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2 w-[90%]">
                                <i id='item-icon' className="fa-solid fa-grip text-xl"></i>
                                {!isCollapsed && <h1 aria-current="page" className="text-sm font-medium font-sans">Views</h1>}
                            </section>
                            {!isCollapsed && <div className="inline-block w-[10%]">
                                <i className="fa-solid fa-angle-right text-sm" ></i>
                            </div>}
                        </header>
                        {isCollapsed && animate.views &&
                        <section 
                            onMouseLeave={() => {
                                setAnimate((prevState) => ({
                                    ...prevState,
                                    views: false
                                }));
                            }}
                            id='tooltip' className={`${animate ? 'fade-in-out' : ''} absolute left-full ml-9 top-[14rem] bg-primary-800 rounded-2xl px-5 py-7 w-[180px] opacity-0`}>
                            <ul className="flex-col text-secondary-400 flex gap-y-3">
                            {viewsList.map((item: any, i: number) => (
                                <li 
                                    className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2"
                                    key={i}
                                    onClick={() => {
                                        router.push(`/admin/orders`);
                                      }}
                                >
                                    <div 
                                    className={`${pathName === 'orders' ? 'text-white' : 'text-secondary-400'} inline-flex flex-row gap-x-4 items-center`}>
                                        <i className="fa-regular fa-circle text-[0.6rem]"></i>
                                        <span
                                        className="text-sm font-medium font-sans"
                                        >
                                            {item}
                                        </span>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </section>}
                        <section id="views-content" className="w-full pl-[6px] hide">
                            <ul className="flex-col text-secondary-400 flex gap-y-3">
                            {viewsList.map((item: any, i: number) => (
                                <li
                                onClick={() => router.push(`/admin/orders`)} 
                                className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-[3px]" key={i}>
                                    <div 
                                        className={`${pathName === 'orders' ? 'text-white' : 'text-secondary-400'} inline-flex flex-row gap-x-4 items-center`}
                                    >
                                        <i className="fa-regular fa-circle text-[0.6rem]"></i>
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
            <div 
            onClick={handleSidebar}
            className="flex items-center w-full flex-row justify-center text-secondary-400 text-xl cursor-pointer">
                <i ref={arrowLeftRef} className="fa-solid fa-arrow-left"></i>
            </div>
        </nav>
    );
}