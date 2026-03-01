// @vitest-environment jsdom
/**
 * Test file for Search Page
 * Tests the search page component and user interactions
 * Uses jsdom environment to simulate DOM for component testing
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SearchPage from '@/app/search/page';

describe('Search page', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  /**
   * Test: Verify input field and submit button exist and behave correctly
   * Status: RED - This test expects basic search functionality
   * Purpose: Simulate user typing 'batman' and clicking the search button
   * Note: Verifies that input value is correctly preserved in the input field
   */
  it('RED: contains input and submit behavior', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const input = screen.getByRole('textbox', { name: /search/i });
    const submitButton = screen.getByRole('button', { name: /search/i });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] })
    });

    await user.type(input, 'batman');
    await user.click(submitButton);

    expect(input).toHaveValue('batman');
  });
});
