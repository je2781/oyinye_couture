import Header from "@/components/layout/header/Header";
import Checkout from "@/components/checkout/Checkout";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

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


async function CheckoutPage() {
  const data = await getCheckout();

  const h = headers();
  const csrfToken = h.get('X-CSRF-Token') || 'missing';

  const checkoutData = {...data, csrf: csrfToken};

  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;

  if (token && isAdmin) {
    redirect("/admin/summary");
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
