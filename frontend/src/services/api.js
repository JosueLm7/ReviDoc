import axios from "axios"
import { toast } from "react-toastify"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// ✅ Función para obtener el token (solo lectura)
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// ✅ Función para limpiar tokens (solo para interceptor)
export const clearAuthData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // No establecer Content-Type para FormData, axios lo hace automáticamente
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json"
    }
    
    console.log("🔵 Configuración de request:", {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      hasFormData: config.data instanceof FormData
    })
    
    return config
  },
  (error) => {
    console.error("❌ Error en request interceptor:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response exitoso:", {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response
  },
  (error) => {
    // ✅ Captura robusta de errores
    const url = error.config?.url || "URL desconocida"
    const status = error.response?.status || "Sin respuesta"
    const message = error.response?.data?.message || error.message || "Error desconocido"
    const responseData = error.response?.data || "Sin datos"

    console.error("❌ Error en response interceptor:", {
      url,
      status,
      message,
      responseData
    })

    // 🔐 Manejo seguro de errores 401
    if (error.response?.status === 401) {
      clearAuthData()
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }

    // ⚠️ Errores de servidor
    if (error.response?.status >= 500) {
      toast.error("Error interno del servidor. Por favor, intenta más tarde.")
    }

    // ⚠️ Errores de red o sin respuesta
    if (error.message === "Network Error" || !error.response) {
      toast.error("Error de conexión con el servidor.")
    }

    return Promise.reject(error)
  }
)

// Auth API - ✅ Solo hace las peticiones, NO guarda tokens
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  
  // ✅ AGREGADO: Funciones para perfil y contraseña
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  changePassword: (passwordData) => api.put("/auth/password", passwordData),
}

// Users API
export const usersAPI = {
  getUsers: (params) => api.get("/users", { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStatistics: (id) => api.get(`/users/${id}/statistics`),
  
  // ✅ AGREGADO: Alternativa para funciones de perfil (si prefieres esta ruta)
  updateUserProfile: (id, profileData) => api.put(`/users/${id}/profile`, profileData),
  changeUserPassword: (id, passwordData) => api.put(`/users/${id}/password`, passwordData),
}

// Documents API
export const documentsAPI = {
  getDocuments: (params) => api.get("/documents", { params }),
  getDocumentById: (id) => api.get(`/documents/${id}`),
  uploadDocument: (formData) => {
    console.log("📤 Subiendo documento a endpoint: /documents")
    
    // Verificar contenido del FormData
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`   ${key}:`, value.name, value.type, value.size)
      }
    }
    
    return api.post("/documents", formData, {
      timeout: 120000,
    })
  },
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
}

// ✅ Función para descargar archivos
export const getDocumentFile = (filename) => {
  const token = getToken()
  return axios.get(`${API_URL}/documents/file/${filename}`, {
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

// Reviews API
export const reviewsAPI = {
  getReviews: (params) => api.get("/reviews", { params }),
  getReviewById: (id) => api.get(`/reviews/${id}`),
  createReview: (documentId) => api.post(`/reviews/${documentId}`),
  addFeedback: (id, feedback) => api.put(`/reviews/${id}/feedback`, feedback),
}

// AI API
export const aiAPI = {
  analyzeText: (data) => api.post("/ai/analyze", data),
  checkPlagiarism: (data) => api.post("/ai/plagiarism", data),
  generateSuggestions: (data) => api.post("/ai/suggestions", data),
  getModels: () => api.get("/ai/models"),
}

// Statistics API
export const statisticsAPI = {
  getDashboardStats: () => api.get("/statistics/dashboard"),
  getTrends: (params) => api.get("/statistics/trends", { params }),
  getUserStats: () => api.get("/statistics/users"),
  generateStats: (data) => api.post("/statistics/generate", data),
}

// ✅ AGREGADO: Profile API (para agrupar funciones relacionadas con perfil)
export const profileAPI = {
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  changePassword: (passwordData) => api.put("/auth/password", passwordData),
  uploadAvatar: (formData) => api.post("/auth/avatar", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export default api