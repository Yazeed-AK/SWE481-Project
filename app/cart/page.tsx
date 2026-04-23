'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Artificial small delay strictly to prevent hydration mismatch since LocalStorage reads are synchronous while React mounts async.
    const timer = setTimeout(() => {
        setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 min-vh-100">
      <h2 className="fw-bold text-white mb-4 border-bottom border-secondary pb-3">Your Shopping Cart</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-5 bg-dark rounded border border-secondary shadow-sm">
          <p className="lead text-muted mb-4">Your cart is currently empty.</p>
          <Link href="/movies" className="btn btn-warning fw-bold px-4">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card bg-dark border-secondary shadow-sm">
              <ul className="list-group list-group-flush">
                {cart.map((item) => (
                  <li key={item.id} className="list-group-item bg-dark border-secondary d-flex flex-column flex-sm-row justify-content-between align-items-sm-center py-3 gap-3">
                    <div>
                      <h5 className="text-light mb-0 fw-semibold">{item.title}</h5>
                    </div>
                    <div className="d-flex align-items-center justify-content-between justify-content-sm-end w-100">
                      <span className="text-warning fw-bold fs-5 me-sm-4">${item.price}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card bg-secondary text-light border-0 shadow-sm" style={{ '--bs-bg-opacity': '.2' } as React.CSSProperties}>
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4">Order Summary</h4>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Subtotal ({cart.length} items)</span>
                  <span className="fw-semibold">${(cart.length * 4.99).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 pb-3 border-bottom border-dark">
                  <span className="text-muted">Tax (8%)</span>
                  <span className="fw-semibold">${(cart.length * 4.99 * 0.08).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-4">
                  <span className="fs-5 fw-bold text-white">Total</span>
                  <span className="fs-5 fw-bold text-warning">${(cart.length * 4.99 * 1.08).toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => router.push('/checkout')}
                  className="btn btn-warning w-100 fw-bold py-2 shadow-sm"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
