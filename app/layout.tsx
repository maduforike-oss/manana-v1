import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Manana — POD Dashboard",
  description: "Design fast. Ship faster.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <div className="min-h-screen grid grid-rows-[auto,1fr]">
          <header className="glass-nav sticky top-0 z-50">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src="/brand/manana-logo.png" alt="Manana" className="w-8 h-8" />
                <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Manana</span>
              </Link>
              <nav className="flex gap-6 text-sm">
                <Link href="/dashboard" className="text-text-light hover:text-primary transition-colors">Dashboard</Link>
                <Link href="/designs" className="text-text-light hover:text-primary transition-colors">Designs</Link>
                <Link href="/orders" className="text-text-light hover:text-primary transition-colors">Orders</Link>
                <Link href="/profile" className="text-text-light hover:text-primary transition-colors">Profile</Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl w-full p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}