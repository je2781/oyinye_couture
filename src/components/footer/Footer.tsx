'use client';

import Link from "next/link";
import Image from "next/image";
import PaymentLogo from "../../../public/streetzwyze.png";
import toast from "react-hot-toast";
import axios from "axios";
import React from "react";
import useGlobal from "@/store/useGlobal";
import { FormattedMessage } from "react-intl";


export default function Footer(){
    const [loader, setLoader] = React.useState(false);
    const {setLocale, locale} = useGlobal();

    return <section className="flex flex-col lg:gap-y-8 gap-y-5 bg-white items-center font-sans pb-7 pt-14">
        <header className="font-medium text-lg w-full flex lg:flex-row flex-col items-center gap-x-16 max-w-7xl px-8 mx-auto container">
            <div className="inline-flex flex-col lg:w-{50%] w-full gap-y-3">
                <h2><FormattedMessage id='app.footer.menu' defaultMessage='Menu' /></h2>
                <hr className="border border-gray-200/50 inline-block"/>
            </div>
            <div className="lg:inline-flex flex-col w-[50%] hidden gap-y-3">
                <h2><FormattedMessage id='app.footer.newsletter' defaultMessage='Newsletter' /></h2>
                <hr className="border border-gray-200/50 inline-block"/>
            </div>
        </header>
        <section className="text-gray-600 w-full flex lg:flex-row flex-col items-start gap-x-16 lg:text-[.9rem] text-sm max-w-7xl px-8 mx-auto container">
            <ul className="flex flex-col gap-y-3 lg:w-[50%] w-full">
                <li><Link href={`/pages/about`} className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}><FormattedMessage id='app.footer.item1' defaultMessage='About Us' /></Link></li>
                <li><Link href={`/pages/contact`} className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}><FormattedMessage id='app.footer.item2' defaultMessage='Contact Us' /></Link></li>
                <li><Link href={`/pages/size-guide`} className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}><FormattedMessage id='app.footer.item3' defaultMessage='Size Guide' /></Link></li>
                <li><Link href={`/order`} className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}><FormattedMessage id='app.footer.item4' defaultMessage='Bespoke' /></Link></li>
                <li><Link href={`/pages/shipping-policy`} className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}><FormattedMessage id='app.footer.item5' defaultMessage='Shipping Policy' /></Link></li>
                <li><Link href={`/pages/returns-policy`} className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}><FormattedMessage id='app.footer.item6' defaultMessage='Returns Policy' /></Link></li>
                <li><Link href={`/pages/privacy-policy`} className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}><FormattedMessage id='app.footer.item7' defaultMessage='Privacy Policy' /></Link></li>
                <div className="flex flex-col items-start gap-y-4 mt-5">
                    <h5><FormattedMessage id='app.footer.item8' defaultMessage='Language' /></h5>
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
                    className="relative border border-gray-400 rounded-sm p-1 focus:border-gray-600 w-[30%]">
                        <select 
                        id='lang-select'
                        className="focus:outline-none p-2 appearance-none"
                        onChange={(e) => {
                            setLocale(e.target.value);
                            localStorage.setItem('locale', e.target.value);
                            history.pushState(null, '', `/${e.target.value}`);
                        }}>
                            <option hidden selected value=''>{locale === 'en' ? 'English' : locale === 'fr' ? 'French' : locale === 'nl' ? 'Dutch' : locale === 'pt-PT' ? 'Portugese (Portugal)' : locale === 'zh-TW' ? 'Chinese (traditional)' : 'Spanish'}</option>
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
                        }} className="fa-solid fa-angle-down lang-angle-down absolute top-[40%] right-3"

                        ></i>
                    </div>
                </div>
            </ul>
            <header className="lg:hidden inline-flex flex-col w-full gap-y-3 mt-6 text-lg text-black font-medium">
                <h2><FormattedMessage id='app.footer.newsletter' defaultMessage='Newsletter' /></h2>
                <hr className="border border-gray-200/50 inline-block"/>
            </header>
            <form 
            onSubmit={async (e) => {
                e.preventDefault();
                let leadEmail = document.getElementById('subscribe') as HTMLInputElement;

                //validation checks
                if(leadEmail && !leadEmail.value.includes('@')){
                    document.querySelector('#email-error')?.classList.remove('hidden');
                    return;
                }else{
                    document.querySelector('#email-error')?.classList.add('hidden');
                }

                try {
                    setLoader(true);
                    await axios.post('/api/users/signup', {
                        email: leadEmail!.value,
                        enableEmailMarketing: true
                    });
                } catch (error: any) {
                    setLoader(false);
                    return toast.error(error.message);
                }finally{
                    setLoader(false);
                    toast.success('Thank you for joining our mailing list');
                }

            }}
            className="lg:w-[50%] w-full flex flex-col gap-y-5 pt-5 lg:pt-0">
                <p className="text-sm"><FormattedMessage id='app.footer.newsletter.paragraph' defaultMessage='Join the oyinye couture community to stay updated on promotions and new releases.' /></p>
                <div className="flex flex-col items-start gap-y-1">
                    <div className="inline-flex flex-row border border-gray-500/60 w-full pl-2 pr-1 rounded-sm justify-between items-center">
                        <input className="px-2 py-3 w-full focus:outline-none" id='subscribe' placeholder="youremail@example.com"/>
                        <button className="px-3 py-2 bg-gray-600 text-white text-[.85rem] rounded-sm">{loader ? 'Processing' : 'Join'}</button>
                    </div>
                    <p id='email-error' className="text-red-500 text-sm hidden">email is blank</p>
                </div>
            </form>
        </section>
        <footer className="mt-5">
            <div className="inline-flex flex-row gap-x-3 items-center">
                <Link href='https://instagram.com/oyinye_couture'>
                    <i className="fa-brands text-2xl text-gray-600 fa-instagram"></i>
                </Link>
                <Link href='https://facebook.com/oyinye_couture'>
                    <i className="fa-brands text-2xl text-gray-600 fa-facebook"></i>
                </Link>
            </div>
        </footer>
    </section>
}