'use client';

import { useEffect, useState } from "react";
import { ProductContextProvider } from "@/store/productContext";
import { GlobalContextProvider } from "@/store/globalContext";
import './admin.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const res = await fetch(`/api/products?hidden=false`, {
          headers: {
            'Cache-Control': 'no-store'
          }
        });
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
