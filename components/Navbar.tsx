'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { cart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand text-warning bg-dark px-2 rounded-1 fw-bold fs-4" href="/">
          IMDb
        </Link>
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-4">
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-light" href="/movies">
                Browse
              </Link>
            </li>
            {user && (
              <li className="nav-item ms-2">
                <Link className="nav-link fw-semibold text-light" href="/watchlist">
                  Watchlist
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
            {user && (
              <>
                <Link href="/cart" className="nav-link text-light d-flex align-items-center">
                  <span className="me-1 fw-semibold">Cart</span>
                  <span className="badge bg-warning text-dark rounded-pill">{mounted ? cart.length : 0}</span>
                </Link>
                <div className="vr text-secondary mx-2 d-none d-lg-block"></div>
              </>
            )}
            
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <Link href="/profile" className="text-white text-decoration-none small hover-white transition">
                   My Profile
                </Link>
                <div className="vr text-secondary mx-2 d-none d-lg-block"></div>
                <button onClick={signOut} className="btn btn-sm btn-outline-danger fw-bold px-3">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn btn-sm btn-outline-light fw-bold px-3">
                Sign In
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
