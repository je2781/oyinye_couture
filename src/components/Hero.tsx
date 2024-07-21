'use client';

import Image from "next/image";
import heroImage from '../../public/next.svg';

const Hero = () => {
    return (
        <section>
            {/* <Image src={heroImage} alt='hero-image' height={400}  className="relative bg-cover parallax-image"/> */}
            <div className="w-full bg-red-600 parallax-image relative lg:h-[640px] h-72">
                <section className="leading-text flex flex-col items-center justify-center gap-y-6 absolute bottom-[30%] top-[30%] lg:left-[30%] lg:right-[30%] left-[8%] right-[8%]">
                    <h1 className="text-white lg:text-5xl text-3xl font-sans font-semibold">OYINYE</h1>
                    <h1 className="text-white/80 text-lg font-sans text-center">YOU DESERVE THE BEST DRESS ON YOU FOR EVERY OCCASSION</h1>
                    <div className="flex flex-col items-stretch">
                        <button className="lg:px-32 px-[120px] text-[.8rem] lg:text-[1rem] py-3 border border-white bg-transparent hover:ring-2 ring-white  text-white font-sans">Shop Now</button>
                    </div>
                </section>
            </div>
        </section>
    );
};

export default Hero;