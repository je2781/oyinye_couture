import React from 'react';

export const CartContext = React.createContext<
{
    items: any[];
    removeItem: (variantId: string) => void
    addItem: (item: any) => void;
    totalAmount: number
}>({
    items: [],
    removeItem: (variantId: string) => {},
    addItem: function(item: any){},
    totalAmount: 0
});

export const CartContextProvider = CartContext.Provider;
