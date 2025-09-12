import { supabase } from '@/integrations/supabase/client';

export interface InventoryMovement {
  id: string;
  variant_id: string;
  movement_type: 'add' | 'remove' | 'order' | 'cancel' | 'adjust';
  quantity: number;
  reason?: string;
  created_at: string;
}

export interface StockLevel {
  variant_id: string;
  current_stock: number;
  reserved_stock?: number;
  available_stock: number;
}

export interface StockAlert {
  id: string;
  variant_id: string;
  threshold: number;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

// Get current stock level for a variant
export async function getStock(variantId: string): Promise<StockLevel | null> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('id, stock_quantity')
      .eq('id', variantId)
      .single();

    if (error) {
      console.error('Error fetching stock:', error);
      throw new Error(`Failed to fetch stock: ${error.message}`);
    }

    if (!data) return null;

    return {
      variant_id: data.id,
      current_stock: data.stock_quantity,
      available_stock: data.stock_quantity // TODO: Calculate reserved stock
    };
  } catch (error) {
    console.error('Error in getStock:', error);
    throw error;
  }
}

// Record an inventory movement
export async function recordMovement(
  variantId: string,
  movement: {
    movement_type: 'add' | 'remove' | 'order' | 'cancel' | 'adjust';
    quantity: number;
    reason?: string;
  }
): Promise<InventoryMovement> {
  try {
    // Start a transaction to update stock and record movement
    const { data: currentVariant, error: fetchError } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variantId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch current stock: ${fetchError.message}`);
    }

    // Calculate new stock quantity
    let newQuantity = currentVariant.stock_quantity;
    switch (movement.movement_type) {
      case 'add':
      case 'cancel':
        newQuantity += movement.quantity;
        break;
      case 'remove':
      case 'order':
        newQuantity -= movement.quantity;
        break;
      case 'adjust':
        newQuantity = movement.quantity; // Set to exact quantity
        break;
    }

    // Ensure stock doesn't go negative
    if (newQuantity < 0) {
      throw new Error('Insufficient stock for this operation');
    }

    // Update stock quantity
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock_quantity: newQuantity })
      .eq('id', variantId);

    if (updateError) {
      throw new Error(`Failed to update stock: ${updateError.message}`);
    }

    // Record the movement
    const { data: movementData, error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        variant_id: variantId,
        movement_type: movement.movement_type,
        quantity: movement.quantity,
        reason: movement.reason
      })
      .select()
      .single();

    if (movementError) {
      throw new Error(`Failed to record movement: ${movementError.message}`);
    }

    return {
      id: movementData.id,
      variant_id: movementData.variant_id,
      movement_type: movementData.movement_type as InventoryMovement["movement_type"],
      quantity: movementData.quantity,
      reason: movementData.reason,
      created_at: movementData.created_at
    };
  } catch (error) {
    console.error('Error in recordMovement:', error);
    throw error;
  }
}

// Get inventory movements for a variant
export async function getMovements(
  variantId: string,
  limit: number = 50,
  offset: number = 0
): Promise<InventoryMovement[]> {
  try {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('variant_id', variantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching movements:', error);
      throw new Error(`Failed to fetch movements: ${error.message}`);
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      variant_id: m.variant_id,
      movement_type: m.movement_type as InventoryMovement["movement_type"],
      quantity: m.quantity,
      reason: m.reason,
      created_at: m.created_at
    }));
  } catch (error) {
    console.error('Error in getMovements:', error);
    throw error;
  }
}

// Check if stock is available for a quantity
export async function checkStockAvailability(variantId: string, quantity: number): Promise<boolean> {
  try {
    const stock = await getStock(variantId);
    return stock ? stock.available_stock >= quantity : false;
  } catch (error) {
    console.error('Error in checkStockAvailability:', error);
    return false;
  }
}

// Get low stock alerts
export async function getLowStockAlerts(): Promise<(StockAlert & { 
  product_name: string; 
  sku: string; 
  current_stock: number; 
})[]> {
  try {
    const { data, error } = await supabase
      .from('stock_alerts')
      .select(`
        *,
        product_variants (
          sku,
          stock_quantity,
          products (
            name
          )
        )
      `)
      .eq('notification_sent', false);

    if (error) {
      console.error('Error fetching stock alerts:', error);
      throw new Error(`Failed to fetch stock alerts: ${error.message}`);
    }

    return data?.map((alert: any) => ({
      ...alert,
      product_name: alert.product_variants?.products?.name || 'Unknown Product',
      sku: alert.product_variants?.sku || 'Unknown SKU',
      current_stock: alert.product_variants?.stock_quantity || 0
    })) || [];
  } catch (error) {
    console.error('Error in getLowStockAlerts:', error);
    throw error;
  }
}

// Create stock alert for a variant
export async function createStockAlert(variantId: string, threshold: number): Promise<StockAlert> {
  try {
    const { data, error } = await supabase
      .from('stock_alerts')
      .insert({
        variant_id: variantId,
        threshold,
        notification_sent: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating stock alert:', error);
      throw new Error(`Failed to create stock alert: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createStockAlert:', error);
    throw error;
  }
}

// Mark stock alert as sent
export async function markAlertSent(alertId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('stock_alerts')
      .update({ notification_sent: true })
      .eq('id', alertId);

    if (error) {
      console.error('Error marking alert as sent:', error);
      throw new Error(`Failed to mark alert as sent: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in markAlertSent:', error);
    throw error;
  }
}

// Get stock summary for multiple variants
export async function getStockSummary(variantIds: string[]): Promise<StockLevel[]> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('id, stock_quantity')
      .in('id', variantIds);

    if (error) {
      console.error('Error fetching stock summary:', error);
      throw new Error(`Failed to fetch stock summary: ${error.message}`);
    }

    return data?.map(variant => ({
      variant_id: variant.id,
      current_stock: variant.stock_quantity,
      available_stock: variant.stock_quantity
    })) || [];
  } catch (error) {
    console.error('Error in getStockSummary:', error);
    throw error;
  }
}