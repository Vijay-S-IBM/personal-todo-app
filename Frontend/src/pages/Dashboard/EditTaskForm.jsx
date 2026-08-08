import { useState } from 'react'
import { updateTask } from '../../api/tasks'
import { useToast } from '../../components/Toast'
import styles from './TaskForm.module.css'

export default function EditTaskForm({ task, onSuccess }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    task_name: task.task_name || '',
    task_description: task.task_description || '',
    task_comments: task.task_comments || '',
    due_date: task.task_date || '',
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.task_name.trim()) {
      toast('Task name is required.', 'warning')
      return
    }
    setLoading(true)
    try {
      await updateTask(task.task_id, {
        task_name: form.task_name.trim(),
        task_description: form.task_description.trim() || null,
        task_comments: form.task_comments.trim() || null,
        due_date: form.due_date || null,
      })
      toast('Task updated!', 'success')
      onSuccess()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update task.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          Task Name <span className={styles.required}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          value={form.task_name}
          onChange={set('task_name')}
          maxLength={200}
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          placeholder="Add more context…"
          value={form.task_description}
          onChange={set('task_description')}
          rows={3}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Comments</label>
        <textarea
          className={styles.textarea}
          placeholder="Any notes or comments…"
          value={form.task_comments}
          onChange={set('task_comments')}
          rows={2}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Due Date</label>
        <input
          className={styles.input}
          type="date"
          value={form.due_date}
          onChange={set('due_date')}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
