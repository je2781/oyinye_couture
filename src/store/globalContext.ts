import React from "react";
import { useContext } from "react";

export const GlobalContext  = React.createContext<{
    isMobileModalOpen: boolean;
    setIsMobileModalOpen: (isMobileModalOpen: boolean) => void
    setLocale: (locale: string) => void,
    locale: string
}>({
    isMobileModalOpen: false,
    setIsMobileModalOpen: function () {},
    setLocale: (locale: string) => {},
    locale: 'en'
});

export const GlobalContextProvider = GlobalContext.Provider;