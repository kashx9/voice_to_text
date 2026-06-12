import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function extractError(res) {
  // SDK v4 returns { body, error } — error has { message, status }
  // Nhost also sometimes puts the message inside body directly
  return (
    res?.error?.message ||
    res?.body?.message ||
    (typeof res?.error === 'string' ? res.error : null) ||
    null
  )
}

export default function Signup({ onLoginClick }) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signUp(email, password)
      const msg = extractError(res)
      if (msg) {
        setError(msg)
        return
      }
      // session is null when email verification is required
      const session = res?.body?.session ?? res?.session
      if (!session) {
        setNeedsVerification(true)
      }
      // if session exists, AuthContext already set the user → App re-renders to Dashboard
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (needsVerification) {
    return (
      <div className="auth-card">
        <h2>Check your email</h2>
        <p>
          We sent a verification link to <strong>{email}</strong>.
          Click it, then come back to log in.
        </p>
        <button className="link-btn" onClick={onLoginClick} style={{ marginTop: '1rem' }}>
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="auth-card">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 9 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={9}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
      <p className="toggle-text">
        Have an account?{' '}
        <button className="link-btn" onClick={onLoginClick}>
          Login
        </button>
      </p>
    </div>
  )
}
