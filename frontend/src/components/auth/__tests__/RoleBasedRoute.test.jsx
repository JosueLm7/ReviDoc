import { render, screen } from "@testing-library/react"
import RoleBasedRoute from "../RoleBasedRoute"
import { render as customRender } from "../../../utils/test-utils"

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/protected" }),
}))

// Componente de prueba
const TestComponent = () => <div>Test Content</div>
const LoadingComponent = () => <div>Loading...</div>

describe("RoleBasedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render children when user has required role", () => {
    const authValue = {
      user: { id: "1", name: "Test User", role: "teacher" },
      isAuthenticated: true,
      isLoading: false,
    }

    const { container } = customRender(
      <RoleBasedRoute requiredRole="teacher">
        <TestComponent />
      </RoleBasedRoute>,
      { authValue }
    )

    // Verificar que el componente se renderiza
    expect(container).toBeInTheDocument()
  })

  it("should redirect when user does not have required role", () => {
    const authValue = {
      user: { id: "1", name: "Test User", role: "student" },
      isAuthenticated: true,
      isLoading: false,
    }

    customRender(
      <RoleBasedRoute requiredRole="teacher">
        <TestComponent />
      </RoleBasedRoute>,
      { authValue }
    )

    expect(mockNavigate).toHaveBeenCalledWith("/unauthorized")
  })

  it("should show loading while checking authentication", () => {
    const authValue = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
    }

    customRender(
      <RoleBasedRoute 
        requiredRole="teacher" 
        loadingComponent={<LoadingComponent />}
      >
        <TestComponent />
      </RoleBasedRoute>,
      { authValue }
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("should redirect to login when not authenticated", () => {
    const authValue = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }

    customRender(
      <RoleBasedRoute requiredRole="teacher">
        <TestComponent />
      </RoleBasedRoute>,
      { authValue }
    )

    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      state: { from: { pathname: "/protected" } }
    })
  })
})