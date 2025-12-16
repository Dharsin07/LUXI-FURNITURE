const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getFeaturedProducts,
  searchProducts,
  updateStock
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  createProductValidation,
  updateProductValidation,
  productIdValidation,
  productQueryValidation,
  handleValidationErrors
} = require('../validations/productValidation');

const adminGuards = process.env.NODE_ENV === 'production' ? [authenticateToken, requireAdmin] : [];

// GET /products - Fetch all stored products from database
// Query parameters: category, search, sort, order, limit, offset, minPrice, maxPrice, featured, inStock
router.get('/', productQueryValidation, handleValidationErrors, getProducts);

// GET /products/categories - Get product categories with counts from database
router.get('/categories', getCategories);

// GET /products/featured - Get featured products
router.get('/featured', getFeaturedProducts);

// GET /products/search - Search products
router.get('/search', searchProducts);

// GET /products/:id - Get a single stored product by ID
router.get('/:id', productIdValidation, handleValidationErrors, getProductById);

// POST /products - Add a product and store it permanently in database (admin-only)
// Request body: { name, slug, description, price, category_id, images, stock, featured, specifications, tags }
router.post('/', ...adminGuards, createProductValidation, handleValidationErrors, createProduct);

// PUT /products/:id - Update a stored product in database (admin-only)
// Request body: Any product fields to update
router.put('/:id', ...adminGuards, updateProductValidation, handleValidationErrors, updateProduct);

// DELETE /products/:id - Permanently delete a product from database (admin-only)
router.delete('/:id', ...adminGuards, productIdValidation, handleValidationErrors, deleteProduct);

// PUT /products/:id/stock - Update product stock (admin-only)
router.put('/:id/stock', ...adminGuards, productIdValidation, handleValidationErrors, updateStock);

module.exports = router;
