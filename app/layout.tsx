import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

import { ConvexClientProvider } from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Journal — A Space for Your Thoughts",
  description: "A luxury minimalist journal for capturing your thoughts and reflections",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#FAFAFA",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
