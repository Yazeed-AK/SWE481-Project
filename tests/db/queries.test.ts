import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = vi.hoisted(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    returns: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
}));

vi.mock('@/lib/db', () => ({
    db: mockDb
}));

import { queries } from '@/lib/queries';

describe('Database Queries', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks for the chain
        mockDb.from.mockReturnValue(mockDb);
        mockDb.select.mockReturnValue(mockDb);
        mockDb.order.mockReturnValue(mockDb);
        mockDb.range.mockReturnValue(mockDb);
        mockDb.returns.mockReturnValue(mockDb);
        mockDb.textSearch.mockReturnValue(mockDb);
        mockDb.eq.mockReturnValue(mockDb);
    });

    describe('getMovies', () => {
        it('should correctly format pagination and fetch movies', async () => {
            const expectedData = [{ id: '1', title: 'Test Movie' }];
            mockDb.returns.mockResolvedValueOnce({ data: expectedData, error: null });

            const result = await queries.getMovies(2, 10);

            expect(mockDb.from).toHaveBeenCalledWith('movies');
            expect(mockDb.select).toHaveBeenCalledWith(`
                id, title, year, director,
                ratings(rating, numVotes)
            `);
            expect(mockDb.order).toHaveBeenCalledWith('ratings(numVotes)', { ascending: false });
            expect(mockDb.range).toHaveBeenCalledWith(10, 19); // Page 2, PageSize 10: from 10 to 19
            expect(mockDb.returns).toHaveBeenCalled();
            expect(result).toEqual({ data: expectedData, error: null });
        });
    });

    describe('searchMovies', () => {
        it('should structure the database call correctly for searching', async () => {
            const expectedData = [{ id: '1', title: 'Batman' }];
            mockDb.textSearch.mockResolvedValueOnce({ data: expectedData, error: null });

            const result = await queries.searchMovies('Batman');

            expect(mockDb.from).toHaveBeenCalledWith('movies');
            expect(mockDb.select).toHaveBeenCalledWith('id, title, year, director');
            expect(mockDb.textSearch).toHaveBeenCalledWith('title', 'Batman', { type: 'websearch', config: 'english' });
            expect(result).toEqual({ data: expectedData, error: null });
        });
    });

    describe('getMovieById', () => {
        it('should query a single movie by its ID including relationships', async () => {
            const expectedData = { id: 'testId', title: 'The Movie' };
            mockDb.single.mockResolvedValueOnce({ data: expectedData, error: null });

            const result = await queries.getMovieById('testId');

            expect(mockDb.from).toHaveBeenCalledWith('movies');
            expect(mockDb.eq).toHaveBeenCalledWith('id', 'testId');
            expect(mockDb.single).toHaveBeenCalled();

            const selectArg = mockDb.select.mock.calls[0][0];
            expect(selectArg).toContain('id, title, year, director');
            expect(selectArg).toContain('ratings(rating, numVotes)');
            expect(selectArg).toContain('stars_in_movies(starId, stars(name))');
            expect(selectArg).toContain('genres_in_movies(genreId, genres(name))');

            expect(result).toEqual({ data: expectedData, error: null });
        });
    });
});
