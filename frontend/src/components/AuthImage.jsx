import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../utils/api'

const resolveImageUrl = (src) => {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  return `${API_BASE_URL}${src.startsWith('/') ? src : `/${src}`}`
}

export const AuthImage = ({ src, alt, className = '', ...props }) => {
  const [objectUrl, setObjectUrl] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!src) return undefined

    const controller = new AbortController()
    let activeObjectUrl = ''

    const loadImage = async () => {
      try {
        setFailed(false)
        const token = localStorage.getItem('authToken')
        const response = await fetch(resolveImageUrl(src), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Image request failed with ${response.status}`)
        }

        const blob = await response.blob()
        activeObjectUrl = URL.createObjectURL(blob)
        setObjectUrl(activeObjectUrl)
      } catch (error) {
        if (!controller.signal.aborted) {
          setFailed(true)
          setObjectUrl('')
          console.error(error)
        }
      }
    }

    loadImage()

    return () => {
      controller.abort()
      if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl)
    }
  }, [src])

  if (failed) {
    return (
      <div className={`auth-image-fallback ${className}`} role="img" aria-label={alt || 'Image unavailable'}>
        Image unavailable
      </div>
    )
  }

  if (!objectUrl) {
    return (
      <div className={`auth-image-loading ${className}`} role="status" aria-label="Loading image">
        Loading image
      </div>
    )
  }

  return <img src={objectUrl} alt={alt} className={className} {...props} />
}
