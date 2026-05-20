import { useState, useEffect } from 'react'
import { applicationApi } from '../../utils/apiService'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { Badge, Button, Card, Alert, ErrorState, Loading } from '../../components/Common'
import { Icon } from '../../components/Icon'
import './admin.css'

export const Dashboard = ({ onSelectApp, onViewApplications }) => {
  const [summary, setSummary] = useState({ total_applications: 0, pending_count: 0, approved_count: 0, rejected_count: 0, total_loan_amount: 0 })
  const [recentApplications, setRecentApplications] = useState([])
  const [pendingApplications, setPendingApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState(null)
  const [exportError, setExportError] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncMessage, setSyncMessage] = useState(null)
  const [syncStatus, setSyncStatus] = useState(null)
  const [showExportOptions, setShowExportOptions] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setDashboardError(null)

      const [summaryData, recentData, pendingData] = await Promise.all([
        applicationApi.getDashboardSummary(),
        applicationApi.getApplications(0, 5),
        applicationApi.getApplications(0, 5, 'pending')
      ])

      setSummary(summaryData)
      setRecentApplications(recentData.data || [])
      setPendingApplications(pendingData.data || [])

      try {
        const status = await applicationApi.getSyncStatus()
        setSyncStatus(status)
      } catch (syncErr) {
        console.error(syncErr)
      }
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail
      const message = detail
        ? `Backend returned ${status || 'an error'}: ${detail}`
        : err.message || 'Check that the backend is running, then try again.'
      setDashboardError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (statusFilter = null) => {
    try {
      setExportLoading(true)
      setExportError(null)
      const data = await applicationApi.exportApplications(statusFilter)
      const csv = convertToCSV(data.data)
      const element = document.createElement('a')
      element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`)
      element.setAttribute('download', `applications-${statusFilter || 'all'}-${new Date().toISOString().split('T')[0]}.csv`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } catch (err) {
      setExportError('Failed to export applications. Try again in a moment.')
      console.error(err)
    } finally {
      setExportLoading(false)
    }
  }

  const sanitizeCSV = (value) => {
    if (value == null) return ''
    const str = String(value)
    const escaped = str.replace(/"/g, '""')
    const needsQuoting = /[,"\n\r]/.test(escaped) || /^[=+\-@]/.test(escaped)
    if (needsQuoting) return `"${escaped}"`
    if (/^[=+\-@]/.test(escaped)) return `"'${escaped}"`
    return escaped
  }

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return ''
    const keys = Object.keys(data[0])
    const header = keys.join(',')
    const rows = data.map(item =>
      keys.map(key => sanitizeCSV(item[key])).join(',')
    )
    return [header, ...rows].join('\n')
  }

  if (loading) {
    return <Loading />
  }

  const handleSync = async () => {
    try {
      setSyncLoading(true)
      setSyncMessage(null)
      const result = await applicationApi.syncGoogleSheets()
      setSyncMessage(`Synced ${result.synced_count || 0} applications from Google Sheets.`)
      await fetchDashboardData()
      const status = await applicationApi.getSyncStatus()
      setSyncStatus(status)
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail
      setSyncMessage(detail ? `Sync failed (${status}): ${detail}` : 'Sync failed. Check backend logs and Google credentials.')
      console.error(err)
    } finally {
      setSyncLoading(false)
    }
  }

  const s = summary

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p>Review incoming applications and monitor loan decisions.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onViewApplications}>
          <Icon name="applications" size={16} />
          View All Applications
        </Button>
        <Button variant="primary" size="sm" onClick={handleSync} loading={syncLoading}>
          <Icon name="refresh" size={16} />
          Sync Google Sheets
        </Button>
      </div>

      {syncStatus && (
        <div className="sync-status-bar">
          <span>{syncStatus.application_count || 0} synced applications</span>
          <span>
            Last sync: {syncStatus.last_synced_at ? formatDate(syncStatus.last_synced_at) : 'Not synced yet'}
          </span>
        </div>
      )}

      {syncMessage && (
        <Alert
          type={syncMessage.startsWith('Sync failed') ? 'danger' : 'success'}
          message={syncMessage}
          onClose={() => setSyncMessage(null)}
        />
      )}

      {dashboardError && (
        <ErrorState
          title="Could not load dashboard"
          description={dashboardError}
          onAction={fetchDashboardData}
        />
      )}

      {!dashboardError && <div className="summary-grid">
        <Card className="summary-card">
          <div className="summary-icon total"><Icon name="users" size={22} /></div>
          <div className="summary-content">
            <p className="summary-label">Total Applications</p>
            <p className="summary-value">{s.total_applications}</p>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon pending"><Icon name="clock" size={22} /></div>
          <div className="summary-content">
            <p className="summary-label">Pending</p>
            <p className="summary-value">{s.pending_count}</p>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon approved"><Icon name="check" size={22} /></div>
          <div className="summary-content">
            <p className="summary-label">Approved</p>
            <p className="summary-value">{s.approved_count}</p>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon rejected"><Icon name="x" size={22} /></div>
          <div className="summary-content">
            <p className="summary-label">Rejected</p>
            <p className="summary-value">{s.rejected_count}</p>
          </div>
        </Card>
      </div>}

      {!dashboardError && s.total_applications > 0 && (
        <div className="status-progress-bar">
          <div className="status-progress-track">
            {s.pending_count > 0 && (
              <div
                className="status-progress-segment status-progress-pending"
                style={{ width: `${(s.pending_count / s.total_applications) * 100}%` }}
                title={`${s.pending_count} pending`}
              />
            )}
            {s.approved_count > 0 && (
              <div
                className="status-progress-segment status-progress-approved"
                style={{ width: `${(s.approved_count / s.total_applications) * 100}%` }}
                title={`${s.approved_count} approved`}
              />
            )}
            {s.rejected_count > 0 && (
              <div
                className="status-progress-segment status-progress-rejected"
                style={{ width: `${(s.rejected_count / s.total_applications) * 100}%` }}
                title={`${s.rejected_count} rejected`}
              />
            )}
          </div>
          <div className="status-progress-labels">
            <span><span className="dot dot-pending" /> Pending {s.pending_count}</span>
            <span><span className="dot dot-approved" /> Approved {s.approved_count}</span>
            <span><span className="dot dot-rejected" /> Rejected {s.rejected_count}</span>
          </div>
        </div>
      )}

      {!dashboardError && <div className="summary-total-bar">
        <div className="summary-total-icon">
          <Icon name="dollar" size={18} />
        </div>
        <div className="summary-total-content">
          <span className="summary-total-label">Total Loan Portfolio</span>
          <span className="summary-total-value">{formatCurrency(s.total_loan_amount)}</span>
        </div>
      </div>}

      {!dashboardError && <div className="dashboard-workspace">
        <Card className="review-panel">
          <div className="panel-header">
            <div>
              <h3>Pending Review</h3>
              <p>Applications waiting for an admin decision.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={onViewApplications}>
              <Icon name="list" size={16} />
              Open List
            </Button>
          </div>

          <ApplicationRows
            applications={pendingApplications}
            emptyTitle="No pending applications"
            onSelectApp={onSelectApp}
          />
        </Card>

        <Card className="review-panel">
          <div className="panel-header">
            <div>
              <h3>Recent Applications</h3>
              <p>Latest submissions across all statuses.</p>
            </div>
          </div>

          <ApplicationRows
            applications={recentApplications}
            emptyTitle="No recent applications"
            onSelectApp={onSelectApp}
          />
        </Card>
      </div>}

      {!dashboardError && <Card className="export-section">
        <div className="export-section-inner">
          <div className="export-section-text">
            <h3>Export Data</h3>
            <p>Download application data for reporting and analysis.</p>
          </div>
          {exportError && (
            <Alert type="danger" message={exportError} onClose={() => setExportError(null)} />
          )}
          <div className="export-actions">
            <Button
              variant="primary"
              size="md"
              loading={exportLoading}
              onClick={() => handleExport(null)}
            >
              <Icon name="download" size={16} />
              Export All
            </Button>
            <div className="export-dropdown">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowExportOptions(o => !o)}
                onBlur={() => setTimeout(() => setShowExportOptions(false), 150)}
              >
                <Icon name="list" size={16} />
                Filtered Export
                <Icon name="arrowLeft" size={14} style={{ transform: 'rotate(-90deg)' }} />
              </Button>
              {showExportOptions && (
                <div className="export-dropdown-menu">
                  <button type="button" onClick={() => { handleExport('pending'); setShowExportOptions(false) }}>
                    <span className="export-status-dot pending" /> Pending
                  </button>
                  <button type="button" onClick={() => { handleExport('approved'); setShowExportOptions(false) }}>
                    <span className="export-status-dot approved" /> Approved
                  </button>
                  <button type="button" onClick={() => { handleExport('rejected'); setShowExportOptions(false) }}>
                    <span className="export-status-dot rejected" /> Rejected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>}
    </div>
  )
}

const ApplicationRows = ({ applications, emptyTitle, onSelectApp }) => {
  if (!applications.length) {
    return (
      <div className="dashboard-empty">
        <p>{emptyTitle}</p>
      </div>
    )
  }

  return (
    <div className="dashboard-rows">
      {applications.map((app) => (
        <div className="dashboard-row" key={app.id}>
          <div className="dashboard-row-main">
            <div className="dashboard-row-title">
              <strong>{app.full_name}</strong>
              <Badge status={app.status} />
            </div>
            <div className="dashboard-row-meta">
              <span>{formatCurrency(app.amount)}</span>
              <span>{formatDate(app.submitted_at)}</span>
              <span>{app.email}</span>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => onSelectApp(app.id)}>
            <Icon name="review" size={16} />
            Review
          </Button>
        </div>
      ))}
    </div>
  )
}
