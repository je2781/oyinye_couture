import Collections from "@/components/collections/CollectionsComponent";
import Footer from "@/components/footer/Footer";
import Header from "@/components/layout/Header";
import { cookies } from "next/headers";

export const dynamicParams = true;
 
export async function generateStaticParams() {
  return [];
}
 
async function getCollectionData(sortBy: string, page: string, dressColor: string, dressFabric: string, dressFeature: string, dressLength: string, neckLine: string, sleeveLength: string){
  
  const queryParams = [
    `sort_by=${sortBy}`,
    dressColor ? `filter.p.m.custom.colors=${dressColor}` : '',
    dressFabric ? `filter.p.m.custom.fabric=${dressFabric}` : '',
    dressFeature ? `filter.p.m.custom.feature=${dressFeature}` : '',
    dressLength ? `filter.p.m.custom.dress_length=${dressLength}` : '',
    neckLine ? `filter.p.m.custom.neckline=${neckLine}` : '',
    sleeveLength ? `filter.p.m.custom.sleeve_length=${sleeveLength}` : '',
    `page=${page}`
  ];
  // Filter out empty parameters
  const filteredParams = queryParams.filter(param => param !== '');

  // Join the parameters to construct the query string
  const queryString = filteredParams.join('&');
  
  let uri = `${process.env.DOMAIN}/api/products/collections?${queryString}`;

  const res = await fetch(
    uri, {cache: 'no-cache'}
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

const CollectionsPage = async ({ params, searchParams}: any) => {
    let sortBy = searchParams.sort_by;

    if(!sortBy){
      sortBy = params.cat === 'all' ? 'created-descending' : 'title-ascending';
    }
    const page = searchParams.page;
    const dressColor = searchParams['filter.p.m.custom.colors'];
    const dressFabric = searchParams['filter.p.m.custom.fabric'];
    const dressFeature = searchParams['filter.p.m.custom.feature'];
    const dressLength = searchParams['filter.p.m.custom.dress_length'];
    const neckLine = searchParams['filter.p.m.custom.neckline'];
    const sleeveLength= searchParams['filter.p.m.custom.sleeve_length'];

    const collectionsData = await getCollectionData(sortBy, page, dressColor, dressFabric, dressFeature, dressLength, neckLine, sleeveLength);
    const cartItems = await getCart();

  return (
    <>
    <Header cartItems={cartItems}/>
    <Collections  {...{
      collectionsCat: params.cat,
      data: collectionsData,
      sortBy,
      page
    }} />
    <Footer />
    </>
  );
};

export default CollectionsPage;