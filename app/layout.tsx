import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "desiiseb - মাইক্রোব্লগিং প্ল্যাটফর্ম",
  description: "কথোপকথনে যোগ দিন। আপনার চিন্তাভাবনা শেয়ার করুন। অন্যদের সাথে সংযুক্ত হন।",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bn">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Alkatra:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
