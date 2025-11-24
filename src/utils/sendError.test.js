// src/utils/sendError.test.js

import { describe, it, expect } from "vitest"
import { sendError } from "./sendError.js"

describe("send error", () => {

  it("adds details when provided", () => {
    const err = sendError(400, "Bad input", "INVALID", { field: "year", value: 1816 })
    expect(err.details).toEqual({ field: "year", value: 1816 })
  })

  it("should output code", () => {
    const err = sendError(400)
    expect(err.status).toEqual(400)
  })

  it("should output message", () => {
    const err = sendError(400, "Bad input", "INVALID")
    expect(err.message).toEqual("Bad input")
  })

  it("should output code", () => {
    const err = sendError(400, "Bad input", "INVALID")
    expect(err.code).toEqual("INVALID")
  })

  it("should accept no code", () => {
    const err = sendError(400, "Bad input")
    expect(err.code).toEqual("ERROR")
  })

  it("should accept no details", () => {
    const err = sendError(400, "Bad input", "INVALID")
    expect(err.details).toBeNull
  })

})