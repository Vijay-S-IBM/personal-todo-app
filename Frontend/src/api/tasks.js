import api from './client'

export const getDashboard = (params) =>
  api.get('/dashboard', { params })

export const getSpecificTask = (task_id) =>
  api.get(`/get_specific_task/${task_id}`)

export const addTask = (task_details) =>
  api.post('/add_task', { task_details })

export const updateTask = (task_id, task_details) =>
  api.patch('/update_task', { task_id, task_details })

export const updateTaskStatus = (task_id, status_id) =>
  api.patch('/status_update', { task_id, status_id })

export const moveTask = (task_ids, due_date) =>
  api.patch('/move_task', { task_ids, due_date })

export const deleteTask = (task_id) =>
  api.delete(`/delete_task/${task_id}`)

export const bulkDeleteTasks = (task_ids) =>
  api.delete('/delete_tasks/bulk', { data: { task_ids } })
