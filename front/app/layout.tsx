import type React from "react"
import { ThemeProvider } from "./theme-provider"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>Instrusion Detection System</title>
        <meta name="description" content="Real-time network traffic monitoring and attack prevention" />
      </head>
      <body className="min-h-screen bg-background">
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      </body>
    </html>
  )
}

