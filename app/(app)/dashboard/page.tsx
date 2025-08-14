"use client"
import Link from "next/link"
import { Card } from "@/components/ui/card"

function Tile({ label, value, href }: { label: string; value?: string; href: string }) {
  return (
    <Link href={href} className="block">
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="text-sm text-muted-foreground">{label}</div>
        {value ? <div className="text-3xl font-semibold mt-2">{value}</div> : null}
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Quick links into the core areas.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Total Designs" value="0" href="/designs" />
        <Tile label="Orders" value="0" href="/orders" />
        <Tile label="Revenue" value="£0" href="/orders" />
        <Tile label="Profile" href="/profile" />
      </div>
    </div>
  )
}