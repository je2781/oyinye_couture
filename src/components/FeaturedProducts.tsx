
import ProductComponent from "./Product";

async function getFeaturedProducts(){
  const res = await fetch(`${process.env.DOMAIN}/api/products/featured`, { cache: 'no-store' });
  const data = await res.json();

  return data.products;
}

const FeaturedProducts = async () => {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col lg:gap-y-8 gap-y-4 bg-white">
      <section className="flex flex-col gap-y-6 items-center py-12 justify-center leading-text">
        <header className="text-center flex flex-col gap-y-6">
          <h1 className="lg:text-4xl text-3xl font-sans">Oyinye&apos;s collection</h1>
          <p className="text-gray-600 text-lg font-semibold font-sans">let Oyinye&apos;s occassion wear inspire you</p>
        </header>
        <button className="px-8 py-3 bg-black hover:ring-2 ring-black text-white font-sans">
          Shop Now
        </button>
      </section>
      <div className="flex flex-col lg:items-start items-center gap-y-5 font-sans container mx-auto">
        <header className="lg:text-4xl text-3xl">Featured Products</header>
        <section className="flex lg:flex-row flex-col items-center justify-evenly flex-wrap lg:gap-x-6 gap-y-12">
          {featuredProducts.map((product: any, i: number) => <ProductComponent key={product._id.toString()} product={product}/>)}
        </section>
      </div>
    </div>
  );
};

export default FeaturedProducts;
