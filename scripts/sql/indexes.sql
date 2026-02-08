
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies USING GIN (to_tsvector('english', primaryTitle));
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies (startYear);
CREATE INDEX IF NOT EXISTS idx_ratings_votes ON ratings (numVotes DESC);
