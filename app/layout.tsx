import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "Afinare Estética | Cuidado, Tecnologia e Bem-estar",
  description:
    "Clínica de estética especializada em remoção de tatuagem a laser, acupuntura, massagem, limpeza facial, botox e drenagem linfática. Localizada em Brasília.",
  keywords:
    "estética, remoção de tatuagem, laser, acupuntura, massagem, limpeza facial, botox, drenagem linfática, Brasília, Asa Norte",
  authors: [{ name: "Afinare Estética" }],
  openGraph: {
    title: "Afinare Estética | Cuidado, Tecnologia e Bem-estar",
    description: "Clínica de estética especializada em diversos tratamentos. Agende agora!",
    type: "website",
    locale: "pt_BR",
  },
  icons: {
    icon: "/logo-1.jpg",
    apple: "/logo-1.jpg",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E89B8F",
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
