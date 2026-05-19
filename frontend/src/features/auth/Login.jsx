import { useState } from 'react'
import { Card, Button, Alert } from '../../components/Common'
import { Icon } from '../../components/Icon'
import { authApi } from '../../utils/apiService'
import { API_BASE_URL } from '../../utils/api'
import './auth.css'

export const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await authApi.login(email, password)
      localStorage.setItem('authToken', res.access_token)
      localStorage.setItem('userEmail', email)
      onLoginSuccess()
    } catch (err) {
      if (!err.response) {
        setError(`Cannot reach backend API at ${API_BASE_URL}. Check Vercel VITE_API_URL and Railway CORS.`)
        return
      }

      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-shell">
        <section className="login-intro" aria-label="Loan dashboard overview">
          <div className="login-brand">
            <div className="login-brand-mark">
              <Icon name="applications" size={24} />
            </div>
            <div>
              <p className="login-kicker">Loan Operations</p>
              <h1>Application Management</h1>
            </div>
          </div>

          <div className="login-intro-copy">
            <h2>Review applications, update decisions, and export reporting data.</h2>
            <p>Use your admin credentials to access borrower submissions and approval workflows.</p>
          </div>

          <div className="login-points">
            <span><Icon name="clock" size={16} /> Pending reviews</span>
            <span><Icon name="check" size={16} /> Decision tracking</span>
            <span><Icon name="download" size={16} /> CSV exports</span>
          </div>
        </section>

        <Card className="login-card">
          <div className="login-header">
            <h2>Admin Sign In</h2>
            <p>Enter your credentials to continue.</p>
          </div>

          {error && <Alert type="danger" message={error} onClose={() => setError(null)} />}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={loading}
                autoComplete="email"
                required
                aria-invalid={error ? 'true' : undefined}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                disabled={loading}
                autoComplete="current-password"
                required
                aria-invalid={error ? 'true' : undefined}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={loading}
              className="login-button"
            >
              Sign In
            </Button>
          </form>

          <div className="login-footer">
            <p>Secure admin access only</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
