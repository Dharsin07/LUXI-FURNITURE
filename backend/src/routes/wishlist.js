const express = require('express');
const router = express.Router();
const {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist
} = require('../controllers/wishlistController');
// const { authenticateToken } = require('../middleware/auth'); // Temporarily disabled

// All wishlist routes require authentication (temporarily disabled)
// router.use(authenticateToken);

router.get('/', getWishlistItems);
router.post('/', addToWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/:product_id', removeFromWishlist);

module.exports = router;
