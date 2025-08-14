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
          <header className="border-b">
            <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-semibold">Manana</Link>
              <nav className="flex gap-6 text-sm">
                <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                <Link href="/designs" className="hover:underline">Designs</Link>
                <Link href="/orders" className="hover:underline">Orders</Link>
                <Link href="/profile" className="hover:underline">Profile</Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl w-full p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}