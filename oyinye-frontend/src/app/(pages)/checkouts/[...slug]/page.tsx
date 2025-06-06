import Header from "@/components/layout/header/Header";
import Checkout from "@/components/checkout/Checkout";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCsrfToken } from "@/helpers/getHelpers";
import api from "@/helpers/axios";

async function getCheckout() {
  const cookieStore = cookies();
  const cartId = cookieStore.get("cart")?.value;
  const orderId = cookieStore.get("order")?.value;
  const userId = cookieStore.get("user")?.value;

  if (cartId && cartId.length > 0) {
    const [userDataRes, countryDataRes, cartDataRes] = await Promise.all([
      api.get(`${process.env.AUTH_DOMAIN}/api/auth/users/${userId}`),
      api.get(`https://ipinfo.io?token=${process.env.IPINFO_TOKEN}`),
      api.get(`${process.env.WEB_DOMAIN}/api/products/cart/${cartId}`, {
        headers: {
          "Cache-Control": "no-store",
         }
      }),
    ]);


    return {
      ...cartDataRes.data,
      orderId,
      country: countryDataRes.data.country,
      ...userDataRes.data,
    };
  } else {
    return {
      cartItems: [],
      total: 0,
      orderId,
      country: "NG",
      userData: null,
    };
  }
}

async function CheckoutPage() {
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;
  const csrfToken = await getCsrfToken();

  if (token && isAdmin) {
    redirect("/admin/summary");
  }

  const data = await getCheckout();

  const checkoutData = { ...data, csrf: csrfToken };

  return (
    <>
      <Header isCheckout={true} />
      <Checkout {...checkoutData} />
    </>
  );
}

export default CheckoutPage;
