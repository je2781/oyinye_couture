
import AdminHeader from "@/components/layout/AdminHeader";
import Body from "@/components/admin/Body";
import dynamic from 'next/dynamic'
import { cookies } from "next/headers";

const BodyComponent = dynamic(() => import('../../../components/admin/Body'),{
  loading: () => <div className="flex justify-center items-center flex-col gap-y-2 bg-primary-950 h-screen md:pl-64 pl-7 lg:pr-3 pr-7 w-full pb-12" id='admin-content'>
    <h1 className="font-sans text-secondary-400">Fetching data...</h1>
    <span className="border-4 border-transparent rounded-full border-t-secondary-400 border-r-secondary-400 w-[36px] h-[36px] spin"></span>
</div>,
ssr: false
});

export const dynamicParams = true;
 
export async function generateStaticParams() {
  return [];
}


async function getData(page?: string) {
    const cookieStore = cookies();
    const [orderDataRes, enquiriesDataRes, visitorsDataRes, userDataRes] = await Promise.all([
      fetch(`${process.env.DOMAIN}/api/orders/10?page=${page ? page : '1'}`, {
        cache: 'no-store' // Ensure the request isn't cached
      }),
      fetch(`${process.env.DOMAIN}/api/enquiries/10?page=${page ? page : '1'}`, {
        cache: 'no-store' 
      }),
      fetch(`${process.env.DOMAIN}/api/visitors`),
      fetch(`${process.env.DOMAIN}/api/users/${cookieStore.get('admin')?.value}`)
    ]);

    const [orderData, enquiriesData, visitorsData, userData] = await Promise.all([
      orderDataRes.json(), enquiriesDataRes.json(), visitorsDataRes.json(), userDataRes.json()
    ]);
  
    return [orderData, enquiriesData, visitorsData, userData];
}

export default async function Admin({
    params, searchParams
  }: any){
    const [orderData, enquiriesData, visitorsData, userData] = await getData(searchParams['page']);

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
        pathName,
        userName: userData.userName,
        userEmail: userData.userEmail,
        title: userData.title,
        id: userData.userId
      };

      const bodyProps = {
        visitors: visitorsData.visitors,
        enquiriesData: enquiriesData,
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