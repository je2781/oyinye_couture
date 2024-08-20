
import Header from "@/components/Header";
import Signup from "@/components/auth/Signup";
import { cookies } from "next/headers";

export const dynamicParams = true;
 
export async function generateStaticParams() {
  return [];
}

async function getCart() {
  const cookieStore = cookies();
  const cartId = cookieStore.get('cart')?.value;

  if(cartId){
    const res = await fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`);
    const data = await res.json();
  
    return data.cartItems;
  }else{
    return [];
  }
}

export default async function SignupPage() {
  const cartItems = await getCart();
  return (
    <>
      <Header cartItems={cartItems}/>
      <Signup />
    </>
  );
}
