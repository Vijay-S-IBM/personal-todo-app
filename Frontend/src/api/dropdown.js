import api from './client'

export const getDropdown = (dropdown_type) =>
  api.get(`/dropdown/${dropdown_type}`)
