"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/api"
import { toast } from "react-toastify"
import axios from "axios"

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null }
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case "AUTH_FAILURE":
      return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false, error: action.payload }
    case "LOGOUT":
      return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false, error: null }
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ✅ **Verificación de autenticación mejorada**
  useEffect(() => {
    const checkAuth = async () => {
      // Solo ejecutar en cliente
      if (typeof window === "undefined") {
        dispatch({ type: "AUTH_FAILURE", payload: null })
        return
      }

      try {
        const token = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        // Si no hay token, limpiar todo
        if (!token) {
          localStorage.removeItem("user")
          dispatch({ type: "AUTH_FAILURE", payload: null })
          return
        }

        // ✅ **Validación robusta del usuario almacenado**
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          try {
            const parsedUser = JSON.parse(storedUser)
            
            // Validar que el usuario tenga la estructura esperada
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
              dispatch({
                type: "AUTH_SUCCESS",
                payload: { user: parsedUser, token },
              })
              return
            }
          } catch (parseError) {
            console.error("Error parsing stored user:", parseError)
            // Continuar para obtener usuario desde el backend
          }
        }

        // ✅ **Obtener usuario desde el backend si el token es válido**
        try {
          const response = await authAPI.getCurrentUser()
          const userData = response.data.user || response.data.data?.user
          
          if (userData) {
            localStorage.setItem("user", JSON.stringify(userData))
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user: userData, token },
            })
          } else {
            throw new Error("Datos de usuario no válidos")
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          // Limpiar datos inválidos
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          dispatch({ 
            type: "AUTH_FAILURE", 
            payload: "Sesión expirada o inválida" 
          })
        }

      } catch (error) {
        console.error("Error in auth check:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        dispatch({ type: "AUTH_FAILURE", payload: null })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: "AUTH_START" })
      const response = await authAPI.login(credentials)

      const { user, token } = response.data.data

      // ✅ **Guardar de forma segura**
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      dispatch({ type: "AUTH_SUCCESS", payload: { user, token } })
      toast.success(`¡Bienvenido, ${user.name}!`)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Error al iniciar sesión"
      dispatch({ type: "AUTH_FAILURE", payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: "AUTH_START" })
      const response = await authAPI.register(userData)
      const { user, token } = response.data.data
      
      // ✅ **Guardar de forma segura**
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      dispatch({ type: "AUTH_SUCCESS", payload: { user, token } })
      toast.success("¡Cuenta creada exitosamente!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Error al crear cuenta"
      dispatch({ type: "AUTH_FAILURE", payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      // ✅ **Limpiar consistentemente**
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      dispatch({ type: "LOGOUT" })
      toast.info("Sesión cerrada")
    }
  }

  const updateUser = (userData) => {
    // ✅ **Actualizar state y localStorage de forma atómica**
    const updatedUser = { ...state.user, ...userData }
    dispatch({ type: "UPDATE_USER", payload: userData })
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  const clearError = () => dispatch({ type: "CLEAR_ERROR" })

  const value = { ...state, login, register, logout, updateUser, clearError }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}