'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Login failed');
      }

      router.push('/');
      router.refresh();
      
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : (typeof err === "object" && err !== null && "message" in err ? String((err as Record<string, unknown>).message) : String(err))));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div className="card bg-dark border-secondary shadow-lg p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-white mb-1">Welcome Back</h2>
          <p className="text-muted">Sign in to your IMDb account</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label text-light fw-semibold">Email address</label>
            <input 
              type="email" 
              className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" 
              required 
              maxLength={50}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="form-label text-light fw-semibold">Password</label>
              <input 
              type="password" 
              className="form-control bg-secondary text-light border-0 focus-ring focus-ring-warning" 
              required 

              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-warning w-100 fw-bold py-2 mb-3"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <span className="text-muted">New to IMDb Clone? </span>
          <Link href="/register" className="text-warning text-decoration-none fw-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
