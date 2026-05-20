'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { cart, clearCart } = useCart();
  const [hydrated, setHydrated] = useState(false);
  
  const { user, session } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    ccId: '',
    ccExpiration: '',
    email: ''
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Autofill checkout from auth metadata
  useEffect(() => {
    if (user && user.user_metadata) {
       setFormData(prev => ({
         ...prev,
         firstName: user.user_metadata.firstName || '',
         lastName: user.user_metadata.lastName || '',
         email: user.email || ''
       }));
    }
  }, [user]);

  if (!hydrated) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (cart.length === 0) throw new Error('Cart is empty');

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          ...formData,
          cart
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      setSuccess(true);
      
      // Clear cart globally
      clearCart();

    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : (typeof err === "object" && err !== null && "message" in err ? String((err as Record<string, unknown>).message) : String(err))));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container py-5 min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center bg-dark p-5 rounded border border-secondary shadow-lg">
          <div className="text-success mb-4" style={{ fontSize: '4rem' }}>
            <i className="bi bi-check-circle-fill"></i>
            {/* Fallback to simple ✔ since Bootstrap Icons isn't installed by default */}
            <h1>✔</h1>
          </div>
          <h2 className="text-white fw-bold mb-3">Payment Successful!</h2>
          <p className="text-muted mb-4 fs-5">Your movies have been successfully rented. Thank you for your purchase.</p>
          <Link href="/movies" className="btn btn-warning fw-bold px-5">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 min-vh-100">
      <h2 className="fw-bold text-white mb-4 border-bottom border-secondary pb-3">Checkout</h2>
      
      <div className="row g-4">
        {/* Checkout Form */}
        <div className="col-lg-8">
          <div className="card bg-dark border-secondary shadow-sm p-4">
            <h4 className="fw-semibold text-warning mb-4">Payment Details</h4>
            
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={handleCheckout}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-light fw-semibold">First Name (on card)</label>
                  <input type="text" name="firstName" value={formData.firstName} className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} maxLength={50} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-light fw-semibold">Last Name (on card)</label>
                  <input type="text" name="lastName" value={formData.lastName} className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} maxLength={50} readOnly />
                </div>
                <div className="col-md-7">
                  <label className="form-label text-light fw-semibold">Credit Card Number</label>
                  <input type="text" name="ccId" value={formData.ccId} className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} pattern="^\d{13,19}$" title="Credit card must be between 13 and 19 digits" maxLength={19} />
                </div>
                <div className="col-md-5">
                  <label className="form-label text-light fw-semibold">Expiration Date</label>
                  <input type="date" name="ccExpiration" value={formData.ccExpiration} className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div className="mt-5 border-top border-secondary pt-4">
                 <button 
                  type="submit" 
                  className="btn btn-warning btn-lg w-100 fw-bold shadow-sm"
                  disabled={loading || cart.length === 0}
                >
                  {loading ? 'Processing...' : `Pay $${(cart.length * 4.99 * 1.08).toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary Mini Panel */}
        <div className="col-lg-4">
          <div className="card bg-secondary text-light border-0 shadow-sm" style={{ '--bs-bg-opacity': '.2' } as React.CSSProperties}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3 border-bottom border-dark pb-2">Order Summary</h5>
              <div className="mb-3">
                {cart.map(item => (
                  <div key={item.id} className="d-flex justify-content-between mb-2 text-muted small">
                    <span className="text-truncate me-2" style={{ maxWidth: '200px' }}>{item.title}</span>
                    <span>$4.99</span>
                  </div>
                ))}
              </div>
              
              <div className="d-flex justify-content-between mb-2 border-top border-dark pt-2">
                <span className="text-muted fw-semibold">Subtotal</span>
                <span className="text-white">${(cart.length * 4.99).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted fw-semibold">Tax (8%)</span>
                <span className="text-white">${(cart.length * 4.99 * 0.08).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fs-5 fw-bold text-white border-top border-dark pt-3">
                <span>Total</span>
                <span className="text-warning">${(cart.length * 4.99 * 1.08).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
