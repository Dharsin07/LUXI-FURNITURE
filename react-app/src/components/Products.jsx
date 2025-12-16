import React, { memo, useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import Skeleton from './Skeleton';

const Products = ({
  products,
  wishlist,
  onAddToCart,
  onToggleWishlist,
  onOpenModal,
  filters,
  onFilterChange,
  onViewCollection,
  onWriteReview,
  reviewsByProduct = {},
  loading = false
}) => {
  // Start by showing 20 products, "See More" will load 20 more each click
  const [visibleCount, setVisibleCount] = useState(20);

  // Keep visibleProducts derived from props so changes to products (navigation) reflect immediately
  const visibleProducts = useMemo(() => products.slice(0, visibleCount), [products, visibleCount]);

  // Loading state based on loading prop only, not products length
  const isLoading = loading;
  return (
    <section className="section" id="products">
      <div className="container">
        <div className="products-header fade-in">
          <div>
            <h2 className="section-title">Our Collection</h2>
            <p className="section-subtitle">Handpicked luxury furniture for the discerning homeowner</p>
          </div>

          <div className="search-filters">
            <select 
              className="filter-select"
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="living-room">Living Room</option>
              <option value="dining">Dining Room</option>
              <option value="bedroom">Bedroom</option>
              <option value="office">Office</option>
            </select>

            <select 
              className="filter-select"
              value={filters.price}
              onChange={(e) => onFilterChange('price', e.target.value)}
              aria-label="Filter by price range"
            >
              <option value="">All Prices</option>
              <option value="0-2000">Under $2,000</option>
              <option value="2000-5000">$2,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="10000+">Over $10,000</option>
            </select>

            <select 
              className="filter-select"
              value={filters.sort}
              onChange={(e) => onFilterChange('sort', e.target.value)}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
        
        <div className="products-grid" role="region" aria-label="Products">
          {isLoading ? (
            // Show skeleton loading grid
            Array.from({ length: 8 }, (_, index) => (
              <ProductCard
                key={`skeleton-${index}`}
                loading={true}
              />
            ))
          ) : products.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem',
              color: 'var(--text-gray)'
            }}>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            visibleProducts.map((product, index) => (
              <div
                key={product.id}
                className="fade-in"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <ProductCard
                  product={product}
                  isInWishlist={wishlist.some(item => item.id === product.id)}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  onOpenModal={onOpenModal}
                  onViewCollection={onViewCollection}
                  onWriteReview={onWriteReview}
                  reviews={reviewsByProduct[product.id] || []}
                  onFly={typeof onFly === 'function' ? onFly : null}
                />
              </div>
            ))
          )}
        </div>
        {products.length > visibleCount && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn" onClick={() => setVisibleCount(c => Math.min(products.length, c + 20))}>See More</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(Products);