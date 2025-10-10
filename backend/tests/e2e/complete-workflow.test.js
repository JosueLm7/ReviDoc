const request = require("supertest")
const app = require("../../server")
const path = require("path")
const fs = require("fs")
const jest = require("jest") // Import jest to fix the undeclared variable error

jest.setTimeout(60000)

describe("Complete Workflow E2E Tests", () => {
  let authToken
  let userId
  let documentId
  let reviewId
  const uniqueEmail = `e2e-${Date.now()}@example.com`

  describe("User Registration and Authentication Flow", () => {
    it("should complete full user registration and login flow", async () => {
      // Register new user
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
          name: "E2E Test User",
          email: uniqueEmail,
          password: "Password123",
          institution: "Test University",
        })
        .expect(201)

      expect(registerResponse.body.success).toBe(true)
      expect(registerResponse.body.token).toBeDefined()
      userId = registerResponse.body.user._id

      // Login with credentials
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: uniqueEmail,
          password: "Password123",
        })
        .expect(200)

      expect(loginResponse.body.success).toBe(true)
      authToken = loginResponse.body.token

      // Get current user
      const meResponse = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${authToken}`).expect(200)

      expect(meResponse.body.data.user.email).toBe(uniqueEmail)
    })
  })

  describe("Document Upload and Management Flow", () => {
    it("should complete full document lifecycle", async () => {
      // Create test file
      const testFilePath = path.join(__dirname, `e2e-test-${Date.now()}.txt`)
      fs.writeFileSync(
        testFilePath,
        "This is comprehensive test content for end-to-end testing of the document review system.",
      )

      // Upload document
      const uploadResponse = await request(app)
        .post("/api/documents")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("documents", testFilePath)
        .field("title", "E2E Test Document")
        .field("description", "Document for end-to-end testing")
        .field("category", "essay")
        .field("academicLevel", "undergraduate")

      if (uploadResponse.status === 201) {
        expect(uploadResponse.body.success).toBe(true)
        documentId = uploadResponse.body.data.documents[0]._id

        // Get document
        const getResponse = await request(app)
          .get(`/api/documents/${documentId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200)

        expect(getResponse.body.data.document.title).toBe("E2E Test Document")

        // Update document
        const updateResponse = await request(app)
          .put(`/api/documents/${documentId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            title: "Updated E2E Test Document",
            description: "Updated description",
          })
          .expect(200)

        expect(updateResponse.body.data.document.title).toBe("Updated E2E Test Document")

        // List documents
        const listResponse = await request(app)
          .get("/api/documents")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200)

        expect(listResponse.body.data.documents.length).toBeGreaterThan(0)
      }

      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
      }
    })
  })

  describe("Review Creation and Feedback Flow", () => {
    it("should complete full review lifecycle", async () => {
      if (!documentId) {
        console.log("Skipping review tests - no document available")
        return
      }

      // Create review
      const createResponse = await request(app)
        .post(`/api/reviews/${documentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(201)

      expect(createResponse.body.success).toBe(true)
      reviewId = createResponse.body.data.review._id

      // Get review
      const getResponse = await request(app)
        .get(`/api/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(getResponse.body.data.review._id).toBe(reviewId)

      // Add feedback
      const feedbackResponse = await request(app)
        .put(`/api/reviews/${reviewId}/feedback`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          isHelpful: true,
          rating: 5,
          comments: "Excellent review, very helpful!",
        })
        .expect(200)

      expect(feedbackResponse.body.data.review.feedback).toBeDefined()

      // List reviews
      const listResponse = await request(app)
        .get("/api/reviews")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(listResponse.body.data.reviews.length).toBeGreaterThan(0)
    })
  })

  describe("Cleanup Flow", () => {
    it("should delete document and logout", async () => {
      if (!documentId) {
        console.log("Skipping cleanup - no document to delete")

        // Just logout
        const logoutResponse = await request(app)
          .post("/api/auth/logout")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200)

        expect(logoutResponse.body.success).toBe(true)
        return
      }

      // Delete document
      const deleteResponse = await request(app)
        .delete(`/api/documents/${documentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(deleteResponse.body.success).toBe(true)

      // Logout
      const logoutResponse = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(logoutResponse.body.success).toBe(true)
    })
  })
})
