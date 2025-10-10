import { renderHook, act } from "@testing-library/react"
import { AuthProvider, useAuth } from "../AuthContext"

// Mock de la API - debe definirse ANTES del jest.mock
const mockAuthAPI = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
}

jest.mock("../../services/api", () => ({
  authAPI: mockAuthAPI,
}))

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

  it("should have initial state", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it("should login successfully", async () => {
    const mockUser = { 
      id: "1", 
      name: "Test User", 
      email: "test@test.com",
      role: "student"
    }
    const mockToken = "mock-token"
    
    mockAuthAPI.login.mockResolvedValue({
      data: { 
        data: { 
          user: mockUser, 
          token: mockToken 
        } 
      }
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    let loginResult
    await act(async () => {
      loginResult = await result.current.login({
        email: "test@test.com",
        password: "password123"
      })
    })

    expect(mockAuthAPI.login).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password123"
    })
    expect(loginResult.success).toBe(true)
  })

  it("should handle login failure", async () => {
    mockAuthAPI.login.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } }
    })

    const { result } = renderHook(() => useAuth(), { wrapper })
    
    let loginResult
    await act(async () => {
      loginResult = await result.current.login({
        email: "test@test.com",
        password: "wrongpassword"
      })
    })

    expect(loginResult.success).toBe(false)
    expect(loginResult.error).toBe("Invalid credentials")
  })
})