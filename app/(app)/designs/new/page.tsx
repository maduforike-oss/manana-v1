"use client"
import { Button } from "@/components/ui/button"

export default function NewDesignPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New Design</h1>
      <p className="text-sm text-muted-foreground">Canvas editor coming soon. For now, this is a placeholder.</p>
      <div className="flex gap-2">
        <Button onClick={() => alert("Pretend we saved a draft ✨")}>Save Draft</Button>
        <Button variant="secondary" onClick={() => history.back()}>Back</Button>
      </div>
    </div>
  )
}