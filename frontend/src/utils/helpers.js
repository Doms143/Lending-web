export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

export const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getStatusColor = (status) => {
  const colors = {
    pending: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected'
  }
  return colors[status] || 'status-pending'
}

export const getStatusBadgeClass = (status) => {
  return `badge badge-${status}`
}

export const truncateText = (text, length = 50) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const getAuthImageUrl = (url) => {
  if (!url) return url
  const token = localStorage.getItem('authToken')
  if (!token) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}token=${encodeURIComponent(token)}`
}
