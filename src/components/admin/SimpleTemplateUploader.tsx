import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, CheckCircle, AlertCircle, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { 
  listCategories, 
  upsertTemplateImage, 
  publicUrl, 
  isUserStaff,
  type Category,
  type GarmentView 
} from '@/lib/garmentTemplates'
import { supabase } from '@/integrations/supabase/client'

const AVAILABLE_VIEWS: GarmentView[] = ['front', 'back']
const COMMON_COLORS = ['white', 'black', 'navy', 'gray', 'red', 'blue', 'green', 'yellow', 'pink', 'purple']

interface UploadState {
  file: File | null
  category: string
  color: string
  view: GarmentView
  dimensions: { width: number; height: number } | null
  uploading: boolean
  success: boolean
  publicUrl: string | null
}

export const SimpleTemplateUploader: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isStaff, setIsStaff] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    category: '',
    color: 'white',
    view: 'front',
    dimensions: null,
    uploading: false,
    success: false,
    publicUrl: null
  })

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, staffStatus] = await Promise.all([
          listCategories(),
          isUserStaff()
        ])
        
        setCategories(categoriesData)
        setIsStaff(staffStatus)
        
        if (categoriesData.length > 0 && !uploadState.category) {
          setUploadState(prev => ({ ...prev, category: categoriesData[0].slug }))
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Generate storage path preview
  const getStoragePath = () => {
    if (!uploadState.category || !uploadState.color || !uploadState.view) {
      return 'garment-templates/category/color/view.png'
    }
    return `garment-templates/${uploadState.category}/${uploadState.color}/${uploadState.view}.png`
  }

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    // Read image dimensions
    const img = new Image()
    img.onload = () => {
      setUploadState(prev => ({
        ...prev,
        file,
        dimensions: { width: img.width, height: img.height },
        success: false,
        publicUrl: null
      }))
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      toast.error('Invalid image file')
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Handle upload
  const handleUpload = async () => {
    if (!uploadState.file || !uploadState.category || !uploadState.dimensions) {
      toast.error('Please select a file and fill all fields')
      return
    }

    try {
      setUploadState(prev => ({ ...prev, uploading: true }))

      const storagePath = getStoragePath()
      
      // Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('design-templates')
        .upload(storagePath, uploadState.file, {
          upsert: true,
          contentType: 'image/png'
        })

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`)
      }

      // Call edge function to upsert metadata
      await upsertTemplateImage({
        category_slug: uploadState.category,
        view: uploadState.view,
        color_slug: uploadState.color,
        storage_path: storagePath,
        width_px: uploadState.dimensions.width,
        height_px: uploadState.dimensions.height,
        dpi: 300
      })

      const finalPublicUrl = publicUrl(storagePath)
      
      setUploadState(prev => ({
        ...prev,
        success: true,
        publicUrl: finalPublicUrl
      }))

      toast.success('Template uploaded successfully!')

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploadState(prev => ({ ...prev, uploading: false }))
    }
  }

  // Copy URL to clipboard
  const copyUrl = () => {
    if (uploadState.publicUrl) {
      navigator.clipboard.writeText(uploadState.publicUrl)
      toast.success('URL copied to clipboard')
    }
  }

  // Reset form
  const reset = () => {
    setUploadState(prev => ({
      ...prev,
      file: null,
      dimensions: null,
      success: false,
      publicUrl: null
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isStaff) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="text-muted-foreground">
          Staff access is required to upload template images.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={uploadState.category} 
            onValueChange={(value) => setUploadState(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.slug} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Select 
            value={uploadState.color} 
            onValueChange={(value) => setUploadState(prev => ({ ...prev, color: value }))}
          >
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

        <div>
          <Label htmlFor="view">View</Label>
          <Select 
            value={uploadState.view} 
            onValueChange={(value) => setUploadState(prev => ({ ...prev, view: value as GarmentView }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_VIEWS.map(view => (
                <SelectItem key={view} value={view}>
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Storage Path Preview */}
      <div className="p-3 bg-muted rounded-lg">
        <Label className="text-sm font-medium">Storage Path:</Label>
        <code className="text-sm text-muted-foreground ml-2">{getStoragePath()}</code>
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50",
          uploadState.success && "border-green-500 bg-green-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploadState.success && fileInputRef.current?.click()}
      >
        <div className="p-8 text-center">
          {uploadState.success ? (
            <div className="space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-green-700">Upload Successful!</h3>
                <p className="text-sm text-green-600 mt-1">Template image uploaded and metadata saved</p>
              </div>
              
              {uploadState.publicUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Public URL:</Label>
                  <div className="flex items-center gap-2 p-2 bg-background rounded border">
                    <code className="text-xs flex-1 text-left truncate">
                      {uploadState.publicUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyUrl()
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              <Button onClick={reset} variant="outline">
                Upload Another
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">
                  {uploadState.file ? uploadState.file.name : 'Drop your PNG file here'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Or click to select a file (PNG, JPG, WebP up to 10MB)
                </p>
              </div>
              
              {uploadState.file && uploadState.dimensions && (
                <div className="space-y-2">
                  <Badge variant="secondary">
                    {uploadState.dimensions.width} × {uploadState.dimensions.height} px
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    File size: {(uploadState.file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Upload Button */}
      {uploadState.file && !uploadState.success && (
        <Button 
          onClick={handleUpload} 
          disabled={uploadState.uploading || !uploadState.category}
          className="w-full"
          size="lg"
        >
          {uploadState.uploading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              Uploading...
            </>
          ) : (
            'Upload Template'
          )}
        </Button>
      )}
    </div>
  )
}