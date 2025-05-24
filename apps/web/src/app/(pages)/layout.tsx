// app/providers.tsx
'use client';

import { AuthContextProvider } from "@store/authContext";
import { useEffect, useReducer, useState } from "react";
import { CartContextProvider } from "@store/cartContext";
import { ProductContextProvider } from "@store/productContext";
import { cartReducer, defaultCartState, qstashClient } from "packages/utils/getHelpers";
import { GlobalContextProvider } from "@store/globalContext";


export default function Layout({ children }: { children: React.ReactNode }) {
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
        const res = await fetch(`/api/products?hidden=false`, {
          headers: {
            'Cache-Control': 'no-store'
          }
        });
        const data = await res.json();
        
         //dispatching visitor_created job
         await qstashClient.publishJSON({
          url: `${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}/api/admin?utility=visitor_created`,
          body: {
            visitor: data.visitor
          },
          maxRetries: 1,
          headers: {
            "x-internal-qstash-key": process.env.NEXT_PUBLIC_QSTASH_INTERNAL_KEY!
          }
        });
        setAllProducts(data.products);
      } catch (error) {}
    }

    fetchAllProducts();
  }, []);

  const cartContext = {
    items: cartState.items,
    totalAmount: cartState.totalAmount,
    addItem: (item: any) => dispatchCartAction({ type: "ADD", item }),
    deductItem: (variantId: string, quantity: number, price: number) =>
      dispatchCartAction({ type: "REMOVE", item: { variantId, quantity, price } }),
    updateCart: (items: any[]) =>
      dispatchCartAction({ type: "UPDATE", cartData: { items } }),
  };

  return (
    <GlobalContextProvider value={{ isMobileModalOpen, setIsMobileModalOpen }}>
      <AuthContextProvider value={{ authStatus, setAuthStatus }}>
        <CartContextProvider value={cartContext}>
          <ProductContextProvider value={{ allProducts }}>
            {children}
          </ProductContextProvider>
        </CartContextProvider>
      </AuthContextProvider>
    </GlobalContextProvider>
  );
}
