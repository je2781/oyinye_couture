import AdminHeader from "@/components/layout/header/AdminHeader";
import dynamic from "next/dynamic";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const BodyComponent = dynamic(
  () => import("@/components/admin/Body"),
  {
    loading: () => (
      <div
        className="flex justify-center items-center flex-col gap-y-2 bg-primary-950 h-screen md:pl-64 pl-7 lg:pr-3 pr-7 w-full pb-12"
        id="admin-content"
      >
        <h1 className="font-sans text-secondary-400">Fetching data...</h1>
        <span className="border-4 border-transparent rounded-full border-t-secondary-400 border-r-secondary-400 w-[36px] h-[36px] spin"></span>
      </div>
    ),
    ssr: false,
  }
);

async function getSearchData(query: string, page: string) {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;

  const queryParams = [`q=${query}`, `page=${page}`];
  // Filter out empty parameters
  const filteredParams = queryParams.filter((param) => param !== "");

  // Join the parameters to construct the query string
  const queryString = filteredParams.join("&");

  let uri = `${process.env.ADMIN_DOMAIN}/api/products/search?${queryString}`;

  const res = await fetch(uri, {
    cache: "no-cache",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  return data;
}

async function getData() {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;
  const [
    orderDataRes,
    enquiriesDataRes,
    visitorsDataRes,
    userDataRes,
  ] = await Promise.all([
    fetch(`${process.env.ADMIN_DOMAIN}/api/orders/10?page=1`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
    fetch(`${process.env.ADMIN_DOMAIN}/api/enquiries/10?page=1`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
    fetch(`${process.env.ADMIN_DOMAIN}/api/visitors`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
    fetch(
      `${process.env.ADMIN_DOMAIN}/api/users/${cookieStore.get("user")?.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ),
  ]);

  const [orderData, enquiriesData, visitorsData, userData] = await Promise.all([
    orderDataRes.json(),
    enquiriesDataRes.json(),
    visitorsDataRes.json(),
    userDataRes.json(),
  ]);

  return [orderData, enquiriesData, visitorsData, userData];
}

export default async function Admin({ params, searchParams }: any) {
  //protecting admin routes
  const cookieStore = cookies();
  const isAdmin = cookieStore.get("admin_status")?.value;
  const token = cookieStore.get("access_token")?.value;

  if (!token && !isAdmin) {
    redirect("/");
  }
  
  const keyword = searchParams.q;
  const page = searchParams.page;
  const [orderData, enquiriesData, visitorsData, userData] = await getData();
  const searchData = await getSearchData(keyword, page);

  let sectionName = "";
  let pathName = "";

  if (params.section.includes("-")) {
    let firstWord =
      params.section.split("-")[0].charAt(0).toUpperCase() +
      params.section.split("-")[0].slice(1);
    let secondWord =
      params.section.split("-")[1].charAt(0).toUpperCase() +
      params.section.split("-")[1].slice(1);

    sectionName = [firstWord, secondWord].join(" ");
    pathName = params.section;
  } else {
    sectionName =
      params.section.charAt(0).toUpperCase() + params.section.slice(1);
    pathName = params.section;
  }

  const h = await headers();
  const csrfToken = h.get("X-CSRF-Token") || "missing";


  const headerProps = {
    sectionName,
    pathName,
    userName: userData.userName,
    userEmail: userData.userEmail,
    userTitle: userData.title,
    id: userData.userId,
    avatar: userData.avatar,
    csrf: csrfToken,
  };

  const bodyProps = {
    visitors: visitorsData.visitors,
    enquiriesData: enquiriesData,
    searchData,
    data: orderData,
    extractedOrders: orderData.orders,
    pathName,
    csrf: csrfToken,
  };

  return (
    <>
      <AdminHeader {...headerProps} />
      <BodyComponent {...bodyProps} />
    </>
  );
}
