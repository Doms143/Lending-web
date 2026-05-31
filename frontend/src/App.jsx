import { useState, useEffect } from 'react'
import { ApplicationsList } from './features/applications/ApplicationsList'
import { ApplicationDetail } from './features/applications/ApplicationDetail'
import { Dashboard } from './features/admin/Dashboard'
import { Login } from './features/auth/Login'
import { Icon } from './components/Icon'
import { Modal } from './components/Common'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    setCurrentView('dashboard')
  }

  const handleLogoutClick = () => setShowLogoutConfirm(true)

  const confirmLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
    setIsAuthenticated(false)
    setCurrentView('dashboard')
    setSelectedAppId(null)
    setShowLogoutConfirm(false)
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLogin} />
  }

  return (
    <div className="app">
      <Navbar 
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogoutClick}
      />
      <MobileBottomNav
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view)
          if (view === 'dashboard') setSelectedAppId(null)
        }}
        onLogout={handleLogoutClick}
      />
      
      <main className="app-main">
        <div className="container">
          {currentView === 'dashboard' && (
            <Dashboard
              onSelectApp={(appId) => {
                setSelectedAppId(appId)
                setCurrentView('applications')
              }}
              onViewApplications={() => {
                setSelectedAppId(null)
                setCurrentView('applications')
              }}
            />
          )}
          
          {currentView === 'applications' && selectedAppId ? (
            <ApplicationDetail 
              appId={selectedAppId}
              onBack={() => {
                setSelectedAppId(null)
                setCurrentView('applications')
              }}
            />
          ) : (
            currentView === 'applications' && (
              <ApplicationsList 
                onSelectApp={(appId) => {
                  setSelectedAppId(appId)
                }}
              />
            )
          )}
        </div>
      </main>

      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Logout"
        size="sm"
      >
        <p>Are you sure you want to log out?</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={confirmLogout}>
            Logout
          </button>
        </div>
      </Modal>
    </div>
  )
}

const Navbar = ({ currentView, onNavigate, onLogout }) => {
  const userEmail = localStorage.getItem('userEmail') || 'Admin'
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNav = (view) => {
    onNavigate(view)
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="navbar-brand-mark">L</div>
          <h1><span>Loan</span> Dashboard</h1>
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
            <span />
            <span />
            <span />
          </span>
        </button>

        <div className={`navbar-menu-wrapper ${menuOpen ? 'open' : ''}`}>
          <ul className="navbar-menu">
            <li>
              <button
                className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
                aria-current={currentView === 'dashboard' ? 'page' : undefined}
                onClick={() => handleNav('dashboard')}
              >
                <Icon name="dashboard" size={16} />
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${currentView === 'applications' ? 'active' : ''}`}
                aria-current={currentView === 'applications' ? 'page' : undefined}
                onClick={() => handleNav('applications')}
              >
                <Icon name="applications" size={16} />
                Applications
              </button>
            </li>
          </ul>

          <div className="navbar-user">
            <span className="user-email">{userEmail}</span>
            <button className="logout-btn" onClick={onLogout}>
              <Icon name="logout" size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

const MobileBottomNav = ({ currentView, onNavigate, onLogout }) => {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation">
      <button
        className={`mobile-bottom-tab ${currentView === 'dashboard' ? 'active' : ''}`}
        aria-current={currentView === 'dashboard' ? 'page' : undefined}
        onClick={() => onNavigate('dashboard')}
        type="button"
      >
        <Icon name="dashboard" size={20} />
        <span>Dashboard</span>
      </button>
      <button
        className={`mobile-bottom-tab ${currentView === 'applications' ? 'active' : ''}`}
        aria-current={currentView === 'applications' ? 'page' : undefined}
        onClick={() => onNavigate('applications')}
        type="button"
      >
        <Icon name="applications" size={20} />
        <span>Applications</span>
      </button>
      <button
        className="mobile-bottom-tab mobile-bottom-logout"
        onClick={onLogout}
        type="button"
      >
        <Icon name="logout" size={20} />
        <span>Logout</span>
      </button>
    </nav>
  )
}

export default App
