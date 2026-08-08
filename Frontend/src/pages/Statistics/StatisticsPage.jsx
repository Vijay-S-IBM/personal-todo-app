import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { getDropdown } from '../../api/dropdown'
import { getStatistics } from '../../api/stats'
import { useToast } from '../../components/Toast'
import Spinner from '../../components/Spinner'
import styles from './StatisticsPage.module.css'
import { getStatusColor } from '../../utils/statusColors'

const SUMMARY_CARDS = [
  { key: 'total_tasks',           label: 'Total Tasks',   color: 'var(--accent)'  },
  { key: 'completed_tasks',       label: 'Completed',     color: 'var(--green)'   },
  { key: 'in_progress_tasks',     label: 'In Progress',   color: 'var(--orange)'  },
  { key: 'pending_tasks',         label: 'Pending',       color: 'var(--purple)'  },
  { key: 'completion_percentage', label: 'Completion %',  color: 'var(--green)', isPercent: true },
]

/**
 * Returns a bar colour based on how a value ranks among all values.
 * Highest → green, middle → amber/orange, lowest → red.
 * Uses linear interpolation across three stops.
 */
function barColor(value, min, max) {
  if (max === min) return '#10B981' // all equal → green
  const ratio = (value - min) / (max - min) // 0 = min, 1 = max

  // Three-stop gradient: red(0) → amber(0.5) → green(1)
  const stops = [
    { r: 239, g: 68,  b: 68  }, // #EF4444 red
    { r: 245, g: 158, b: 11  }, // #F59E0B amber
    { r: 16,  g: 185, b: 129 }, // #10B981 green
  ]

  let r, g, b
  if (ratio <= 0.5) {
    const t = ratio / 0.5
    r = Math.round(stops[0].r + t * (stops[1].r - stops[0].r))
    g = Math.round(stops[0].g + t * (stops[1].g - stops[0].g))
    b = Math.round(stops[0].b + t * (stops[1].b - stops[0].b))
  } else {
    const t = (ratio - 0.5) / 0.5
    r = Math.round(stops[1].r + t * (stops[2].r - stops[1].r))
    g = Math.round(stops[1].g + t * (stops[2].g - stops[1].g))
    b = Math.round(stops[1].b + t * (stops[2].b - stops[1].b))
  }
  return `rgb(${r},${g},${b})`
}

export default function StatisticsPage() {
  const toast = useToast()

  const [ranges, setRanges] = useState([])
  const [selectedRange, setSelectedRange] = useState('')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rangesLoading, setRangesLoading] = useState(true)

  // Load range dropdown
  useEffect(() => {
    getDropdown('stats')
      .then((res) => {
        setRanges(res.data)
        if (res.data.length > 0) {
          // Default to "This Week" or first option
          const thisWeek = res.data.find((r) => r.range_name === 'This Week')
          setSelectedRange(thisWeek ? thisWeek.range_id : res.data[0].range_id)
        }
      })
      .catch(() => toast('Failed to load date ranges.', 'error'))
      .finally(() => setRangesLoading(false))
  }, [])

  // Fetch statistics when range changes
  useEffect(() => {
    if (!selectedRange) return
    setLoading(true)
    getStatistics(selectedRange)
      .then((res) => setStats(res.data))
      .catch(() => toast('Failed to load statistics.', 'error'))
      .finally(() => setLoading(false))
  }, [selectedRange])

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Statistics</h1>
          {stats?.range && (
            <p className={styles.subtitle}>
              {stats.range.start_date} → {stats.range.end_date}
            </p>
          )}
        </div>

        {rangesLoading ? (
          <Spinner size={20} />
        ) : (
          <select
            className={styles.rangeSelect}
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            aria-label="Select date range"
          >
            {ranges.map((r) => (
              <option key={r.range_id} value={r.range_id}>
                {r.range_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <Spinner fullPage />
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className={styles.cards}>
            {SUMMARY_CARDS.map((card) => (
              <div key={card.key} className={styles.card}>
                <span className={styles.cardLabel}>{card.label}</span>
                <span className={styles.cardValue} style={{ color: card.color }}>
                  {card.isPercent
                    ? `${Number(stats.summary[card.key]).toFixed(1)}%`
                    : stats.summary[card.key]}
                </span>
                {card.isPercent && (
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(stats.summary[card.key], 100)}%`,
                        backgroundColor: card.color,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className={styles.chartsRow}>
            {/* Donut chart */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Tasks by Status</h3>
              {stats.status_statistics?.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.status_statistics}
                      dataKey="task_count"
                      nameKey="status_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {stats.status_statistics.map((entry) => (
                        <Cell
                          key={entry.status_id}
                          fill={getStatusColor(entry.status_name)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        color: 'var(--text-primary)',
                        fontSize: 13,
                      }}
                      formatter={(value, name) => [value, name]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.noData}>No data for this period.</p>
              )}
            </div>

            {/* Bar chart — task trend */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Task Trend</h3>
              {stats.task_trend?.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={stats.task_trend}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="task_date"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                        tickFormatter={(v) => {
                          const [, m, d] = v.split('-')
                          return `${d}/${m}`
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          color: 'var(--text-primary)',
                          fontSize: 13,
                        }}
                        cursor={{ fill: 'var(--row-hover)' }}
                        labelFormatter={(v) => {
                          const [y, m, d] = v.split('-')
                          return `${d}/${m}/${y}`
                        }}
                        formatter={(val) => [val, 'Tasks']}
                      />
                      <Bar dataKey="task_count" name="Tasks" radius={[5, 5, 0, 0]} isAnimationActive>
                        {(() => {
                          const counts = stats.task_trend.map((d) => d.task_count)
                          const minVal = Math.min(...counts)
                          const maxVal = Math.max(...counts)
                          return stats.task_trend.map((entry, idx) => (
                            <Cell
                              key={`bar-${idx}`}
                              fill={barColor(entry.task_count, minVal, maxVal)}
                            />
                          ))
                        })()}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Colour scale legend */}
                  <div className={styles.barLegend}>
                    <span className={styles.barLegendLabel}>Low</span>
                    <div className={styles.barLegendGradient} />
                    <span className={styles.barLegendLabel}>High</span>
                  </div>
                </>
              ) : (
                <p className={styles.noData}>No trend data for this period.</p>
              )}
            </div>
          </div>

          {/* Status breakdown table */}
          <div className={styles.breakdownCard}>
            <h3 className={styles.chartTitle}>Status Breakdown</h3>
            <div className={styles.breakdownList}>
              {stats.status_statistics?.map((s) => {
                const pct = stats.summary.total_tasks > 0
                  ? ((s.task_count / stats.summary.total_tasks) * 100).toFixed(1)
                  : 0
                const color = getStatusColor(s.status_name)
                return (
                  <div key={s.status_id} className={styles.breakdownRow}>
                    <div className={styles.breakdownLeft}>
                      <span className={styles.breakdownDot} style={{ backgroundColor: color }} />
                      <span className={styles.breakdownName}>{s.status_name}</span>
                    </div>
                    <div className={styles.breakdownRight}>
                      <div className={styles.breakdownBar}>
                        <div
                          className={styles.breakdownFill}
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className={styles.breakdownCount}>{s.task_count}</span>
                      <span className={styles.breakdownPct}>{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>Select a date range to view statistics.</div>
      )}
    </div>
  )
}
