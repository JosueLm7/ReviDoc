const mongoose = require("mongoose")

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true,
      maxlength: [200, "El título no puede exceder 200 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "La descripción no puede exceder 1000 caracteres"],
    },
    content: {
      type: String,
      required: [true, "El contenido es requerido"],
    },
    originalFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ["pdf", "doc", "docx", "txt"],
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
    category: {
      type: String,
      enum: ["essay", "thesis", "article", "report", "other"],
      default: "essay",
    },
    academicLevel: {
      type: String,
      enum: ["undergraduate", "graduate", "postgraduate", "phd"],
      default: "undergraduate",
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [100, "La materia no puede exceder 100 caracteres"],
    },
    citationStyle: {
      type: String,
      enum: ["apa", "ieee", "mla", "chicago"],
      default: "apa",
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      enum: ["es", "en"],
      default: "es",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      processingTime: { type: Number, default: 0 },
      aiModel: { type: String, default: null },
      confidence: { type: Number, default: 0 },
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better performance
documentSchema.index({ userId: 1 })
documentSchema.index({ status: 1 })
documentSchema.index({ createdAt: -1 })
documentSchema.index({ category: 1 })
documentSchema.index({ academicLevel: 1 })

// Virtual for document's reviews
documentSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "documentId",
})

// Virtual for latest review
documentSchema.virtual("latestReview", {
  ref: "Review",
  localField: "_id",
  foreignField: "documentId",
  justOne: true,
  options: { sort: { createdAt: -1 } },
})

// Pre-save middleware to calculate word count
documentSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.wordCount = this.content.split(/\s+/).filter((word) => word.length > 0).length
  }
  next()
})

module.exports = mongoose.model("Document", documentSchema)
