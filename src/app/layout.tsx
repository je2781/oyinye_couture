import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oyinye Couture",
  description: "A bespoke tailoring outfit",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/hint.css/3.0.0/hint.css" />
      <script type="text/javascript" src="/scripts/checkout.js"></script>
      </head>
      <body className={inter.className}>
        <div id='quick-view-modal'></div>
        <div id='mobile-modal'></div>
        <div id='filter-modal'></div>
        <div id='search-modal'></div>
        <div id='admin-settings-modal'></div>
        <div id='backdrop-root'></div>
        <Toaster position="bottom-center" />
        {children}
        <script src='https://newwebpay.interswitchng.com/inline-checkout.js'></script>
      </body>
    </html>
  );
}
