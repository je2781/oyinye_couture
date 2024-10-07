"use client";

import { AuthContextProvider } from "@/store/authContext";
import { useEffect, useReducer, useState } from "react";
import { CartContextProvider } from "@/store/cartContext";
import { ProductContextProvider } from "@/store/productContext";
import Header from "@/components/layout/Header";
import { cartReducer, defaultCartState } from "@/helpers/getHelpers";
import { GlobalContextProvider } from "@/store/globalContext";
import messagesEn from '../../locales/en/messages.json';
import messagesFr from '../../locales/fr/messages.json';
import messagesCh from '../../locales/zh-TW/messages.json';
import messagesPg from '../../locales/pt-PT/messages.json';
import messagesEs from '../../locales/es/messages.json';
import messagesNl from '../../locales/nl/messages.json';
import './public.css';
import { IntlProvider } from "react-intl";

const messages: Record<string, { [key: string]: any }> = {
  'en': messagesEn,
  'fr': messagesFr,
  'nl': messagesNl,
  'pt-PT': messagesPg,
  'zh-TW': messagesCh,
  'es': messagesEs
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authStatus, setAuthStatus] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [locale, setLocale] = useState('en');
  const [cartState, dispatchCartAction] = useReducer(
    cartReducer,
    defaultCartState
  );

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale) {
      setLocale(storedLocale);
    }
  }, []);

  useEffect(() => {
    // Update <html lang> attribute to match current locale
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        
        const res = await fetch(`/api/products`);
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

  return (
    <GlobalContextProvider value={{isMobileModalOpen, setIsMobileModalOpen, setLocale, locale}}>
      <IntlProvider locale={locale} messages={messages[locale]}>
          <AuthContextProvider value={{ authStatus, setAuthStatus }}>
          <CartContextProvider value={cartContext}>
            <ProductContextProvider
              value={{ allProducts}}
            >
              {children}
              <div>
                
              </div>
            </ProductContextProvider>
          </CartContextProvider>
        </AuthContextProvider>
      </IntlProvider>
    </GlobalContextProvider>
  );
}
