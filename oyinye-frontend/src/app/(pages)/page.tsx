import Hero from "@/components/hero/Hero";
import { cookies, headers } from "next/headers";
import About from "@/components/about/AboutUs";
import Footer from "@/components/footer/Footer";
import ViewCollection from "@/components/collections/ViewCollection";
import Header from "@/components/layout/header/Header";
import { redirect } from "next/navigation";

async function getData(token?: string) {
  const cookieStore = cookies();
  const cartId = cookieStore.get("cart")?.value;

  if (cartId && cartId.length > 0) {
    const [cartDataRes, productDataRes] = await Promise.all([
      fetch(`${process.env.WEB_DOMAIN}/api/products/cart/${cartId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
      fetch(`${process.env.WEB_DOMAIN}/api/products?hidden=false`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
    ]);

    const [cartData, productData] = await Promise.all([
      cartDataRes.json(),
      productDataRes.json(),
    ]);

    return [cartData.cartItems, productData.products];
  } else {
    const productDataRes = await fetch(
      `${process.env.WEB_DOMAIN}/api/products?hidden=false`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const productData = await productDataRes.json();
    return [[], productData.products];
  }
}

export default async function Home() {
  
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;
  
  if (token && isAdmin) {
    redirect("/admin/summary");
  }

  const [cartItems, products] = await getData(token);
  const h = headers();
  const csrfToken = h.get("X-CSRF-Token") || "missing";

  return (
    <>
      <Header cartItems={cartItems} />
      <Hero />
      <About />
      <ViewCollection featuredProducts={products} csrrf={csrfToken}/>
      <Footer csrfToken={csrfToken} />
    </>
  );
}
