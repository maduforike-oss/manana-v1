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
            <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 hover:scale-105">
                <img src="/brand/manana-logo.png" alt="Manana" className="w-10 h-10" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Manana</span>
              </Link>
              <nav className="flex gap-8 text-sm">
                <Link href="/dashboard" className="text-foreground/80 hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-glass-light/50">Dashboard</Link>
                <Link href="/designs" className="text-foreground/80 hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-glass-light/50">Designs</Link>
                <Link href="/orders" className="text-foreground/80 hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-glass-light/50">Orders</Link>
                <Link href="/profile" className="text-foreground/80 hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-xl hover:bg-glass-light/50">Profile</Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl w-full p-6 sm:p-8 lg:p-12">{children}</main>
        </div>
      </body>
    </html>
  )
}