'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="container py-5 d-flex flex-column justify-content-center align-items-center min-vh-100 text-center">
      <h1 className="display-4 fw-bold text-white mb-4">
        Welcome to <span className="text-warning">IMDb Clone</span>
      </h1>
      <p className="lead text-light mb-5 w-75 mx-auto">
        Browse the most popular movies, search for your favorites, find details about your favorite stars, and rent movies directly from our application.
      </p>
      
      {!loading && (
        <div className="d-flex gap-3">
          <Link href="/movies" className="btn btn-warning btn-lg px-5 rounded-pill shadow-sm text-dark fw-bold">
            Browse Movies
          </Link>
          {!user && (
            <Link href="/login" className="btn btn-outline-light btn-lg px-5 rounded-pill shadow-sm">
              Sign In
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
