
import Header from "@/components/Header";
import ProductDetail from "@/components/ProductDetail";
import { cookies } from "next/headers";


export const dynamicParams = true;
 
export async function generateStaticParams() {
  return [];
}
 
async function getProductData(product: string, color: string){
  const res = await fetch(
    `${process.env.DOMAIN}/api/products/${product}/${color}`, {cache: 'no-cache'}
    );
    const data = await res.json();

    return data.product;
}

async function getCart() {
  const cookieStore = cookies();
  const cartId = cookieStore.get('cart')?.value;

  if(cartId){
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
    const productData = await getProductData(params.product, params.color);
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
      <ProductDetail {...data} />
    </>
  );
};

export default ProductPage;
