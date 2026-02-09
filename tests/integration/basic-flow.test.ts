import { beforeEach, describe, expect, it, vi } from 'vitest';

const queriesMock = vi.hoisted(() => ({
  getMovies: vi.fn(),
  getMovieById: vi.fn(),
  searchMovies: vi.fn()
}));

vi.mock('@/lib/queries', () => ({
  queries: queriesMock
}));

import { GET as getMovies } from '@/app/api/movies/route';
import { GET as getMovieDetails } from '@/app/api/movies/[id]/route';

describe('Basic integration flow', () => {
  beforeEach(() => {
    queriesMock.getMovies.mockReset();
    queriesMock.getMovieById.mockReset();
    queriesMock.searchMovies.mockReset();
  });

  it('loads movies then opens details', async () => {
    queriesMock.getMovies.mockResolvedValue({
      data: [{ id: 'tt0372784', title: 'Batman Begins' }],
      error: null
    });
    queriesMock.getMovieById.mockResolvedValue({
      data: { id: 'tt0372784', title: 'Batman Begins' },
      error: null
    });

    const listResponse = await getMovies(new Request('http://localhost:3000/api/movies'));
    const listBody = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(listBody.data).toHaveLength(1);

    const movieId = listBody.data[0].id as string;
    const detailsResponse = await getMovieDetails(
      new Request(`http://localhost:3000/api/movies/${movieId}`),
      { params: Promise.resolve({ id: movieId }) }
    );
    const detailsBody = await detailsResponse.json();

    expect(detailsResponse.status).toBe(200);
    expect(detailsBody.data.id).toBe(movieId);
  });
});
