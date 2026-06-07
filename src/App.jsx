import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

// ── Brand colors (matches EHR) ─────────────────────────────
const C = {
  p50:'#faf5ff',p100:'#f3e8ff',p200:'#e9d5ff',p300:'#d8b4fe',
  p400:'#c084fc',p500:'#a855f7',p600:'#9333ea',p700:'#7e22ce',
  p800:'#6b21a8',p900:'#581c87',
  g50:'#f9fafb',g100:'#f3f4f6',g200:'#e5e7eb',g300:'#d1d5db',
  g400:'#9ca3af',g500:'#6b7280',g600:'#4b5563',g700:'#374151',
  g800:'#1f2937',g900:'#111827',
  gr50:'#f0fdf4',gr100:'#dcfce7',gr500:'#22c55e',gr600:'#16a34a',gr700:'#15803d',
  r50:'#fff1f2',r100:'#ffe4e6',r500:'#ef4444',r600:'#dc2626',r700:'#b91c1c',
  a50:'#fffbeb',a100:'#fef3c7',a500:'#f59e0b',a600:'#d97706',
  b50:'#eff6ff',b100:'#dbeafe',b500:'#3b82f6',b600:'#2563eb',
  w:'#ffffff',
}

const TODAY = new Date().toISOString().slice(0,10)

// ── Tiny helpers ───────────────────────────────────────────
const ptName = p => p ? `${p.fn||''} ${p.ln||''}`.trim() : ''
const fmtDate = d => {
  if (!d) return '—'
  try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }
  catch { return d }
}
const fmtTime = t => {
  if (!t) return ''
  const [h,m] = t.split(':')
  const hr = parseInt(h)
  return `${hr > 12 ? hr-12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}
const age = dob => {
  if (!dob) return ''
  const d = new Date(dob), n = new Date()
  let a = n.getFullYear() - d.getFullYear()
  if (n.getMonth() < d.getMonth() || (n.getMonth()===d.getMonth()&&n.getDate()<d.getDate())) a--
  return a
}

// ── UI primitives ──────────────────────────────────────────
function Card({ children, style }) {
  return <div style={{ background:C.w, borderRadius:16, border:`1px solid ${C.g200}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', ...style }}>{children}</div>
}

function Btn({ children, onClick, v='primary', style, disabled, size='md' }) {
  const base = { display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6, borderRadius:10, fontWeight:700, cursor:disabled?'not-allowed':'pointer', border:'none', transition:'all 0.15s', fontSize: size==='sm'?13:15, padding: size==='sm'?'7px 14px':'11px 22px', opacity:disabled?0.5:1 }
  const variants = {
    primary:   { background:`linear-gradient(135deg,${C.p700},${C.p500})`, color:C.w, boxShadow:`0 2px 8px ${C.p400}55` },
    secondary: { background:C.g100, color:C.g700, border:`1px solid ${C.g200}` },
    ghost:     { background:'transparent', color:C.p600, border:`1px solid ${C.p200}` },
    danger:    { background:C.r500, color:C.w },
    success:   { background:C.gr600, color:C.w },
  }
  return <button onClick={disabled?undefined:onClick} style={{...base,...variants[v],...style}}>{children}</button>
}

function Inp({ value, onChange, type='text', placeholder, style, required, min, max }) {
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} min={min} max={max}
    style={{ width:'100%', padding:'10px 13px', borderRadius:9, border:`1.5px solid ${C.g200}`, fontSize:14, color:C.g800, background:C.w, outline:'none', boxSizing:'border-box', ...style }}
  />
}

