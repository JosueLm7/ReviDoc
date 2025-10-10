const mongoose = require('mongoose')
const User = require('../../../models/User')

describe('User Model', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const user = new User(userData)
      const savedUser = await user.save()

      expect(savedUser._id).toBeDefined()
      expect(savedUser.name).toBe(userData.name)
      expect(savedUser.email).toBe(userData.email)
      expect(savedUser.role).toBe('student')
      expect(savedUser.isActive).toBe(true)
      expect(savedUser.password).not.toBe(userData.password) // Debe estar hasheado
    })

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      await new User(userData).save()
      
      const duplicateUser = new User(userData)
      await expect(duplicateUser.save()).rejects.toThrow(mongoose.Error)
    })

    it('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      }

      const user = new User(userData)
      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError)
    })
  })

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const user = new User(userData)
      await user.save()

      expect(user.password).not.toBe(userData.password)
      expect(user.password).toMatch(/^\$2[ayb]\$/)
    })

    it('should not rehash password if not modified', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const user = new User(userData)
      await user.save()
      const originalPassword = user.password

      user.name = 'Updated Name'
      await user.save()

      expect(user.password).toBe(originalPassword)
    })
  })

  describe('Password Comparison', () => {
    it('should correctly compare valid password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const user = new User(userData)
      await user.save()

      const isMatch = await user.comparePassword('password123')
      expect(isMatch).toBe(true)
    })

    it('should reject invalid password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const user = new User(userData)
      await user.save()

      const isMatch = await user.comparePassword('wrongpassword')
      expect(isMatch).toBe(false)
    })
  })

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', async () => {
      // Configurar JWT_SECRET para testing
      process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only'
      process.env.JWT_EXPIRE = '7d'

      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const user = new User(userData)
      await user.save()

      const token = user.generateAuthToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      
      // Verificar que el token se puede decodificar
      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      expect(decoded.id).toBe(user._id.toString())
      expect(decoded.email).toBe(user.email)
      expect(decoded.role).toBe(user.role)
    })
  })

  describe('User Statistics', () => {
    it('should initialize statistics with default values', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const user = new User(userData)
      await user.save()

      expect(user.statistics.documentsUploaded).toBe(0)
      expect(user.statistics.reviewsReceived).toBe(0)
      expect(user.statistics.averageScore).toBe(0)
    })
  })
})