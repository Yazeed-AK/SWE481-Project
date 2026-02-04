
-- Schema creation for IMDb movies
CREATE TABLE IF NOT EXISTS movies (
    tconst TEXT PRIMARY KEY,
    titleType TEXT,
    primaryTitle TEXT,
    originalTitle TEXT,
    isAdult BOOLEAN,
    startYear INTEGER,
    endYear INTEGER,
    runtimeMinutes INTEGER,
    genres TEXT[]
);

-- Optional: Add ratings table if needed based on import_ratings.ts
CREATE TABLE IF NOT EXISTS ratings (
    tconst TEXT PRIMARY KEY REFERENCES movies(tconst),
    averageRating DECIMAL(3, 1),
    numVotes INTEGER
);
