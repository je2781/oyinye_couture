
import Hero from "@ui/src/components/hero/Hero";
import { cookies, headers} from "next/headers";
import About from "@ui/src/components/about/AboutUs";
import Footer from "@ui/src/components/footer/Footer";
import ViewCollection from "@ui/src/components/collections/ViewCollection";
import Header from "@ui/src/components/layout/header/Header";
import { redirect } from "next/navigation";

async function getData() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cart')?.value;

  if(cartId && cartId.length > 0){
    const [cartDataRes, productDataRes] = await Promise.all([
      fetch(`${process.env.WEB_DOMAIN!}/api/products/cart/${cartId}`),
      fetch(`${process.env.WEB_DOMAIN!}/api/products?hidden=false`, {cache: 'no-store'})
    ]);

    const [cartData, productData] = await Promise.all([cartDataRes.json(), productDataRes.json()]);
  
    return [cartData.cartItems, productData.products];
  }else{
    const productDataRes = await fetch(`${process.env.WEB_DOMAIN!}/api/products?hidden=false`, {cache: 'no-store'});
    const productData = await productDataRes.json();
    return [[], productData.products];
  }
}

export default async function Home() {
  
  const [cartItems, products] = await getData();
  const h = await headers();
  const csrfToken = h.get('X-CSRF-Token') || 'missing';

  //protecting public routes
  const cookieStore = await cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;

  if (token && isAdmin) {
    redirect(`${process.env.ADMIN_DOMAIN}/admin/summary`);
  }

  return (
    <>
      <Header cartItems={cartItems}/>
      <Hero />
      <About />
      <ViewCollection featuredProducts={products}/>
      <Footer csrf={csrfToken}/>
    </>
  );
}
