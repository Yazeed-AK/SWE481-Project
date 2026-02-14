export interface Movie {
    id: string; // tconst
    title: string;
    year: number;
    director: string;
}

export interface Star {
    id: string; // nconst
    name: string;
    birthYear: number | null;
}

export interface Genre {
    id: number;
    name: string;
}

export interface Rating {
    movieId: string;
    rating: number;
    numVotes: number;
}

// Join Types for API Responses
export interface MovieWithRating extends Movie {
    ratings: {
        rating: number;
        numVotes: number;
    } | null;
}

export interface MovieDetail extends Movie {
    ratings: {
        rating: number;
        numVotes: number;
    } | null;
    stars_in_movies: {
        starId: string;
        stars: {
            name: string;
        } | null;
    }[];
    genres_in_movies: {
        genreId: number;
        genres: {
            name: string;
        } | null;
    }[];
}

// Simplified API Response Types (if we transform the data)
export interface MovieResponse {
    id: string;
    title: string;
    year: number;
    director: string;
    rating: number | null;
    numVotes: number | null;
}

export interface MovieDetailResponse {
    id: string;
    title: string;
    year: number;
    director: string;
    rating: number | null;
    numVotes: number | null;
    stars: { id: string; name: string }[];
    genres: string[];
}
