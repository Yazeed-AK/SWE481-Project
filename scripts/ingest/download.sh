#!/bin/bash
# scripts/ingest/download.sh
# Downloads official IMDb datasets

# Ensure data directory exists
mkdir -p data

echo "Downloading title.basics.tsv.gz..."
curl -o data/title.basics.tsv.gz "https://datasets.imdbws.com/title.basics.tsv.gz"

echo "Downloading title.ratings.tsv.gz..."
curl -o data/title.ratings.tsv.gz "https://datasets.imdbws.com/title.ratings.tsv.gz"

echo "Download complete. Files saved to /data directory."
