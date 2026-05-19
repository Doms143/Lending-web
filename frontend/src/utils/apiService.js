import apiClient from './api'

export const applicationApi = {
  getApplications: async (skip = 0, limit = 100, status = null) => {
    const params = new URLSearchParams()
    params.append('skip', skip)
    params.append('limit', limit)
    if (status) params.append('status', status)
    const response = await apiClient.get(`/api/v1/applications?${params}`)
    return response.data
  },

  getApplication: async (appId) => {
    const response = await apiClient.get(`/api/v1/applications/${appId}`)
    return response.data
  },

  getDashboardSummary: async () => {
    const response = await apiClient.get('/api/v1/applications/summary')
    return response.data
  },

  approveApplication: async (appId) => {
    const response = await apiClient.post(`/api/v1/admin/applications/${appId}/approve`)
    return response.data
  },

  rejectApplication: async (appId, rejectionReason) => {
    const response = await apiClient.post(`/api/v1/admin/applications/${appId}/reject`, {
      status: 'rejected',
      rejection_reason: rejectionReason
    })
    return response.data
  },

  updateNotes: async (appId, notes) => {
    const response = await apiClient.put(`/api/v1/admin/applications/${appId}/notes`, {
      notes
    })
    return response.data
  },

  exportApplications: async (statusFilter = null) => {
    const response = await apiClient.get('/api/v1/admin/applications/export/csv', {
      params: { status_filter: statusFilter }
    })
    return response.data
  },

  downloadAsCSV: async (data, filename = 'applications.csv') => {
    const csv = convertToCSV(data)
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`)
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }
}

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/api/v1/auth/login', { email, password })
    return response.data
  },

  signup: async (email, password, fullName) => {
    const response = await apiClient.post('/api/v1/auth/signup', { email, password, full_name: fullName })
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/logout')
    return response.data
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/v1/auth/me')
    return response.data
  }
}

const convertToCSV = (data) => {
  if (!data || data.length === 0) return ''
  const keys = Object.keys(data[0])
  const header = keys.join(',')
  const rows = data.map(item =>
    keys.map(key => {
      const value = item[key]
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`
      return value
    }).join(',')
  )
  return [header, ...rows].join('\n')
}
