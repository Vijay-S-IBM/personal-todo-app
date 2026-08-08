import api from './client'

export const googleAuth = (id_token) =>
  api.post('/auth/google', { id_token })

export const getMyProfile = () =>
  api.get('/me')

export const getUserDetails = (user_id) =>
  api.get(`/get_user_details/${user_id}`)
