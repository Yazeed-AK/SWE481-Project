import { db } from './db';
import { MovieWithRating, MovieDetail } from './types';

export const queries = {
    /**
     * Retrieves a paginated list of movies, ordered by popularity (number of votes).
     * @param page - The page number to retrieve (default: 1).
     * @param pageSize - The number of items per page (default: 20).
     * @returns A promise that resolves to the Supabase result containing a list of movies with their ratings.
     */
    getMovies: async (page = 1, pageSize = 20) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Join with ratings to get rating data
        return await db
            .from('movies')
            .select(`
                id, title, year, director,
                ratings(rating, numVotes)
            `)
            .order('ratings(numVotes)', { ascending: false }) // Sort by popularity by default
            .range(from, to)
            .returns<MovieWithRating[]>();
    },

    /**
     * Searches for movies by title using a full-text search.
     * @param query - The search query string.
     * @returns A promise that resolves to the Supabase result containing matching movies.
     */
    searchMovies: async (query: string) => {
        return await db
            .from('movies')
            .select('id, title, year, director')
            .textSearch('title', query, {
                type: 'websearch',
                config: 'english'
            });
    },

    /**
     * Retrieves detailed information for a specific movie by its ID, including ratings, stars, and genres.
     * @param id - The unique movie ID (tconst).
     * @returns A promise that resolves to the Supabase result containing the movie details.
     */
    getMovieById: async (id: string) => {
        return await db
            .from('movies')
            .select(`
        id, title, year, director,
        ratings(rating, numVotes),
        stars_in_movies(starId, stars(name)),
        genres_in_movies(genreId, genres(name))
      `)
            .eq('id', id)
            .single<MovieDetail>();
    }
};
