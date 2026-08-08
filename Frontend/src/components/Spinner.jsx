import styles from './Spinner.module.css'

export default function Spinner({ size = 32, fullPage = false }) {
  const spinner = (
    <div
      className={styles.spinner}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )

  if (fullPage) {
    return <div className={styles.fullPage}>{spinner}</div>
  }
  return spinner
}
