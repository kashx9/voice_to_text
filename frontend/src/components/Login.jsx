import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function extractError(res) {
  return (
    res?.error?.message ||
    res?.body?.message ||
    (typeof res?.error === 'string' ? res.error : null) ||
    null
  )
}

export default function Login({ onSignupClick }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signIn(email, password)
      const msg = extractError(res)
      if (msg) {
        // Give a friendlier message for the common "not verified" case
        if (msg.toLowerCase().includes('verif')) {
          setError('Email not verified — check your inbox and click the verification link first.')
        } else {
          setError(msg)
        }
      }
      // on success AuthContext sets user → App re-renders to Dashboard
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Login</h1>
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
      <p className="toggle-text">
        No account?{' '}
        <button className="link-btn" onClick={onSignupClick}>
          Sign up
        </button>
      </p>
    </div>
  )
}
