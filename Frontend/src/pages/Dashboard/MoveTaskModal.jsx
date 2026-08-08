import { useState } from 'react'
import { format } from 'date-fns'
import { moveTask } from '../../api/tasks'
import { useToast } from '../../components/Toast'
import styles from './TaskForm.module.css'

export default function MoveTaskModal({ taskIds, onSuccess }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!dueDate) {
      toast('Please pick a date.', 'warning')
      return
    }
    setLoading(true)
    try {
      await moveTask(taskIds, dueDate)
      toast(`${taskIds.length} task(s) moved to ${dueDate}.`, 'success')
      onSuccess()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to move tasks.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
        Moving <strong style={{ color: 'var(--text-primary)' }}>{taskIds.length}</strong> task(s) to a new due date.
      </p>

      <div className={styles.field}>
        <label className={styles.label}>New Due Date</label>
        <input
          className={styles.input}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Moving…' : 'Move Tasks'}
        </button>
      </div>
    </form>
  )
}
