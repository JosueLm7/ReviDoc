import { clsx } from "clsx"

export function cn(...inputs) {
  return clsx(inputs)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getStatusColor(status) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    failed: "bg-red-100 text-red-800 border-red-200",
  }

  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
}

export function getRoleColor(role) {
  const colors = {
    student: "bg-blue-100 text-blue-800 border-blue-200",
    teacher: "bg-purple-100 text-purple-800 border-purple-200",
    admin: "bg-red-100 text-red-800 border-red-200",
  }

  return colors[role] || "bg-gray-100 text-gray-800 border-gray-200"
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
