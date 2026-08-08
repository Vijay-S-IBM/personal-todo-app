import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, ChevronLeft, ChevronRight, Trash2,
  CalendarDays, Edit2, ArrowRight, Eye, Filter, X
} from 'lucide-react'
import { getDashboard, deleteTask, bulkDeleteTasks, updateTaskStatus } from '../../api/tasks'
import { getDropdown } from '../../api/dropdown'
import { useToast } from '../../components/Toast'
import { getStatusConfig } from '../../utils/statusColors'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import AddTaskForm from './AddTaskForm'
import EditTaskForm from './EditTaskForm'
import TaskDetailView from './TaskDetailView'
import MoveTaskModal from './MoveTaskModal'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
  )
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const PAGE_SIZE = 10

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [statusOptions, setStatusOptions] = useState([])

  const [selectedIds, setSelectedIds] = useState([])
  const [statusChanging, setStatusChanging] = useState({})

  const [addOpen, setAddOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [detailTask, setDetailTask] = useState(null)
  const [moveOpen, setMoveOpen] = useState(false)

  useEffect(() => {
    getDropdown('status').then((res) => setStatusOptions(res.data)).catch(() => {})
  }, [])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = { task_date: selectedDate, page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (statusFilter) params.task_filter = statusFilter
      const res = await getDashboard(params)
      setTasks(res.data.data)
      setTotal(res.data.total)
      setTotalPages(res.data.total_pages)
    } catch {
      toast('Failed to load tasks.', 'error')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, page, search, statusFilter])

  useEffect(() => { setSelectedIds([]); fetchTasks() }, [fetchTasks])

  const changeDate = (delta) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    setSelectedDate(format(d, 'yyyy-MM-dd'))
    setPage(1)
  }

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1) }
  const clearSearch = () => { setSearchInput(''); setSearch(''); setPage(1) }

  const toggleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  const toggleAll = () =>
    setSelectedIds(selectedIds.length === tasks.length ? [] : tasks.map((t) => t.task_id))

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return
    try { await deleteTask(taskId); toast('Task deleted.', 'success'); fetchTasks() }
    catch { toast('Failed to delete task.', 'error') }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length || !confirm(`Delete ${selectedIds.length} task(s)?`)) return
    try {
      await bulkDeleteTasks(selectedIds)
      toast(`${selectedIds.length} task(s) deleted.`, 'success')
      setSelectedIds([])
      fetchTasks()
    } catch { toast('Bulk delete failed.', 'error') }
  }

  const handleStatusChange = async (taskId, statusId) => {
    setStatusChanging((prev) => ({ ...prev, [taskId]: true }))
    try { await updateTaskStatus(taskId, statusId); toast('Status updated.', 'success'); fetchTasks() }
    catch { toast('Failed to update status.', 'error') }
    finally { setStatusChanging((prev) => ({ ...prev, [taskId]: false })) }
  }

  const displayDate = new Date(selectedDate + 'T00:00:00')
  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd')

  /* shared status dropdown renderer */
  const StatusSelect = ({ task, className }) => {
    const cfg = getStatusConfig(task.status_name)
    return (
      <select
        value={task.status_id}
        onChange={(e) => handleStatusChange(task.task_id, e.target.value)}
        className={className}
        disabled={statusChanging[task.task_id]}
        aria-label="Change task status"
        style={{ color: cfg.color, borderColor: cfg.border, backgroundColor: cfg.bg }}
      >
        {statusOptions.map((s) => (
          <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
        ))}
      </select>
    )
  }

  return (
    <div className={styles.page}>

      {/* ── Top bar ─────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.dateNav}>
          <button className={styles.navBtn} onClick={() => changeDate(-1)} aria-label="Previous day">
            <ChevronLeft size={18} />
          </button>
          <div className={styles.dateBlock}>
            <h1 className={styles.dateHeading}>{format(displayDate, 'EEE, MMM d, yyyy')}</h1>
            {isToday && <span className={styles.todayPill}>Today</span>}
          </div>
          <button className={styles.navBtn} onClick={() => changeDate(1)} aria-label="Next day">
            <ChevronRight size={18} />
          </button>
          <input
            type="date"
            className={styles.datePicker}
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setPage(1) }}
            aria-label="Jump to date"
          />
        </div>
        <button className={styles.addBtn} onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* ── Filters ─────────────────────────── */}
      <div className={styles.filtersBar}>
        <form onSubmit={handleSearch} className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.searchInput}
          />
          {searchInput && (
            <button type="button" className={styles.clearBtn} onClick={clearSearch} aria-label="Clear">
              <X size={14} />
            </button>
          )}
          <button type="submit" className={styles.searchSubmit}>Search</button>
        </form>

        <div className={styles.filterWrap}>
          <Filter size={14} className={styles.filterIcon} />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className={styles.filterSelect}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
            ))}
          </select>
        </div>

        {total > 0 && <span className={styles.taskCount}>{total} task{total !== 1 ? 's' : ''}</span>}
      </div>

      {/* ── Bulk bar ────────────────────────── */}
      {selectedIds.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkInfo}>{selectedIds.length} selected</span>
          <button className={styles.bulkBtn} onClick={() => setMoveOpen(true)}>
            <ArrowRight size={14} /><span> Move</span>
          </button>
          <button className={`${styles.bulkBtn} ${styles.bulkDanger}`} onClick={handleBulkDelete}>
            <Trash2 size={14} /><span> Delete</span>
          </button>
          <button className={styles.bulkClear} onClick={() => setSelectedIds([])}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Task list ───────────────────────── */}
      <div className={styles.tableWrap}>
        {loading ? (
          <Spinner fullPage />
        ) : tasks.length === 0 ? (
          <div className={styles.empty}>
            <CalendarDays size={48} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No tasks for this day</p>
            <p className={styles.emptyHint}>Start by adding a task above.</p>
            <button className={styles.emptyAddBtn} onClick={() => setAddOpen(true)}>
              <Plus size={15} /> Add Task
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className={styles.table}>
              <thead>
                <tr className={styles.thead}>
                  <th className={styles.thCheck}>
                    <input type="checkbox" checked={selectedIds.length === tasks.length && tasks.length > 0}
                      onChange={toggleAll} aria-label="Select all" className={styles.checkbox} />
                  </th>
                  <th className={styles.thTask}>Task</th>
                  <th className={styles.thStatus}>Status</th>
                  <th className={styles.thActions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const cfg = getStatusConfig(task.status_name)
                  const isSelected = selectedIds.includes(task.task_id)
                  return (
                    <tr key={task.task_id}
                      className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
                      style={{ '--row-accent': cfg.color, '--row-bg': cfg.rowBg }}
                    >
                      <td className={styles.tdCheck}>
                        <input type="checkbox" checked={isSelected}
                          onChange={() => toggleSelect(task.task_id)}
                          className={styles.checkbox} aria-label={`Select ${task.task_name}`} />
                      </td>
                      <td className={styles.tdTask} onClick={() => setDetailTask(task)}>
                        <p className={styles.taskName}>{task.task_name}</p>
                        {task.task_description && <p className={styles.taskDesc}>{task.task_description}</p>}
                      </td>
                      <td className={styles.tdStatus}>
                        <div className={styles.statusDropdown}>
                          <StatusSelect task={task} className={styles.statusSelect} />
                          {statusChanging[task.task_id] && <span className={styles.statusSpinner} />}
                        </div>
                      </td>
                      <td className={styles.tdActions}>
                        <button className={`${styles.iconBtn} ${styles.iconBtnView}`} onClick={() => setDetailTask(task)} aria-label="View"><Eye size={15} /></button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnEdit}`} onClick={() => setEditTask(task)} aria-label="Edit"><Edit2 size={15} /></button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDelete(task.task_id)} aria-label="Delete"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Mobile card list */}
            <div className={styles.cardList}>
              {tasks.map((task) => {
                const cfg = getStatusConfig(task.status_name)
                const isSelected = selectedIds.includes(task.task_id)
                return (
                  <div key={task.task_id}
                    className={`${styles.taskCard} ${isSelected ? styles.taskCardSelected : ''}`}
                    style={{ '--row-accent': cfg.color, '--row-bg': cfg.rowBg }}
                  >
                    <div className={styles.cardTop}>
                      <div className={styles.cardCheckbox}>
                        <input type="checkbox" checked={isSelected}
                          onChange={() => toggleSelect(task.task_id)}
                          className={styles.checkbox} aria-label={`Select ${task.task_name}`} />
                      </div>
                      <div className={styles.cardBody} onClick={() => setDetailTask(task)}>
                        <p className={styles.cardName}>{task.task_name}</p>
                        {task.task_description && <p className={styles.cardDesc}>{task.task_description}</p>}
                      </div>
                    </div>
                    <div className={styles.cardBottom}>
                      <div className={styles.cardStatusWrap}>
                        <StatusSelect task={task} className={styles.cardStatusSelect} />
                      </div>
                      <div className={styles.cardActions}>
                        <button className={`${styles.iconBtn} ${styles.iconBtnView}`} onClick={() => setDetailTask(task)} aria-label="View"><Eye size={14} /></button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnEdit}`} onClick={() => setEditTask(task)} aria-label="Edit"><Edit2 size={14} /></button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDelete(task.task_id)} aria-label="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Pagination ──────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Page {page} of {totalPages} · {total} tasks</span>
          <div className={styles.pageBtns}>
            <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p}
                className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(p)} aria-current={p === page ? 'page' : undefined}
              >{p}</button>
            ))}
            <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ──────────────────────────── */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Task">
        <AddTaskForm defaultDate={selectedDate} onSuccess={() => { setAddOpen(false); fetchTasks() }} />
      </Modal>

      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && <EditTaskForm task={editTask} onSuccess={() => { setEditTask(null); fetchTasks() }} />}
      </Modal>

      <Modal isOpen={!!detailTask} onClose={() => setDetailTask(null)} title="Task Details" width={600}>
        {detailTask && (
          <TaskDetailView taskId={detailTask.task_id}
            onEdit={() => { setEditTask(detailTask); setDetailTask(null) }} />
        )}
      </Modal>

      <Modal isOpen={moveOpen} onClose={() => setMoveOpen(false)} title={`Move ${selectedIds.length} Task(s)`}>
        <MoveTaskModal taskIds={selectedIds}
          onSuccess={() => { setMoveOpen(false); setSelectedIds([]); fetchTasks() }} />
      </Modal>
    </div>
  )
}
