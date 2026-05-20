import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  textSearch: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

import { GET } from '@/app/api/movies/search/route';

describe('GET /api/movies/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches movies when q is provided', async () => {
    const mockData = [{ id: 'tt0076759', title: 'Star Wars', year: 1977 }];
    mockSupabase.limit.mockResolvedValueOnce({ data: mockData, error: null });

    const response = await GET(new Request('http://localhost:3000/api/movies/search?q=Star%20Wars'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockSupabase.from).toHaveBeenCalledWith('movies');
    expect(mockSupabase.textSearch).toHaveBeenCalledWith('title', 'Star:* & Wars:*', { config: 'english', type: 'to_tsquery' });
    expect(body).toEqual({ data: mockData });
  });

  it('returns 400 when q is missing', async () => {
    const response = await GET(new Request('http://localhost:3000/api/movies/search'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Missing required query parameter: q' });
  });

  it('returns 400 when q is blank', async () => {
    const response = await GET(new Request('http://localhost:3000/api/movies/search?q=   '));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'Missing required query parameter: q' });
  });

  it('handles search query failures with 500', async () => {
    mockSupabase.limit.mockRejectedValueOnce(new Error('db error'));

    const response = await GET(new Request('http://localhost:3000/api/movies/search?q=Batman'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to search movies' });
  });
});
