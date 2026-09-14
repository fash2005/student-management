import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    onLogin(data.session)
  }

  return (
    <div className="login-page">
      <div className="login-shape login-shape-1"></div>
      <div className="login-shape login-shape-2"></div>
      <div className="login-shape login-shape-3"></div>

      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 48 48" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 6L4 16l20 10 16-8v10h2V16L24 6z" fill="white" />
              <path d="M12 22.5V30c0 3.3 5.4 6 12 6s12-2.7 12-6v-7.5l-12 6-12-6z" fill="white" opacity="0.85" />
            </svg>
          </div>
          <h2>Student Manager</h2>
          <p>Admin Login</p>
        </div>

        {error && <div className="login-error">{error}</div>}

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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default Login