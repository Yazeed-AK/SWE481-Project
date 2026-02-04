
import { db } from './db';

export const queries = {
    getMovies: async (page = 1, pageSize = 20) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        return await db
            .from('movies')
            .select('*')
            .range(from, to);
    },

    searchMovies: async (query: string) => {
        return await db
            .from('movies')
            .select('*')
            .textSearch('primaryTitle', query, {
                type: 'websearch',
                config: 'english'
            });
    },

    getMovieById: async (id: string) => {
        return await db
            .from('movies')
            .select('*')
            .eq('tconst', id)
            .single();
    }
};
