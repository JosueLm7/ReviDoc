const mongoose = require("mongoose")

const issueSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["grammar", "spelling", "style", "coherence", "citation", "plagiarism", "structure"],
    required: true,
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  position: {
    start: { type: Number, required: true },
    end: { type: Number, required: true },
  },
  originalText: {
    type: String,
    required: true,
  },
  suggestion: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
})

const reviewSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    scores: {
      grammar: { type: Number, min: 0, max: 100, default: 0 },
      spelling: { type: Number, min: 0, max: 100, default: 0 },
      style: { type: Number, min: 0, max: 100, default: 0 },
      coherence: { type: Number, min: 0, max: 100, default: 0 },
      citation: { type: Number, min: 0, max: 100, default: 0 },
      originality: { type: Number, min: 0, max: 100, default: 0 },
    },
    issues: [issueSchema],
    summary: {
      totalIssues: { type: Number, default: 0 },
      criticalIssues: { type: Number, default: 0 },
      resolvedIssues: { type: Number, default: 0 },
      improvementSuggestions: [String],
    },
    aiAnalysis: {
      model: { type: String, required: true },
      processingTime: { type: Number, default: 0 },
      confidence: { type: Number, min: 0, max: 1, default: 0 },
      metadata: mongoose.Schema.Types.Mixed,
    },
    plagiarismCheck: {
      similarity: { type: Number, min: 0, max: 100, default: 0 },
      sources: [
        {
          url: String,
          title: String,
          similarity: Number,
          matchedText: String,
        },
      ],
      isOriginal: { type: Boolean, default: true },
    },
    feedback: {
      isHelpful: { type: Boolean, default: null },
      rating: { type: Number, min: 1, max: 5, default: null },
      comments: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better performance
reviewSchema.index({ documentId: 1 })
reviewSchema.index({ userId: 1 })
reviewSchema.index({ status: 1 })
reviewSchema.index({ createdAt: -1 })
reviewSchema.index({ overallScore: -1 })

// Pre-save middleware to calculate summary
reviewSchema.pre("save", function (next) {
  if (this.isModified("issues")) {
    this.summary.totalIssues = this.issues.length
    this.summary.criticalIssues = this.issues.filter((issue) => issue.severity === "critical").length
    this.summary.resolvedIssues = this.issues.filter((issue) => issue.isResolved).length
  }

  if (this.isModified("scores")) {
    const scoreValues = Object.values(this.scores)
    this.overallScore = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length
  }

  next()
})

module.exports = mongoose.model("Review", reviewSchema)
