import { useEffect, useId } from 'react'
import { getStatusLabel } from '../utils/statuses'
import './utils.css'

export const Badge = ({ status, label = status }) => {
  return (
    <span className={`badge badge-${status}`}>
      {label === status ? getStatusLabel(status) : label}
    </span>
  )
}

export const Button = ({ 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  ...props 
}) => {
  const baseClass = `btn btn-${variant} btn-${size}`
  const finalClass = `${baseClass} ${className} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`
  
  return (
    <button 
      className={finalClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  )
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">X</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export const Loading = ({ fullScreen = false }) => {
  const className = fullScreen ? 'loading-container full-screen' : 'loading-container'
  return (
    <div className={className} role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <p>Loading...</p>
    </div>
  )
}

const EmptyIllustration = () => (
  <svg className="empty-state-svg" width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden="true">
    <rect x="10" y="15" width="100" height="70" rx="8" fill="var(--color-gray-100)" stroke="var(--color-gray-200)" strokeWidth="2"/>
    <rect x="22" y="30" width="32" height="6" rx="3" fill="var(--color-gray-300)"/>
    <rect x="22" y="44" width="50" height="6" rx="3" fill="var(--color-gray-200)"/>
    <rect x="22" y="58" width="24" height="6" rx="3" fill="var(--color-gray-200)"/>
    <rect x="66" y="58" width="32" height="6" rx="3" fill="var(--color-gray-200)"/>
    <rect x="72" y="30" width="26" height="6" rx="3" fill="var(--color-gray-200)"/>
    <circle cx="60" cy="82" r="14" fill="var(--color-gray-50)" stroke="var(--color-gray-200)" strokeWidth="2"/>
    <path d="M66 82l-8-8M66 82l-8 8" stroke="var(--color-gray-400)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const SearchEmptyIllustration = () => (
  <svg className="empty-state-svg" width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden="true">
    <circle cx="52" cy="46" r="22" fill="var(--color-gray-100)" stroke="var(--color-gray-200)" strokeWidth="2"/>
    <path d="M68 62l16 16" stroke="var(--color-gray-300)" strokeWidth="3" strokeLinecap="round"/>
    <rect x="78" y="45" width="28" height="3" rx="1.5" fill="var(--color-gray-200)"/>
    <rect x="78" y="53" width="20" height="3" rx="1.5" fill="var(--color-gray-200)"/>
    <rect x="78" y="61" width="24" height="3" rx="1.5" fill="var(--color-gray-200)"/>
  </svg>
)

export const EmptyState = ({ title, description, icon = '', variant = 'empty' }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon || (variant === 'search' ? <SearchEmptyIllustration /> : <EmptyIllustration />)}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'Please try again.',
  actionLabel = 'Retry',
  onAction,
}) => {
  return (
    <div className="error-state" role="alert">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export const Alert = ({ type = 'info', message, onClose }) => {
  return (
    <div className={`alert alert-${type}`} role={type === 'danger' ? 'alert' : 'status'}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} className="alert-close" aria-label="Dismiss message">X</button>}
    </div>
  )
}

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  )
}
