import Header from "@/components/Header";
import Cart from "@/components/cart/Cart";
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
  
    return data;
  }else{
    return {
      cartItems: [],
      total: 0
    };
  }
}

async function CartPage() {
  const data = await getCart();

  return (
    <>
      <Header cartItems={data.cartItems} />
      <Cart cartItems={data.cartItems} total={data.total} />
    </>
  );
}

export default CartPage;
