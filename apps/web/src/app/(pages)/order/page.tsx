

import Order from "@ui/src/components/custom-orders/Order";
import Footer from "@ui/src/components/footer/Footer";
import Header from "@ui/src/components/layout/header/Header";
import { cookies, headers} from "next/headers";
import { redirect } from "next/navigation";

async function getData() {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cart')?.value;
  
    if(cartId && cartId.length > 0){
    
      const [countryDataRes, cartDataRes] = await Promise.all([
        fetch(`https://ipinfo.io?token=${process.env.IPINFO_TOKEN}`),
        fetch(`${process.env.WEB_DOMAIN!}/api/products/cart/${cartId}`, {cache: 'no-cache'})
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
    const h = await headers();
    const csrfToken = h.get('X-CSRF-Token') || 'missing';
 
  //protecting public routes
    const cookieStore = await cookies();
    const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
    const token = cookieStore.get("access_token")?.value;
  
    if (token && isAdmin) {
      redirect(`${process.env.ADMIN_DOMAIN}/admin/summary`);
    }

    return (
      <>
        <Header cartItems={cartItems} />
        <Order country={country} csrf={csrfToken} />
        <Footer  csrf={csrfToken}/>

    </>
  );
}
