

import Footer from "@/components/footer/Footer";
import Header from "@/components/layout/header/Header";
import OthersComponent from "@/components/other/Other";
import { cookies, headers} from "next/headers";
import { redirect } from "next/navigation";

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

export default async function Other({params}: any) {
    const cartItems = await getData();

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
        <OthersComponent name={params.name} csrf={csrfToken}/>
        <Footer csrf={csrfToken}/>
    </>
  );
}
