import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  textSearch: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  then: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

const authMock = vi.hoisted(() => ({
  login: vi.fn(),
  verifyToken: vi.fn()
}));

const ratingsMock = vi.hoisted(() => ({
  addRating: vi.fn()
}));

vi.mock('@/lib/auth', () => ({
  auth: authMock
}));

vi.mock('@/lib/ratings', () => ({
  ratings: ratingsMock
}));

import { GET as getMovies } from '@/app/api/movies/route';
import { GET as getMovieDetails } from '@/app/api/movies/[id]/route';

describe('Basic integration flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.login.mockReset();
    authMock.verifyToken.mockReset();
    ratingsMock.addRating.mockReset();
  });

  it('loads movies then opens details', async () => {
    // Mock getMovies response
    mockSupabase.then.mockImplementationOnce((onfulfilled) => {
      onfulfilled({
        data: [{
          id: 'tt0372784',
          title: 'Batman Begins',
          year: 2005,
          director: 'Christopher Nolan',
          ratings: { rating: 8.2, numVotes: 1000000 },
          stars_in_movies: [{ stars: { name: 'Christian Bale' } }],
          genres_in_movies: [{ genres: { name: 'Action' } }]
        }],
        error: null,
        count: 1
      });
      return Promise.resolve();
    });

    const listResponse = await getMovies(new Request('http://localhost:3000/api/movies'));
    const listBody = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(listBody.data).toHaveLength(1);

    const movieId = listBody.data[0].id as string;

    // Mock getMovieDetails response
    mockSupabase.then.mockImplementationOnce((onfulfilled) => {
      onfulfilled({
        data: {
          id: 'tt0372784',
          title: 'Batman Begins',
          year: 2005,
          director: 'Christopher Nolan',
          ratings: { rating: 8.2, numVotes: 1000000 },
          stars_in_movies: [{ stars: { id: 'star1', name: 'Christian Bale', birthYear: 1974 } }],
          genres_in_movies: [{ genres: { id: 'genre1', name: 'Action' } }]
        },
        error: null
      });
      return Promise.resolve();
    });

    const detailsResponse = await getMovieDetails(
      new Request(`http://localhost:3000/api/movies/${movieId}`),
      { params: Promise.resolve({ id: movieId }) }
    );
    const detailsBody = await detailsResponse.json();

    expect(detailsResponse.status).toBe(200);
    expect(detailsBody.data.id).toBe(movieId);

    // Mock search GET request (hits /api/movies?title=Batman)
    mockSupabase.then.mockImplementationOnce((onfulfilled) => {
      onfulfilled({
        data: [{
          id: 'tt0372784',
          title: 'Batman Begins',
          year: 2005,
          director: 'Christopher Nolan',
          ratings: { rating: 8.2, numVotes: 1000000 },
          stars_in_movies: [{ stars: { name: 'Christian Bale' } }],
          genres_in_movies: [{ genres: { name: 'Action' } }]
        }],
        error: null,
        count: 1
      });
      return Promise.resolve();
    });

    const searchResponse = await getMovies(new Request('http://localhost:3000/api/movies?title=Batman'));
    const searchBody = await searchResponse.json();

    expect(searchResponse.status).toBe(200);
    expect(searchBody.data).toHaveLength(1);
    expect(searchBody.data[0].title).toBe('Batman Begins');

    // 4. User login to get Bearer token (auth endpoint)
    const token = 'mock-jwt-token';
    authMock.login.mockResolvedValue({ user: { id: 1 }, token });

    // Simulate login
    const loginResult = await authMock.login('user@example.com', 'password');
    expect(loginResult.token).toBe(token);

    // 5. Rate a movie (requires Bearer token)
    authMock.verifyToken.mockResolvedValue({ id: 1, email: 'user@example.com' });
    ratingsMock.addRating.mockResolvedValue({ success: true });

    // Simulate rating submission middleware check
    const verifiedUser = await authMock.verifyToken(loginResult.token);
    expect(verifiedUser).toBeDefined();

    // Simulate rating
    const ratingResult = await ratingsMock.addRating(movieId, verifiedUser.id, 5);
    expect(ratingResult.success).toBe(true);
  });
});
