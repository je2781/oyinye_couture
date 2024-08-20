
import AdminHeader from "@/components/admin/AdminHeader";
import Body from "@/components/admin/Body";

export const dynamicParams = true;
 
export async function generateStaticParams() {
  return [];
}

async function getOrders(page: string) {
    const res = await fetch(`${process.env.DOMAIN}/api/orders/10?page=${page}`);
    const data = await res.json();
  
    delete data.success;
    return data;
}

export default async function Admin({
    params, searchParams
  }: any){
    const orderData = await getOrders(searchParams['page']);

    let pathName = params.section;
    let sectionName = '';

    if (pathName.includes("-")) {
        let firstWord =
          pathName.split("-")[0].charAt(0).toUpperCase() +
          pathName.split("-")[0].slice(1);
        let secondWord =
          pathName.split("-")[1].charAt(0).toUpperCase() +
          pathName.split("-")[1].slice(1);
    
        sectionName = [firstWord, secondWord].join(" ");
      } else {
        sectionName = pathName.charAt(0).toUpperCase() + pathName.slice(1);
      }

      const headerProps = {
        sectionName,
        pathName
      };


    return (
        <>
            <AdminHeader {...headerProps}/>
            <Body pathName={pathName} extractedOrders={orderData.orders} data={orderData}/>
        </>
    );
}