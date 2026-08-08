import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMonthlyCalendar } from '../../api/calendar'
import { useToast } from '../../components/Toast'
import Spinner from '../../components/Spinner'
import styles from './CalendarPage.module.css'

const STATUS_DOTS = [
  { key: 'completed',    color: '#10B981', label: 'Completed' },
  { key: 'in_process',   color: '#F59E0B', label: 'In Process' },
  { key: 'yet_to_start', color: '#3B82F6', label: 'Yet To Start' },
  { key: 'on_hold',      color: '#8B5CF6', label: 'On Hold' },
  { key: 'delayed',      color: '#EF4444', label: 'Delayed' },
]

export default function CalendarPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dayData, setDayData] = useState({}) // keyed by 'YYYY-MM-DD'
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1
    setLoading(true)
    getMonthlyCalendar(year, month)
      .then((res) => {
        const map = {}
        res.data.days.forEach((d) => { map[d.date] = d })
        setDayData(map)
      })
      .catch(() => toast('Failed to load calendar.', 'error'))
      .finally(() => setLoading(false))
  }, [currentMonth])

  const handleDayClick = (dateStr) => {
    navigate(`/dashboard?date=${dateStr}`)
  }

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const weeks = []
  let day = gridStart
  while (day <= gridEnd) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    weeks.push(week)
  }

  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.navBtn}
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          className={styles.navBtn}
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
        <button
          className={styles.todayBtn}
          onClick={() => setCurrentMonth(new Date())}
        >
          Today
        </button>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {STATUS_DOTS.map((s) => (
          <div key={s.key} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: s.color }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <Spinner fullPage />
      ) : (
        <div className={styles.grid}>
          {/* Weekday headers */}
          {WEEKDAYS.map((wd) => (
            <div key={wd} className={styles.weekday}>{wd}</div>
          ))}

          {/* Day cells */}
          {weeks.flat().map((d) => {
            const dateStr = format(d, 'yyyy-MM-dd')
            const data = dayData[dateStr]
            const inMonth = isSameMonth(d, currentMonth)
            const today = isToday(d)

            return (
              <button
                key={dateStr}
                className={`${styles.cell} ${!inMonth ? styles.cellOtherMonth : ''} ${today ? styles.cellToday : ''} ${data ? styles.cellHasTasks : ''}`}
                onClick={() => handleDayClick(dateStr)}
                aria-label={`${dateStr}${data ? `, ${data.total} tasks` : ''}`}
              >
                <span className={styles.dayNum}>{format(d, 'd')}</span>

                {data && (
                  <>
                    <span className={styles.totalCount}>{data.total} task{data.total !== 1 ? 's' : ''}</span>
                    <div className={styles.statusBar}>
                      {STATUS_DOTS.map((s) =>
                        data[s.key] > 0 ? (
                          <span
                            key={s.key}
                            className={styles.statusSegment}
                            style={{
                              backgroundColor: s.color,
                              flex: data[s.key],
                            }}
                            title={`${s.label}: ${data[s.key]}`}
                          />
                        ) : null
                      )}
                    </div>
                    <div className={styles.dotRow}>
                      {STATUS_DOTS.map((s) =>
                        data[s.key] > 0 ? (
                          <span
                            key={s.key}
                            className={styles.dotCount}
                            style={{ color: s.color }}
                            title={`${s.label}: ${data[s.key]}`}
                          >
                            {data[s.key]}
                          </span>
                        ) : null
                      )}
                    </div>
                  </>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
