'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';

interface MovieDetail {
  id: string;
  title: string;
  year: number;
  director: string;
  rating: {
    rating: number | null;
    numVotes: number;
  };
  stars: {
    id: string;
    name: string;
    birthYear: number | null;
  }[];
  genres: {
    id: number;
    name: string;
  }[];
}

export default function SingleMoviePage() {
  const params = useParams();
  const movieId = params?.id as string;
  
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { cart, addToCart } = useCart();
  const [addingCart, setAddingCart] = useState(false);
  const [addedCart, setAddedCart] = useState(false);
  const [addingWatchlist, setAddingWatchlist] = useState(false);
  const [addedWatchlist, setAddedWatchlist] = useState(false);

  const { user } = useAuth();
  const getWatchlistKey = React.useCallback(() => user ? `imdb_watchlist_${user.id}` : 'imdb_watchlist_guest', [user]);

  useEffect(() => {
    if (!movieId) return;

    const fetchMovie = async () => {
      try {
        const res = await fetch(`/api/movies/${movieId}`);
        if (!res.ok) {
          throw new Error('Movie not found');
        }
        const json = await res.json();
        setMovie(json.data);
      } catch (err: unknown) {
        setError((err instanceof Error ? err.message : (typeof err === "object" && err !== null && "message" in err ? String((err as Record<string, unknown>).message) : String(err))) || 'Failed to load movie');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
    
    // Check if in watchlist already
    const wl = JSON.parse(localStorage.getItem(getWatchlistKey()) || '[]');
    if (wl.some((m: { id: string }) => m.id === movieId)) {
      setAddedWatchlist(true);
    }

    if (cart.find(item => item.id === movieId)) {
      setAddedCart(true);
    }
  }, [movieId, cart, getWatchlistKey]);

  const handleAddToCart = () => {
    if (!movie) return;
    setAddingCart(true);
    addToCart({
       id: movie.id,
       title: movie.title,
       price: 4.99
    });
    setAddedCart(true);
    setTimeout(() => {
        setAddingCart(false);
    }, 400);
  };

  const handleToggleWatchlist = () => {
    if (!movie) return;
    setAddingWatchlist(true);
    setTimeout(() => {
      const wlKey = getWatchlistKey();
      const wl = JSON.parse(localStorage.getItem(wlKey) || '[]');
      if (addedWatchlist) {
        const filtered = wl.filter((m: { id: string }) => m.id !== movie.id);
        localStorage.setItem(wlKey, JSON.stringify(filtered));
        setAddedWatchlist(false);
      } else {
        wl.push({ id: movie.id, title: movie.title, year: movie.year, director: movie.director });
        localStorage.setItem(wlKey, JSON.stringify(wl));
        setAddedWatchlist(true);
      }
      setAddingWatchlist(false);
    }, 400); // UI feedback delay
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

  if (error || !movie) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-danger mb-4">{error}</h2>
        <Link href="/movies" className="btn btn-outline-light">Back to Browse</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Left Col - Info */}
        <div className="col-md-8">
          <div className="d-flex align-items-end mb-2 border-bottom border-secondary pb-3">
            <h1 className="display-4 fw-bold text-white mb-0 me-3">{movie.title}</h1>
            <span className="fs-4 text-muted pb-1">{movie.year}</span>
          </div>
          
          <div className="mb-4">
            <p className="lead text-light"><strong>Director:</strong> {movie.director}</p>
            <div className="d-flex align-items-center mb-3">
              <span className="text-warning fs-4 me-2">★</span>
              <span className="fs-4 fw-bold me-2">{movie.rating.rating !== null ? Number(movie.rating.rating).toFixed(1) : 'N/A'}</span>
              <span className="text-muted fs-6">/ 10 ({movie.rating.numVotes.toLocaleString()} votes)</span>
            </div>
            <div>
              {movie.genres.map(genre => (
                <span key={genre.id} className="badge bg-secondary text-light fs-6 me-2 mb-2 p-2 px-3 fw-normal">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          <h3 className="text-warning mb-3 mt-5 border-bottom border-dark pb-2">Top Cast</h3>
          <div className="row row-cols-2 row-cols-md-3 g-3">
            {movie.stars.map(star => (
              <div key={star.id} className="col">
                <Link href={`/stars/${star.id}`} className="text-decoration-none">
                  <div className="card h-100 bg-black border-secondary hover-indicator transition-all">
                    <div className="card-body p-3 text-center">
                      <h6 className="card-title text-light fw-bold mb-1">{star.name}</h6>
                      {star.birthYear && <small className="text-muted d-block">b. {star.birthYear}</small>}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            {movie.stars.length === 0 && <p className="text-muted">No cast information available.</p>}
          </div>
        </div>

        {/* Right Col - Actions */}
        <div className="col-md-4 mt-4 mt-md-0">
          <div className="card bg-secondary text-light border-0 shadow sticky-top" style={{ top: '6rem', '--bs-bg-opacity': '.1' } as React.CSSProperties}>
            <div className="card-body p-4 text-center">
              <h4 className="fw-bold mb-4">Actions</h4>
              
              <button 
                onClick={handleAddToCart} 
                disabled={addingCart || addedCart}
                className={`btn btn-lg w-100 mb-3 fw-bold shadow-sm ${addedCart ? 'btn-success text-white' : 'btn-warning text-dark'}`}
              >
                {addingCart ? 'Adding...' : addedCart ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
              
              <button 
                onClick={handleToggleWatchlist}
                disabled={addingWatchlist}
                className={`btn w-100 ${addedWatchlist ? 'btn-light text-dark fw-bold' : 'btn-outline-light'}`}
              >
                {addingWatchlist ? 'Updating...' : addedWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
