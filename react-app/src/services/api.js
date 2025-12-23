// Clean API service for Express backend integration
const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('firebaseToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (_) {
        errorData = {};
      }

      let message = errorData?.message || errorData?.error;

      if (!message && Array.isArray(errorData?.details) && errorData.details.length > 0) {
        message = errorData.details
          .map((d) => d?.message)
          .filter(Boolean)
          .join(', ');
      }

      if (!message) {
        message = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Authentication API - uses backend auth.js
export const authAPI = {
  verifyToken: (token) => apiCall('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token })
  }),
  
  refreshToken: (token) => apiCall('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ token })
  })
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products${queryString ? `?${queryString}` : ''}`).then((res) => res?.data ?? res);
  },
  
  getProductById: (id) => apiCall(`/products/${id}`).then((res) => res?.data ?? res),
  
  getCategories: () => apiCall('/products/categories').then((res) => res?.data ?? res),
  
  createProduct: (productData) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  }).then((res) => res?.data ?? res),
  
  updateProduct: (id, productData) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  }).then((res) => res?.data ?? res),
  
  deleteProduct: (id) => apiCall(`/products/${id}`, {
    method: 'DELETE'
  }).then((res) => res?.data ?? res)
};

// Cart API
export const cartAPI = {
  getCartItems: () => apiCall('/cart'),
  
  getCartSummary: () => apiCall('/cart/summary'),
  
  addToCart: (productId, quantity = 1) => apiCall('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  }),
  
  updateCartItemQuantity: (productId, quantity) => apiCall(`/cart/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  }),
  
  removeFromCart: (productId) => apiCall(`/cart/${productId}`, {
    method: 'DELETE'
  }),
  
  clearCart: () => apiCall('/cart', {
    method: 'DELETE'
  })
};

// Wishlist API
export const wishlistAPI = {
  getWishlistItems: () => apiCall('/wishlist'),
  
  addToWishlist: (productId) => apiCall('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId })
  }),
  
  removeFromWishlist: (productId) => apiCall(`/wishlist/${productId}`, {
    method: 'DELETE'
  }),
  
  toggleWishlist: (productId) => apiCall('/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId })
  }),
  
  checkWishlistStatus: (productId) => apiCall(`/wishlist/check/${productId}`),
  
  moveAllToCart: () => apiCall('/wishlist/move-to-cart', {
    method: 'POST'
  }),
  
  clearWishlist: () => apiCall('/wishlist', {
    method: 'DELETE'
  })
};

// Orders API
export const ordersAPI = {
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  getOrderById: (id) => apiCall(`/orders/${id}`),
  
  createOrder: (orderData) => apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  
  updateOrderStatus: (id, status) => apiCall(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  
  cancelOrder: (id) => apiCall(`/orders/${id}/cancel`, {
    method: 'DELETE'
  }),
  
  getOrderStats: () => apiCall('/orders/stats')
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => apiCall('/admin/dashboard'),
  
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  
  getAllOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  updateUserRole: (userId, role) => apiCall(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  }),
  
  getSalesAnalytics: (period = '30') => apiCall(`/admin/analytics/sales?period=${period}`),
  
  getInventoryReport: (lowStock = '5') => apiCall(`/admin/inventory?low_stock=${lowStock}`)
};

// Export all APIs
export default {
  auth: authAPI,
  products: productsAPI,
  cart: cartAPI,
  wishlist: wishlistAPI,
  orders: ordersAPI,
  admin: adminAPI
};
