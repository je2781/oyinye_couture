'use client';

import useGlobal from "@/store/useGlobal";
import Link from "next/link";
import { FormattedMessage } from "react-intl";

export default function AboutComponent(){
    const {locale} = useGlobal();

    return <section className="lg:pt-16 md:pt-10 pt-4 md:pb-5 pb-3 lg:h-[420px] md:h-[340px]" id='about'>
        <div className="flex flex-row w-full h-full overflow-hidden">
            <article className="leading-text flex flex-col items-center lg:gap-y-16 gap-y-8 md:w-[50%] w-full py-6 lg:px-12 px-7 font-sans">
                <header className="flex flex-col items-center lg:gap-y-4 gap-y-2">
                    <h3 className="font-medium lg:text-2xl text-xl">
                        <FormattedMessage id='app.aboutus.header' defaultMessage="The Story" />
                    </h3>
                    <p className="text-gray-500 lg:text-[.9rem] lg:leading-6 text-sm text-center">
                        <FormattedMessage id='app.aboutus.paragraph' defaultMessage="Nisi nulla tempor magna cillum excepteur. Fugiat ullamco occaecat in nulla tempor consequat quis aute incididunt velit. Excepteur anim officia magna elit ipsum. Laboris commodo dolor magna consectetur cillum eiusmod eiusmod quis veniam magna labore et proident deserunt. Amet laboris enim aute pariatur sunt commodo elit officia culpa nostrud enim aliquip commodo." />
                    </p>
                </header>
                <Link href={`/about`} className="lg:text-sm text-xs font-semibold bg-black text-white rounded-sm px-5 hover:ring-1 hover:ring-black py-3">
                    <FormattedMessage id='app.aboutus.action.text' defaultMessage="Read More" />
                </Link>
            </article>
            <div className="w-[50%] relative bg-cover bg-red-600 h-full md:block hidden" style={{
                // backgroundImage: `url(${'https://images.unsplash.com/photo-1519120944692-1a8d8cfc107f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=872&q=80'})`,
                backgroundPosition: 'center',
            }}></div>
        </div>
    </section>
}