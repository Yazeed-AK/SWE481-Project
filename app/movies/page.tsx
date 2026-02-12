'use client';

import { useEffect, useState } from 'react';

type Movie = {
    id: string;
    title: string;
};

type MoviesResponse = Movie[] | { data?: Movie[] };

function normalizeMovies(payload: MoviesResponse): Movie[] {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload.data)) {
        return payload.data;
    }

    return [];
}

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
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
            } catch {
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

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Movies</h1>

            {loading ? <p>Loading...</p> : null}
            {!loading && hasError ? <p>Failed to load movies</p> : null}
            {!loading && !hasError && movies.length === 0 ? <p>No movies found</p> : null}

            {!loading && !hasError && movies.length > 0 ? (
                <ul>
                    {movies.map((movie) => (
                        <li key={movie.id}>{movie.title}</li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
