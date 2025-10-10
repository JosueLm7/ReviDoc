const mongoose = require('mongoose')
const Statistics = require('../../../models/Statistics')

describe('Statistics Model', () => {
  beforeEach(async () => {
    await Statistics.deleteMany({})
  })

  describe('Statistics Creation', () => {
    it('should create valid statistics', async () => {
      const statsData = {
        date: new Date(),
        users: {
          total: 100,
          active: 75,
          new: 10,
          byRole: {
            students: 80,
            teachers: 15,
            admins: 5
          }
        },
        documents: {
          total: 50,
          uploaded: 5,
          processed: 45,
          byCategory: {
            essay: 30,
            thesis: 10,
            article: 5,
            report: 3,
            other: 2
          }
        },
        reviews: {
          total: 40,
          completed: 35,
          averageScore: 82.5,
          averageProcessingTime: 1200
        }
      }

      const stats = new Statistics(statsData)
      const savedStats = await stats.save()

      expect(savedStats._id).toBeDefined()
      expect(savedStats.users.total).toBe(100)
      expect(savedStats.documents.total).toBe(50)
      expect(savedStats.reviews.averageScore).toBe(82.5)
    })

    it('should require date field', async () => {
      const stats = new Statistics({
        users: { total: 100 }
      })

      await expect(stats.save()).rejects.toThrow(mongoose.Error.ValidationError)
    })
  })
})