const { supabase } = require('../config/supabase');

// Temporary in-memory cart storage (until database is set up)
const tempCartStorage = new Map(); // userId -> cart items

// Get cart items for a user
const getCartItems = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    
    console.log('Getting cart items for user:', userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    // Use temporary in-memory storage
    const cartItems = tempCartStorage.get(userId) || [];
    
    res.json({ 
      success: true, 
      data: { 
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0),
        count: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error('Error in getCartItems:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error - Please run the SQL script in Supabase Dashboard',
      details: error.message 
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    const { productId, quantity = 1 } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
      });
    }

    // Get or create user's cart
    if (!tempCartStorage.has(userId)) {
      tempCartStorage.set(userId, []);
    }
    
    const cart = tempCartStorage.get(userId);
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.push({
        id: `temp-${Date.now()}`,
        productId: productId,
        quantity: quantity,
        price: 0, // Will be updated when we have product info
        name: 'Product ' + productId,
        image: '/placeholder.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    const addedItem = cart.find(item => item.productId === productId);
    
    res.json({ 
      success: true, 
      data: addedItem,
      message: 'Item added to cart successfully' 
    });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add item to cart' 
    });
  }
};

// Update cart item quantity
const updateCartItemQuantity = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    const { product_id: productId } = req.params;
    const { quantity } = req.body;
    
    console.log('Update quantity - productId:', productId);
    console.log('Update quantity - quantity:', quantity);
    console.log('Update quantity - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    console.log('Validation check - productId:', productId, 'quantity:', quantity);
    if (!productId || !quantity || quantity < 1) {
      console.log('Validation failed - productId:', productId, 'quantity:', quantity);
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID and valid quantity are required' 
      });
    }

    // Use temporary in-memory storage
    const cart = tempCartStorage.get(userId) || [];
    console.log('Cart before update:', cart);
    
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart item not found' 
      });
    }
    
    // Update quantity
    cart[itemIndex].quantity = quantity;
    cart[itemIndex].updated_at = new Date().toISOString();
    
    tempCartStorage.set(userId, cart);
    console.log('Cart after update:', cart);

    res.json({ 
      success: true, 
      data: cart[itemIndex],
      message: 'Cart item updated successfully' 
    });
  } catch (error) {
    console.error('Error in updateCartItemQuantity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update cart item' 
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    const productId = req.params.product_id;
    
    console.log('Remove from cart - req.params:', req.params);
    console.log('Remove from cart - productId:', productId);
    console.log('Remove from cart - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
      });
    }

    // Use temporary in-memory storage
    const cart = tempCartStorage.get(userId) || [];
    console.log('Cart before removal:', cart);
    console.log('Filtering by productId:', productId);
    
    const updatedCart = cart.filter(item => item.productId !== productId);
    console.log('Cart after removal:', updatedCart);
    
    tempCartStorage.set(userId, updatedCart);

    res.json({ 
      success: true, 
      message: 'Item removed from cart successfully' 
    });
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove item from cart' 
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    
    console.log('Clear cart - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    // Use temporary in-memory storage
    const cart = tempCartStorage.get(userId) || [];
    console.log('Cart before clear:', cart);
    tempCartStorage.set(userId, []);
    console.log('Cart after clear: []');

    res.json({ 
      success: true, 
      message: 'Cart cleared successfully' 
    });
  } catch (error) {
    console.error('Error in clearCart:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear cart' 
    });
  }
};

// Get cart summary
const getCartSummary = async (req, res) => {
  try {
    // Temporarily use a fixed user ID for testing (remove this when authentication is implemented)
    const userId = req.user?.uid || req.user?.id || 'test-user-id';
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        products:product_id (
          price
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart summary:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch cart summary' 
      });
    }

    const total = data.reduce((sum, item) => sum + (item.quantity * (item.products?.price || 0)), 0);
    const itemCount = data.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ 
      success: true, 
      data: { 
        total: total,
        items: itemCount,
        formatted: `$${total.toFixed(2)}`
      }
    });
  } catch (error) {
    console.error('Error in getCartSummary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch cart summary' 
    });
  }
};

module.exports = {
  getCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartSummary
};
