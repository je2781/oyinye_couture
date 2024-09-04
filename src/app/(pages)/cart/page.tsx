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
  const userId = cookieStore.get('user')?.value;
  
  const userDataRes = await fetch(`${process.env.DOMAIN}/api/users/${userId}`);
  const userData = await userDataRes.json();

  if(cartId){
  
    const cartDataRes = await fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`, {
      'cache': 'no-store'
    });
    const cartData = await cartDataRes.json();

    return {
      cartItems: cartData.cartItems,
      total: cartData.total,
      userEmail: userData ? userData.email : ''
    };
  }else{
    return {
      cartItems: [],
      total: 0,
      userEmail: userData ? userData.email : ''

    };
  }
}

async function CartPage() {
  const data = await getCart();

  return (
    <>
      <Header cartItems={data.cartItems} />
      <Cart {...data} />
    </>
  );
}

export default CartPage;
