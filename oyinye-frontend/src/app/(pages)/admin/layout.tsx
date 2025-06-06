"use client";

import { useEffect, useState } from "react";
import { ProductContextProvider } from "@/store/productContext";
import { GlobalContextProvider } from "@/store/globalContext";
import "./admin.css";
import api from "@/helpers/axios";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  useEffect(() => {
    async function getAllProducts() {
      try {
        const res = await api.get(
          `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/products?hidden=false`,
          {
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
        setAllProducts(res.data.products);
      } catch (error) {}
    }

    getAllProducts();
  }, []);

  return (
    <GlobalContextProvider value={{ isMobileModalOpen, setIsMobileModalOpen }}>
      <ProductContextProvider value={{ allProducts }}>
        {children}
      </ProductContextProvider>
    </GlobalContextProvider>
  );
}
