
import FeaturedProducts from "@/components/product/FeaturedProducts";
import Header from "@/components/layout/Header";
import Hero from "@/components/Hero";
import { cookies, headers } from "next/headers";
import About from "@/components/about/AboutUs";



async function getData() {
  const cookieStore = cookies();
  const cartId = cookieStore.get('cart')?.value;

  if(cartId && cartId.length > 0){
    const [cartDataRes, productDataRes] = await Promise.all([
      fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`),
      fetch(`${process.env.DOMAIN}/api/products`, {next: {revalidate: 3600}})
    ]);

    const [cartData, productData] = await Promise.all([cartDataRes.json(), productDataRes.json()]);
  
    return [cartData.cartItems, productData.products];
  }else{
    return [[], []];
  }
}

export default async function Home() {
  
  const [cartItems, products] = await getData();

  return (
    <>
      <Header cartItems={cartItems}/>
      <Hero/>
      <About />
      <FeaturedProducts featuredProducts={products}/>
    </>
  );
}
