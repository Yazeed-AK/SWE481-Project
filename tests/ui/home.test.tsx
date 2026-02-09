// @vitest-environment jsdom
/**
 * Test file for Home Page
 * Tests navigation links on the home page
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from '@/app/page';

describe('Home page', () => {
  /**
   * Test: Verify navigation links are rendered
   * Purpose: Ensure home page contains links to navigate to other pages
   * Expected links:
   * 1. 'Browse movies' - navigates to /movies
   * 2. 'Search movies' - navigates to /search
   */
  it('renders navigation links', () => {
    render(<Home />);

    const browseLink = screen.getByRole('link', { name: /browse movies/i });
    const searchLink = screen.getByRole('link', { name: /search movies/i });

    expect(browseLink).toHaveAttribute('href', '/movies');
    expect(searchLink).toHaveAttribute('href', '/search');
  });
});
