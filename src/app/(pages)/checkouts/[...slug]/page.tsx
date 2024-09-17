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
  const cartId = cookieStore.get("cart")?.value;
  const orderId = cookieStore.get("order")?.value;
  const userId = cookieStore.get("user")?.value;

  if(cartId && cartId.length > 0){
    const [userDataRes, countryDataRes,cartDataRes] = await Promise.all([
      fetch(`${process.env.DOMAIN}/api/users/${userId}`),
      fetch(`https://ipinfo.io?token=${process.env.IPINFO_TOKEN}`),
      fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`)
    ]);

    const [userData, countryData, cartData] = await Promise.all([userDataRes.json(), countryDataRes.json(), cartDataRes.json()]);

    return {
      ...cartData,
      orderId,
      country: countryData.country,
      ...userData,
    };
  } else {
    return {
      cartItems: [],
      total: 0,
      orderId,
      country: 'NG',
      userData: null,
    };
  }
}


async function CheckoutPage() {
  const data = await getCheckout();

  return (
    <>
      <Header isCheckout />
      <Checkout
        {...data}
      />
    </>
  );
}

export default CheckoutPage;
