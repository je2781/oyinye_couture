"use client";

import { AuthContextProvider } from "@/store/authContext";
import { useEffect, useReducer, useState } from "react";
import { cartReducer, defaultCartState } from "@/helpers/getCartReducerData";
import Header from "@/components/Header";
import { CartContextProvider } from "@/store/cartContext";
import useProduct from "@/store/useProduct";
import { ProductContextProvider } from "@/store/productContext";
import { SearchResults } from "@/interfaces";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authStatus, setAuthStatus] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);

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



  const removeItemHandler = (variantId: string) => {
    dispatchCartAction({ type: "REMOVE", variantId });
  };

  const addItemHandler = async (item: any) => {
    dispatchCartAction({ type: "ADD", item: item });
  };

  const cartContext = {
    items: cartState.items,
    totalAmount: cartState.totalAmount,
    addItem: addItemHandler,
    removeItem: removeItemHandler,
  };

  return (
    <AuthContextProvider value={{ authStatus, setAuthStatus }}>
      <CartContextProvider value={cartContext}>
        <ProductContextProvider
          value={{ allProducts}}
        >
          {children}
        </ProductContextProvider>
      </CartContextProvider>
    </AuthContextProvider>
  );
}
