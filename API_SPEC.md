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
    "id": "tt0111161",
    "title": "The Shawshank Redemption",
    "year": 1994,
    "director": "Frank Darabont",
    "ratings": {
        "rating": 9.3,
        "numVotes": 2343110
    }
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
  "id": "tt0111161",
  "title": "The Shawshank Redemption",
  "year": 1994,
  "director": "Frank Darabont",
  "ratings": {
      "rating": 9.3,
      "numVotes": 2343110
  },
  "stars_in_movies": [
      {
          "starId": "nm0000151",
          "stars": { "name": "Morgan Freeman" }
      }
  ],
  "genres_in_movies": [
      {
          "genreId": 1,
          "genres": { "name": "Drama" }
      }
  ]
}
```

## Database Schema (CS122B Spec)

### `movies`
| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(10) | Primary Key (tconst) |
| `title` | VARCHAR(100) | |
| `year` | INTEGER | |
| `director` | VARCHAR(100) | |

### `stars`
| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(10) | Primary Key (nconst) |
| `name` | VARCHAR(100) | |
| `birthYear` | INTEGER | |

### `genres`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary Key (Auto-inc) |
| `name` | VARCHAR(32) | |

### `customers`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | PK |
| `firstName` | VARCHAR(50) | |
| `lastName` | VARCHAR(50) | |
| `email` | VARCHAR(50) | |
| `password` | VARCHAR(20) | |

*See `scripts/sql/schema.sql` for full definitions including `sales` and relationships.*
