"use client";

import { AuthContextProvider } from "@/store/authContext";
import { useEffect, useReducer, useState } from "react";
import { CartContextProvider } from "@/store/cartContext";
import { ProductContextProvider } from "@/store/productContext";
import Header from "@/components/layout/Header";
import { cartReducer, defaultCartState } from "@/helpers/getHelpers";
import { GlobalContextProvider } from "@/store/globalContext";
import Footer from "@/components/footer/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authStatus, setAuthStatus] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [cartState, dispatchCartAction] = useReducer(
    cartReducer,
    defaultCartState
  );

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
    <GlobalContextProvider value={{isMobileModalOpen, setIsMobileModalOpen}}>
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
