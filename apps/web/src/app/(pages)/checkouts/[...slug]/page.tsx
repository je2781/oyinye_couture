import Header from "@ui/src/components/layout/header/Header";
import Checkout from "@ui/src/components/checkout/Checkout";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

async function getCheckout() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cart")?.value;
  const orderId = cookieStore.get("order")?.value;
  const userId = cookieStore.get("user")?.value;

  if(cartId && cartId.length > 0){
    const [userDataRes, countryDataRes,cartDataRes] = await Promise.all([
      fetch(`${process.env.WEB_DOMAIN!}/api/users/${userId}`),
      fetch(`https://ipinfo.io?token=${process.env.IPINFO_TOKEN}`),
      fetch(`${process.env.WEB_DOMAIN!}/api/products/cart/${cartId}`, {cache: 'no-cache'})
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

  const h = await headers();
  const csrfToken = h.get('X-CSRF-Token') || 'missing';

  const checkoutData = {...data, csrf: csrfToken};

  //protecting public routes
  const cookieStore = await cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;

  if (token && isAdmin) {
    redirect(`${process.env.ADMIN_DOMAIN}/admin/summary`);
  }

  return (
    <>
      <Header isCheckout={true} />
      <Checkout
        {...checkoutData}
      />
    </>
  );
}

export default CheckoutPage;
