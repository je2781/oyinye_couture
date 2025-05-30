"use client";

import { useEffect, useState } from "react";
import { ProductContextProvider } from "@/store/productContext";
import { GlobalContextProvider } from "@/store/globalContext";
import "./admin.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/products?hidden=false`,
          {
            headers: {
              "Cache-Control": "no-store",
            },
            credentials: "include",
          }
        );
        const data = await res.json();
        setAllProducts(data.products);
      } catch (error) {}
    }

    fetchAllProducts();
  }, []);

  return (
    <GlobalContextProvider value={{ isMobileModalOpen, setIsMobileModalOpen }}>
      <ProductContextProvider value={{ allProducts }}>
        {children}
      </ProductContextProvider>
    </GlobalContextProvider>
  );
}
