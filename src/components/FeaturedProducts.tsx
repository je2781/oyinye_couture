
import Product from "./Product";

const FeaturedProducts = ({featuredProducts}: any) => {

  return (
    <div className="flex flex-col lg:gap-y-8 gap-y-4 bg-white max-w-7xl w-full mx-auto container">
      <section className="flex flex-col gap-y-6 items-center py-12 justify-center leading-text">
        <header className="text-center flex flex-col gap-y-6">
          <h1 className="lg:text-4xl text-3xl font-sans">Oyinye&apos;s collection</h1>
          <p className="text-gray-600 text-lg font-semibold font-sans">let Oyinye&apos;s occassion wear inspire you</p>
        </header>
        <button className="px-8 py-3 bg-black hover:ring-2 ring-black text-white font-sans">
          Shop Now
        </button>
      </section>
      <div className="flex flex-col lg:items-start items-center gap-y-5 font-sans">
        <header className="lg:text-4xl text-3xl">FeaturedProducts</header>
        <section className="flex flex-row items-center justify-evenly flex-wrap gap-x-2 gap-y-4">
          {featuredProducts.slice(0, 4).map((product: any, i: number) => <Product key={i} product={product} isOnHomePage={true}/>)}
        </section>
      </div>
    </div>
  );
};

export default FeaturedProducts;
