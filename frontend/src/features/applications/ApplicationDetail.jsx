import { useState, useEffect } from 'react'
import { formatCurrency } from '../../utils/helpers'
import { applicationApi } from '../../utils/apiService'
import { Button, Card, ErrorState, Loading } from '../../components/Common'
import { Icon } from '../../components/Icon'
import { AuthImage } from '../../components/AuthImage'
import { AdminActions } from '../admin/AdminActions'
import { ImageGallery } from './ImageGallery'
import { getStatusLabel } from '../../utils/statuses'
import './applications.css'

const emptyApp = {
  id: '', full_name: '-', email: '-', date_of_birth: '-', age: '-',
  phone_number: '-', source_of_income: '-',
  address: { street: '-', barangay: '-', city_municipality: '-', province: '-', postal_code: '-' },
  amount: 0, duration: '-', interest: 0, reason_for_borrowing: '-',
  facebook_link: null, instagram_link: null,
  contact_person_1: null, contact_person_2: null,
  images: [], status: 'pending', submitted_at: null,
  borrow_count: 1,
  admin_notes: '',
}

export const ApplicationDetail = ({ appId, onBack }) => {
  const [application, setApplication] = useState(emptyApp)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showGallery, setShowGallery] = useState(false)
  const [openSections, setOpenSections] = useState({
    loan: true,
    personal: false,
    address: false,
    social: false,
    contact1: false,
    contact2: false,
    images: true,
  })

  useEffect(() => {
    fetchApplicationDetail()
  }, [appId])

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await applicationApi.getApplication(appId)
      setApplication(data)
    } catch (err) {
      setError('Unable to load this application. It may have been removed or the backend may be unavailable.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="application-detail">
        <div className="detail-header">
          <Button variant="secondary" size="sm" onClick={onBack}>
            <Icon name="arrowLeft" size={16} />
            Back
          </Button>
          <h2>Application unavailable</h2>
        </div>
        <ErrorState
          title="Could not load application"
          description={error}
          onAction={fetchApplicationDetail}
        />
      </div>
    )
  }

  const a = application

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try { return new Date(dateStr).toLocaleString() } catch { return dateStr }
  }

  const toggleSection = (section) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }))
  }

  return (
    <div className="application-detail">
      <div className="detail-header">
        <Button variant="secondary" size="sm" onClick={onBack}>
          <Icon name="arrowLeft" size={16} />
          Back
        </Button>
        <div className="detail-title">
          <h2>{a.full_name}</h2>
          <div className="detail-meta">
            <span>Submitted: {formatDate(a.submitted_at)}</span>
            {a.status_updated_at && (
              <span>Last updated: {formatDate(a.status_updated_at)}</span>
            )}
          </div>
        </div>
        <span className={`status-badge status-${a.status}`}>
          {getStatusLabel(a.status)}
        </span>
      </div>

      <div className="review-summary">
        <div className="review-summary-item">
          <label>Amount</label>
          <strong>{formatCurrency(a.amount)}</strong>
        </div>
        <div className="review-summary-item">
          <label>Duration</label>
          <strong>{a.duration}</strong>
        </div>
        <div className="review-summary-item">
          <label>Income</label>
          <strong>{a.source_of_income}</strong>
        </div>
        <div className="review-summary-item">
          <label>Phone</label>
          <strong>{a.phone_number}</strong>
        </div>
        <div className="review-summary-item">
          <label>Borrow Count</label>
          <strong>#{a.borrow_count || 1}</strong>
        </div>
        <div className="review-summary-item">
          <label>Images</label>
          <strong>{a.images?.length || 0}</strong>
        </div>
      </div>

      <div className="review-layout">
        <div className="detail-content">
          <DetailSection
            id="loan"
            title="Loan Details"
            isOpen={openSections.loan}
            onToggle={toggleSection}
          >
            <div className="info-grid">
              <div className="info-item">
                <label>Amount Requested</label>
                <p className="amount-highlight">{formatCurrency(a.amount)}</p>
              </div>
              <div className="info-item">
                <label>Duration</label>
                <p>{a.duration}</p>
              </div>
              <div className="info-item">
                <label>Interest Rate</label>
                <p>{a.interest}%</p>
              </div>
              <div className="info-item full-width">
                <label>Reason for Borrowing</label>
                <p>{a.reason_for_borrowing}</p>
              </div>
            </div>
          </DetailSection>

          <DetailSection
            id="personal"
            title="Personal Information"
            isOpen={openSections.personal}
            onToggle={toggleSection}
          >
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <p>{a.full_name}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{a.email}</p>
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                <p>{a.date_of_birth}</p>
              </div>
              <div className="info-item">
                <label>Age</label>
                <p>{a.age}</p>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <p>{a.phone_number}</p>
              </div>
              <div className="info-item">
                <label>Source of Income</label>
                <p>{a.source_of_income}</p>
              </div>
            </div>
          </DetailSection>

          <DetailSection
            id="address"
            title="Address"
            isOpen={openSections.address}
            onToggle={toggleSection}
          >
            <div className="info-grid">
              <div className="info-item">
                <label>Street</label>
                <p>{a.address.street}</p>
              </div>
              <div className="info-item">
                <label>Barangay</label>
                <p>{a.address.barangay}</p>
              </div>
              <div className="info-item">
                <label>City/Municipality</label>
                <p>{a.address.city_municipality}</p>
              </div>
              <div className="info-item">
                <label>Province</label>
                <p>{a.address.province}</p>
              </div>
              <div className="info-item">
                <label>Postal Code</label>
                <p>{a.address.postal_code}</p>
              </div>
            </div>
          </DetailSection>

          <DetailSection
            id="social"
            title="Social Media"
            isOpen={openSections.social}
            onToggle={toggleSection}
          >
            <div className="info-grid">
              <div className="info-item">
                <label>Facebook</label>
                <p>{a.facebook_link || '-'}</p>
              </div>
              <div className="info-item">
                <label>Instagram</label>
                <p>{a.instagram_link || '-'}</p>
              </div>
            </div>
          </DetailSection>

          {a.contact_person_1 && (
            <DetailSection
              id="contact1"
              title="Contact Person 1"
              isOpen={openSections.contact1}
              onToggle={toggleSection}
            >
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{a.contact_person_1.full_name}</p>
                </div>
                <div className="info-item">
                  <label>Facebook</label>
                  <p>{a.contact_person_1.facebook_link || '-'}</p>
                </div>
                <div className="info-item">
                  <label>Mobile Number</label>
                  <p>{a.contact_person_1.mobile_number}</p>
                </div>
                <div className="info-item">
                  <label>Relationship</label>
                  <p>{a.contact_person_1.relationship}</p>
                </div>
              </div>
            </DetailSection>
          )}

          {a.contact_person_2 && (
            <DetailSection
              id="contact2"
              title="Contact Person 2"
              isOpen={openSections.contact2}
              onToggle={toggleSection}
            >
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{a.contact_person_2.full_name}</p>
                </div>
                <div className="info-item">
                  <label>Facebook</label>
                  <p>{a.contact_person_2.facebook_link || '-'}</p>
                </div>
                <div className="info-item">
                  <label>Mobile Number</label>
                  <p>{a.contact_person_2.mobile_number}</p>
                </div>
                <div className="info-item">
                  <label>Relationship</label>
                  <p>{a.contact_person_2.relationship}</p>
                </div>
              </div>
            </DetailSection>
          )}

          {a.images && a.images.length > 0 && (
            <DetailSection
              id="images"
              title="Images"
              isOpen={openSections.images}
              onToggle={toggleSection}
            >
              <div className="images-grid">
                {a.images.map((img, idx) => (
                  <button
                    key={idx}
                    className="image-thumbnail"
                    onClick={() => setShowGallery(idx)}
                    type="button"
                    aria-label={`Open ${img.image_type.replace(/_/g, ' ')} image`}
                  >
                    <AuthImage src={img.image_url} alt={`${img.image_type.replace(/_/g, ' ')} for ${a.full_name}`} />
                    <span className="image-label">{img.image_type.replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            </DetailSection>
          )}
        </div>

        <aside className="review-sidebar">
          <AdminActions application={a} onUpdate={fetchApplicationDetail} />
        </aside>
      </div>

      {showGallery !== false && (
        <ImageGallery
          images={a.images}
          applicantName={a.full_name}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  )
}

const DetailSection = ({ id, title, isOpen, onToggle, children }) => {
  const contentId = `detail-section-${id}`

  return (
    <Card className={`detail-section ${isOpen ? 'open' : 'collapsed'}`}>
      <button
        className="detail-section-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => onToggle(id)}
      >
        <span>{title}</span>
        <Icon name="arrowLeft" size={16} className="detail-section-chevron" />
      </button>
      <h3 className="detail-section-title">{title}</h3>
      <div className="detail-section-body" id={contentId}>
        {children}
      </div>
    </Card>
  )
}
