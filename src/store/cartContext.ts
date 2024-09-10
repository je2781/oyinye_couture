import React from 'react';

export const CartContext = React.createContext<
{
    items: any[];
    deductItem: (variantId: string, quantity: number, price: number) => void
    addItem: (item: any) => void;
    updateCart: (items: any[]) => void;
    totalAmount: number,
}>({
    items: [],
    deductItem: (variantId: string, quantity: number, price: number) => {},
    addItem: function(item: any){},
    updateCart: (items: any[]) => {},
    totalAmount: 0,
});

export const CartContextProvider = CartContext.Provider;
