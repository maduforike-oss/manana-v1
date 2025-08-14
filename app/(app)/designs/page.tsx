"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function DesignsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Designs</h1>
          <p className="text-sm text-muted-foreground">Create, edit and export your designs.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/designs/new")}>New Design</Button>
          <Button variant="secondary" onClick={() => router.refresh()}>Refresh</Button>
        </div>
      </div>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">No designs yet.</p>
        <div className="mt-4">
          <Link href="/designs/new" className="underline">Create your first design →</Link>
        </div>
      </Card>
    </div>
  )
}