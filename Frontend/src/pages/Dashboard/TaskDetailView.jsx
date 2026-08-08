import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Edit2 } from 'lucide-react'
import { getSpecificTask } from '../../api/tasks'
import StatusBadge from '../../components/StatusBadge'
import Spinner from '../../components/Spinner'
import styles from './TaskDetailView.module.css'

export default function TaskDetailView({ taskId, onEdit }) {
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSpecificTask(taskId)
      .then((res) => setTask(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [taskId])

  if (loading) return <Spinner fullPage />
  if (!task) return <p className={styles.error}>Could not load task details.</p>

  const fmt = (iso) => {
    try { return format(parseISO(iso), 'MMM d, yyyy · h:mm a') }
    catch { return iso }
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{task.task_name}</h3>
        <button className={styles.editBtn} onClick={onEdit} aria-label="Edit task">
          <Edit2 size={14} /> Edit
        </button>
      </div>

      <div className={styles.statusRow}>
        <StatusBadge name={task.status_name} size="lg" />
      </div>

      {task.task_description && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Description</p>
          <p className={styles.sectionText}>{task.task_description}</p>
        </div>
      )}

      {task.task_comments && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Comments</p>
          <p className={styles.sectionText}>{task.task_comments}</p>
        </div>
      )}

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Due Date</span>
          <span className={styles.metaValue}>{task.task_date}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Created</span>
          <span className={styles.metaValue}>{fmt(task.created_at)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Updated</span>
          <span className={styles.metaValue}>{fmt(task.updated_at)}</span>
        </div>
      </div>
    </div>
  )
}
