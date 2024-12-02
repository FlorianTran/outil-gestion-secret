'use client';

import { SessionProvider } from "next-auth/react";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from './components/navbar';
import { usePathname } from 'next/navigation';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const excludedPaths = ["/auth/login", "/auth/register", "/", "/login"]; // Routes sans layout

  const shouldExcludeNavbar = excludedPaths.includes(pathname);

  return (
    <html lang="en">
      <SessionProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}
        >
          {/* Affiche la Navbar uniquement si la route n'est pas exclue */}
          {!shouldExcludeNavbar && <Navbar />}
          <main className={`flex-grow ${!shouldExcludeNavbar ? 'pt-16' : ''}`}>
            {children}
          </main>
        </body>
      </SessionProvider>
    </html>
  );
}
