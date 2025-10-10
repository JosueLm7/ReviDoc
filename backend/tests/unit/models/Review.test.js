const mongoose = require('mongoose')
const Review = require('../../../models/Review')

describe('Review Model', () => {
  beforeEach(async () => {
    await Review.deleteMany({})
  })

  describe('Review Creation', () => {
    it('should create a valid review', async () => {
      const reviewData = {
        documentId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        status: 'pending',
        aiAnalysis: {
          model: 'gpt-4',
          processingTime: 1500,
          confidence: 0.85
        },
        scores: {
          grammar: 85,
          spelling: 90,
          style: 78,
          coherence: 82,
          citation: 88,
          originality: 95
        },
        issues: [
          {
            type: 'grammar',
            severity: 'medium',
            position: { start: 10, end: 20 },
            originalText: 'This are wrong',
            suggestion: 'This is wrong',
            explanation: 'Subject-verb agreement error',
            confidence: 0.9
          }
        ]
      }

      const review = new Review(reviewData)
      const savedReview = await review.save()

      expect(savedReview._id).toBeDefined()
      expect(savedReview.status).toBe('pending')
      expect(savedReview.overallScore).toBeGreaterThan(0)
      expect(savedReview.summary.totalIssues).toBe(1)
    })

    it('should require documentId and userId', async () => {
      const review = new Review({
        status: 'pending',
        aiAnalysis: {
          model: 'gpt-4'
        }
      })

      await expect(review.save()).rejects.toThrow(mongoose.Error.ValidationError)
    })

    it('should calculate overall score automatically', async () => {
      const reviewData = {
        documentId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        aiAnalysis: { model: 'gpt-4' },
        scores: {
          grammar: 80,
          spelling: 90,
          style: 70,
          coherence: 85,
          citation: 75,
          originality: 95
        }
      }

      const review = new Review(reviewData)
      await review.save()

      const expectedAverage = (80 + 90 + 70 + 85 + 75 + 95) / 6
      expect(review.overallScore).toBe(expectedAverage)
    })

    it('should calculate issue summary automatically', async () => {
      const reviewData = {
        documentId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        aiAnalysis: { model: 'gpt-4' },
        issues: [
          {
            type: 'grammar',
            severity: 'critical',
            position: { start: 10, end: 20 },
            originalText: 'Wrong text',
            suggestion: 'Correct text',
            explanation: 'Explanation',
            confidence: 0.9,
            isResolved: true
          },
          {
            type: 'spelling',
            severity: 'medium',
            position: { start: 30, end: 40 },
            originalText: 'Speling error',
            suggestion: 'Spelling error',
            explanation: 'Explanation',
            confidence: 0.8
          }
        ]
      }

      const review = new Review(reviewData)
      await review.save()

      expect(review.summary.totalIssues).toBe(2)
      expect(review.summary.criticalIssues).toBe(1)
      expect(review.summary.resolvedIssues).toBe(1)
    })
  })

  describe('Review Validation', () => {
    it('should validate scores range', async () => {
      const reviewData = {
        documentId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        aiAnalysis: { model: 'gpt-4' },
        scores: {
          grammar: 150, // Invalid - above 100
          spelling: 90,
          style: 70,
          coherence: 85,
          citation: 75,
          originality: 95
        }
      }

      const review = new Review(reviewData)
      await expect(review.save()).rejects.toThrow(mongoose.Error.ValidationError)
    })
  })
})