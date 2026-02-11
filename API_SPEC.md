
# API Specifications & Database Schema

This document defines the REST API endpoints, request/response formats, and database schema for the IMDb Movie App.  
These specifications serve as the contract between the Frontend and Backend for current and future phases.

---

## Base URL

All API endpoints are prefixed with `/api`.  
**Example:** `http://localhost:3000/api/movies`

---

# 1. Movies API

## List Top Movies

**GET** `/api/movies`  
Retrieves a list of the top-rated movies ordered by rating.

### Query Parameters

| Parameter | Type | Required | Description |
|------------|--------|------------|----------------|
| `page` | number | No | Page number for pagination (default: 1) |
| `limit` | number | No | Items per page (default: 10) |

### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "tt0111161",
      "title": "The Shawshank Redemption",
      "year": 1994,
      "director": "Frank Darabont",
      "rating": 9.3
    }
  ]
}
```

---

## Search Movies (Planned)

**GET** `/api/movies/search`  
Search for movies by title using partial matching.

### Query Parameters

| Parameter | Type | Required | Description |
|------------|--------|------------|----------------|
| `q` | string | Yes | The search query string (e.g., `"Star Wars"`) |

---

## Get Movie Details (Planned)

**GET** `/api/movies/[id]`  
Returns detailed information (stars, genres) for a specific movie.

### Response Example

```json
{
  "id": "tt0111161",
  "title": "The Shawshank Redemption",
  "stars": [
    { "id": "nm0000151", "name": "Morgan Freeman" }
  ],
  "genres": ["Drama"]
}
```

---

# 2. Authentication API (Planned for Phase 3)

## User Login

**POST** `/api/auth/login`  
Authenticates a user and returns a session token.

### Request Payload

```json
{
  "email": "user@example.com",
  "password": "securePass123"
}
```

### Response — 200 OK

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUz...",
  "user": { "id": 1, "firstName": "Yasser" }
}
```

### Error — 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## User Registration

**POST** `/api/auth/register`  
Creates a new customer account.

### Fields

| Field | Type | Required | Description |
|---------|--------|------------|----------------|
| email | string | Yes | Unique email address |
| password | string | Yes | Min 8 chars |
| firstName | string | Yes | Customer first name |
| lastName | string | Yes | Customer last name |

---

# 3. Core Interactions (Planned)

## Rate a Movie

**POST** `/api/ratings`  
Allows a logged-in user to rate a movie.

**Auth Required:** Yes  
Header: `Authorization: Bearer <token>`

### Request Payload

```json
{
  "movieId": "tt0111161",
  "rating": 8
}
```

### Response — 200 OK

```json
{
  "success": true,
  "message": "Rating saved successfully"
}
```

---

# 4. Database Schema Design

The database follows the relational schema provided in CS122B specifications.

---

## movies

| Column | Type | Description |
|------------|--------------|----------------|
| id | VARCHAR(10) | Primary Key (tconst) |
| title | VARCHAR(100) | Movie title |
| year | INTEGER | Release year |
| director | VARCHAR(100) | Director name |

---

## stars

| Column | Type | Description |
|------------|--------------|----------------|
| id | VARCHAR(10) | Primary Key (nconst) |
| name | VARCHAR(100) | Star name |
| birthYear | INTEGER | Year of birth (nullable) |

---

## stars_in_movies

| Column | Type | Description |
|------------|--------------|----------------|
| starId | VARCHAR(10) | Foreign Key → stars.id |
| movieId | VARCHAR(10) | Foreign Key → movies.id |

---

## genres

| Column | Type | Description |
|------------|--------------|----------------|
| id | SERIAL | Primary Key (auto-increment) |
| name | VARCHAR(32) | Genre name |

---

## genres_in_movies

| Column | Type | Description |
|------------|--------------|----------------|
| genreId | INTEGER | Foreign Key → genres.id |
| movieId | VARCHAR(10) | Foreign Key → movies.id |

---

## customers

| Column | Type | Description |
|------------|--------------|----------------|
| id | SERIAL | Primary Key |
| firstName | VARCHAR(50) | User first name |
| lastName | VARCHAR(50) | User last name |
| email | VARCHAR(50) | Unique email |
| password | VARCHAR(20) | Encrypted password |

---

## sales

| Column | Type | Description |
|------------|--------------|----------------|
| id | SERIAL | Primary Key |
| customerId | INTEGER | Foreign Key → customers.id |
| movieId | VARCHAR(10) | Foreign Key → movies.id |
| saleDate | DATE | Date of transaction |

---

## creditcards

| Column | Type | Description |
|------------|--------------|----------------|
| id | VARCHAR(20) | Primary Key |
| firstName | VARCHAR(50) | First name |
| lastName | VARCHAR(50) | Last name |
| expiration | DATE | Expiration date |

---

## ratings

| Column | Type | Description |
|------------|--------------|----------------|
| movieId | VARCHAR(10) | Foreign Key → movies.id |
| rating | FLOAT | Rating scale 0–10 |
| numVotes | INTEGER | Total number of votes |

---
