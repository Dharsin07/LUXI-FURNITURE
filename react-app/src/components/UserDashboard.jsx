import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI, cartAPI, wishlistAPI } from '../services/api';
import './UserDashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch all user data in parallel
      const [ordersRes, cartRes, wishlistRes] = await Promise.all([
        ordersAPI.getOrders(),
        cartAPI.getCartItems(),
        wishlistAPI.getWishlistItems()
      ]);

      setOrders(ordersRes?.data || []);
      setCartItems(cartRes?.data || []);
      setWishlistItems(wishlistRes?.data || []);
      
      // Get recent views from localStorage
      const views = JSON.parse(localStorage.getItem('recentViews') || '[]');
      setRecentViews(views);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f39c12',
      'confirmed': '#3498db',
      'shipped': '#9b59b6',
      'delivered': '#27ae60',
      'cancelled': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Manage your orders, cart, wishlist and more</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({orders.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          Cart ({cartItems.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          Wishlist ({wishlistItems.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recent Views ({recentViews.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>You haven't placed any orders yet.</p>
                <Link to="/products" className="btn btn-primary">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Order #{order.id}</h3>
                        <p className="order-date">{formatDate(order.created_at)}</p>
                      </div>
                      <span
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="order-items">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="order-item">
                          <img src={item.image} alt={item.name} />
                          <div>
                            <p>{item.name}</p>
                            <p>Qty: {item.quantity}</p>
                          </div>
                          <p className="item-price">${item.price}</p>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className="more-items">+{order.items.length - 3} more items</p>
                      )}
                    </div>
                    <div className="order-footer">
                      <p className="order-total">Total: ${order.total_amount}</p>
                      <Link to={`/orders/${order.id}`} className="btn btn-outline">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="cart-section">
            <h2>Shopping Cart</h2>
            {cartItems.length === 0 ? (
              <div className="empty-state">
                <p>Your cart is empty.</p>
                <Link to="/products" className="btn btn-primary">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p>Price: ${item.price}</p>
                      <div className="quantity-controls">
                        <button>-</button>
                        <span>{item.quantity}</span>
                        <button>+</button>
                      </div>
                    </div>
                    <div className="item-actions">
                      <p className="item-total">${item.price * item.quantity}</p>
                      <button className="btn-remove">Remove</button>
                    </div>
                  </div>
                ))}
                <div className="cart-summary">
                  <h3>Cart Summary</h3>
                  <p>Subtotal: ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</p>
                  <Link to="/checkout" className="btn btn-primary">
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="wishlist-section">
            <h2>My Wishlist</h2>
            {wishlistItems.length === 0 ? (
              <div className="empty-state">
                <p>Your wishlist is empty.</p>
                <Link to="/products" className="btn btn-primary">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="wishlist-item">
                    <img src={item.image} alt={item.name} />
                    <div className="wishlist-content">
                      <h3>{item.name}</h3>
                      <p className="price">${item.price}</p>
                      <div className="wishlist-actions">
                        <button className="btn btn-primary">Add to Cart</button>
                        <button className="btn btn-outline">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="recent-section">
            <h2>Recently Viewed</h2>
            {recentViews.length === 0 ? (
              <div className="empty-state">
                <p>You haven't viewed any products yet.</p>
                <Link to="/products" className="btn btn-primary">
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="recent-grid">
                {recentViews.map((item, index) => (
                  <div key={index} className="recent-item">
                    <img src={item.image} alt={item.name} />
                    <div className="recent-content">
                      <h3>{item.name}</h3>
                      <p className="price">${item.price}</p>
                      <Link to={`/products/${item.id}`} className="btn btn-outline">
                        View Product
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
