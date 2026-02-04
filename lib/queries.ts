
import { db } from './db';

export const queries = {
    getMovies: async (page = 1, pageSize = 20) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Join with ratings to get rating data
        return await db
            .from('movies')
            .select('id, title, year, director, ratings(rating, numVotes)')
            .order('ratings(numVotes)', { ascending: false }) // Sort by popularity by default
            .range(from, to);
    },

    searchMovies: async (query: string) => {
        return await db
            .from('movies')
            .select('id, title, year, director')
            .textSearch('title', query, {
                type: 'websearch',
                config: 'english'
            });
    },

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
            .single();
    }
};
