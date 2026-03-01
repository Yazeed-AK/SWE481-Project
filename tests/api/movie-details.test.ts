/**
 * Test file for Movie Details API
 * Tests the GET /api/movies/[id] endpoint for retrieving a single movie's details
 * 
 * API Specification:
 * - Endpoint: GET /api/movies/[id]
 * - URL Parameters: id (string, required) - Movie ID from IMDb (e.g., "tt0111161")
 * - No authentication required (public endpoint)
 * - Response Format: {data: Object, error?: string}
 * - Returns: Movie details including stars array and genres array
 * - Error Cases: 404 Not Found if movie doesn't exist
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create mock query function for isolated testing
const queriesMock = vi.hoisted(() => ({
  getMovieById: vi.fn()
}));

vi.mock('@/lib/queries', () => ({
  queries: queriesMock
}));

import { GET } from '@/app/api/movies/[id]/route';

describe('GET /api/movies/[id]', () => {
  beforeEach(() => {
    // Reset mock before each test
    queriesMock.getMovieById.mockReset();
  });

  /**
   * Test: Verify successful movie details retrieval
   * Purpose: Ensure API returns details contract with stars and genres
   */
  it('returns movie details for a valid movie id', async () => {
    const result = {
      data: {
        id: 'tt0111161',
        title: 'The Shawshank Redemption',
        stars: [{ id: 'nm0000151', name: 'Morgan Freeman' }],
        genres: ['Drama']
      },
      error: null
    };
    queriesMock.getMovieById.mockResolvedValue(result);

    const response = await GET(
      new Request('http://localhost:3000/api/movies/tt0111161'),
      { params: Promise.resolve({ id: 'tt0111161' }) }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queriesMock.getMovieById).toHaveBeenCalledWith('tt0111161');
    expect(body).toEqual(result);
    expect(body.data.stars).toBeDefined();
    expect(body.data.genres).toBeDefined();
  });

  /**
   * Test: Verify handling of invalid movie IDs
   * Purpose: Ensure API returns 404 when searching for non-existent movie
   * Scenario: When movie ID is not found in database, should return 'Movie not found'
   */
  it('returns 404 for invalid movie id', async () => {
    queriesMock.getMovieById.mockResolvedValue({ data: null, error: null });

    const response = await GET(
      new Request('http://localhost:3000/api/movies/invalid-id'),
      { params: Promise.resolve({ id: 'invalid-id' }) }
    );
    const body = await response.json();

    expect(queriesMock.getMovieById).toHaveBeenCalledWith('invalid-id');
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'Movie not found' });
  });
});
