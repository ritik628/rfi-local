import { useState, useEffect } from 'react'
import { getCategories, addCategory, updateCategory, deleteCategory,
         addSubcategory, updateSubcategory, deleteSubcategory,
         addItem, updateItem, deleteItem } from '../services/api'
import toast from 'react-hot-toast'

const CAT_COLORS = ['#1D4ED8','#DC2626','#D97706','#16A34A','#7C3AED','#0891B2','#EA580C','#DB2777','#0D9488','#CA8A04']
const CAT_BG    = ['#EFF6FF','#FEF2F2','#FFFBEB','#F0FDF4','#F5F3FF','#F0F9FF','#FFF7ED','#FDF2F8','#F0FDFA','#FEFCE8']

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal fade-up" style={{ width:480 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:17, fontWeight:800, color:'#0F172A', marginBottom:18 }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, multiline }) {
  return (
    <div style={{ marginBottom:13 }}>
      <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:5 }}>{label}</label>
      {multiline
        ? <textarea className="input" rows={3} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        : <input className="input" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  )
}

function ModalBtns({ onCancel, onSave, saving, saveLabel = 'Save' }) {
  return (
    <div style={{ display:'flex', gap:10, marginTop:6 }}>
      <button onClick={onCancel} style={{ flex:1, background:'#F8FAFC', color:'#374151', border:'1.5px solid #E5E7EB', borderRadius:9, padding:11, fontSize:13.5, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
      <button className="btn-primary" onClick={onSave} disabled={saving} style={{ flex:2, justifyContent:'center' }}>{saving ? 'Saving…' : saveLabel}</button>
    </div>
  )
}

export default function CategoriesPage() {
  const [cats, setCats]         = useState([])
  const [expanded, setExpanded] = useState({ '1':true })
  const [saving, setSaving]     = useState(false)

  // Modal state: { type: 'addCat'|'editCat'|'addSub'|'editSub'|'addItem'|'editItem', data: {...} }
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({})

  const load = () => getCategories().then(setCats).catch(() => {})
  useEffect(() => { load() }, [])

  const open = (type, data = {}) => { setModal({ type, data }); setForm({ ...data }) }
  const close = () => { setModal(null); setForm({}) }

  const save = async () => {
    setSaving(true)
    try {
      const { type, data } = modal
      if (type === 'addCat') {
        if (!form.no?.trim() || !form.name?.trim()) return toast.error('No and Name required')
        await addCategory({ no: form.no, name: form.name, description: form.description || '', added_by: form.added_by || '' })
        toast.success('Category added')
      } else if (type === 'editCat') {
        await updateCategory(data.id, { no: form.no, name: form.name, description: form.description })
        toast.success('Category updated')
      } else if (type === 'addSub') {
        if (!form.no?.trim() || !form.name?.trim()) return toast.error('No and Name required')
        await addSubcategory({ no: form.no, name: form.name, category_id: data.category_id })
        toast.success('Subcategory added')
      } else if (type === 'editSub') {
        await updateSubcategory(data.id, { no: form.no, name: form.name })
        toast.success('Subcategory updated')
      } else if (type === 'addItem') {
        if (!form.no?.trim() || !form.name?.trim()) return toast.error('No and Name required')
        await addItem({ no: form.no, name: form.name, subcategory_id: data.subcategory_id, added_by: form.added_by || '' })
        toast.success('Item added')
      } else if (type === 'editItem') {
        await updateItem(data.id, { no: form.no, name: form.name })
        toast.success('Item updated')
      }
      close(); load()
    } finally { setSaving(false) }
  }

  const del = async (type, id, label) => {
    if (!confirm(`Delete "${label}"?`)) return
    try {
      if (type === 'cat') await deleteCategory(id)
      else if (type === 'sub') await deleteSubcategory(id)
      else if (type === 'item') await deleteItem(id)
      toast.success('Deleted')
      load()
    } catch {}
  }

  const totalItems = cats.reduce((a, c) => a + c.subcategories.reduce((b, s) => b + s.items.length, 0), 0)

  const modalTitle = {
    addCat:'Add New Category', editCat:'Edit Category',
    addSub:'Add Subcategory', editSub:'Edit Subcategory',
    addItem:'Add Item', editItem:'Edit Item',
  }

  return (
    <div style={{ flex:1, overflowY:'auto', background:'#F4F6FA' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Categories</div>
          <div className="page-sub">{cats.length} design defect categories · {totalItems} classification items</div>
        </div>
        <button className="btn-primary" onClick={() => open('addCat', { no:'', name:'', description:'', added_by:'' })}>+ Add Category</button>
      </div>

      <div style={{ padding:'20px 28px' }}>
        <div style={{ padding:'13px 18px', background:'#F0F9FF', border:'1.5px solid #BAE6FD', borderRadius:12, marginBottom:22, fontSize:13, color:'#0369A1' }}>
          <strong>How categories work:</strong> The AI classifies each RFI into <strong>Design Defect → Next Level Category → Sub Level Category</strong>. Click ✎ to edit or <span style={{ color:'#DC2626' }}>✕</span> to delete any item.
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {cats.map((cat, idx) => {
            const color = CAT_COLORS[idx % CAT_COLORS.length]
            const bg    = CAT_BG[idx % CAT_BG.length]
            const isOpen = expanded[cat.id]
            const totalSubItems = cat.subcategories.reduce((a, s) => a + s.items.length, 0)
            return (
              <div key={cat.id} className="card" style={{ overflow:'hidden', borderTop:`3px solid ${color}` }}>
                {/* Category header */}
                <div style={{ padding:'14px 18px', background:'#fff', display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div onClick={() => setExpanded(e => ({ ...e, [cat.id]:!e[cat.id] }))}
                    style={{ display:'flex', gap:12, flex:1, cursor:'pointer', alignItems:'flex-start' }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:800, color }}>{cat.no}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <span style={{ fontSize:14.5, fontWeight:700, color:'#0F172A' }}>{cat.name}</span>
                        {cat.is_custom && <span style={{ fontSize:10, background:'#F3E8FF', color:'#7C3AED', padding:'1px 7px', borderRadius:20, fontWeight:700 }}>Custom</span>}
                      </div>
                      {cat.description && <div style={{ fontSize:12, color:'#6B7280', marginTop:3, lineHeight:1.5 }}>{cat.description}</div>}
                      <div style={{ fontSize:11, color:'#9CA3AF', marginTop:5 }}>{cat.subcategories.length} subcategories · {totalSubItems} items</div>
                    </div>
                    <span style={{ color:'#9CA3AF', fontSize:16, flexShrink:0, marginTop:2 }}>{isOpen ? '▾' : '▸'}</span>
                  </div>
                  <div style={{ display:'flex', gap:4, flexShrink:0, marginTop:2 }}>
                    <button title="Edit category" onClick={() => open('editCat', { id:cat.id, no:cat.no, name:cat.name, description:cat.description||'' })}
                      style={{ background:'#F0F9FF', border:'1px solid #BAE6FD', borderRadius:6, color:'#0369A1', padding:'3px 8px', fontSize:11.5, cursor:'pointer' }}>✎</button>
                    <button title="Delete category" onClick={() => del('cat', cat.id, cat.name)}
                      style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:6, color:'#DC2626', padding:'3px 8px', fontSize:11.5, cursor:'pointer' }}>✕</button>
                  </div>
                </div>

                {/* Subcategories */}
                {isOpen && (
                  <div style={{ padding:'12px 18px 16px 18px', borderTop:'1.5px solid #F3F5FA', background:'#FAFBFD' }}>
                    {cat.subcategories.map(sub => (
                      <div key={sub.id} style={{ marginBottom:14, background:'#fff', borderRadius:10, border:'1px solid #F0F3FA', padding:'10px 14px' }}>
                        <div style={{ fontSize:12.5, fontWeight:700, color:'#374151', marginBottom:7, display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontFamily:'monospace', fontSize:11, color:'#9CA3AF', background:'#F3F4F6', padding:'1px 6px', borderRadius:4 }}>{sub.no}</span>
                          <span style={{ flex:1 }}>{sub.name}</span>
                          <div style={{ display:'flex', gap:4 }}>
                            <button title="Edit subcategory" onClick={() => open('editSub', { id:sub.id, no:sub.no, name:sub.name })}
                              style={{ background:'#F0F9FF', border:'1px solid #BAE6FD', borderRadius:5, color:'#0369A1', padding:'2px 7px', fontSize:10.5, cursor:'pointer' }}>✎</button>
                            <button title="Add item" onClick={() => open('addItem', { subcategory_id:sub.id, no:'', name:'', added_by:'' })}
                              style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:5, color:'#16A34A', padding:'2px 7px', fontSize:10.5, cursor:'pointer' }}>+ Item</button>
                            <button title="Delete subcategory" onClick={() => del('sub', sub.id, sub.name)}
                              style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:5, color:'#DC2626', padding:'2px 7px', fontSize:10.5, cursor:'pointer' }}>✕</button>
                          </div>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5, paddingLeft:4 }}>
                          {sub.items.length === 0
                            ? <span style={{ fontSize:11.5, color:'#CBD5E1', fontStyle:'italic' }}>No items yet — click + Item to add</span>
                            : sub.items.map(item => (
                              <div key={item.id} style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#F8FAFC', border:'1px solid #E9EDF5', padding:'3px 8px', borderRadius:20, fontSize:11.5 }}>
                                <span style={{ fontFamily:'monospace', fontSize:10, color:'#9CA3AF' }}>{item.no}</span>
                                <span style={{ color:'#374151' }}>{item.name}</span>
                                <button title="Edit item" onClick={() => open('editItem', { id:item.id, no:item.no, name:item.name })}
                                  style={{ background:'none', border:'none', cursor:'pointer', color:'#93C5FD', fontSize:10, padding:'0 1px', lineHeight:1 }}>✎</button>
                                <button title="Delete item" onClick={() => del('item', item.id, item.name)}
                                  style={{ background:'none', border:'none', cursor:'pointer', color:'#FCA5A5', fontSize:10, padding:'0 1px', lineHeight:1 }}>✕</button>
                              </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => open('addSub', { category_id:cat.id, no:'', name:'' })}
                      style={{ marginTop:4, background:'#F8FAFC', border:'1.5px dashed #D1D5DB', borderRadius:9, color:'#6B7280', padding:'7px 16px', fontSize:12.5, cursor:'pointer', width:'100%', fontFamily:'inherit' }}>
                      + Add Subcategory
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Universal modal */}
      {modal && (
        <Modal title={modalTitle[modal.type]} onClose={close}>
          {(modal.type === 'addCat' || modal.type === 'editCat') && (
            <>
              <Field label="Category No *" value={form.no||''} onChange={v => setForm(f => ({ ...f, no:v }))} placeholder="e.g. 11" />
              <Field label="Category Name *" value={form.name||''} onChange={v => setForm(f => ({ ...f, name:v }))} placeholder="e.g. Environmental Impact" />
              <Field label="Description" value={form.description||''} onChange={v => setForm(f => ({ ...f, description:v }))} placeholder="Describe this defect type…" multiline />
              {modal.type === 'addCat' && <Field label="Added By" value={form.added_by||''} onChange={v => setForm(f => ({ ...f, added_by:v }))} placeholder="Your name" />}
            </>
          )}
          {(modal.type === 'addSub' || modal.type === 'editSub') && (
            <>
              <Field label="Subcategory No *" value={form.no||''} onChange={v => setForm(f => ({ ...f, no:v }))} placeholder="e.g. 1.3" />
              <Field label="Subcategory Name *" value={form.name||''} onChange={v => setForm(f => ({ ...f, name:v }))} placeholder="e.g. Structural Load" />
            </>
          )}
          {(modal.type === 'addItem' || modal.type === 'editItem') && (
            <>
              <Field label="Item No *" value={form.no||''} onChange={v => setForm(f => ({ ...f, no:v }))} placeholder="e.g. 1.3.1" />
              <Field label="Item Name *" value={form.name||''} onChange={v => setForm(f => ({ ...f, name:v }))} placeholder="e.g. Missing deflection check" />
              {modal.type === 'addItem' && <Field label="Added By" value={form.added_by||''} onChange={v => setForm(f => ({ ...f, added_by:v }))} placeholder="Your name" />}
            </>
          )}
          <ModalBtns onCancel={close} onSave={save} saving={saving} />
        </Modal>
      )}
    </div>
  )
}
