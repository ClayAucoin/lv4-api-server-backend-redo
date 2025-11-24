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