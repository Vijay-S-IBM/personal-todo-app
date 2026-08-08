import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { googleAuth } from '../../api/auth'
import styles from './LoginPage.module.css'

// ─── Welcome loader overlay ───────────────────────────────────────────────
function WelcomeLoader({ name }) {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderCard}>
        <div className={styles.loaderIcon}>✓</div>
        <h2 className={styles.loaderTitle}>Welcome back, {name}!</h2>
        <p className={styles.loaderSub}>Getting your workspace ready…</p>
        <div className={styles.loaderBar}>
          <div className={styles.loaderBarFill} />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [welcomeUser, setWelcomeUser] = useState(null)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  if (welcomeUser) return <WelcomeLoader name={welcomeUser} />

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>✓</div>
        </div>
        <h1 className={styles.title}>ToDo App</h1>
        <p className={styles.subtitle}>
          Organise your day, track your tasks, and stay on top of everything.
        </p>

        <GoogleSignInButton
          onLogin={login}
          toast={toast}
          onWelcome={setWelcomeUser}
          navigate={navigate}
        />

        <p className={styles.note}>
          Your data is private and tied to your Google account.
        </p>
      </div>
    </div>
  )
}

// Separate component using GoogleLogin for the credential (id_token) approach
import { GoogleLogin } from '@react-oauth/google'

function GoogleSignInButton({ onLogin, toast, onWelcome, navigate }) {
  const handleSuccess = async (credentialResponse) => {
    try {
      const id_token = credentialResponse.credential
      const res = await googleAuth(id_token)
      const { token, user } = res.data
      onLogin(token, user)

      // Show welcome loader, then navigate after a short delay
      const firstName = user.name?.split(' ')[0] || user.name
      onWelcome(firstName)
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Authentication failed. Try again.'
      toast(msg, 'error')
    }
  }

  return (
    <div className={styles.googleBtn}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast('Google sign-in failed. Please try again.', 'error')}
        theme="filled_black"
        size="large"
        text="signin_with"
        shape="rectangular"
        width="280"
      />
    </div>
  )
}
