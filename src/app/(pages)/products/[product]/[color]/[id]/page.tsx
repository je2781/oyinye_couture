
import Header from "@/components/Header";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";

const ProductDetailComponent = dynamic(() => import('../../../../../../components/ProductDetail'),{
  loading: () => <main className="flex justify-center items-center flex-col gap-y-2 bg-white h-screen w-full" >
    <h1 className="font-sans text-gray-600">Fetching Product...</h1>
    <span className="border-4 border-transparent rounded-full border-t-gray-600 border-r-gray-600 w-[36px] h-[36px] spin"></span>
</main>
});

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

async function getProductData(product: string, color: string, variantId: string){
  const res = await fetch(
    `${process.env.DOMAIN}/api/products/${product}/${color}/${variantId}`, {cache: 'no-cache'}
    );
    const data = await res.json();

    return data;
}


async function getCart() {
  const cookieStore = cookies();
  const cartId = cookieStore.get('cart')?.value;

  if(cartId && cartId.length > 0){
    const res = await fetch(`${process.env.DOMAIN}/api/products/cart/${cartId}`);
    const data = await res.json();
  
    return data.cartItems;
  }else{
    return [];
  }
}


const ProductPage = async ({
  params,
}: {
  params: { product: string; color: string; id: string };
}) => {
    const productData = await getProductData(params.product, params.color, params.id);
    const cartItems = await getCart();


    const data = {
        ...productData,
        paramsId: params.id,
        paramsColor: params.color,
        paramsProduct: params.product
    };

  return (
    <>
      <Header cartItems={cartItems}/>
      <ProductDetailComponent {...data} />
      
    </>
  );
};

export default ProductPage;
