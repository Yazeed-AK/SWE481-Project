'use client';

import { FormEvent, useState } from 'react';

// Detailed properties from 'main'
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

// Re-using payload normalization from the previous resolution for consistency
type MoviesResponse = Movie[] | { data?: Movie[] };

function normalizeMovies(payload: MoviesResponse): Movie[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Strongly typed event from 'feature/phase3-testing', logic from 'main'
  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); 
    if (!query.trim()) return; 

    setLoading(true);
    setHasSearched(true);
    setHasError(false);

    try {
      const res = await fetch(`/api/movies?search=${encodeURIComponent(query)}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch search results');
      }

      const payload = (await res.json()) as MoviesResponse;
      setMovies(normalizeMovies(payload));
    } catch (error) {
      console.error("Error searching movies:", error);
      setHasError(true);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Search IMDb Movies</h1>

      <form onSubmit={handleSearch} className="flex gap-4 justify-center mb-12 items-center">
        {/* Accessible label from 'feature/phase3-testing', hidden visually to preserve 'main' design */}
        <label htmlFor="movie-search" className="sr-only">Search</label>
        <input
          id="movie-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by movie title (e.g., The Matrix)..."
          className="border border-gray-300 bg-gray-50 p-4 rounded-lg w-full max-w-xl text-gray-900 placeholder-gray-500 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
        >
          Search
        </button>
      </form>

      {/* Loading message */}
      {loading && <p className="text-center text-lg font-medium text-gray-500">Searching database...</p>}

      {/* Error message */}
      {!loading && hasError && (
        <p className="text-center text-red-500 text-lg mt-8 bg-red-50 py-4 rounded-lg">
          Failed to fetch search results. Please try again.
        </p>
      )}

      {/* No results found message */}
      {!loading && !hasError && hasSearched && movies.length === 0 && (
        <p className="text-center text-red-500 text-lg mt-8 bg-red-50 py-4 rounded-lg">
          No movies found matching: &quot;{query}&quot;
        </p>
      )}

      {/* Search results grid */}
      {!loading && !hasError && movies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="border p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-white text-black">
              <h2 className="text-xl font-bold mb-3 border-b pb-2">{movie.title}</h2>
              <div className="text-sm text-gray-700 space-y-2">
                <p className="flex justify-between">
                  <span className="font-semibold text-gray-900">Year:</span> {movie.year}
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold text-gray-900">Director:</span> {movie.director}
                </p>
                {movie.ratings && (
                  <p className="flex justify-between items-center bg-gray-50 p-2 rounded mt-2">
                    <span className="font-semibold text-blue-800">Rating:</span> 
                    <span className="font-bold text-lg">⭐ {movie.ratings.rating}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}