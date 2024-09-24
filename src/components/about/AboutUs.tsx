import Link from "next/link";

export default function AboutComponent(){
    return <section className="lg:pt-16 pt-4 pb-5 lg:h-[420px] h-[360px]">
        <div className="flex flex-row w-full h-full">
            <article className="flex flex-col items-center lg:gap-y-16 gap-y-11 md:w-[50%] w-full py-6 px-12 font-sans">
                <header className="flex flex-col items-center gap-y-4 text-[.9rem]">
                    <h3 className="font-medium lg:text-2xl text-xl">
                        The Story
                    </h3>
                    <p className="text-gray-500 text-[.85rem] text-center">Nisi nulla tempor magna cillum excepteur. Fugiat ullamco occaecat in nulla tempor consequat quis aute incididunt velit. Excepteur anim officia magna elit ipsum. Laboris commodo dolor magna consectetur cillum eiusmod eiusmod quis veniam magna labore et proident deserunt. Amet laboris enim aute pariatur sunt commodo elit officia culpa nostrud enim aliquip commodo.</p>
                </header>
                <Link href='/about' className="lg:text-sm text-xs font-semibold bg-black text-white rounded-sm px-5 hover:ring-1 hover:ring-black py-3">Read More</Link>
            </article>
            <div className="w-[50%] relative bg-cover bg-red-600 h-full md:block hidden bg-cover" style={{
                // backgroundImage: `url(${'https://images.unsplash.com/photo-1519120944692-1a8d8cfc107f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=872&q=80'})`,
                backgroundPosition: 'center',
            }}></div>
        </div>
    </section>
}