function Sel({ value, onChange, options, style }) {
  return <select value={value} onChange={e=>onChange(e.target.value)}
    style={{ width:'100%', padding:'10px 13px', borderRadius:9, border:`1.5px solid ${C.g200}`, fontSize:14, color:C.g800, background:C.w, outline:'none', boxSizing:'border-box', ...style }}>
    {options.map(o => typeof o==='string' ? <option key={o} value={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
}

function FF({ label, children, required }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    <label style={{ fontSize:12, fontWeight:700, color:C.g500, textTransform:'uppercase', letterSpacing:0.6 }}>{label}{required&&<span style={{color:C.r500}}> *</span>}</label>
    {children}
  </div>
}

function Badge({ label, color='gray' }) {
  const cols = {
    gray:   { bg:C.g100, text:C.g600 },
    purple: { bg:C.p100, text:C.p700 },
    green:  { bg:C.gr100, text:C.gr700 },
    red:    { bg:C.r100, text:C.r700 },
    amber:  { bg:C.a100, text:C.a600 },
    blue:   { bg:C.b100, text:C.b600 },
  }
  const s = cols[color] || cols.gray
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.text }}>{label}</span>
}

function Spinner() {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
    <div style={{ width:32, height:32, borderRadius:'50%', border:`3px solid ${C.p200}`, borderTopColor:C.p600, animation:'spin 0.8s linear infinite' }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
}

function EmptyState({ icon, title, sub }) {
  return <div style={{ textAlign:'center', padding:'40px 20px' }}>
    <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
    <p style={{ fontSize:15, fontWeight:700, color:C.g700, marginBottom:4 }}>{title}</p>
    <p style={{ fontSize:13, color:C.g400 }}>{sub}</p>
  </div>
}

// Status colors for appointments
const SC = { Scheduled:C.b500, 'Checked In':C.gr500, Completed:C.gr700, Cancelled:C.g400, 'No-Show':C.r500, Requested:C.a500 }
const SBC = { Scheduled:'blue', 'Checked In':'green', Completed:'green', Cancelled:'gray', 'No-Show':'red', Requested:'amber' }

// ── Login Screen ───────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'magic' | 'register'
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null) // {type:'error'|'success', text}

  const handleLogin = async e => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg({ type:'error', text: error.message })
    setLoading(false)
  }

  const handleMagic = async e => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo: window.location.origin } })
    if (error) setMsg({ type:'error', text: error.message })
    else setMsg({ type:'success', text:`Check your inbox at ${email} — we sent a login link.` })
    setLoading(false)
  }

  const handleRegister = async e => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signUp({ email, password, options:{ emailRedirectTo: window.location.origin } })
    if (error) setMsg({ type:'error', text: error.message })
    else setMsg({ type:'success', text:'Account created. Check your email to confirm your address, then log in.' })
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100svh', background:`linear-gradient(160deg,${C.p900} 0%,${C.p600} 40%,${C.p400} 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        {/* Logo / Brand */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, borderRadius:18, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', border:'1.5px solid rgba(255,255,255,0.3)', marginBottom:16 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 style={{ color:C.w, fontSize:24, fontWeight:800, margin:0, letterSpacing:-0.5 }}>Cowboy Healthcare</h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14, marginTop:4 }}>Patient Portal</p>
        </div>

        <Card style={{ padding:'28px 24px' }}>
          {mode === 'login' && (
            <>
              <h2 style={{ fontSize:18, fontWeight:800, color:C.g800, margin:'0 0 20px' }}>Sign In</h2>
              <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <FF label="Email" required><Inp type="email" value={email} onChange={setEmail} placeholder="your@email.com" required/></FF>
                <FF label="Password" required><Inp type="password" value={password} onChange={setPassword} placeholder="Password" required/></FF>
                {msg && <div style={{ padding:'10px 13px', borderRadius:9, background:msg.type==='error'?C.r50:C.gr50, color:msg.type==='error'?C.r700:C.gr700, fontSize:13, fontWeight:600 }}>{msg.text}</div>}
                <Btn style={{ width:'100%', marginTop:4 }} disabled={loading}>{loading?'Signing in…':'Sign In'}</Btn>
              </form>
              <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:10, borderTop:`1px solid ${C.g100}`, paddingTop:16 }}>
                <button onClick={()=>{setMode('magic');setMsg(null)}} style={{ background:'none', border:'none', color:C.p600, fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'center' }}>Email me a login link instead</button>
                <button onClick={()=>{setMode('register');setMsg(null)}} style={{ background:'none', border:'none', color:C.g500, fontSize:13, cursor:'pointer', textAlign:'center' }}>New patient? Create an account</button>
              </div>
            </>
          )}

          {mode === 'magic' && (
            <>
              <h2 style={{ fontSize:18, fontWeight:800, color:C.g800, margin:'0 0 8px' }}>Email Login Link</h2>
              <p style={{ fontSize:13, color:C.g500, marginBottom:20 }}>We will send a secure link to your inbox. No password needed.</p>
              <form onSubmit={handleMagic} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <FF label="Email" required><Inp type="email" value={email} onChange={setEmail} placeholder="your@email.com" required/></FF>
                {msg && <div style={{ padding:'10px 13px', borderRadius:9, background:msg.type==='error'?C.r50:C.gr50, color:msg.type==='error'?C.r700:C.gr700, fontSize:13, fontWeight:600 }}>{msg.text}</div>}
                <Btn style={{ width:'100%' }} disabled={loading}>{loading?'Sending…':'Send Login Link'}</Btn>
              </form>
              <button onClick={()=>{setMode('login');setMsg(null)}} style={{ display:'block', marginTop:16, background:'none', border:'none', color:C.g500, fontSize:13, cursor:'pointer', width:'100%', textAlign:'center' }}>Back to sign in</button>
            </>
          )}

          {mode === 'register' && (
            <>
              <h2 style={{ fontSize:18, fontWeight:800, color:C.g800, margin:'0 0 8px' }}>Create Account</h2>
              <p style={{ fontSize:13, color:C.g500, marginBottom:20 }}>Use the same email your clinic has on file for you.</p>
              <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <FF label="Email" required><Inp type="email" value={email} onChange={setEmail} placeholder="your@email.com" required/></FF>
                <FF label="Password" required><Inp type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" required/></FF>
                {msg && <div style={{ padding:'10px 13px', borderRadius:9, background:msg.type==='error'?C.r50:C.gr50, color:msg.type==='error'?C.r700:C.gr700, fontSize:13, fontWeight:600 }}>{msg.text}</div>}
                <Btn style={{ width:'100%' }} disabled={loading}>{loading?'Creating…':'Create Account'}</Btn>
              </form>
              <button onClick={()=>{setMode('login');setMsg(null)}} style={{ display:'block', marginTop:16, background:'none', border:'none', color:C.g500, fontSize:13, cursor:'pointer', width:'100%', textAlign:'center' }}>Already have an account? Sign in</button>
            </>
          )}
        </Card>

        <p style={{ textAlign:'center', color:'rgba(255,255,255,0.5)', fontSize:11, marginTop:20 }}>
          HIPAA-compliant · Your data is private and secure
        </p>
      </div>
    </div>
  )
}

