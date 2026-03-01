'use client';

import { useEffect, useState } from 'react';

// Combined Interface: Detailed properties from 'main'
interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  ratings?: {
    rating: number;
    numVotes: number;
  };
}

// Payload typing from 'feature/phase3-testing'
type MoviesResponse = Movie[] | { data?: Movie[] };

// Robust normalization from 'feature/phase3-testing'
function normalizeMovies(payload: MoviesResponse): Movie[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false); // Error state from 'feature/phase3-testing'

  useEffect(() => {
    // Abort flag to prevent setting state on unmounted component ('feature/phase3-testing')
    let active = true;

    async function loadMovies() {
      try {
        const response = await fetch('/api/movies');
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const payload = (await response.json()) as MoviesResponse;
        if (active) {
          setMovies(normalizeMovies(payload));
          setHasError(false);
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
        if (active) {
          setHasError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMovies();
    return () => {
      active = false;
    };
  }, []);

  // Early return for loading state (styled from 'main')
  if (loading) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Movies...</h1>
        <p>Loading to fetch movies from the database...</p>
      </div>
    );
  }

  // Early return for error state ('feature/phase3-testing')
  if (hasError) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p>Failed to load movies. Please try again later.</p>
      </div>
    );
  }

  // Grid layout and empty state handling (styled from 'main')
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">IMDb Top Movies</h1>
      
      {movies.length === 0 ? (
        <p className="text-center text-red-500 mt-8">No Movies Found!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white text-black">
              <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-semibold">Year:</span> {movie.year}</p>
                <p><span className="font-semibold">Director:</span> {movie.director}</p>
                {movie.ratings && (
                  <p><span className="font-semibold text-blue-600">Rating:</span> ⭐ {movie.ratings.rating} / 10</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}