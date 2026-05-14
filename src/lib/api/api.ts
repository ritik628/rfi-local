import axios from 'axios'
import toast from 'react-hot-toast'
import type {
  Project,
  RFIListResponse,
  RFI,
  Category,
  Subcategory,
  CategoryItem,
  ChatMessage,
  Example,
  UploadedFile,
  ClassifyProgress,
  Discipline,
} from '@/types'

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
export const getProjects      = (): Promise<Project[]> => api.get('/projects').then(r => r.data)
export const createProject    = (data: Partial<Project>): Promise<Project> => api.post('/projects', data).then(r => r.data)
export const updateProject    = (id: string, data: Partial<Project>): Promise<Project> => api.patch(`/projects/${id}`, data).then(r => r.data)
export const deleteProject    = (id: string, auditData: Record<string, string> = {}): Promise<void> => api.delete(`/projects/${id}`, { data: auditData }).then(r => r.data)

// ── RFIs ─────────────────────────────────────────────────────────────────────
export const getRFIs = (projectId: string, params: Record<string, any> = {}): Promise<RFIListResponse> =>
  api.get(`/rfis/${projectId}`, { params }).then(r => r.data)

export const classifyRFI    = (rfiId: string): Promise<RFI> => api.post(`/rfis/${rfiId}/classify`).then(r => r.data)
export const reclassifyRFI  = (rfiId: string): Promise<RFI> => api.post(`/rfis/${rfiId}/reclassify`).then(r => r.data)
export const classifyAll          = (projectId: string): Promise<{ total?: number }> => api.post(`/rfis/${projectId}/classify-all`).then(r => r.data)
export const stopClassify         = (projectId: string): Promise<void> => api.post(`/rfis/${projectId}/classify-stop`).then(r => r.data)
export const reclassifyBatch      = (projectId: string, rfiIds: string[]): Promise<{ total?: number }> => api.post(`/rfis/${projectId}/reclassify-batch`, { rfi_ids: rfiIds }).then(r => r.data)
export const getClassifyProgress  = (projectId: string): Promise<ClassifyProgress> => api.get(`/rfis/${projectId}/classify-progress`).then(r => r.data)
export const updateRFI      = (rfiId: string, data: Partial<RFI>): Promise<RFI> => api.patch(`/rfis/${rfiId}`, data).then(r => r.data)

// ── Categories ───────────────────────────────────────────────────────────────
export const getCategories       = (): Promise<Category[]> => api.get('/categories').then(r => r.data)
export const addCategory         = (data: Partial<Category>): Promise<Category> => api.post('/categories', data).then(r => r.data)
export const updateCategory      = (id: string, data: Partial<Category>): Promise<Category> => api.patch(`/categories/${id}`, data).then(r => r.data)
export const deleteCategory      = (id: string): Promise<void> => api.delete(`/categories/${id}`).then(r => r.data)
export const addSubcategory      = (data: Partial<Subcategory>): Promise<Subcategory> => api.post('/categories/subcategories', data).then(r => r.data)
export const updateSubcategory   = (id: string, data: Partial<Subcategory>): Promise<Subcategory> => api.patch(`/categories/subcategories/${id}`, data).then(r => r.data)
export const deleteSubcategory   = (id: string): Promise<void> => api.delete(`/categories/subcategories/${id}`).then(r => r.data)
export const addItem             = (data: Partial<CategoryItem>): Promise<CategoryItem> => api.post('/categories/items', data).then(r => r.data)
export const updateItem          = (id: string, data: Partial<CategoryItem>): Promise<CategoryItem> => api.patch(`/categories/items/${id}`, data).then(r => r.data)
export const deleteItem          = (id: string): Promise<void> => api.delete(`/categories/items/${id}`).then(r => r.data)

// ── AI Agent ─────────────────────────────────────────────────────────────────
export const aiChat       = (projectId: string, messages: ChatMessage[]): Promise<any> =>
  api.post('/ai/chat', { project_id: projectId, messages }).then(r => r.data)
export const getExamples  = (projectId: string): Promise<Example[]> => api.get(`/ai/examples/${projectId}`).then(r => r.data)
export const addExample   = (data: Partial<Example>): Promise<Example> => api.post('/ai/examples', data).then(r => r.data)
export const deleteExample = (id: string): Promise<void> => api.delete(`/ai/examples/${id}`).then(r => r.data)

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadFile = (projectId: string, file: File, fileType: string): Promise<any> => {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('file_type', fileType)
  return api.post(`/upload/${projectId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}
export const getUploadedFiles = (projectId: string): Promise<UploadedFile[]> =>
  api.get(`/upload/${projectId}/files`).then(r => r.data)
export const deleteUploadedFile = (fileId: string): Promise<void> =>
  api.delete(`/upload/file/${fileId}`).then(r => r.data)

// ── Consultant Response PDF import ───────────────────────────────────────────
export const importResponsePDFs = (projectId: string, files: File[]): Promise<any> => {
  const fd = new FormData()
  files.forEach(f => fd.append('files', f))
  return api.post(`/rfis/${projectId}/import-responses`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}
export const getResponseImportProgress = (projectId: string): Promise<any> =>
  api.get(`/rfis/${projectId}/response-import-progress`).then(r => r.data)

// ── Export ────────────────────────────────────────────────────────────────────
export const exportExcel = (projectId: string, params: Record<string, string> = {}): void => {
  const qs = new URLSearchParams(params).toString()
  window.open(`/api/export/${projectId}/excel${qs ? '?' + qs : ''}`, '_blank')
}

// ── Disciplines (per-project, stored in DB) ───────────────────────────────────
export const getDisciplines   = (projectId: string): Promise<Discipline[]> => api.get(`/projects/${projectId}/disciplines`).then(r => r.data)
export const addDiscipline    = (projectId: string, name: string): Promise<Discipline> => api.post(`/projects/${projectId}/disciplines`, { name }).then(r => r.data)
export const deleteDiscipline = (projectId: string, discId: string): Promise<void> => api.delete(`/projects/${projectId}/disciplines/${discId}`).then(r => r.data)

// ── Team members (stored in localStorage for now, DB in future) ───────────────
export const getTeamMembers = (projectId: string): string[] => {
  try { return JSON.parse(localStorage.getItem(`team_${projectId}`) || '[]') } catch { return [] }
}
export const saveTeamMembers = (projectId: string, members: string[]): string[] => {
  localStorage.setItem(`team_${projectId}`, JSON.stringify(members))
  return members
}

export default api
