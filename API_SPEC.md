# API Specification

This document defines the REST API endpoints, request/response formats, and database schema for the IMDb Movie App.

## Base URL
All API endpoints are prefixed with `/api`.
Example: `http://localhost:3000/api/movies`

## Endpoints

### 1. List Movies
**GET** `/movies`

Returns a paginated list of movies.

**Query Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `page`    | number | No       | Page number (default: 1) |
| `limit`   | number | No       | Items per page (default: 20) |

**Response (200 OK):**
```json
[
  {
    "tconst": "tt0111161",
    "primaryTitle": "The Shawshank Redemption",
    "startYear": 1994,
    "averageRating": 9.3,
    "genres": ["Drama"]
  },
  ...
]
```

### 2. Search Movies
**GET** `/movies?search={query}`

Search for movies by title (Full Text Search).

**Query Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `search`  | string | Yes      | Search query |

**Response (200 OK):**
Same as List Movies.

### 3. Get Movie Details
**GET** `/movies/[id]`

Returns detailed information for a specific movie.

**Path Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `id`      | string | Yes      | IMDb ID (e.g., `tt0111161`) |

**Response (200 OK):**
```json
{
  "tconst": "tt0111161",
  "titleType": "movie",
  "primaryTitle": "The Shawshank Redemption",
  "originalTitle": "The Shawshank Redemption",
  "isAdult": false,
  "startYear": 1994,
  "endYear": null,
  "runtimeMinutes": 142,
  "genres": ["Drama"],
  "averageRating": 9.3,
  "numVotes": 2343110
}
```

**Response (404 Not Found):**
```json
{ "error": "Movie not found" }
```

## Database Schema

### `movies` Table
| Column | Type | Description |
|--------|------|-------------|
| `tconst` | TEXT (PK) | Unique IMDb ID |
| `titleType` | TEXT | Type of content (e.g., 'movie') |
| `primaryTitle` | TEXT | English title |
| `originalTitle` | TEXT | Original title |
| `isAdult` | BOOLEAN | Adult content flag |
| `startYear` | INTEGER | Release year |
| `endYear` | INTEGER | End year (for series) |
| `runtimeMinutes` | INTEGER | Duration |
| `genres` | TEXT[] | Array of genres |

### `ratings` Table
| Column | Type | Description |
|--------|------|-------------|
| `tconst` | TEXT (FK) | References `movies.tconst` |
| `averageRating` | DECIMAL | Average user rating |
| `numVotes` | INTEGER | Number of votes |

## Frontend-Backend Contract
- Frontend consumes these exact endpoints.
- Dates are ISO 8601 strings if applicable.
- Errors follow `{ "error": "message" }` format.
