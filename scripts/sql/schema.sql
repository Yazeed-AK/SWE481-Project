
-- Drop existing tables to ensure clean slate if needed
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS movies;

-- Movies Table
CREATE TABLE "movies" (
    "tconst" TEXT PRIMARY KEY,
    "titleType" TEXT,
    "primaryTitle" TEXT,
    "originalTitle" TEXT,
    "isAdult" BOOLEAN,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "runtimeMinutes" INTEGER,
    "genres" TEXT[]
);

-- Ratings Table
CREATE TABLE "ratings" (
    "tconst" TEXT PRIMARY KEY REFERENCES "movies"("tconst") ON DELETE CASCADE,
    "averageRating" DECIMAL(3, 1),
    "numVotes" INTEGER
);

-- Indexes
CREATE INDEX idx_movies_year ON "movies" ("startYear");
CREATE INDEX idx_ratings_votes ON "ratings" ("numVotes" DESC);
CREATE INDEX idx_movies_fts ON "movies" USING GIN (to_tsvector('english', "primaryTitle"));

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
