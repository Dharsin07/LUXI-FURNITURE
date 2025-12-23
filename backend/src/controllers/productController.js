const productService = require('../services/productService');
const {
  createProductValidation,
  updateProductValidation,
  productIdValidation,
  productQueryValidation,
  handleValidationErrors
} = require('../validations/productValidation');

const normalizeProduct = (product) => {
  if (!product) return product;
  const category = product.categories?.slug || product.category?.slug || 'uncategorized';
  const inStock = typeof product.stock === 'boolean' ? product.stock : product.stock > 0;

  return {
    ...product,
    category,
    inStock,
  };
};

// GET /products - Fetch all products
const getProducts = async (req, res) => {
  try {
    const result = await productService.getProducts(req.query);
    
    res.json({
      success: true,
      data: (result.products || []).map(normalizeProduct),
      pagination: result.pagination,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getProducts controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
};

// GET /products/:id - Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    
    res.json({
      success: true,
      data: normalizeProduct(product),
      message: 'Product retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getProductById controller:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
};

// POST /products - Create new product
const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    
    res.status(201).json({
      success: true,
      data: normalizeProduct(product),
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error in createProduct controller:', error);
    
    if (error.message === 'Product with this slug already exists') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: error.message
      });
    }

    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    });
  }
};

// PUT /products/:id - Update product
const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    
    res.json({
      success: true,
      data: normalizeProduct(product),
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error in updateProduct controller:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: error.message
      });
    }
    
    if (error.message === 'Product with this slug already exists') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: error.message
      });
    }

    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    });
  }
};

// DELETE /products/:id - Delete product
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await productService.deleteProduct(req.params.id);
    
    res.json({
      success: true,
      data: normalizeProduct(deletedProduct),
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProduct controller:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: error.message
      });
    }

    const status = error.status || 500;
    res.status(status).json({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    });
  }
};

// GET /products/categories - Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await productService.getCategories();
    
    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getCategories controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
};

// GET /products/featured - Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await productService.getFeaturedProducts(limit);
    
    res.json({
      success: true,
      data: products,
      message: 'Featured products retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getFeaturedProducts controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured products',
      message: error.message
    });
  }
};

// GET /products/search - Search products
const searchProducts = async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        message: 'Please provide a search query'
      });
    }
    
    const options = {
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };
    
    const result = await productService.searchProducts(query, options);
    
    res.json({
      success: true,
      data: result.products,
      pagination: {
        total: result.total,
        limit: options.limit,
        offset: options.offset
      },
      query: result.query,
      message: 'Products searched successfully'
    });
  } catch (error) {
    console.error('Error in searchProducts controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search products',
      message: error.message
    });
  }
};

// PUT /products/:id/stock - Update product stock
const updateStock = async (req, res) => {
  try {
    const { quantity, operation = 'set' } = req.body;
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity',
        message: 'Quantity must be a non-negative number'
      });
    }
    
    const product = await productService.updateStock(req.params.id, quantity, operation);
    
    res.json({
      success: true,
      data: product,
      message: 'Product stock updated successfully'
    });
  } catch (error) {
    console.error('Error in updateStock controller:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update product stock',
      message: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getFeaturedProducts,
  searchProducts,
  updateStock
};
