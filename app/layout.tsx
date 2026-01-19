import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastNotification from "@/components/ToastNotification";
import SupportChat from "@/components/SupportChat";

export const metadata: Metadata = {
  title: "HUNSLOR - Premium Tech Store",
  description: "Premium e-commerce platform for Apple, Dyson, and Tech products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-DE">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <ToastNotification />
        <SupportChat />
      </body>
    </html>
  );
}
