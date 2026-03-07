'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface StarDetail {
  id: string;
  name: string;
  birthYear: number | null;
  movies: {
    id: string;
    title: string;
    year: number;
    director: string;
  }[];
}

export default function SingleStarPage() {
  const params = useParams();
  const starId = params?.id as string;
  
  const [star, setStar] = useState<StarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!starId) return;

    const fetchStar = async () => {
      try {
        const res = await fetch(`/api/stars/${starId}`);
        if (!res.ok) {
          throw new Error('Star not found');
        }
        const json = await res.json();
        setStar(json.data);
      } catch (err: unknown) {
        setError((err instanceof Error ? err.message : (typeof err === "object" && err !== null && "message" in err ? String((err as Record<string, unknown>).message) : String(err))) || 'Failed to load star');
      } finally {
        setLoading(false);
      }
    };

    fetchStar();
  }, [starId]);

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !star) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-danger mb-4">{error}</h2>
        <Link href="/movies" className="btn btn-outline-light">Back to Browse</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          
          <div className="text-center mb-5 border-bottom border-dark pb-4">
            <h1 className="display-3 fw-bold text-white mb-2">{star.name}</h1>
            <p className="fs-5 text-muted">
              {star.birthYear ? `Born: ${star.birthYear}` : 'Birth year unknown'}
            </p>
          </div>

          <h3 className="text-warning mb-4 pb-2">Filmography</h3>
          
          <div className="list-group list-group-flush rounded shadow-sm bg-transparent">
            {star.movies.length > 0 ? (
              star.movies.sort((a, b) => b.year - a.year).map(movie => (
                <Link 
                  key={movie.id} 
                  href={`/movies/${movie.id}`} 
                  className="list-group-item list-group-item-action bg-secondary text-light border-dark py-3 ps-4 d-flex justify-content-between align-items-center hover-bg-dark transition-all"
                  style={{ '--bs-bg-opacity': '.1' } as React.CSSProperties}
                >
                  <div>
                    <h5 className="mb-1 text-white fw-semibold">{movie.title}</h5>
                    <small className="text-muted d-block">Directed by {movie.director}</small>
                  </div>
                  <span className="badge bg-warning text-dark fs-6 rounded-pill px-3 py-2">{movie.year}</span>
                </Link>
              ))
            ) : (
              <div className="text-center py-5 bg-dark rounded border border-secondary" style={{ '--bs-bg-opacity': '.5' } as React.CSSProperties}>
                <p className="text-muted mb-0 fs-5">No movies found for this actor.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
