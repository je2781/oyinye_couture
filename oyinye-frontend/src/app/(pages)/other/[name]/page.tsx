import Footer from "@/components/footer/Footer";
import Header from "@/components/layout/header/Header";
import OthersComponent from "@/components/other/Other";
import api from "@/helpers/axios";
import { getCsrfToken } from "@/helpers/getHelpers";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

async function getData() {
  const cookieStore = cookies();
  const cartId = cookieStore.get("cart")?.value;

  if (cartId && cartId.length > 0) {
    const cartDataRes = await api.get(
      `${process.env.WEB_DOMAIN}/api/products/cart/${cartId}`,
      {
       headers: {
        "Cache-Control": "no-store",
       }
      }
    );


    return cartDataRes.data.cartItems;
  } else {
    return [];
  }
}

export default async function Other({ params }: any) {
  
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;
  const csrfToken = await getCsrfToken();

  
  if (token && isAdmin) {
    redirect("/admin/summary");
  }
  
  const cartItems = await getData();

  return (
    <>
      <Header cartItems={cartItems} />
      <OthersComponent name={params.name} csrf={csrfToken} />
      <Footer csrfToken={csrfToken} />
    </>
  );
}
