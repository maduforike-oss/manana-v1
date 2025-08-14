"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account settings.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => alert("Pretend we saved profile settings")}>Save</Button>
          <Button variant="secondary" onClick={() => alert("Logged out (stub)")}>Log out</Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Display Name</label>
            <input className="w-full border rounded-md px-3 py-2" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full border rounded-md px-3 py-2" placeholder="you@example.com" />
          </div>
        </div>
      </Card>
    </div>
  )
}