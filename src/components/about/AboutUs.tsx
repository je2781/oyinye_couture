'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';

export default function AboutComponent(){
    const t = useTranslations('app');
    return <section className="lg:pt-16 md:pt-10 pt-4 md:pb-5 pb-3 lg:h-[420px] md:h-[340px]" id='about'>
        <div className="flex flex-row w-full h-full overflow-hidden">
            <article className="leading-text flex flex-col items-center lg:gap-y-16 gap-y-8 md:w-[50%] w-full py-6 lg:px-12 px-7 font-sans">
                <header className="flex flex-col items-center lg:gap-y-4 gap-y-2">
                    <h3 className="font-medium lg:text-2xl text-xl">
                        {t('aboutus.header')}
                    </h3>
                    <p className="text-gray-500 lg:text-[.9rem] lg:leading-6 text-sm text-center">
                        {t('aboutus.paragraph')}
                    </p>
                </header>
                <Link href={`/about`} className="lg:text-sm text-xs font-semibold bg-black text-white rounded-sm px-5 hover:ring-1 hover:ring-black py-3">
                    {t('aboutus.action.text')}
                </Link>
            </article>
            <div className="w-[50%] relative bg-cover bg-red-600 h-full md:block hidden animate__animated animate__fadeInRight" style={{
                // backgroundImage: `url(${'https://images.unsplash.com/photo-1519120944692-1a8d8cfc107f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=872&q=80'})`,
                backgroundPosition: 'center',
            }}></div>
        </div>
    </section>
}