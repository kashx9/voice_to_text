import { createContext, useContext, useEffect, useState } from 'react'
import nhost from '../nhostClient'

const AuthContext = createContext(null)
const RT_KEY = 'nhost_rt' // refresh token stored in localStorage for session persistence

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rt = localStorage.getItem(RT_KEY)
    if (!rt) {
      setLoading(false)
      return
    }
    // Restore session using the stored refresh token
    nhost.auth
      .refreshToken({ refreshToken: rt })
      .then((res) => {
        const session = res?.body?.session ?? res?.session
        if (session?.user) {
          setUser(session.user)
          const newRt = session.refreshToken ?? session.refresh_token
          if (newRt) localStorage.setItem(RT_KEY, newRt)
        } else {
          localStorage.removeItem(RT_KEY)
        }
      })
      .catch(() => localStorage.removeItem(RT_KEY))
      .finally(() => setLoading(false))
  }, [])

  function extractSession(res) {
    // SDK v4 wraps responses in { body, error } — handle both shapes
    return res?.body?.session ?? res?.session ?? null
  }

  async function signIn(email, password) {
    const res = await nhost.auth.signInEmailPassword({ email, password })
    const session = extractSession(res)
    if (session?.user) {
      setUser(session.user)
      const rt = session.refreshToken ?? session.refresh_token
      if (rt) localStorage.setItem(RT_KEY, rt)
    }
    return res
  }

  async function signUp(email, password) {
    const res = await nhost.auth.signUpEmailPassword({ email, password })
    const session = extractSession(res)
    if (session?.user) {
      setUser(session.user)
      const rt = session.refreshToken ?? session.refresh_token
      if (rt) localStorage.setItem(RT_KEY, rt)
    }
    return res
  }

  async function signOut() {
    const rt = localStorage.getItem(RT_KEY)
    await nhost.auth.signOut({ refreshToken: rt }).catch(() => {})
    localStorage.removeItem(RT_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}