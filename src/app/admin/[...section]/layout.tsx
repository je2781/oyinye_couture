"use client";

import { useEffect, useState } from "react";
import { GlobalContextProvider } from "@/store/globalContext";
import "./admin.css";
import '../../globals.css';
import { ProductContextProvider } from "@/store/productContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    localStorage.clear();
    const storedLocale = localStorage.getItem("locale");
    if (storedLocale) {
      setLocale(storedLocale);
    }
  }, []);

  useEffect(() => {
    // Update <html lang> attribute to match current locale
    document.documentElement.lang = locale;
  }, [locale]);

  
  useEffect(() => {
    // Update <html lang> attribute to match current locale
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const res = await fetch(`/api/products`, {
          headers: {
            'Cache-Control': 'no-store'
          }
        });
        const data = await res.json();

        setAllProducts(data.products);
      } catch (error) {
      } 
    }

    fetchAllProducts();
    
  }, []);

  return (
    <GlobalContextProvider
      value={{ isMobileModalOpen, setIsMobileModalOpen, setLocale, locale }}
    >
      <ProductContextProvider
        value={{ allProducts}}
      >
        {children}
      </ProductContextProvider>
    </GlobalContextProvider>
  );
}
