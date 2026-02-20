"use client";

import { useEffect, useState } from 'react';

// Define the movie data type based on your JSON structure
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

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Frontend requests data from the Backend API
    fetch('/api/movies')
      .then((res) => res.json())
      .then((json) => {
        // 2. Extract the movies array located inside the "data" property
        setMovies(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching movies:", err);
        setLoading(false);
      });
  }, []);

  // Simple loading screen while data is being fetched
  if (loading) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Movies...</h1>
        <p>Loading to fetch movies from the database...</p>
      </div>
    );
  }

  // 3. Display movies in a Grid layout after data arrives
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">IMDb Top Movies</h1>
      
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
      
      {movies.length === 0 && (
        <p className="text-center text-red-500 mt-8">No Movies Found!</p>
      )}
    </div>
  );
}