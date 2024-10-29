'use client';


import { useEffect } from "react";
import { createVisitorAction } from "@/app/actions";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import "swiper/css";

const Hero = () => {
  useEffect(() => {
    
    async function createActions(){
      await createVisitorAction();
    }

    createActions();
  }, []);

  const t = useTranslations('app');
  
  return (
        <Swiper
            slidesPerView={1}
            className="lg:h-[640px] md:h-96 h-72 w-full"
            autoplay={{ 
              delay: 6000, // 3 seconds delay between slides
              disableOnInteraction: false // Keeps autoplay after user interactions
            }}
            modules={[Autoplay]} 
            speed={2000} 
            >
                <SwiperSlide>
                  <div className="w-full relative bg-cover bg-red-600 h-full" style={{
                    // backgroundImage: `url(${'https://images.unsplash.com/photo-1519120944692-1a8d8cfc107f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=872&q=80'})`,
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                  }}>
                      <section className="leading-text flex flex-col items-center justify-center gap-y-6 absolute bottom-[30%] top-[30%] lg:left-[30%] lg:right-[30%] left-[8%] right-[8%]">
                          <h1 className="text-white lg:text-5xl text-3xl font-sans font-semibold">OYINYE</h1>
                          <h1 className="text-white/80 lg:text-lg text-[1rem] font-sans text-center">
                            {t('hero.slide1.paragraph')}
                          </h1>
                          <div className="flex flex-col items-stretch">
                              <Link href={`/collections/all-dresses`} className="lg:px-32 px-[120px] text-[.8rem] lg:text-[1rem] py-3 border border-white bg-transparent hover:ring-2 ring-white  text-white font-sans">
                                {t('hero.slide1.action.text')}
                              </Link>
                          </div>
                      </section>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="w-full relative bg-cover bg-red-600 h-full" style={{
                    // backgroundImage: `url(${'https://images.unsplash.com/photo-1519120944692-1a8d8cfc107f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=872&q=80'})`,
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                  }}>
                      <section className="leading-text flex flex-col items-center justify-center gap-y-6 absolute bottom-[30%] top-[30%] lg:left-[30%] lg:right-[30%] left-[8%] right-[8%]">
                          <h1 className="text-white lg:text-5xl text-3xl font-sans font-semibold">OYINYE</h1>
                          <h1 className="text-white/80 lg:text-lg text-[1rem] font-sans text-center">
                            {t('hero.slide2.paragraph')}
                          </h1>
                          <div className="flex flex-col items-stretch">
                              <Link href={`/order`} className="lg:px-32 px-[120px] text-[.8rem] lg:text-[1rem] py-3 border border-white bg-transparent hover:ring-2 ring-white  text-white font-sans">
                                {t('hero.slide2.action.text')}
                              </Link>
                          </div>
                      </section>
                  </div>
                </SwiperSlide>
        </Swiper>
          
  );
};

export default Hero;