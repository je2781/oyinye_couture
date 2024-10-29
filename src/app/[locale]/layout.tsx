"use client";

import { AuthContextProvider } from "@/store/authContext";
import { useEffect, useReducer, useState } from "react";
import { CartContextProvider } from "@/store/cartContext";
import { ProductContextProvider } from "@/store/productContext";
import { cartReducer, defaultCartState } from "@/helpers/getHelpers";
import { GlobalContextProvider } from "@/store/globalContext";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import '../public.css';
import 'animate.css';

export default function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};

}) {
  const [authStatus, setAuthStatus] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [lang, setLang] = useState(locale);
  const [cartState, dispatchCartAction] = useReducer(
    cartReducer,
    defaultCartState
  );

  useEffect(() => {
    // Update <html lang> attribute to match current locale
    document.documentElement.lang = lang;
  }, [lang]);

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
      } catch (error) {
      } 
    }

    fetchAllProducts();
    
  }, []);

  const deductItemHandler = (variantId: string,  quantity: number, price: number) => {
    dispatchCartAction({ type: "REMOVE", item: {
      variantId,
      quantity,
      price
    } });
  };

  const addItemHandler = async (item: any) => {
    dispatchCartAction({ type: "ADD", item });
  };

  const updateCartHandler = (items: any[]) => {
    dispatchCartAction({ type: "UPDATE", cartData: {items} });
  };

  const cartContext = {
    items: cartState.items,
    totalAmount: cartState.totalAmount,
    addItem: addItemHandler,
    deductItem: deductItemHandler,
    updateCart: updateCartHandler
  };

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  return (
    <GlobalContextProvider value={{isMobileModalOpen, setIsMobileModalOpen, setLang, lang}}>
        <AuthContextProvider value={{ authStatus, setAuthStatus }}>
          <CartContextProvider value={cartContext}>
            <ProductContextProvider
              value={{ allProducts}}
            >
              {children}
            </ProductContextProvider>
          </CartContextProvider>
        </AuthContextProvider>
    </GlobalContextProvider>
  );
}