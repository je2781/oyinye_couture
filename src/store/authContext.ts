import React from "react";
import { useContext } from "react";

export const AuthContext  = React.createContext<{
    authStatus: boolean;
    setAuthStatus: (status: boolean) => void
}>({
    authStatus: false,
    setAuthStatus: function () {}
});

export const AuthContextProvider = AuthContext.Provider;