import Header from "@/components/Header";
import Cart from "@/components/cart/Cart";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";

const CartComponent = dynamic(() => import('../../../components/cart/Cart'),{
  loading: () => <div className="flex justify-center items-center flex-col gap-y-2 bg-white h-screen w-full md:px-16 px-8 md:pt-12 pt-5 " >
    <h1 className="font-sans text-gray-600">Fetching Cart data...</h1>
    <span className="border-4 border-transparent rounded-full border-t-gray-600 border-r-gray-600 w-[36px] h-[36px] spin"></span>
</div>
});

async function getCart() {
  const cookieStore = cookies();
  const cartId = cookieStore.get('cart')?.value;
  const userId = cookieStore.get('user')?.value;

  if(cartId && cartId.length > 0){
  
    const [userDataRes, cartDataRes] = await Promise.all([
      fetch(`${process.env.DOMAIN}/api/users/${userId}`),
      fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`, {cache: 'no-cache'})
    ]);

    const [userData, cartData] = await Promise.all([userDataRes.json(), cartDataRes.json()]);

    return {
      cartItems: cartData.cartItems,
      total: cartData.total,
      userEmail: userData ? userData.userEmail : ''
    };
  }else{
    return {
      cartItems: [],
      total: 0,
      userEmail: ''

    };
  }
}

async function CartPage() {
  const data = await getCart();

  return (
    <>
      <Header cartItems={data.cartItems} />
      <CartComponent {...data} />
    </>
  );
}

export default CartPage;
