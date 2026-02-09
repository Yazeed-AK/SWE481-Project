/**
 * Test file for Movie Details API
 * Tests the GET /api/movies/[id] endpoint for retrieving a single movie's details
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
