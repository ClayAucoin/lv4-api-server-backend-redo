// src/utils/validators.test.js

import { describe, it, expect, vi } from "vitest"
import { validateId, validateMovieBody } from "./validators.js"
import { sendError } from "../utils/sendError.js"

describe("validateId middleware function", () => {

  it("calls next with no error for a valid positive integer id", () => {
    const req = { params: { id: "5" } }
    const res = {}
    const next = vi.fn()

    validateId(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    const [firstArg] = next.mock.calls[0]
    expect(firstArg).toBeUndefined()
  })

  it("calls next with error when id is not an integer", () => {
    const req = { params: { id: "abc" } }
    const res = {}
    const next = vi.fn()

    validateId(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)

    const [err] = next.mock.calls[0]
    expect(err).toBeInstanceOf(Error)
    expect(err.status).toBe(400)
    expect(err.code).toBe("INVALID_ID")
    expect(err.message).toBe(`'id' must be an integer`)
    expect(err.details).toEqual({ value: "abc" })
  })

  it("rejects decimal ids as non-integers", () => {
    const req = { params: { id: "5.3" } }
    const res = {}
    const next = vi.fn()

    validateId(req, res, next)

    const [err] = next.mock.calls[0]
    expect(err.status).toBe(400)
    expect(err.code).toBe("INVALID_ID")
    expect(err.details).toEqual({ value: "5.3" })
  })

  it("calls next with error when id is zero", () => {
    const req = { params: { id: "0" } }
    const res = {}
    const next = vi.fn()

    validateId(req, res, next)

    const [err] = next.mock.calls[0]
    expect(err).toBeInstanceOf(Error)
    expect(err.status).toBe(400)
    expect(err.code).toBe("INVALID_ID")
    expect(err.message).toBe(`"id" must be greater than 0`)
    expect(err.details).toEqual({ value: 0 })
  })

  it("calls next with error when id is negative", () => {
    const req = { params: { id: "-3" } }
    const res = {}
    const next = vi.fn()

    validateId(req, res, next)

    const [err] = next.mock.calls[0]
    expect(err.status).toBe(400)
    expect(err.code).toBe("INVALID_ID")
    expect(err.details).toEqual({ value: -3 })
  })

})

describe("validateMovieBody middleware", () => {

  it("returns 400 when body is missing", () => {
    const req = { body: undefined }
    const res = {}
    const next = vi.fn()

    validateMovieBody(req, res, next)

    const [err] = next.mock.calls[0]
    expect(err.status).toBe(400)
    expect(err.code).toBe("MISSING_BODY")
  })

  it("returns 422 when id is missing", () => {
    const req = { body: { title: "Test Movie", year: 2020 } }
    const res = {}
    const next = vi.fn()

    validateMovieBody(req, res, next)

    const [err] = next.mock.calls[0]
    expect(err.status).toBe(422)
    expect(err.code).toBe("VALIDATION_ERROR")
    expect(err.details.missing).toContain("id")
  })

  it("returns 422 when title is missing", () => {
    const req = { body: { id: "abc", year: 2020 } }
    const res = {}
    const next = vi.fn()

    validateMovieBody(req, res, next)

    const [err] = next.mock.calls[0]
    expect(err.status).toBe(422)
    expect(err.code).toBe("VALIDATION_ERROR")
    expect(err.details.missing).toContain("title")
  })

  it("returns 422 when year is missing", () => {
    const req = { body: { id: "abc", title: "Test Movie" } }
    const res = {}
    const next = vi.fn()

    validateMovieBody(req, res, next)

    const [err] = next.mock.calls[0]
    expect(err.status).toBe(422)
    expect(err.code).toBe("VALIDATION_ERROR")
    expect(err.details.missing).toContain("year")
  })

  it("returns 422 when id is not a number", () => {
    const req = { body: { id: "abc", title: "Test", year: 2020 } }
    const res = {}
    const next = vi.fn()

    validateMovieBody(req, res, next)

    const [err] = next.mock.calls[0]
    expect(err.status).toBe(422)
    expect(err.code).toBe("INVALID_TYPE")
    expect(err.details.field).toBe("id")
    expect(err.details.value).toBe("abc")
  })


  it("returns 422 when year is not a number", () => {
    const req = { body: { id: 5, title: "Test", year: "2020" } }
    const res = {}
    const next = vi.fn()

    validateMovieBody(req, res, next)

    const [err] = next.mock.calls[0]
    expect(err.status).toBe(422)
    expect(err.code).toBe("INVALID_TYPE")
    expect(err.details.field).toBe("year")
    expect(err.details.value).toBe("2020")
  })


  it("returns 422 when year < 1900", () => {
    const req = { body: { id: 1, title: "Old Movie", year: 1816 } }
    const res = {}
    const next = vi.fn()

    validateMovieBody(req, res, next)

    const [err] = next.mock.calls[0]
    expect(err.status).toBe(422)
    expect(err.code).toBe("INVALID_VALUE")
    expect(err.details.field).toBe("year")
    expect(err.details.value).toBe(1816)
  })


  it("calls next() with no error when body is valid", () => {
    const req = { body: { id: 10, title: "Valid Movie", year: 2020 } }
    const res = {}
    const next = vi.fn()

    validateMovieBody(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    const [err] = next.mock.calls[0]
    expect(err).toBeUndefined()
  })

})
