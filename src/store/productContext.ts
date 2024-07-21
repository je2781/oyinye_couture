import { SearchResults } from "@/interfaces";
import React from "react";

export const ProductContext  = React.createContext<{
    allProducts: any[],
}>({
    allProducts: [],
    
});

export const ProductContextProvider = ProductContext.Provider;