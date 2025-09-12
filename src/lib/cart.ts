import { supabase } from '@/integrations/supabase/client';

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  added_at: string;
  variant?: ProductVariant;
  product_name?: string;
  product_image?: string;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  total_items: number;
  total_amount: number;
}

// Generate session ID for guest users
export function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create session ID
export function getSessionId(): string {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

// Get current cart
export async function getCart(): Promise<Cart | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let cartQuery = supabase
      .from('carts')
      .select(`
        id,
        user_id,
        session_id,
        cart_items (
          id,
          product_id,
          variant_id,
          quantity,
          added_at,
          product_variants (
            id,
            product_id,
            size,
            color,
            price,
            stock_quantity,
            image_url
          )
        )
      `);

    if (user) {
      cartQuery = cartQuery.eq('user_id', user.id);
    } else {
      const sessionId = getSessionId();
      cartQuery = cartQuery.eq('session_id', sessionId);
    }

    const { data: carts, error } = await cartQuery.maybeSingle();

    if (error) {
      console.error('Error fetching cart:', error);
      return null;
    }

    if (!carts) {
      return {
        id: '',
        items: [],
        total_items: 0,
        total_amount: 0
      };
    }

    const items = carts.cart_items?.map((item: any) => ({
      id: item.id,
      cart_id: carts.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      added_at: item.added_at,
      variant: item.product_variants,
      product_name: `${item.product_variants?.product_id} - ${item.product_variants?.color} - ${item.product_variants?.size}`,
      product_image: item.product_variants?.image_url
    })) || [];

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0);

    return {
      id: carts.id,
      user_id: carts.user_id,
      session_id: carts.session_id,
      items,
      total_items: totalItems,
      total_amount: totalAmount
    };
  } catch (error) {
    console.error('Error getting cart:', error);
    return null;
  }
}

// Create or get cart
export async function getOrCreateCart(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let cartQuery = supabase.from('carts').select('id');

    if (user) {
      cartQuery = cartQuery.eq('user_id', user.id);
    } else {
      const sessionId = getSessionId();
      cartQuery = cartQuery.eq('session_id', sessionId);
    }

    const { data: existingCart } = await cartQuery.maybeSingle();

    if (existingCart) {
      return existingCart.id;
    }

    // Create new cart
    const cartData = user 
      ? { user_id: user.id }
      : { session_id: getSessionId() };

    const { data: newCart, error } = await supabase
      .from('carts')
      .insert(cartData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating cart:', error);
      return null;
    }

    return newCart.id;
  } catch (error) {
    console.error('Error getting or creating cart:', error);
    return null;
  }
}

// Add item to cart
export async function addToCart(variantId: string, quantity: number = 1): Promise<boolean> {
  try {
    const cartId = await getOrCreateCart();
    if (!cartId) return false;

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('variant_id', variantId)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (error) {
        console.error('Error updating cart item:', error);
        return false;
      }
    } else {
      // Get variant to extract product_id
      const { data: variant } = await supabase
        .from('product_variants')
        .select('product_id')
        .eq('id', variantId)
        .single();

      if (!variant) return false;

      // Add new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: variant.product_id,
          variant_id: variantId,
          quantity
        });

      if (error) {
        console.error('Error adding cart item:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return false;
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<boolean> {
  try {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating cart item quantity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return false;
  }
}

// Remove item from cart
export async function removeFromCart(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing cart item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing cart item:', error);
    return false;
  }
}

// Clear entire cart
export async function clearCart(): Promise<boolean> {
  try {
    const cart = await getCart();
    if (!cart?.id) return true;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (error) {
      console.error('Error clearing cart:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
}

// Get product variants
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .gt('stock_quantity', 0)
      .order('size', { ascending: true });

    if (error) {
      console.error('Error fetching variants:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching variants:', error);
    return [];
  }
}

// Check stock availability
export async function checkStock(variantId: string, quantity: number): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variantId)
      .single();

    return (data?.stock_quantity || 0) >= quantity;
  } catch (error) {
    console.error('Error checking stock:', error);
    return false;
  }
}

// Merge guest cart with user cart on login
export async function mergeGuestCartWithUserCart(userId: string): Promise<boolean> {
  try {
    const sessionId = getSessionId();
    
    // Get guest cart
    const { data: guestCart } = await supabase
      .from('carts')
      .select(`
        id,
        cart_items (
          product_id,
          variant_id,
          quantity
        )
      `)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!guestCart?.cart_items?.length) return true;

    // Get or create user cart
    let { data: userCart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!userCart) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
      userCart = newCart;
    }

    if (!userCart) return false;

    // Merge items
    for (const item of guestCart.cart_items) {
      // Check if item already exists in user cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', userCart.id)
        .eq('variant_id', item.variant_id)
        .maybeSingle();

      if (existingItem) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + item.quantity })
          .eq('id', existingItem.id);
      } else {
        // Add new item
        await supabase
          .from('cart_items')
          .insert({
            cart_id: userCart.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity
          });
      }
    }

    // Delete guest cart
    await supabase
      .from('carts')
      .delete()
      .eq('id', guestCart.id);

    // Clear session ID
    localStorage.removeItem('cart_session_id');

    return true;
  } catch (error) {
    console.error('Error merging carts:', error);
    return false;
  }
}