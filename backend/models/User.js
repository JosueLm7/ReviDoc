const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Por favor ingresa un email válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    avatar: {
      type: String,
      default: null,
    },
    institution: {
      type: String,
      trim: true,
      maxlength: [200, "La institución no puede exceder 200 caracteres"],
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, "El departamento no puede exceder 100 caracteres"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    preferences: {
      language: {
        type: String,
        enum: ["es", "en"],
        default: "es",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
    },
    statistics: {
      documentsUploaded: { type: Number, default: 0 },
      reviewsReceived: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.password
        delete ret.__v
        return ret
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.password
        delete ret.__v
        return ret
      }
    },
  },
)

// Indexes for better performance
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

// Virtual for user's documents
userSchema.virtual("documents", {
  ref: "Document",
  localField: "_id",
  foreignField: "userId",
})

// ✅ CORREGIDO para Mongoose v7+: Hash password before saving
userSchema.pre("save", async function () {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified("password")) return

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error) {
    throw new Error(`Error al hashear la contraseña: ${error.message}`)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" },
  )
}

// Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date()
  return this.save({ validateBeforeSave: false })
}

// Virtual para nombre completo
userSchema.virtual("fullName").get(function () {
  return this.name
})

module.exports = mongoose.model("User", userSchema)