import React, { useRef, memo } from 'react';
import { handleImageError, getSupabaseImageUrl } from '../utils/imageUtils';
import { formatPrice, generateStars } from '../utils/helpers';
import Skeleton from './Skeleton';
import LazyImage from './LazyImage';

const ProductCard = ({ product, isInWishlist, onAddToCart, onToggleWishlist, onOpenModal, onFly, loading = false }) => {
  const discountPercent = product?.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const imgRef = useRef(null);

  if (loading) {
    return (
      <div className="product-card">
        <div className="product-image">
          <Skeleton variant="image" height="280px" />
          <div className="product-actions">
            <Skeleton variant="circle" width="44px" height="44px" />
            <Skeleton variant="circle" width="44px" height="44px" />
            <Skeleton variant="circle" width="44px" height="44px" />
          </div>
        </div>
        <div className="product-info">
          <Skeleton variant="text" width="60%" height="14px" style={{ marginBottom: '0.5rem' }} />
          <Skeleton variant="text" width="90%" height="20px" style={{ marginBottom: '1rem' }} />
          <Skeleton variant="text" width="40%" height="16px" style={{ marginBottom: '1rem' }} />
          <Skeleton variant="text" width="50%" height="20px" style={{ marginBottom: '1rem' }} />
          <Skeleton variant="button" width="100%" />
        </div>
      </div>
    );
  }

  return (
    <div className="product-card fade-in">
      <div className="product-image" onClick={() => onOpenModal(product.id)}>
        <LazyImage
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="product-img"
          ref={imgRef}
        />

        {discountPercent > 0 && (
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--gold)', color: 'var(--primary-dark)', padding: '0.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.8rem' }}>
            -{discountPercent}%
          </div>
        )}

        <div className="product-actions">
          <button
            className={`action-btn ${isInWishlist ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              try { const rect = imgRef.current?.getBoundingClientRect(); onFly && onFly({ src: product.images?.[0] || '/placeholder.jpg', startRect: rect, target: 'wishlist' }); } catch (err) {}
              onToggleWishlist(product.id);
            }}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <span className="action-icon" aria-hidden>{isInWishlist ? '❤️' : '🤍'}</span>
            <span className="sr-only">{isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}</span>
          </button>

          <button className="action-btn" onClick={(e) => { e.stopPropagation(); onOpenModal(product.id); }} aria-label="Quick view" title="Quick view">
            <span className="action-icon" aria-hidden>🔍</span>
            <span className="sr-only">Quick view</span>
          </button>

          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              try { const rect = imgRef.current?.getBoundingClientRect(); onFly && onFly({ src: product.images?.[0] || '/placeholder.jpg', startRect: rect, target: 'cart' }); } catch (err) {}
              onAddToCart(product.id);
            }}
            aria-label="Add to cart"
            title="Add to cart"
          >
            <LazyImage 
              src={product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              className="product-img"
            />
            <span className="action-icon" aria-hidden>🛒</span>
            <span className="sr-only">Add to cart</span>
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-category">{product.category?.replace('-', ' ') || 'Uncategorized'}</div>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          <span className="stars">{generateStars(product.rating)}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>

        <div className="product-price">
          {formatPrice(product.price)}
          {product.originalPrice && (
            <span style={{ textDecoration: 'line-through', color: 'var(--text-gray)', fontSize: '1rem', marginLeft: '0.5rem' }}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <button
          className="btn"
          onClick={(e) => {
            try { const rect = imgRef.current?.getBoundingClientRect(); onFly && onFly({ src: product.images[0], startRect: rect, target: 'cart' }); } catch (err) {}
            onAddToCart(product.id);
          }}
          style={{ width: '100%' }}
        >
          <span className="btn-text">Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default memo(ProductCard);
