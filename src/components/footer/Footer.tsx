import Link from "next/link";
import Image from "next/image";
import PaymentLogo from "../../../public/streetzwyze.png";


export default function Footer(){
    return <section className="flex flex-col lg:gap-y-8 gap-y-5 bg-white items-center font-sans pb-7 pt-3">
        <header className="font-medium text-lg w-full flex lg:flex-row flex-col items-center gap-x-16 max-w-7xl px-8 mx-auto container">
            <div className="inline-flex flex-col lg:w-[50%] w-full gap-y-3">
                <h2>Menu</h2>
                <hr className="border border-gray-200/50 inline-block"/>
            </div>
            <div className="lg:inline-flex flex-col w-[50%] hidden gap-y-3">
                <h2>Newsletter</h2>
                <hr className="border border-gray-200/50 inline-block"/>
            </div>
        </header>
        <section className="text-gray-600 w-full flex lg:flex-row flex-col items-start gap-x-16 lg:text-[.9rem] text-sm max-w-7xl px-8 mx-auto container">
            <ul className="flex flex-col gap-y-3 lg:w-[50%] w-full">
                <li><Link href='/pages/about' className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}>About Us</Link></li>
                <li><Link href='/pages/contact' className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}>Contact Us</Link></li>
                <li><Link href='/pages/size-guide' className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}>Size Guide</Link></li>
                <li><Link href='/pages/shipping-policy' className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}>Shipping Policy</Link></li>
                <li><Link href='/pages/returns-policy' className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}>Returns Policy</Link></li>
                <li><Link href='/pages/privacy-policy' className="hover:underline hover:underline-offset-4" style={{textDecorationThickness: '2px'}}>Privacy Policy</Link></li>
            </ul>
            <header className="lg:hidden inline-flex flex-col w-full gap-y-3 mt-6 text-lg text-black font-medium">
                <h2>Newsletter</h2>
                <hr className="border border-gray-200/50 inline-block"/>
            </header>
            <form className="lg:w-[50%] w-full flex flex-col gap-y-5 pt-5 lg:pt-0">
                <p className="text-sm">Join the oyinye couture community to stay updated on promotions and new releases.</p>
                <div className="inline-flex flex-row border border-gray-500/60 w-full pl-2 pr-1 rounded-sm justify-between items-center">
                    <input className="px-2 py-3 w-full focus:outline-none" placeholder="youremail@example.com"/>
                    <button className="px-3 py-2 bg-gray-600 text-white text-[.85rem] rounded-sm">Join</button>
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