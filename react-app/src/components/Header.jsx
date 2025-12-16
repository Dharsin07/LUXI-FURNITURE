import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import { scrollToSection } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

// Single navbar search input — controlled by App via props
const Header = ({
  cartCount = 0,
  wishlistCount = 0,
  onCartToggle = () => {},
  onWishlistToggle = () => {},
  onAdminToggle = () => {},
  searchValue = '',
  onSearchChange = () => {},
  searchSuggestions = []
}) => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      const target = e.target;
      if (!target) return;
      if (inputRef.current && !inputRef.current.contains(target)) {
        const btn = document.getElementById('header-search-btn');
        if (btn && btn.contains(target)) return;
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const navigate = useNavigate();
  const toggle = (e) => {
    e.stopPropagation();
    setOpen(prev => !prev);
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    // Smooth scroll to contact section on home page
    const currentPath = window.location.pathname;
    if (currentPath === '/') {
      scrollToSection('contact');
    } else {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => scrollToSection('contact'), 100);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Dropdown state for Profile and Shopping
  const [profileOpen, setProfileOpen] = useState(false);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const profileRef = useRef(null);
  const shoppingRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (shoppingOpen && shoppingRef.current && !shoppingRef.current.contains(e.target)) {
        setShoppingOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [profileOpen, shoppingOpen]);

  return (
    <header className="header" role="banner">
      <nav className="nav container" role="navigation" aria-label="Main navigation">
        <Link to="/" className="logo" aria-label="Luxe Furniture Homepage">LUXE</Link>

        <ul className="nav-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/shop">Shop</NavLink></li>
          <li><NavLink to="/collections">Collections</NavLink></li>
          <li><NavLink to="/review">Reviews</NavLink></li>
          <li><a href="#contact" onClick={handleContactClick}>Contact</a></li>
          {/* Admin link - show for all authenticated users */}
          {isAuthenticated() && (
            <li><button className="nav-link admin-nav-link" onClick={onAdminToggle}>Admin</button></li>
          )}
        </ul>

        <div className="nav-actions">
          <DarkModeToggle />

          <div className={`header-search ${open ? 'open' : ''}`}>
            <button
              id="header-search-btn"
              className="nav-icon"
              onClick={toggle}
              aria-label={open ? 'Close search' : 'Open search'}
            >
              🔍
            </button>

            <input
              ref={inputRef}
              id="header-search-input"
              className="header-search-input"
              type="search"
              placeholder="Search products, categories..."
              value={String(searchValue ?? '')}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search products"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Suggestions dropdown (simple) */}
            {open && Array.isArray(searchSuggestions) && searchSuggestions.length > 0 && (
              <ul className="search-suggestions" role="listbox">
                {searchSuggestions.slice(0,6).map(p => (
                  <li 
                    key={p.id} 
                    className="suggestion-item" 
                    onClick={() => { 
                      setOpen(false);
                      onSearchChange('');
                      navigate(`/product/${p.id}`);
                    }}
                  >
                    {p.images?.[0] && (
                      <img 
                        src={p.images[0]} 
                        alt={p.name}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          e.target.onerror = null;
                        }} 
                      />
                    )}
                    <div className="suggestion-meta">
                      <div className="suggestion-name">{p.name}</div>
                      <div className="suggestion-cat">{p.category.replace('-', ' ')}</div>
                      <div className="suggestion-price">${p.price?.toFixed(2)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button className="nav-icon" data-target="wishlist" onClick={onWishlistToggle} aria-label="View wishlist">
            ❤️
            {wishlistCount > 0 && <span className="cart-count">{wishlistCount}</span>}
          </button>

          <button className="nav-icon" data-target="cart" onClick={onCartToggle} aria-label="View shopping cart">
            🛒
            <span className="cart-count">{cartCount}</span>
          </button>

          {/* Shopping dropdown */}
          <div className="nav-dropdown" ref={shoppingRef}>
            <button
              className="nav-icon"
              aria-haspopup="true"
              aria-expanded={shoppingOpen}
              onClick={(e) => { e.stopPropagation(); setShoppingOpen(s => !s); setProfileOpen(false); }}
              title="Shopping"
            >
              📬
            </button>

            {shoppingOpen && (
              <ul className="dropdown-menu" role="menu">
                <li><Link to="/recently-viewed" onClick={() => setShoppingOpen(false)}>Recently Viewed</Link></li>
                <li><Link to="/cart" onClick={() => setShoppingOpen(false)}>My Cart</Link></li>
                <li><Link to="/track-order" onClick={() => setShoppingOpen(false)}>Track Order</Link></li>
                <li><Link to="/returns" onClick={() => setShoppingOpen(false)}>Returns & Refunds</Link></li>
                <li><Link to="/order-history" onClick={() => setShoppingOpen(false)}>Order History</Link></li>
              </ul>
            )}
          </div>

          {/* Authentication buttons */}
          {isAuthenticated() ? (
            <div className="nav-dropdown" ref={profileRef}>
              <button
                className="nav-icon"
                aria-haspopup="true"
                aria-expanded={profileOpen}
                onClick={(e) => { e.stopPropagation(); setProfileOpen(p => !p); setShoppingOpen(false); }}
                title={`Logged in as ${user?.name}`}
              >
                👤
              </button>

              {profileOpen && (
                <ul className="dropdown-menu" role="menu">
                  <li><Link to="/profile" onClick={() => setProfileOpen(false)}>My Profile</Link></li>
                  <li><Link to="/edit-profile" onClick={() => setProfileOpen(false)}>Edit Profile</Link></li>
                  <li><Link to="/orders" onClick={() => setProfileOpen(false)}>My Orders</Link></li>
                  <li><Link to="/wishlist" onClick={() => setProfileOpen(false)}>Wishlist</Link></li>
                  <li><Link to="/addresses" onClick={() => setProfileOpen(false)}>Saved Addresses</Link></li>
                  <li><Link to="/payments" onClick={() => setProfileOpen(false)}>Payment Methods</Link></li>
                  {isAdmin() && <li><Link to="/dashboard" onClick={() => setProfileOpen(false)}>User Dashboard</Link></li>}
                  <li><hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid var(--medium-gray)' }} /></li>
                  <li><button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '0.6rem 1rem', cursor: 'pointer', color: 'var(--charcoal)' }}>Logout</button></li>
                </ul>
              )}
            </div>
          ) : (
            <div className="nav-dropdown" ref={profileRef}>
              <button
                className="nav-icon"
                aria-haspopup="true"
                aria-expanded={profileOpen}
                onClick={(e) => { e.stopPropagation(); setProfileOpen(p => !p); setShoppingOpen(false); }}
                title="Account"
              >
                🔐
              </button>

              {profileOpen && (
                <ul className="dropdown-menu" role="menu">
                  <li><Link to="/login" onClick={() => setProfileOpen(false)}>Login</Link></li>
                  <li><Link to="/signup" onClick={() => setProfileOpen(false)}>Sign Up</Link></li>
                </ul>
              )}
            </div>
          )}

          {/* Admin button - only show if authenticated and user is admin */}
          {isAuthenticated() && isAdmin() && (
            <button
              className="nav-icon admin-icon"
              onClick={onAdminToggle}
              aria-label="Admin panel"
              title="Admin Panel"
            >
              ⚙️
            </button>
          )}
        </div>

        <button 
          className="mobile-menu" 
          onClick={() => toast.info('Mobile menu feature coming soon!')} 
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </header>
  );
};

export default Header;