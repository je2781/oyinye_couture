import Header from "@/components/layout/header/Header";
import dynamic from "next/dynamic";
import { cookies, headers } from "next/headers";
import Footer from "@/components/footer/Footer";
import { redirect } from "next/navigation";
import { getCsrfToken } from "@/helpers/getHelpers";
import api from "@/helpers/axios";

const CartComponent = dynamic(() => import("../../../components/cart/Cart"), {
  loading: () => (
    <div className="flex justify-center items-center flex-col gap-y-2 bg-white h-screen w-full md:px-16 px-8 md:pt-12 pt-5 ">
      <h1 className="font-sans text-gray-600">api.geting Cart data...</h1>
      <span className="border-4 border-transparent rounded-full border-t-gray-600 border-r-gray-600 w-[36px] h-[36px] spin"></span>
    </div>
  ),
});

async function getCart() {
  const cookieStore = cookies();
  const cartId = cookieStore.get("cart")?.value;
  const userId = cookieStore.get("user")?.value;

  if (cartId && cartId.length > 0) {
    const [userDataRes, cartDataRes] = await Promise.all([
      api.get(`${process.env.AUTH_DOMAIN}/api/auth/users/${userId}`, {}),
      api.get(`${process.env.WEB_DOMAIN}/api/products/cart/${cartId}`, {
        headers: {
          "Cache-Control": "no-store",
         }
      }),
    ]);


    return {
      cartItems: cartDataRes.data.cartItems,
      total: cartDataRes.data.total,
      userEmail: userDataRes.data ? userDataRes.data.userEmail : "",
    };
  } else {
    return {
      cartItems: [],
      total: 0,
      userEmail: "",
    };
  }
}

async function CartPage() {
  //protecting public routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);

  const token = cookieStore.get("access_token")?.value;
  const csrfToken = await getCsrfToken();

  if (token && isAdmin) {
    redirect("/admin/summary");
  }

  const data = await getCart();

  const cartData = { ...data, csrf: csrfToken };

  return (
    <>
      <Header cartItems={data.cartItems} />
      <CartComponent {...cartData} />
      <Footer csrfToken={csrfToken} />
    </>
  );
}

export default CartPage;
