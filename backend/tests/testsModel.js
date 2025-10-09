const Document = require("../models/Document");

describe("Document Model", () => {
  it("should create a document with required fields", () => {
    const doc = new Document({
      title: "Test",
      filePath: "/tmp/test.pdf",
      fileUrl: "http://localhost:5000/api/documents/file/test.pdf",
      userId: "507f191e810c19729de860ea"
    });
    expect(doc.title).toBe("Test");
    expect(doc.fileUrl).toContain("http://localhost:5000");
  });
});