import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'

// Mock mejorado para AuthContext
const createMockAuthValue = (overrides = {}) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: jest.fn().mockResolvedValue({ success: true }),
  register: jest.fn().mockResolvedValue({ success: true }),
  logout: jest.fn().mockResolvedValue({ success: true }),
  updateUser: jest.fn(),
  clearError: jest.fn(),
  ...overrides
})

// Proveedores para tests
const AllTheProviders = ({ children, authValue = {} }) => {
  const mockAuthValue = createMockAuthValue(authValue)
  
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider value={mockAuthValue}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

// Render personalizado
const customRender = (ui, options = {}) => {
  const { authValue, ...renderOptions } = options
  
  return render(ui, { 
    wrapper: ({ children }) => (
      <AllTheProviders authValue={authValue}>
        {children}
      </AllTheProviders>
    ), 
    ...renderOptions 
  })
}

// Re-exportar todo
export * from '@testing-library/react'

// Exportar funciones
export { 
  customRender as render, 
  customRender as renderWithProviders,
  createMockAuthValue 
}