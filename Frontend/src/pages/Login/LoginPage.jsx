import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { googleAuth } from '../../api/auth'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      // @react-oauth/google with flow:'auth-code' returns a code.
      // For id_token flow we need implicit flow instead.
      // This will be handled via onSuccess with credential below.
    },
  })

  // Use credential (id_token) flow
  const handleCredentialLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // tokenResponse.access_token — we need id_token
        // The @react-oauth/google implicit flow gives access_token, not id_token.
        // We use GoogleLogin component's onSuccess (credential) for id_token.
        toast('Signing you in…', 'success')
      } catch (err) {
        toast('Sign-in failed. Please try again.', 'error')
      }
    },
    onError: () => toast('Google sign-in was cancelled.', 'warning'),
  })

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

        <GoogleSignInButton onLogin={login} toast={toast} />

        <p className={styles.note}>
          Your data is private and tied to your Google account.
        </p>
      </div>
    </div>
  )
}

// Separate component using GoogleLogin for the credential (id_token) approach
import { GoogleLogin } from '@react-oauth/google'

function GoogleSignInButton({ onLogin, toast }) {
  const navigate = useNavigate()

  const handleSuccess = async (credentialResponse) => {
    try {
      const id_token = credentialResponse.credential
      const res = await googleAuth(id_token)
      const { token, user } = res.data
      onLogin(token, user)
      toast(`Welcome, ${user.name}!`, 'success')
      navigate('/dashboard')
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
