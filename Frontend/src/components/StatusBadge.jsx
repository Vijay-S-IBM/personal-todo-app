import { getStatusConfig } from '../utils/statusColors'
import styles from './StatusBadge.module.css'

export default function StatusBadge({ name, size = 'md' }) {
  const { color, bg, border } = getStatusConfig(name)

  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{ color, backgroundColor: bg, borderColor: border }}
    >
      <span className={styles.dot} style={{ backgroundColor: color }} />
      {name}
    </span>
  )
}
