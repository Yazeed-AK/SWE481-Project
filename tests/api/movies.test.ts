/**
 * Test file for Movies API
 * Tests the GET /api/movies endpoint
 * 
 * API Specification:
 * - Endpoint: GET /api/movies
 * - Base URL: /api
 * - Query Parameters:
 *   - page (number, optional): Page number for pagination (default: 1)
 *   - limit (number, optional): Items per page (default: 10)
 *   - search (string, optional): Search query for movie titles
 * - No authentication required (public endpoint)
 * - Response Format: {data: Array, error?: string}
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create mock queries for isolated testing
const queriesMock = vi.hoisted(() => ({
  getMovies: vi.fn(),
  searchMovies: vi.fn()
}));

vi.mock('@/lib/queries', () => ({
  queries: queriesMock
}));

import { GET } from '@/app/api/movies/route';

describe('GET /api/movies', () => {
  beforeEach(() => {
    // Reset mocks before each test
    queriesMock.getMovies.mockReset();
    queriesMock.searchMovies.mockReset();
  });

  /**
   * Test: Verify that page 1 is returned by default when no page parameter is specified
   * Purpose: Ensure API returns data from page 1 when no page query parameter is provided
   * API Key/Auth: None required (public endpoint)
   * Query Parameters: Default pagination (page=1)
   */
  it('returns page 1 by default', async () => {
    const result = {
      data: [{ id: 'tt0111161', title: 'The Shawshank Redemption', year: 1994, director: 'Frank Darabont' }],
      error: null
    };
    queriesMock.getMovies.mockResolvedValue(result);

    const response = await GET(new Request('http://localhost:3000/api/movies'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queriesMock.getMovies).toHaveBeenCalledWith(1, 10);
    expect(body).toEqual(result);
    expect(body.data[0]).toEqual(
      expect.objectContaining({
        id: 'tt0111161',
        title: 'The Shawshank Redemption',
        year: 1994,
        director: 'Frank Darabont'
      })
    );
  });

  /**
   * Test: Verify that pagination works correctly when page=2
   * Purpose: Ensure API correctly passes the page parameter to the query layer
   * API Key/Auth: None required (public endpoint)
   * Query Parameters: page=2
   */
  it('uses pagination for page=2', async () => {
    const result = { data: [{ id: 'tt0068646', title: 'The Godfather' }], error: null };
    queriesMock.getMovies.mockResolvedValue(result);

    const response = await GET(new Request('http://localhost:3000/api/movies?page=2'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queriesMock.getMovies).toHaveBeenCalledWith(2, 10);
    expect(body).toEqual(result);
  });

  /**
   * Test: Search for movies using the search parameter
   * Purpose: Verify that search calls searchMovies instead of getMovies
   * API Key/Auth: None required (public endpoint)
   * Query Parameters: search=batman (partial title matching)
   * Scenario: When searching for 'batman', results must contain 'batman' in the title
   */
  it('searches titles when search=batman', async () => {
    const result = {
      data: [
        { id: 'tt0372784', title: 'Batman Begins' },
        { id: 'tt1877830', title: 'The Batman' }
      ],
      error: null
    };
    queriesMock.searchMovies.mockResolvedValue(result);

    const response = await GET(new Request('http://localhost:3000/api/movies?search=batman'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queriesMock.searchMovies).toHaveBeenCalledWith('batman');
    expect(queriesMock.getMovies).not.toHaveBeenCalled();
    expect(body.data.every((movie: { title: string }) => movie.title.toLowerCase().includes('batman'))).toBe(true);
  });

  /**
   * Test: Invalid page values should be normalized
   * Purpose: Ensure page defaults to 1 for malformed/negative values
   */
  it('normalizes invalid page values to page 1', async () => {
    queriesMock.getMovies.mockResolvedValue({ data: [], error: null });

    await GET(new Request('http://localhost:3000/api/movies?page=-8'));
    expect(queriesMock.getMovies).toHaveBeenCalledWith(1, 10);

    queriesMock.getMovies.mockReset();
    queriesMock.getMovies.mockResolvedValue({ data: [], error: null });

    await GET(new Request('http://localhost:3000/api/movies?page=abc'));
    expect(queriesMock.getMovies).toHaveBeenCalledWith(1, 10);
  });

  /**
   * Test: Safely handle database errors
   * Purpose: Ensure API returns status 500 with clear error message on database failure
   * API Key/Auth: None required
   * Error Handling: Database failures return 500 with error message
   */
  it('handles database failure safely with 500', async () => {
    queriesMock.getMovies.mockRejectedValue(new Error('database down'));

    const response = await GET(new Request('http://localhost:3000/api/movies'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to fetch movies' });
  });

  /**
   * Test: Support limit query parameter for results
   * Status: RED - This test expects behavior not yet implemented
   * Purpose: Verify that API passes limit parameter to the query layer
   * Note: This test will currently fail as the feature is not yet implemented
   */
  it('supports limit query parameter', async () => {
    queriesMock.getMovies.mockResolvedValue({ data: [], error: null });

    await GET(new Request('http://localhost:3000/api/movies?page=1&limit=10'));

    expect(queriesMock.getMovies).toHaveBeenCalledWith(1, 10);
  });

  /**
   * Test: Invalid limit should fall back to default
   * Purpose: Ensure malformed limit values do not break pagination
   */
  it('defaults to limit=10 when limit is invalid', async () => {
    queriesMock.getMovies.mockResolvedValue({ data: [], error: null });

    await GET(new Request('http://localhost:3000/api/movies?page=2&limit=abc'));

    expect(queriesMock.getMovies).toHaveBeenCalledWith(2, 10);
  });
});
