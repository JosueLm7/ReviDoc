import axios from "axios"
import { toast } from "react-toastify"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
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
      status: response.status
    })
    return response
  },
  (error) => {
    console.error("❌ Error en response interceptor:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data
    })
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }

    if (error.response?.status >= 500) {
      toast.error("Error interno del servidor. Por favor, intenta más tarde.")
    }

    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
}

// Users API
export const usersAPI = {
  getUsers: (params) => api.get("/users", { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStatistics: (id) => api.get(`/users/${id}/statistics`),
}

// Documents API - Corregido para upload
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

export const getDocumentFile = (filename) => {
  return axios.get(`${API_URL}/documents/file/${filename}`, {
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${getToken()}`
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

export default api