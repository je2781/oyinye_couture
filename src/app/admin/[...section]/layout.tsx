"use client";

import { useEffect, useState } from "react";
import { GlobalContextProvider } from "@/store/globalContext";
import "./admin.css";
import '../../globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    localStorage.clear();
    const storedLocale = localStorage.getItem("locale");
    if (storedLocale) {
      setLocale(storedLocale);
    }
  }, []);

  useEffect(() => {
    // Update <html lang> attribute to match current locale
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <GlobalContextProvider
      value={{ isMobileModalOpen, setIsMobileModalOpen, setLocale, locale }}
    >
      {children}
    </GlobalContextProvider>
  );
}
