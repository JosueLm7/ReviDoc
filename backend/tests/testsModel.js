const Document = require("../models/Document")
const { describe, it, expect } = require("@jest/globals")

describe("Document Model", () => {
  it("should create a document with required fields", () => {
    const doc = new Document({
      title: "Test",
      filePath: "/tmp/test.pdf",
      fileUrl: "https://revidoc-backend.onrender.com/api/documents/file/test.pdf",
      userId: "507f191e810c19729de860ea",
    })
    expect(doc.title).toBe("Test")
    expect(doc.fileUrl).toBeDefined()
    expect(typeof doc.fileUrl).toBe("string")
  })
})
