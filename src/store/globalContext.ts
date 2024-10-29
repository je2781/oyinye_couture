import React from "react";
import { useContext } from "react";

export const GlobalContext  = React.createContext<{
    isMobileModalOpen: boolean;
    setIsMobileModalOpen: (isMobileModalOpen: boolean) => void
    setLang: (lang: string) => void,
    lang: string
}>({
    isMobileModalOpen: false,
    setIsMobileModalOpen: function () {},
    setLang: (lang: string) => {},
    lang: 'en'
});

export const GlobalContextProvider = GlobalContext.Provider;