import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, Calendar, BarChart2,
  LogOut, ChevronDown, Sun, Moon, Menu, X,
} from 'lucide-react'
import styles from './Navbar.module.css'

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/calendar',   label: 'Calendar',   Icon: Calendar },
  { to: '/statistics', label: 'Statistics', Icon: BarChart2 },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const profileRef = useRef(null)

  const handleLogout = () => { logout(); navigate('/login') }

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  const handleMobileNav = () => setMobileOpen(false)

  return (
    <header>
      <nav className={styles.navbar}>
        <div className={styles.inner}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.brandIcon}>✓</div>
            <span className={styles.brandName}>TaskFlow</span>
          </div>

          {/* Desktop links */}
          <div className={styles.links}>
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.linkActive : ''}`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right cluster */}
          <div className={styles.right}>
            {/* Theme toggle */}
            <button
              className={styles.themeBtn}
              onClick={toggle}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {/* Profile */}
            <div className={styles.profileArea} ref={profileRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setProfileOpen((p) => !p)}
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                {user?.picture
                  ? <img src={user.picture} alt={user.name} className={styles.avatar} referrerPolicy="no-referrer" />
                  : <div className={styles.avatarFallback}>{user?.name?.charAt(0).toUpperCase() ?? 'U'}</div>
                }
                <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={13} className={profileOpen ? styles.chevronOpen : styles.chevron} />
              </button>

              {profileOpen && (
                <div className={styles.dropdown} role="menu">
                  <div className={styles.dropdownHeader}>
                    {user?.picture
                      ? <img src={user.picture} alt={user.name} className={styles.dropdownAvatar} referrerPolicy="no-referrer" />
                      : <div className={styles.dropdownAvatarFallback}>{user?.name?.charAt(0).toUpperCase() ?? 'U'}</div>
                    }
                    <div>
                      <p className={styles.dropdownName}>{user?.name}</p>
                      <p className={styles.dropdownEmail}>{user?.email}</p>
                    </div>
                  </div>
                  <hr className={styles.divider} />
                  <button className={styles.logoutBtn} onClick={handleLogout} role="menuitem">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen((p) => !p)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}>
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleMobileNav}
            className={({ isActive }) =>
              `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <button
          className={styles.logoutBtn}
          onClick={() => { handleLogout(); setMobileOpen(false) }}
          style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </header>
  )
}
