"use client";

import { useEffect, useState } from "react";
import { GlobalContextProvider } from "@/store/globalContext";
import { ProductContextProvider } from "@/store/productContext";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

import "./admin.css";


export default function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: any;
}) {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [lang, setLang] = useState(locale);

  useEffect(() => {
    // Update <html lang> attribute to match current lang
    document.documentElement.lang = lang;
  }, [lang]);


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

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }


  return (
    <GlobalContextProvider value={{isMobileModalOpen, setIsMobileModalOpen, setLang, lang}}>
        <ProductContextProvider
        value={{ allProducts}}
        >
        {children}
        </ProductContextProvider>
    </GlobalContextProvider>
);
}
