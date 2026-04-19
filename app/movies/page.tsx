'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  rating: number | null;
  genres: string[];
}

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [titleFilter, setTitleFilter] = useState('');

  useEffect(() => {
    fetchMovies(page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, titleFilter]);

  const fetchMovies = async (pageToFetch: number) => {
    setLoading(true);
    try {
      const url = new URL('/api/movies', window.location.origin);
      url.searchParams.append('page', pageToFetch.toString());
      if (titleFilter) url.searchParams.append('title', titleFilter);

      const res = await fetch(url.toString());
      const json = await res.json();
      
      if (json.data) {
        setMovies(json.data);
        setTotalPages(json.meta.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch movies', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 bg-dark min-vh-100 text-light">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
        <h2 className="text-warning fw-bold mb-0">Browse Movies</h2>
        
        <div className="w-25">
          <input 
            type="text" 
            className="form-control bg-dark text-light border-secondary focus-ring focus-ring-warning" 
            placeholder="Search titles..." 
            value={titleFilter}
            onChange={(e) => {
              setTitleFilter(e.target.value);
              setPage(1); 
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            {movies.map((movie) => (
              <div key={movie.id} className="col">
                <div className="card h-100 bg-secondary text-light border-0 shadow-sm" style={{ '--bs-bg-opacity': '.2' } as React.CSSProperties}>
                  <div className="card-body">
                    <h5 className="card-title fw-bold text-white text-truncate" title={movie.title}>
                      {movie.title}
                    </h5>
                    <h6 className="card-subtitle mb-2 text-muted">{movie.year} | {movie.director}</h6>
                    
                    <div className="d-flex align-items-center mb-3">
                      <span className="text-warning me-1">★</span>
                      <span className="fw-bold">{movie.rating !== null ? Number(movie.rating).toFixed(1) : 'N/A'}</span>
                    </div>

                    <div className="mb-3">
                      {movie.genres.slice(0, 3).map((genre, idx) => (
                        <span key={idx} className="badge rounded-pill border border-secondary text-secondary me-1 fw-normal">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="card-footer bg-transparent border-0 pt-0">
                    <Link href={`/movies/${movie.id}`} className="btn btn-outline-warning w-100 fw-semibold">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-5">
              <button 
                className="btn btn-secondary px-4 border-0" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                &laquo; Prev
              </button>
              
              <span className="text-muted fw-semibold">
                Page <span className="text-white">{page}</span> of {totalPages}
              </span>
              
              <button 
                className="btn btn-secondary px-4 border-0" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
