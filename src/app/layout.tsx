import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ToastProvider } from "@/components/ui/toast";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { AuthTokenCookie } from "@/components/auth/auth-token-cookie";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cruise — Premium P2P Car Rental Marketplace",
  description:
    "The premium peer-to-peer car rental marketplace. Browse, book, and drive verified vehicles with ease. Offline-capable, mobile-first.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cruise",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col font-body antialiased">
        <ThemeProvider>
          <ConvexClientProvider>
            <ToastProvider>
              <AuthTokenCookie />
              <Navbar />
              <main className="flex-1 pb-16 md:pb-0">
                <ErrorBoundary>{children}</ErrorBoundary>
              </main>
              <MobileNav />
              <Footer />
            </ToastProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
