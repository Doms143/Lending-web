import { useState } from 'react'
import { applicationApi } from '../../utils/apiService'
import { Button, Card, Modal, Alert } from '../../components/Common'
import { Icon } from '../../components/Icon'
import './admin.css'

export const AdminActions = ({ application, onUpdate }) => {
  const [status, setStatus] = useState(application.status)
  const [notes, setNotes] = useState(application.admin_notes || '')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleApprove = async () => {
    try {
      setLoading(true)
      await applicationApi.approveApplication(application.id)
      setStatus('approved')
      setMessage({ type: 'success', text: 'Application approved successfully!' })
      setTimeout(() => onUpdate(), 1500)
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to approve application' })
      console.error(error)
    } finally {
      setLoading(false)
    }
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
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        {/* Approval Buttons */}
        {status === 'pending' && (
          <div className="action-buttons">
            <Button
              variant="success"
              size="md"
              loading={loading}
              onClick={handleApprove}
              className="btn-approve"
            >
              <Icon name="check" size={16} />
              Approve Application
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="btn-reject"
            >
              <Icon name="x" size={16} />
              Reject Application
            </Button>
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

      {status === 'pending' && (
        <div className="mobile-review-actions" role="region" aria-label="Review actions">
          <Button
            variant="danger"
            size="md"
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
            className="mobile-review-btn"
          >
            <Icon name="x" size={16} />
            Reject
          </Button>
          <Button
            variant="success"
            size="md"
            loading={loading}
            onClick={handleApprove}
            className="mobile-review-btn"
          >
            <Icon name="check" size={16} />
            Approve
          </Button>
        </div>
      )}

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
