/**
 * Test file for Movies API
 * Tests the GET /api/movies endpoint
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
   */
  it('returns page 1 by default', async () => {
    const result = { data: [{ id: 'tt0111161', title: 'The Shawshank Redemption' }], error: null };
    queriesMock.getMovies.mockResolvedValue(result);

    const response = await GET(new Request('http://localhost:3000/api/movies'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queriesMock.getMovies).toHaveBeenCalledWith(1);
    expect(body).toEqual(result);
  });

  /**
   * Test: Verify that pagination works correctly when page=2
   * Purpose: Ensure API correctly passes the page parameter to the query layer
   */
  it('uses pagination for page=2', async () => {
    const result = { data: [{ id: 'tt0068646', title: 'The Godfather' }], error: null };
    queriesMock.getMovies.mockResolvedValue(result);

    const response = await GET(new Request('http://localhost:3000/api/movies?page=2'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queriesMock.getMovies).toHaveBeenCalledWith(2);
    expect(body).toEqual(result);
  });

  /**
   * Test: Search for movies using the search parameter
   * Purpose: Verify that search calls searchMovies instead of getMovies
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
   * Test: Safely handle database errors
   * Purpose: Ensure API returns status 500 with clear error message on database failure
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
  it('RED: supports limit query parameter', async () => {
    queriesMock.getMovies.mockResolvedValue({ data: [], error: null });

    await GET(new Request('http://localhost:3000/api/movies?page=1&limit=10'));

    // Expected behavior (not implemented yet): pass page size from query to query layer.
    expect(queriesMock.getMovies).toHaveBeenCalledWith(1, 10);
  });
});
