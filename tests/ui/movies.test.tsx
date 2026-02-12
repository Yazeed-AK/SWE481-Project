// @vitest-environment jsdom
/**
 * Test file for Movies Page
 * Tests movie list rendering, loading states, and error handling
 */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MoviesPage from '@/app/movies/page';

describe('Movies page', () => {
  // Mock fetch function to simulate API calls
  const mockFetch = vi.fn();

  beforeEach(() => {
    // Reset mock before each test
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  /**
   * Test: Render movie list after loading completes
   * Status: RED - This test expects basic rendering functionality
   * Purpose: Verify loading states and display of fetched data
   * Scenario: First shows 'Loading...' then displays the movie title
   */
  it('RED: renders list after loading', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'tt0372784', title: 'Batman Begins' }]
    });

    render(<MoviesPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(await screen.findByText('Batman Begins')).toBeInTheDocument();
  });

  /**
   * Test: Display error state when fetch fails
   * Purpose: Ensure page shows clear error message when movie loading fails
   * Scenario: On network error, should display 'Failed to load movies'
   */
  it('renders error state on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('network error'));

    render(<MoviesPage />);

    expect(await screen.findByText(/failed to load movies/i)).toBeInTheDocument();
  });

  /**
   * Test: Display empty state when no movies are available
   * Purpose: Ensure page shows appropriate message when no movies exist
   * Scenario: When API returns empty list, should display 'No movies found'
   */
  it('renders empty state when API returns empty list', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });

    render(<MoviesPage />);

    expect(await screen.findByText(/no movies found/i)).toBeInTheDocument();
  });
});
