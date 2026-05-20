import axios from 'axios'

const normalizeApiUrl = (value) => {
  let url = (value || 'http://localhost:8000').trim().replace(/\/+$/, '')

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }

  if (/^http:\/\//i.test(url) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url)) {
    return url.replace(/^http:\/\//i, 'https://')
  }

  return url
}

export const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL)

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      if (!url.includes('/auth/login') && !url.includes('/auth/signup')) {
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
