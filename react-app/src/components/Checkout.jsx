import React, { useState } from 'react';
import { formatPrice } from '../utils/helpers';
import { toast } from 'react-toastify';

const Checkout = ({ isOpen, cart, cartTotal, onClose, onCompleteOrder }) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('gpay');
  const [formData, setFormData] = useState({
    // Shipping Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    // Payment Info
    upiId: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    // Billing
    sameAsShipping: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const initiateGPayPayment = () => {
    if (!formData.upiId) {
      toast.error('Please enter UPI ID');
      return;
    }

    const upiUrl = `upi://pay?pa=${formData.upiId}&pn=LuxeFurniture&am=${cartTotal}&cu=INR&tn=Order_${Date.now()}`;
    
    // Open GPay/PhonePe app
    window.location.href = upiUrl;
    
    // Show immediate success notification
    toast.success('Payment completed successfully!');
    onCompleteOrder(formData);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
    } else {
      if (paymentMethod === 'gpay') {
        initiateGPayPayment();
      } else {
        // Complete order for other payment methods
        onCompleteOrder(formData);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal active">
      <div className="modal-content checkout-modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="checkout-header">
          <h2>Checkout</h2>
          <div className="checkout-steps">
            <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
            <div className={`checkout-step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Review</span>
            </div>
          </div>
        </div>

        <div className="checkout-grid">
          {/* Left column: form */}
          <div className="checkout-col checkout-col--form">
            <form onSubmit={handleSubmit} className="checkout-form">
              {step === 1 && (
                <div className="card card--white">
                  <h3>Shipping Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="card card--white">
                  <h3>Payment Information</h3>
                  <div className="form-group">
                    <label>Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="16"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date *</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="sameAsShipping"
                        checked={formData.sameAsShipping}
                        onChange={handleInputChange}
                      />
                      Billing address same as shipping
                    </label>
                  </div>
                  
                  {/* GPay Payment Section */}
                  <div className="form-group">
                    <label>Payment Method *</label>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="gpay"
                          checked={paymentMethod === 'gpay'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        GPay/UPI
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        Credit Card
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'gpay' && (
                    <div className="form-group">
                      <label>UPI ID *</label>
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        placeholder="yourupi@paytm"
                        required={paymentMethod === 'gpay'}
                      />
                      <small style={{ color: 'var(--text-gray)', marginTop: '0.5rem', display: 'block' }}>
                        Enter your UPI ID for GPay/PhonePe/ Paytm payment
                      </small>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <>
                      <div className="form-group">
                        <label>Cardholder Name *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div className="form-group">
                        <label>Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="16"
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date *</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                        <div className="form-group">
                          <label>CVV *</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            maxLength="3"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="card card--white">
                  <h3>Order Review</h3>
                  <div className="order-summary">
                    <div className="order-items">
                      {cart.map(item => (
                        <div key={item.productId} className="order-item">
                          <img src={item.image} alt={item.name} />
                          <div className="order-item-details">
                            <h4>{item.name}</h4>
                            <p>Qty: {item.quantity}</p>
                            <p className="price">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-totals">
                      <div className="order-total-row">
                        <span>Subtotal:</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="order-total-row">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="order-total-row">
                        <span>Tax:</span>
                        <span>{formatPrice(cartTotal * 0.1)}</span>
                      </div>
                      <div className="order-total-row total">
                        <span>Total:</span>
                        <span>{formatPrice(cartTotal * 1.1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shipping-info-summary">
                    <h4>Shipping To:</h4>
                    <p>{formData.firstName} {formData.lastName}</p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                    <p>{formData.country}</p>
                  </div>
                </div>
              )}

              <div className="checkout-actions">
                {step > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  {step === 3 ? 'Place Order' : 'Continue'}
                </button>
              </div>
            </form>
          </div>

          {/* Right column: summary/card */}
          <aside className="checkout-col checkout-col--summary">
            <div className="card card--summary">
              <h4>Order Summary</h4>
              <div className="summary-items">
                {cart.map(i => (
                  <div key={i.productId} className="summary-item">
                    <div className="summary-item-name">{i.name}</div>
                    <div className="summary-item-meta">{i.quantity} × {formatPrice(i.price)}</div>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <div className="summary-row"><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div>
                <div className="summary-row"><span>Shipping</span><strong>Free</strong></div>
                <div className="summary-row"><span>Tax</span><strong>{formatPrice(cartTotal * 0.1)}</strong></div>
                <div className="summary-row total"><span>Total</span><strong>{formatPrice(cartTotal * 1.1)}</strong></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
