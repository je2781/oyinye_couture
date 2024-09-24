
import Product from "./Product";

const FeaturedProducts = ({featuredProducts}: any) => {

  return (
    <div className="flex flex-col gap-y-8 bg-white max-w-7xl w-full lg:py-12 py-8 mx-auto px-8 container">
      <section className="flex flex-col gap-y-6 items-center justify-center leading-text">
        <header className="text-center flex flex-col gap-y-6">
          <h1 className="lg:text-4xl text-3xl font-sans font-normal">Oyinye&apos;s collection</h1>
          <p className="text-gray-600 lg:text-lg text-[1rem] font-normal font-sans">let Oyinye&apos;s occassion wear inspire you</p>
        </header>
        <button className="lg:px-8 px-6 py-3 bg-black hover:ring-2 ring-black text-white font-sans lg:text-[1rem] text-[.8rem]">
          Shop Now
        </button>
      </section>
      <div className="flex flex-col lg:items-start items-center gap-y-5 font-sans">
        <header className="lg:text-4xl text-3xl font-normal">FeaturedProducts</header>
        <section className="flex flex-row items-center justify-evenly flex-wrap gap-x-2 gap-y-4">
          {featuredProducts.slice(0, 4).map((product: any, i: number) => <Product key={i} product={product} isOnHomePage={true}/>)}
        </section>
      </div>
    </div>
  );
};

export default FeaturedProducts;
