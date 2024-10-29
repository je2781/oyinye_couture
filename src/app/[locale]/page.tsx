
import Header from "@/components/layout/Header";
import Hero from "@/components/Hero";
import { cookies, headers } from "next/headers";
import About from "@/components/about/AboutUs";
import Footer from "@/components/footer/Footer";
import ViewCollection from "@/components/collections/ViewCollection";

async function getData() {
  const cookieStore = cookies();
  const cartId = cookieStore.get('cart')?.value;

  if(cartId && cartId.length > 0){
    const [cartDataRes, productDataRes] = await Promise.all([
      fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`),
      fetch(`${process.env.DOMAIN}/api/products?hidden=false`, {cache: 'no-store'})
    ]);

    const [cartData, productData] = await Promise.all([cartDataRes.json(), productDataRes.json()]);
  
    return [cartData.cartItems, productData.products];
  }else{
    const productDataRes = await fetch(`${process.env.DOMAIN}/api/products?hidden=false`, {cache: 'no-store'});
    const productData = await productDataRes.json();
    return [[], productData.products];
  }
}

export default async function Home() {
  
  const [cartItems, products] = await getData();
  const locale = cookies().get('NEXT_LOCALE')?.value;

  return (
    <>
      <Header cartItems={cartItems} locale={locale}/>
      <Hero />
      <About />
      <ViewCollection featuredProducts={products}/>
      <Footer locale={locale}/>
    </>
  );
}
