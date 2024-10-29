

import Footer from "@/components/footer/Footer";
import Header from "@/components/layout/Header";
import PagesComponent from "@/components/pages/Pages";
import { cookies } from "next/headers";

async function getData() {
    const cookieStore = cookies();
    const cartId = cookieStore.get('cart')?.value;
  
    if(cartId && cartId.length > 0){
    
      const cartDataRes = await 
        fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`, {cache: 'no-cache'});
    
      const cartData = await cartDataRes.json();

      return cartData.cartItems;
  
    }else{
        return [];
    }
}

export default async function Pages({params}: any) {
    const cartItems = await getData();

    const cookieStore = cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

    return (
      <>
        <Header cartItems={cartItems} locale={locale}/>
        <PagesComponent name={params.name}/>
        <Footer locale={locale}/>
    </>
  );
}
