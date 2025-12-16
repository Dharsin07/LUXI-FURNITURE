import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import './App.css';
import './styles/variables.css';
import FlyToIcon from './components/FlyToIcon';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { scrollToSection } from './utils/helpers';
import { useOptimisticCart } from './hooks/useOptimisticCart';
import { useDataPreloader } from './hooks/useDataPreloader';
import { productsAPI } from './services/api';
import { supabase, 
  getCartItems, 
  addToCart as addToCartDB, 
  updateCartItemQuantity as updateCartItemQuantityDB,
  removeFromCart as removeFromCartDB,
  clearCart as clearCartDB,
  getWishlistItems,
  toggleWishlist as toggleWishlistDB,
  getReviewsByProduct,
  submitReview as submitReviewDB,
  addToRecentlyViewed,
  getUserPreference,
  setUserPreference
} from './lib/supabase';
import { useSearch } from './hooks/useSearch';

// Lazy load components for code splitting
const Header = lazy(() => import('./components/Header'));
const Shop = lazy(() => import('./pages/Shop'));
const Home = lazy(() => import('./pages/Home'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Orders = lazy(() => import('./pages/Orders'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const Addresses = lazy(() => import('./pages/Addresses'));
const Payments = lazy(() => import('./pages/Payments'));
const RecentlyViewed = lazy(() => import('./pages/RecentlyViewed'));
const CartPage = lazy(() => import('./pages/CartPage'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Returns = lazy(() => import('./pages/Returns'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ReviewModal = lazy(() => import('./components/ReviewModal'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const Footer = lazy(() => import('./components/Footer'));
const CartSidebar = lazy(() => import('./components/CartSidebar'));
const ProductModal = lazy(() => import('./components/ProductModal'));
const Wishlist = lazy(() => import('./components/Wishlist'));
const Checkout = lazy(() => import('./components/Checkout'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const ScrollToTop = lazy(() => import('./components/ScrollToTop'));
const Loading = lazy(() => import('./components/Loading'));
const SkeletonLoader = lazy(() => import('./components/SkeletonLoader'));
import './components/SkeletonLoader.css';

function App() {
  // notifications are now shown using react-toastify (toast.*).
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Loading state for full-page animation
  const [isLoading, setIsLoading] = useState(true);

  // Fly animation items
  const [flyItems, setFlyItems] = React.useState([]);

  const handleFly = ({ src, startRect, target }) => {
    if (!startRect || !src) return;
    const id = `${Date.now()}-${Math.random()}`;
    // Normalize target selector
    const selector = target === 'wishlist' ? 'button.nav-icon[data-target="wishlist"]' : 'button.nav-icon[data-target="cart"]';
    setFlyItems(prev => [...prev, { id, src, startRect, selector }]);
  };

  // Use data preloader for efficient backend data loading
  const { cart: preloadedCart, wishlist: preloadedWishlist, reviewsByProduct: preloadedReviews, isLoading: dataPreloading } = useDataPreloader(user);

  // State Management
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviewsByProduct, setReviewsByProduct] = useState({});
  const [orders, setOrders] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await productsAPI.getProducts();
      setProducts(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to load products from backend:', e);
      setProducts([]);
      toast.error('Failed to load products');
    }
  };

  // Sync preloaded data with state
  useEffect(() => {
    if (!dataPreloading) {
      setCart(preloadedCart);
      setWishlist(preloadedWishlist);
      setReviewsByProduct(preloadedReviews);
    }
  }, [preloadedCart, preloadedWishlist, preloadedReviews, dataPreloading]);

  // Use the useSearch hook for dynamic filtering (use current `products` state)
  const {
    searchTerm,
    handleSearchChange,
    filters,
    updateFilter,
    sortBy,
    setSortBy,
    filteredData: filteredProducts,
    clearFilters,
  } = useSearch(products, ['name', 'category', 'description']);

  // Navbar search is controlled by useSearch hook; no local nav state needed here.

  // Initialize animations on mount
  useEffect(() => {
    initializeAnimations();
    
    // Register service worker for caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Load products from backend (single source of truth)
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle body overflow
  useEffect(() => {
    if (isCartOpen || isWishlistOpen || isCheckoutOpen || isAdminOpen || modalProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen, isWishlistOpen, isCheckoutOpen, isAdminOpen, modalProduct]);

  // Optimized loading delay - only for initial load
  useEffect(() => {
    // Only add delay on initial mount, not route changes
    const isInitialMount = location.pathname === '/' && !location.state?.fromNavigation;
    if (isInitialMount) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300); // Reduced from 1000ms to 300ms
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [location.pathname, location.state]);

  // Use optimistic cart hook for fast cart operations (moved after all state is initialized)
  const {
    cartLoading,
    pendingOperations,
    addToCartOptimistic,
    removeFromCartOptimistic,
    updateQuantityOptimistic,
    clearCartOptimistic,
    isCartLoading,
    hasPendingOperations
  } = useOptimisticCart(user, products, setCart, cart);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Initialize scroll animations
  const initializeAnimations = () => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
      });
    }, 100);

    // Header scroll effect
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 100) {
          header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
          header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  };

  // filteredProducts is now provided by useSearch hook

  // Cart functions
  const addToCart = async (productId, quantity = 1, showNotification = true) => {
    if (!user) {
      if (showNotification) toast.error("Please login to add items to cart");
      return;
    }
    
    // Show instant notification
    if (showNotification) toast.success("Item added to cart!");
    
    // Perform optimistic operation in background
    const result = await addToCartOptimistic(productId, quantity);
    if (!result.success && showNotification) {
      // Update to error notification if it failed
      toast.error("Failed to add item to cart");
    }
  };

  const removeFromCart = async (productId) => {
    // Show instant notification
    toast.info('Item removed from cart');
    
    // Perform optimistic operation in background
    const result = await removeFromCartOptimistic(productId);
    if (!result.success) {
      // Update to error notification if it failed
      toast.error('Failed to remove item');
    }
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    const result = await updateQuantityOptimistic(productId, newQuantity);
    if (!result.success) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    // Show instant notification
    toast.success('All items removed from cart successfully!');
    
    // Perform optimistic operation in background
    const result = await clearCartOptimistic();
    if (!result.success) {
      // Update to error notification if it failed
      toast.error('Failed to clear cart');
    }
  };

  // Wishlist functions
  const toggleWishlist = async (productId) => {
  if (!user) {
    toast.error("Please login to manage wishlist");
    return;
  }
  
  const userId = user.uid || user.id;
  if (!userId) return;
  
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  try {
    await toggleWishlistDB(userId, productId);
    
    // Update local state
    setWishlist(prevWishlist => {
      const existingIndex = prevWishlist.findIndex(item => item.id === productId);
      if (existingIndex > -1) {
        toast.info(`💔 ${product.name} removed from wishlist`);
        return prevWishlist.filter(item => item.id !== productId);
      } else {
        toast.success(`❤️ ${product.name} added to wishlist!`);
        return [...prevWishlist, {
          id: productId,
          name: product.name,
          price: product.price,
          image: product.images[0]
        }];
      }
    });
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    toast.error("Failed to update wishlist");
  }
};

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const moveAllToCart = () => {
    setWishlist([]);
  };

  // Filter functions - delegate to useSearch hook
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'search') {
      const trimmed = String(value ?? '').trim();
      handleSearchChange(trimmed);
      if (trimmed === '') {
        // ensure full list and default sort restore immediately
        clearFilters();
        setSortBy('featured');
      }
    } else if (filterType === 'sort') {
      setSortBy(value);
    } else {
      updateFilter(filterType, value);
    }
  };

  // Create filters object for Products component
  const filtersForProducts = {
    search: searchTerm,
    category: filters.category || '',
    price: filters.price || '',
    sort: sortBy || 'featured'
  };

  const saveReviewsToStorage = (map) => {
    try {
      localStorage.setItem('product_reviews', JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save reviews', e);
    }
  };


  const handleSubmitReview = (productId, review) => {
    try {
      const raw = localStorage.getItem('product_reviews');
      const prev = raw ? JSON.parse(raw) : {};
      const next = { ...prev, [productId]: [...(prev[productId] || []), review] };
      saveReviewsToStorage(next);
    } catch (e) {
      console.error('Failed to save review', e);
    }
    setReviewModalOpen(false);
    setReviewingProduct(null);
  };

  // (collection navigation and review-writing flow handled via routes/pages)

  // Navigation functions
  const handleWishlistToggle = () => {
    setIsWishlistOpen(prev => !prev);
  };

  const handleSubscribe = (email) => {
    toast.success('Thank you for subscribing to our newsletter!');
  };

  const handleViewCollection = (category) => {
    navigate(`/collection/${category}`);
  };

  const handleWriteReview = (product) => {
    navigate('/review');
  };

  // Modal functions
  const openProductModal = (productId) => {
    const product = products.find(p => p.id === productId);
    setModalProduct(product);
    // persist recently viewed
    try {
      const raw = localStorage.getItem('recently_viewed');
      const arr = raw ? JSON.parse(raw) : [];
      const exists = arr.find(i => String(i.id) === String(productId));
      const entry = { id: productId, name: product?.name || '' };
      const next = exists ? arr : [entry, ...arr].slice(0, 30);
      localStorage.setItem('recently_viewed', JSON.stringify(next));
    } catch (e) {}
  };

  const closeProductModal = () => {
    setModalProduct(null);
  };

  // Cart functions
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
    scrollToSection('products');
  };

  // Checkout functions
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!user) {
      toast.error('Please log in to proceed to checkout');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCompleteOrder = (orderData) => {
    if (!user) {
      toast.error('Please log in to place an order');
      return;
    }

    const order = {
      id: Date.now(),
      customerName: `${orderData.firstName} ${orderData.lastName}`,
      customerEmail: user.email,
      items: [...cart],
      total: cartTotal * 1.1,
      date: new Date().toISOString(),
      status: 'Processing',
      ...orderData
    };

    // Save order to user-specific localStorage
    const userOrdersKey = `orders_${user.email}`;
    const existingOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
    const updatedOrders = [...existingOrders, order];
    localStorage.setItem(userOrdersKey, JSON.stringify(updatedOrders));

    // Update orders state
    setOrders(prev => [...prev, order]);

    // Clear cart
    setCart([]);
    localStorage.setItem('cart_items', JSON.stringify([]));

    // Show success message
    toast.success('Order placed successfully!');
  };

  // Admin functions
  const handleAddProduct = async (product) => {
    try {
      await productsAPI.createProduct(product);
      await fetchProducts();
      toast.success('Product added successfully!');
    } catch (e) {
      console.error('Failed to create product:', e);
      toast.error(e?.message || 'Failed to create product');
    }
  };

  const handleUpdateProduct = async (productId, updates) => {
    try {
      await productsAPI.updateProduct(productId, updates);
      await fetchProducts();
      toast.success('Product updated successfully!');
    } catch (e) {
      console.error('Failed to update product:', e);
      toast.error(e?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await productsAPI.deleteProduct(productId);
      await fetchProducts();
      toast.info('Product deleted');
    } catch (e) {
      console.error('Failed to delete product:', e);
      toast.error(e?.message || 'Failed to delete product');
    }
  };

  // Review functions are handled by handleSubmitReview which persists to localStorage

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const wishlistCount = wishlist.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (modalProduct) closeProductModal();
        else if (isCartOpen) setIsCartOpen(false);
        else if (isWishlistOpen) setIsWishlistOpen(false);
        else if (isCheckoutOpen) setIsCheckoutOpen(false);
        else if (isAdminOpen) setIsAdminOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalProduct, isCartOpen, isWishlistOpen, isCheckoutOpen, isAdminOpen]);

  return (
    <div className="App">
        {isLoading && <Loading />}
        <ToastContainer
          position="top-right"
          autoClose={2300}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          pauseOnHover
          draggable
          theme={isDarkMode ? 'dark' : 'light'}
        />
        <Suspense fallback={<div style={{height: '80px', background: 'var(--background)'}}></div>}>
          <Header 
            cartCount={cartCount}
            wishlistCount={wishlistCount}
            onCartToggle={toggleCart}
            onWishlistToggle={handleWishlistToggle}
            onAdminToggle={() => setIsAdminOpen(true)}
            // Provide single source search controls to Header
            searchValue={searchTerm}
            onSearchChange={(val) => handleFilterChange('search', val)}
            searchSuggestions={filteredProducts}
          />
        </Suspense>

        <Routes>
          <Route path="/" element={
            <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
              <Home
                filteredProducts={filteredProducts}
                wishlist={wishlist}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onOpenModal={openProductModal}
                filters={filtersForProducts}
                onFilterChange={handleFilterChange}
                onViewCollection={handleViewCollection}
                onWriteReview={handleWriteReview}
                reviewsByProduct={reviewsByProduct}
                onFly={handleFly}
              />
            </Suspense>
          } />

          <Route path="/collections" element={
            <div className="section container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Our Collections</h1>
                <Link to="/" className="btn btn-secondary">Back to Home</Link>
              </div>
              <div className="collections-grid">
                {Array.from(new Set(products.map(p => p.category))).map(category => {
                  const collectionImage = products.find(p => p.category === category)?.images[0];
                  return (
                    <Link key={category} to={`/collection/${category}`} className="collection-card">
                      {collectionImage && (
                        <div className="collection-image">
                          <img src={collectionImage} alt={category} />
                        </div>
                      )}
                      <h2>{category.replace('-', ' ')}</h2>
                      <span className="collection-count">
                        {products.filter(p => p.category === category).length} items
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          } />

          <Route path="/collection/:type" element={
            <CollectionPage
              products={products}
              wishlist={wishlist}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              onOpenModal={openProductModal}
              onFly={handleFly}
            />
          } />
          <Route path="/shop" element={<Shop products={products} wishlist={wishlist} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onOpenModal={openProductModal} reviewsByProduct={reviewsByProduct} onFly={handleFly} />} />

          <Route path="/review" element={<ReviewPage />} />

          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Profile & account pages */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/payments" element={<Payments />} />

          {/* Shopping related */}
          <Route path="/recently-viewed" element={<RecentlyViewed />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/order-history" element={<OrderHistory />} />
        </Routes>

        <Footer onSubscribe={handleSubscribe} />

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen}
        cart={cart}
        onClose={toggleCart}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onContinueShopping={handleContinueShopping}
        onCheckout={handleCheckout}
        onClearCart={clearCart}
      />

      {/* Add Checkout Button to Cart - REMOVED */}
      {/* Proceed to checkout button removed as requested */}

      {/* Wishlist Sidebar */}
      <Wishlist 
        isOpen={isWishlistOpen}
        wishlist={wishlist}
        onClose={() => setIsWishlistOpen(false)}
        onRemove={removeFromWishlist}
        onAddToCart={addToCart}
        onMoveAllToCart={moveAllToCart}
        onFly={handleFly}
      />

      {/* Checkout Modal */}
      <Checkout 
        isOpen={isCheckoutOpen}
        cart={cart}
        cartTotal={cartTotal}
        onClose={() => setIsCheckoutOpen(false)}
        onCompleteOrder={handleCompleteOrder}
      />

      {/* Product Modal */}
      <ProductModal 
        isOpen={!!modalProduct}
        product={modalProduct}
        wishlist={wishlist}
        onClose={closeProductModal}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
        onFly={handleFly}
      />

      <ReviewModal
        product={reviewingProduct}
        isOpen={reviewModalOpen}
        onClose={() => { setReviewModalOpen(false); setReviewingProduct(null); }}
        onSubmit={(review) => handleSubmitReview(reviewingProduct.id, review)}
      />

      {/* Admin Panel - admin only */}
      {isAuthenticated() && isAdmin() && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          products={products}
          orders={orders}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {/* Scroll To Top */}
      <ScrollToTop />

      {/* Notifications */}
      {/* Fly animations (portal) */}
      {flyItems.map(item => (
        <FlyToIcon
          key={item.id}
          id={item.id}
          src={item.src}
          startRect={item.startRect}
          targetSelector={item.selector}
          onComplete={(id) => setFlyItems(prev => prev.filter(i => i.id !== id))}
        />
      ))}
      {/* notifications are handled by react-toastify; legacy Notification UI removed */}
    </div>
  );
}

export default App;