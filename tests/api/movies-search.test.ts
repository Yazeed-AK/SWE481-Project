/**
 * Test file for Movies Search API
 * Tests the GET /api/movies/search endpoint from API_SPEC.md
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const queriesMock = vi.hoisted(() => ({
  searchMovies: vi.fn()
}));

vi.mock('@/lib/queries', () => ({
  queries: queriesMock
}));

import { GET } from '@/app/api/movies/search/route';

describe('GET /api/movies/search', () => {
  beforeEach(() => {
    queriesMock.searchMovies.mockReset();
  });

  it('searches movies when q is provided', async () => {
    const result = {
      data: [{ id: 'tt0076759', title: 'Star Wars', year: 1977 }],
      error: null
    };
    queriesMock.searchMovies.mockResolvedValue(result);

    const response = await GET(new Request('http://localhost:3000/api/movies/search?q=Star%20Wars'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(queriesMock.searchMovies).toHaveBeenCalledWith('Star Wars');
    expect(body).toEqual(result);
  });

  it('returns 400 when q is missing', async () => {
    const response = await GET(new Request('http://localhost:3000/api/movies/search'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Missing required query parameter: q' });
    expect(queriesMock.searchMovies).not.toHaveBeenCalled();
  });

  it('returns 400 when q is blank', async () => {
    const response = await GET(new Request('http://localhost:3000/api/movies/search?q=   '));

    expect(response.status).toBe(400);
    expect(queriesMock.searchMovies).not.toHaveBeenCalled();
  });

  it('handles search query failures with 500', async () => {
    queriesMock.searchMovies.mockRejectedValue(new Error('db error'));

    const response = await GET(new Request('http://localhost:3000/api/movies/search?q=Batman'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to search movies' });
  });
});
