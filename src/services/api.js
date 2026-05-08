import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({ baseURL: 'http://localhost:8000/api' })

api.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.detail || err.message || 'Request failed'
    toast.error(msg)
    return Promise.reject(err)
  }
)

// ── Projects ─────────────────────────────────────────────────────────────────
export const getProjects      = () => api.get('/projects').then(r => r.data)
export const createProject    = (data) => api.post('/projects', data).then(r => r.data)
export const updateProject    = (id, data) => api.patch(`/projects/${id}`, data).then(r => r.data)
export const deleteProject    = (id, auditData = {}) => api.delete(`/projects/${id}`, { data: auditData }).then(r => r.data)

// ── RFIs ─────────────────────────────────────────────────────────────────────
export const getRFIs = (projectId, params = {}) =>
  api.get(`/rfis/${projectId}`, { params }).then(r => r.data)

export const classifyRFI    = (rfiId) => api.post(`/rfis/${rfiId}/classify`).then(r => r.data)
export const reclassifyRFI  = (rfiId) => api.post(`/rfis/${rfiId}/reclassify`).then(r => r.data)
export const classifyAll          = (projectId) => api.post(`/rfis/${projectId}/classify-all`).then(r => r.data)
export const stopClassify         = (projectId) => api.post(`/rfis/${projectId}/classify-stop`).then(r => r.data)
export const reclassifyBatch      = (projectId, rfiIds) => api.post(`/rfis/${projectId}/reclassify-batch`, { rfi_ids: rfiIds }).then(r => r.data)
export const getClassifyProgress  = (projectId) => api.get(`/rfis/${projectId}/classify-progress`).then(r => r.data)
export const updateRFI      = (rfiId, data) => api.patch(`/rfis/${rfiId}`, data).then(r => r.data)

// ── Categories ───────────────────────────────────────────────────────────────
export const getCategories       = () => api.get('/categories').then(r => r.data)
export const addCategory         = (data) => api.post('/categories', data).then(r => r.data)
export const updateCategory      = (id, data) => api.patch(`/categories/${id}`, data).then(r => r.data)
export const deleteCategory      = (id) => api.delete(`/categories/${id}`).then(r => r.data)
export const addSubcategory      = (data) => api.post('/categories/subcategories', data).then(r => r.data)
export const updateSubcategory   = (id, data) => api.patch(`/categories/subcategories/${id}`, data).then(r => r.data)
export const deleteSubcategory   = (id) => api.delete(`/categories/subcategories/${id}`).then(r => r.data)
export const addItem             = (data) => api.post('/categories/items', data).then(r => r.data)
export const updateItem          = (id, data) => api.patch(`/categories/items/${id}`, data).then(r => r.data)
export const deleteItem          = (id) => api.delete(`/categories/items/${id}`).then(r => r.data)

// ── AI Agent ─────────────────────────────────────────────────────────────────
export const aiChat       = (projectId, messages) =>
  api.post('/ai/chat', { project_id: projectId, messages }).then(r => r.data)
export const getExamples  = (projectId) => api.get(`/ai/examples/${projectId}`).then(r => r.data)
export const addExample   = (data) => api.post('/ai/examples', data).then(r => r.data)
export const deleteExample = (id) => api.delete(`/ai/examples/${id}`).then(r => r.data)

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadFile = (projectId, file, fileType) => {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('file_type', fileType)
  return api.post(`/upload/${projectId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}
export const getUploadedFiles = (projectId) =>
  api.get(`/upload/${projectId}/files`).then(r => r.data)
export const deleteUploadedFile = (fileId) =>
  api.delete(`/upload/file/${fileId}`).then(r => r.data)

// ── Consultant Response PDF import ───────────────────────────────────────────
export const importResponsePDFs = (projectId, files) => {
  const fd = new FormData()
  files.forEach(f => fd.append('files', f))
  return api.post(`/rfis/${projectId}/import-responses`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}
export const getResponseImportProgress = (projectId) =>
  api.get(`/rfis/${projectId}/response-import-progress`).then(r => r.data)

// ── Export ────────────────────────────────────────────────────────────────────
export const exportExcel = (projectId, params = {}) => {
  const qs = new URLSearchParams(params).toString()
  window.open(`/api/export/${projectId}/excel${qs ? '?' + qs : ''}`, '_blank')
}

// ── Disciplines (per-project, stored in DB) ───────────────────────────────────
export const getDisciplines   = (projectId) => api.get(`/projects/${projectId}/disciplines`).then(r => r.data)
export const addDiscipline    = (projectId, name) => api.post(`/projects/${projectId}/disciplines`, { name }).then(r => r.data)
export const deleteDiscipline = (projectId, discId) => api.delete(`/projects/${projectId}/disciplines/${discId}`).then(r => r.data)

// ── Team members (stored in localStorage for now, DB in future) ───────────────
export const getTeamMembers = (projectId) => {
  try { return JSON.parse(localStorage.getItem(`team_${projectId}`) || '[]') } catch { return [] }
}
export const saveTeamMembers = (projectId, members) => {
  localStorage.setItem(`team_${projectId}`, JSON.stringify(members))
  return members
}

export default api
