import { render, screen } from "@testing-library/react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "../ProtectedRoute"
import { render as customRender } from "../../../utils/test-utils"

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ 
    pathname: "/protected",
    state: { from: { pathname: "/protected" } }
  }),
}))

// Componente de prueba
const TestComponent = () => <div>Protected Content</div>
const LoadingComponent = () => <div>Loading...</div>

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it("should render children when authenticated", () => {
    const authValue = {
      user: { id: "1", name: "Test User", role: "student" },
      isAuthenticated: true,
      isLoading: false,
    }

    customRender(
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          } 
        />
      </Routes>,
      { authValue }
    )

    expect(screen.getByText("Protected Content")).toBeInTheDocument()
  })

  it("should redirect to login when not authenticated", () => {
    const authValue = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }

    customRender(
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          } 
        />
      </Routes>,
      { authValue }
    )

    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      state: { from: { pathname: "/protected" } }
    })
  })

  it("should show loading while checking authentication", () => {
    const authValue = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
    }

    customRender(
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute loadingComponent={<LoadingComponent />}>
              <TestComponent />
            </ProtectedRoute>
          } 
        />
      </Routes>,
      { authValue }
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("should preserve location state for redirect", () => {
    const authValue = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }

    customRender(
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          } 
        />
      </Routes>,
      { authValue }
    )

    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      state: { from: { pathname: "/protected" } }
    })
  })
})