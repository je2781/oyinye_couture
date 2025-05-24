

import Footer from "@ui/src/components/footer/Footer";
import Header from "@ui/src/components/layout/header/Header";
import OthersComponent from "@ui/src/components/other/Other";
import { cookies, headers} from "next/headers";
import { redirect } from "next/navigation";

async function getData() {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cart')?.value;
  
    if(cartId && cartId.length > 0){
    
      const cartDataRes = await 
        fetch(`${process.env.WEB_DOMAIN!}/api/products/cart/${cartId}`, {cache: 'no-cache'});
    
      const cartData = await cartDataRes.json();

      return cartData.cartItems;
  
    }else{
        return [];
    }
}

export default async function Other({params}: any) {
    const cartItems = await getData();

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
        <OthersComponent name={params.name} csrf={csrfToken}/>
        <Footer csrf={csrfToken}/>
    </>
  );
}
