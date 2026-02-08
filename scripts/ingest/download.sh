#!/bin/bash
# scripts/ingest/download.sh
# Downloads official IMDb datasets

# Ensure data directory exists
mkdir -p data

# Movies Basics (Title, Year, Genres)
echo "Downloading title.basics.tsv.gz..."
curl -o data/title.basics.tsv.gz "https://datasets.imdbws.com/title.basics.tsv.gz"

# Ratings (Votes, Average)
echo "Downloading title.ratings.tsv.gz..."
curl -o data/title.ratings.tsv.gz "https://datasets.imdbws.com/title.ratings.tsv.gz"

# Crew (Directors)
echo "Downloading title.crew.tsv.gz..."
curl -o data/title.crew.tsv.gz "https://datasets.imdbws.com/title.crew.tsv.gz"

# Principals (Actors/Stars)
echo "Downloading title.principals.tsv.gz..."
curl -o data/title.principals.tsv.gz "https://datasets.imdbws.com/title.principals.tsv.gz"

# Names (Director/Actor Names)
echo "Downloading name.basics.tsv.gz..."
curl -o data/name.basics.tsv.gz "https://datasets.imdbws.com/name.basics.tsv.gz"

echo "Download complete. Files saved to /data directory."
