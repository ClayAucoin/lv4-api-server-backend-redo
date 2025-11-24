// src/app.error.test.js

import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import express from "express"

import app from "./app.js"
import { sendError } from "./utils/sendError.js"
import { deleteMovieById } from "./app.js"
import { globalErrorHandler, error404 } from "./app.js"
import movies from "./data.js"

const app = express()

// for delete testing
const originalMovies = JSON.parse(JSON.stringify(movies))
beforeEach(() => {
  movies.length = 0
  movies.push(...JSON.parse(JSON.stringify(originalMovies)))
})

describe("GET / (root)", () => {

  it("serves HTML from root route", async () => {
    const res = await request(app).get("/")

    expect(res.status).toBe(200)
    expect(res.text).toContain("<h1>Express Running</h1>")
    expect(res.headers["content-type"]).toMatch(/html/)
  })

})

describe("GET /movies/", () => {

  it("returns the movies from data.js", async () => {
    const res = await request(app).get("/movies/")
    const { ok, data } = res.body

    expect(res.status).toBe(200)
    expect(ok).toBe(true)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toEqual(movies)
  })

  it("returns an array of movie objects with the right shape", async () => {
    const res = await request(app).get("/movies/")
    const { ok, data } = res.body

    expect(res.status).toBe(200)
    expect(ok).toBe(true)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(movies.length)

    data.forEach((movie) => {
      expect(movie).toMatchObject({
        id: expect.any(Number),
        imdb_id: expect.any(String),
        title: expect.any(String),
        year: expect.any(Number),
      })
    })
  })

  it("includes 'Monkey Man' in the list", async () => {
    const res = await request(app).get("/movies")
    const { ok, data } = res.body

    expect(res.status).toBe(200)
    expect(ok).toBe(true)
    expect(data).toContainEqual(
      expect.objectContaining({
        title: "Monkey Man",
        imdb_id: "tt9214772",
        year: 2024
      })
    )
  })

})


describe("GET /movies/:ID", () => {

  it("returns single movie with the given id", async () => {
    const res = await request(app).get("/movies/16")
    const { ok, data } = res.body

    expect(res.status).toBe(200)
    expect(ok).toBe(true)
    expect(data).toBeDefined()
    expect(data.id).toBe(16)
    expect(data).toMatchObject({
      id: 16,
      imdb_id: expect.any(String),
      title: expect.any(String),
      year: expect.any(Number)
    })
  })

  it("returns 404 when movie is not found", async () => {
    const res = await request(app).get("/movies/99999")

    expect(res.status).toBe(404)
    expect(res.body.ok).toBe(false)
    expect(res.body.error.code).toBe("NOT_FOUND")
  })

})


describe("POST /movies/ {body}", () => {

  it("adds new movie", async () => {
    const res = await request(app)
      .post("/movies/")
      .send({ "id": 13, "imdb_id": "tt9603208", "title": "Mission: Impossible - The Final Reckoning", "year": 2025, "runtime": "2:52:54", "rating": "PG-13", "poster": "https://image.tmdb.org/t/p/original/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg", "genres": ["Action", "Adventure", "Thriller"] })

    const { ok, data } = res.body

    expect(res.status).toBe(200)
    expect(ok).toBe(true)
    expect(data).toMatchObject({ "id": 13, "imdb_id": "tt9603208", "title": "Mission: Impossible - The Final Reckoning", "year": 2025, "runtime": "2:52:54", "rating": "PG-13", "poster": "https://image.tmdb.org/t/p/original/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg", "genres": ["Action", "Adventure", "Thriller"] })
    expect(data.id).toBeDefined()
  })

})


describe("DELETE /movies/:id", () => {

  it("deletes a movie wieh given id successfully", async () => {
    const res = await request(app).delete("/movies/8")

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.message).toBe("Movie deleted successfully")
    expect(res.body.data.id).toBe(8)

    const find = movies.find((m) => m.id === 8)
    expect(find).toBeUndefined()
  })

  it("returns 404 when movie does not exist", async () => {
    const res = await request(app).delete("/movies/9999")

    expect(res.status).toBe(404)
    expect(res.body.ok).toBe(false)
    expect(res.body.error.code).toBe("NOT_FOUND")
  })

})

describe("deleteMovieById function", () => {

  it("returns null if -1", () => {
    const err = deleteMovieById(-1)
    expect(err).toBeNull
  })

})


describe("globalErrorHandler function", () => {

  it("adds error.details when present", () => {
    const err = new Error("Bad input")
    err.status = 422
    err.code = "VALIDATION_ERROR"
    err.details = { field: "year", value: 1816 }

    const json = vi.fn()
    const status = vi.fn(() => ({ json }))
    const res = { status }
    const req = {}
    const next = vi.fn()

    globalErrorHandler(err, req, res, next)

    expect(status).toHaveBeenCalledWith(422)
    expect(json).toHaveBeenCalledWith({
      ok: false,
      error: {
        status: 422,
        message: "Bad input",
        code: "VALIDATION_ERROR",
        details: { field: "year", value: 1816 }
      }
    })
  })

  it("shows err.stack if not custom app error", () => {
    const err = new Error("Server error")
    err.status = 500
    err.code = "INTERNAL_ERROR"

    const json = vi.fn()
    const status = vi.fn(() => ({ json }))
    const res = { status }
    const req = {}
    const next = vi.fn()

    globalErrorHandler(err, req, res, next)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      ok: false,
      error: {
        status: 500,
        message: "Server error",
        code: "INTERNAL_ERROR",
      }
    })
  })

})

describe("404 handler", () => {

  it("returns 404 when no route matches", async () => {
    app.use(error404)
    app.use(globalErrorHandler)

    const res = await request(app).get("/this-route-does-not-exist")

    expect(res.status).toBe(404)
    expect(res.body.ok).toBe(false)
    expect(res.body.error.code).toBe("NOT_FOUND")
    expect(res.body.error.message).toBe("Route not found")
  })

})
