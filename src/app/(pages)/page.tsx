
import FeaturedProducts from "@/components/FeaturedProducts";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

async function getAllProducts(){
  const res = await fetch(`${process.env.DOMAIN}/api/products`, {next: {revalidate: 60}});
  const data = await res.json();

  return data.products;
}

export default async function Home() {
  const products = await getAllProducts();

  return (
    <>
      <Header/>
      <Hero/>
      <FeaturedProducts featuredProducts={products}/>
    </>
  );
}
