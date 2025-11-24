// src/index.js
import express from "express"
import cors from "cors"

const app = express();
// const port = 3000;

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// utils
import { sendError } from "./utils/sendError.js"

// validators
import { validateId, validateMovieBody } from "./middleware/validators.js"

// data
import data from "./data.js"

// root route
app.get("/", (req, res, next) => {
  try {
    console.log("GET /root")
    let response = "<h1>Express Running</h1>"
    console.log(response)

    res.status(200).send(response)
  } catch (err) {
    next(sendError(500, "Failed to read data", "READ_ERROR"))
  }
})

// movies route: list all movies
app.get("/movies", (req, res, next) => {
  try {
    console.log("GET /movies")
    res.status(200).json({
      ok: true,
      data: data
    })
  } catch (err) {
    next(sendError(500, "Failed to read data", "READ_ERROR"))
  }
})

// movies route: find selected movie
app.get("/movies/:id", validateId, (req, res, next) => {
  try {
    console.log("GET /movies/id")

    console.log("id:", req.params, "typeof:", typeof req.params)

    const id = Number(req.params.id)
    const movie = data.find((entry) => entry.id === id)

    if (!movie) {
      return next(sendError(404, "Movie not found", "NOT_FOUND"))
    }

    res.status(200).json({
      ok: true,
      data: movie
    })
  } catch (err) {
    next(sendError(500, "Failed to read data", "READ_ERROR"))
  }
})

// movie route: add movie
app.post("/movies/", validateMovieBody, (req, res, next) => {
  try {
    console.log("POST /movie/", req.body)
    const newMovie = req.body
    data.push(newMovie)

    res.status(200).json({
      ok: true,
      message: "Movie added successfuly",
      data: newMovie
    })
  } catch (err) {
    next(sendError(500, "Failed to add data", "WRITE_ERROR"))
  }
})




export function globalErrorHandler(err, req, res, next) {
  const status = err.status || 500
  const code = err.code || "INTERNAL_ERROR"
  const message = err.message || "Server error"

  const payload = {
    ok: false,
    error: {
      status,
      message,
      code
    }
  }

  if (err.details) {
    payload.error.details = err.details
  }

  res.status(status).json(payload)
}

export function error404(req, res, next) {
  next(sendError(404, "Route not found", "NOT_FOUND"))
}

// routes error 404
app.use(error404)

// global error handling
app.use(globalErrorHandler)

export default app