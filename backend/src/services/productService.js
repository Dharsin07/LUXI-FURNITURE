const supabase = require('../config/supabase');

class ProductService {
  slugifyName(name) {
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async resolveCategoryId(categorySlugOrName) {
    if (!categorySlugOrName) return null;

    const slug = String(categorySlugOrName).trim().toLowerCase();
    const { data, error } = await supabase
      .from('categories')
      .select('id, slug, name')
      .or(`slug.eq.${slug},name.ilike.${slug}`)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to resolve category: ${error.message}`);
    }

    return data?.id || null;
  }

  async normalizeWritePayload(payload = {}, options = {}) {
    const next = { ...payload };
    const { generateSlug = true } = options;

    if (generateSlug && !next.slug && next.name) {
      next.slug = this.slugifyName(next.name);
    }

    if (!next.category_id && (next.category || next.categorySlug)) {
      const resolvedId = await this.resolveCategoryId(next.category || next.categorySlug);
      if (resolvedId) next.category_id = resolvedId;
    }

    if (typeof next.inStock === 'boolean') {
      next.stock = next.inStock ? 1 : 0;
    }

    delete next.category;
    delete next.categorySlug;
    delete next.inStock;

    return next;
  }

  // Get all products with filtering, sorting, and pagination
  async getProducts(filters = {}) {
    const {
      category,
      search,
      sort = 'name',
      order = 'asc',
      limit = 50,
      offset = 0,
      minPrice,
      maxPrice,
      featured,
      inStock
    } = filters;

    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          slug
        )
      `, { count: 'exact' });

    // Apply filters
    if (category) {
      query = query.eq('categories.slug', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (inStock === 'true') {
      query = query.gt('stock', 0);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return {
      products: data,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: count > parseInt(offset) + parseInt(limit)
      }
    };
  }

  // Get single product by ID
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          slug
        )
      `)
      .eq('id', parseInt(id))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Product not found');
      }
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  }

  // Create new product
  async createProduct(productData) {
    const writeData = await this.normalizeWritePayload(productData, { generateSlug: true });

    // Check if slug already exists
    const existingProduct = await this.getProductBySlug(writeData.slug);
    if (existingProduct) {
      throw new Error('Product with this slug already exists');
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...writeData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id');

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    const insertedId = Array.isArray(data) ? data[0]?.id : data?.id;
    if (!insertedId) {
      const err = new Error('Insert was blocked (likely RLS). Add SUPABASE_SERVICE_ROLE_KEY or disable RLS for products.');
      err.status = 403;
      throw err;
    }

    return await this.getProductById(insertedId);
  }

  // Update product
  async updateProduct(id, updateData) {
    // Check if product exists
    const existingProduct = await this.getProductById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    const writeData = await this.normalizeWritePayload(updateData, { generateSlug: false });

    // Check if new slug conflicts with existing products
    if (writeData.slug && writeData.slug !== existingProduct.slug) {
      const slugConflict = await this.getProductBySlug(writeData.slug);
      if (slugConflict) {
        throw new Error('Product with this slug already exists');
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        ...writeData,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id))
      .select('id');

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    const updatedId = Array.isArray(data) ? data[0]?.id : data?.id;
    if (!updatedId) {
      const err = new Error('Update was blocked (likely RLS). Add SUPABASE_SERVICE_ROLE_KEY or disable RLS for products.');
      err.status = 403;
      throw err;
    }

    return await this.getProductById(updatedId);
  }

  // Delete product
  async deleteProduct(id) {
    // Check if product exists
    const existingProduct = await this.getProductById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', parseInt(id))
      .select('id');

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    const deletedId = Array.isArray(data) ? data[0]?.id : data?.id;
    if (!deletedId) {
      const err = new Error('Delete was blocked (likely RLS). Add SUPABASE_SERVICE_ROLE_KEY or disable RLS for products.');
      err.status = 403;
      throw err;
    }

    return existingProduct;
  }

  // Get product by slug (helper method)
  async getProductBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check slug: ${error.message}`);
    }

    return data;
  }

  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data;
  }

  // Get featured products
  async getFeaturedProducts(limit = 10) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          slug
        )
      `)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch featured products: ${error.message}`);
    }

    return data;
  }

  // Search products
  async searchProducts(query, options = {}) {
    const { limit = 20, offset = 0 } = options;

    const { data, error, count } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          slug
        )
      `, { count: 'exact' })
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return {
      products: data,
      total: count,
      query
    };
  }

  // Update product stock
  async updateStock(id, quantity, operation = 'set') {
    const product = await this.getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    let newStock;
    if (operation === 'add') {
      newStock = product.stock + quantity;
    } else if (operation === 'subtract') {
      newStock = Math.max(0, product.stock - quantity);
    } else {
      newStock = quantity;
    }

    return await this.updateProduct(id, { stock: newStock });
  }
}

module.exports = new ProductService();
