import api from './client'

export const getStatistics = (range_id) =>
  api.get('/dashboard/statistics', { params: { range_id } })
