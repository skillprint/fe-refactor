import type { Metadata } from "next";
import { Outfit, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import FTUECarousel from "./components/FTUECarousel";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { AuthGuard } from "./components/AuthGuard";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Suspense } from "react";
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skillprint",
  description: "Your gaming personality profile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
          <AuthProvider>
            <ThemeProvider>
              <AuthGuard>
                <Suspense fallback={null}>
                  <FTUECarousel />
                </Suspense>
                <Toaster position="top-center" />
                {children}
              </AuthGuard>
            </ThemeProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
