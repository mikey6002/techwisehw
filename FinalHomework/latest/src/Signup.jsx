import { useState } from 'react'
import './Signup.css'

function Signup({ onSignupSuccess }) {
  const [formData, setFormData] = useState({
    playerId: '',
    username: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const API_BASE = 'http://localhost:3001/api'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear messages when user starts typing
    if (error) setError('')
    if (message) setMessage('')
  }

  const validateForm = () => {
    if (!formData.playerId.trim()) {
      setError('Player ID is required')
      return false
    }
    if (formData.playerId.length < 3) {
      setError('Player ID must be at least 3 characters')
      return false
    }
    if (!formData.username.trim()) {
      setError('Username is required')
      return false
    }
    if (formData.username.length < 2) {
      setError('Username must be at least 2 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: formData.playerId.trim(),
          username: formData.username.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Welcome ${data.user.username}! Starting with $${data.user.money}`)
        
        setTimeout(() => {
          onSignupSuccess(data.user)
        }, 1500)
      } else {
        setError(data.message || 'Failed to create account')
      }
    } catch (error) {
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Join Blackjack Game</h1>
        <p className="signup-subtitle">Create your account to start playing! Or enter your credentials to Login</p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="playerId">Player ID</label>
            <input
              type="text"
              id="playerId"
              name="playerId"
              value={formData.playerId}
              onChange={handleChange}
              placeholder="Enter unique player ID"
              disabled={loading}
              autoComplete="username"
            />
            <small>Choose a unique ID to log back in (3+ characters)</small>
          </div>

          <div className="form-group">
            <label htmlFor="username">Display Name</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your display name"
              disabled={loading}
              autoComplete="name"
            />
            <small>This will be shown publicly</small>
          </div>

          {error && (
            <div className="message error">
                {error}
            </div>
          )}

          {message && (
            <div className="message success">
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="signup-button"
          >
            {loading ? 'Creating Account...' : 'Start Playing'}
          </button>
        </form>

        <div className="signup-info">
          <h3>What you get:</h3>
          <ul>
            <li>Starting money: $2,022</li>
            <li>Progress saved automatically</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Signup
