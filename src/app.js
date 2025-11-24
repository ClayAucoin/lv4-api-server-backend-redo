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
  console.log("GET /root")
  let response = "<h1>Express Running</h1>"
  console.log(response)

  res.status(200).send(response)
})

// movies route
// list all movies
app.get("/movies", (req, res, next) => {
  console.log("GET /movies")
  res.status(200).json({
    ok: true,
    data: data
  })
})

// find selected movie
app.get("/movies/:id", validateId, (req, res, next) => {
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
})

// add movie
app.post("/movies/", validateMovieBody, (req, res, next) => {
  console.log("POST /movie/", req.body)
  const newMovie = req.body
  data.push(newMovie)

  res.status(200).json({
    ok: true,
    message: "Movie added successfuly",
    data: newMovie
  })
})

// delete movie
app.delete("/movies/:id", validateId, (req, res, next) => {
  console.log("DELETE /movies/")
  const id = Number(req.params.id)

  const index = data.findIndex((movie) => movie.id === id)

  if (index === -1) {
    return null
  }

  const [removed] = data.splice(index, 1)

  if (!removed) {
    return next(sendError(404, "Movie not found", "NOT_FOUND"))
  }

  res.status(200).json({
    ok: true,
    message: "Movie deleted successfully",
    data: removed
  })
})


export function globalErrorHandler(err, req, res, next) {
  const isAppError = typeof err.status === "number"

  if (!isAppError) console.error("UNEXPECTED ERROR:", err.stack || err)

  const status = isAppError ? err.status : 500
  const code = isAppError ? (err.code || "INTERNAL_ERROR") : "INTERNAL_ERROR"
  const message = isAppError ? (err.message || "Server error") : "Server error"

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