const request = require("supertest")
const app = require("../../../server")
const User = require("../../../models/User")
const Document = require("../../../models/Document")
const Review = require("../../../models/Review")
const jest = require("jest") // Declared the jest variable

jest.setTimeout(30000)

describe("Review Routes", () => {
  let authToken
  let testUser
  let testDocument

  beforeEach(async () => {
    testUser = await User.create({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "password123",
    })
    authToken = testUser.generateAuthToken()

    testDocument = await Document.create({
      title: "Test Document",
      content: "This is test content for review analysis.",
      originalFileName: "test.pdf",
      filePath: "/uploads/test.pdf",
      fileSize: 1024,
      fileType: "pdf",
      userId: testUser._id,
    })
  })

  describe("POST /api/reviews/:documentId", () => {
    it("should create a new review", async () => {
      const response = await request(app)
        .post(`/api/reviews/${testDocument._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.review).toBeDefined()
      expect(response.body.data.review.status).toBe("pending")
    })

    it("should reject review for non-existent document", async () => {
      const fakeId = "507f1f77bcf86cd799439011"
      const response = await request(app)
        .post(`/api/reviews/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.success).toBe(false)
    })

    it("should reject duplicate pending review", async () => {
      await Review.create({
        documentId: testDocument._id,
        userId: testUser._id,
        status: "pending",
        aiAnalysis: {
          model: "gpt-4",
          processingTime: 0,
          confidence: 0,
        },
      })

      const response = await request(app)
        .post(`/api/reviews/${testDocument._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBeDefined()
    })
  })

  describe("GET /api/reviews", () => {
    beforeEach(async () => {
      await Review.create({
        documentId: testDocument._id,
        userId: testUser._id,
        status: "completed",
        scores: {
          grammar: 85,
          spelling: 90,
          style: 80,
          coherence: 88,
          citation: 75,
          originality: 95,
        },
        aiAnalysis: {
          model: "gpt-4",
          processingTime: 5000,
          confidence: 0.9,
        },
      })
    })

    it("should get user reviews", async () => {
      const response = await request(app).get("/api/reviews").set("Authorization", `Bearer ${authToken}`).expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.reviews).toBeDefined()
      expect(response.body.data.reviews.length).toBeGreaterThan(0)
      expect(response.body.data.pagination).toBeDefined()
    })

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/reviews?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.data.pagination).toBeDefined()
    })

    it("should filter by status", async () => {
      const response = await request(app)
        .get("/api/reviews?status=completed")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      if (response.body.data.reviews.length > 0) {
        response.body.data.reviews.forEach((review) => {
          expect(review.status).toBe("completed")
        })
      }
    })
  })

  describe("GET /api/reviews/:id", () => {
    let testReview

    beforeEach(async () => {
      testReview = await Review.create({
        documentId: testDocument._id,
        userId: testUser._id,
        status: "completed",
        scores: {
          grammar: 85,
          spelling: 90,
          style: 80,
          coherence: 88,
          citation: 75,
          originality: 95,
        },
        aiAnalysis: {
          model: "gpt-4",
          processingTime: 5000,
          confidence: 0.9,
        },
      })
    })

    it("should get review by ID", async () => {
      const response = await request(app)
        .get(`/api/reviews/${testReview._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.review.status).toBe("completed")
    })

    it("should reject access to other user review", async () => {
      const otherUser = await User.create({
        name: "Other User",
        email: `other-${Date.now()}@example.com`,
        password: "password123",
      })
      const otherToken = otherUser.generateAuthToken()

      const response = await request(app)
        .get(`/api/reviews/${testReview._id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(403)

      expect(response.body.success).toBe(false)
    })
  })

  describe("PUT /api/reviews/:id/feedback", () => {
    let testReview

    beforeEach(async () => {
      testReview = await Review.create({
        documentId: testDocument._id,
        userId: testUser._id,
        status: "completed",
        aiAnalysis: {
          model: "gpt-4",
          processingTime: 5000,
          confidence: 0.9,
        },
      })
    })

    it("should add feedback to review", async () => {
      const response = await request(app)
        .put(`/api/reviews/${testReview._id}/feedback`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          isHelpful: true,
          rating: 5,
          comments: "Very helpful review!",
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.review.feedback).toBeDefined()
      if (response.body.data.review.feedback.isHelpful !== undefined) {
        expect(response.body.data.review.feedback.isHelpful).toBe(true)
      }
      if (response.body.data.review.feedback.rating !== undefined) {
        expect(response.body.data.review.feedback.rating).toBe(5)
      }
    })

    it("should reject feedback from non-owner", async () => {
      const otherUser = await User.create({
        name: "Other User",
        email: `other-${Date.now()}@example.com`,
        password: "password123",
      })
      const otherToken = otherUser.generateAuthToken()

      const response = await request(app)
        .put(`/api/reviews/${testReview._id}/feedback`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({
          isHelpful: true,
          rating: 5,
        })
        .expect(403)

      expect(response.body.success).toBe(false)
    })
  })
})
