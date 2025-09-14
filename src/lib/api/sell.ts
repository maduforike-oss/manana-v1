import { supabase } from '@/integrations/supabase/client';

export interface CreateProductPayload {
  name: string;
  description?: string;
  base_price: number;
  status: 'active' | 'draft';
  category_id?: string;
  variants: Array<{
    size: string;
    color: string;
    price?: number;
    stock_quantity: number;
  }>;
  images: File[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string;
}

export async function createProduct(payload: CreateProductPayload) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  // Generate slug from name
  const slug = payload.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check slug uniqueness
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  const finalSlug = existingProduct ? `${slug}-${Date.now()}` : slug;

  // Create product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      name: payload.name,
      description: payload.description,
      base_price: payload.base_price,
      status: payload.status,
      category_id: payload.category_id,
      slug: finalSlug,
      owner_id: user.user.id, // Add owner_id for RLS
    })
    .select()
    .single();

  if (productError) throw productError;

  // Upload images and create image records
  const imagePromises = payload.images.map(async (file, index) => {
    const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    const filePath = `product-images/${product.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('design-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('design-assets')
      .getPublicUrl(filePath);

    return {
      product_id: product.id,
      url: publicUrl,
      display_order: index,
      alt_text: `${payload.name} - Image ${index + 1}`,
    };
  });

  const imageData = await Promise.all(imagePromises);

  // Insert images
  const { error: imagesError } = await supabase
    .from('product_images')
    .insert(imageData);

  if (imagesError) throw imagesError;

  // Create variants
  const variantData = payload.variants.map(variant => ({
    product_id: product.id,
    size: variant.size,
    color: variant.color,
    price: variant.price || payload.base_price,
    stock_quantity: variant.stock_quantity,
    sku: `${finalSlug}-${variant.size}-${variant.color}`.toUpperCase(),
  }));

  const { error: variantsError } = await supabase
    .from('product_variants')
    .insert(variantData);

  if (variantsError) throw variantsError;

  return product;
}

export async function updateProduct(payload: UpdateProductPayload) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  // Check ownership (if we had an owner_id field)
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('id', payload.id)
    .single();

  if (!product) throw new Error('Product not found');

  // Update product
  const { data: updatedProduct, error: updateError } = await supabase
    .from('products')
    .update({
      name: payload.name,
      description: payload.description,
      base_price: payload.base_price,
      status: payload.status,
      category_id: payload.category_id,
    })
    .eq('id', payload.id)
    .select()
    .single();

  if (updateError) throw updateError;

  // Handle new images if provided
  if (payload.images && payload.images.length > 0) {
    const imagePromises = payload.images.map(async (file, index) => {
      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      const filePath = `product-images/${payload.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('design-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-assets')
        .getPublicUrl(filePath);

      return {
        product_id: payload.id,
        url: publicUrl,
        display_order: index,
        alt_text: `${payload.name} - Image ${index + 1}`,
      };
    });

    const imageData = await Promise.all(imagePromises);

    const { error: imagesError } = await supabase
      .from('product_images')
      .insert(imageData);

    if (imagesError) throw imagesError;
  }

  return updatedProduct;
}

export async function uploadProductImage(file: File, productId: string) {
  const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
  const filePath = `product-images/${productId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('design-assets')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('design-assets')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function reorderImages(productId: string, imageOrder: string[]) {
  const updatePromises = imageOrder.map((imageId, index) =>
    supabase
      .from('product_images')
      .update({ display_order: index })
      .eq('id', imageId)
      .eq('product_id', productId)
  );

  await Promise.all(updatePromises);
}

export async function deleteProductImage(imageId: string) {
  // Get image details first
  const { data: image } = await supabase
    .from('product_images')
    .select('url')
    .eq('id', imageId)
    .single();

  if (image) {
    // Extract file path from URL
    const urlParts = image.url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const productId = urlParts[urlParts.length - 2];
    const filePath = `product-images/${productId}/${fileName}`;

    // Delete from storage
    await supabase.storage
      .from('design-assets')
      .remove([filePath]);
  }

  // Delete from database
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  if (error) throw error;
}

export async function checkSlugAvailability(slug: string, excludeId?: string) {
  let query = supabase
    .from('products')
    .select('id')
    .eq('slug', slug);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data } = await query.maybeSingle();
  return !data; // Return true if available (no existing product found)
}