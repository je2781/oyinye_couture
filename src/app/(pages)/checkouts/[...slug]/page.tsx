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

  const userDataRes = await fetch(`${process.env.DOMAIN}/api/users/${userId}`);
  const userData = await userDataRes.json();

  const countryDataRes = await fetch(
    `https://ipinfo.io?token=${process.env.IPINFO_TOKEN}`
  );
  const countryData = await countryDataRes.json();

  if (cartId) {
    const cartDataRes = await fetch(
      `${process.env.DOMAIN}/api/products/cart/${cartId}`
    );
    const cartData = await cartDataRes.json();

    return {
      ...cartData,
      orderId,
      country: countryData.country,
      userData,
    };
  } else {
    return {
      cartItems: [],
      total: 0,
      orderId,
      country: countryData.country,
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
