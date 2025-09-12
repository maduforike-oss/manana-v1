import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SimpleTemplateUploader } from '@/components/admin/SimpleTemplateUploader'
import RequireAuth from '@/components/auth/RequireAuth'

const AdminTemplatesPage: React.FC = () => {
  return (
    <RequireAuth>
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Admin Template Uploader</h1>
          <p className="text-muted-foreground">
            Upload garment template images to the design system
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Upload Template</CardTitle>
            <CardDescription>
              Select category, color, and view, then drag & drop your PNG file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleTemplateUploader />
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  )
}

export default AdminTemplatesPage