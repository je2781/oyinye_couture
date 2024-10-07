import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

import "./globals.css";

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
      <link rel="android-chrome-192x192" sizes="192x192" href="https://cdn.jsdelivr.net/gh/je2781/oyinye_couture@main/public/android-chrome-192x192.png"/>
      <link rel="android-chrome-512x512" sizes="512x512" href="https://cdn.jsdelivr.net/gh/je2781/oyinye_couture@main/public/android-chrome-512x512.png"/>
      <link rel="apple-touch-icon" sizes="180x180" href="https://cdn.jsdelivr.net/gh/je2781/oyinye_couture@main/public/apple-touch-icon.png"/>
      <link rel="icon" type="image/png" sizes="32x32" href="https://cdn.jsdelivr.net/gh/je2781/oyinye_couture@main/public/favicon-32x32.png"/>
      <link rel="icon" type="image/png" sizes="16x16" href="https://cdn.jsdelivr.net/gh/je2781/oyinye_couture@main/public/favicon-16x16.png"/>
      <link rel="manifest" href="https://cdn.jsdelivr.net/gh/je2781/oyinye_couture@main/public/site.webmanifest"/>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/hint.css/3.0.0/hint.css" />
      <script type="text/javascript" src="/scripts/checkout.js"></script>
      </head>
      <body className={inter.className}>
        <div id='quick-view-modal'></div>
        <div id='mobile-modal'></div>
        <div id='filter-modal'></div>
        <div id='search-modal'></div>
        <div id='reviews-modal'></div>
        <div id='admin-modal'></div>
        <div id='backdrop-root'></div>
        <Toaster position="bottom-center" />
        {children}
        <script src='https://newwebpay.interswitchng.com/inline-checkout.js'></script>
      </body>
    </html>
  );
}
