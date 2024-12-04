'use client';

import React, { useMemo } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SessionProvider } from 'next-auth/react';
import localFont from 'next/font/local';
import Navbar from './components/navbar';
import { usePathname } from 'next/navigation';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const excludedPaths = ['/auth/login', '/auth/register', '/', '/login']; // Routes sans layout
  const shouldExcludeNavbar = excludedPaths.includes(pathname);

  // Détection du mode basé sur le système
  const isDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Création du thème en fonction du mode détecté
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: isDarkMode ? 'dark' : 'light',
        primary: {
          main: '#0070f3',
        },
        secondary: {
          main: '#383838',
        },
        background: {
          default: isDarkMode ? '#0a0a0a' : '#ffffff',
          paper: isDarkMode ? '#1a1a1a' : '#fafafa',
        },
        text: {
          primary: isDarkMode ? '#f5f5f5' : '#202020',
          secondary: isDarkMode ? '#9c9c9c' : '#474747',
        },
        divider: isDarkMode ? '#555' : '#9c9c9c',
      },
      typography: {
        fontFamily: 'var(--font-geist-sans), sans-serif',
      },
    }), [isDarkMode]);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <SessionProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <body className="h-screen flex flex-col">
            {/* Affiche la Navbar uniquement si la route n'est pas exclue */}
            {!shouldExcludeNavbar && <Navbar />}
            <main className={`flex-grow ${!shouldExcludeNavbar ? 'pt-16' : ''}`}>
              {children}
            </main>
          </body>
        </ThemeProvider>
      </SessionProvider>
    </html>
  );
}
