import api from './client'

export const getMonthlyCalendar = (year, month) =>
  api.get('/calendar/monthly', { params: { year, month } })
