// app/api/your-route/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const res = NextResponse.json({ message: "Cookie set!" });
  const cookieStore = cookies();
  const viewedP = cookieStore.get("viewed_p")?.value;

  if (!viewedP) {
    res.cookies.set({
      name: "viewed_p",
      value: JSON.stringify([params.slug]),
      expires: new Date(new Date().getTime() + 5184000000), // Expires in 2 month,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
  } else {
    const viewedProductsArray = JSON.parse(viewedP);

    // Add the new product variant id to the beginning of the array
    if (!viewedProductsArray.includes(params.slug)) {
      viewedProductsArray.unshift(params.slug);
    }

    // Limit the number of stored product variant ids (e.g., to the 10 most recent)
    if (viewedProductsArray.length > 10) {
      viewedProductsArray.pop();
    }

    res.cookies.set({
      name: "viewed_p",
      value: JSON.stringify(viewedProductsArray),
      expires: new Date(new Date().getTime() + 2629746000), // Expires in 1 month,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });

  }
  
  return res;
}
