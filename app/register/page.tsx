'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
    ccId: '',
    ccExpiration: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div className="card bg-dark border-secondary shadow-lg p-4 w-100" style={{ maxWidth: '600px' }}>
        <div className="text-center mb-4 border-bottom border-secondary pb-3">
          <h2 className="fw-bold text-white mb-1">Create Account</h2>
          <p className="text-muted">Join IMDb Clone to rent movies and write reviews</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-light fw-semibold">First Name</label>
              <input type="text" name="firstName" className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-light fw-semibold">Last Name</label>
              <input type="text" name="lastName" className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} />
            </div>
            
            <div className="col-12">
              <label className="form-label text-light fw-semibold">Email address</label>
              <input type="email" name="email" className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} />
            </div>
            
            <div className="col-12">
              <label className="form-label text-light fw-semibold">Password</label>
              <input type="password" name="password" className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} />
            </div>

            <div className="col-12">
              <label className="form-label text-light fw-semibold">Billing Address</label>
              <input type="text" name="address" className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} />
            </div>

            <div className="col-md-7 mb-3">
              <label className="form-label text-light fw-semibold">Credit Card ID / Number</label>
              <input type="text" name="ccId" className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} />
            </div>

            <div className="col-md-5 mb-3">
              <label className="form-label text-light fw-semibold">Expiration Date</label>
              <input type="date" name="ccExpiration" className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" required onChange={handleChange} />
            </div>
          </div>
          
          <button type="submit" className="btn btn-warning w-100 fw-bold py-2 my-3" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center">
          <span className="text-muted">Already have an account? </span>
          <Link href="/login" className="text-warning text-decoration-none fw-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
