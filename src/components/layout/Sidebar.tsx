'use client';

import Image from "next/image";
import logo from "../../../public/oyinye.png";
import './Sidebar.css';
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appsList, tablesList } from "@/helpers/getHelpers";

export default function Sidebar({pathName}: any){
    const parentElementRef = useRef<HTMLDivElement>(null);
    const arrowLeftRef = useRef<HTMLElement>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();
    const [animate, setAnimate] = useState({
        apps: false,
        tables: false,
        dashboard: false
    });


    const routeNames = appsList.map(app => {
        let routeName, firstWord, secondWord = '';
        let newWord = [];
        switch (app) {
            case 'File Manager':
                firstWord = app.split(' ')[0].charAt(0).toLowerCase() + app.split(' ')[0].slice(1);
                secondWord = app.split(' ')[1].charAt(0).toLowerCase() + app.split(' ')[1].slice(1);

                newWord = [firstWord, secondWord];
                routeName =  newWord.join('-');
                break;
            default:
                routeName = app.charAt(0).toLowerCase() + app.slice(1);
                break;

        }

        return routeName;
    });




    function handleSidebar(e: React.MouseEvent){
        //reseting state of sidebar secondary lists
        setAnimate({
            apps: false,
            tables: false,
            dashboard: false
        })

        let arrowLeft = arrowLeftRef.current;
        let appsContent = document.querySelector('#apps-content');
        let tablesContent = document.querySelector('#tables-content');
        let mainNav = document.querySelector('#main-nav');
        let body = document.querySelector('#content');
        let headerSections = document.querySelectorAll('header section');

        if(appsContent && tablesContent){
            appsContent.classList.add('hide');
            appsContent.classList.remove('show');
            tablesContent.classList.add('hide');
            tablesContent.classList.remove('show');
            headerSections.forEach((headerSection) => {
                headerSection.classList.add('transition-all', 'duration-300', 'ease-out', 'p-0', 'hover:pl-2');

            });
        }

        if(!parentElementRef.current?.classList.contains('collapse-bar') && arrowLeft && mainNav && body){
            setTimeout(() => {
                setIsCollapsed(true);
            }, 50);
            parentElementRef.current?.classList.add('collapse-bar');
            parentElementRef.current?.classList.remove('expand-bar');
            arrowLeft.classList.add('arrowl-rotate');
            arrowLeft.classList.remove('arrowl-rotate-clock');
            mainNav.classList.remove('lg:pl-64');
            mainNav.classList.add('lg:pl-32');
            body.classList.remove('lg:pl-64');
            body.classList.add('lg:pl-32');
        }else{
            setTimeout(() => {
                setIsCollapsed(false);
            }, 100);
            parentElementRef.current?.classList.add('expand-bar');
            parentElementRef.current?.classList.remove('collapse-bar');
            arrowLeft?.classList.remove('arrowl-rotate');
            arrowLeft?.classList.add('arrowl-rotate-clock');
            mainNav?.classList.add('lg:pl-64');
            mainNav?.classList.remove('lg:pl-32');
            body?.classList.add('lg:pl-64');
            body?.classList.remove('lg:pl-32');
        }
    }
    return(
        <nav id='sidebar' ref={parentElementRef} className="bg-primary-800 fixed left-0 top-0 z-30 h-full py-6 px-3 hidden w-[16%] 
        shadow-2xl lg:flex flex-col justify-between">
            <section className="gap-y-12 flex flex-col items-center">
                <Link href='/admin/dashboard' className="inline-block w-[150px] max-w-[170px]">
                    <h1 className="text-3xl italic text-accent font-sans text-center"><span>O</span>{!isCollapsed && <span>yinye</span>}</h1>
                </Link>
                <ul className={`inline-flex items-start flex-col ${isCollapsed ? 'gap-y-11' : 'gap-y-6'} w-full`}>
                    <li 
                    onMouseEnter={() => {
                        setAnimate((prevState) => ({
                            ...prevState,
                            apps: false,
                            tables: false,
                            dashboard: true
                        }));
                    }}
                    className="w-full px-4 py-[2px] flex flex-row gap-x-1 items-center">
                        <header  className={`${pathName === 'dashboard' ? 'text-accent' : 'text-secondary'} flex flex-row items-center w-full cursor-pointer`}>
                            <section className="flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2  w-[90%]">
                                <i id='item-icon' className="fa-solid fa-file-waveform text-xl"></i>
                                {!isCollapsed && <h1 aria-current="page" className="text-sm font-medium font-sans">Dashboard</h1>}
                            </section>
                            {!isCollapsed && <div className="inline-block w-[10%]">
                                <i className="fa-solid fa-angle-right text-sm " ></i>
                            </div>}
                        </header>
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
                            className={`${(pathName === 'file-manager' || pathName === 'calendar' || pathName === 'email') ? 'text-accent' : 'text-secondary'} flex flex-row items-center w-full cursor-pointer peer`}
                            onMouseEnter={() => {
                                setAnimate((prevState) => ({
                                    ...prevState,
                                    apps: true,
                                    tables: false,
                                    dashboard: false
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
                            <ul className="flex-col text-secondary flex gap-y-3">
                            {appsList.map((item: any, i: number) => (
                                <li 
                                    className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2"
                                    key={i}
                                    onClick={() => {
                                        router.push(`/admin/${routeNames[i]}`);
                                      }}
                                >
                                    <div 
                                    className={`${pathName == routeNames[i] ? 'text-white' : 'text-secondary'} inline-flex flex-row gap-x-4 items-center`}>
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
                            <ul className="flex-col text-secondary flex gap-y-3">
                            {appsList.map((item: any, i: number) => (
                                <li
                                onClick={() => {
                                    router.push(`/admin/${routeNames[i]}`);
                                }} 
                                className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2" key={i}>
                                    <div 
                                        className={`${pathName == routeNames[i] ? 'text-white' : 'text-secondary'} inline-flex flex-row gap-x-4 items-center`}
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
                                tables: true,
                                dashboard: false
                            }));
                        }}
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
                        className={`${pathName === 'tables' ? 'text-accent' : 'text-secondary'} flex flex-row items-center w-full cursor-pointer`}>
                            <section className="flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2 w-[90%]">
                                <i id='item-icon' className="fa-solid fa-grip text-xl"></i>
                                {!isCollapsed && <h1 aria-current="page" className="text-sm font-medium font-sans">Tables</h1>}
                            </section>
                            {!isCollapsed && <div className="inline-block w-[10%]">
                                <i className="fa-solid fa-angle-right text-sm" ></i>
                            </div>}
                        </header>
                        {isCollapsed && animate.tables &&
                        <section 
                            onMouseLeave={() => {
                                setAnimate((prevState) => ({
                                    ...prevState,
                                    tables: false
                                }));
                            }}
                            id='tooltip' className={`${animate ? 'fade-in-out' : ''} absolute left-full ml-9 top-[14rem] bg-primary-800 rounded-2xl px-5 py-7 w-[180px] opacity-0`}>
                            <ul className="flex-col text-secondary flex gap-y-3">
                            {tablesList.map((item: any, i: number) => (
                                <li 
                                    className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-2"
                                    key={i}
                                    onClick={() => {
                                        router.push(`/admin/order-management`);
                                      }}
                                >
                                    <div 
                                    className={`${pathName === 'order-management' ? 'text-white' : 'text-secondary'} inline-flex flex-row gap-x-4 items-center`}>
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
                        <section id="tables-content" className="w-full pl-[6px] hide">
                            <ul className="flex-col text-secondary flex gap-y-3">
                            {tablesList.map((item: any, i: number) => (
                                <li
                                onClick={() => {
                                    router.push(`/admin/order-management`);
                                }} 
                                className="cursor-pointer inline-flex flex-row gap-x-3 items-center transition-all duration-300 ease-out p-0 hover:pl-[3px]" key={i}>
                                    <div 
                                        className={`${pathName === 'order-management' ? 'text-white' : 'text-secondary'} inline-flex flex-row gap-x-4 items-center`}
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
            <div 
            onClick={handleSidebar}
            className="flex items-center w-full flex-row justify-center text-secondary text-xl cursor-pointer">
                <i ref={arrowLeftRef} className="fa-solid fa-arrow-left"></i>
            </div>
        </nav>
    );
}