// ── Home / Dashboard ───────────────────────────────────────
function HomeView({ patient, appts, messages, notes, hep, onNav }) {
  const upcoming = appts
    .filter(a => a.date >= TODAY && a.status !== 'Cancelled' && a.status !== 'No-Show')
    .sort((a,b) => a.date.localeCompare(b.date))
  const next = upcoming[0]
  const unreadMsgs = messages.filter(m => m.sender !== 'patient' && !m.read_by_patient).length
  const recentNote = notes.filter(n => n.signed).sort((a,b) => b.date.localeCompare(a.date))[0]
  const activeHep = hep.length > 0

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Welcome header */}
      <div style={{ background:`linear-gradient(135deg,${C.p900},${C.p600})`, borderRadius:18, padding:'22px 22px 20px', color:C.w }}>
        <p style={{ fontSize:13, opacity:0.75, marginBottom:4 }}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
        <h2 style={{ fontSize:22, fontWeight:800, margin:'0 0 14px', letterSpacing:-0.4 }}>Hello, {patient?.fn || 'there'}</h2>
        {next ? (
          <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:12, padding:'12px 16px', border:'1px solid rgba(255,255,255,0.2)' }}>
            <p style={{ fontSize:11, fontWeight:700, opacity:0.75, textTransform:'uppercase', letterSpacing:0.7, marginBottom:6 }}>Next Appointment</p>
            <p style={{ fontSize:16, fontWeight:800, marginBottom:2 }}>{fmtDate(next.date)} at {fmtTime(next.time)}</p>
            <p style={{ fontSize:13, opacity:0.8 }}>{next.type} with {next.provider}</p>
          </div>
        ) : (
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', border:'1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ fontSize:13, opacity:0.75 }}>No upcoming appointments scheduled.</p>
            <button onClick={()=>onNav('appointments')} style={{ marginTop:8, background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8, color:C.w, fontSize:13, fontWeight:700, padding:'6px 14px', cursor:'pointer' }}>Request an Appointment</button>
          </div>
        )}
      </div>

      {/* Quick action tiles */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[
          { label:'Appointments', sub:`${upcoming.length} upcoming`, icon:'📅', view:'appointments', color:C.b50, accent:C.b600 },
          { label:'Messages', sub: unreadMsgs > 0 ? `${unreadMsgs} unread` : 'Clinic messages', icon:'💬', view:'messages', color:unreadMsgs>0?C.a50:C.g50, accent:unreadMsgs>0?C.a600:C.g600, badge:unreadMsgs||null },
          { label:'My Health', sub:'Conditions & meds', icon:'🩺', view:'health', color:C.p50, accent:C.p700 },
          { label:'Exercises', sub: activeHep ? `${hep.length} assigned` : 'Home program', icon:'🏃', view:'hep', color:C.gr50, accent:C.gr700 },
        ].map(t => (
          <Card key={t.view} style={{ padding:'16px 14px', cursor:'pointer', position:'relative', background:t.color, border:`1px solid ${t.accent}22` }} onClick={()=>onNav(t.view)}>
            {t.badge ? <span style={{ position:'absolute', top:10, right:10, background:C.r500, color:C.w, borderRadius:10, fontSize:11, fontWeight:800, padding:'2px 7px' }}>{t.badge}</span> : null}
            <div style={{ fontSize:28, marginBottom:8 }}>{t.icon}</div>
            <p style={{ fontSize:14, fontWeight:800, color:t.accent, marginBottom:2 }}>{t.label}</p>
            <p style={{ fontSize:12, color:C.g500 }}>{t.sub}</p>
          </Card>
        ))}
      </div>

      {/* Recent note */}
      {recentNote && (
        <Card style={{ padding:'16px 18px' }}>
          <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7, color:C.g400, marginBottom:10 }}>Last Visit Note</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <p style={{ fontSize:14, fontWeight:700, color:C.g800 }}>{fmtDate(recentNote.date)}</p>
            <Badge label="Signed" color="green"/>
          </div>
          {recentNote.assessment && <p style={{ fontSize:13, color:C.g600, lineHeight:1.6 }}>{recentNote.assessment.slice(0,160)}{recentNote.assessment.length>160?'…':''}</p>}
          <button onClick={()=>onNav('notes')} style={{ marginTop:12, background:'none', border:'none', color:C.p600, fontSize:13, fontWeight:700, cursor:'pointer', padding:0 }}>View all visit notes →</button>
        </Card>
      )}
    </div>
  )
}

