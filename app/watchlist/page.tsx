'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

interface WatchlistMovie {
  id: string;
  title: string;
  year: number;
  director: string;
}

export default function WatchlistPage() {
  const { user } = useAuth();
  const getWatchlistKey = () => user ? `imdb_watchlist_${user.id}` : 'imdb_watchlist_guest';

  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from local storage dynamically
    const wlKey = getWatchlistKey();
    const wl = JSON.parse(localStorage.getItem(wlKey) || '[]');
    setWatchlist(wl);
    setLoading(false);
  }, [user]);

  const handleRemove = (id: string) => {
    const updated = watchlist.filter(m => m.id !== id);
    setWatchlist(updated);
    
    // Save to localized bucket
    localStorage.setItem(getWatchlistKey(), JSON.stringify(updated));
  };

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
      <h2 className="text-warning fw-bold mb-4 border-bottom border-secondary pb-3">Your Watchlist</h2>

      {watchlist.length === 0 ? (
        <div className="text-center py-5">
          <h4 className="text-muted mb-4">Your watchlist is empty</h4>
          <Link href="/movies" className="btn btn-warning fw-bold px-4">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {watchlist.map(movie => (
            <div key={movie.id} className="col">
              <div className="card h-100 bg-black border-secondary hover-indicator transition-all">
                <div className="card-body">
                  <h5 className="card-title text-light fw-bold text-truncate" title={movie.title}>
                    {movie.title}
                  </h5>
                  <h6 className="card-subtitle text-muted mb-3">{movie.year} | {movie.director}</h6>
                  
                  <div className="d-flex gap-2">
                    <Link href={`/movies/${movie.id}`} className="btn btn-outline-warning btn-sm flex-grow-1 fw-semibold">
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleRemove(movie.id)} 
                      className="btn btn-outline-danger btn-sm px-3"
                      title="Remove from watchlist"
                    >
                      🗑️ Remove
                    </button>
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
