import { useState } from 'react'
import { format } from 'date-fns'
import { addTask } from '../../api/tasks'
import { useToast } from '../../components/Toast'
import styles from './TaskForm.module.css'

export default function AddTaskForm({ defaultDate, onSuccess }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    task_name: '',
    task_description: '',
    task_comments: '',
    due_date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
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
      await addTask({
        task_name: form.task_name.trim(),
        task_description: form.task_description.trim() || null,
        task_comments: form.task_comments.trim() || null,
        due_date: form.due_date,
      })
      toast(`"${form.task_name}" added!`, 'success')
      onSuccess()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to add task.', 'error')
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
          placeholder="What needs to be done?"
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
          {loading ? 'Adding…' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}
