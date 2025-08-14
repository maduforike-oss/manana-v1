export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block border rounded-lg p-4 h-fit sticky top-6">
        <div className="text-sm font-semibold mb-2">Sections</div>
        <ul className="space-y-2 text-sm">
          <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
          <li><a href="/designs" className="hover:underline">Designs</a></li>
          <li><a href="/orders" className="hover:underline">Orders</a></li>
          <li><a href="/profile" className="hover:underline">Profile</a></li>
        </ul>
      </aside>
      <section>{children}</section>
    </div>
  )
}