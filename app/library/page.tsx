'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

interface PurchasedMovie {
  saleId: number;
  purchaseDate: string;
  id: string;
  title: string;
  year: number;
  director: string;
}

export default function LibraryPage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<PurchasedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchLibrary = async () => {
      try {
        const response = await fetch(`/api/library?email=${encodeURIComponent(user.email || '')}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch library');
        }
        const data = await response.json();
        setMovies(data.library || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred fetching your library.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [user]);

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5 min-vh-100 text-center">
        <h2 className="text-warning fw-bold mb-4">Your Library</h2>
        <h4 className="text-muted mb-4">Please log in to view your purchased movies</h4>
        <Link href="/login" className="btn btn-warning fw-bold px-4">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5 min-vh-100">
      <h2 className="text-warning fw-bold mb-4 border-bottom border-secondary pb-3">My Library</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!error && movies.length === 0 ? (
        <div className="text-center py-5">
          <h4 className="text-muted mb-4">You have not purchased any movies yet.</h4>
          <Link href="/movies" className="btn btn-warning fw-bold px-4">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {movies.map(movie => (
            <div key={movie.saleId} className="col">
              <div className="card h-100 bg-black border-secondary hover-indicator transition-all">
                <div className="card-body">
                  <h5 className="card-title text-success fw-bold text-truncate" title={movie.title}>
                    {movie.title} <span className="badge bg-success bg-opacity-25 text-success ms-2 fn-sm">Purchased</span>
                  </h5>
                  <h6 className="card-subtitle text-muted mb-3">{movie.year} | {movie.director}</h6>
                  <p className="small text-secondary mb-3">
                    Purchased on: {new Date(movie.purchaseDate).toLocaleDateString()}
                  </p>
                  
                  <div className="d-flex gap-2">
                    <Link href={`/movies/${movie.id}`} className="btn btn-outline-warning btn-sm flex-grow-1 fw-semibold">
                      Watch Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
