

import Footer from "@/components/footer/Footer";
import Header from "@/components/layout/Header";
import PagesComponent from "@/components/pages/Pages";
import { cookies } from "next/headers";

async function getData() {
    const cookieStore = cookies();
    const cartId = cookieStore.get('cart')?.value;
  
    if(cartId && cartId.length > 0){
    
      const cartDataRes = await 
        fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`);
    
      const cartData = await cartDataRes.json();

      return cartData.cartItems;
  
    }else{
        return [];
    }
}

export default async function Pages({params}:{
  params: { name: string }
}) {
    const cartItems = await getData();

    return (
      <>
        <Header cartItems={cartItems} />
        <PagesComponent name={params.name}/>
        <Footer />
    </>
  );
}
