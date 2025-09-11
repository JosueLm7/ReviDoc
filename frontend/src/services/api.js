import axios from "axios"
import { toast } from "react-toastify"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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

// Documents API
export const documentsAPI = {
  getDocuments: (params) => api.get("/documents", { params }),
  getDocumentById: (id) => api.get(`/documents/${id}`),
  uploadDocument: (formData) => {
    return api.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
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
