

import Bookings from "@/components/bookings/Bookings";
import Header from "@/components/layout/Header";
import { cookies } from "next/headers";

async function getData() {
    const cookieStore = cookies();
    const cartId = cookieStore.get('cart')?.value;
  
    if(cartId && cartId.length > 0){
    
      const [countryDataRes, cartDataRes] = await Promise.all([
        fetch(`https://ipinfo.io?token=${process.env.IPINFO_TOKEN}`),
        fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`)
      ]);
    
      const [countryData, cartData] = await Promise.all([
        countryDataRes.json(),
        cartDataRes.json()
      ]);

      return [countryData.country, cartData.cartItems];
  
    }else{
        return ['NG', []];
    }
}

export default async function BookingsPage() {
    const [country, cartItems] = await getData();

    return (
      <>
        <Header cartItems={cartItems} />
        <Bookings country={country}/>
    </>
  );
}
