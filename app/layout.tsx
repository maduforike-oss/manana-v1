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
          <header className="apple-nav-header">
            <div className="apple-nav-content">
              <Link href="/" className="apple-nav-logo">
                <img src="/brand/manana-logo.png" alt="Manana" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-wide">Manana</span>
              </Link>
              <nav className="apple-nav-links">
                <Link href="/dashboard" className="apple-nav-link">
                  <span>Dashboard</span>
                </Link>
                <Link href="/designs" className="apple-nav-link">
                  <span>Designs</span>
                </Link>
                <Link href="/orders" className="apple-nav-link">
                  <span>Orders</span>
                </Link>
                <Link href="/profile" className="apple-nav-link">
                  <span>Profile</span>
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl w-full p-6 sm:p-8 lg:p-12">{children}</main>
        </div>
        
        <script dangerouslySetInnerHTML={{
          __html: `
            let lastScrollY = window.scrollY;
            let isScrollingDown = false;
            
            window.addEventListener('scroll', () => {
              const currentScrollY = window.scrollY;
              const header = document.querySelector('.apple-nav-header');
              
              if (currentScrollY > lastScrollY && currentScrollY > 60) {
                // Scrolling down
                if (!isScrollingDown) {
                  isScrollingDown = true;
                  header?.classList.add('nav-compact');
                }
              } else {
                // Scrolling up
                if (isScrollingDown) {
                  isScrollingDown = false;
                  header?.classList.remove('nav-compact');
                }
              }
              
              lastScrollY = currentScrollY;
            });
          `
        }} />
      </body>
    </html>
  )
}