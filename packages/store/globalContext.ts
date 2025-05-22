import React from "react";

export const GlobalContext  = React.createContext<{
    isMobileModalOpen: boolean;
    setIsMobileModalOpen: (isMobileModalOpen: boolean) => void
}>({
    isMobileModalOpen: false,
    setIsMobileModalOpen: function () {}
});

export const GlobalContextProvider = GlobalContext.Provider;