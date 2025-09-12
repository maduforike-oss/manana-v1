import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, Trash2, Eye, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getGarmentCategories,
  getTemplatesByCategory,
  uploadGarmentTemplate,
  deleteGarmentTemplate,
  isUserStaff,
  createGarmentCategory,
  type GarmentCategory,
  type GarmentTemplateImage,
  type GarmentView,
  type UploadTemplateData
} from '@/lib/garmentTemplates'

const AVAILABLE_VIEWS: GarmentView[] = ['front', 'back', 'left', 'right', 'angle_left', 'angle_right']
const COMMON_COLORS = ['white', 'black', 'navy', 'gray', 'red', 'blue', 'green', 'yellow', 'pink', 'purple']

export const GarmentTemplateManager: React.FC = () => {
  const [categories, setCategories] = useState<GarmentCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [templates, setTemplates] = useState<GarmentTemplateImage[]>([])
  const [isStaff, setIsStaff] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  // Upload form state
  const [uploadData, setUploadData] = useState<Partial<UploadTemplateData>>({
    view: 'front',
    colorSlug: 'white',
    dpi: 300
  })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  // New category form state
  const [newCategorySlug, setNewCategorySlug] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  // Load templates when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadTemplates(selectedCategory)
    }
  }, [selectedCategory])

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesData, staffStatus] = await Promise.all([
        getGarmentCategories(),
        isUserStaff()
      ])
      
      setCategories(categoriesData)
      setIsStaff(staffStatus)
      
      if (categoriesData.length > 0 && !selectedCategory) {
        setSelectedCategory(categoriesData[0].id)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load garment data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async (categoryId: string) => {
    try {
      const templatesData = await getTemplatesByCategory(categoryId)
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive'
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive'
      })
      return
    }

    setUploadFile(file)

    // Load image to get dimensions
    const img = new Image()
    img.onload = () => {
      setUploadData(prev => ({
        ...prev,
        widthPx: img.width,
        heightPx: img.height
      }))
    }
    img.src = URL.createObjectURL(file)
  }

  const handleUpload = async () => {
    if (!uploadFile || !selectedCategory || !uploadData.view || !uploadData.colorSlug) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      setUploading(true)

      const data: UploadTemplateData = {
        categoryId: selectedCategory,
        view: uploadData.view as GarmentView,
        colorSlug: uploadData.colorSlug,
        file: uploadFile,
        widthPx: uploadData.widthPx || 1000,
        heightPx: uploadData.heightPx || 1000,
        dpi: uploadData.dpi || 300,
        printArea: uploadData.printArea || { x: 0, y: 0, w: 0, h: 0 },
        safeArea: uploadData.safeArea || { x: 0, y: 0, w: 0, h: 0 },
        meta: uploadData.meta || {}
      }

      await uploadGarmentTemplate(data)
      
      toast({
        title: 'Success',
        description: 'Template uploaded successfully',
      })

      // Reset form and reload templates
      setUploadFile(null)
      setUploadData({
        view: 'front',
        colorSlug: 'white',
        dpi: 300
      })
      setShowUploadDialog(false)
      loadTemplates(selectedCategory)

    } catch (error) {
      console.error('Error uploading template:', error)
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload template',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await deleteGarmentTemplate(templateId)
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      })
      loadTemplates(selectedCategory)
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete template',
        variant: 'destructive'
      })
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategorySlug || !newCategoryName) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in both slug and name',
        variant: 'destructive'
      })
      return
    }

    try {
      await createGarmentCategory(newCategorySlug, newCategoryName)
      toast({
        title: 'Success',
        description: 'Category created successfully',
      })
      
      setNewCategorySlug('')
      setNewCategoryName('')
      setShowNewCategoryDialog(false)
      loadData()
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: 'Creation Failed',
        description: 'Failed to create category',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading garment templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Garment Template Manager</h1>
          <p className="text-muted-foreground">
            Manage global garment template images for the design studio
          </p>
        </div>
        
        {isStaff && (
          <div className="flex gap-2">
            <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                  <DialogDescription>
                    Add a new garment category to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={newCategorySlug}
                      onChange={(e) => setNewCategorySlug(e.target.value)}
                      placeholder="e.g., t-shirt"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g., T-Shirt"
                    />
                  </div>
                  <Button onClick={handleCreateCategory} className="w-full">
                    Create Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Garment Template</DialogTitle>
                  <DialogDescription>
                    Upload a new template image for the selected category
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Image File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="view">View</Label>
                      <Select value={uploadData.view} onValueChange={(value) => 
                        setUploadData(prev => ({ ...prev, view: value as GarmentView }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select view" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_VIEWS.map(view => (
                            <SelectItem key={view} value={view}>
                              {view.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Select value={uploadData.colorSlug} onValueChange={(value) => 
                        setUploadData(prev => ({ ...prev, colorSlug: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_COLORS.map(color => (
                            <SelectItem key={color} value={color}>
                              {color.charAt(0).toUpperCase() + color.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="width">Width (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={uploadData.widthPx || ''}
                        onChange={(e) => setUploadData(prev => ({ 
                          ...prev, 
                          widthPx: parseInt(e.target.value) || 0 
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Height (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={uploadData.heightPx || ''}
                        onChange={(e) => setUploadData(prev => ({ 
                          ...prev, 
                          heightPx: parseInt(e.target.value) || 0 
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dpi">DPI</Label>
                      <Input
                        id="dpi"
                        type="number"
                        value={uploadData.dpi || 300}
                        onChange={(e) => setUploadData(prev => ({ 
                          ...prev, 
                          dpi: parseInt(e.target.value) || 300 
                        }))}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleUpload} 
                    disabled={!uploadFile || uploading}
                    className="w-full"
                  >
                    {uploading ? 'Uploading...' : 'Upload Template'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {!isStaff && (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Staff access required to manage garment templates.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
            <CardDescription>
              {categories.length} categories available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card hover:bg-muted border-border'
                }`}
              >
                <div className="font-medium">{category.name}</div>
                <div className="text-sm opacity-70">{category.slug}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Templates
                {selectedCategory && (
                  <Badge variant="secondary" className="ml-2">
                    {templates.length} templates
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {selectedCategory 
                  ? `Templates for ${categories.find(c => c.id === selectedCategory)?.name}`
                  : 'Select a category to view templates'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No templates found for this category.
                  </p>
                  {isStaff && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowUploadDialog(true)}
                    >
                      Upload First Template
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {templates.map(template => (
                    <div key={template.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {template.public_url ? (
                          <img 
                            src={template.public_url} 
                            alt={`${template.view} ${template.color_slug}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-muted-foreground">No preview</div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">
                            {template.view.replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary">
                            {template.color_slug}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-3">
                          {template.width_px} × {template.height_px}px
                          <br />
                          {template.dpi} DPI
                        </div>

                        <div className="flex gap-2">
                          {template.public_url && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => window.open(template.public_url, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                          
                          {isStaff && (
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}