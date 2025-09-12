import { supabase } from '@/integrations/supabase/client'
import type { Json } from '@/integrations/supabase/types'

// Types
export type GarmentView = 'front' | 'back' | 'left' | 'right' | 'angle_left' | 'angle_right'

export interface GarmentCategory {
  id: string
  slug: string
  name: string
  created_at: string
  created_by?: string
}

export interface PrintArea {
  x: number
  y: number
  w: number
  h: number
}

export interface GarmentTemplateImage {
  id: string
  category_id: string
  view: GarmentView
  color_slug: string
  storage_path: string
  width_px: number
  height_px: number
  dpi: number
  print_area: PrintArea
  safe_area: PrintArea
  meta: Record<string, any>
  created_at: string
  created_by?: string
  public_url?: string
}

// Database row type for conversion
interface DbGarmentTemplate {
  id: string
  category_id: string
  view: string
  color_slug: string
  storage_path: string
  width_px: number
  height_px: number
  dpi: number
  print_area: Json
  safe_area: Json
  meta: Json
  created_at: string
  created_by?: string
}

export interface GarmentTemplateWithCategory extends GarmentTemplateImage {
  category: GarmentCategory
}

export interface UploadTemplateData {
  categorySlug: string
  view: GarmentView
  colorSlug: string
  file: File
  widthPx: number
  heightPx: number
  dpi?: number
  printArea?: PrintArea
  safeArea?: PrintArea
  meta?: Record<string, any>
}

// Public read functions

/**
 * Get all garment categories
 */
export async function getGarmentCategories(): Promise<GarmentCategory[]> {
  const { data, error } = await supabase
    .from('garment_categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching garment categories:', error)
    throw new Error('Failed to fetch garment categories')
  }

  return data || []
}

/**
 * Get a single garment category by slug
 */
export async function getGarmentCategory(slug: string): Promise<GarmentCategory | null> {
  const { data, error } = await supabase
    .from('garment_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching garment category:', error)
    return null
  }

  return data
}

/**
 * Get all template images for a category
 */
export async function getTemplatesByCategory(categoryId: string): Promise<GarmentTemplateImage[]> {
  const { data, error } = await supabase
    .from('garment_template_images')
    .select('*')
    .eq('category_id', categoryId)
    .order('view, color_slug')

  if (error) {
    console.error('Error fetching templates by category:', error)
    throw new Error('Failed to fetch templates')
  }

  return data?.map(convertDbTemplate).map(addPublicUrl) || []
}

/**
 * Get template images by category slug
 */
export async function getTemplatesByCategorySlug(slug: string): Promise<GarmentTemplateImage[]> {
  const { data, error } = await supabase
    .from('garment_template_images')
    .select(`
      *,
      category:garment_categories(*)
    `)
    .eq('garment_categories.slug', slug)
    .order('view, color_slug')

  if (error) {
    console.error('Error fetching templates by category slug:', error)
    throw new Error('Failed to fetch templates')
  }

  return data?.map(item => convertDbTemplate(item)).map(addPublicUrl) || []
}

/**
 * Get a specific template image
 */
export async function getTemplate(
  categoryId: string, 
  view: GarmentView, 
  colorSlug: string = 'white'
): Promise<GarmentTemplateImage | null> {
  const { data, error } = await supabase
    .from('garment_template_images')
    .select('*')
    .eq('category_id', categoryId)
    .eq('view', view)
    .eq('color_slug', colorSlug)
    .single()

  if (error) {
    console.error('Error fetching template:', error)
    return null
  }

  return data ? addPublicUrl(convertDbTemplate(data)) : null
}

/**
 * Get template by category slug, view, and color
 */
export async function getTemplateBySlug(
  categorySlug: string,
  view: GarmentView,
  colorSlug: string = 'white'
): Promise<GarmentTemplateImage | null> {
  const { data, error } = await supabase
    .from('garment_template_images')
    .select(`
      *,
      category:garment_categories(*)
    `)
    .eq('garment_categories.slug', categorySlug)
    .eq('view', view)
    .eq('color_slug', colorSlug)
    .single()

  if (error) {
    console.error('Error fetching template by slug:', error)
    return null
  }

  return data ? addPublicUrl(convertDbTemplate(data)) : null
}

/**
 * Get all available colors for a category
 */
export async function getAvailableColors(categoryId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('garment_template_images')
    .select('color_slug')
    .eq('category_id', categoryId)

  if (error) {
    console.error('Error fetching available colors:', error)
    return []
  }

  const colors = [...new Set(data?.map(item => item.color_slug) || [])]
  return colors.sort()
}

/**
 * Get all available views for a category and color
 */
