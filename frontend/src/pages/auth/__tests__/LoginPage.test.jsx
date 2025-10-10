import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import LoginPage from "../LoginPage"
import { render as customRender } from "../../../utils/test-utils"

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ 
    state: { from: { pathname: "/dashboard" } } 
  }),
}))

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it("should render login form", () => {
    customRender(<LoginPage />)

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it("should show validation errors", async () => {
    customRender(<LoginPage />)
    
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument()
    })
  })

  it("should validate email format", async () => {
    customRender(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    fireEvent.change(emailInput, {
      target: { value: "invalid-email" }
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el email no es válido/i)).toBeInTheDocument()
    })
  })

  it("should submit form with valid data", async () => {
    const mockLogin = jest.fn().mockResolvedValue({ success: true })
    
    customRender(<LoginPage />, {
      authValue: {
        login: mockLogin,
        isAuthenticated: false,
        isLoading: false,
        user: null,
      }
    })
    
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" }
    })
    fireEvent.change(passwordInput, {
      target: { value: "password123" }
    })
    
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123"
      })
    })
  })

  it("should handle login error", async () => {
    const mockLogin = jest.fn().mockResolvedValue({ 
      success: false, 
      error: "Credenciales inválidas" 
    })
    
    customRender(<LoginPage />, {
      authValue: {
        login: mockLogin,
        isAuthenticated: false,
        isLoading: false,
        user: null,
      }
    })
    
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" }
    })
    fireEvent.change(passwordInput, {
      target: { value: "wrongpassword" }
    })
    
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "wrongpassword"
      })
    })
  })
})