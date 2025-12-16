import { createClient } from '@supabase/supabase-js';

// Singleton Supabase client (no auth session handling here; auth is via Firebase)
let supabaseClient = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabaseClient;
};

export const supabase = getSupabaseClient();

// Profile helpers (sync Firebase user with Supabase profiles table)
export const upsertProfile = async (uid, email, name, role = 'user') => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: uid, name, role, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getProfile = async (uid) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', uid)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // ignore not found
  return data;
};

// Admin user management helpers
export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createProfile = async (email, name, role = 'user') => {
  // Generate a placeholder UID; in real admin flow, you’d invite via Firebase or create via custom auth
  const uid = `admin-${Date.now()}`;
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: uid, email, name, role, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (uid, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', uid)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProfile = async (uid) => {
  const { error } = await supabase.from('profiles').delete().eq('id', uid);
  if (error) throw error;
};

// =====================================================
// PRODUCT FUNCTIONS
// =====================================================
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:category_id (
        name,
        slug
      )
    `);
  if (error) throw error;
  return data;
};

export const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select(`
      *,
      categories:category_id (
        name,
        slug
      )
    `)
    .single();
  if (error) throw error;
  return data;
};

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      categories:category_id (
        name,
        slug
      )
    `)
    .single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// =====================================================
// CART FUNCTIONS
// =====================================================
export const getCartItems = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      products:product_id (
        id,
        name,
        price,
        images
      )
    `)
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const addToCart = async (userId, productId, quantity = 1) => {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert(
      {
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id,product_id',
        ignoreDuplicates: false
      }
    )
    .select(`
      *,
      products:product_id (
        id,
        name,
        price,
        images
      )
    `)
    .single();
  if (error) throw error;
  return data;
};

export const updateCartItemQuantity = async (userId, productId, quantity) => {
  if (quantity <= 0) {
    return removeFromCart(userId, productId);
  }
  
  const { data, error } = await supabase
    .from('cart_items')
    .update({ 
      quantity: quantity,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('product_id', productId)
    .select(`
      *,
      products:product_id (
        id,
        name,
        price,
        images
      )
    `)
    .single();
  if (error) throw error;
  return data;
};

export const removeFromCart = async (userId, productId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
};

export const clearCart = async (userId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
};

// =====================================================
// WISHLIST FUNCTIONS
// =====================================================
export const getWishlistItems = async (userId) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      *,
      products:product_id (
        id,
        name,
        price,
        images
      )
    `)
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const toggleWishlist = async (userId, productId) => {
  // Check if item exists
  const { data: existing, error: checkError } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle(); // Use maybeSingle() instead of single()

  if (existing) {
    // Remove from wishlist
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
    return { action: 'removed' };
  } else {
    // Add to wishlist
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        product_id: productId
      })
      .select(`
        *,
        products:product_id (
          id,
          name,
          price,
          images
        )
      `)
      .single();
    if (error) throw error;
    return { action: 'added', data };
  }
};

// =====================================================
// REVIEWS FUNCTIONS
// =====================================================
export const getReviewsByProduct = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:user_id (
        name
      )
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const submitReview = async (userId, productId, rating, comment) => {
  const { data, error } = await supabase
    .from('reviews')
    .upsert(
      {
        user_id: userId,
        product_id: productId,
        rating: rating,
        comment: comment,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'product_id,user_id'
      }
    )
    .select(`
      *,
      profiles:user_id (
        name
      )
    `)
    .single();
  if (error) throw error;
  return data;
};

// =====================================================
// USER PREFERENCES FUNCTIONS
// =====================================================
export const getUserPreference = async (userId, key) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('value')
    .eq('user_id', userId)
    .eq('key', key)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.value || null;
};

export const setUserPreference = async (userId, key, value) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        key: key,
        value: value,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id,key'
      }
    )
    .select('value')
    .single();
  if (error) throw error;
  return data.value;
};

// =====================================================
// RECENTLY VIEWED FUNCTIONS
// =====================================================
export const getRecentlyViewed = async (userId, limit = 30) => {
  const { data, error } = await supabase
    .from('recently_viewed')
    .select(`
      *,
      products:product_id (
        id,
        name,
        price,
        images
      )
    `)
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const addToRecentlyViewed = async (userId, productId) => {
  const { data, error } = await supabase
    .from('recently_viewed')
    .upsert(
      {
        user_id: userId,
        product_id: productId,
        viewed_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id,product_id'
      }
    )
    .select(`
      *,
      products:product_id (
        id,
        name,
        price,
        images
      )
    `)
    .single();
  if (error) throw error;
  return data;
};

// =====================================================
// PAYMENT METHODS FUNCTIONS
// =====================================================
export const getPaymentMethods = async (userId) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const addPaymentMethod = async (userId, paymentData) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: userId,
      ...paymentData
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

// =====================================================
// RETURNS FUNCTIONS
// =====================================================
export const getReturns = async (userId) => {
  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      orders:order_id (
        id,
        total,
        status,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createReturn = async (userId, orderId, reason) => {
  const { data, error } = await supabase
    .from('returns')
    .insert({
      user_id: userId,
      order_id: orderId,
      reason: reason
    })
    .select(`
      *,
      orders:order_id (
        id,
        total,
        status
      )
    `)
    .single();
  if (error) throw error;
  return data;
};