// ── Appointments ───────────────────────────────────────────
function AppointmentsView({ patient, appts, setAppts, clinicId }) {
  const [tab, setTab] = useState('upcoming')
  const [requesting, setRequesting] = useState(false)
  const [form, setForm] = useState({ date:'', time:'09:00', type:'Follow-up', notes:'' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const f = k => v => setForm(p => ({...p,[k]:v}))

  const upcoming = appts.filter(a => a.date >= TODAY && a.status !== 'Cancelled' && a.status !== 'No-Show').sort((a,b)=>a.date.localeCompare(b.date))
  const past = appts.filter(a => a.date < TODAY || a.status === 'Cancelled' || a.status === 'No-Show').sort((a,b)=>b.date.localeCompare(a.date))

  const submitRequest = async e => {
    e.preventDefault()
    if (!form.date) return
    setSaving(true)
    const rec = {
      id: `APT-${Date.now()}`,
      pid: patient.id,
      clinic_id: clinicId,
      date: form.date,
      time: form.time,
      type: form.type,
      status: 'Requested',
      cc: form.notes,
      provider: '',
      duration: 60,
    }
    await supabase.from('appointments').upsert({ id:rec.id, clinic_id:clinicId, data:rec })
    setAppts(p => [rec, ...p])
    setSaving(false); setSuccess(true); setRequesting(false)
    setForm({ date:'', time:'09:00', type:'Follow-up', notes:'' })
    setTimeout(()=>setSuccess(false), 4000)
  }

  const ApptCard = ({ a }) => (
    <Card style={{ padding:'14px 16px', marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <p style={{ fontSize:15, fontWeight:800, color:C.g800, marginBottom:3 }}>{fmtDate(a.date)}{a.time ? ` at ${fmtTime(a.time)}` : ''}</p>
          <p style={{ fontSize:13, color:C.g600, marginBottom:4 }}>{a.type}{a.provider ? ` · ${a.provider}` : ''}</p>
          {a.cc && <p style={{ fontSize:12, color:C.g400 }}>{a.cc}</p>}
        </div>
        <Badge label={a.status} color={SBC[a.status]||'gray'}/>
      </div>
      {a.cancelReason && <p style={{ marginTop:8, fontSize:12, color:C.g400, fontStyle:'italic' }}>Reason: {a.cancelReason}</p>}
    </Card>
  )

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:C.g800, margin:0 }}>Appointments</h2>
        <Btn size="sm" onClick={()=>setRequesting(true)}>Request</Btn>
      </div>

      {success && <div style={{ background:C.gr50, border:`1px solid ${C.gr500}`, borderRadius:10, padding:'10px 14px', fontSize:13, color:C.gr700, fontWeight:600, marginBottom:14 }}>Appointment request submitted. Your clinic will confirm shortly.</div>}

      {requesting && (
        <Card style={{ padding:'18px 16px', marginBottom:16, border:`1.5px solid ${C.p200}` }}>
          <p style={{ fontSize:15, fontWeight:800, color:C.p700, marginBottom:14 }}>Request an Appointment</p>
          <form onSubmit={submitRequest} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <FF label="Preferred Date" required><Inp type="date" value={form.date} onChange={f('date')} min={TODAY} required/></FF>
              <FF label="Preferred Time"><Inp type="time" value={form.time} onChange={f('time')}/></FF>
            </div>
            <FF label="Visit Type">
              <Sel value={form.type} onChange={f('type')} options={['Initial Evaluation','Follow-up','Re-evaluation','Discharge','Telehealth']}/>
            </FF>
            <FF label="Notes for Clinic"><Inp value={form.notes} onChange={f('notes')} placeholder="Reason for visit, concerns…"/></FF>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <Btn v="secondary" size="sm" onClick={()=>setRequesting(false)}>Cancel</Btn>
              <Btn size="sm" disabled={saving}>{saving?'Submitting…':'Submit Request'}</Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${C.g200}`, marginBottom:16 }}>
        {['upcoming','past'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:'10px 0', fontSize:13, fontWeight:700, border:'none', background:'transparent', color:tab===t?C.p600:C.g400, borderBottom:tab===t?`2px solid ${C.p500}`:'2px solid transparent', cursor:'pointer', textTransform:'capitalize' }}>{t} ({(t==='upcoming'?upcoming:past).length})</button>
        ))}
      </div>

      {tab==='upcoming' && (upcoming.length === 0
        ? <EmptyState icon="📅" title="No upcoming appointments" sub="Request one using the button above."/>
        : upcoming.map(a => <ApptCard key={a.id} a={a}/>)
      )}
      {tab==='past' && (past.length === 0
        ? <EmptyState icon="📋" title="No past appointments" sub="Your visit history will appear here."/>
        : past.slice(0,20).map(a => <ApptCard key={a.id} a={a}/>)
      )}
    </div>
  )
}

// ── Visit Notes ────────────────────────────────────────────
function NotesView({ notes }) {
  const [open, setOpen] = useState(null)
  const signed = notes.filter(n => n.signed).sort((a,b)=>b.date.localeCompare(a.date))

  if (signed.length === 0) return <EmptyState icon="📝" title="No visit notes yet" sub="Signed notes from your therapist will appear here after each visit."/>

  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.g800, margin:'0 0 16px' }}>Visit Notes</h2>
      {signed.map(n => (
        <Card key={n.id} style={{ marginBottom:10, overflow:'hidden' }}>
          <button onClick={()=>setOpen(open===n.id?null:n.id)} style={{ width:'100%', background:'none', border:'none', padding:'14px 16px', textAlign:'left', cursor:'pointer' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:C.g800, marginBottom:2 }}>{fmtDate(n.date)}</p>
                <p style={{ fontSize:12, color:C.g500 }}>{n.provider || 'Physical Therapist'}</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Badge label="Signed" color="green"/>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.g400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform:open===n.id?'rotate(180deg)':'none', transition:'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </button>
          {open===n.id && (
            <div style={{ padding:'0 16px 16px', borderTop:`1px solid ${C.g100}` }}>
              {[['Subjective',n.subjective],['Objective',n.objective],['Assessment',n.assessment],['Plan',n.plan]].filter(([,v])=>v).map(([lbl,val])=>(
                <div key={lbl} style={{ marginTop:12 }}>
                  <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:0.7, color:C.p600, marginBottom:4 }}>{lbl}</p>
                  <p style={{ fontSize:13, color:C.g600, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{val}</p>
                </div>
              ))}
              {n.signedBy && <p style={{ marginTop:12, fontSize:11, color:C.g400, fontStyle:'italic' }}>Electronically signed by {n.signedBy}</p>}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

// ── My Health ─────────────────────────────────────────────
function HealthView({ patient, meds }) {
  const activeMeds = meds.filter(m => m.status === 'Active')
  const problems = patient?.problems || []
  const allergies = patient?.allergies || []

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.g800, margin:0 }}>My Health</h2>

      {/* Problem list */}
      <Card style={{ padding:'16px 18px' }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7, color:C.g400, marginBottom:12 }}>Conditions / Diagnoses</p>
        {problems.length === 0
          ? <p style={{ fontSize:13, color:C.g400 }}>No conditions recorded by your clinic yet.</p>
          : problems.map((pr,i) => (
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderBottom:i<problems.length-1?`1px solid ${C.g100}`:'none' }}>
              {pr.code && <span style={{ background:C.p100, color:C.p700, borderRadius:6, fontSize:11, fontWeight:800, padding:'3px 8px', flexShrink:0 }}>{pr.code}</span>}
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:C.g800 }}>{pr.desc}</p>
                {pr.onset && <p style={{ fontSize:11, color:C.g400 }}>Since {pr.onset}</p>}
              </div>
            </div>
          ))
        }
      </Card>

      {/* Allergies */}
      <Card style={{ padding:'16px 18px' }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7, color:C.g400, marginBottom:12 }}>Allergies</p>
        {allergies.length === 0
          ? <p style={{ fontSize:13, fontWeight:700, color:C.gr600 }}>No Known Drug Allergies (NKDA)</p>
          : allergies.map((a,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<allergies.length-1?`1px solid ${C.g100}`:'none' }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.r700 }}>{a.drug}</p>
              <p style={{ fontSize:12, color:C.g500 }}>{a.reaction}</p>
            </div>
          ))
        }
      </Card>

      {/* Medications */}
      <Card style={{ padding:'16px 18px' }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7, color:C.g400, marginBottom:12 }}>Active Medications</p>
        {activeMeds.length === 0
          ? <p style={{ fontSize:13, color:C.g400 }}>No active medications on file.</p>
          : activeMeds.map((m,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8px 0', borderBottom:i<activeMeds.length-1?`1px solid ${C.g100}`:'none' }}>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:C.g800 }}>{m.name} <span style={{ fontFamily:'monospace', color:C.p600, fontWeight:400 }}>{m.dose}</span></p>
                <p style={{ fontSize:11, color:C.g400 }}>{[m.route,m.freq].filter(Boolean).join(' · ')}</p>
              </div>
              <Badge label={m.status} color="green"/>
            </div>
          ))
        }
      </Card>

      {/* Basic info */}
      {patient && (
        <Card style={{ padding:'16px 18px' }}>
          <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7, color:C.g400, marginBottom:12 }}>My Information</p>
          {[
            ['Date of Birth', fmtDate(patient.dob)],
            ['Age', patient.dob ? `${age(patient.dob)} years` : '—'],
            ['Gender', patient.gender || '—'],
            ['MRN', patient.mrn || '—'],
            ['Insurance', patient.insurance || '—'],
          ].map(([lbl,val]) => (
            <div key={lbl} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${C.g100}` }}>
              <p style={{ fontSize:13, color:C.g500 }}>{lbl}</p>
              <p style={{ fontSize:13, fontWeight:600, color:C.g800 }}>{val}</p>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ── Home Exercise Program ──────────────────────────────────
function HepView({ hep }) {
  const [doneIds, setDoneIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('hep_done') || '[]')) } catch { return new Set() }
  })

  const toggleDone = id => {
    setDoneIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      try { localStorage.setItem('hep_done', JSON.stringify([...next])) } catch {}
      return next
    })
  }

  if (hep.length === 0) return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.g800, margin:'0 0 16px' }}>My Exercises</h2>
      <EmptyState icon="🏃" title="No exercises assigned yet" sub="Your therapist will add your home program after your evaluation."/>
    </div>
  )

  const done = [...doneIds].filter(id => hep.find(h=>h.id===id)).length
  const pct = Math.round((done / hep.length) * 100)

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:C.g800, margin:0 }}>My Exercises</h2>
        <span style={{ fontSize:13, fontWeight:700, color:pct===100?C.gr600:C.p600 }}>{done}/{hep.length} done</span>
      </div>

      {/* Progress bar */}
      <div style={{ background:C.g100, borderRadius:8, height:8, marginBottom:20, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:pct===100?C.gr500:C.p500, borderRadius:8, transition:'width 0.4s' }}/>
      </div>

      {pct===100 && (
        <div style={{ background:C.gr50, border:`1px solid ${C.gr500}`, borderRadius:12, padding:'12px 16px', marginBottom:16, textAlign:'center' }}>
          <p style={{ fontSize:14, fontWeight:800, color:C.gr700 }}>Great work! All exercises complete for today.</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {hep.map((ex,i) => {
          const done = doneIds.has(ex.id)
          return (
            <Card key={ex.id} style={{ padding:'14px 16px', opacity:done?0.7:1, border:done?`1.5px solid ${C.gr300}`:`1px solid ${C.g200}`, background:done?C.gr50:C.w }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <button onClick={()=>toggleDone(ex.id)} style={{ width:26, height:26, borderRadius:8, border:`2px solid ${done?C.gr500:C.g300}`, background:done?C.gr500:'transparent', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}>
                  {done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                    <p style={{ fontSize:14, fontWeight:800, color:done?C.gr700:C.g800, textDecoration:done?'line-through':'none' }}>{ex.name || `Exercise ${i+1}`}</p>
                    <div style={{ display:'flex', gap:6 }}>
                      {ex.sets && <Badge label={`${ex.sets} sets`} color="purple"/>}
                      {ex.reps && <Badge label={`${ex.reps} reps`} color="blue"/>}
                    </div>
                  </div>
                  {ex.instructions && <p style={{ fontSize:13, color:C.g500, lineHeight:1.6 }}>{ex.instructions}</p>}
                  {ex.frequency && <p style={{ fontSize:11, color:C.g400, marginTop:4 }}>{ex.frequency}</p>}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      <p style={{ fontSize:12, color:C.g400, textAlign:'center', marginTop:16 }}>Checkmarks reset each day. Tap each exercise when complete.</p>
    </div>
  )
}

// ── Messages ───────────────────────────────────────────────
function MessagesView({ patient, messages, setMessages, clinicId }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef()
  const sorted = [...messages].sort((a,b) => (a.created_at||'').localeCompare(b.created_at||''))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const send = async () => {
    if (!text.trim()) return
    setSending(true)
    const msg = {
      id: `MSG-${Date.now()}`,
      pid: patient.id,
      clinic_id: clinicId,
      sender: 'patient',
      content: text.trim(),
      created_at: new Date().toISOString(),
      read_by_patient: true,
    }
    await supabase.from('messages').upsert({ id:msg.id, clinic_id:clinicId, data:msg })
    setMessages(p => [...p, msg])
    setText('')
    setSending(false)
  }

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const fmtTs = ts => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' ' + d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 160px)' }}>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.g800, margin:'0 0 16px', flexShrink:0 }}>Messages</h2>

      {/* Thread */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, paddingBottom:8 }}>
        {sorted.length === 0 && (
          <EmptyState icon="💬" title="No messages yet" sub="Send a message to your clinic below."/>
        )}
        {sorted.map(m => {
          const isPatient = m.sender === 'patient'
          return (
            <div key={m.id} style={{ display:'flex', justifyContent:isPatient?'flex-end':'flex-start' }}>
              <div style={{ maxWidth:'80%' }}>
                {!isPatient && <p style={{ fontSize:11, color:C.g400, marginBottom:3, marginLeft:4 }}>{m.sender_name || 'Clinic'}</p>}
                <div style={{ padding:'10px 14px', borderRadius: isPatient?'16px 16px 4px 16px':'16px 16px 16px 4px', background:isPatient?`linear-gradient(135deg,${C.p700},${C.p500})`:C.g100, color:isPatient?C.w:C.g800, fontSize:14, lineHeight:1.5 }}>
                  {m.content}
                </div>
                <p style={{ fontSize:10, color:C.g400, marginTop:3, textAlign:isPatient?'right':'left', marginLeft:4, marginRight:4 }}>{fmtTs(m.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ flexShrink:0, display:'flex', gap:10, paddingTop:12, borderTop:`1px solid ${C.g200}` }}>
        <textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={handleKey} placeholder="Message your clinic…" rows={2}
          style={{ flex:1, padding:'10px 13px', borderRadius:12, border:`1.5px solid ${C.g200}`, fontSize:14, color:C.g800, resize:'none', outline:'none', fontFamily:'inherit', lineHeight:1.5 }}/>
        <Btn onClick={send} disabled={sending||!text.trim()} style={{ alignSelf:'flex-end', flexShrink:0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </Btn>
      </div>
    </div>
  )
}

// ── Profile ────────────────────────────────────────────────
function ProfileView({ patient, setPatients, clinicId, onSignOut }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ phone: patient?.phone||'', email: patient?.email||'', address: patient?.address||'', emergency_contact: patient?.emergency_contact||'', emergency_phone: patient?.emergency_phone||'' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const f = k => v => setForm(p=>({...p,[k]:v}))

  const save = async () => {
    setSaving(true)
    const updated = { ...patient, ...form }
    await supabase.from('patients').upsert({ id:patient.id, clinic_id:clinicId, data:{ ...updated, _cid:clinicId } })
    setPatients(p => p.map(x => x.id===patient.id ? updated : x))
    setSaving(false); setSaved(true); setEditing(false)
    setTimeout(()=>setSaved(false), 3000)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:C.g800, margin:0 }}>My Profile</h2>
        {!editing && <Btn size="sm" v="ghost" onClick={()=>setEditing(true)}>Edit</Btn>}
      </div>

      {saved && <div style={{ background:C.gr50, border:`1px solid ${C.gr500}`, borderRadius:10, padding:'10px 14px', fontSize:13, color:C.gr700, fontWeight:600 }}>Profile updated.</div>}

      {/* Avatar / name */}
      <Card style={{ padding:'20px 18px', textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg,${C.p700},${C.p400})`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', color:C.w, fontSize:26, fontWeight:800 }}>
          {patient ? `${(patient.fn||'')[0]||''}${(patient.ln||'')[0]||''}`.toUpperCase() : '?'}
        </div>
        <p style={{ fontSize:18, fontWeight:800, color:C.g800 }}>{ptName(patient)}</p>
        <p style={{ fontSize:13, color:C.g500 }}>MRN: {patient?.mrn || '—'}</p>
      </Card>

      <Card style={{ padding:'16px 18px' }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7, color:C.g400, marginBottom:14 }}>Contact Information</p>
        {editing ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <FF label="Phone"><Inp value={form.phone} onChange={f('phone')} placeholder="(555) 000-0000" type="tel"/></FF>
            <FF label="Email"><Inp value={form.email} onChange={f('email')} placeholder="your@email.com" type="email"/></FF>
            <FF label="Address"><Inp value={form.address} onChange={f('address')} placeholder="123 Main St, City, TX 00000"/></FF>
            <FF label="Emergency Contact Name"><Inp value={form.emergency_contact} onChange={f('emergency_contact')} placeholder="Full name"/></FF>
            <FF label="Emergency Contact Phone"><Inp value={form.emergency_phone} onChange={f('emergency_phone')} placeholder="(555) 000-0000" type="tel"/></FF>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
              <Btn v="secondary" size="sm" onClick={()=>setEditing(false)}>Cancel</Btn>
              <Btn size="sm" onClick={save} disabled={saving}>{saving?'Saving…':'Save Changes'}</Btn>
            </div>
          </div>
        ) : (
          <>
            {[
              ['Phone', patient?.phone || '—'],
              ['Email', patient?.email || '—'],
              ['Address', patient?.address || '—'],
              ['Emergency Contact', patient?.emergency_contact || '—'],
              ['Emergency Phone', patient?.emergency_phone || '—'],
            ].map(([lbl,val]) => (
              <div key={lbl} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${C.g100}` }}>
                <p style={{ fontSize:13, color:C.g500 }}>{lbl}</p>
                <p style={{ fontSize:13, fontWeight:600, color:C.g800 }}>{val}</p>
              </div>
            ))}
          </>
        )}
      </Card>

      <Btn v="secondary" onClick={onSignOut} style={{ width:'100%', marginTop:4 }}>Sign Out</Btn>
      <p style={{ fontSize:11, color:C.g400, textAlign:'center' }}>To update insurance, date of birth, or name, please contact your clinic directly.</p>
    </div>
  )
}

// ── Nav bar ────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:'home',         label:'Home',      icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id:'appointments', label:'Appts',     icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { id:'hep',          label:'Exercises', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
  { id:'messages',     label:'Messages',  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id:'profile',      label:'Profile',   icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

function BottomNav({ view, onNav, unreadCount }) {
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:C.w, borderTop:`1px solid ${C.g200}`, display:'flex', zIndex:100, paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
      {NAV_ITEMS.map(item => {
        const active = view === item.id
        const badge = item.id==='messages' && unreadCount > 0
        return (
          <button key={item.id} onClick={()=>onNav(item.id)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'8px 4px 6px', background:'none', border:'none', cursor:'pointer', color:active?C.p600:C.g400, position:'relative' }}>
            {badge && <span style={{ position:'absolute', top:6, right:'calc(50% - 14px)', background:C.r500, color:C.w, borderRadius:8, fontSize:10, fontWeight:800, padding:'1px 5px', minWidth:16, textAlign:'center' }}>{unreadCount}</span>}
            {item.icon}
            <span style={{ fontSize:10, fontWeight:700, marginTop:3, letterSpacing:0.2 }}>{item.label}</span>
            {active && <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:24, height:3, background:C.p500, borderRadius:2 }}/>}
          </button>
        )
      })}
    </nav>
  )
}

