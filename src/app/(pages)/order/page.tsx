

import Order from "@/components/custom-orders/Order";
import Footer from "@/components/footer/Footer";
import Header from "@/components/layout/header/Header";
import { cookies, headers} from "next/headers";
import { redirect } from "next/navigation";

async function getData() {
    const cookieStore = cookies();
    const cartId = cookieStore.get('cart')?.value;
  
    if(cartId && cartId.length > 0){
    
      const [countryDataRes, cartDataRes] = await Promise.all([
        fetch(`https://ipinfo.io?token=${process.env.IPINFO_TOKEN}`),
        fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`, {cache: 'no-cache'})
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

export default async function OrdersPage() {
    const [country, cartItems] = await getData();
    const h = headers();
    const csrfToken = h.get('X-CSRF-Token') || 'missing';
 
  //protecting public routes
    const cookieStore = cookies();
    const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
    const token = cookieStore.get("access_token")?.value;
  
    if (token && isAdmin) {
      redirect("/admin/summary");
    }

    return (
      <>
        <Header cartItems={cartItems} />
        <Order country={country} csrf={csrfToken} />
        <Footer  csrf={csrfToken}/>

    </>
  );
}
