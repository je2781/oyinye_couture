"use client";

import { AuthContextProvider } from "@/store/authContext";
import { useEffect, useReducer, useState } from "react";
import { cartReducer, defaultCartState } from "@/helpers/getCartReducerData";
import Header from "@/components/Header";
import { CartContextProvider } from "@/store/cartContext";
import Cart from "@/models/cart";
import axios from "axios";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authStatus, setAuthStatus] = useState(false);

  const [cartState, dispatchCartAction] = useReducer(
    cartReducer,
    defaultCartState
  );

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
        <Header />
        <main>{children}</main>
      </CartContextProvider>
    </AuthContextProvider>
  );
}
