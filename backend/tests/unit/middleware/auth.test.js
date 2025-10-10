const jwt = require('jsonwebtoken')
const { auth } = require('../../../middleware/auth')

describe('Auth Middleware', () => {
  let mockReq, mockRes, mockNext

  beforeEach(() => {
    mockReq = {
      header: jest.fn()
    }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    mockNext = jest.fn()
  })

  it('should call next with valid token', () => {
    const token = jwt.sign(
      { id: '123', email: 'test@test.com' }, 
      process.env.JWT_SECRET || 'test-secret'
    )
    
    mockReq.header.mockReturnValue(`Bearer ${token}`)

    auth(mockReq, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(mockReq.user).toBeDefined()
  })

  it('should return 401 without token', () => {
    mockReq.header.mockReturnValue(null)

    auth(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Acceso denegado. No token proporcionado.'
    })
  })
})