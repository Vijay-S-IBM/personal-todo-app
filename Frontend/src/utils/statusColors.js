// Status → color token (CSS var string so it works in both light & dark)
export const STATUS_CONFIG = {
  'Yet To Start': { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)',  rowBg: 'rgba(59,130,246,0.04)'  },
  'In Process':   { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.25)',  rowBg: 'rgba(245,158,11,0.04)'  },
  'Completed':    { color: '#10B981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.25)',  rowBg: 'rgba(16,185,129,0.04)'  },
  'On Hold':      { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)', rowBg: 'rgba(139,92,246,0.04)' },
  'Delayed':      { color: '#EF4444', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.25)',   rowBg: 'rgba(239,68,68,0.04)'   },
}

export const getStatusConfig  = (name) => STATUS_CONFIG[name] ?? { color: '#64748B', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)', rowBg: 'transparent' }
export const getStatusColor    = (name) => getStatusConfig(name).color
export const getStatusBg       = (name) => getStatusConfig(name).bg

// Recharts chart colors — same order as status options
export const STATUS_CHART_COLORS = ['#10B981','#3B82F6','#F59E0B','#8B5CF6','#EF4444']
