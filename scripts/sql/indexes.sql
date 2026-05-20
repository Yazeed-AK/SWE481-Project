
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies (year);
CREATE INDEX IF NOT EXISTS idx_ratings_votes ON ratings (numVotes DESC);
CREATE INDEX IF NOT EXISTS idx_stars_in_movies_movie ON stars_in_movies (movieId);
CREATE INDEX IF NOT EXISTS idx_genres_in_movies_movie ON genres_in_movies (movieId);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales (customerId);
CREATE INDEX IF NOT EXISTS idx_sales_movie ON sales (movieId);
