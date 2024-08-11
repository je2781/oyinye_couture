import Header from "@/components/Header";
import Cart from "@/components/cart/Cart";
import Checkout from "@/components/checkout/Checkout";
import { cookies } from "next/headers";


export const dynamicParams = true;
 
export async function generateStaticParams() {
  return [];
}

async function getCheckout() {
  const cookieStore = cookies();
  const cartId = cookieStore.get('cart')?.value;
  const orderId = cookieStore.get('order')?.value;

  if(cartId){
    const res = await fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`);
    const data = await res.json();
  
    return {...data, orderId};
  }else{
    return {
      cartItems: [],
      total: 0,
      orderId
    };
  }
}

async function CheckoutPage() {
  const data = await getCheckout();

  return (
    <>
      <Header cartItems={data.cartItems} isCheckout/>
      <Checkout cartItems={data.cartItems} total={data.total} orderId={data.orderId}/>
    </>
  );
}

export default CheckoutPage;
