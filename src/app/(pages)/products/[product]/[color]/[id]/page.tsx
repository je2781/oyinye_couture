import Footer from "@/components/footer/Footer";
import Header from "@/components/layout/header/Header";
import dynamic from "next/dynamic";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const ProductDetailComponent = dynamic(
  () => import("../../../../../../components/productDetail/ProductDetail"),
  {
    loading: () => (
      <main className="flex justify-center items-center flex-col gap-y-2 bg-white h-screen w-full">
        <h1 className="font-sans text-gray-600">Fetching Product...</h1>
        <span className="border-4 border-transparent rounded-full border-t-gray-600 border-r-gray-600 w-[36px] h-[36px] spin"></span>
      </main>
    ),
  }
);

async function getData(product: string, color: string, variantId: string) {
  const cookieStore = cookies();
  const cartId = cookieStore.get("cart")?.value;
  const viewedProducts = cookieStore.get("viewed_p")?.value;

  if (cartId && cartId.length > 0) {
    const [productDataRes, cartDataRes] = await Promise.all([
      fetch(
        `${process.env.DOMAIN}/api/products/${product}/${color}/${variantId}?viewed_p=${viewedProducts}`,
        { cache: "no-cache" }
      ),
      fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`, {
        cache: "no-cache",
      }),
    ]);

    const [productData, cartData] = await Promise.all([
      productDataRes.json(),
      cartDataRes.json(),
    ]);

    return [productData, cartData.cartItems];
  } else {
    const productDataRes = await fetch(
      `${process.env.DOMAIN}/api/products/${product}/${color}/${variantId}?viewed_p=${viewedProducts}`,
      { cache: "no-cache" }
    );
    const productData = await productDataRes.json();
    return [productData, []];
  }
}

const ProductPage = async ({
  params,
}: {
  params: { product: string; color: string; id: string };
}) => {
  const [productData, cartItems] = await getData(
    params.product,
    params.color,
    params.id
  );

  const h = headers();
  const csrfToken = h.get("X-CSRF-Token") || "missing";

  const data = {
    ...productData,
    paramsId: params.id,
    csrf: csrfToken,
  };
 
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const token = cookieStore.get("access_token")?.value;

  if (token && isAdmin) {
    redirect("/admin/summary");
  }

  return (
    <>
      <Header cartItems={cartItems} />
      <ProductDetailComponent {...data} />
      <Footer csrf={csrfToken} />
    </>
  );
};

export default ProductPage;
