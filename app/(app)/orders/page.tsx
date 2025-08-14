"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">Track and manage orders.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => alert("Simulate import from POD provider")}>Import Orders</Button>
          <Button variant="secondary" onClick={() => alert("Simulate export CSV")}>Export CSV</Button>
        </div>
      </div>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      </Card>
    </div>
  )
}