import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OnlyFarmers.in - Agricultural Marketplace",
  description: "Connect farmers and buyers across India. Buy and sell crops, equipment, and agricultural products.",
  keywords: "agriculture, farming, marketplace, crops, farmers, buyers, India",
  authors: [{ name: "OnlyFarmers Team" }],
  creator: "OnlyFarmers.in",
  publisher: "OnlyFarmers.in",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://onlyfarmers.in"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "hi-IN": "/hi",
    },
  },
  openGraph: {
    title: "OnlyFarmers.in - Agricultural Marketplace",
    description: "Connect farmers and buyers across India",
    url: "https://onlyfarmers.in",
    siteName: "OnlyFarmers.in",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnlyFarmers.in - Agricultural Marketplace",
    description: "Connect farmers and buyers across India",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#16a34a",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#dc2626",
                  secondary: "#fff",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
