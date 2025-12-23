const { supabase } = require('../config/supabase');

// Temporary in-memory wishlist storage (until database is set up)
const tempWishlistStorage = new Map(); // userId -> wishlist items

const getWishlistItems = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    
    console.log('Getting wishlist items for user:', userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    // Use temporary in-memory storage
    const wishlistItems = tempWishlistStorage.get(userId) || [];
    
    res.json({ 
      success: true, 
      data: wishlistItems
    });
  } catch (error) {
    console.error('Error in getWishlistItems:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    const { product_id } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    if (!product_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
      });
    }

    // Get or create user's wishlist
    if (!tempWishlistStorage.has(userId)) {
      tempWishlistStorage.set(userId, []);
    }
    
    const wishlist = tempWishlistStorage.get(userId);
    
    // Check if product already exists in wishlist
    const existingItem = wishlist.find(item => item.id === product_id);
    
    if (existingItem) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product already in wishlist' 
      });
    }

    // Add new item to wishlist
    const newItem = {
      id: product_id,
      productId: product_id,
      name: 'Product ' + product_id,
      price: 0,
      image: '/placeholder.jpg',
      created_at: new Date().toISOString()
    };
    
    wishlist.push(newItem);
    
    res.json({ 
      success: true, 
      data: newItem,
      message: 'Item added to wishlist successfully' 
    });
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add item to wishlist' 
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    const { product_id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    if (!product_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
      });
    }

    const wishlist = tempWishlistStorage.get(userId) || [];
    const initialLength = wishlist.length;
    
    // Remove item from wishlist
    const updatedWishlist = wishlist.filter(item => item.id !== parseInt(product_id));
    tempWishlistStorage.set(userId, updatedWishlist);
    
    if (updatedWishlist.length === initialLength) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found in wishlist' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Item removed from wishlist successfully' 
    });
  } catch (error) {
    console.error('Error in removeFromWishlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove item from wishlist' 
    });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    const { product_id } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    if (!product_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
      });
    }

    // Get or create user's wishlist
    if (!tempWishlistStorage.has(userId)) {
      tempWishlistStorage.set(userId, []);
    }
    
    const wishlist = tempWishlistStorage.get(userId);
    const existingItem = wishlist.find(item => item.id === product_id);
    
    if (existingItem) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter(item => item.id !== product_id);
      tempWishlistStorage.set(userId, updatedWishlist);
      
      res.json({ 
        success: true, 
        message: 'Item removed from wishlist successfully' 
      });
    } else {
      // Add to wishlist
      const newItem = {
        id: product_id,
        productId: product_id,
        name: 'Product ' + product_id,
        price: 0,
        image: '/placeholder.jpg',
        created_at: new Date().toISOString()
      };
      
      wishlist.push(newItem);
      
      res.json({ 
        success: true, 
        data: newItem,
        message: 'Item added to wishlist successfully' 
      });
    }
  } catch (error) {
    console.error('Error in toggleWishlist:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to toggle wishlist item' 
    });
  }
};

module.exports = {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist
};
