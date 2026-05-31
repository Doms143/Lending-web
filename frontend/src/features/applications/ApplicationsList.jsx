import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { applicationApi } from '../../utils/apiService'
import { Badge, Button, EmptyState, ErrorState } from '../../components/Common'
import { Icon } from '../../components/Icon'
import { APPLICATION_STATUSES, getStatusLabel } from '../../utils/statuses'
import './applications.css'

export const ApplicationsList = ({ onSelectApp, statusFilter = null }) => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter)
  const [sortConfig, setSortConfig] = useState({ key: 'submitted_at', direction: 'desc' })
  
  const pageSize = 20

  useEffect(() => {
    fetchApplications()
  }, [currentPage, localStatusFilter])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const skip = (currentPage - 1) * pageSize
      const data = await applicationApi.getApplications(skip, pageSize, localStatusFilter)
      
      setApplications(data.data || [])
      setTotalCount(data.total || 0)
      setTotalPages(Math.max(1, Math.ceil((data.total || 0) / pageSize)))
    } catch (err) {
      setError('Unable to load applications. Check that the backend is running and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const normalizedSearch = searchTerm.toLowerCase()
  const filteredApplications = applications.filter(app =>
    String(app.full_name || '').toLowerCase().includes(normalizedSearch) ||
    String(app.email || '').toLowerCase().includes(normalizedSearch)
  )

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1
    const first = getSortValue(a, sortConfig.key)
    const second = getSortValue(b, sortConfig.key)

    if (first < second) return -1 * direction
    if (first > second) return 1 * direction
    return 0
  })

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleStatusChange = (status) => {
    setLocalStatusFilter(status)
    setCurrentPage(1)
  }

  const sortLabel = (key) => {
    if (sortConfig.key !== key) return ''
    return sortConfig.direction === 'asc' ? ' Asc' : ' Desc'
  }

  const sortDirection = (key) => {
    if (sortConfig.key !== key) return 'none'
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending'
  }

  if (loading) {
    return (
      <div className="applications-list">
        <div className="list-header">
          <div>
            <h2>Loan Applications</h2>
          </div>
        </div>
        <div className="skeleton-table">
          {[...Array(8)].map((_, i) => (
            <div className="skeleton-row" key={i}>
              <div className="skeleton-cell" style={{ width: '70%' }} />
              <div className="skeleton-cell" style={{ width: '85%' }} />
              <div className="skeleton-cell" style={{ width: '50%' }} />
              <div className="skeleton-cell" style={{ width: '60%' }} />
              <div className="skeleton-cell" style={{ width: '40%' }} />
              <div className="skeleton-cell" style={{ width: '55%' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="applications-list">
      <div className="list-header">
        <div>
          <h2>Loan Applications</h2>
          <p className="list-subtitle">
            {localStatusFilter
              ? <><strong>{getStatusLabel(localStatusFilter)}</strong> &middot; {totalCount} application{totalCount !== 1 ? 's' : ''}</>
              : <>{totalCount} application{totalCount !== 1 ? 's' : ''} total</>
            }
            {searchTerm && <> &middot; filtered &middot; {sortedApplications.length} shown</>}
          </p>
        </div>
        <div className="list-controls">
          <input
            id="application-search"
            type="text"
            placeholder="Search by name or email..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="status-tabs" aria-label="Application status filters">
        {[{ label: 'All', value: null }, ...APPLICATION_STATUSES].map((tab) => (
          <button
            key={tab.label}
            className={`status-tab ${localStatusFilter === tab.value ? 'active' : ''}`}
            type="button"
            aria-pressed={localStatusFilter === tab.value}
            onClick={() => handleStatusChange(tab.value)}
          >
            {tab.label}
            {tab.value === null && <span className="tab-count">{totalCount}</span>}
          </button>
        ))}
      </div>

      {error && (
        <ErrorState
          title="Could not load applications"
          description={error}
          onAction={fetchApplications}
        />
      )}

      {!error && sortedApplications.length === 0 ? (
        <EmptyState
          variant={applications.length > 0 ? 'search' : 'empty'}
          title={applications.length === 0 ? 'No applications yet' : 'No matching applications'}
          description={
            applications.length === 0
              ? 'New loan applications will appear here once submitted.'
              : 'Try adjusting your search or status filter.'
          }
        />
      ) : !error && (
        <>
          <div className="table-responsive">
            <table className="applications-table">
              <thead>
                <tr>
                  <th aria-sort={sortDirection('full_name')}>
                    <button className="sort-button" type="button" onClick={() => handleSort('full_name')}>
                      Name{sortLabel('full_name')}
                    </button>
                  </th>
                  <th aria-sort={sortDirection('email')}>
                    <button className="sort-button" type="button" onClick={() => handleSort('email')}>
                      Email{sortLabel('email')}
                    </button>
                  </th>
                  <th aria-sort={sortDirection('amount')}>
                    <button className="sort-button" type="button" onClick={() => handleSort('amount')}>
                      Amount{sortLabel('amount')}
                    </button>
                  </th>
                  <th aria-sort={sortDirection('submitted_at')}>
                    <button className="sort-button" type="button" onClick={() => handleSort('submitted_at')}>
                      Date Submitted{sortLabel('submitted_at')}
                    </button>
                  </th>
                  <th aria-sort={sortDirection('status')}>
                    <button className="sort-button" type="button" onClick={() => handleSort('status')}>
                      Status{sortLabel('status')}
                    </button>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedApplications.map(app => (
                  <tr
                    key={app.id}
                    className={`table-row status-${app.status}-row`}
                    onClick={() => onSelectApp(app.id)}
                    tabIndex={0}
                    aria-label={`Review application for ${app.full_name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectApp(app.id)
                      }
                    }}
                  >
                    <td className="col-name">{app.full_name}</td>
                    <td className="col-email">{app.email}</td>
                    <td className="col-amount">{formatCurrency(app.amount)}</td>
                    <td className="col-date">{formatDate(app.submitted_at)}</td>
                    <td className="col-status">
                      <Badge status={app.status} />
                    </td>
                    <td className="col-action">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectApp(app.id)
                        }}
                      >
                        <Icon name="review" size={16} />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="applications-cards">
            {sortedApplications.map(app => (
              <button
                key={app.id}
                className={`application-card-row application-card-${app.status}`}
                type="button"
                onClick={() => onSelectApp(app.id)}
                aria-label={`Review ${app.full_name} application for ${formatCurrency(app.amount)}`}
              >
                <div className="application-card-top">
                  <div className="application-card-name">
                    <strong>{app.full_name}</strong>
                    <span>{app.email}</span>
                  </div>
                  <Badge status={app.status} />
                </div>

                <div className="application-card-details">
                  <div>
                    <span className="application-card-label">Amount</span>
                    <strong>{formatCurrency(app.amount)}</strong>
                  </div>
                  <div>
                    <span className="application-card-label">Submitted</span>
                    <strong>{formatDate(app.submitted_at)}</strong>
                  </div>
                </div>

                <div className="application-card-action">
                  <span>Review application</span>
                  <Icon name="review" size={16} />
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <Icon name="arrowLeft" size={14} />
                Previous
              </Button>
              {(() => {
                const pages = []
                const start = Math.max(1, currentPage - 2)
                const end = Math.min(totalPages, currentPage + 2)
                if (start > 1) {
                  pages.push(<button key={1} className="page-number-btn" onClick={() => setCurrentPage(1)}>1</button>)
                  if (start > 2) pages.push(<span key="start-dots" className="page-info" style={{ minWidth: 'auto' }}>...</span>)
                }
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`page-number-btn ${i === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i}
                    </button>
                  )
                }
                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push(<span key="end-dots" className="page-info" style={{ minWidth: 'auto' }}>...</span>)
                  pages.push(<button key={totalPages} className="page-number-btn" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>)
                }
                return pages
              })()}
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
                <Icon name="arrowLeft" size={14} style={{ transform: 'rotate(180deg)' }} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const getSortValue = (app, key) => {
  if (key === 'amount') return Number(app.amount) || 0
  if (key === 'submitted_at') return app.submitted_at ? new Date(app.submitted_at).getTime() : 0
  return String(app[key] || '').toLowerCase()
}
