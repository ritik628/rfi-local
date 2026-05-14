// ── Project ─────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  description?: string;
  client?: string;
  consultant?: string;
  contractor?: string;
  rfi_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  client: string;
  consultant: string;
  contractor: string;
}

// ── RFI ─────────────────────────────────────────────────────────────
export interface RFI {
  id: string;
  rfi_ref: string;
  sr_no?: number | string;
  subject: string;
  description?: string;
  discipline?: string;
  status?: string;
  ai_classified?: boolean;
  ai_design_defect?: string;
  ai_next_level_category?: string;
  ai_sub_level_category?: string;
  ai_location?: string;
  ai_severity?: string;
  conf_overall?: number;
  conf_design_defect?: number;
  conf_next_level_category?: number;
  conf_sub_level_category?: number;
  conf_location?: number;
  human_design_defect?: string;
  human_next_level_category?: string;
  human_sub_level_category?: string;
  human_location?: string;
  human_corrected?: boolean;
  consultant_response?: string;
  severity?: string;
  created_at?: string;
}

export interface RFIMetrics {
  total: number;
  classified: number;
  high: number;
  medium: number;
  low: number;
}

export interface RFIListResponse {
  rfis: RFI[];
  total: number;
  unclassified_total: number;
  metrics: RFIMetrics | null;
}

// ── Categories ──────────────────────────────────────────────────────
export interface CategoryItem {
  id: string;
  name: string;
  subcategory_id: string;
  order_index?: number;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  order_index?: number;
  items?: CategoryItem[];
}

export interface Category {
  id: string;
  name: string;
  order_index?: number;
  subcategories?: Subcategory[];
}

// ── Disciplines ─────────────────────────────────────────────────────
export interface Discipline {
  id: string;
  name: string;
  project_id: string;
}

// ── AI / Chat ───────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Example {
  id?: string;
  project_id: string;
  rfi_ref: string;
  subject: string;
  description_excerpt?: string;
  discipline?: string;
  correct_design_defect?: string;
  correct_next_level_category?: string;
  correct_sub_level_category?: string;
  correct_location?: string;
  added_by?: string;
}

// ── Upload ──────────────────────────────────────────────────────────
export interface UploadedFile {
  id: string;
  project_id: string;
  original_filename: string;
  file_type: string;
  uploaded_at: string;
  row_count?: number;
}

// ── Classify Progress ───────────────────────────────────────────────
export interface ClassifyProgress {
  status: 'idle' | 'queued' | 'running' | 'done' | 'stopped' | 'stopping';
  total: number;
  done: number;
  current: string;
}

// ── Correction Payload ──────────────────────────────────────────────
export interface CorrectionPayload {
  human_design_defect?: string;
  human_next_level_category?: string;
  human_sub_level_category?: string;
  human_location?: string;
  human_corrected?: boolean;
  ai_severity?: string;
}

// ── Delete Target ───────────────────────────────────────────────────
export interface DeleteTarget {
  id: string;
  name: string;
  rfi_count: number;
}

// ── SingleClassify State ────────────────────────────────────────────
export interface SingleClassifyState {
  isVisible: boolean;
  status: 'idle' | 'retrieving' | 'analyzing' | 'ensemble' | 'saving' | 'done';
  rfi: RFI | null;
}
