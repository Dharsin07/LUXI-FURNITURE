import React from 'react';
import { formatPrice } from '../utils/helpers';

const CartSidebar = ({ isOpen, cart, onClose, onUpdateQuantity, onRemove, onContinueShopping, onCheckout, onClearCart }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`} role="complementary" aria-label="Shopping cart">
      <div className="cart-header">
        <h3>Shopping Cart</h3>
        <button className="modal-close" onClick={onClose} aria-label="Close cart">
          ✕
        </button>
      </div>
      
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Discover our luxury furniture collection</p>
            <button className="btn" onClick={onContinueShopping}>
              <span className="btn-text">Continue Shopping</span>
            </button>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.productId || item.id || `cart-${Math.random()}`} style={{ 
              display: 'flex', 
              gap: '1rem', 
              padding: '1rem 0', 
              borderBottom: '1px solid var(--light-gray)' 
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '6px', 
                overflow: 'hidden', 
                flexShrink: 0 
              }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  fontWeight: 600, 
                  color: 'var(--primary-dark)', 
                  marginBottom: '0.5rem', 
                  fontSize: '1rem' 
                }}>
                  {item.name}
                </div>
                <div style={{ 
                  color: 'var(--gold)', 
                  fontWeight: 600, 
                  marginBottom: '0.5rem' 
                }}>
                  {formatPrice(item.price)}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginTop: 'auto' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: '1px solid var(--medium-gray)', 
                        background: 'var(--white)', 
                        borderRadius: '4px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        fontSize: '0.9rem' 
                      }}
                      onClick={() => onUpdateQuantity(item.productId || item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span style={{ 
                      minWidth: '30px', 
                      textAlign: 'center', 
                      fontWeight: 600 
                    }}>
                      {item.quantity}
                    </span>
                    <button 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: '1px solid var(--medium-gray)', 
                        background: 'var(--white)', 
                        borderRadius: '4px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        fontSize: '0.9rem' 
                      }}
                      onClick={() => onUpdateQuantity(item.productId || item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    style={{ 
                      color: '#dc3545', 
                      cursor: 'pointer', 
                      padding: '0.5rem', 
                      background: 'none', 
                      border: 'none', 
                      fontSize: '1.2rem' 
                    }}
                    onClick={() => onRemove(item.productId || item.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span className="cart-total-price">{formatPrice(total)}</span>
          </div>
          <div className="cart-actions">
            <button 
              className="btn btn-danger" 
              style={{ width: '100%', marginBottom: '0.5rem', backgroundColor: '#dc3545' }} 
              onClick={onClearCart}
            >
              <span className="btn-text">Remove All Cart</span>
            </button>
            <button className="btn" style={{ width: '100%' }} onClick={onCheckout}>
              <span className="btn-text">Checkout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;