
import AdminHeader from "@/components/admin/AdminHeader";
import Body from "@/components/admin/Body";
import dynamic from 'next/dynamic'

const BodyComponent = dynamic(() => import('../../../../components/admin/Body'),{
  loading: () => <div className="flex justify-center items-center flex-col gap-y-2 bg-primary-950 h-screen md:pl-64 pl-7 lg:pr-3 pr-7 w-full pb-12" id='admin-content'>
    <h1 className="font-sans text-secondary-400">Fetching Order data...</h1>
    <span className="border-4 border-transparent rounded-full border-t-secondary-400 border-r-secondary-400 w-[36px] h-[36px] spin"></span>
</div>,
ssr: false
})

export const dynamicParams = true;
 
export async function generateStaticParams() {
  return [];
}

async function getVisitors() {
    const res = await fetch(`${process.env.DOMAIN}/api/visitors`, {
      cache: 'no-store' // Ensure the request isn't cached
    });
    const data = await res.json();
  
    return data.visitors;
}

async function getOrders(page?: string) {
    const res = await fetch(`${process.env.DOMAIN}/api/orders/10?page=${page ? page : '1'}`, {
      cache: 'no-store' // Ensure the request isn't cached
  });
    const data = await res.json();
  
    return data;
}

export default async function Admin({
    params, searchParams
  }: any){
    const orderData = await getOrders(searchParams['page']);
    const visitors = await getVisitors();

    let pathNames: string[] = params.section;
    let sectionName = '';
    let pathName = '';

    if(pathNames.length === 1){
      if (pathNames[0].includes("-")) {
        let firstWord =
          pathNames[0].split("-")[0].charAt(0).toUpperCase() +
          pathNames[0].split("-")[0].slice(1);
        let secondWord =
          pathNames[0].split("-")[1].charAt(0).toUpperCase() +
          pathNames[0].split("-")[1].slice(1);
    
        sectionName = [firstWord, secondWord].join(" ");
        pathName = pathNames[0];
      } else {
        sectionName = pathNames[0].charAt(0).toUpperCase() + pathNames[0].slice(1);
        pathName = pathNames[0];
      }
    }else{
      sectionName = pathNames[1].charAt(0).toUpperCase() + pathNames[1].slice(1);
      pathName = pathNames[0] + '/' + pathNames[1];

    }


      const headerProps = {
        sectionName,
        pathName
      };

      const bodyProps = {
        visitors,
        data: orderData,
        extractedOrders: orderData.orders,
        pathName
      };

    return (
        <>
            <AdminHeader {...headerProps}/>
            <BodyComponent {...bodyProps}/>
        </>
    );
}