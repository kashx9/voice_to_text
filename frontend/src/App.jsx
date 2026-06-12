import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'

export default function App() {
  const { user, loading } = useAuth()
  const [showSignup, setShowSignup] = useState(false)

  if (loading) {
    return <div className="loading">Loading…</div>
  }

  if (user) {
    return <Dashboard />
  }

  return showSignup
    ? <Signup onLoginClick={() => setShowSignup(false)} />
    : <Login onSignupClick={() => setShowSignup(true)} />
}
