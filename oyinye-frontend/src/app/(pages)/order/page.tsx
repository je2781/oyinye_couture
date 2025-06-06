import Order from "@/components/custom-orders/Order";
import Footer from "@/components/footer/Footer";
import Header from "@/components/layout/header/Header";
import api from "@/helpers/axios";
import { getCsrfToken } from "@/helpers/getHelpers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getData() {
  const cookieStore = cookies();
  const cartId = cookieStore.get("cart")?.value;

  if (cartId && cartId.length > 0) {
    const [countryDataRes, cartDataRes] = await Promise.all([
      api.get(`https://ipinfo.io?token=${process.env.IPINFO_TOKEN}`),
      api.get(`${process.env.WEB_DOMAIN}/api/products/cart/${cartId}`, {
        headers: {
          "Cache-Control": "no-store",
         }
      }),
    ]);

    return [countryDataRes.data.country, cartDataRes.data.cartItems];
  } else {
    return ["NG", []];
  }
}

export default async function OrdersPage() {
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;
  const csrfToken = await getCsrfToken();


  if (token && isAdmin) {
    redirect("/admin/summary");
  }

  const [country, cartItems] = await getData();

  return (
    <>
      <Header cartItems={cartItems} />
      <Order country={country} csrf={csrfToken} />
      <Footer csrfToken={csrfToken} />
    </>
  );
}
