import { useEffect, useState } from 'react'
import { applicationApi } from '../../utils/apiService'
import { Button, Card, Modal, Alert } from '../../components/Common'
import { Icon } from '../../components/Icon'
import { getStatusLabel } from '../../utils/statuses'
import './admin.css'

const NEXT_PHASES = {
  pending: [{ status: 'under_review', label: 'Start Review', variant: 'primary' }],
  under_review: [
    { status: 'approved', label: 'Approve', variant: 'success', confirm: 'approve' },
    { status: 'rejected', label: 'Reject', variant: 'danger', confirm: 'reject' },
  ],
  approved: [
    { status: 'released', label: 'Release Funds', variant: 'success' },
    { status: 'cancelled', label: 'Cancel', variant: 'danger' },
  ],
  released: [
    { status: 'partially_paid', label: 'Set Partially Paid', variant: 'primary' },
    { status: 'paid', label: 'Set Fully Paid', variant: 'success' },
    { status: 'cancelled', label: 'Cancel', variant: 'danger' },
  ],
  partially_paid: [
    { status: 'paid', label: 'Set Fully Paid', variant: 'success' },
  ],
  overdue: [
    { status: 'paid', label: 'Set Fully Paid', variant: 'success' },
    { status: 'defaulted', label: 'Mark Defaulted', variant: 'danger' },
  ],
  defaulted: [
    { status: 'paid', label: 'Set Fully Paid', variant: 'success' },
  ],
  paid: [
    { status: 'approved', label: 'Borrow Again', variant: 'primary', borrowAgain: true },
  ],
}

export const AdminActions = ({ application, onUpdate }) => {
  const [status, setStatus] = useState(application.status)
  const [notes, setNotes] = useState(application.admin_notes || '')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [confirmPhase, setConfirmPhase] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setStatus(application.status)
    setNotes(application.admin_notes || '')
  }, [application.status, application.admin_notes])

  const handleStatusUpdate = async (nextStatus, successText = null) => {
    try {
      setLoading(true)
      await applicationApi.updateStatus(application.id, nextStatus)
      setStatus(nextStatus)
      setMessage({
        type: 'success',
        text: successText || `Moved to ${getStatusLabel(nextStatus)}.`
      })
      setTimeout(() => onUpdate(), 1000)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to update status' })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    await handleStatusUpdate('approved', 'Application approved successfully!')
  }

  const requestPhaseConfirmation = (phase) => {
    if (phase.confirm === 'approve') {
      setShowApproveModal(true)
      return
    }
    if (phase.confirm === 'reject') {
      setShowRejectModal(true)
      return
    }
    setConfirmPhase(phase)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setMessage({ type: 'danger', text: 'Please provide a rejection reason' })
      return
    }

    try {
      setLoading(true)
      await applicationApi.rejectApplication(application.id, rejectionReason)
      setStatus('rejected')
      setShowRejectModal(false)
      setMessage({ type: 'success', text: 'Application rejected successfully!' })
      setTimeout(() => onUpdate(), 1500)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to reject application' })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    try {
      setLoading(true)
      await applicationApi.updateNotes(application.id, notes)
      setMessage({ type: 'success', text: 'Notes saved successfully!' })
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to save notes' })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const nextPhases = NEXT_PHASES[status] || []

  return (
    <>
      <Card className="admin-actions">
        <h3>Admin Actions</h3>
      
        {message && (
          <Alert 
            type={message.type} 
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}

        {/* Status */}
        <div className="action-section">
          <div className="status-display">
            <span className="status-label">Current Status:</span>
            <span className={`status-badge status-${status}`}>
              {getStatusLabel(status)}
            </span>
            <span className="borrow-count">Borrow #{application.borrow_count || 1}</span>
          </div>
        </div>

        {nextPhases.length > 0 ? (
          <div className="status-update-section">
            <span className="status-update-label">Next Phase</span>
            <div className="status-update-row">
              {nextPhases.map((phase) => (
                <Button
                  key={phase.status}
                  variant={phase.variant}
                  size="md"
                  onClick={() => requestPhaseConfirmation(phase)}
                  disabled={loading}
                >
                  {phase.variant === 'danger' ? <Icon name="x" size={16} /> : <Icon name="check" size={16} />}
                  {phase.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="status-message">
            No next phase available for {getStatusLabel(status)}.
          </div>
        )}

        {status === 'approved' && (
          <div className="status-message success-message">
            <Icon name="check" size={16} />
            This application has been approved
          </div>
        )}

        {status === 'rejected' && (
          <div className="status-message danger-message">
            <Icon name="x" size={16} />
            This application has been rejected
          </div>
        )}

        {!['pending', 'approved', 'rejected'].includes(status) && (
          <div className={`status-message status-${status}`}>
            Current loan status: {getStatusLabel(status)}
          </div>
        )}

        {/* Admin Notes */}
        <div className="notes-section">
          <label htmlFor="admin-notes">Admin Notes</label>
          <textarea
            id="admin-notes"
            className="notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes or comments about this application..."
            rows={5}
          />
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            onClick={handleSaveNotes}
            className="btn-save-notes"
          >
            <Icon name="save" size={16} />
            Save Notes
          </Button>
        </div>
      </Card>

      {nextPhases.length > 0 && (
        <div className="mobile-review-actions" role="region" aria-label="Review actions">
          {nextPhases.map((phase) => (
            <Button
              key={phase.status}
              variant={phase.variant}
              size="md"
              onClick={() => requestPhaseConfirmation(phase)}
              disabled={loading}
              className="mobile-review-btn"
            >
              {phase.label}
            </Button>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Application"
        size="sm"
      >
        <p>Are you sure you want to approve this application?</p>
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() => setShowApproveModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            loading={loading}
            onClick={() => {
              setShowApproveModal(false)
              handleApprove()
            }}
          >
            <Icon name="check" size={16} />
            Confirm Approval
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(confirmPhase)}
        onClose={() => setConfirmPhase(null)}
        title={confirmPhase?.borrowAgain ? 'Borrow Again' : 'Confirm Status Change'}
        size="sm"
      >
        <p>
          {confirmPhase?.borrowAgain
            ? `Move this paid customer back to Approved and increase the borrow count to ${(application.borrow_count || 1) + 1}?`
            : `Move this application from ${getStatusLabel(status)} to ${getStatusLabel(confirmPhase?.status)}?`}
        </p>
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() => setConfirmPhase(null)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmPhase?.variant || 'primary'}
            loading={loading}
            onClick={() => {
              const phase = confirmPhase
              setConfirmPhase(null)
              handleStatusUpdate(
                phase.status,
                phase.borrowAgain
                  ? `Borrow count updated to ${(application.borrow_count || 1) + 1}. Customer moved to Approved.`
                  : null
              )
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal 
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Application"
        size="md"
      >
        <div className="reject-modal-content">
          <p>Please provide a reason for rejecting this application:</p>
          <textarea
            id="rejection-reason"
            className="rejection-reason-input"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            aria-label="Rejection reason"
            rows={4}
          />
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => setShowRejectModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={loading}
              onClick={handleReject}
            >
              <Icon name="x" size={16} />
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
