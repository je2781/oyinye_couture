import Header from "@/components/layout/Header";
import Cart from "@/components/cart/Cart";
import Checkout from "@/components/checkout/Checkout";
import { cookies, headers } from "next/headers";

async function getCheckout() {
  const cookieStore = cookies();
  const cartId = cookieStore.get("cart")?.value;
  const orderId = cookieStore.get("order")?.value;
  const userId = cookieStore.get("user")?.value;

  if(cartId && cartId.length > 0){
    const [userDataRes, countryDataRes,cartDataRes] = await Promise.all([
      fetch(`${process.env.DOMAIN}/api/users/${userId}`),
      fetch(`https://ipinfo.io?token=${process.env.IPINFO_TOKEN}`),
      fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`, {cache: 'no-cache'})
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


async function CheckoutPage({params}: any) {
  const data = await getCheckout();

  const cookieStore = cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  const checkoutData = {...data, locale: locale};

  return (
    <>
      <Header isCheckout={true} locale={locale} />
      <Checkout
        {...checkoutData}
      />
    </>
  );
}

export default CheckoutPage;
