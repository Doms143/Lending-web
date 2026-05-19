import { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from '../../components/Icon'
import { getAuthImageUrl } from '../../utils/helpers'
import './applications.css'

export const ImageGallery = ({ images, applicantName, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fullscreenIndex, setFullscreenIndex] = useState(null)
  const touchStart = useRef(null)
  const galleryMainRef = useRef(null)

  const currentImage = images[currentIndex]
  const currentLabel = currentImage.image_type.replace(/_/g, ' ')

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const goToImage = (index) => {
    setCurrentIndex(index)
  }

  const handleTouchStart = (e) => {
    if (images.length < 2) return
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = (e) => {
    if (!touchStart.current || images.length < 2) return
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) goToPrevious()
      else goToNext()
    }
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') {
        setFullscreenIndex(null)
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [goToPrevious, goToNext, onClose])

  const fullscreenSwipeStart = useRef(null)

  const handleFSTouchStart = (e) => {
    if (images.length < 2) return
    fullscreenSwipeStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleFSTouchEnd = (e) => {
    if (!fullscreenSwipeStart.current || images.length < 2) return
    const deltaX = e.changedTouches[0].clientX - fullscreenSwipeStart.current.x
    const deltaY = e.changedTouches[0].clientY - fullscreenSwipeStart.current.y
    fullscreenSwipeStart.current = null
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      setFullscreenIndex((prev) => {
        if (deltaX > 0) return prev === 0 ? images.length - 1 : prev - 1
        return prev === images.length - 1 ? 0 : prev + 1
      })
    }
  }

  return (
    <>
      {fullscreenIndex !== null ? (
        <div
          className="gallery-fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label={`Full screen image for ${applicantName}`}
          onClick={() => setFullscreenIndex(null)}
          onTouchStart={handleFSTouchStart}
          onTouchEnd={handleFSTouchEnd}
        >
          <img
            src={getAuthImageUrl(images[fullscreenIndex].image_url)}
            alt={`${images[fullscreenIndex].image_type.replace(/_/g, ' ')} for ${applicantName}`}
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <div className="gallery-fullscreen-counter">
              {fullscreenIndex + 1} / {images.length}
            </div>
          )}
          <button
            className="gallery-close gallery-close-fullscreen"
            onClick={() => setFullscreenIndex(null)}
            aria-label="Close full screen image"
          >
            <Icon name="x" size={24} />
          </button>
        </div>
      ) : (
        <div className="gallery-modal" onClick={onClose}>
          <div
            className="gallery-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-gallery-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gallery-header">
              <h2 id="image-gallery-title">Image Gallery - {applicantName}</h2>
              <button className="gallery-close" onClick={onClose} aria-label="Close image gallery"><Icon name="x" size={20} /></button>
            </div>

            <div
              className="gallery-main"
              ref={galleryMainRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button className="gallery-nav-btn prev" onClick={goToPrevious} aria-label="Previous image">
                <Icon name="arrowLeft" size={20} />
              </button>

              <div className="gallery-viewer">
                <button
                  type="button"
                  className="gallery-main-image-button"
                  onClick={() => setFullscreenIndex(currentIndex)}
                  aria-label={`Open ${currentLabel} full screen`}
                >
                  <img
                  src={getAuthImageUrl(currentImage.image_url)}
                  alt={`${currentLabel} for ${applicantName}`}
                  className="gallery-main-image"
                  />
                </button>
                <div className="gallery-image-info">
                  <span className="image-label">{currentLabel}</span>
                  <span className="image-counter">
                    {currentIndex + 1} / {images.length}
                  </span>
                </div>
              </div>

              <button className="gallery-nav-btn next" onClick={goToNext} aria-label="Next image">
                <Icon name="arrowLeft" size={20} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>

            <div className="gallery-thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail ${idx === currentIndex ? 'active' : ''}`}
                  type="button"
                  onClick={() => goToImage(idx)}
                  aria-label={`Show ${img.image_type.replace(/_/g, ' ')}`}
                  aria-current={idx === currentIndex ? 'true' : undefined}
                >
                  <img src={getAuthImageUrl(img.image_url)} alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
