'use client';

import { FormEvent, useState } from 'react';

export default function SearchPage() {
    const [query, setQuery] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Search</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="movie-search">Search</label>
                <input
                    id="movie-search"
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <button type="submit">Search</button>
            </form>
        </div>
    );
}
