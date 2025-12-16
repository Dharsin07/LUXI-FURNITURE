import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Products from '../components/Products';

// Shop: provides sort controls and passes a sorted product list to Products component.
const Shop = ({ products = [], wishlist = [], onAddToCart, onToggleWishlist, onOpenModal, reviewsByProduct, onFly }) => {
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState('featured');
  const [filterCategory, setFilterCategory] = useState('');

  const featured = products.filter(p => p.featured);
  const seasonal = products.filter(p => p.originalPrice && p.originalPrice > p.price);
  const collections = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // A small helper to sort an array by the requested mode.
  const sortList = useCallback((list, mode) => {
    const next = list.slice();
    switch (mode) {
      case 'price-low':
        next.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        next.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        next.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'rating':
        next.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'featured':
      default:
        next.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
    }
    return next;
  }, []);

  // Compute the main catalog view (applies category filter + sort)
  const catalog = useMemo(() => {
    const base = filterCategory ? products.filter(p => p.category === filterCategory) : products.slice();
    return sortList(base, sortBy);
  }, [products, filterCategory, sortBy, sortList]);

  return (
    <main>
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="section-title">Shop</h1>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Back Home</button>
          </div>

          <div className="shop-intro" style={{ marginTop: '1rem' }}>
            <p className="section-subtitle">Explore our full catalog — curated collections, trending designs, and seasonal offers.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1.25rem' }}>
            <select aria-label="Filter category" className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {collections.map(c => <option key={c} value={c}>{c?.replace('-', ' ') || c}</option>)}
            </select>

            <select aria-label="Sort products" className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <div className="shop-section" style={{ marginTop: '1.5rem' }}>
            <h2 className="shop-section-title">Latest Trends</h2>
            <Products
              products={sortList(featured.length ? featured : products, sortBy)}
              wishlist={wishlist}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              onOpenModal={onOpenModal}
              filters={{ search: '', category: '' }}
              onFilterChange={(type, val) => {
                if (type === 'sort') setSortBy(val);
                if (type === 'category') setFilterCategory(val);
              }}
              reviewsByProduct={reviewsByProduct}
              onFly={typeof onFly === 'function' ? onFly : null}
            />
          </div>

          <div className="shop-section">
            <h2 className="shop-section-title">Featured Collections</h2>
            <div className="collections-grid">
              {collections.map(col => (
                <div key={col} className="collection-card">
                  <div className="collection-content">
                    <h3>{col?.replace('-', ' ') || col}</h3>
                    <p className="collection-count">{products.filter(p=>p.category===col).length} items</p>
                    <button className="btn btn-outline" onClick={() => navigate(`/collection/${col}`)}>View Collection</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="shop-section">
            <h2 className="shop-section-title">Seasonal Offers</h2>
            <Products
              products={sortList(seasonal, sortBy)}
              wishlist={wishlist}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              onOpenModal={onOpenModal}
              filters={{ search: '', category: '' }}
              onFilterChange={(type, val) => {
                if (type === 'sort') setSortBy(val);
                if (type === 'category') setFilterCategory(val);
              }}
              reviewsByProduct={reviewsByProduct}
              onFly={typeof onFly === 'function' ? onFly : null}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Shop;
