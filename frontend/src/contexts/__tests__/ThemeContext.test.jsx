import { renderHook, act } from "@testing-library/react"
import { ThemeProvider, useTheme } from "../ThemeContext"

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>

  it("should use light theme by default", () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    expect(result.current.theme).toBe("light")
    expect(result.current.isDark).toBe(false)
  })

  it("should toggle theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    act(() => {
      result.current.toggleTheme()
    })
    
    expect(result.current.theme).toBe("dark")
    expect(result.current.isDark).toBe(true)
  })

  it("should load theme from localStorage", () => {
    localStorage.setItem("theme", "dark")
    
    const { result } = renderHook(() => useTheme(), { wrapper })
    
    expect(result.current.theme).toBe("dark")
  })
})