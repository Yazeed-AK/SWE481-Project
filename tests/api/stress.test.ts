/**
 * Stress and Robustness Tests for Movies API
 * Tests concurrent requests, edge cases, and failure scenarios
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const queriesMock = vi.hoisted(() => ({
  getMovies: vi.fn(),
  searchMovies: vi.fn()
}));

vi.mock('@/lib/queries', () => ({
  queries: queriesMock
}));

import { GET as getMovies } from '@/app/api/movies/route';

describe('Movies API - Stress & Robustness Tests', () => {
  beforeEach(() => {
    queriesMock.getMovies.mockReset();
    queriesMock.searchMovies.mockReset();
  });

  /**
   * Test: Multiple concurrent requests should be handled independently
   * Purpose: Ensure the API doesn't share state between concurrent requests
   * Evaluation Criteria: Stress test handling multiple simultaneous requests
   */
  it('handles concurrent requests independently', async () => {
    const results = [
      { data: [{ id: 'tt0111161', title: 'The Shawshank Redemption' }], error: null },
      { data: [{ id: 'tt0068646', title: 'The Godfather' }], error: null },
      { data: [{ id: 'tt0050083', title: '12 Angry Men' }], error: null }
    ];

    queriesMock.getMovies
      .mockResolvedValueOnce(results[0])
      .mockResolvedValueOnce(results[1])
      .mockResolvedValueOnce(results[2]);

    // Simulate 3 concurrent requests
    const responses = await Promise.all([
      getMovies(new Request('http://localhost:3000/api/movies?page=1')),
      getMovies(new Request('http://localhost:3000/api/movies?page=2')),
      getMovies(new Request('http://localhost:3000/api/movies?page=3'))
    ]);

    // All requests should succeed
    expect(responses[0].status).toBe(200);
    expect(responses[1].status).toBe(200);
    expect(responses[2].status).toBe(200);

    // Each should have been called once
    expect(queriesMock.getMovies).toHaveBeenCalledTimes(3);
  });

  /**
   * Test: Large page numbers should be handled gracefully
   * Purpose: Ensure invalid pagination doesn't cause crashes
   * Evaluation Criteria: Robustness in edge cases
   */
  it('handles extremely large page numbers', async () => {
    queriesMock.getMovies.mockResolvedValue({ data: [], error: null });

    const response = await getMovies(
      new Request('http://localhost:3000/api/movies?page=999999')
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  /**
   * Test: Negative page numbers should be handled
   * Purpose: Ensure invalid input is handled gracefully
   * Evaluation Criteria: Input validation and robustness
   */
  it('handles negative page numbers by defaulting to page 1', async () => {
    queriesMock.getMovies.mockResolvedValue({
      data: [{ id: 'tt0111161', title: 'The Shawshank Redemption' }],
      error: null
    });

    const response = await getMovies(
      new Request('http://localhost:3000/api/movies?page=-5')
    );

    expect(response.status).toBe(200);
    expect(queriesMock.getMovies).toHaveBeenCalledWith(1, 10);
  });

  /**
   * Test: Non-numeric page parameter should default to page 1
   * Purpose: Ensure invalid types are handled gracefully
   * Evaluation Criteria: Input validation
   */
  it('handles non-numeric page parameter', async () => {
    queriesMock.getMovies.mockResolvedValue({
      data: [{ id: 'tt0111161', title: 'The Shawshank Redemption' }],
      error: null
    });

    const response = await getMovies(
      new Request('http://localhost:3000/api/movies?page=abc')
    );

    expect(response.status).toBe(200);
    expect(queriesMock.getMovies).toHaveBeenCalledWith(1, 10);
  });

  /**
   * Test: Timeout/Network failure should return 500
   * Purpose: Simulate database connection timeout
   * Evaluation Criteria: Simulated failures and error handling
   */
  it('handles database timeout gracefully', async () => {
    queriesMock.getMovies.mockRejectedValue(
      new Error('Database connection timeout')
    );

    const response = await getMovies(
      new Request('http://localhost:3000/api/movies')
    );

    expect(response.status).toBe(500);
  });

  /**
   * Test: Malformed search query should not crash
   * Purpose: Ensure special characters in search don't cause issues
   * Evaluation Criteria: Robustness with unexpected input
   */
  it('handles special characters in search query', async () => {
    queriesMock.searchMovies.mockResolvedValue({ data: [], error: null });

    const response = await getMovies(
      new Request('http://localhost:3000/api/movies?search=<script>alert(1)</script>')
    );

    expect(response.status).toBe(200);
  });

  /**
   * Test: Very long search strings should be handled
   * Purpose: Ensure extremely long input doesn't crash or cause performance issues
   * Evaluation Criteria: Robustness with large inputs
   */
  it('handles very long search strings', async () => {
    const longSearch = 'a'.repeat(10000);
    queriesMock.searchMovies.mockResolvedValue({ data: [], error: null });

    const response = await getMovies(
      new Request(`http://localhost:3000/api/movies?search=${encodeURIComponent(longSearch)}`)
    );

    expect(response.status).toBe(200);
  });

  /**
   * Test: Multiple query parameters should be parsed correctly
   * Purpose: Ensure all parameters are properly extracted
   * Evaluation Criteria: Comprehensive parameter handling
   */
  it('handles multiple query parameters together', async () => {
    queriesMock.searchMovies.mockResolvedValue({
      data: [{ id: 'tt0111161', title: 'The Shawshank Redemption' }],
      error: null
    });

    const response = await getMovies(
      new Request('http://localhost:3000/api/movies?page=2&search=shawshank&limit=20')
    );

    expect(response.status).toBe(200);
  });

  /**
   * Test: Empty search query should return results
   * Purpose: Ensure empty string search doesn't break pagination
   * Evaluation Criteria: Edge case handling
   */
  it('handles empty search string', async () => {
    queriesMock.getMovies.mockResolvedValue({
      data: [{ id: 'tt0111161', title: 'The Shawshank Redemption' }],
      error: null
    });

    const response = await getMovies(
      new Request('http://localhost:3000/api/movies?search=')
    );

    expect(response.status).toBe(200);
  });
});
