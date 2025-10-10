const request = require("supertest")
const path = require("path")
const fs = require("fs")
const app = require("../../../server")
const User = require("../../../models/User")
const Document = require("../../../models/Document")

describe("Document Routes", () => {
  let authToken
  let testUser

  beforeEach(async () => {
    testUser = await User.create({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "password123",
    })
    authToken = testUser.generateAuthToken()
  })

  describe("POST /api/documents", () => {
    it("should upload a document", async () => {
      // Create a test file
      const testFilePath = path.join(__dirname, `test-${Date.now()}.txt`)
      fs.writeFileSync(testFilePath, "This is test content for document upload.")

      const response = await request(app)
        .post("/api/documents")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("documents", testFilePath)
        .field("title", "Test Document")
        .field("description", "Test description")
        .field("category", "essay")
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.documents).toBeDefined()
      expect(response.body.data.documents.length).toBeGreaterThan(0)

      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
      }
    })

    it("should reject upload without authentication", async () => {
      const response = await request(app).post("/api/documents").expect(401)

      expect(response.body.success).toBe(false)
    })

    it("should reject upload without file", async () => {
      const response = await request(app)
        .post("/api/documents")
        .set("Authorization", `Bearer ${authToken}`)
        .field("title", "Test Document")
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBeDefined()
    })
  })

  describe("GET /api/documents", () => {
    beforeEach(async () => {
      await Document.create({
        title: "Test Document 1",
        content: "Test content 1",
        originalFileName: "test1.pdf",
        filePath: "/uploads/test1.pdf",
        fileSize: 1024,
        fileType: "pdf",
        userId: testUser._id,
      })

      await Document.create({
        title: "Test Document 2",
        content: "Test content 2",
        originalFileName: "test2.pdf",
        filePath: "/uploads/test2.pdf",
        fileSize: 2048,
        fileType: "pdf",
        userId: testUser._id,
      })
    })

    it("should get user documents", async () => {
      const response = await request(app).get("/api/documents").set("Authorization", `Bearer ${authToken}`).expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.documents).toBeDefined()
      expect(response.body.data.documents.length).toBeGreaterThan(0)
      expect(response.body.data.pagination).toBeDefined()
    })

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/documents?page=1&limit=1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data.documents.length).toBeGreaterThanOrEqual(0)
      expect(response.body.data.pagination).toBeDefined()
    })

    it("should filter by status", async () => {
      const response = await request(app)
        .get("/api/documents?status=pending")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      if (response.body.data.documents.length > 0) {
        response.body.data.documents.forEach((doc) => {
          expect(doc.status).toBe("pending")
        })
      }
    })
  })

  describe("GET /api/documents/:id", () => {
    let testDocument

    beforeEach(async () => {
      testDocument = await Document.create({
        title: "Test Document",
        content: "Test content",
        originalFileName: "test.pdf",
        filePath: "/uploads/test.pdf",
        fileSize: 1024,
        fileType: "pdf",
        userId: testUser._id,
      })
    })

    it("should get document by ID", async () => {
      const response = await request(app)
        .get(`/api/documents/${testDocument._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.document.title).toBe("Test Document")
    })

    it("should reject access to other user document", async () => {
      const otherUser = await User.create({
        name: "Other User",
        email: `other-${Date.now()}@example.com`,
        password: "password123",
      })
      const otherToken = otherUser.generateAuthToken()

      const response = await request(app)
        .get(`/api/documents/${testDocument._id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(403)

      expect(response.body.success).toBe(false)
    })

    it("should return 404 for non-existent document", async () => {
      const fakeId = "507f1f77bcf86cd799439011"
      const response = await request(app)
        .get(`/api/documents/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.success).toBe(false)
    })
  })

  describe("PUT /api/documents/:id", () => {
    let testDocument

    beforeEach(async () => {
      testDocument = await Document.create({
        title: "Test Document",
        content: "Test content",
        originalFileName: "test.pdf",
        filePath: "/uploads/test.pdf",
        fileSize: 1024,
        fileType: "pdf",
        userId: testUser._id,
      })
    })

    it("should update document", async () => {
      const response = await request(app)
        .put(`/api/documents/${testDocument._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          description: "Updated description",
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.document.title).toBe("Updated Title")
    })

    it("should reject update by non-owner", async () => {
      const otherUser = await User.create({
        name: "Other User",
        email: `other-${Date.now()}@example.com`,
        password: "password123",
      })
      const otherToken = otherUser.generateAuthToken()

      const response = await request(app)
        .put(`/api/documents/${testDocument._id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ title: "Hacked Title" })
        .expect(403)

      expect(response.body.success).toBe(false)
    })
  })

  describe("DELETE /api/documents/:id", () => {
    let testDocument

    beforeEach(async () => {
      testDocument = await Document.create({
        title: "Test Document",
        content: "Test content",
        originalFileName: "test.pdf",
        filePath: "/uploads/test.pdf",
        fileSize: 1024,
        fileType: "pdf",
        userId: testUser._id,
      })
    })

    it("should delete document", async () => {
      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)

      const deletedDoc = await Document.findById(testDocument._id)
      expect(deletedDoc).toBeNull()
    })

    it("should reject deletion by non-owner", async () => {
      const otherUser = await User.create({
        name: "Other User",
        email: `other-${Date.now()}@example.com`,
        password: "password123",
      })
      const otherToken = otherUser.generateAuthToken()

      const response = await request(app)
        .delete(`/api/documents/${testDocument._id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(403)

      expect(response.body.success).toBe(false)
    })
  })
})
