import Hero from "@/components/hero/Hero";
import { cookies, headers } from "next/headers";
import About from "@/components/about/AboutUs";
import Footer from "@/components/footer/Footer";
import ViewCollection from "@/components/collections/ViewCollection";
import Header from "@/components/layout/header/Header";
import { redirect } from "next/navigation";
import { getCsrfToken } from "@/helpers/getHelpers";
import api from "@/helpers/axios";

async function getData() {
  const cookieStore = cookies();
  const cartId = cookieStore.get("cart")?.value;

  if (cartId && cartId.length > 0) {
    const [cartDataRes, productDataRes] = await Promise.all([
      api.get(`${process.env.WEB_DOMAIN}/api/products/cart/${cartId}`),
      api.get(`${process.env.WEB_DOMAIN}/api/products?hidden=false`, {
        headers: {
          "Cache-Control": "no-store",
        },
      }),
    ]);

    return [cartDataRes.data.cartItems, productDataRes.data.products];
  } else {
    const productDataRes = await api.get(
      `${process.env.WEB_DOMAIN}/api/products?hidden=false`,
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
    return [[], productDataRes.data.products];
  }
}

export default async function Home() {
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;
  const csrfToken = await getCsrfToken();

  if (token && isAdmin) {
    redirect("/admin/summary");
  }

  const [cartItems, products] = await getData();

  return (
    <>
      <Header cartItems={cartItems} />
      <Hero />
      <About />
      <ViewCollection featuredProducts={products} csrrf={csrfToken} />
      <Footer csrfToken={csrfToken} />
    </>
  );
}
