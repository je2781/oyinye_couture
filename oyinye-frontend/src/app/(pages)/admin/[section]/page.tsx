import AdminHeader from "@/components/layout/header/AdminHeader";
import api from "@/helpers/axios";
import { getCsrfToken } from "@/helpers/getHelpers";
import dynamic from "next/dynamic";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const BodyComponent = dynamic(() => import("@/components/admin/Body"), {
  loading: () => (
    <div
      className="flex justify-center items-center flex-col gap-y-2 bg-primary-950 h-screen md:pl-64 pl-7 lg:pr-3 pr-7 w-full pb-12"
      id="admin-content"
    >
      <h1 className="font-sans text-secondary-400">getting data...</h1>
      <span className="border-4 border-transparent rounded-full border-t-secondary-400 border-r-secondary-400 w-[36px] h-[36px] spin"></span>
    </div>
  ),
  ssr: false,
});

const makeSafeFetch = async (url: string) => {
  try {
    const res = await api.get(url, {
      headers: {
        "Cache-Control": "no-store",
       }
    });

    if (res.status != 200) {
      console.error(`function returned ${res.status}:`, await res.statusText);
      return null;
    }
    return res.data;
  } catch (error) {
    console.error(`api.get failed for ${url}`, error);
    return null;
  }
};

async function getSearchData(query: string, page: string) {

  const queryParams = [`q=${query}`, `page=${page}`];
  // Filter out empty parameters
  const filteredParams = queryParams.filter((param) => param !== "");

  // Join the parameters to construct the query string
  const queryString = filteredParams.join("&");

  let uri = `${process.env.ADMIN_DOMAIN}/api/products/search?${queryString}`;

  const data = await makeSafeFetch(uri);

  return data;
}

async function getData() {
  const cookieStore = cookies();

  const [orderData, enquiriesData, userData] = await Promise.all([
    makeSafeFetch(`${process.env.ADMIN_DOMAIN}/api/orders/10?page=1`),
    makeSafeFetch(`${process.env.ADMIN_DOMAIN}/api/enquiries/10?page=1`),
    makeSafeFetch(
      `${process.env.AUTH_DOMAIN}/api/auth/users/${cookieStore.get("user")?.value}`
    ),
  ]);

  return [orderData, enquiriesData, userData];
}

export default async function Admin({ params, searchParams }: any) {
  //protecting admin routes
  const cookieStore = cookies();
  const isAdmin = Boolean(cookieStore.get("admin_status")?.value);
  const csrfToken = await getCsrfToken();

  if (!isAdmin) {
    redirect("/");
  }

  const keyword = searchParams.q;
  const page = searchParams.page;
  const [orderData, enquiriesData, userData] = await getData();
  const searchData = await getSearchData(keyword ?? "10", page ?? "1");

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
