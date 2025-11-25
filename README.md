# LV4 Movie API Server (Redo)

A small Express.js JSON API for managing an in‑memory list of movies.  
This project focuses on clean routing, request validation, and structured error handling, with a full test suite using Vitest and Supertest.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [GET /](#get-)
  - [GET /movies/](#get-movies)
  - [GET /movies/:id](#get-moviesid)
  - [POST /movies/](#post-movies)
  - [DELETE /movies/:id](#delete-moviesid)
- [Validation](#validation)
  - [Path parameter: id](#path-parameter-id)
  - [Request body: movie](#request-body-movie)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Notes & Limitations](#notes--limitations)

## Overview

This backend exposes a simple movie catalog API. Movies are stored in memory in `src/data.js`, and the server provides endpoints to list movies, fetch a single movie, add new movies, and delete movies by ID.

The project is written in modern ES modules, uses centralised error helpers, and demonstrates how to wire up middleware for validation and global error handling.

## Features

- Health‑check root route (`GET /`) that returns simple HTML.
- List all movies with `GET /movies`.
- Look up a single movie by numeric `id` with `GET /movies/:id`.
- Add a new movie with `POST /movies` (JSON body).
- Delete an existing movie by `id` with `DELETE /movies/:id`.
- Centralised `sendError` helper for consistent error objects.
- Global error handler that standardises error responses.
- 404 handler for unknown routes.
- Middleware validation for route params and request bodies.
- Test suite using Vitest and Supertest (routes, validators, and utilities).

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Middleware:** `cors`, `express.json`, `express.urlencoded`
- **Environment:** `dotenv`
- **Testing:** Vitest, Supertest
- **Language:** Modern JavaScript (ES modules)

## Project Structure

```text
.
└── src/
    ├── app.js                 # Main Express app (routes, error handlers)
    ├── config.js              # Environment configuration (PORT, NODE_ENV, etc)
    ├── data.js                # In‑memory movie data
    ├── index.js               # App listener / entry point
    │
    ├── middleware/
    │   └── validators.js        # validateId & validateMovieBody middleware
    │
    └── utils/
        └── sendError.js         # Helper for building error objects
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn

### Installation

```bash
# install dependencies
npm install
```

Place the source files in a `src/` directory as laid out above. Make sure your `package.json` is configured for ES modules (for example by including `"type": "module"`).

### Environment Variables

The project uses `dotenv` and reads configuration from `src/config.js`:

```js
export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  apiKey: process.env.API_KEY || "",
  dbUrl: process.env.DB_URL || "",
};
```

Create a `.env` file in the project root if needed:

```env
PORT=3000
NODE_ENV=development
API_KEY=
DB_URL=
```

### Running the Server

The listener in `src/index.js` starts the app on the configured port:

```js
import app from "./app.js";
import { config } from "./config.js";

const port = config.port;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

Run it with Node (adjust path to your setup):

```bash
node src/index.js
```

By default the server listens on `http://localhost:3000` (or whatever `PORT` you set).

## API Reference

### Base URL

```text
http://localhost:3000
```

### GET /

Health‑check / root route that returns simple HTML.

- **Response:** `200 OK`
- **Content‑Type:** `text/html`

**Example response (body):**

```html
<h1>Express Running</h1>
```

---

### GET /movies/

Returns the full list of movies from `data.js`.

- **Method:** `GET`
- **URL:** `/movies/`
- **Success status:** `200 OK`

**Response body:**

```json
{
  "ok": true,
  "data": [
    {
      "id": 16,
      "imdb_id": "tt9214772",
      "title": "Monkey Man",
      "year": 2024,
      "runtime": "2:01:36",
      "rating": "R",
      "poster": "https://image.tmdb.org/t/p/original/4lhR4L2vzzjl68P1zJyCH755Oz4.jpg",
      "genres": ["Action", "Thriller"]
    }
    // ...
  ]
}
```

---

### GET /movies/:id

Returns a single movie by numeric `id`.

- **Method:** `GET`
- **URL:** `/movies/:id`
- **URL params:**
  - `id` (required) – positive integer
- **Success status:** `200 OK`
- **Error status:** `400`, `404`

**Success response:**

```json
{
  "ok": true,
  "data": {
    "id": 16,
    "imdb_id": "tt9214772",
    "title": "Monkey Man",
    "year": 2024,
    "runtime": "2:01:36",
    "rating": "R",
    "poster": "https://image.tmdb.org/t/p/original/4lhR4L2vzzjl68P1zJyCH755Oz4.jpg",
    "genres": ["Action", "Thriller"]
  }
}
```

**Error response (invalid or missing movie):**

```json
{
  "ok": false,
  "error": {
    "status": 404,
    "message": "Movie not found",
    "code": "NOT_FOUND"
  }
}
```

If the `id` path parameter is not a valid positive integer, the `validateId` middleware returns a `400` error with code `INVALID_ID`.

---

### POST /movies/

Adds a new movie to the in‑memory list.

- **Method:** `POST`
- **URL:** `/movies/`
- **Body type:** `application/json`
- **Success status:** `200 OK`
- **Error status:** `400`, `422`

**Required fields in the body:**

```json
{
  "id": 13,
  "imdb_id": "tt9603208",
  "title": "Mission: Impossible - The Final Reckoning",
  "year": 2025,
  "runtime": "2:52:54",
  "rating": "PG-13",
  "poster": "https://image.tmdb.org/t/p/original/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg",
  "genres": ["Action", "Adventure", "Thriller"]
}
```

**Success response:**

```json
{
  "ok": true,
  "message": "Movie added successfuly",
  "data": {
    "id": 13,
    "imdb_id": "tt9603208",
    "title": "Mission: Impossible - The Final Reckoning",
    "year": 2025,
    "runtime": "2:52:54",
    "rating": "PG-13",
    "poster": "https://image.tmdb.org/t/p/original/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg",
    "genres": ["Action", "Adventure", "Thriller"]
  }
}
```

If the body is missing or fails validation, the middleware returns a `400` or `422` error (see [Validation](#validation)).

---

### DELETE /movies/:id

Deletes a movie with the given `id` from the in‑memory array.

- **Method:** `DELETE`
- **URL:** `/movies/:id`
- **URL params:**
  - `id` (required) – positive integer
- **Success status:** `200 OK`
- **Error status:** `400`, `404`

**Success response:**

```json
{
  "ok": true,
  "message": "Movie deleted successfully",
  "data": {
    "id": 8,
    "imdb_id": "tt0117060",
    "title": "Mission: Impossible",
    "year": 1996,
    "runtime": "1:50:12",
    "rating": "PG-13",
    "poster": "https://image.tmdb.org/t/p/original/l5uxY5m5OInWpcExIpKG6AR3rgL.jpg",
    "genres": ["Adventure", "Action", "Thriller"]
  }
}
```

If the movie does not exist, the handler responds with:

```json
{
  "ok": false,
  "error": {
    "status": 404,
    "message": "Movie not found",
    "code": "NOT_FOUND"
  }
}
```

## Validation

Validation is implemented via middleware in `src/middleware/validators.js`.

### Path parameter: `id`

`validateId(req, res, next)` enforces these rules:

- `id` must be convertible to a number.
- `id` must be an integer (`Number.isInteger`).
- `id` must be greater than `0`.

When validation fails, `validateId` calls `next(sendError(...))` with:

- **Status:** `400`
- **Code:** `INVALID_ID`
- **Details:** `{ value: <original-id> }`

### Request body: movie

`validateMovieBody(req, res, next)` enforces:

- A JSON body must be present; if missing:
  - **Status:** `400`
  - **Code:** `MISSING_BODY`
- Required fields:
  - `id` (required)
  - `title` (required)
  - `year` (required)
- If any required field is missing:
  - **Status:** `422`
  - **Code:** `VALIDATION_ERROR`
  - **Details:** `{ missing: ["id", "title", "year", ...] }`
- Type checks:
  - `id` must be a number → otherwise:
    - **Status:** `422`
    - **Code:** `INVALID_TYPE`
    - **Details:** `{ field: "id", value: <actual> }`
  - `year` must be a number → otherwise:
    - **Status:** `422`
    - **Code:** `INVALID_TYPE`
    - **Details:** `{ field: "year", value: <actual> }`
- Value checks:
  - `year` must be >= 1900 → otherwise:
    - **Status:** `422`
    - **Code:** `INVALID_VALUE`
    - **Details:** `{ field: "year", value: <actual> }`

On success, `validateMovieBody` simply calls `next()` with no arguments.

## Error Handling

Error handling is centralised around two pieces:

1. **`sendError(status, message, code = "ERROR", details = null)`** (in `src/utils/sendError.js`)

   - Creates an `Error` instance.
   - Attaches `status`, `code`, and optional `details` to the error object.
   - Returns the configured error, which can be passed to `next()` from routes/middleware.

2. **`globalErrorHandler(err, req, res, next)`** (in `src/app.js`)
   - Checks if the error has a numeric `status` to decide if it is an expected “app error”.
   - Logs `err.stack` to the console for unexpected errors.
   - Builds a consistent JSON response:
     ```json
     {
       "ok": false,
       "error": {
         "status": 500,
         "message": "Server error",
         "code": "INTERNAL_ERROR"
       }
     }
     ```
   - Includes `error.details` when the incoming error has a `details` property.

A `404` specific handler (`error404`) is used to generate a `NOT_FOUND` error when no route matches, and is registered before the global error handler:

```js
app.use(error404);
app.use(globalErrorHandler);
```

This ensures all errors ultimately pass through the same global handler.

## Testing

The project uses **Vitest** and **Supertest** to verify routes, middleware, and utilities.

Example areas covered by the tests:

- `GET /` returns HTML and status `200`.
- `GET /movies` returns `ok: true` with an array matching `data.js`.
- `GET /movies/:id` returns the correct movie or `404 NOT_FOUND`.
- `POST /movies` successfully adds a movie when the body is valid.
- `DELETE /movies/:id` removes the movie and returns `404` when it does not exist.
- `deleteMovieById` returns `null` when the movie is not found.
- `validateId` and `validateMovieBody` behave correctly under valid and invalid inputs.
- `sendError` populates `status`, `message`, `code`, and `details` correctly.
- `globalErrorHandler` shapes the response as expected and includes `error.details` when present.
- The `404` handler returns `NOT_FOUND` for unknown routes.

To run the tests (assuming a Vitest script is defined in `package.json`):

```bash
# run vitest
npx vitest

# or, if configured
npm test
```

## Notes & Limitations

- Movies are stored in memory (`data.js`), so changes (POST/DELETE) are not persisted once the server restarts.
- The `dbUrl` and `apiKey` configuration values are present for future expansion but are not used in this in‑memory version.
- `runtime` is stored as a `hh:mm:ss` string rather than a numeric value.
- This project is intended as a learning/practice API and not a production‑ready service.
