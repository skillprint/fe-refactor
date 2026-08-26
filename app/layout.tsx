import type { Metadata } from "next";
import { Outfit, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "./skillprint.css";
import FTUECarousel from "./components/FTUECarousel";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { AuthGuard } from "./components/AuthGuard";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Suspense } from "react";
import PortalSprite from "@/components/PortalSprite";
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
  title: "Skillprint Portal · Home",
  description: "The Skillprint Games Portal home — continue a game, pick a recommendation, and read the playbook driving them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-brand-family="customer" data-surface="light" data-theme="light">
      <body
        className={`${outfit.variable} ${geistMono.variable} ${inter.variable} antialiased page scrollbar-subtle page--portal margin-none text-default font-ui leading-base`}
        suppressHydrationWarning
      >
        <PortalSprite />
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
