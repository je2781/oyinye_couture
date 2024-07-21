
import Header from "@/components/Header";
import ProductDetail from "@/components/ProductDetail";


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

const ProductPage = async ({
  params,
}: {
  params: { product: string; color: string; id: string };
}) => {
    const productData = await getProductData(params.product, params.color);

    const data = {
        ...productData,
        paramsId: params.id,
        paramsColor: params.color,
        paramsProduct: params.product
    };

  return (
    <>
      <Header />
      <ProductDetail {...data}/>
    </>
  );
};

export default ProductPage;
