
import FeaturedProducts from "@/components/FeaturedProducts";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { cookies, headers } from "next/headers";


async function getAllProducts(){
  const res = await fetch(`${process.env.DOMAIN}/api/products`, {next: {revalidate: 60}});
  const data = await res.json();

  return data.products;
}


async function getCart() {
  const cookieStore = cookies();
  const cartId = cookieStore.get('cart')?.value;

  if(cartId && cartId.length > 0){
    const res = await fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`);
    const data = await res.json();
  
    return data.cartItems;
  }else{
    return [];
  }
}

export default async function Home() {
  
  const products = await getAllProducts();
  const cartItems = await getCart();

  return (
    <>
      <Header cartItems={cartItems}/>
      <Hero/>
      <FeaturedProducts featuredProducts={products}/>
    </>
  );
}
