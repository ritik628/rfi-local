import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { aiChat } from '../services/api'

const QUICK = [
  { icon:'📊', label:'Top Patterns', text:'What are the top recurring design defect patterns? Which categories appear most frequently?' },
  { icon:'🚨', label:'Risk Priority', text:'Which open RFIs pose the highest risk? Rank by severity, category, and urgency.' },
  { icon:'🔍', label:'Discipline Issues', text:'Which discipline has the most unresolved RFIs? What are the common themes and root causes?' },
  { icon:'💡', label:'Process Improvements', text:'Based on the RFI patterns, what design process improvements would prevent the most common defect categories?' },
  { icon:'📉', label:'Unclassified RFIs', text:'Some RFIs are unclassified. What are the likely reasons? What should I check in the descriptions?' },
]

function SobhaAvatar() {
  const [failed, setFailed] = useState(false)
  return (
    <div style={{ width:32, height:32, borderRadius:10, background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden', position:'relative', marginTop:2 }}>
      {!failed
        ? <img src="/sobha-logo.png" alt="AI" onError={() => setFailed(true)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        : <span style={{ fontSize:16, fontWeight:900, color:'#C9A84C', fontFamily:'Georgia,serif', lineHeight:1 }}>S</span>
      }
    </div>
  )
}

const STORAGE_KEY = (pid) => `rfi_chat_${pid}`

const INIT_MSG = {
  role:'assistant',
  content:"👋 I'm your RFI Intelligence Agent, powered by Sobha's design defect data.\n\nI have full context on all your project's classified RFIs — categories, disciplines, severity distribution, and more.\n\nAsk me about patterns, risk priorities, recurring issues, or what process changes would reduce design defects. Use the quick prompts above or type your own question."
}

export default function AIAgentPage() {
  const { projectId } = useParams()
  const storageKey = STORAGE_KEY(projectId)

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : [INIT_MSG]
    } catch { return [INIT_MSG] }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const endRef = useRef(null)
  const recognitionRef = useRef(null)

  // Persist conversation to sessionStorage
  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(messages)) } catch {}
  }, [messages, storageKey])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const send = useCallback(async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    const next = [...messages, { role:'user', content:msg }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await aiChat(projectId, next)
      setMessages(prev => [...prev, { role:'assistant', content:res.reply }])
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'⚠️ Connection error. Check the backend is running and Azure credentials are set.' }])
    }
    setLoading(false)
  }, [input, loading, messages, projectId])

  const clearHistory = () => {
    setMessages([INIT_MSG])
    try { sessionStorage.removeItem(storageKey) } catch {}
  }

  // Voice input via Web Speech API
  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return toast && toast.error ? null : alert('Voice not supported in this browser')

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => prev + (prev ? ' ' : '') + transcript)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.start()
    recognitionRef.current = rec
    setListening(true)
  }

  const voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'#F4F6FA' }}>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display:'flex', alignItems:'center', gap:9 }}>
            <SobhaAvatar /> AI Agent
          </div>
          <div className="page-sub">Ask about patterns, priorities, and process improvements</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:20, padding:'5px 14px' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#10B981' }} />
            <span style={{ fontSize:12, color:'#059669', fontWeight:600 }}>GPT-5.2 / 5.4 Connected</span>
          </div>
          <button onClick={clearHistory} style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:9, color:'#DC2626', padding:'6px 12px', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
            Clear Chat
          </button>
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ padding:'12px 28px', background:'#fff', borderBottom:'1px solid #E9EDF5', display:'flex', gap:8, flexWrap:'wrap' }}>
        {QUICK.map(p => (
          <button key={p.label} onClick={() => send(p.text)} style={{ background:'#F8FAFF', color:'#374151', border:'1.5px solid #E9EDF5', borderRadius:20, padding:'6px 14px', fontSize:12.5, fontWeight:500, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#EFF6FF'; e.currentTarget.style.borderColor='#BFDBFE'; e.currentTarget.style.color='#1D4ED8' }}
            onMouseLeave={e => { e.currentTarget.style.background='#F8FAFF'; e.currentTarget.style.borderColor='#E9EDF5'; e.currentTarget.style.color='#374151' }}>
            <span>{p.icon}</span> {p.label}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 28px', display:'flex', flexDirection:'column', gap:16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', gap:10 }}>
            {m.role === 'assistant' && <SobhaAvatar />}
            <div style={{
              maxWidth:'76%', padding:'13px 17px', borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',
              background:m.role==='user'?'#1D4ED8':'#fff',
              border:m.role==='assistant'?'1.5px solid #E9EDF5':'none',
              color:m.role==='user'?'#fff':'#374151',
              fontSize:13.5, lineHeight:1.7, whiteSpace:'pre-wrap',
              boxShadow:m.role==='assistant'?'0 2px 8px rgba(0,0,0,0.05)':undefined
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', gap:10 }}>
            <SobhaAvatar />
            <div style={{ background:'#fff', border:'1.5px solid #E9EDF5', borderRadius:'16px 16px 16px 4px', padding:'13px 17px', display:'flex', gap:5, alignItems:'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#CBD5E1', animation:`pulse 1.2s ${i*0.2}s ease-in-out infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input row */}
      <div style={{ padding:'14px 28px', borderTop:'1px solid #E9EDF5', background:'#fff', display:'flex', gap:10, alignItems:'center' }}>
        <div style={{ flex:1, position:'relative' }}>
          <input className="input" placeholder="Ask about RFI patterns, risks, discipline issues, or process improvements…"
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()} />
        </div>
        {voiceSupported && (
          <button onClick={toggleVoice} title={listening ? 'Stop listening' : 'Voice input'}
            style={{ width:40, height:40, borderRadius:10, border:`1.5px solid ${listening?'#EF4444':'#E5E7EB'}`, background:listening?'#FEF2F2':'#F8FAFC', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, transition:'all 0.15s' }}>
            {listening ? '⏹' : '🎤'}
          </button>
        )}
        <button className="btn-primary" onClick={() => send()} disabled={loading} style={{ flexShrink:0 }}>Send →</button>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.35;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