export async function getAvailableViews(
  categoryId: string, 
  colorSlug: string = 'white'
): Promise<GarmentView[]> {
  const { data, error } = await supabase
    .from('garment_template_images')
    .select('view')
    .eq('category_id', categoryId)
    .eq('color_slug', colorSlug)

  if (error) {
    console.error('Error fetching available views:', error)
    return []
  }

  return data?.map(item => item.view as GarmentView) || []
}

// Staff write functions (requires authentication)

/**
 * Upload a new garment template (staff only)
 */
export async function uploadGarmentTemplate(data: UploadTemplateData): Promise<GarmentTemplateImage> {
  // Convert file to base64
  const fileBuffer = await data.file.arrayBuffer()
  const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))

  const { data: response, error } = await supabase.functions.invoke('upload-garment-template', {
    body: {
      categorySlug: data.categorySlug,
      view: data.view,
      colorSlug: data.colorSlug,
      file: base64File,
      fileName: data.file.name,
      widthPx: data.widthPx,
      heightPx: data.heightPx,
      dpi: data.dpi,
      printArea: data.printArea,
      safeArea: data.safeArea,
      meta: data.meta
    }
  })

  if (error) {
    console.error('Error uploading template:', error)
    throw new Error('Failed to upload template')
  }

  if (!response.success) {
    throw new Error(response.error || 'Upload failed')
  }

  return response.template
}

/**
 * Create a new garment category (staff only)
 */
export async function createGarmentCategory(slug: string, name: string): Promise<GarmentCategory> {
  const { data, error } = await supabase
    .from('garment_categories')
    .insert({ slug, name })
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    throw new Error('Failed to create category')
  }

  return data
}

/**
 * Delete a garment template (staff only)
 */
export async function deleteGarmentTemplate(templateId: string): Promise<void> {
  // First get the template to know the storage path
  const { data: template, error: fetchError } = await supabase
    .from('garment_template_images')
    .select('storage_path')
    .eq('id', templateId)
    .single()

  if (fetchError) {
    console.error('Error fetching template for deletion:', fetchError)
    throw new Error('Template not found')
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('design-templates')
    .remove([template.storage_path])

  if (storageError) {
    console.error('Error deleting from storage:', storageError)
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('garment_template_images')
    .delete()
    .eq('id', templateId)

  if (dbError) {
    console.error('Error deleting template from database:', dbError)
    throw new Error('Failed to delete template')
  }
}

// Helper functions

/**
 * Convert database template to our interface
 */
function convertDbTemplate(dbTemplate: any): GarmentTemplateImage {
  return {
    id: dbTemplate.id,
    category_id: dbTemplate.category_id,
    view: dbTemplate.view as GarmentView,
    color_slug: dbTemplate.color_slug,
    storage_path: dbTemplate.storage_path,
    width_px: dbTemplate.width_px,
    height_px: dbTemplate.height_px,
    dpi: dbTemplate.dpi,
    print_area: dbTemplate.print_area as PrintArea,
    safe_area: dbTemplate.safe_area as PrintArea,
    meta: dbTemplate.meta as Record<string, any>,
    created_at: dbTemplate.created_at,
    created_by: dbTemplate.created_by
  }
}

/**
 * Add public URL to a template image
 */
function addPublicUrl(template: GarmentTemplateImage): GarmentTemplateImage {
  const { data } = supabase.storage
    .from('design-templates')
    .getPublicUrl(template.storage_path)

  return {
    ...template,
    public_url: data.publicUrl
  }
}

/**
 * Check if current user is staff
 */
export async function isUserStaff(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data, error } = await supabase
    .from('staff_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  return !error && !!data
}

/**
 * Cache for frequently accessed data
 */
class TemplateCache {
  private categories: GarmentCategory[] | null = null
  private categoryMap: Map<string, GarmentCategory> = new Map()
  private templates: Map<string, GarmentTemplateImage[]> = new Map()

  async getCategories(): Promise<GarmentCategory[]> {
    if (!this.categories) {
      this.categories = await getGarmentCategories()
      this.categories.forEach(cat => this.categoryMap.set(cat.slug, cat))
    }
    return this.categories
  }

  async getCategoryBySlug(slug: string): Promise<GarmentCategory | null> {
    await this.getCategories() // Ensure cache is populated
    return this.categoryMap.get(slug) || null
  }

  async getTemplatesByCategory(categoryId: string): Promise<GarmentTemplateImage[]> {
    if (!this.templates.has(categoryId)) {
      const templates = await getTemplatesByCategory(categoryId)
      this.templates.set(categoryId, templates)
    }
    return this.templates.get(categoryId) || []
  }

  clearCache(): void {
    this.categories = null
    this.categoryMap.clear()
    this.templates.clear()
  }
}

export const templateCache = new TemplateCache()