// ── Root App ───────────────────────────────────────────────
export default function App() {
  const [session,     setSession]     = useState(undefined) // undefined = loading, null = logged out
  const [patient,     setPatient]     = useState(null)
  const [appts,       setAppts]       = useState([])
  const [notes,       setNotes]       = useState([])
  const [meds,        setMeds]        = useState([])
  const [hep,         setHep]         = useState([])
  const [messages,    setMessages]    = useState([])
  const [patients,    setPatients]    = useState([]) // used only to update patient record
  const [dataLoading, setDataLoading] = useState(false)
  const [view,        setView]        = useState('home')

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data:{ session } }) => setSession(session))
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_,session) => {
      setSession(session)
      if (!session) { setPatient(null); setAppts([]); setNotes([]); setMeds([]); setHep([]); setMessages([]) }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load patient data when session is available
  useEffect(() => {
    if (!session?.user) return
    loadData(session.user.email)
  }, [session])

  const loadData = async email => {
    setDataLoading(true)
    try {
      // Match patient by email
      const { data: pData } = await supabase.from('patients').select('*')
      const allPatients = (pData || []).map(r => r.data ?? r).filter(r => !r.deleted)
      const pt = allPatients.find(p => p.email?.toLowerCase() === email?.toLowerCase())

      if (!pt) { setDataLoading(false); return }
      setPatient(pt)
      setPatients(allPatients)

      // Load all patient-specific data in parallel
      const [aData, nData, mData, hData, msgData] = await Promise.all([
        supabase.from('appointments').select('*').eq('clinic_id', pt.clinic_id || pt._cid),
        supabase.from('notes').select('*').eq('clinic_id', pt.clinic_id || pt._cid),
        supabase.from('medications').select('*').eq('clinic_id', pt.clinic_id || pt._cid),
        supabase.from('pt_hep').select('*').eq('clinic_id', pt.clinic_id || pt._cid),
        supabase.from('messages').select('*').eq('clinic_id', pt.clinic_id || pt._cid),
      ])

      const filterPt = (data) => (data||[]).map(r=>r.data??r).filter(r=>!r.deleted&&r.pid===pt.id)

      setAppts(filterPt(aData.data))
      setNotes(filterPt(nData.data))
      setMeds(filterPt(mData.data))
      setHep(filterPt(hData.data))
      setMessages(filterPt(msgData.data))
    } catch (e) {
      console.error('Portal data load error:', e)
    }
    setDataLoading(false)
  }

  const signOut = () => supabase.auth.signOut()

  // Still checking session
  if (session === undefined) return (
    <div style={{ minHeight:'100svh', display:'flex', alignItems:'center', justifyContent:'center', background:C.g50 }}>
      <Spinner/>
    </div>
  )

  // Not logged in
  if (!session) return <LoginScreen onLogin={()=>{}}/>

  // Logged in but no matching patient found
  if (!dataLoading && !patient) return (
    <div style={{ minHeight:'100svh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, background:C.g50, textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.g800, marginBottom:8 }}>No Patient Record Found</h2>
      <p style={{ fontSize:14, color:C.g500, maxWidth:320, lineHeight:1.6, marginBottom:24 }}>
        We could not find a patient record linked to <strong>{session.user?.email}</strong>. Please contact your clinic to make sure your account email matches what they have on file.
      </p>
      <Btn v="secondary" onClick={signOut}>Sign Out</Btn>
    </div>
  )

  // Loading data
  if (dataLoading) return (
    <div style={{ minHeight:'100svh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:C.g50 }}>
      <Spinner/>
      <p style={{ marginTop:14, fontSize:14, color:C.g400 }}>Loading your health information…</p>
    </div>
  )

  const clinicId = patient?.clinic_id || patient?._cid
  const unreadMessages = messages.filter(m => m.sender !== 'patient' && !m.read_by_patient).length

  const viewProps = { patient, clinicId }

  return (
    <div style={{ minHeight:'100svh', background:C.g50, paddingBottom:80 }}>
      {/* Top bar */}
      <div style={{ background:C.w, borderBottom:`1px solid ${C.g200}`, padding:'12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${C.p700},${C.p500})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:800, color:C.g800, lineHeight:1 }}>Cowboy Healthcare</p>
            <p style={{ fontSize:10, color:C.g400, lineHeight:1 }}>Patient Portal</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,${C.p700},${C.p400})`, display:'flex', alignItems:'center', justifyContent:'center', color:C.w, fontSize:13, fontWeight:800 }}>
            {`${(patient.fn||'')[0]||''}${(patient.ln||'')[0]||''}`.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth:640, margin:'0 auto', padding:'18px 16px' }}>
        {view === 'home'         && <HomeView patient={patient} appts={appts} messages={messages} notes={notes} hep={hep} onNav={setView}/>}
        {view === 'appointments' && <AppointmentsView {...viewProps} appts={appts} setAppts={setAppts}/>}
        {view === 'notes'        && <NotesView notes={notes}/>}
        {view === 'health'       && <HealthView patient={patient} meds={meds}/>}
        {view === 'hep'          && <HepView hep={hep}/>}
        {view === 'messages'     && <MessagesView {...viewProps} messages={messages} setMessages={setMessages}/>}
        {view === 'profile'      && <ProfileView {...viewProps} setPatients={setPatients} onSignOut={signOut}/>}
      </div>

      <BottomNav view={view} onNav={setView} unreadCount={unreadMessages}/>
    </div>
  )
}
