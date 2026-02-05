// app/page.tsx
'use client';
import { useEffect, useState } from 'react';

interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  rating: number;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/movies')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMovies(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>🎬 Top Movies List</h1>
      {loading ? (
        <p>Loading movies from database...</p>
      ) : (
        <ul>
          {movies.map((movie) => (
            <li key={movie.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
              <h3>{movie.title} ({movie.year})</h3>
              <p>Director: {movie.director}</p>
              <p>Rating: {movie.rating || 'N/A'} ⭐</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}