import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Cart = ({ refresh, onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/cart');
      setCartItems(res.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [refresh]);

  const handleRemoveFromCart = async (cartId) => {
    if (!window.confirm('Are you sure you want to remove this item from your cart?')) return;
    
    try {
      await axios.delete(`http://localhost:5001/api/cart/${cartId}`);
      setCartItems(cartItems.filter(item => item.cart_id !== cartId));
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      alert('Failed to remove item from cart: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await axios.put(`http://localhost:5001/api/cart/${cartId}`, {
        quantity: newQuantity
      });
      setCartItems(cartItems.map(item => 
        item.cart_id === cartId ? { ...item, quantity: newQuantity } : item
      ));
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      alert('Failed to update quantity: ' + (error.response?.data?.message || error.message));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
      {cartItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🛒</span>
          <div className="empty-state-title">Your cart is empty</div>
          <div className="empty-state-desc">Browse books and add them to your cart to get started.</div>
        </div>
      ) : (
        <>
          <div style={{ 
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(16,30,54,0.08)',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              margin: '0 0 20px 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              Shopping Cart ({cartItems.length} items)
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map(item => (
                <div
                  key={item.cart_id}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    alignItems: 'center'
                  }}
                >
                  {/* Book Cover */}
                  {item.cover_image && (
                    <img
                      src={item.cover_image}
                      alt={`Cover of ${item.title}`}
                      style={{
                        width: '60px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {/* Book Info */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: '0 0 4px 0',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {item.title}
                    </h4>
                    <p style={{ 
                      margin: '0 0 8px 0',
                      color: '#64748b'
                    }}>
                      by {item.author}
                    </p>
                    <p style={{ 
                      margin: '0',
                      color: '#2563eb',
                      fontWeight: '600'
                    }}>
                      ₹{item.price}
                    </p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0
                  }}>
                    <button
                      onClick={() => handleUpdateQuantity(item.cart_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        width: '32px',
                        height: '32px',
                        cursor: item.quantity > 1 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      -
                    </button>
                    <span style={{ 
                      minWidth: '40px',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.cart_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        width: '32px',
                        height: '32px',
                        cursor: item.quantity < item.stockQuantity ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Subtotal */}
                  <div style={{ 
                    minWidth: '80px',
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    <p style={{ 
                      margin: '0 0 8px 0',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemoveFromCart(item.cart_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        textDecoration: 'underline'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Cart Summary */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(16,30,54,0.08)',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                margin: '0',
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                Total: ₹{calculateTotal()}
              </h3>
              <button
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#2563eb';
                }}
                onClick={() => alert('Checkout functionality would be implemented here!')}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;