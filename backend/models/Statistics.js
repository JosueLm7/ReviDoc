const mongoose = require("mongoose")

const statisticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    users: {
      total: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      byRole: {
        students: { type: Number, default: 0 },
        teachers: { type: Number, default: 0 },
        admins: { type: Number, default: 0 },
      },
    },
    documents: {
      total: { type: Number, default: 0 },
      uploaded: { type: Number, default: 0 },
      processed: { type: Number, default: 0 },
      byCategory: {
        essay: { type: Number, default: 0 },
        thesis: { type: Number, default: 0 },
        article: { type: Number, default: 0 },
        report: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
      },
      byLevel: {
        undergraduate: { type: Number, default: 0 },
        graduate: { type: Number, default: 0 },
        postgraduate: { type: Number, default: 0 },
        phd: { type: Number, default: 0 },
      },
    },
    reviews: {
      total: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      averageProcessingTime: { type: Number, default: 0 },
      issueTypes: {
        grammar: { type: Number, default: 0 },
        spelling: { type: Number, default: 0 },
        style: { type: Number, default: 0 },
        coherence: { type: Number, default: 0 },
        citation: { type: Number, default: 0 },
        plagiarism: { type: Number, default: 0 },
      },
    },
    system: {
      apiCalls: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
      uptime: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
statisticsSchema.index({ date: -1 })
statisticsSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Statistics", statisticsSchema)
