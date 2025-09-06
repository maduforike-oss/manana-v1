export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block glass-card h-fit sticky top-6">
        <div className="text-base font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Sections</div>
        <nav className="space-y-3">
          <a href="/dashboard" className="flex items-center px-4 py-3 rounded-xl hover:bg-glass-light/50 transition-all duration-300 hover:scale-105 font-medium">Dashboard</a>
          <a href="/designs" className="flex items-center px-4 py-3 rounded-xl hover:bg-glass-light/50 transition-all duration-300 hover:scale-105 font-medium">Designs</a>
          <a href="/orders" className="flex items-center px-4 py-3 rounded-xl hover:bg-glass-light/50 transition-all duration-300 hover:scale-105 font-medium">Orders</a>
          <a href="/profile" className="flex items-center px-4 py-3 rounded-xl hover:bg-glass-light/50 transition-all duration-300 hover:scale-105 font-medium">Profile</a>
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  )
}