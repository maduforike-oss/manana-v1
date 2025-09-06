"use client"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function NewDesignPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">New Design</h1>
        <p className="text-lg text-muted-foreground">Create something amazing</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Design Studio</CardTitle>
          <CardDescription>Your creative canvas is being prepared with enhanced tools and features.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => alert("Pretend we saved a draft ✨")} size="lg">
              Save Draft
            </Button>
            <Button variant="outline" onClick={() => history.back()} size="lg">
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}