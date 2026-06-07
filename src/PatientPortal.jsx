import { useState, useEffect, useCallback, useRef, Component, useMemo } from "react";
import ReactDOM from "react-dom";
import { createClient } from "@supabase/supabase-js";

/* ── SUPABASE ─────────────────────────────────────────── */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* ── ERROR BOUNDARY ───────────────────────────────────── */
class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:24, fontFamily:"'DM Sans',sans-serif", gap:12 }}>
        <div style={{ fontSize:36 }}>⚠️</div>
        <p style={{ fontWeight:700, color:"#1f2937" }}>Something went wrong</p>
        <p style={{ fontSize:13, color:"#6b7280", textAlign:"center", maxWidth:320 }}>{this.state.err.message}</p>
        <button onClick={() => this.setState({ err: null })} style={{ padding:"8px 20px", background:"#7c3aed", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600 }}>Try Again</button>
      </div>
    );
    return this.props.children;
  }
}

/* ── DESIGN TOKENS ────────────────────────────────────── */
const C = {
  p900:"#3b0764", p800:"#4c1d95", p700:"#5b21b6", p600:"#6d28d9", p500:"#7c3aed",
  p400:"#8b5cf6", p300:"#a78bfa", p200:"#c4b5fd", p100:"#ede9fe", p50:"#f5f3ff",
  w:"#ffffff", bg:"#f8f7ff",
  g50:"#f9fafb", g100:"#f3f4f6", g200:"#e5e7eb", g300:"#d1d5db",
  g400:"#9ca3af", g500:"#6b7280", g600:"#4b5563", g700:"#374151", g800:"#1f2937",
  gr50:"#f0fdf4", gr100:"#dcfce7", gr500:"#22c55e", gr600:"#16a34a", gr700:"#15803d",
  r50:"#fff1f2", r100:"#ffe4e6", r600:"#dc2626",
  a50:"#fffbeb", a100:"#fef3c7", a600:"#d97706", a700:"#b45309",
  b50:"#eff6ff", b100:"#dbeafe", b600:"#2563eb",
  teal50:"#f0fdfa", teal600:"#0d9488",
};

/* ── ICON PATHS ───────────────────────────────────────── */
const IP = {
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  calendar:"M8 2v4 M16 2v4 M3 10h18 M21 8H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V10a2 2 0 00-2-2z",
  dumbbell:"M6 4v16 M18 4v16 M6 8h2 M16 8h2 M6 16h2 M16 16h2 M8 8h8 M8 16h8",
  clipboard:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 14l2 2 4-4",
  dollar:"M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  user:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  logout:"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  check:"M20 6L9 17l-5-5",
  x:"M18 6L6 18 M6 6l12 12",
  chevR:"M9 18l6-6-6-6",
  chevL:"M15 18l-6-6 6-6",
  chevU:"M18 15l-6-6-6 6",
  chevD:"M6 9l6 6 6-6",
  plus:"M12 5v14 M5 12h14",
  clock:"M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2",
  alert:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  fire:"M12 22c0 0-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z",
  send:"M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  repeat:"M17 1l4 4-4 4 M3 11V9a4 4 0 014-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 01-4 4H3",
  info:"M12 22a10 10 0 100-20 10 10 0 000 20z M12 8h.01 M12 12v4",
  folder:"M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
  upload:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  download:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  activity:"M22 12h-4l-3 9L9 3l-3 9H2",
  trash:"M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6 M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2",
  search:"M11 17a6 6 0 100-12 6 6 0 000 12z M21 21l-4.35-4.35",
  play:"M5 3l14 9-14 9V3z",
  "play-circle":"M12 22a10 10 0 100-20 10 10 0 000 20z M10 8l6 4-6 4V8z",
  edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  mic:"M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v4 M8 23h8",
  target:"M12 22a10 10 0 100-20 10 10 0 000 20z M12 18a6 6 0 100-12 6 6 0 000 12z M12 14a2 2 0 100-4 2 2 0 000 4z",
  smile:"M12 22a10 10 0 100-20 10 10 0 000 20z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01",
  "thumbs-up":"M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3",
  bell:"M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  "more-h":"M12 13a1 1 0 100-2 1 1 0 000 2z M19 13a1 1 0 100-2 1 1 0 000 2z M5 13a1 1 0 100-2 1 1 0 000 2z",
  map:"M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z",
  award:"M12 15a7 7 0 100-14 7 7 0 000 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  "trending-up":"M23 6l-9.5 9.5-5-5L1 18",
  heart:"M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  zap:"M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};
function Ic({ n, s = 20, c = "currentColor", sw = 1.8 }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, display:"block" }}><path d={IP[n] || ""} /></svg>;
}

/* ── HELPERS ──────────────────────────────────────────── */
const TODAY = new Date().toISOString().slice(0, 10);
const fmtDate = d => { if (!d) return "—"; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" }); };
const fmtDateFull = d => { if (!d) return "—"; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" }); };
const fmtTime = t => { if (!t) return ""; const [h, m] = t.split(":"); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`; };
const ptAge = dob => { if (!dob) return "?"; const a = Math.floor((Date.now() - new Date(dob + "T12:00:00")) / (365.25 * 864e5)); return a < 0 || a > 150 ? "?" : a; };
const isFuture = d => d && d >= TODAY;
const isPast   = d => d && d < TODAY;

/* ── SESSION TIMEOUT MANAGER ─────────────────────────── */
const SESSION_WARN = 25 * 60 * 1000;  // warn at 25 min idle
const SESSION_OUT  = 30 * 60 * 1000;  // sign out at 30 min idle
function useSessionTimeout(onSignOut) {
  const [showWarn, setShowWarn] = useState(false);
  const timers = useRef({});
  const reset = useCallback(() => {
    clearTimeout(timers.current.warn);
    clearTimeout(timers.current.out);
    setShowWarn(false);
    timers.current.warn = setTimeout(() => setShowWarn(true), SESSION_WARN);
    timers.current.out  = setTimeout(() => { setShowWarn(false); onSignOut(); }, SESSION_OUT);
  }, [onSignOut]);
  useEffect(() => {
    const events = ["mousemove","keydown","click","touchstart","scroll"];
    events.forEach(e => window.addEventListener(e, reset, { passive:true }));
    reset();
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(timers.current.warn);
      clearTimeout(timers.current.out);
    };
  }, [reset]);
  return showWarn;
}

function SessionWarningModal({ onStay, onLeave }) {
  return ReactDOM.createPortal(
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:99999,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div style={{ background:"#fff",borderRadius:20,padding:"28px 24px",maxWidth:360,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,.3)",textAlign:"center" }}>
        <div style={{ width:56,height:56,borderRadius:"50%",background:C.a50,border:`2px solid ${C.a100}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
          <Ic n="alert" s={26} c={C.a600} sw={2}/>
        </div>
        <h3 style={{ fontSize:18,fontWeight:800,color:C.g800,marginBottom:8 }}>Still there?</h3>
        <p style={{ fontSize:13,color:C.g500,lineHeight:1.6,marginBottom:24 }}>For your security, you will be signed out in 5 minutes due to inactivity.</p>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onLeave} style={{ flex:1,padding:"11px",border:`1.5px solid ${C.g200}`,borderRadius:10,background:"#fff",color:C.g600,fontSize:13,fontWeight:700,cursor:"pointer" }}>Sign Out</button>
          <button onClick={onStay} style={{ flex:1,padding:"11px",border:"none",borderRadius:10,background:C.p500,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>Stay Signed In</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── BASE INPUT STYLE (needed before IST is defined below) */
const IST_BASE = { width:"100%",padding:"9px 12px",border:`1.5px solid ${C.g200}`,borderRadius:9,fontSize:13,color:C.g800,fontFamily:"inherit",outline:"none",background:"#fff",boxSizing:"border-box" };

/* ── NPS / SATISFACTION ───────────────────────────────── */
const NPS_KEY = (pid, apptId) => `nps_done_${pid}_${apptId}`;
function NPSCard({ patient, appts, clinicId }) {
  // Find last completed appointment that hasn't been rated
  const ratable = appts
    .filter(a => (a.status === "Completed" || isPast(a.date)) && a.status !== "Cancelled")
    .sort((a,b) => b.date.localeCompare(a.date))
    .find(a => !localStorage.getItem(NPS_KEY(patient.id, a.id)));
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [review, setReview] = useState("");
  if (!ratable || submitted) return null;
  async function submit() {
    if (!rating) return;
    localStorage.setItem(NPS_KEY(patient.id, ratable.id), "1");
    const msg = {
      id:`NPS-${Date.now()}`, pid:patient.id,
      fromType:"patient", fromName:`${patient.fn} ${patient.ln}`,
      body:`VISIT RATING: ${rating}/5 stars\nAppointment: ${ratable.date} ${ratable.type}\nProvider: ${ratable.provider||"N/A"}\nComment: ${review||"No comment"}`,
      ts:new Date().toISOString(), read:false,
    };
    await supabase.from("messages").insert([{ id:msg.id, clinic_id:clinicId, data:msg }]);
    setSubmitted(true);
    // For 5-star ratings show Google review prompt after 1.5s
    if (rating === 5) setTimeout(() => {
      const url = `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`;
      const link = document.createElement("a");
      link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer";
      // Don't auto-navigate — just show the prompt card handled below
    }, 1500);
  }
  if (submitted && rating === 5) return (
    <div style={{ background:`linear-gradient(135deg,${C.gr50},#f0fdf4)`,border:`1px solid ${C.gr100}`,borderRadius:16,padding:"18px 20px",marginBottom:14 }}>
      <p style={{ fontSize:15,fontWeight:800,color:C.gr700,marginBottom:4 }}>Thank you! Would you share your experience?</p>
      <p style={{ fontSize:13,color:C.gr600,marginBottom:14 }}>Your feedback helps others find great care.</p>
      <a href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID" target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"10px 20px",background:"#fff",border:"1.5px solid #d1d5db",borderRadius:10,fontSize:13,fontWeight:700,color:"#374151",textDecoration:"none" }}>
        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Leave a Google Review
      </a>
    </div>
  );
  if (submitted) return (
    <div style={{ background:C.gr50,border:`1px solid ${C.gr100}`,borderRadius:16,padding:"16px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:12 }}>
      <div style={{ width:36,height:36,borderRadius:"50%",background:C.gr600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic n="check" s={16} c="#fff" sw={2.5}/></div>
      <div>
        <p style={{ fontSize:14,fontWeight:700,color:C.gr700 }}>Thank you for your feedback!</p>
        <p style={{ fontSize:12,color:C.gr600 }}>Your response has been sent to the clinic.</p>
      </div>
    </div>
  );
  return (
    <div style={{ background:"#fff",border:`1px solid ${C.g200}`,borderRadius:16,padding:"18px 20px",marginBottom:14,boxShadow:"0 2px 12px rgba(124,58,237,0.07)" }}>
      <p style={{ fontSize:14,fontWeight:800,color:C.g800,marginBottom:2 }}>How was your last session?</p>
      <p style={{ fontSize:12,color:C.g400,marginBottom:14 }}>with {ratable.provider||"your therapist"} on {fmtDate(ratable.date)}</p>
      <div style={{ display:"flex",gap:8,marginBottom:14 }}>
        {[1,2,3,4,5].map(v=>(
          <button key={v} onMouseEnter={()=>setHovered(v)} onMouseLeave={()=>setHovered(0)} onClick={()=>setRating(v)}
            style={{ flex:1,fontSize:22,background:"none",border:"none",cursor:"pointer",opacity:(hovered||rating)>=v?1:0.3,transition:"opacity .1s,transform .1s",transform:(hovered||rating)>=v?"scale(1.2)":"scale(1)" }}>
            ★
          </button>
        ))}
      </div>
      {rating > 0 && rating < 5 && (
        <textarea value={review} onChange={e=>setReview(e.target.value)} placeholder="What could we improve? (optional)" rows={2} style={{ ...IST_BASE, resize:"none", marginBottom:12, fontSize:12 }}/>
      )}
      {rating > 0 && (
        <button onClick={submit} style={{ width:"100%",padding:"10px",background:C.p500,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer" }}>
          Submit {rating === 5 ? "— You are amazing!" : "Rating"}
        </button>
      )}
    </div>
  );
}

/* ── DAILY SYMPTOM CHECK-IN ───────────────────────────── */
const CHECKIN_KEY = (pid) => `checkin_${pid}_${TODAY}`;
function DailyCheckin({ patient, clinicId, onDone }) {
  const [pain, setPain] = useState(5);
  const [done, setDone] = useState(() => !!localStorage.getItem(CHECKIN_KEY(patient.id)));
  const [saving, setSaving] = useState(false);
  if (done) return null;
  async function submit() {
    setSaving(true);
    localStorage.setItem(CHECKIN_KEY(patient.id), pain.toString());
    const record = { id:`CI-${Date.now()}`, pid:patient.id, date:TODAY, pain, type:"daily_checkin", submittedAt:new Date().toISOString() };
    await supabase.from("pt_outcomes").insert([{ id:record.id, clinic_id:clinicId, data:record }]);
    setDone(true);
    if (onDone) onDone(pain);
    setSaving(false);
  }
  return (
    <div style={{ background:`linear-gradient(135deg,${C.p50},${C.b50})`,border:`1px solid ${C.p100}`,borderRadius:16,padding:"18px 20px",marginBottom:14 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
        <div>
          <p style={{ fontSize:14,fontWeight:800,color:C.p800,marginBottom:2 }}>How are you feeling today?</p>
          <p style={{ fontSize:12,color:C.p500 }}>Quick pain check — takes 5 seconds</p>
        </div>
        <button onClick={()=>setDone(true)} style={{ background:"none",border:"none",color:C.g400,cursor:"pointer",fontSize:18,lineHeight:1 }}>×</button>
      </div>
      <div style={{ display:"flex",gap:5,marginBottom:14,flexWrap:"wrap" }}>
        {Array.from({length:11},(_,i)=>i).map(v=>(
          <button key={v} onClick={()=>setPain(v)}
            style={{ width:36,height:36,borderRadius:8,border:`2px solid ${pain===v?(v<=3?C.gr600:v<=6?C.a600:"#dc2626"):C.g200}`,background:pain===v?(v<=3?C.gr50:v<=6?C.a50:"#fff1f2"):"transparent",color:pain===v?(v<=3?C.gr700:v<=6?C.a700:"#dc2626"):C.g500,fontWeight:800,fontSize:13,cursor:"pointer",transition:"all .1s" }}>{v}</button>
        ))}
      </div>
      <p style={{ fontSize:11,color:C.g500,marginBottom:12 }}>{pain<=2?"No pain — great!":pain<=4?"Mild discomfort":pain<=6?"Moderate pain":pain<=8?"Significant pain":"Severe pain — consider calling your clinic"}</p>
      <button onClick={submit} disabled={saving} style={{ width:"100%",padding:"10px",background:C.p500,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer" }}>
        {saving?"Saving…":"Log Today's Pain"}
      </button>
    </div>
  );
}

/* ── REGION VISUALS ───────────────────────────────────── */
// Dot [x, y] on a 40×82 human silhouette viewBox
const REGION_DOT = {
  "Neck/Cervical":[20,14], "Neck":[20,14],
  "Shoulder":     [10,20], "Upper Back":[20,26], "Back":[20,26],
  "Low Back":     [20,36], "Lumbar":[20,36],
  "Hip":          [14,44], "Glutes/Core":[20,42], "Glutes":[20,42], "Core":[20,40],
  "Hip/Knee":     [15,52], "Knee":[16,60],
  "Ankle":        [16,72], "Foot":[17,76],
  "Elbow":        [9,30],  "Wrist/Hand":[8,38],
};
const REGION_COLOR = {
  "Neck/Cervical":"#0d9488","Neck":"#0d9488",
  "Shoulder":"#e11d48","Upper Back":"#2563eb","Back":"#2563eb",
  "Low Back":"#9333ea","Lumbar":"#9333ea",
  "Hip":"#2563eb","Glutes/Core":"#9333ea","Glutes":"#9333ea","Core":"#7c3aed",
  "Hip/Knee":"#16a34a","Knee":"#16a34a",
  "Ankle":"#d97706","Foot":"#d97706",
  "Elbow":"#e11d48","Wrist/Hand":"#d97706",
};
function ExRegionSVG({ region, isDone }) {
  const key   = (region || "").split("/")[0].trim();
  const dot   = REGION_DOT[region] || REGION_DOT[key] || [20, 36];
  const color = REGION_COLOR[region] || REGION_COLOR[key] || "#7c3aed";
  const op    = isDone ? 0.55 : 1;
  return (
    <svg viewBox="0 0 40 82" width="52" height="90" style={{ opacity:op, transition:"opacity .2s", flexShrink:0 }}>
      <circle cx="20" cy="6.5" r="5.5" fill="#d1d5db"/>
      <rect x="18.5" y="12" width="3" height="4" rx="1" fill="#d1d5db"/>
      <rect x="13" y="16" width="14" height="20" rx="4" fill="#d1d5db"/>
      <rect x="7"  y="16" width="5"  height="17" rx="2.5" fill="#d1d5db" opacity="0.8"/>
      <rect x="28" y="16" width="5"  height="17" rx="2.5" fill="#d1d5db" opacity="0.8"/>
      <rect x="13" y="37" width="6"  height="25" rx="3" fill="#d1d5db"/>
      <rect x="21" y="37" width="6"  height="25" rx="3" fill="#d1d5db"/>
      <circle cx={dot[0]} cy={dot[1]} r="7"   fill={color} opacity="0.15"/>
      <circle cx={dot[0]} cy={dot[1]} r="4.5" fill={color} opacity="0.3"/>
      <circle cx={dot[0]} cy={dot[1]} r="2.8" fill={color} opacity="1"/>
    </svg>
  );
}

// Fallback exercise definitions — used when Supabase RLS blocks patient
// access to the exercise library rows (clinic_id IS NULL).
// Keeps HEP cards readable even without a DB hit.
const EXERCISE_LIB_FALLBACK = [
  {id:"EX-001",name:"Quad Sets",category:"Strengthening",region:"Knee",sets:3,reps:10,hold:5,desc:"Tighten thigh muscle by pressing back of knee into surface. Hold, then relax."},
  {id:"EX-002",name:"Straight Leg Raises",category:"Strengthening",region:"Hip/Knee",sets:3,reps:15,hold:2,desc:"Tighten quad, lift leg to height of opposite bent knee. Lower slowly."},
  {id:"EX-003",name:"Clamshells",category:"Strengthening",region:"Hip",sets:3,reps:15,hold:1,desc:"Lie on side, knees bent. Rotate top knee upward. Keep pelvis stable."},
  {id:"EX-004",name:"Ankle Pumps",category:"Mobility",region:"Ankle",sets:3,reps:20,hold:0,desc:"Point foot down, then pull toes toward shin. Promotes circulation."},
  {id:"EX-005",name:"Hip Flexor Stretch",category:"Flexibility",region:"Hip",sets:3,reps:1,hold:30,desc:"Kneel on one knee, lunge forward until stretch felt in front of hip."},
  {id:"EX-006",name:"Bridges",category:"Strengthening",region:"Glutes/Core",sets:3,reps:15,hold:2,desc:"Lie on back, knees bent. Push hips up to form straight line."},
  {id:"EX-007",name:"Wall Slides",category:"Strengthening",region:"Shoulder",sets:3,reps:10,hold:3,desc:"Back against wall. Slide arms up overhead keeping contact throughout."},
  {id:"EX-008",name:"Pendulum Circles",category:"Mobility",region:"Shoulder",sets:2,reps:20,hold:0,desc:"Lean forward, let arm hang freely. Use body to create small circles."},
  {id:"EX-009",name:"Seated Row (Band)",category:"Strengthening",region:"Upper Back",sets:3,reps:12,hold:2,desc:"Sit tall, band around feet. Pull hands to sides of torso, squeezing shoulder blades."},
  {id:"EX-010",name:"Hamstring Stretch",category:"Flexibility",region:"Knee/Hip",sets:3,reps:1,hold:30,desc:"Lie on back. Pull bent knee to chest, then straighten leg until stretch felt."},
  {id:"EX-011",name:"Cervical Retractions",category:"Mobility",region:"Neck/Cervical",sets:3,reps:10,hold:3,desc:"Sitting tall, tuck chin in as if making a double chin. Do not tilt head."},
  {id:"EX-012",name:"Lumbar Rotation Stretch",category:"Flexibility",region:"Low Back",sets:2,reps:1,hold:30,desc:"Lie on back, knees bent. Let knees drop to one side while keeping shoulders flat."},
];

/* ── GLOBAL STYLES ────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif; background: #f8f7ff; color: #1f2937; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 99px; }
  input, select, textarea, button { font-family: inherit; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes slideIn  { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  .fade-up { animation: fadeUp .3s ease both; }
`;

/* ── LOADING SCREEN ───────────────────────────────────── */
function LoadingScreen({ msg = "Loading your portal…" }) {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ position:"fixed", inset:0, background:`linear-gradient(155deg,${C.p900},${C.p700},${C.p500})`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 17 C5 14 5 11 7 9 C9 7.5 10.5 7 12 7 C13.5 7 15 7.5 17 9 C19 11 19 14 18 17"/>
              <path d="M1 17 Q12 20.5 23 17"/>
              <path d="M10 7.8 Q12 6.5 14 7.8"/>
              <path d="M12 10.5v3 M10.5 12h3"/>
            </svg>
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-0.5px" }}>Cowboy <span style={{ color:C.p200 }}>EHR</span></div>
        </div>
        <div style={{ width:160, height:3, background:"rgba(255,255,255,.15)", borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", width:"40%", background:`linear-gradient(90deg,${C.p200},#fff)`, borderRadius:2, animation:"spin 1.4s ease-in-out infinite", animationName:"slideBar" }}/>
        </div>
        <style>{`@keyframes slideBar{0%{transform:translateX(-200%)}100%{transform:translateX(600%)}}`}</style>
        <p style={{ fontSize:13, color:"rgba(196,181,253,.8)" }}>{msg}</p>
      </div>
    </>
  );
}

/* ── LOGIN PAGE ───────────────────────────────────────── */
function PatientLogin({ onLogin, expired }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) return setError(err.message);
    onLogin(data.user);
  }

  return (
    <>
      <style>{GLOBAL_CSS}{`
        .pl-root { min-height:100vh; display:flex; }
        .pl-left { width:48%; background:linear-gradient(155deg,${C.p900} 0%,${C.p700} 45%,${C.p500} 100%); display:flex; flex-direction:column; justify-content:space-between; padding:48px 52px; position:relative; overflow:hidden; }
        .pl-left::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 50% at 80% 20%,rgba(167,139,250,.18) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 20% 80%,rgba(109,40,217,.35) 0%,transparent 70%); pointer-events:none; }
        .pl-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; }
        .pl-right { flex:1; background:#fafafa; display:flex; align-items:center; justify-content:center; padding:40px 32px; }
        .pl-wrap { width:100%; max-width:380px; animation:fadeUp .3s ease both; }
        .pl-input { width:100%; padding:11px 14px; border:1.5px solid ${C.g200}; border-radius:10px; font-size:14px; outline:none; transition:border-color .18s,box-shadow .18s; background:#fff; color:${C.g800}; }
        .pl-input:focus { border-color:${C.p500}; box-shadow:0 0 0 3px ${C.p100}; }
        .pl-btn { width:100%; padding:13px; border:none; border-radius:10px; background:linear-gradient(135deg,${C.p600},${C.p500}); color:#fff; font-size:14px; font-weight:700; cursor:pointer; transition:opacity .18s,transform .12s; box-shadow:0 4px 14px rgba(109,40,217,.35); display:flex; align-items:center; justify-content:center; gap:8px; }
        .pl-btn:hover:not(:disabled) { opacity:.92; transform:translateY(-1px); }
        .pl-btn:disabled { opacity:.55; cursor:not-allowed; }
        @media(max-width:680px){.pl-left{display:none;}.pl-right{background:linear-gradient(155deg,${C.p900},${C.p600});}.pl-wrap{background:#fff;border-radius:20px;padding:32px 28px;box-shadow:0 20px 60px rgba(0,0,0,.3);}}
      `}</style>
      <div className="pl-root">
        {/* Left branding */}
        <div className="pl-left">
          <div className="pl-grid"/>
          <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative", zIndex:1 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 17 C5 14 5 11 7 9 C9 7.5 10.5 7 12 7 C13.5 7 15 7.5 17 9 C19 11 19 14 18 17"/>
                <path d="M1 17 Q12 20.5 23 17"/>
                <path d="M10 7.8 Q12 6.5 14 7.8"/>
                <path d="M12 10.5v3 M10.5 12h3"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>Cowboy <span style={{ color:C.p200 }}>EHR</span></div>
              <div style={{ fontSize:10, fontWeight:600, color:"rgba(196,181,253,.8)", textTransform:"uppercase", letterSpacing:1.5 }}>Patient Portal</div>
            </div>
          </div>

          <div style={{ position:"relative", zIndex:1 }}>
            <h1 style={{ fontSize:32, fontWeight:800, color:"#fff", lineHeight:1.2, letterSpacing:"-0.5px", marginBottom:14 }}>Your health,<br/><span style={{ color:C.p200 }}>your way.</span></h1>
            <p style={{ fontSize:14, color:"rgba(196,181,253,.85)", lineHeight:1.7, maxWidth:340 }}>Access your appointments, exercise programs, treatment plans, and billing — all in one place.</p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10, position:"relative", zIndex:1 }}>
            {[
              { icon:"calendar", label:"Appointments", sub:"Book and manage your visits" },
              { icon:"dumbbell", label:"Home Exercises", sub:"Your personalised HEP" },
              { icon:"clipboard", label:"Treatment Plan", sub:"Goals and progress tracking" },
            ].map((f, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)", borderRadius:12, padding:"11px 15px" }}>
                <div style={{ width:34, height:34, borderRadius:9, background:"rgba(255,255,255,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Ic n={f.icon} s={16} c="rgba(196,181,253,.9)" sw={2}/>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.9)" }}>{f.label}</div>
                  <div style={{ fontSize:11, color:"rgba(196,181,253,.7)", marginTop:1 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="pl-right">
          <div className="pl-wrap">
            <div style={{ fontSize:26, fontWeight:800, color:C.g800, letterSpacing:"-0.5px", marginBottom:4 }}>Welcome back</div>
            <div style={{ fontSize:13, color:C.g500, marginBottom:28 }}>Sign in to your patient portal</div>

            {expired && (
              <div style={{ background:C.a50, border:`1px solid #fcd34d`, borderRadius:10, padding:"11px 14px", marginBottom:20, display:"flex", alignItems:"flex-start", gap:10 }}>
                <Ic n="alert" s={16} c={C.a700} sw={2}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.a700 }}>Session expired</div>
                  <div style={{ fontSize:12, color:"#78350f", marginTop:1 }}>You were signed out — please sign back in.</div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background:C.r50, border:`1px solid #fca5a5`, borderRadius:10, padding:"10px 14px", marginBottom:18, display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.r600, fontWeight:500 }}>
                <Ic n="alert" s={15} c={C.r600} sw={2.5}/>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.g700, marginBottom:6 }}>Email</label>
                <input className="pl-input" type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" autoFocus/>
              </div>
              <div style={{ marginBottom:22 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.g700, marginBottom:6 }}>Password</label>
                <input className="pl-input" type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"/>
              </div>
              <button className="pl-btn" type="submit" disabled={loading}>
                {loading ? <><div style={{ width:15, height:15, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }}/> Signing in…</> : "Sign In"}
              </button>
            </form>

            <p style={{ marginTop:24, fontSize:11, color:C.g400, textAlign:"center" }}>
              Don't have an account? Contact your clinic to be set up.
            </p>
            <div style={{ marginTop:16, textAlign:"center", fontSize:11, color:C.g300 }}>HIPAA-ready · Cowboy Healthcare EHR</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── TOAST ────────────────────────────────────────────── */
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  const colors = { success: [C.gr50, C.gr600, "#a7f3d0"], error: [C.r50, C.r600, "#fca5a5"], info: [C.b50, C.b600, "#93c5fd"] };
  const [bg, tc, bd] = colors[type] || colors.success;
  return (
    <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:bg, border:`1px solid ${bd}`, color:tc, borderRadius:12, padding:"11px 18px", fontSize:13, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,.15)", display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap", animation:"fadeUp .25s ease both" }}>
      <Ic n={type === "error" ? "alert" : "check"} s={15} c={tc} sw={2.5}/>
      {msg}
    </div>
  );
}

/* ── STATUS BADGE ─────────────────────────────────────── */
function Bdg({ label, color = "gray" }) {
  const m = { gray:[C.g100,C.g600,C.g300], purple:[C.p100,C.p700,C.p200], green:[C.gr100,C.gr700,"#a7f3d0"], red:[C.r100,C.r600,"#fca5a5"], amber:[C.a100,C.a600,"#fcd34d"], blue:[C.b100,C.b600,"#93c5fd"], teal:[C.teal50,C.teal600,"#99f6e4"] };
  const [bg, tc, bd] = m[color] || m.gray;
  return <span style={{ background:bg, color:tc, border:`1px solid ${bd}`, fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase", padding:"2px 8px", borderRadius:20, whiteSpace:"nowrap" }}>{label}</span>;
}

const apptColor = s => ({ Scheduled:"purple", "Checked In":"blue", Completed:"green", Cancelled:"gray", Requested:"amber" })[s] || "gray";

/* ── EMPTY STATE ──────────────────────────────────────── */
function Empty({ icon, title, sub }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 24px", color:C.g400 }}>
      <div style={{ width:56, height:56, borderRadius:16, background:C.p50, border:`1.5px solid ${C.p100}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
        <Ic n={icon} s={24} c={C.p300} sw={1.6}/>
      </div>
      <p style={{ fontWeight:700, color:C.g700, fontSize:14, marginBottom:5 }}>{title}</p>
      <p style={{ fontSize:13, maxWidth:280, margin:"0 auto", lineHeight:1.6 }}>{sub}</p>
    </div>
  );
}

/* ── CARD ─────────────────────────────────────────────── */
function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{ background:C.w, borderRadius:16, border:`1px solid ${C.g200}`, boxShadow:"0 2px 12px rgba(124,58,237,0.07),0 1px 3px rgba(0,0,0,0.04)", cursor:onClick?"pointer":undefined, overflow:"hidden", ...style }}>
      {children}
    </div>
  );
}

/* ── SECTION HEADER ───────────────────────────────────── */
function SectionHead({ title, sub, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
      <div>
        <h2 style={{ fontSize:16, fontWeight:800, color:C.g800, letterSpacing:"-0.3px" }}>{title}</h2>
        {sub && <p style={{ fontSize:12, color:C.g400, marginTop:2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PRE-VISIT PREP CARD
══════════════════════════════════════════════════════ */
const PREP_KEY = (apptId) => `prepDone_${apptId}`;
function PreVisitPrep({ appt, patient, clinicId, onDone }) {
  const [q1, setQ1] = useState(""); // pain change
  const [q2, setQ2] = useState(""); // hardest exercise
  const [q3, setQ3] = useState(""); // still struggling with
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  if (!appt || saved) return null;
  // Only show 24-72h before appt
  const apptMs = new Date(appt.date + "T" + (appt.time || "09:00")).getTime();
  const diff = apptMs - Date.now();
  if (diff < 0 || diff > 72 * 3600 * 1000) return null;
  const hrs = Math.round(diff / 3600000);
  async function submit() {
    if (!q1.trim() && !q2.trim() && !q3.trim()) return;
    setSaving(true);
    const body = `PRE-VISIT PREP (${appt.date} ${fmtTime(appt.time)})\n\nPain change this week: ${q1||"Not answered"}\nHardest exercise: ${q2||"Not answered"}\nStill struggling with: ${q3||"Not answered"}`;
    const msg = { id:`PREP-${Date.now()}`, pid:patient.id, fromType:"patient", fromName:`${patient.fn} ${patient.ln}`, body, ts:new Date().toISOString(), read:false };
    await supabase.from("messages").insert([{ id:msg.id, clinic_id:clinicId, data:msg }]);
    localStorage.setItem(PREP_KEY(appt.id), "1");
    setSaved(true);
    if (onDone) onDone();
    setSaving(false);
  }
  return (
    <div style={{ background:`linear-gradient(135deg,${C.teal50},#f0fdf4)`, border:`1px solid ${C.teal600}33`, borderRadius:16, padding:"18px 20px", marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <div style={{ width:34,height:34,borderRadius:9,background:C.teal600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <Ic n="clipboard" s={16} c="#fff" sw={2}/>
        </div>
        <div>
          <p style={{ fontSize:14,fontWeight:800,color:"#134e4a" }}>Prepare for tomorrow's session</p>
          <p style={{ fontSize:11,color:C.teal600 }}>Appointment in {hrs} hour{hrs!==1?"s":""} · helps your therapist prepare</p>
        </div>
      </div>
      {[
        {label:"How has your pain changed this week?", val:q1, set:setQ1, ph:"e.g. A bit better after the exercises, worse after sitting long"},
        {label:"Which exercise felt hardest?",          val:q2, set:setQ2, ph:"e.g. Quad sets — felt a pulling sensation"},
        {label:"What are you still struggling with?",   val:q3, set:setQ3, ph:"e.g. Still hard to go up stairs without pain"},
      ].map((item,i) => (
        <div key={i} style={{ marginBottom:10 }}>
          <label style={{ fontSize:11,fontWeight:700,color:"#134e4a",display:"block",marginBottom:4 }}>{item.label}</label>
          <textarea value={item.val} onChange={e=>item.set(e.target.value)} placeholder={item.ph} rows={2} style={{ ...IST_BASE, resize:"none", fontSize:12, borderColor:C.teal600+"55" }}/>
        </div>
      ))}
      <button onClick={submit} disabled={saving||(!q1.trim()&&!q2.trim()&&!q3.trim())} style={{ width:"100%",padding:"10px",background:C.teal600,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",opacity:(!q1.trim()&&!q2.trim()&&!q3.trim())?0.5:1 }}>
        {saving?"Sending…":"Send to My Therapist"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB: HOME / DASHBOARD — ACTION-ORIENTED REDESIGN
══════════════════════════════════════════════════════ */
function HomeTab({ patient, appts, heps, plans, claims, messages, outcomes, exerciseLib, clinicId, onNav, onBookAppt, onConfirmAppt }) {
  const upcoming    = appts.filter(a => isFuture(a.date) && a.status !== "Cancelled").sort((a,b) => a.date.localeCompare(b.date));
  const nextAppt    = upcoming[0];
  const myHep       = heps[0];
  const myPlan      = plans.find(p => p.status === "Active") || plans[0];
  const unpaidBills = claims.filter(c => c.status !== "Paid" && c.status !== "Void");
  const totalOwed   = unpaidBills.reduce((s,c)=>s+((Number(c.amount)||0)-(Number(c.paidAmt)||0)),0);
  const unreadMsgs  = messages.filter(m => m.fromType !== "patient" && !m.read_by_patient);
  const intakeNeeded = !patient.emergencyContact || !patient.occupation;
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed]   = useState(() => nextAppt ? !!localStorage.getItem(`appt_confirmed_${nextAppt.id}`) : false);

  // Exercise progress today
  const doneKey = exId => `hep_done_${TODAY}_${patient.id}_${exId}`;
  const todayExercises = myHep?.exercises || [];
  const doneToday = todayExercises.filter(e => localStorage.getItem(doneKey(e.exId))).length;
  const exercisesPct = todayExercises.length ? Math.round((doneToday / todayExercises.length) * 100) : 0;

  // Streak
  const streak = useMemo(() => {
    let s = 0; const d = new Date();
    while (true) {
      if (!localStorage.getItem(`hep_done_${d.toISOString().slice(0,10)}_${patient.id}`)) break;
      s++; d.setDate(d.getDate()-1);
    }
    return s;
  }, [patient.id]);

  // Plain-language progress
  const painHistory = outcomes.filter(o=>o.pain!=null).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  const initialPain = painHistory[0]?.pain;
  const currentPain = painHistory[painHistory.length-1]?.pain;
  const painImproved = (initialPain!=null && currentPain!=null && initialPain > 0)
    ? Math.round(((initialPain - currentPain) / initialPain) * 100) : null;

  // Days until next appt
  const daysUntil = nextAppt ? Math.ceil((new Date(nextAppt.date+"T12:00:00") - new Date()) / 86400000) : null;
  const showConfirmCTA = nextAppt && daysUntil !== null && daysUntil <= 2 && daysUntil >= 0 && !confirmed;

  // Priority action items — ordered by urgency
  const actionItems = [];
  if (intakeNeeded) actionItems.push({ id:"intake", priority:"critical", icon:"clipboard", color:C.r600, bg:C.r50, border:"#fca5a5", title:"Complete your intake form", sub:"Required before your first appointment", cta:"Complete Now", onClick:()=>onNav("profile") });
  if (unreadMsgs.length > 0) actionItems.push({ id:"msgs", priority:"high", icon:"send", color:C.p600, bg:C.p50, border:C.p200, title:`${unreadMsgs.length} unread message${unreadMsgs.length>1?"s":""}`, sub:"Your care team sent you a message", cta:"Read Now", onClick:()=>onNav("messages") });
  if (showConfirmCTA) actionItems.push({ id:"confirm", priority:"high", icon:"calendar", color:C.b600, bg:C.b50, border:"#93c5fd", title:`Appointment ${daysUntil===0?"today":daysUntil===1?"tomorrow":`in ${daysUntil} days"}`, sub:`${fmtDateFull(nextAppt.date)} at ${fmtTime(nextAppt.time)} — please confirm`, cta:"I'll Be There", onClick:async()=>{ setConfirming(true); localStorage.setItem(`appt_confirmed_${nextAppt.id}`,"1"); await onConfirmAppt(nextAppt.id); setConfirmed(true); setConfirming(false); } });
  if (todayExercises.length > 0 && doneToday < todayExercises.length) actionItems.push({ id:"hep", priority:"medium", icon:"dumbbell", color:C.p500, bg:C.p50, border:C.p200, title:`${todayExercises.length - doneToday} exercise${todayExercises.length-doneToday>1?"s":""} left today`, sub:`${doneToday} of ${todayExercises.length} done · ${myHep?.title||"Your program"}`, cta:"Start Now", onClick:()=>onNav("exercises") });
  if (totalOwed > 0) actionItems.push({ id:"billing", priority:"medium", icon:"dollar", color:C.r600, bg:C.r50, border:"#fca5a5", title:`$${totalOwed.toFixed(2)} outstanding`, sub:`${unpaidBills.length} invoice${unpaidBills.length>1?"s":""} · contact clinic to pay`, cta:"View Invoices", onClick:()=>onNav("profile") });

  const greeting = () => { const h = new Date().getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; };

  return (
    <div style={{ paddingBottom:8 }}>

      {/* ── Hero header ── */}
      <div style={{ background:`linear-gradient(135deg,${C.p900} 0%,${C.p700} 55%,${C.p500} 100%)`, borderRadius:20, padding:"20px 22px 18px", marginBottom:16, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",right:-20,top:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.05)",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",right:30,bottom:-30,width:70,height:70,borderRadius:"50%",background:"rgba(255,255,255,.04)",pointerEvents:"none" }}/>
        <p style={{ fontSize:12,color:C.p200,fontWeight:500,marginBottom:3 }}>{greeting()},</p>
        <h1 style={{ fontSize:21,fontWeight:800,color:"#fff",letterSpacing:"-0.4px",marginBottom:10 }}>{patient.fn} {patient.ln}</h1>
        {/* Stat chips row */}
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {[
            { label:`${upcoming.length} upcoming`, icon:"calendar", show:true },
            { label:`${streak}d streak`, icon:"fire", show:streak>0 },
            { label:`${unreadMsgs.length} messages`, icon:"send", show:unreadMsgs.length>0, alert:true },
            { label:`$${totalOwed.toFixed(0)} due`, icon:"dollar", show:totalOwed>0, alert:true },
          ].filter(s=>s.show).map((s,i)=>(
            <div key={i} style={{ display:"flex",alignItems:"center",gap:5,background:s.alert?"rgba(220,38,38,.15)":"rgba(255,255,255,.12)",border:`1px solid ${s.alert?"rgba(252,165,165,.3)":"rgba(255,255,255,.15)"}`,borderRadius:20,padding:"4px 10px" }}>
              <Ic n={s.icon} s={12} c={s.alert?"#fca5a5":"rgba(196,181,253,.9)"} sw={2}/>
              <span style={{ fontSize:11,fontWeight:600,color:s.alert?"#fca5a5":"rgba(255,255,255,.85)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Daily check-in ── */}
      <DailyCheckin patient={patient} clinicId={clinicId}/>

      {/* ── NPS card ── */}
      <NPSCard patient={patient} appts={appts} clinicId={clinicId}/>

      {/* ── Priority action items ── */}
      {actionItems.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:11,fontWeight:700,color:C.g500,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8 }}>Needs your attention</p>
          {actionItems.map(item=>(
            <div key={item.id} style={{ background:"#fff",border:`1px solid ${item.border}`,borderRadius:14,padding:"14px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 4px rgba(0,0,0,.05)" }}>
              <div style={{ width:38,height:38,borderRadius:10,background:item.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <Ic n={item.icon} s={18} c={item.color} sw={2}/>
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontSize:13,fontWeight:700,color:C.g800,marginBottom:2 }}>{item.title}</p>
                <p style={{ fontSize:11,color:C.g500,lineHeight:1.4 }}>{item.sub}</p>
              </div>
              <button onClick={item.onClick} disabled={item.id==="confirm"&&confirming} style={{ flexShrink:0,padding:"7px 13px",background:item.color,color:"#fff",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",opacity:(item.id==="confirm"&&confirming)?0.7:1 }}>
                {item.id==="confirm"&&confirming?"Saving…":item.cta}
              </button>
            </div>
          ))}
        </div>
      )}
      {actionItems.length === 0 && (
        <div style={{ background:C.gr50,border:`1px solid ${C.gr100}`,borderRadius:14,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:"50%",background:C.gr600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic n="check" s={16} c="#fff" sw={2.5}/></div>
          <div><p style={{ fontSize:13,fontWeight:700,color:C.gr700 }}>You are all caught up!</p><p style={{ fontSize:12,color:C.gr600 }}>No action needed right now.</p></div>
        </div>
      )}

      {/* ── Next appointment (full card) ── */}
      {nextAppt ? (
        <div style={{ background:"#fff",border:`1px solid ${C.g200}`,borderRadius:16,marginBottom:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(124,58,237,0.07)" }}>
          <div style={{ background:`linear-gradient(135deg,${C.b50},${C.p50})`,padding:"12px 18px",borderBottom:`1px solid ${C.g100}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <Ic n="calendar" s={14} c={C.p500} sw={2}/>
              <span style={{ fontSize:11,fontWeight:700,color:C.p600,textTransform:"uppercase",letterSpacing:0.6 }}>Next Appointment</span>
            </div>
            {daysUntil !== null && daysUntil <= 7 && (
              <span style={{ fontSize:11,fontWeight:700,color:C.b600,background:C.b50,border:`1px solid ${C.b100}`,borderRadius:20,padding:"2px 8px" }}>
                {daysUntil===0?"Today":daysUntil===1?"Tomorrow":`In ${daysUntil} days`}
              </span>
            )}
          </div>
          <div style={{ padding:"16px 18px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
              <div>
                <p style={{ fontSize:15,fontWeight:700,color:C.g800,marginBottom:3 }}>{nextAppt.type}</p>
                <p style={{ fontSize:13,color:C.g500 }}>{fmtDateFull(nextAppt.date)} at {fmtTime(nextAppt.time)}</p>
                {nextAppt.provider && <p style={{ fontSize:12,color:C.g400,marginTop:2 }}>with {nextAppt.provider}{nextAppt.room&&nextAppt.room!=="TBD"?` · Room ${nextAppt.room}`:""}</p>}
              </div>
              <Bdg label={confirmed?"Confirmed":nextAppt.status} color={confirmed?"green":apptColor(nextAppt.status)}/>
            </div>
            {confirmed ? (
              <div style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:C.gr50,borderRadius:10,fontSize:13,color:C.gr700,fontWeight:600 }}>
                <Ic n="check" s={14} c={C.gr600} sw={2.5}/>Confirmed — see you then!
              </div>
            ) : (
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <button onClick={async()=>{ setConfirming(true); localStorage.setItem(`appt_confirmed_${nextAppt.id}`,"1"); await onConfirmAppt(nextAppt.id); setConfirmed(true); setConfirming(false); }} disabled={confirming}
                  style={{ padding:"10px",background:C.p500,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer" }}>
                  {confirming?"Saving…":"I'll Be There"}
                </button>
                <button onClick={()=>onNav("appointments")} style={{ padding:"10px",background:"#fff",color:C.g600,border:`1.5px solid ${C.g200}`,borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer" }}>
                  Reschedule
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ background:"#fff",border:`1px dashed ${C.g300}`,borderRadius:16,padding:"20px 18px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
          <div>
            <p style={{ fontSize:14,fontWeight:700,color:C.g700,marginBottom:3 }}>No upcoming appointments</p>
            <p style={{ fontSize:12,color:C.g400 }}>Ready to book your next visit?</p>
          </div>
          <button onClick={onBookAppt} style={{ padding:"9px 18px",background:C.p500,color:"#fff",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0 }}>Book Now</button>
        </div>
      )}

      {/* ── Pre-visit prep card ── */}
      <PreVisitPrep appt={nextAppt} patient={patient} clinicId={clinicId}/>

      {/* ── Today's exercises ── */}
      {myHep && todayExercises.length > 0 && (
        <div style={{ background:"#fff",border:`1px solid ${C.g200}`,borderRadius:16,marginBottom:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(124,58,237,0.07)" }}>
          <div style={{ padding:"12px 18px",borderBottom:`1px solid ${C.g100}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <Ic n="dumbbell" s={14} c={C.p500} sw={2}/>
              <span style={{ fontSize:11,fontWeight:700,color:C.p600,textTransform:"uppercase",letterSpacing:0.6 }}>Today's Exercises</span>
            </div>
            <button onClick={()=>onNav("exercises")} style={{ fontSize:12,fontWeight:700,color:C.p500,background:"none",border:"none",cursor:"pointer" }}>Start Full Session →</button>
          </div>
          <div style={{ padding:"14px 18px" }}>
            {/* Progress bar */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
              <span style={{ fontSize:13,fontWeight:600,color:C.g700 }}>{doneToday} of {todayExercises.length} done</span>
              <span style={{ fontSize:14,fontWeight:800,color:exercisesPct===100?C.gr600:C.p500 }}>{exercisesPct}%</span>
            </div>
            <div style={{ height:8,background:C.g100,borderRadius:99,overflow:"hidden",marginBottom:12 }}>
              <div style={{ height:"100%",width:`${exercisesPct}%`,background:exercisesPct===100?`linear-gradient(90deg,${C.gr600},${C.gr500})`:`linear-gradient(90deg,${C.p600},${C.p400})`,borderRadius:99,transition:"width .4s" }}/>
            </div>
            {/* First 2 exercises inline */}
            {todayExercises.slice(0,2).map((ex,i)=>{
              const lib = exerciseLib.find(e=>e.id===ex.exId)||{};
              const done = !!localStorage.getItem(doneKey(ex.exId));
              return (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderTop:i>0?`1px solid ${C.g50}`:"none" }}>
                  <ExRegionSVG region={lib.region} isDone={done}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:13,fontWeight:700,color:done?C.g400:C.g800,textDecoration:done?"line-through":"none" }}>{lib.name||ex.exId}</p>
                    <p style={{ fontSize:11,color:C.g400 }}>{ex.sets&&`${ex.sets}×`}{ex.reps&&`${ex.reps} reps`}{ex.hold&&` · ${ex.hold}s hold`}</p>
                  </div>
                  {done && <div style={{ width:22,height:22,borderRadius:"50%",background:C.gr600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic n="check" s={11} c="#fff" sw={3}/></div>}
                </div>
              );
            })}
            {todayExercises.length > 2 && (
              <button onClick={()=>onNav("exercises")} style={{ width:"100%",marginTop:10,padding:"9px",background:C.p50,border:`1.5px solid ${C.p200}`,borderRadius:10,color:C.p700,fontSize:12,fontWeight:700,cursor:"pointer" }}>
                + {todayExercises.length-2} more exercises
              </button>
            )}
            {exercisesPct===100 && (
              <div style={{ marginTop:10,padding:"10px 14px",background:C.gr50,borderRadius:10,display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.gr700,fontWeight:700 }}>
                <Ic n="award" s={16} c={C.gr600} sw={2}/>All done for today — excellent work!
              </div>
            )}
          </div>
        </div>
      )}
      {myHep && todayExercises.length === 0 && (
        <div style={{ background:"#fff",border:`1px solid ${C.g200}`,borderRadius:16,padding:"16px 18px",marginBottom:14 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <Ic n="dumbbell" s={16} c={C.g400} sw={1.8}/>
            <div><p style={{ fontSize:13,fontWeight:600,color:C.g600 }}>Rest day today</p><p style={{ fontSize:11,color:C.g400 }}>No exercises scheduled</p></div>
          </div>
        </div>
      )}

      {/* ── Progress (plain language) ── */}
      {painImproved !== null && (
        <div style={{ background:painImproved>0?`linear-gradient(135deg,${C.gr50},#f0fdf4)`:`linear-gradient(135deg,${C.a50},#fffbeb)`, border:`1px solid ${painImproved>0?C.gr100:C.a100}`, borderRadius:16, padding:"16px 18px", marginBottom:14 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
            <Ic n="trending-up" s={16} c={painImproved>0?C.gr600:C.a600} sw={2}/>
            <span style={{ fontSize:11,fontWeight:700,color:painImproved>0?C.gr700:C.a700,textTransform:"uppercase",letterSpacing:0.6 }}>Your Progress</span>
          </div>
          {painImproved > 0 ? (
            <>
              <p style={{ fontSize:22,fontWeight:800,color:C.gr700,marginBottom:4 }}>Pain down {painImproved}%</p>
              <p style={{ fontSize:13,color:C.gr600,lineHeight:1.5 }}>Your pain has gone from <strong>{initialPain}/10</strong> to <strong>{currentPain}/10</strong> since you started. Keep it up — you're on track.</p>
            </>
          ) : painImproved < 0 ? (
            <>
              <p style={{ fontSize:20,fontWeight:800,color:C.a700,marginBottom:4 }}>Pain has increased slightly</p>
              <p style={{ fontSize:13,color:C.a700,lineHeight:1.5 }}>From {initialPain}/10 to {currentPain}/10. Let your therapist know at your next session.</p>
            </>
          ) : (
            <p style={{ fontSize:13,color:C.gr600 }}>Pain holding steady at {currentPain}/10. Early days — keep doing your exercises.</p>
          )}
          <button onClick={()=>onNav("outcomes")} style={{ marginTop:10,padding:"7px 14px",background:"rgba(0,0,0,.06)",border:"none",borderRadius:8,fontSize:12,fontWeight:700,color:painImproved>0?C.gr700:C.a700,cursor:"pointer" }}>See Full Progress →</button>
        </div>
      )}

      {/* ── Messages preview ── */}
      {unreadMsgs.length > 0 && (
        <div style={{ background:"#fff",border:`1px solid ${C.p200}`,borderRadius:16,marginBottom:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(124,58,237,.08)" }}>
          <div style={{ padding:"12px 18px",borderBottom:`1px solid ${C.g100}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <Ic n="send" s={14} c={C.p500} sw={2}/>
              <span style={{ fontSize:11,fontWeight:700,color:C.p600,textTransform:"uppercase",letterSpacing:0.6 }}>New Messages</span>
            </div>
            <div style={{ background:C.r600,color:"#fff",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800 }}>{unreadMsgs.length}</div>
          </div>
          <div style={{ padding:"14px 18px" }}>
            {unreadMsgs.slice(0,2).map((m,i)=>(
              <div key={m.id} style={{ paddingBottom:i<unreadMsgs.slice(0,2).length-1?10:0, marginBottom:i<unreadMsgs.slice(0,2).length-1?10:0, borderBottom:i<unreadMsgs.slice(0,2).length-1?`1px solid ${C.g100}`:"none" }}>
                <p style={{ fontSize:12,fontWeight:700,color:C.g700 }}>{m.fromName||"Your clinic"}</p>
                <p style={{ fontSize:12,color:C.g500,marginTop:2,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{m.body}</p>
              </div>
            ))}
            <button onClick={()=>onNav("messages")} style={{ marginTop:12,width:"100%",padding:"9px",background:C.p500,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer" }}>
              Reply to Messages
            </button>
          </div>
        </div>
      )}

      {/* ── Outstanding balance ── */}
      {totalOwed > 0 && (
        <div style={{ background:`linear-gradient(135deg,${C.r50},#fff1f2)`, border:"1px solid #fca5a5", borderRadius:16, padding:"14px 18px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:12,fontWeight:700,color:C.r600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:2 }}>Outstanding Balance</p>
            <p style={{ fontSize:11,color:"#ef4444" }}>Contact your clinic to arrange payment.</p>
          </div>
          <p style={{ fontSize:24,fontWeight:800,color:C.r600,flexShrink:0 }}>${totalOwed.toFixed(2)}</p>
        </div>
      )}

      {/* ── Streak milestone ── */}
      {streak > 0 && (
        <div style={{ background:`linear-gradient(135deg,${C.a50},#fffbeb)`, border:`1px solid ${C.a100}`, borderRadius:14, padding:"12px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:24, flexShrink:0 }}>
            {streak>=30?"🏆":streak>=14?"🥇":streak>=7?"🔥":"✨"}
          </div>
          <div>
            <p style={{ fontSize:13,fontWeight:800,color:C.a700 }}>{streak}-day exercise streak{streak>=30?" — Incredible!":streak>=14?" — Outstanding!":streak>=7?" — Amazing work!":""}</p>
            <p style={{ fontSize:11,color:C.a600 }}>{streak>=30?"You're in the top 5% of patients":"Keep going — consistency is everything"}</p>
          </div>
        </div>
      )}

      {/* ── Quick nav grid ── */}
      <p style={{ fontSize:11,fontWeight:700,color:C.g500,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8 }}>Quick Access</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          { id:"appointments", icon:"calendar",  label:"Appointments", sub:`${upcoming.length} upcoming`,    color:C.p600,  bg:C.p50 },
          { id:"exercises",    icon:"dumbbell",   label:"Exercises",    sub:myHep?`${todayExercises.length} today`:"No program", color:C.teal600, bg:C.teal50 },
          { id:"documents",    icon:"folder",     label:"Documents",    sub:"Upload & view files",            color:C.b600,  bg:C.b50 },
          { id:"outcomes",     icon:"activity",   label:"Progress",     sub:"Scores & trends",                color:C.a600,  bg:C.a50 },
        ].map(item=>(
          <button key={item.id} onClick={()=>onNav(item.id)} style={{ background:"#fff",border:`1px solid ${C.g200}`,borderRadius:14,padding:"14px",textAlign:"left",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,.04)",display:"flex",flexDirection:"column",gap:6 }}>
            <div style={{ width:34,height:34,borderRadius:9,background:item.bg,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <Ic n={item.icon} s={17} c={item.color} sw={2}/>
            </div>
            <p style={{ fontSize:13,fontWeight:700,color:C.g800 }}>{item.label}</p>
            <p style={{ fontSize:11,color:C.g400 }}>{item.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB: APPOINTMENTS
══════════════════════════════════════════════════════ */
function AppointmentsTab({ patient, appts, setAppts, allAppts, setAllAppts, providers, clinicId, toast }) {
  const [tab, setTab]           = useState("upcoming");
  const [showBook, setShowBook] = useState(false);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [cancelModal, setCancelModal] = useState(null); // {id}
  const [cancelReason, setCancelReason] = useState("");
  const [waitlistModal, setWaitlistModal] = useState(false);
  const [wForm, setWForm]       = useState({ type:"Follow-up", provider:"", notes:"", availability:"" });
  const [date, setDate]         = useState("");
  const [provider, setProv]     = useState(providers[0] || "");
  const [time, setTime]         = useState("");
  const [apptType, setType]     = useState("Follow-up");
  const [notes, setNotes]       = useState("");
  const [saving, setSaving]     = useState(false);

  const APPT_TYPES = ["Initial Assessment","Follow-up","Re-assessment","Manual Therapy","Dry Needling","Group Session","Telehealth","Discharge Assessment"];
  const ALL_SLOTS  = ["07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];

  // Slots already taken on the selected date (optionally filtered by provider)
  const takenSlots = new Set(
    (allAppts || [])
      .filter(a => a.date === date && a.status !== "Cancelled" && (!provider || !a.provider || a.provider === provider))
      .map(a => a.time)
  );
  const availableSlots = date ? ALL_SLOTS.filter(s => !takenSlots.has(s)) : [];

  function openBook() {
    setDate(""); setTime(""); setProv(providers[0]||""); setType("Follow-up"); setNotes("");
    setShowBook(true);
  }

  async function bookAppt() {
    if (!date || !time) return;
    setSaving(true);
    // If rescheduling, cancel the old one first
    if (rescheduleId) {
      const old = appts.find(a => a.id === rescheduleId);
      if (old) {
        const updated = { ...old, status:"Cancelled", cancelReason:"Rescheduled by patient" };
        await supabase.from("appointments").upsert({ id:old.id, clinic_id:clinicId, data:updated });
        setAppts(p => p.map(a => a.id === rescheduleId ? updated : a));
        setAllAppts(p => p.map(a => a.id === rescheduleId ? updated : a));
      }
    }
    const newAppt = {
      id: `AP-${Date.now()}`,
      pid: patient.id,
      _cid: clinicId,
      status: "Scheduled",
      duration: 30,
      room: "TBD",
      type: apptType,
      date, time,
      provider: provider || "",
      cc: notes || (rescheduleId ? "Rescheduled by patient via portal" : ""),
    };
    const { error } = await supabase.from("appointments").upsert({ id:newAppt.id, clinic_id:clinicId, data:newAppt });
    setSaving(false);
    if (error) { toast("Couldn't book — please call the clinic", "error"); return; }
    setAppts(p => [newAppt, ...p]);
    setAllAppts(p => [newAppt, ...p]);
    setShowBook(false); setRescheduleId(null);
    toast(rescheduleId ? "Rescheduled successfully!" : `Booked! ${fmtDateFull(date)} at ${fmtTime(time)}`);
  }

  async function cancelAppt() {
    if (!cancelModal) return;
    const a = appts.find(x => x.id === cancelModal.id);
    if (!a) return;
    const updated = { ...a, status:"Cancelled", cancelReason: cancelReason || "Cancelled by patient" };
    const { error } = await supabase.from("appointments").upsert({ id:a.id, clinic_id:clinicId, data:updated });
    if (error) { toast("Could not cancel — please call the clinic", "error"); }
    else {
      setAppts(p => p.map(x => x.id === a.id ? updated : x));
      setAllAppts(p => p.map(x => x.id === a.id ? updated : x));
      toast("Appointment cancelled.");
    }
    setCancelModal(null); setCancelReason("");
  }

  async function joinWaitlist() {
    const msg = {
      id: `MSG-${Date.now()}`,
      pid: patient.id, _cid: clinicId,
      fromType:"patient", fromName:`${patient.fn} ${patient.ln}`,
      body:`WAITLIST REQUEST\nType: ${wForm.type}\nProvider: ${wForm.provider||"Any"}\nAvailability: ${wForm.availability||"Flexible"}\nNotes: ${wForm.notes||"None"}`,
      ts: new Date().toISOString(), read:false,
    };
    await supabase.from("messages").insert([{ id:msg.id, clinic_id:clinicId, data:msg }]);
    setWaitlistModal(false);
    toast("You've been added to the waitlist! We'll contact you soon.");
  }

  const upcoming = appts.filter(a => isFuture(a.date) && a.status !== "Cancelled").sort((a,b) => a.date.localeCompare(b.date));
  const past     = appts.filter(a => isPast(a.date)   || a.status === "Completed" || a.status === "Cancelled").sort((a,b) => b.date.localeCompare(a.date));

  function ApptCard({ a }) {
    const isUpcoming = isFuture(a.date) && a.status !== "Cancelled" && a.status !== "Completed";
    const [confirmed, setConfirmed] = useState(() => !!localStorage.getItem(`appt_confirmed_${a.id}`));
    const [savingConfirm, setSavingConfirm] = useState(false);
    const daysUntil = Math.ceil((new Date(a.date+"T12:00:00") - new Date()) / 86400000);
    const showConfirmCTA = isUpcoming && daysUntil <= 2 && daysUntil >= 0 && !confirmed;
    return (
      <div style={{ background:C.w, borderRadius:14, border:`1px solid ${confirmed?C.gr100:C.g200}`, padding:"14px 16px", marginBottom:10, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <p style={{ fontSize:14, fontWeight:700, color:C.g800 }}>{a.type}</p>
          <Bdg label={confirmed?"Confirmed":a.status} color={confirmed?"green":apptColor(a.status)}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:3, marginBottom: isUpcoming ? 12 : 0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:C.g600 }}>
            <Ic n="calendar" s={13} c={C.g400} sw={2}/>{fmtDateFull(a.date)}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:C.g500 }}>
            <Ic n="clock" s={13} c={C.g400} sw={2}/>{fmtTime(a.time)} · {a.duration} min
          </div>
          {a.provider && <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:C.g500 }}>
            <Ic n="user" s={13} c={C.g400} sw={2}/>{a.provider}
          </div>}
          {a.cancelReason && <p style={{ fontSize:11, color:C.g400, fontStyle:"italic", marginTop:2 }}>Reason: {a.cancelReason}</p>}
        </div>
        {isUpcoming && (
          <div style={{ borderTop:`1px solid ${C.g100}`, paddingTop:10 }}>
            {showConfirmCTA && (
              <button onClick={async()=>{ setSavingConfirm(true); localStorage.setItem(`appt_confirmed_${a.id}`,"1"); const updated={...a,confirmStatus:"confirmed"}; await supabase.from("appointments").update({data:updated}).match({id:a.id}); setAppts(p=>p.map(x=>x.id===a.id?updated:x)); setConfirmed(true); setSavingConfirm(false); toast("Appointment confirmed!"); }}
                disabled={savingConfirm} style={{ width:"100%", marginBottom:8, padding:"10px", background:C.p500, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {savingConfirm?"Saving…":"I'll Be There — Confirm Attendance"}
              </button>
            )}
            {confirmed && (
              <div style={{ marginBottom:8, display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:C.gr50, borderRadius:9, fontSize:13, color:C.gr700, fontWeight:600 }}>
                <Ic n="check" s={13} c={C.gr600} sw={2.5}/>Confirmed — see you then!
              </div>
            )}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>{ setRescheduleId(a.id); setType(a.type); setProv(a.provider||""); setDate(""); setTime(""); setNotes(""); setShowBook(true); }} style={{ flex:1, padding:"7px", border:`1.5px solid ${C.p200}`, borderRadius:9, background:C.p50, color:C.p700, fontSize:12, fontWeight:700, cursor:"pointer" }}>Reschedule</button>
              <button onClick={()=>{ setCancelModal({ id:a.id }); setCancelReason(""); }} style={{ flex:1, padding:"7px", border:"1.5px solid #fca5a5", borderRadius:9, background:C.r50, color:"#dc2626", fontSize:12, fontWeight:700, cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <SectionHead
        title="Appointments"
        sub="View your schedule and book new visits"
        action={<button onClick={openBook} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:C.p500, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}><Ic n="plus" s={14} c="#fff" sw={2.5}/>Book</button>}
      />

      {/* Tab switcher */}
      <div style={{ display:"flex", gap:4, background:C.g100, borderRadius:10, padding:3, marginBottom:16 }}>
        {[["upcoming","Upcoming"], ["past","Past"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:"7px 12px", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", background:tab===k?C.w:"transparent", color:tab===k?C.p600:C.g500, boxShadow:tab===k?"0 1px 4px rgba(0,0,0,.08)":"none", transition:"all .15s" }}>{l} {k==="upcoming"?`(${upcoming.length})`:`(${past.length})`}</button>
        ))}
      </div>

      {/* Waitlist CTA */}
      <div style={{ marginBottom:14, background:C.p50, border:`1px solid ${C.p100}`, borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:C.p700 }}>No good slots available?</p>
          <p style={{ fontSize:12, color:C.p500, marginTop:1 }}>Join the waitlist and we'll reach out when something opens up.</p>
        </div>
        <button onClick={()=>setWaitlistModal(true)} style={{ padding:"7px 14px", background:C.p500, color:"#fff", border:"none", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0, marginLeft:10 }}>Waitlist</button>
      </div>

      {tab === "upcoming" && (
        upcoming.length ? upcoming.map(a => <ApptCard key={a.id} a={a}/>) : <Empty icon="calendar" title="No upcoming appointments" sub="Hit Book to schedule your next visit."/>
      )}
      {tab === "past" && (
        past.length ? past.map(a => <ApptCard key={a.id} a={a}/>) : <Empty icon="calendar" title="No past appointments" sub="Your visit history will appear here."/>
      )}

      {/* Cancel modal */}
      {cancelModal && ReactDOM.createPortal(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:C.w,borderRadius:18,width:"100%",maxWidth:380,padding:"24px 22px",boxShadow:"0 20px 60px rgba(0,0,0,.25)" }}>
            <h3 style={{ fontSize:16,fontWeight:800,color:C.g800,marginBottom:6 }}>Cancel Appointment</h3>
            <p style={{ fontSize:13,color:C.g500,marginBottom:18 }}>Let your clinic know why you're cancelling so they can prepare.</p>
            <label style={{ fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:6 }}>Reason</label>
            <select value={cancelReason} onChange={e=>setCancelReason(e.target.value)} style={{ ...IST,marginBottom:18 }}>
              <option value="">Select a reason…</option>
              {["Feeling better","Work conflict","Transport issue","Personal emergency","Appointment time no longer works","Switching to another clinic","Other"].map(r=><option key={r}>{r}</option>)}
            </select>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setCancelModal(null)} style={{ flex:1,padding:"10px",border:`1.5px solid ${C.g200}`,borderRadius:10,background:C.w,color:C.g600,fontSize:13,fontWeight:700,cursor:"pointer" }}>Go Back</button>
              <button onClick={cancelAppt} style={{ flex:1,padding:"10px",border:"none",borderRadius:10,background:"#dc2626",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>Cancel Appointment</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Waitlist modal */}
      {waitlistModal && ReactDOM.createPortal(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:C.w,borderRadius:18,width:"100%",maxWidth:420,padding:"24px 22px",boxShadow:"0 20px 60px rgba(0,0,0,.25)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <h3 style={{ fontSize:16,fontWeight:800,color:C.g800 }}>Join the Waitlist</h3>
              <button onClick={()=>setWaitlistModal(false)} style={{ background:"none",border:"none",fontSize:20,color:C.g400,cursor:"pointer" }}>×</button>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:18 }}>
              <div><label style={{ fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:5 }}>Visit Type</label><select value={wForm.type} onChange={e=>setWForm(p=>({...p,type:e.target.value}))} style={IST}>{["Initial Assessment","Follow-up","Re-assessment","Telehealth"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{ fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:5 }}>Preferred Provider</label><select value={wForm.provider} onChange={e=>setWForm(p=>({...p,provider:e.target.value}))} style={IST}><option value="">Any provider</option>{providers.map(pr=><option key={pr}>{pr}</option>)}</select></div>
              <div><label style={{ fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:5 }}>Your Availability</label><input value={wForm.availability} onChange={e=>setWForm(p=>({...p,availability:e.target.value}))} placeholder="e.g. Mornings only, Mon–Wed" style={IST}/></div>
              <div><label style={{ fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:5 }}>Notes</label><textarea value={wForm.notes} onChange={e=>setWForm(p=>({...p,notes:e.target.value}))} placeholder="Anything else the clinic should know…" rows={2} style={{ ...IST,resize:"none" }}/></div>
            </div>
            <button onClick={joinWaitlist} style={{ width:"100%",padding:"12px",background:C.p500,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer" }}>Add Me to the Waitlist</button>
          </div>
        </div>,
        document.body
      )}

      {/* ── Booking modal — portal-rendered to escape CSS stacking contexts ── */}
      {showBook && ReactDOM.createPortal(
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(15,10,30,.6)", backdropFilter:"blur(3px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:C.w, borderRadius:"20px", width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto", padding:"24px 22px 28px", boxShadow:"0 24px 64px rgba(0,0,0,.25)" }}>

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <h3 style={{ fontSize:16, fontWeight:800, color:C.g800 }}>Book an Appointment</h3>
              <button onClick={() => setShowBook(false)} style={{ background:C.g100, border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}><Ic n="x" s={16} c={C.g500}/></button>
            </div>

            {/* Step 1: Type + Provider */}
            <div style={{ display:"grid", gridTemplateColumns: providers.length > 0 ? "1fr 1fr" : "1fr", gap:12, marginBottom:16 }}>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.g600, marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Appointment Type</label>
                <select value={apptType} onChange={e=>setType(e.target.value)} style={IST}>
                  {APPT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              {providers.length > 0 && (
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.g600, marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Provider</label>
                  <select value={provider} onChange={e=>{ setProv(e.target.value); setTime(""); }} style={IST}>
                    <option value="">Any provider</option>
                    {providers.map(pr=><option key={pr}>{pr}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Step 2: Date */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.g600, marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Date</label>
              <input type="date" value={date} min={TODAY} onChange={e=>{ setDate(e.target.value); setTime(""); }} style={{ ...IST, cursor:"pointer" }}/>
            </div>

            {/* Step 3: Available time slots */}
            {date && (
              <div style={{ marginBottom:18 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.g600, marginBottom:10, textTransform:"uppercase", letterSpacing:0.5 }}>
                  Available Times — {fmtDateFull(date)}
                </label>
                {availableSlots.length === 0 ? (
                  <div style={{ background:C.g50, borderRadius:10, padding:"16px", textAlign:"center" }}>
                    <p style={{ fontSize:13, fontWeight:600, color:C.g600 }}>No slots available on this date</p>
                    <p style={{ fontSize:12, color:C.g400, marginTop:4 }}>Please choose a different date</p>
                    <button onClick={()=>{ setShowBook(false); setWaitlistModal(true); }} style={{ marginTop:10, padding:"8px 16px", background:C.p500, color:"#fff", border:"none", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer" }}>Join Waitlist Instead</button>
                  </div>
                ) : (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
                    {ALL_SLOTS.map(slot => {
                      const taken = takenSlots.has(slot);
                      const selected = time === slot;
                      return (
                        <button
                          key={slot}
                          disabled={taken}
                          onClick={() => setTime(slot)}
                          style={{
                            padding:"8px 4px",
                            border: selected ? `2px solid ${C.p500}` : `1.5px solid ${taken ? C.g200 : C.g200}`,
                            borderRadius:9,
                            fontSize:12,
                            fontWeight: selected ? 700 : 500,
                            cursor: taken ? "not-allowed" : "pointer",
                            background: selected ? C.p500 : taken ? C.g100 : C.w,
                            color: selected ? "#fff" : taken ? C.g300 : C.g700,
                            textDecoration: taken ? "line-through" : "none",
                            transition:"all .12s",
                          }}
                        >
                          {fmtTime(slot)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Notes */}
            {time && (
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.g600, marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>Notes (optional)</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Anything the clinic should know beforehand…" rows={2} style={{...IST, resize:"none"}}/>
              </div>
            )}

            {/* Confirm summary + book button */}
            {time && (
              <button onClick={bookAppt} disabled={saving} style={{ width:"100%", padding:"13px", background:saving?C.g300:C.p500, color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"background .15s" }}>
                {saving
                  ? <><div style={{ width:15,height:15,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Booking…</>
                  : `Confirm — ${fmtDateFull(date)} at ${fmtTime(time)}`
                }
              </button>
            )}

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── IST (input style token) ──────────────────────────── */
const IST = { width:"100%", padding:"9px 12px", border:`1.5px solid ${C.g200}`, borderRadius:9, fontSize:13, color:C.g800, fontFamily:"inherit", outline:"none", background:C.w, boxSizing:"border-box" };

/* ══════════════════════════════════════════════════════
   TAB: EXERCISES (HEP + VIDEO LIBRARY)
══════════════════════════════════════════════════════ */
function VideoLibrary({ exerciseLib }) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [playUrl, setPlayUrl] = useState(null);

  const videos = exerciseLib.filter(e => e.videoUrl);
  const regions = ["All", ...new Set(videos.map(e => e.region).filter(Boolean))].sort((a,b)=>a==="All"?-1:a.localeCompare(b));
  const q = search.toLowerCase().trim();
  const filtered = videos.filter(e =>
    (region === "All" || e.region === region) &&
    (!q || (e.name||"").toLowerCase().includes(q) || (e.region||"").toLowerCase().includes(q) || (e.category||"").toLowerCase().includes(q))
  );

  // Extract YouTube thumbnail
  function ytThumb(url) {
    const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
  }

  return (
    <div>
      <SectionHead title="Exercise Video Library" sub="Browse demo videos for all exercises"/>

      {/* Search + filter */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:180 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}><Ic n="search" s={14} c={C.g400}/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exercises…" style={{ ...IST, paddingLeft:34, fontSize:13, width:"100%", boxSizing:"border-box" }}/>
        </div>
        <select value={region} onChange={e=>setRegion(e.target.value)} style={{ ...IST, fontSize:13, minWidth:140, cursor:"pointer" }}>
          {regions.map(r=><option key={r} value={r}>{r==="All"?"All Regions":r}</option>)}
        </select>
      </div>

      {videos.length === 0 && (
        <div style={{ textAlign:"center", padding:"48px 24px", background:C.w, borderRadius:16, border:`1px solid ${C.g200}` }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🎬</div>
          <p style={{ fontSize:15, fontWeight:700, color:C.g700, marginBottom:6 }}>No videos yet</p>
          <p style={{ fontSize:13, color:C.g400, lineHeight:1.6 }}>Your clinic hasn't added exercise demo videos yet.<br/>Ask your therapist — they can upload them to the library.</p>
        </div>
      )}

      {videos.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"32px", color:C.g400 }}>
          <p style={{ fontSize:14, fontWeight:600 }}>No videos match your search.</p>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
        {filtered.map(ex => {
          const thumb = ytThumb(ex.videoUrl);
          return (
            <div key={ex.id} style={{ background:C.w, borderRadius:14, border:`1px solid ${C.g200}`, overflow:"hidden", boxShadow:"0 2px 10px rgba(124,58,237,.06)", cursor:"pointer", transition:"transform .15s, box-shadow .15s" }}
              onClick={() => setPlayUrl(ex.videoUrl)}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(124,58,237,.13)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 10px rgba(124,58,237,.06)";}}>
              {/* Thumbnail */}
              <div style={{ position:"relative", background: thumb?"#000":C.p50, height:130, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                {thumb
                  ? <img src={thumb} alt={ex.name} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.85 }} onError={e=>e.currentTarget.style.display="none"}/>
                  : (ex.svg
                      ? <div style={{ width:100, height:80, opacity:.7 }} dangerouslySetInnerHTML={{ __html: ex.svg }}/>
                      : ex.imageUrl
                        ? <img src={ex.imageUrl} alt={ex.name} style={{ width:100, height:80, objectFit:"contain" }}/>
                        : <Ic n="play-circle" s={36} c={C.p300} sw={1.5}/>
                    )
                }
                {/* Play overlay */}
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(124,58,237,.85)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(0,0,0,.3)" }}>
                    <Ic n="play" s={18} c="#fff" sw={2.5}/>
                  </div>
                </div>
              </div>
              {/* Info */}
              <div style={{ padding:"10px 12px" }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.g800, marginBottom:5, lineHeight:1.3 }}>{ex.name}</p>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                  {ex.region && <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:99, background:C.p50, color:C.p700, border:`1px solid ${C.p100}` }}>{ex.region}</span>}
                  {ex.category && <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:99, background:C.g100, color:C.g600, border:`1px solid ${C.g200}` }}>{ex.category}</span>}
                </div>
                {ex.desc && <p style={{ fontSize:11, color:C.g400, marginTop:5, lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{ex.desc}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Video player modal — portal to escape CSS transform stacking context */}
      {playUrl && ReactDOM.createPortal(
        <div onClick={()=>setPlayUrl(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#000", borderRadius:16, overflow:"hidden", width:"100%", maxWidth:780, boxShadow:"0 24px 80px rgba(0,0,0,.5)" }}>
            {/* If YouTube, embed; otherwise direct video */}
            {/youtube\.com|youtu\.be/.test(playUrl) ? (
              <iframe
                src={`https://www.youtube.com/embed/${playUrl.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1]}?autoplay=1`}
                style={{ width:"100%", aspectRatio:"16/9", border:"none", display:"block" }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : /vimeo\.com/.test(playUrl) ? (
              <iframe
                src={`https://player.vimeo.com/video/${playUrl.match(/vimeo\.com\/(\d+)/)?.[1]}?autoplay=1`}
                style={{ width:"100%", aspectRatio:"16/9", border:"none", display:"block" }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <video src={playUrl} controls autoPlay style={{ width:"100%", aspectRatio:"16/9", display:"block", background:"#000" }}/>
            )}
            <div style={{ padding:"10px 16px", display:"flex", justifyContent:"flex-end" }}>
              <button onClick={()=>setPlayUrl(null)} style={{ background:"rgba(255,255,255,.15)", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>✕ Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ExercisesTab({ patient, heps, exerciseLib, plans, outcomes, toast, clinicId }) {
  const [subTab, setSubTab]       = useState("program");
  const [selHep, setSelHep]       = useState(heps[0]?.id || null);
  const [painCapture, setPainCapture] = useState(null); // { exId, exName } — show pain slider after marking done
  const [painVal, setPainVal]     = useState(5);
  const [savingPain, setSavingPain] = useState(false);
  const [flagging, setFlagging]   = useState(null); // exId being flagged

  const hep = heps.find(h => h.id === selHep) || heps[0];

  const doneKey = (exId) => `hep_done_${TODAY}_${patient.id}_${exId}`;
  const [done, setDone]  = useState(() => {
    const d = {};
    (hep?.exercises || []).forEach(e => { d[e.exId] = !!localStorage.getItem(doneKey(e.exId)); });
    return d;
  });

  // Reset done state when HEP changes
  useEffect(() => {
    if (!hep) return;
    const d = {};
    hep.exercises.forEach(e => { d[e.exId] = !!localStorage.getItem(doneKey(e.exId)); });
    setDone(d);
  }, [selHep]);

  // Also set global daily done flag for streak tracking
  function markDailyDone() {
    localStorage.setItem(`hep_done_${TODAY}_${patient.id}`, "1");
  }

  function toggleDone(exId, exName) {
    const key = doneKey(exId);
    const nowDone = !done[exId];
    if (nowDone) {
      localStorage.setItem(key, "1");
      markDailyDone();
      setPainCapture({ exId, exName });
      setPainVal(5);
    } else {
      localStorage.removeItem(key);
    }
    setDone(p => ({ ...p, [exId]: nowDone }));
    if (nowDone) toast("Exercise marked complete!", "success");
  }

  async function submitPain() {
    if (!painCapture) return;
    setSavingPain(true);
    const record = { id:`OC-${Date.now()}`, pid:patient.id, type:"post_exercise_pain", exId:painCapture.exId, exName:painCapture.exName, pain:painVal, date:TODAY, ts:new Date().toISOString() };
    await supabase.from("pt_outcomes").insert([{ id:record.id, clinic_id:clinicId, data:record }]);
    setSavingPain(false);
    setPainCapture(null);
    toast("Pain level recorded — your therapist will see this.", "success");
  }

  async function flagExercise(exId, exName) {
    setFlagging(exId);
    const msgId = `FLAG-${Date.now()}`;
    const body = `EXERCISE FLAG: Patient reports "${exName}" is causing pain or difficulty. Please review this exercise.`;
    const msg = { id:msgId, pid:patient.id, fromType:"patient", fromName:`${patient.fn} ${patient.ln}`, body, ts:new Date().toISOString(), read:false, flagType:"exercise_concern" };
    await supabase.from("messages").insert([{ id:msgId, clinic_id:clinicId, data:msg }]);
    setFlagging(null);
    toast("Message sent to your care team.", "success");
  }

  const videoCount = exerciseLib.filter(e => e.videoUrl).length;

  return (
    <div>
      {/* Sub-tab switcher */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:C.g100, borderRadius:12, padding:4, width:"fit-content" }}>
        {[["program","My Program","dumbbell"],["videos","Video Library","play-circle"],["plan","My Plan","clipboard"]].map(([id,label,icon])=>(
          <button key={id} onClick={()=>setSubTab(id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:9, border:"none", cursor:"pointer", fontWeight:subTab===id?700:500, fontSize:13, background:subTab===id?C.w:"transparent", color:subTab===id?C.p600:C.g500, boxShadow:subTab===id?"0 1px 4px rgba(0,0,0,.1)":"none", transition:"all .15s" }}>
            <Ic n={icon} s={13} c={subTab===id?C.p600:C.g400} sw={2}/>
            {label}
            {id==="videos"&&videoCount>0&&<span style={{ fontSize:10, fontWeight:700, background:C.p100, color:C.p700, borderRadius:99, padding:"1px 6px" }}>{videoCount}</span>}
          </button>
        ))}
      </div>

      {subTab === "videos" && <VideoLibrary exerciseLib={exerciseLib}/>}

      {subTab === "plan" && <PlanTab patient={patient} plans={plans} outcomes={outcomes}/>}

      {subTab === "program" && !heps.length && <Empty icon="dumbbell" title="No exercises assigned" sub="Your physiotherapist will add your home exercise program here."/>}

      {subTab === "program" && heps.length > 0 && (() => {
        const doneCount  = Object.values(done).filter(Boolean).length;
        const totalCount = hep?.exercises?.length || 0;
        const pct        = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
        return (
          <div>
            <SectionHead title="Home Exercise Program" sub="Complete your daily exercises and track progress"/>
            {/* HEP selector (if multiple) */}
            {heps.length > 1 && (
              <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:14 }}>
                {heps.map(h => (
                  <button key={h.id} onClick={() => setSelHep(h.id)} style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${selHep===h.id?C.p400:C.g200}`, background:selHep===h.id?C.p50:"#fff", color:selHep===h.id?C.p600:C.g600, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{h.title}</button>
                ))}
              </div>
            )}
            {hep && (
              <>
                {/* Progress bar */}
                <Card style={{ marginBottom:14, padding:"16px 18px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:C.g800 }}>{hep.title}</p>
                      <p style={{ fontSize:12, color:C.g400, marginTop:1 }}>{hep.exercises?.length} exercises · {hep.exercises?.[0]?.freq || "Daily"}</p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:22, fontWeight:800, color: pct===100?C.gr600:C.p500 }}>{pct}%</p>
                      <p style={{ fontSize:11, color:C.g400 }}>today</p>
                    </div>
                  </div>
                  <div style={{ height:7, background:C.g100, borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:pct===100?`linear-gradient(90deg,${C.gr600},${C.gr500})`:`linear-gradient(90deg,${C.p600},${C.p400})`, borderRadius:99, transition:"width .4s ease" }}/>
                  </div>
                  <p style={{ fontSize:12, color:C.g400, marginTop:8 }}>{doneCount} of {totalCount} done today{pct===100?" — Great work! 🎉":""}</p>
                </Card>
                {/* Exercise cards */}
                {hep.exercises?.map((ex, i) => {
                  const libEx  = exerciseLib.find(e => e.id === ex.exId) || {};
                  const isDone = done[ex.exId];
                  return (
                    <div key={ex.exId || i} style={{ background:C.w, borderRadius:14, border:`1.5px solid ${isDone?C.gr600+"44":C.g200}`, marginBottom:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)", transition:"border-color .2s" }}>
                      {/* Visual header — uses clinic SVG/image if present, body-region diagram otherwise */}
                      <div style={{ background:isDone?C.gr50:C.p50, display:"flex", justifyContent:"center", alignItems:"center", gap:14, padding:"12px 18px 10px", borderBottom:`1px solid ${isDone?C.gr100:C.p100}` }}>
                        {libEx.svg
                          ? <div style={{ width:110, height:75, opacity:isDone?0.6:1, transition:"opacity .2s" }} dangerouslySetInnerHTML={{ __html: libEx.svg }}/>
                          : libEx.imageUrl
                          ? <img src={libEx.imageUrl} alt={libEx.name} style={{ width:110, height:75, objectFit:"contain", opacity:isDone?0.6:1, transition:"opacity .2s" }} onError={e=>e.currentTarget.style.display="none"}/>
                          : <ExRegionSVG region={libEx.region} isDone={isDone}/>
                        }
                        {!libEx.svg && !libEx.imageUrl && (
                          <div>
                            <p style={{ fontSize:9, fontWeight:700, color:C.g400, textTransform:"uppercase", letterSpacing:.7, marginBottom:3 }}>Target Area</p>
                            <p style={{ fontSize:14, fontWeight:800, color:REGION_COLOR[(libEx.region||"").split("/")[0].trim()]||C.p600, lineHeight:1.2 }}>{libEx.region||libEx.category||"General"}</p>
                            {libEx.category && libEx.region && <p style={{ fontSize:11, color:C.g500, marginTop:2 }}>{libEx.category}</p>}
                          </div>
                        )}
                      </div>
                      {/* Demo video link — clinic-uploaded URL or YouTube search fallback */}
                      <div style={{padding:"8px 18px 0"}}>
                        <a href={libEx.videoUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent((libEx.name||ex.exId)+" physical therapy exercise")}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:libEx.videoUrl?C.p600:C.g500,textDecoration:"none",background:libEx.videoUrl?C.p50:C.g50,border:`1px solid ${libEx.videoUrl?C.p200:C.g200}`,borderRadius:7,padding:"5px 10px"}}>
                          ▶ {libEx.videoUrl ? "Watch Demo Video" : "Find demo on YouTube"}
                        </a>
                      </div>
                      <div style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                          <div style={{ flex:1, paddingRight:10 }}>
                            <p style={{ fontSize:14, fontWeight:700, color:isDone?C.gr700:C.g800, textDecoration:isDone?"line-through":"none", transition:"all .2s" }}>{libEx.name || ex.exId}</p>
                            {libEx.desc && <p style={{ fontSize:12, color:C.g500, marginTop:3, lineHeight:1.5 }}>{libEx.desc}</p>}
                          </div>
                          {isDone && <div style={{ flexShrink:0, width:26, height:26, borderRadius:"50%", background:C.gr600, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic n="check" s={13} c="#fff" sw={2.5}/></div>}
                        </div>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                          {[ex.sets&&`${ex.sets} sets`,ex.reps&&`${ex.reps} reps`,ex.hold&&`${ex.hold}s hold`,ex.freq&&ex.freq].filter(Boolean).map((tag,j)=>(
                            <span key={j} style={{ background:C.p50, color:C.p600, border:`1px solid ${C.p100}`, borderRadius:6, fontSize:11, fontWeight:600, padding:"2px 8px" }}>{tag}</span>
                          ))}
                        </div>
                        {libEx.region && <p style={{ fontSize:11, color:C.g400, marginBottom:10 }}>🎯 {libEx.region} · {libEx.category}</p>}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:8 }}>
                          <button onClick={() => toggleDone(ex.exId, libEx.name||ex.exId)} style={{ padding:"9px", border:`1.5px solid ${isDone?C.gr600:C.p300}`, borderRadius:9, background:isDone?C.gr600:C.w, color:isDone?"#fff":C.p600, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all .2s" }}>
                            <Ic n={isDone?"check":"repeat"} s={14} c={isDone?"#fff":C.p600} sw={2.5}/>
                            {isDone ? "Done for today" : "Mark Complete"}
                          </button>
                          <button onClick={() => flagExercise(ex.exId, libEx.name||ex.exId)} disabled={flagging===ex.exId} title="Report pain or difficulty with this exercise" style={{ padding:"9px 12px", border:`1.5px solid #fca5a5`, borderRadius:9, background:C.r50, color:C.r600, fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap", transition:"all .2s", opacity:flagging===ex.exId?0.6:1 }}>
                            <Ic n="heart" s={13} c={C.r600} sw={2}/>
                            {flagging===ex.exId?"…":"Hurts?"}
                          </button>
                        </div>
                        {/* Post-exercise pain capture — shown inline after marking done */}
                        {painCapture?.exId === ex.exId && (
                          <div style={{ marginTop:12, background:C.p50, border:`1.5px solid ${C.p200}`, borderRadius:12, padding:"14px 16px" }}>
                            <p style={{ fontSize:13, fontWeight:700, color:C.p700, marginBottom:8 }}>How do you feel after this exercise? (0 = no pain, 10 = severe)</p>
                            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                              <input type="range" min={0} max={10} value={painVal} onChange={e=>setPainVal(Number(e.target.value))} style={{ flex:1, accentColor:C.p500 }}/>
                              <div style={{ width:40, height:40, borderRadius:10, background:painVal>=7?C.r600:painVal>=4?C.a600:C.gr600, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff", flexShrink:0 }}>{painVal}</div>
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                              <button onClick={submitPain} disabled={savingPain} style={{ padding:"9px", background:C.p500, color:"#fff", border:"none", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer" }}>{savingPain?"Saving…":"Record & Continue"}</button>
                              <button onClick={()=>setPainCapture(null)} style={{ padding:"9px", background:"#fff", color:C.g500, border:`1.5px solid ${C.g200}`, borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer" }}>Skip</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {hep.notes && (
                  <div style={{ background:C.b50, border:`1px solid ${C.b100}`, borderRadius:12, padding:"12px 14px", marginTop:4, fontSize:13, color:C.b600 }}>
                    <strong>Notes from your physio:</strong> {hep.notes}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB: TREATMENT PLAN
══════════════════════════════════════════════════════ */
function PlanTab({ patient, plans, outcomes }) {
  const [selId, setSelId] = useState(plans[0]?.id || null);
  const plan = plans.find(p => p.id === selId) || plans[0];
  const planOutcomes = outcomes.filter(o => o.planId === selId);

  if (!plans.length) return <Empty icon="clipboard" title="No treatment plan yet" sub="Your therapist's plan for your recovery will appear here."/>;

  const phases = ["Phase 1 – Baseline & Education","Phase 2 – Strengthening","Phase 3 – Functional Training","Phase 4 – Return to Activity"];

  return (
    <div>
      <SectionHead title="Treatment Plan" sub="Your recovery roadmap"/>

      {/* Plan selector */}
      {plans.length > 1 && (
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:14 }}>
          {plans.map(p => (
            <button key={p.id} onClick={() => setSelId(p.id)} style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${selId===p.id?C.teal600:C.g200}`, background:selId===p.id?C.teal50:"#fff", color:selId===p.id?C.teal600:C.g600, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{p.title}</button>
          ))}
        </div>
      )}

      {plan && (
        <>
          <Card style={{ marginBottom:14 }}>
            <div style={{ background:`linear-gradient(135deg,${C.teal50},${C.p50})`, padding:"16px 18px", borderBottom:`1px solid ${C.g100}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <p style={{ fontSize:15, fontWeight:800, color:C.g800, marginBottom:3 }}>{plan.title}</p>
                  <Bdg label={plan.status || "Active"} color={plan.status==="Active"?"teal":"gray"}/>
                </div>
              </div>
            </div>
            <div style={{ padding:"16px 18px" }}>
              {[
                { label:"Diagnosis", value:plan.diagnosis },
                { label:"Therapist", value:plan.therapist },
                { label:"Started", value:fmtDate(plan.startDate) },
                { label:"Review Date", value:plan.reviewDate ? fmtDate(plan.reviewDate) : "TBD" },
                { label:"Sessions", value:plan.sessions ? `${plan.sessions} planned` : "—" },
              ].filter(f => f.value).map((f, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i < 4 ? `1px solid ${C.g100}` : "none" }}>
                  <span style={{ fontSize:12, color:C.g500, fontWeight:600 }}>{f.label}</span>
                  <span style={{ fontSize:13, color:C.g800, fontWeight:500 }}>{f.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Goal */}
          {plan.goal && (
            <Card style={{ marginBottom:14 }}>
              <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.g100}`, display:"flex", alignItems:"center", gap:8 }}>
                <Ic n="star" s={15} c={C.a600} sw={2}/>
                <span style={{ fontSize:11, fontWeight:700, color:C.a600, textTransform:"uppercase", letterSpacing:0.6 }}>Your Goal</span>
              </div>
              <div style={{ padding:"14px 18px" }}>
                <p style={{ fontSize:14, color:C.g700, lineHeight:1.6 }}>{plan.goal}</p>
              </div>
            </Card>
          )}

          {/* Phase progress */}
          <Card style={{ marginBottom:14 }}>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.g100}`, display:"flex", alignItems:"center", gap:8 }}>
              <Ic n="fire" s={15} c={C.p500} sw={2}/>
              <span style={{ fontSize:11, fontWeight:700, color:C.p600, textTransform:"uppercase", letterSpacing:0.6 }}>Recovery Phase</span>
            </div>
            <div style={{ padding:"14px 18px" }}>
              {phases.map((ph, i) => {
                const currentIdx = phases.indexOf(plan.phase);
                const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
                return (
                  <div key={i} style={{ display:"flex", gap:12, marginBottom: i < phases.length-1 ? 12 : 0, alignItems:"flex-start" }}>
                    <div style={{ flexShrink:0, width:24, height:24, borderRadius:"50%", background:state==="done"?C.gr600:state==="active"?C.p500:C.g200, border:`2px solid ${state==="done"?C.gr600:state==="active"?C.p400:C.g300}`, display:"flex", alignItems:"center", justifyContent:"center", marginTop:1 }}>
                      {state === "done" ? <Ic n="check" s={12} c="#fff" sw={2.5}/> : <div style={{ width:8, height:8, borderRadius:"50%", background:state==="active"?"#fff":C.g400 }}/>}
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight: state==="active"?700:500, color:state==="pending"?C.g400:C.g700 }}>{ph.split("–")[1]?.trim() || ph}</p>
                      {state === "active" && <p style={{ fontSize:11, color:C.p400, marginTop:1 }}>Current phase</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Precautions */}
          {plan.precautions && (
            <div style={{ background:C.a50, border:`1px solid #fcd34d`, borderRadius:12, padding:"12px 14px", marginBottom:14, fontSize:13, color:C.a700, display:"flex", gap:10, alignItems:"flex-start" }}>
              <Ic n="alert" s={15} c={C.a600} sw={2}/>
              <div><strong>Precautions: </strong>{plan.precautions}</div>
            </div>
          )}

          {/* Outcomes */}
          {planOutcomes.length > 0 && (
            <Card>
              <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.g100}`, display:"flex", alignItems:"center", gap:8 }}>
                <Ic n="star" s={15} c={C.p500} sw={2}/>
                <span style={{ fontSize:11, fontWeight:700, color:C.p600, textTransform:"uppercase", letterSpacing:0.6 }}>Outcome Measures</span>
              </div>
              <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:10 }}>
                {planOutcomes.map((o, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:C.g800 }}>{o.measure}</p>
                      <p style={{ fontSize:11, color:C.g400 }}>{fmtDate(o.date)}</p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:18, fontWeight:800, color:C.p500 }}>{o.score}</p>
                      {o.maxScore && <p style={{ fontSize:11, color:C.g400 }}>/ {o.maxScore}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB: BILLING
══════════════════════════════════════════════════════ */
function BillingTab({ claims }) {
  const [tab, setTab] = useState("outstanding");
  const outstanding = claims.filter(c => c.status !== "Paid" && c.status !== "Void");
  const paid        = claims.filter(c => c.status === "Paid");
  const totalOwed   = outstanding.reduce((s, c) => s + ((Number(c.amount)||0) - (Number(c.paidAmt)||0)), 0);

  const billColor = s => ({ Paid:"green", Pending:"amber", Submitted:"purple", Void:"gray" })[s] || "gray";

  function BillCard({ c }) {
    const owed = (c.amount || 0) - (c.paidAmt || 0);
    return (
      <div style={{ background:C.w, borderRadius:14, border:`1px solid ${C.g200}`, padding:"14px 16px", marginBottom:10, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:C.g800 }}>{c.description || "Treatment"}</p>
            <p style={{ fontSize:11, color:C.g400, marginTop:2 }}>{fmtDate(c.date)} · {c.insurer || "Self-pay"}</p>
          </div>
          <Bdg label={c.status} color={billColor(c.status)}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8, paddingTop:8, borderTop:`1px solid ${C.g100}` }}>
          <span style={{ fontSize:12, color:C.g500 }}>
            {(Number(c.paidAmt)||0) > 0 && c.status !== "Paid" ? `$${(Number(c.paidAmt)||0).toFixed(2)} paid` : "Billed amount"}
          </span>
          <span style={{ fontSize:16, fontWeight:800, color: c.status === "Paid" ? C.gr600 : owed > 0 ? C.r600 : C.g800 }}>
            {c.status === "Paid" ? `$${(Number(c.paidAmt)||Number(c.amount)||0).toFixed(2)}` : `$${(Number(owed)||0).toFixed(2)}`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHead title="Billing" sub="Your invoices and payment history"/>

      {/* Total owed banner */}
      {totalOwed > 0 && (
        <div style={{ background:`linear-gradient(135deg,${C.r50},#fff1f2)`, border:`1px solid #fca5a5`, borderRadius:14, padding:"16px 18px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:C.r600, textTransform:"uppercase", letterSpacing:0.5 }}>Outstanding Balance</p>
            <p style={{ fontSize:11, color:"#ef4444", marginTop:2 }}>Please contact the clinic to arrange payment.</p>
          </div>
          <p style={{ fontSize:26, fontWeight:800, color:C.r600 }}>${totalOwed.toFixed(2)}</p>
        </div>
      )}

      {totalOwed === 0 && claims.length > 0 && (
        <div style={{ background:C.gr50, border:`1px solid #a7f3d0`, borderRadius:14, padding:"14px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:C.gr600, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Ic n="check" s={15} c="#fff" sw={2.5}/></div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:C.gr700 }}>All paid up!</p>
            <p style={{ fontSize:12, color:C.gr600 }}>No outstanding balance.</p>
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:4, background:C.g100, borderRadius:10, padding:3, marginBottom:16 }}>
        {[["outstanding","Outstanding"], ["paid","Paid"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:"7px 12px", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", background:tab===k?C.w:"transparent", color:tab===k?C.p600:C.g500, boxShadow:tab===k?"0 1px 4px rgba(0,0,0,.08)":"none", transition:"all .15s" }}>{l} ({k==="outstanding"?outstanding.length:paid.length})</button>
        ))}
      </div>

      {tab === "outstanding" && (outstanding.length ? outstanding.map(c => <BillCard key={c.id} c={c}/>) : <Empty icon="dollar" title="No outstanding bills" sub="You're all clear!"/>)}
      {tab === "paid" && (paid.length ? paid.map(c => <BillCard key={c.id} c={c}/>) : <Empty icon="dollar" title="No payment history" sub="Paid invoices will appear here."/>)}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   INTAKE FORM (inside Profile tab)
══════════════════════════════════════════════════════ */
function IntakeForm({ patient, clinicId }) {
  const isComplete = patient.emergencyContact && patient.occupation;
  const [open, setOpen] = useState(!isComplete);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    emergencyContact: patient.emergencyContact || "",
    emergencyPhone:   patient.emergencyPhone   || "",
    emergencyRel:     patient.emergencyRel     || "",
    occupation:       patient.occupation       || "",
    hobbies:          patient.hobbies          || "",
    activityLevel:    patient.activityLevel    || "Moderate",
    surgeries:        patient.surgeries        || "",
    medHistory:       patient.medHistory       || "",
    currentMeds:      patient.currentMeds      || "",
    allergyText:      (patient.allergies||[]).join(", "),
    referralSource:   patient.referralSource   || "",
    chiefComplaint:   patient.chiefComplaint   || "",
  });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    const updated = {
      ...patient,
      ...form,
      allergies: form.allergyText ? form.allergyText.split(",").map(s=>s.trim()).filter(Boolean) : patient.allergies || [],
    };
    const { error } = await supabase.from("patients").upsert({ id: patient.id, clinic_id: clinicId, data: updated });
    if (!error) { setSaved(true); setOpen(false); setTimeout(()=>setSaved(false), 3000); }
    setSaving(false);
  }

  return (
    <Card style={{ marginBottom:14, overflow:"hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:"100%", padding:"14px 18px", background:"none", border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:isComplete?C.gr600:`linear-gradient(135deg,${C.p600},${C.p400})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ic n={isComplete?"check":"edit"} s={13} c="#fff" sw={2.5}/>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:C.g800 }}>{isComplete ? "Intake Form Complete ✓" : "Complete Your Intake Form"}</p>
            <p style={{ fontSize:11, color:C.g400 }}>{isComplete ? "Tap to review or update your information" : "Takes 2 min — helps your therapist prepare for your visit"}</p>
          </div>
        </div>
        <Ic n={open?"chevU":"chevD"} s={16} c={C.g400} sw={2}/>
      </button>

      {open && (
        <div style={{ padding:"0 18px 18px", borderTop:`1px solid ${C.g100}` }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.g500, textTransform:"uppercase", letterSpacing:0.6, margin:"16px 0 10px" }}>Emergency Contact</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Contact Name</label><input value={form.emergencyContact} onChange={e=>f("emergencyContact")(e.target.value)} placeholder="e.g. Jane Smith" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13 }}/></div>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Phone</label><input value={form.emergencyPhone} onChange={e=>f("emergencyPhone")(e.target.value)} placeholder="e.g. 082 555 0000" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13 }}/></div>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Relationship</label><input value={form.emergencyRel} onChange={e=>f("emergencyRel")(e.target.value)} placeholder="e.g. Spouse, Parent" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13 }}/></div>
          </div>

          <p style={{ fontSize:11, fontWeight:700, color:C.g500, textTransform:"uppercase", letterSpacing:0.6, margin:"14px 0 10px" }}>Lifestyle</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Occupation</label><input value={form.occupation} onChange={e=>f("occupation")(e.target.value)} placeholder="e.g. Office worker, Nurse" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13 }}/></div>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Activity Level</label>
              <select value={form.activityLevel} onChange={e=>f("activityLevel")(e.target.value)} style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13 }}>
                {["Sedentary","Light","Moderate","Active","Very Active"].map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:"1/-1" }}><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Hobbies / Sport</label><input value={form.hobbies} onChange={e=>f("hobbies")(e.target.value)} placeholder="e.g. Running, Cycling, Swimming" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13 }}/></div>
          </div>

          <p style={{ fontSize:11, fontWeight:700, color:C.g500, textTransform:"uppercase", letterSpacing:0.6, margin:"14px 0 10px" }}>Medical History</p>
          <div style={{ display:"grid", gap:10, marginBottom:10 }}>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Past Surgeries / Injuries</label><textarea value={form.surgeries} onChange={e=>f("surgeries")(e.target.value)} rows={2} placeholder="e.g. ACL repair 2019, appendix 2015" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13, resize:"vertical" }}/></div>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Medical Conditions</label><textarea value={form.medHistory} onChange={e=>f("medHistory")(e.target.value)} rows={2} placeholder="e.g. Diabetes, Hypertension, Osteoporosis" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13, resize:"vertical" }}/></div>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Current Medications</label><textarea value={form.currentMeds} onChange={e=>f("currentMeds")(e.target.value)} rows={2} placeholder="e.g. Metformin 500mg, Lisinopril 10mg" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13, resize:"vertical" }}/></div>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Allergies (comma-separated)</label><input value={form.allergyText} onChange={e=>f("allergyText")(e.target.value)} placeholder="e.g. Penicillin, Latex, Ibuprofen" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13 }}/></div>
          </div>

          <p style={{ fontSize:11, fontWeight:700, color:C.g500, textTransform:"uppercase", letterSpacing:0.6, margin:"14px 0 10px" }}>Visit Info</p>
          <div style={{ display:"grid", gap:10, marginBottom:16 }}>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>Chief Complaint (main reason for visit)</label><textarea value={form.chiefComplaint} onChange={e=>f("chiefComplaint")(e.target.value)} rows={2} placeholder="e.g. Lower back pain for 3 weeks, worse after sitting at work" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13, resize:"vertical" }}/></div>
            <div><label style={{ fontSize:11, fontWeight:600, color:C.g600, display:"block", marginBottom:4 }}>How did you hear about us?</label><input value={form.referralSource} onChange={e=>f("referralSource")(e.target.value)} placeholder="e.g. GP referral, Google, Friend" style={{ ...IST, width:"100%", boxSizing:"border-box", fontSize:13 }}/></div>
          </div>

          <button onClick={save} disabled={saving} style={{ width:"100%", padding:"12px", background:saving?C.g200:C.p500, color:saving?C.g400:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:saving?"not-allowed":"pointer", transition:"all .15s" }}>
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Intake Form"}
          </button>
        </div>
      )}
    </Card>
  );
}

/* ══════════════════════════════════════════════════════
   TAB: PROFILE
══════════════════════════════════════════════════════ */
function ProfileTab({ patient, user, onSignOut, onLegal, clinicId, claims = [] }) {
  const initials = `${patient.fn?.[0] || "?"}${patient.ln?.[0] || ""}`.toUpperCase();
  const fields = [
    { label:"Full Name",    value:`${patient.fn} ${patient.ln}` },
    { label:"Date of Birth",value:patient.dob ? fmtDateFull(patient.dob) : "—" },
    { label:"Age",          value:patient.dob ? `${ptAge(patient.dob)} years old` : "—" },
    { label:"Gender",       value:patient.gender || "—" },
    { label:"Phone",        value:patient.phone || "—" },
    { label:"Email",        value:patient.email || user?.email || "—" },
    { label:"Address",      value:patient.address || "—" },
    { label:"Blood Type",   value:patient.bloodType || "—" },
    { label:"Insurance",    value:patient.insurance || "—" },
    { label:"Insurance #",  value:patient.insNo || "—" },
  ].filter(f => f.value !== "—" || ["Full Name","Date of Birth"].includes(f.label));

  return (
    <div>
      <SectionHead title="My Profile" sub="Your personal and health information"/>

      {/* Avatar + name */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 0 20px", marginBottom:16 }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${C.p600},${C.p400})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:800, color:"#fff", marginBottom:12, boxShadow:"0 4px 16px rgba(124,58,237,.3)" }}>{initials}</div>
        <p style={{ fontSize:18, fontWeight:800, color:C.g800 }}>{patient.fn} {patient.ln}</p>
        <p style={{ fontSize:12, color:C.g400, marginTop:3 }}>MRN: {patient.mrn || patient.id}</p>
      </div>

      {/* Info */}
      <Card style={{ marginBottom:14 }}>
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.g100}` }}>
          <span style={{ fontSize:11, fontWeight:700, color:C.g500, textTransform:"uppercase", letterSpacing:0.6 }}>Personal Information</span>
        </div>
        <div style={{ padding:"4px 18px 8px" }}>
          {fields.map((f, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 0", borderBottom: i < fields.length-1 ? `1px solid ${C.g50}` : "none", gap:12 }}>
              <span style={{ fontSize:12, color:C.g500, fontWeight:600, flexShrink:0 }}>{f.label}</span>
              <span style={{ fontSize:13, color:C.g800, fontWeight:500, textAlign:"right" }}>{f.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Allergies / problems */}
      {patient.allergies?.length > 0 && (
        <Card style={{ marginBottom:14 }}>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.g100}`, display:"flex", alignItems:"center", gap:8 }}>
            <Ic n="alert" s={15} c={C.r600} sw={2}/>
            <span style={{ fontSize:11, fontWeight:700, color:C.r600, textTransform:"uppercase", letterSpacing:0.6 }}>Allergies</span>
          </div>
          <div style={{ padding:"12px 18px", display:"flex", gap:8, flexWrap:"wrap" }}>
            {patient.allergies.map((a, i) => <span key={i} style={{ background:C.r50, color:C.r600, border:`1px solid #fca5a5`, borderRadius:20, fontSize:12, fontWeight:600, padding:"3px 10px" }}>{a}</span>)}
          </div>
        </Card>
      )}

      {patient.problems?.length > 0 && (
        <Card style={{ marginBottom:20 }}>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.g100}` }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.g500, textTransform:"uppercase", letterSpacing:0.6 }}>Active Problems</span>
          </div>
          <div style={{ padding:"12px 18px", display:"flex", flexDirection:"column", gap:6 }}>
            {patient.problems.map((pr, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.g700 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:C.p400, flexShrink:0 }}/>
                {pr}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Intake Form */}
      <IntakeForm patient={patient} clinicId={clinicId}/>

      {/* Billing summary */}
      {claims.length > 0 && (
        <div style={{ marginTop:8 }}>
          <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.7, color:C.g500, marginBottom:10 }}>Billing</p>
          {(() => {
            const outstanding = claims.filter(c => c.status !== "Paid" && c.status !== "Void");
            const totalOwed = outstanding.reduce((s,c) => s + ((c.amount||0) - (c.paidAmt||0)), 0);
            const billColor = s => ({ Paid:"green", Pending:"amber", Submitted:"purple", Void:"gray" })[s] || "gray";
            return (
              <>
                {totalOwed > 0 && (
                  <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:12, padding:"12px 16px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:C.r600 }}>Outstanding Balance</p>
                    <p style={{ fontSize:20, fontWeight:800, color:C.r600 }}>${totalOwed.toFixed(2)}</p>
                  </div>
                )}
                {claims.slice(0,5).map(c => (
                  <div key={c.id} style={{ background:C.w, borderRadius:12, border:`1px solid ${C.g200}`, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:C.g800 }}>{c.description || "Treatment"}</p>
                      <p style={{ fontSize:11, color:C.g400 }}>{c.date} · {c.insurer || "Self-pay"}</p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <Bdg label={c.status} color={billColor(c.status)}/>
                      <p style={{ fontSize:14, fontWeight:800, color:C.g700, marginTop:4 }}>${(c.amount||0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      )}

      {/* Sign out */}
      <button onClick={onSignOut} style={{ width:"100%", padding:"13px", background:C.w, color:C.r600, border:`1.5px solid #fca5a5`, borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .15s" }} onMouseEnter={e=>{e.currentTarget.style.background=C.r50;}} onMouseLeave={e=>{e.currentTarget.style.background=C.w;}}>
        <Ic n="logout" s={16} c={C.r600} sw={2}/>
        Sign Out
      </button>
      {/* Legal footer */}
      <div style={{ display:"flex", justifyContent:"center", gap:16, paddingTop:8 }}>
        {onLegal && (
          <>
            <button onClick={()=>onLegal("tos")} style={{ background:"none",border:"none",fontSize:11,color:C.g400,cursor:"pointer",textDecoration:"underline",fontFamily:"inherit" }}>Terms of Service</button>
            <span style={{ fontSize:11,color:C.g300 }}>·</span>
            <button onClick={()=>onLegal("privacy")} style={{ background:"none",border:"none",fontSize:11,color:C.g400,cursor:"pointer",textDecoration:"underline",fontFamily:"inherit" }}>Privacy Policy</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB: MESSAGES
══════════════════════════════════════════════════════ */
function MessagesTab({ patient, user, messages, setMessages, clinicId }) {
  const [body, setBody] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMsgs = useCallback(async () => {
    const { data } = await supabase.from("messages").select("*").filter("data->>pid","eq",patient.id);
    if (data) {
      const sorted = data.map(r => r.data ?? r).sort((a,b) => (a.ts||"").localeCompare(b.ts||""));
      setMessages(prev => {
        if (JSON.stringify(prev.map(m=>m.id)) === JSON.stringify(sorted.map(m=>m.id))) return prev;
        return sorted;
      });
    }
  }, [patient?.id]);

  // Real-time subscription + polling fallback
  useEffect(() => {
    if (!patient?.id) return;
    const channel = supabase.channel(`portal-msgs-${patient.id}`)
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"messages" }, (payload) => {
        const d = payload.new?.data || payload.new;
        if (d?.pid === patient.id) setMessages(prev => {
          if (prev.some(m => m.id === d.id)) return prev;
          return [...prev, d];
        });
      })
      .subscribe();
    // Polling fallback — guarantees messages appear within 4 s even if realtime is blocked by RLS
    const poll = setInterval(fetchMsgs, 4000);
    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [patient?.id, fetchMsgs]);

  async function sendMsg() {
    if (!body.trim()) return;
    const msg = {
      id: `MSG-${Date.now()}`,
      pid: patient.id,
      fromType: "patient",
      fromName: `${patient.fn || ""} ${patient.ln || ""}`.trim(),
      body: body.trim(),
      ts: new Date().toISOString(),
      read: false,
      _cid: clinicId || "",
    };
    setMessages(prev => [...prev, msg]);
    setBody("");
    // Include clinic_id so the EHR can find and subscribe to this message
    const { error: insertErr } = await supabase.from("messages").insert([{ id: msg.id, clinic_id: clinicId, data: msg }]);
    if (insertErr) {
      console.error("Message insert failed:", insertErr);
      alert(`Message failed to send: ${insertErr.message}\n\nTell your admin to check Supabase RLS policies on the messages table.`);
      setMessages(prev => prev.filter(m => m.id !== msg.id));
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  }

  return (
    <div>
      <SectionHead title="Messages" sub="Communicate securely with your care team"/>
      <div style={{ background:C.w, borderRadius:16, border:`1px solid ${C.g200}`, overflow:"hidden", boxShadow:"0 2px 12px rgba(124,58,237,0.07)" }}>
        {/* Chat area */}
        <div style={{ minHeight:320, maxHeight:480, overflowY:"auto", padding:"16px 14px", display:"flex", flexDirection:"column", gap:8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 16px", color:C.g400 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:C.p50, border:`1.5px solid ${C.p100}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                <Ic n="send" s={22} c={C.p300} sw={1.6}/>
              </div>
              <p style={{ fontWeight:700, color:C.g700, fontSize:14, marginBottom:5 }}>No messages yet.</p>
              <p style={{ fontSize:13 }}>Send a message to your care team below.</p>
            </div>
          )}
          {messages.map(m => {
            const isMe = m.fromType === "patient";
            return (
              <div key={m.id} style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start" }}>
                <div style={{ maxWidth:"75%" }}>
                  <div style={{ fontSize:10, color:C.g400, marginBottom:3, textAlign:isMe?"right":"left" }}>
                    {m.fromName} · {m.ts ? new Date(m.ts).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}) : ""}
                  </div>
                  <div style={{ background:isMe?C.p500:C.g100, color:isMe?"#fff":C.g800, borderRadius:isMe?"14px 14px 3px 14px":"14px 14px 14px 3px", padding:"10px 14px", fontSize:13, lineHeight:1.5, wordBreak:"break-word" }}>
                    {m.body}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}/>
        </div>
        {/* Input */}
        <div style={{ borderTop:`1px solid ${C.g200}`, padding:"12px 14px", display:"flex", gap:8 }}>
          <textarea value={body} onChange={e => setBody(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message… (Enter to send)" rows={2} style={{ ...IST, flex:1, resize:"none", fontSize:13 }}/>
          <button onClick={sendMsg} disabled={!body.trim()} style={{ padding:"10px 16px", background:body.trim()?C.p500:C.g200, color:body.trim()?"#fff":C.g400, border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:body.trim()?"pointer":"not-allowed", display:"flex", alignItems:"center", gap:6, transition:"background .15s", flexShrink:0 }}>
            <Ic n="send" s={14} c={body.trim()?"#fff":C.g400} sw={2}/>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB: DOCUMENTS
══════════════════════════════════════════════════════ */
const DOC_CATS = ["Referral","Imaging","Lab Report","Consent","Insurance","ID","Other"];
const DOC_CAT_COLORS = {
  "Referral":  { bg:C.b50,  text:C.b600 },
  "Imaging":   { bg:C.teal50, text:C.teal600 },
  "Lab Report":{ bg:C.gr50, text:C.gr600 },
  "Consent":   { bg:C.a50,  text:C.a600 },
  "Insurance": { bg:C.p50,  text:C.p600 },
  "ID":        { bg:C.g100, text:C.g600 },
  "Other":     { bg:C.g100, text:C.g500 },
};
function fmtBytes(b) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024*1024) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1024/1024).toFixed(1)} MB`;
}

function DocumentsTab({ patient, clinicId, docs, setDocs, toast }) {
  const [tab, setTab]         = useState("mine");      // "mine" | "clinic"
  const [uploading, setUploading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [upCat, setUpCat]     = useState("Referral");
  const [upNote, setUpNote]   = useState("");
  const [upFile, setUpFile]   = useState(null);
  const fileRef               = useRef();

  const mine   = docs.filter(d => d.uploadedByType === "patient");
  const clinic = docs.filter(d => d.uploadedByType === "clinic" && d.sharedWithPatient);

  async function handleUpload() {
    if (!upFile) return;
    setUploading(true);
    try {
      const ext      = upFile.name.split(".").pop().toLowerCase();
      const bucket   = clinicId || "shared";
      const path     = `${bucket}/${patient.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: stErr } = await supabase.storage.from("patient-documents").upload(path, upFile, { upsert: false });
      if (stErr) throw stErr;
      const docId = `DOC-${Date.now()}`;
      const doc = {
        id: docId,
        pid: patient.id,
        name: upFile.name,
        category: upCat,
        size: upFile.size,
        path,
        mimeType: upFile.type,
        note: upNote.trim(),
        uploadedByType: "patient",
        uploadedAt: new Date().toISOString(),
        sharedWithPatient: false,
      };
      const { error: dbErr } = await supabase.from("patient_documents").insert([{ id: docId, clinic_id: clinicId || null, data: doc }]);
      if (dbErr) throw dbErr;
      setDocs(prev => [doc, ...prev]);
      setUploadModal(false);
      setUpFile(null);
      setUpNote("");
      setUpCat("Referral");
      toast("Document uploaded successfully!");
    } catch (e) {
      toast(e.message || "Upload failed — please try again.", "error");
    }
    setUploading(false);
  }

  async function downloadDoc(doc) {
    try {
      const { data, error } = await supabase.storage.from("patient-documents").createSignedUrl(doc.path, 300);
      if (error) throw error;
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = doc.name;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      toast("Could not generate download link. Please try again.", "error");
    }
  }

  async function deleteDoc(doc) {
    if (!window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    try {
      await supabase.storage.from("patient-documents").remove([doc.path]);
      await supabase.from("patient_documents").delete().eq("id", doc.id);
      setDocs(prev => prev.filter(d => d.id !== doc.id));
      toast("Document deleted.");
    } catch (e) {
      toast("Delete failed — please try again.", "error");
    }
  }

  function DocCard({ doc }) {
    const cc = DOC_CAT_COLORS[doc.category] || DOC_CAT_COLORS["Other"];
    const isImage = (doc.mimeType || "").startsWith("image/");
    return (
      <div style={{ background:C.w, border:`1px solid ${C.g200}`, borderRadius:14, padding:"14px 16px", marginBottom:10, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <div style={{ flex:1, marginRight:12 }}>
            <p style={{ fontSize:13, fontWeight:700, color:C.g800, marginBottom:4, wordBreak:"break-word" }}>{doc.name}</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:6, background:cc.bg, color:cc.text }}>{doc.category}</span>
              {doc.size && <span style={{ fontSize:11, color:C.g400 }}>{fmtBytes(doc.size)}</span>}
              <span style={{ fontSize:11, color:C.g400 }}>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""}</span>
            </div>
            {doc.note && <p style={{ fontSize:12, color:C.g500, marginTop:6, fontStyle:"italic" }}>{doc.note}</p>}
          </div>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <button onClick={() => downloadDoc(doc)} title="Download" style={{ padding:"7px 10px", background:C.p50, border:`1.5px solid ${C.p200}`, borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:700, color:C.p700 }}>
              <Ic n="download" s={13} c={C.p600} sw={2}/>
              Download
            </button>
            {doc.uploadedByType === "patient" && (
              <button onClick={() => deleteDoc(doc)} title="Delete" style={{ padding:"7px 9px", background:C.r50, border:"1.5px solid #fca5a5", borderRadius:8, cursor:"pointer" }}>
                <Ic n="trash" s={13} c="#dc2626" sw={2}/>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHead
        title="Documents"
        sub="Upload and access your medical documents"
        action={<button onClick={() => setUploadModal(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:C.p500, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}><Ic n="upload" s={14} c="#fff" sw={2.5}/>Upload</button>}
      />

      {/* Tab switcher */}
      <div style={{ display:"flex", gap:4, background:C.g100, borderRadius:10, padding:3, marginBottom:16 }}>
        {[["mine","My Uploads"], ["clinic","From Clinic"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:"7px 12px", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", background:tab===k?C.w:"transparent", color:tab===k?C.p600:C.g500, boxShadow:tab===k?"0 1px 4px rgba(0,0,0,.08)":"none", transition:"all .15s" }}>
            {l} ({k==="mine"?mine.length:clinic.length})
          </button>
        ))}
      </div>

      {tab === "mine" && (
        mine.length === 0
          ? <Empty icon="folder" title="No documents uploaded" sub="Upload referrals, imaging reports, insurance cards, or any document your clinic needs."/>
          : mine.map(d => <DocCard key={d.id} doc={d}/>)
      )}
      {tab === "clinic" && (
        clinic.length === 0
          ? <Empty icon="folder" title="No documents shared" sub="When your clinic shares documents with you (reports, consent forms, visit notes), they will appear here."/>
          : clinic.map(d => <DocCard key={d.id} doc={d}/>)
      )}

      {/* Upload Modal */}
      {uploadModal && ReactDOM.createPortal(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:C.w,borderRadius:18,width:"100%",maxWidth:420,padding:"24px 22px",boxShadow:"0 20px 60px rgba(0,0,0,.25)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h3 style={{ fontSize:16,fontWeight:800,color:C.g800 }}>Upload Document</h3>
              <button onClick={() => { setUploadModal(false); setUpFile(null); setUpNote(""); }} style={{ background:"none",border:"none",fontSize:20,color:C.g400,cursor:"pointer" }}>×</button>
            </div>

            {/* File picker */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border:`2px dashed ${upFile?C.p400:C.g300}`, borderRadius:12, padding:"28px 16px", textAlign:"center", cursor:"pointer", marginBottom:16, background:upFile?C.p50:C.g50, transition:"all .15s" }}
            >
              <Ic n="upload" s={24} c={upFile?C.p500:C.g400} sw={1.5}/>
              <p style={{ fontSize:13, fontWeight:600, color:upFile?C.p700:C.g500, marginTop:8 }}>{upFile ? upFile.name : "Click to choose a file"}</p>
              {upFile && <p style={{ fontSize:11, color:C.g400, marginTop:2 }}>{fmtBytes(upFile.size)}</p>}
              {!upFile && <p style={{ fontSize:11, color:C.g400, marginTop:4 }}>PDF, JPG, PNG, HEIC — max 25 MB</p>}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.heif" style={{ display:"none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f && f.size > 25*1024*1024) { toast("File must be under 25 MB","error"); return; } setUpFile(f||null); }}
            />

            {/* Category */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:6 }}>Category</label>
              <select value={upCat} onChange={e=>setUpCat(e.target.value)} style={IST}>
                {DOC_CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Note */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:6 }}>Note (optional)</label>
              <textarea value={upNote} onChange={e=>setUpNote(e.target.value)} placeholder="e.g. MRI from Jan 2024, right knee" rows={2} style={{ ...IST, resize:"none" }}/>
            </div>

            <button onClick={handleUpload} disabled={!upFile || uploading} style={{ width:"100%",padding:"12px",background:(!upFile||uploading)?C.g200:C.p500,color:(!upFile||uploading)?C.g400:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:(!upFile||uploading)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              {uploading ? <><div style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Uploading…</> : "Upload Document"}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB: OUTCOMES (LEFS + Oswestry + Pain Trend)
══════════════════════════════════════════════════════ */
const LEFS_QUESTIONS = [
  "Any of your usual work, housework, or school activities",
  "Your usual hobbies, recreational or sporting activities",
  "Getting into or out of the bath",
  "Walking between rooms",
  "Putting on your shoes or socks",
  "Squatting",
  "Lifting an object, like a bag of groceries from the floor",
  "Performing light activities around your home",
  "Performing heavy activities around your home",
  "Getting into or out of a car",
  "Walking 2 blocks",
  "Walking a mile",
  "Going up or down 10 stairs (about 1 flight of stairs)",
  "Standing for 1 hour",
  "Sitting for 1 hour",
  "Running on even ground",
  "Running on uneven ground",
  "Making sharp turns while running fast",
  "Hopping",
  "Rolling over in bed",
];
const OSWESTRY_SECTIONS = [
  { title:"Pain Intensity",       opts:["No pain","Mild pain","Moderate pain","Fairly severe","Severe","Worst imaginable"] },
  { title:"Personal Care",        opts:["Normal, no extra pain","Normal, extra pain","Painful, slow, careful","Some help needed","Mostly help needed","Cannot dress"] },
  { title:"Lifting",              opts:["No extra pain with heavy lifting","Extra pain but can manage","No lifting from floor","Can lift from floor if positioned","Rarely lift — very light only","Cannot lift at all"] },
  { title:"Walking",              opts:["No pain, unlimited","Mild pain, unlimited","<1 mile","<0.5 miles","Stick/crutch needed","In bed mostly"] },
  { title:"Sitting",              opts:["No pain, any chair","Pain-free, suitable chairs only","Pain after 1 hour","Pain after 30 min","Pain after 10 min","Pain when sitting at all"] },
  { title:"Standing",             opts:["No pain, unlimited","Extra pain, unlimited","Pain after 1 hour","Pain after 30 min","Pain after 10 min","Cannot stand"] },
  { title:"Sleeping",             opts:["No trouble","Occasional drugs","Drugs help with good sleep","Less than 6 hrs even with drugs","Less than 4 hrs","Less than 2 hrs"] },
  { title:"Sex Life",             opts:["Normal, no pain","Normal, extra pain","Nearly normal, very painful","Severely restricted","Nearly absent","Completely absent"] },
  { title:"Social Life",          opts:["Normal, no pain","Normal, extra pain","Minor effect on active leisure","Regular venues, no active leisure","Infrequent only due to pain","Pain prevents social life"] },
  { title:"Travelling",           opts:["No pain","Mild extra pain","Some extra pain, >2 hrs","Severe pain, <2 hrs","Pain limits to <30 min","Only bedside activities"] },
];

function OutcomesTab({ patient, clinicId, outcomes, setOutcomes, toast }) {
  const [form, setForm]         = useState("lefs");   // "lefs" | "oswestry"
  const [lefsAnswers, setLefs]  = useState(Array(20).fill(null));
  const [oswAnswers, setOsw]    = useState(Array(10).fill(null));
  const [painNow, setPainNow]   = useState(5);
  const [submitting, setSub]    = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const lefsScore  = lefsAnswers.every(a => a !== null) ? lefsAnswers.reduce((s,v) => s+v, 0) : null;
  const oswScore   = oswAnswers.every(a => a !== null) ? Math.round((oswAnswers.reduce((s,v)=>s+v,0)/50)*100) : null;

  const painHistory = outcomes
    .filter(o => o.pid === patient.id && o.pain != null)
    .sort((a,b) => (a.date||"").localeCompare(b.date||""));

  const lefsHistory = outcomes
    .filter(o => o.pid === patient.id && o.lefs != null)
    .sort((a,b) => (a.date||"").localeCompare(b.date||""));

  async function submitOutcome() {
    const isLefs = form === "lefs";
    if (isLefs && lefsScore === null) { toast("Please answer all 20 questions","error"); return; }
    if (!isLefs && oswScore === null) { toast("Please answer all 10 sections","error"); return; }
    setSub(true);
    const record = {
      id:   `OC-${Date.now()}`,
      pid:  patient.id,
      date: TODAY,
      pain: painNow,
      ...(isLefs ? { lefs: lefsScore } : { oswestry: oswScore }),
      type: isLefs ? "LEFS" : "Oswestry",
      submittedAt: new Date().toISOString(),
    };
    await supabase.from("pt_outcomes").insert([{ id: record.id, clinic_id: clinicId, data: record }]);
    setOutcomes(prev => [...prev, record]);
    setLefs(Array(20).fill(null));
    setOsw(Array(10).fill(null));
    setSub(false);
    setSubmitted(true);
    toast(`${record.type} submitted — score: ${isLefs ? lefsScore + "/80" : oswScore + "%"}`);
    setTimeout(() => setSubmitted(false), 4000);
  }

  /* ── SVG Pain Trend Chart ── */
  function PainChart() {
    if (painHistory.length < 2) return null;
    const W = 320, H = 100, PAD = 28;
    const pts = painHistory.slice(-12);
    const xStep = (W - PAD*2) / (pts.length - 1);
    const yScale = v => PAD + ((10 - v) / 10) * (H - PAD*1.4);
    const dotColor = v => v <= 3 ? C.gr600 : v <= 6 ? C.a600 : C.r600;
    const polyline = pts.map((p,i) => `${PAD + i*xStep},${yScale(p.pain)}`).join(" ");
    return (
      <div style={{ background:C.w, border:`1px solid ${C.g200}`, borderRadius:14, padding:"16px", marginBottom:16 }}>
        <p style={{ fontSize:13, fontWeight:700, color:C.g800, marginBottom:10 }}>Pain Trend (NRS 0–10)</p>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
          {[0,2,4,6,8,10].map(v => (
            <g key={v}>
              <line x1={PAD} y1={yScale(v)} x2={W-PAD} y2={yScale(v)} stroke={C.g200} strokeWidth={0.8}/>
              <text x={PAD-6} y={yScale(v)+4} fontSize={8} fill={C.g400} textAnchor="end">{v}</text>
            </g>
          ))}
          <polyline points={polyline} fill="none" stroke={C.p300} strokeWidth={1.5} strokeDasharray="4,3"/>
          {pts.map((p,i) => (
            <circle key={i} cx={PAD+i*xStep} cy={yScale(p.pain)} r={4} fill={dotColor(p.pain)}>
              <title>{p.date}: {p.pain}/10</title>
            </circle>
          ))}
        </svg>
        <div style={{ display:"flex", gap:12, marginTop:8, justifyContent:"center" }}>
          {[{c:C.gr600,l:"Low (0-3)"},{c:C.a600,l:"Moderate (4-6)"},{c:C.r600,l:"High (7-10)"}].map(({c,l}) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:c }}/>
              <span style={{ fontSize:10, color:C.g500 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── LEFS History ── */
  function LefsChart() {
    if (lefsHistory.length < 2) return null;
    const W = 320, H = 100, PAD = 28;
    const pts = lefsHistory.slice(-10);
    const xStep = (W - PAD*2) / (pts.length - 1);
    const yScale = v => PAD + ((80 - v) / 80) * (H - PAD*1.4);
    const polyline = pts.map((p,i) => `${PAD+i*xStep},${yScale(p.lefs)}`).join(" ");
    return (
      <div style={{ background:C.w, border:`1px solid ${C.g200}`, borderRadius:14, padding:"16px", marginBottom:16 }}>
        <p style={{ fontSize:13, fontWeight:700, color:C.g800, marginBottom:4 }}>LEFS Progress (0–80)</p>
        <p style={{ fontSize:11, color:C.g400, marginBottom:10 }}>Higher is better — 80 = no functional limitation</p>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
          {[0,20,40,60,80].map(v => (
            <g key={v}>
              <line x1={PAD} y1={yScale(v)} x2={W-PAD} y2={yScale(v)} stroke={C.g200} strokeWidth={0.8}/>
              <text x={PAD-6} y={yScale(v)+4} fontSize={8} fill={C.g400} textAnchor="end">{v}</text>
            </g>
          ))}
          <polyline points={polyline} fill="none" stroke={C.gr600} strokeWidth={1.5}/>
          {pts.map((p,i) => (
            <circle key={i} cx={PAD+i*xStep} cy={yScale(p.lefs)} r={4} fill={C.gr600}>
              <title>{p.date}: {p.lefs}/80</title>
            </circle>
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div>
      <SectionHead title="Outcome Measures" sub="Track your functional progress over time"/>

      <PainChart/>
      <LefsChart/>

      {/* Latest scores summary */}
      {(painHistory.length > 0 || lefsHistory.length > 0) && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          {painHistory.length > 0 && (() => {
            const latest = painHistory[painHistory.length-1];
            const initial = painHistory[0];
            const change = initial.pain - latest.pain;
            return (
              <div style={{ background:C.w,border:`1px solid ${C.g200}`,borderRadius:14,padding:"14px",textAlign:"center" }}>
                <p style={{ fontSize:11,color:C.g500,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4 }}>Current Pain</p>
                <p style={{ fontSize:28,fontWeight:800,color:latest.pain<=3?C.gr600:latest.pain<=6?C.a600:C.r600 }}>{latest.pain}<span style={{ fontSize:14,color:C.g400 }}>/10</span></p>
                {change !== 0 && <p style={{ fontSize:11,color:change>0?C.gr600:C.r600,marginTop:4,fontWeight:600 }}>{change>0?`${change} pts better`:`${Math.abs(change)} pts worse`} vs initial</p>}
              </div>
            );
          })()}
          {lefsHistory.length > 0 && (() => {
            const latest = lefsHistory[lefsHistory.length-1];
            const pct = Math.round((latest.lefs/80)*100);
            return (
              <div style={{ background:C.w,border:`1px solid ${C.g200}`,borderRadius:14,padding:"14px",textAlign:"center" }}>
                <p style={{ fontSize:11,color:C.g500,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4 }}>LEFS Score</p>
                <p style={{ fontSize:28,fontWeight:800,color:C.p600 }}>{latest.lefs}<span style={{ fontSize:14,color:C.g400 }}>/80</span></p>
                <p style={{ fontSize:11,color:C.g400,marginTop:4 }}>{pct}% function</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Form switcher */}
      <div style={{ background:C.w, border:`1px solid ${C.g200}`, borderRadius:16, overflow:"hidden", marginBottom:16 }}>
        <div style={{ display:"flex", gap:4, background:C.g100, padding:4 }}>
          {[["lefs","LEFS (Leg)"],["oswestry","Oswestry (Back)"]].map(([k,l]) => (
            <button key={k} onClick={()=>setForm(k)} style={{ flex:1, padding:"8px", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:form===k?C.w:"transparent", color:form===k?C.p600:C.g500, transition:"all .15s" }}>{l}</button>
          ))}
        </div>

        <div style={{ padding:"16px 18px" }}>
          {/* Pain now — common to both */}
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:11,fontWeight:700,color:C.g600,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:10 }}>Current Pain Level (NRS 0–10)</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {Array.from({length:11},(_,i)=>i).map(v => (
                <button key={v} onClick={()=>setPainNow(v)} style={{ width:36,height:36,borderRadius:8,border:`2px solid ${painNow===v?(v<=3?C.gr600:v<=6?C.a600:C.r600):C.g200}`,background:painNow===v?(v<=3?C.gr50:v<=6?C.a50:C.r50):"transparent",color:painNow===v?(v<=3?C.gr700:v<=6?C.a700:C.r600):C.g500,fontWeight:700,fontSize:13,cursor:"pointer" }}>{v}</button>
              ))}
            </div>
          </div>

          {/* LEFS */}
          {form === "lefs" && (
            <>
              <p style={{ fontSize:12,color:C.g500,marginBottom:14,lineHeight:1.5 }}>Rate your ability to perform each activity today:<br/><strong>4</strong> = No difficulty &nbsp; <strong>3</strong> = Mild &nbsp; <strong>2</strong> = Moderate &nbsp; <strong>1</strong> = Quite a bit &nbsp; <strong>0</strong> = Extreme/Unable</p>
              {LEFS_QUESTIONS.map((q,i) => (
                <div key={i} style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.g100}` }}>
                  <p style={{ fontSize:12,fontWeight:600,color:C.g700,marginBottom:8 }}>{i+1}. {q}</p>
                  <div style={{ display:"flex", gap:6 }}>
                    {[0,1,2,3,4].map(v => (
                      <button key={v} onClick={()=>{ const a=[...lefsAnswers]; a[i]=v; setLefs(a); }} style={{ flex:1,padding:"7px 4px",borderRadius:8,border:`2px solid ${lefsAnswers[i]===v?C.p500:C.g200}`,background:lefsAnswers[i]===v?C.p500:"transparent",color:lefsAnswers[i]===v?"#fff":C.g500,fontWeight:700,fontSize:13,cursor:"pointer" }}>{v}</button>
                    ))}
                  </div>
                </div>
              ))}
              {lefsScore !== null && (
                <div style={{ background:C.p50,borderRadius:12,padding:"14px",marginTop:8,textAlign:"center" }}>
                  <p style={{ fontSize:13,fontWeight:700,color:C.p700 }}>LEFS Score: {lefsScore} / 80 ({Math.round(lefsScore/80*100)}% function)</p>
                </div>
              )}
            </>
          )}

          {/* Oswestry */}
          {form === "oswestry" && (
            <>
              <p style={{ fontSize:12,color:C.g500,marginBottom:14,lineHeight:1.5 }}>Select the statement that best describes you today for each section.</p>
              {OSWESTRY_SECTIONS.map((sec,i) => (
                <div key={i} style={{ marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${C.g100}` }}>
                  <p style={{ fontSize:12,fontWeight:700,color:C.g800,marginBottom:8 }}>{i+1}. {sec.title}</p>
                  {sec.opts.map((opt,v) => (
                    <label key={v} style={{ display:"flex",alignItems:"flex-start",gap:8,marginBottom:5,cursor:"pointer",fontSize:12,color:oswAnswers[i]===v?C.p700:C.g600,fontWeight:oswAnswers[i]===v?600:400 }}>
                      <input type="radio" name={`osw-${i}`} checked={oswAnswers[i]===v} onChange={()=>{ const a=[...oswAnswers]; a[i]=v; setOsw(a); }} style={{ marginTop:2,accentColor:C.p500,flexShrink:0 }}/>
                      <span>{v} — {opt}</span>
                    </label>
                  ))}
                </div>
              ))}
              {oswScore !== null && (
                <div style={{ background:oswScore<21?C.gr50:oswScore<41?C.a50:C.r50, borderRadius:12, padding:"14px", marginTop:8, textAlign:"center" }}>
                  <p style={{ fontSize:13,fontWeight:700,color:oswScore<21?C.gr700:oswScore<41?C.a700:C.r600 }}>
                    Oswestry Score: {oswScore}% — {oswScore<21?"Minimal disability":oswScore<41?"Moderate disability":oswScore<61?"Severe disability":"Very severe disability"}
                  </p>
                </div>
              )}
            </>
          )}

          {submitted && (
            <div style={{ background:C.gr50,border:`1px solid ${C.gr100}`,borderRadius:10,padding:"12px",textAlign:"center",marginTop:12 }}>
              <p style={{ fontSize:13,fontWeight:700,color:C.gr700 }}>Submitted! Your therapist can now see your updated scores.</p>
            </div>
          )}

          <button onClick={submitOutcome} disabled={submitting || (form==="lefs"?lefsScore===null:oswScore===null)} style={{ width:"100%",padding:"12px",marginTop:16,background:(submitting||(form==="lefs"?lefsScore===null:oswScore===null))?C.g200:C.p500,color:(submitting||(form==="lefs"?lefsScore===null:oswScore===null))?C.g400:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            {submitting ? <><div style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Submitting…</> : `Submit ${form==="lefs"?"LEFS":"Oswestry"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PATIENT APP (after login + patient lookup)
══════════════════════════════════════════════════════ */
/* ── LEGAL MODAL (ToS + Privacy Policy) ─────────────── */
function LegalModal({ tab: initTab, onClose }) {
  const [tab, setTab] = useState(initTab || "tos");
  return ReactDOM.createPortal(
    <div style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.55)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:20,width:"100%",maxWidth:640,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 32px 80px rgba(0,0,0,.25)",overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"20px 24px",borderBottom:`1px solid ${C.g200}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          <div style={{ display:"flex",gap:8 }}>
            {[["tos","Terms of Service"],["privacy","Privacy Policy"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} style={{ padding:"7px 16px",borderRadius:8,border:`1.5px solid ${tab===k?C.p400:C.g200}`,background:tab===k?C.p50:"#fff",color:tab===k?C.p600:C.g500,fontSize:13,fontWeight:700,cursor:"pointer" }}>{l}</button>
            ))}
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:20,color:C.g400,cursor:"pointer",lineHeight:1,padding:4 }}>✕</button>
        </div>
        {/* Content */}
        <div style={{ padding:"24px",overflowY:"auto",flex:1,fontSize:13,color:C.g600,lineHeight:1.8 }}>
          {tab === "tos" ? (
            <>
              <h2 style={{ fontSize:18,fontWeight:800,color:C.g800,marginBottom:4 }}>Terms of Service</h2>
              <p style={{ fontSize:12,color:C.g400,marginBottom:20 }}>Last updated: {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
              {[
                ["1. Acceptance","By accessing or using the Cowboy Healthcare EHR patient portal, you agree to these Terms of Service. If you do not agree, you may not use this service."],
                ["2. Description of Service","Cowboy Healthcare EHR provides a patient portal for viewing medical appointments, home exercise programs, billing information, and communicating with your healthcare provider."],
                ["3. Patient Responsibilities","You are responsible for maintaining the confidentiality of your login credentials. You agree to provide accurate personal and medical information. You must not share your account or access others' records."],
                ["4. Medical Disclaimer","Information provided through this portal is for informational purposes only and does not constitute medical advice. Always follow the guidance of your licensed healthcare provider."],
                ["5. Availability","We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance where possible."],
                ["6. Termination","We reserve the right to suspend access for violation of these terms. You may request account deletion at any time by contacting your clinic."],
                ["7. Limitation of Liability","Cowboy Healthcare, Inc. shall not be liable for indirect, incidental, or consequential damages arising from use of this service, to the maximum extent permitted by law."],
                ["8. Changes to Terms","We may update these Terms at any time. Continued use of the service constitutes acceptance of updated Terms."],
                ["9. Contact","For questions about these Terms, contact your healthcare provider or email legal@cowboyehr.com."],
              ].map(([t,d])=>(
                <div key={t} style={{ marginBottom:16 }}>
                  <strong style={{ color:C.g800 }}>{t}</strong>
                  <p style={{ marginTop:4 }}>{d}</p>
                </div>
              ))}
            </>
          ) : (
            <>
              <h2 style={{ fontSize:18,fontWeight:800,color:C.g800,marginBottom:4 }}>Privacy Policy</h2>
              <p style={{ fontSize:12,color:C.g400,marginBottom:20 }}>Last updated: {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
              {[
                ["1. Information We Collect","We collect information you provide (name, date of birth, contact details), health information entered by your provider (appointments, diagnoses, prescriptions, exercise programs), and usage data (login times, pages visited)."],
                ["2. HIPAA Compliance","We are a HIPAA-covered entity. Your Protected Health Information (PHI) is handled in accordance with the Health Insurance Portability and Accountability Act. We maintain a Business Associate Agreement (BAA) with our infrastructure providers."],
                ["3. How We Use Your Information","Your information is used to provide healthcare management services to your clinic, display your health data in this portal, process billing and insurance claims (including Availity submissions), and improve our platform."],
                ["4. Data Sharing","We do not sell your data. We share your PHI only with: your healthcare provider and their staff, insurance companies for claims processing (with your consent), and HIPAA-compliant service providers under BAA."],
                ["5. Data Security","All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We maintain detailed audit logs of all access to your records. Access is restricted to authenticated, authorised users only."],
                ["6. Audit Logging","All access to your health records is logged, including who accessed your data, when, and what changes were made. You may request a copy of your audit log through your clinic."],
                ["7. Your Rights","You have the right to access, correct, or request deletion of your personal data. To exercise these rights, contact your healthcare provider or email privacy@cowboyehr.com."],
                ["8. Cookies","We use session cookies for authentication only. We do not use tracking or advertising cookies."],
                ["9. Data Retention","Health records are retained according to applicable medical record retention laws (typically 7–10 years). You may request deletion of non-medical data at any time."],
                ["10. Contact","For privacy questions or to exercise your rights: privacy@cowboyehr.com"],
              ].map(([t,d])=>(
                <div key={t} style={{ marginBottom:16 }}>
                  <strong style={{ color:C.g800 }}>{t}</strong>
                  <p style={{ marginTop:4 }}>{d}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function PatientApp({ user, onSignOut }) {
  const [nav, setNav]             = useState("home");
  const [patient, setPatient]     = useState(null);
  const [clinicId, setClinicId]   = useState(null);
  const [appts, setAppts]         = useState([]);
  const [allAppts, setAllAppts]   = useState([]);   // full clinic schedule for slot availability
  const [heps, setHeps]           = useState([]);
  const [plans, setPlans]         = useState([]);
  const [outcomes, setOutcomes]   = useState([]);
  const [claims, setClaims]       = useState([]);
  const [providers, setProviders] = useState([]);
  const [exerciseLib, setExLib]   = useState([]);
  const [messages, setMessages]   = useState([]);
  const [docs, setDocs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [toast, setToastState]    = useState(null);
  const [legalTab, setLegalTab]   = useState(null);  // "tos" | "privacy" | null
  const [moreOpen, setMoreOpen]   = useState(false); // mobile "More" drawer

  const showToast = useCallback((msg, type = "success") => {
    setToastState({ msg, type, key: Date.now() });
  }, []);

  // Session timeout
  const showSessionWarn = useSessionTimeout(useCallback(() => {
    doSignOut();
  }, []));

  useEffect(() => {
    async function load() {
      setLoading(true);
      const email = user.email;

      // 1. Find patient record matching this email
      const { data: ptRows } = await supabase.from("patients").select("*");
      const ptRow = ptRows?.find(r => (r.data?.email || "").toLowerCase() === email.toLowerCase());

      if (!ptRow) { setNotFound(true); setLoading(false); return; }
      const pt = ptRow.data ?? ptRow;
      setPatient(pt);
      setClinicId(ptRow.clinic_id || null);

      const pid = pt.id;

      // 2. Fetch all data for this patient in parallel
      const [apptRows, hepRows, planRows, ocRows, claimRows, staffRows, libRows] = await Promise.all([
        supabase.from("appointments").select("*"),
        supabase.from("pt_hep").select("*").not("clinic_id","is",null),
        supabase.from("pt_plans").select("*"),
        supabase.from("pt_outcomes").select("*"),
        supabase.from("claims").select("*"),
        supabase.from("clinic_users").select("*"),
        supabase.from("pt_hep").select("id,data").is("clinic_id",null), // exercise library
      ]);

      const extract = rows => (rows.data || []).map(r => r.data ?? r);

      const allApptData = extract(apptRows);
      setAllAppts(allApptData);                               // full clinic schedule — for availability
      setAppts(allApptData.filter(a => a.pid === pid));       // this patient's own appointments
      setHeps(extract(hepRows).filter(h => h.pid === pid));
      setPlans(extract(planRows).filter(p => p.pid === pid));
      setOutcomes(extract(ocRows).filter(o => o.pid === pid));
      setClaims(extract(claimRows).filter(c => c.pid === pid));
      setProviders(extract(staffRows).map(s => s.full_name).filter(Boolean));

      // Exercise library from DB — merge with fallback so HEP cards always
      // resolve even if RLS blocks the patient from reading clinic_id IS NULL rows
      const libMapped = (libRows.data || []).map(r => ({
        id: r.id,
        name: r.data?.name,
        category: r.data?.category,
        region: r.data?.body_region,
        desc: r.data?.description || "",
        sets: r.data?.sets,
        reps: r.data?.reps,
        hold: r.data?.hold_time,
        difficulty: r.data?.difficulty,
        imageUrl: r.data?.image_url || null,
        videoUrl: r.data?.video_url || null,
        svg: null,
      }));
      // DB entries win over fallback (DB may have updated versions)
      const dbIds = new Set(libMapped.map(e => e.id));
      const merged = [...libMapped, ...EXERCISE_LIB_FALLBACK.filter(e => !dbIds.has(e.id))];
      setExLib(merged);

      // Fetch messages for this patient
      const { data: msgRows } = await supabase.from("messages").select("*").filter("data->>pid","eq",pid);
      const msgs = (msgRows || []).map(r => r.data ?? r).sort((a,b) => (a.ts||"").localeCompare(b.ts||""));
      setMessages(msgs);

      // Fetch documents for this patient
      const { data: docRows } = await supabase.from("patient_documents").select("*").filter("data->>pid","eq",pid);
      const docList = (docRows || []).map(r => r.data ?? r).sort((a,b) => (b.uploadedAt||"").localeCompare(a.uploadedAt||""));
      setDocs(docList);

      setLoading(false);
    }
    load();

    // Keep HEP, appointments and plans fresh so EHR changes appear
    // without the patient needing to reload the page.
    let currentPid = null;
    const refreshPortalData = async () => {
      if (!currentPid) {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!u) return;
        const { data: ptRows } = await supabase.from("patients").select("id,data,clinic_id");
        const ptRow = ptRows?.find(r => (r.data?.email||"").toLowerCase() === u.email.toLowerCase());
        if (!ptRow) return;
        currentPid = (ptRow.data ?? ptRow).id;
      }
      const pid = currentPid;
      const [hepRows, apptRows, planRows] = await Promise.all([
        supabase.from("pt_hep").select("*").not("clinic_id","is",null),
        supabase.from("appointments").select("*"),
        supabase.from("pt_plans").select("*"),
      ]);
      const extract = rows => (rows.data || []).map(r => r.data ?? r);
      setHeps(extract(hepRows).filter(h => h.pid === pid));
      const allA = extract(apptRows);
      setAllAppts(allA);
      setAppts(allA.filter(a => a.pid === pid));
      setPlans(extract(planRows).filter(p => p.pid === pid));
    };

    // Poll every 10s
    const poll = setInterval(refreshPortalData, 10000);

    // Also refresh instantly when patient switches back to the portal tab
    const onVisible = () => { if (document.visibilityState === "visible") refreshPortalData(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user.email]);

  if (loading) return <LoadingScreen msg="Loading your records…"/>;

  if (notFound) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'DM Sans',sans-serif", gap:16, background:C.bg }}>
        <div style={{ fontSize:40 }}>🤠</div>
        <h2 style={{ fontSize:20, fontWeight:800, color:C.g800, textAlign:"center" }}>No patient record found</h2>
        <p style={{ fontSize:14, color:C.g500, textAlign:"center", maxWidth:320, lineHeight:1.6 }}>
          We couldn't find a patient record linked to <strong>{user.email}</strong>.<br/>Please contact your clinic to have your account set up.
        </p>
        <button onClick={onSignOut} style={{ padding:"10px 24px", background:C.p500, color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>Sign Out</button>
      </div>
    </>
  );

  const NAV = [
    { id:"home",        label:"Home",       icon:"home" },
    { id:"exercises",   label:"Exercises",  icon:"dumbbell" },
    { id:"messages",    label:"Messages",   icon:"send" },
    { id:"appointments",label:"Bookings",   icon:"calendar" },
    { id:"profile",     label:"Profile",    icon:"user" },
    { id:"documents",   label:"Documents",  icon:"folder",   desktopOnly:true },
    { id:"outcomes",    label:"Outcomes",   icon:"activity", desktopOnly:true },
  ];

  return (
    <>
      <style>{GLOBAL_CSS}{`
        /* ── Mobile-first base ── */
        .pp-root { min-height: 100vh; background: ${C.bg}; position: relative; padding-bottom: 80px; }
        .pp-sidebar { display: none; }
        .pp-header { position: sticky; top: 0; z-index: 50; background: rgba(248,247,255,.92); backdrop-filter: blur(10px); border-bottom: 1px solid ${C.g200}; padding: 14px 18px 10px; display: flex; justify-content: space-between; align-items: center; }
        .pp-content { padding: 16px 18px; }
        .pp-nav { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,.95); backdrop-filter: blur(12px); border-top: 1px solid ${C.g200}; display: flex; padding: 6px 4px 10px; z-index: 200; box-shadow: 0 -4px 20px rgba(76,29,149,0.08); }
        .pp-nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px 2px; border: none; background: none; cursor: pointer; transition: transform .15s; border-radius: 10px; }
        .pp-nav-btn:active { transform: scale(.92); }
        /* ── Desktop layout ── */
        @media(min-width:768px){
          .pp-root { padding-bottom: 0; }
          .pp-nav { display: none !important; }
          .pp-sidebar {
            display: flex; flex-direction: column;
            position: fixed; top: 0; left: 0; bottom: 0; width: 230px;
            background: #fff; border-right: 1px solid ${C.g200};
            z-index: 50; overflow-y: auto;
          }
          .pp-header { margin-left: 230px; padding: 16px 28px; }
          .pp-content { margin-left: 230px; padding: 28px 36px; }
        }
      `}</style>
      <div className="pp-root">

        {/* ── Desktop Sidebar ── */}
        <aside className="pp-sidebar">
          {/* Logo */}
          <div style={{ padding:"20px 18px 16px", borderBottom:`1px solid ${C.g200}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <svg width={42} height={42} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
                <rect width="42" height="42" rx="12" fill="url(#ppLogoGrad)"/>
                <defs>
                  <linearGradient id="ppLogoGrad" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#5b21b6"/>
                    <stop offset="100%" stopColor="#7c3aed"/>
                  </linearGradient>
                </defs>
                {/* Hat crown */}
                <path d="M21 9 C15 9 12 14 12 21 L30 21 C30 14 27 9 21 9 Z" fill="white"/>
                {/* Crown dent */}
                <path d="M16.5 10.2 Q21 7.5 25.5 10.2" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                {/* Brim */}
                <rect x="6" y="21" width="30" height="5.5" rx="2.75" fill="white"/>
                {/* ECG pulse through brim */}
                <path d="M8 23.75 L13 23.75 L14.5 21 L16.5 26.5 L18.5 22 L20 23.75 L34 23.75" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.g800, lineHeight:1, letterSpacing:"-0.2px" }}>Cowboy <span style={{color:C.p600}}>EHR</span></div>
                <div style={{ fontSize:10, color:C.g400, fontWeight:500, marginTop:2 }}>Patient Portal</div>
              </div>
            </div>
          </div>
          {/* Nav items */}
          <nav style={{ padding:"14px 10px", flex:1 }}>
            {NAV.map(item => {
              const active = nav === item.id;
              return (
                <button key={item.id} onClick={() => setNav(item.id)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 13px", border:"none", borderRadius:10, cursor:"pointer", background:active?C.p100:"transparent", color:active?C.p700:C.g500, fontFamily:"inherit", fontSize:13, fontWeight:active?700:500, marginBottom:3, transition:"all .15s", textAlign:"left" }} onMouseEnter={e=>{ if(!active){e.currentTarget.style.background=C.g50;} }} onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="transparent";} }}>
                  <Ic n={item.icon} s={17} c={active?C.p600:C.g400} sw={active?2.2:1.8}/>
                  {item.label}
                </button>
              );
            })}
          </nav>
          {/* User + sign out */}
          {patient && (
            <div style={{ padding:"14px 10px", borderTop:`1px solid ${C.g200}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 12px", marginBottom:6 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${C.p500},${C.p300})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {`${patient.fn?.[0]||""}${patient.ln?.[0]||""}`.toUpperCase()}
                </div>
                <div style={{ overflow:"hidden", flex:1 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:C.g800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{patient.fn} {patient.ln}</p>
                  <p style={{ fontSize:10, color:C.g400 }}>Patient</p>
                </div>
              </div>
              <button onClick={onSignOut} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 13px", border:"none", borderRadius:9, cursor:"pointer", background:"transparent", color:C.g500, fontFamily:"inherit", fontSize:12, fontWeight:500, transition:"all .15s" }} onMouseEnter={e=>{ e.currentTarget.style.background=C.r50; e.currentTarget.style.color=C.r600; }} onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.g500; }}>
                <Ic n="logout" s={15} c="currentColor"/>
                Sign Out
              </button>
              {/* Legal links */}
              <div style={{ display:"flex", gap:10, padding:"6px 13px 2px", flexWrap:"wrap" }}>
                <button onClick={()=>setLegalTab("tos")} style={{ background:"none",border:"none",fontSize:11,color:C.g400,cursor:"pointer",padding:0,fontFamily:"inherit",textDecoration:"underline" }}>Terms</button>
                <button onClick={()=>setLegalTab("privacy")} style={{ background:"none",border:"none",fontSize:11,color:C.g400,cursor:"pointer",padding:0,fontFamily:"inherit",textDecoration:"underline" }}>Privacy</button>
              </div>
            </div>
          )}
        </aside>
        {legalTab && <LegalModal tab={legalTab} onClose={()=>setLegalTab(null)}/>}
        {showSessionWarn && <SessionWarningModal onStay={()=>{ /* reset is automatic via events */ }} onSignOut={doSignOut}/>}

        {/* ── Mobile Header (hidden on desktop via margin-left shift) ── */}
        <div className="pp-header">
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${C.p700},${C.p500})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 17 C5 14 5 11 7 9 C9 7.5 10.5 7 12 7 C13.5 7 15 7.5 17 9 C19 11 19 14 18 17"/>
                <path d="M1 17 Q12 20.5 23 17"/>
                <path d="M10 7.8 Q12 6.5 14 7.8"/>
                <path d="M12 10.5v3 M10.5 12h3"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:C.g800, lineHeight:1 }}>Cowboy EHR</div>
              <div style={{ fontSize:10, color:C.g400, fontWeight:600 }}>Patient Portal</div>
            </div>
          </div>
          {patient && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* Unread message bell */}
              {messages.filter(m=>m.fromType!=="patient"&&!m.read_by_patient).length > 0 && (
                <button onClick={()=>setNav("messages")} style={{ position:"relative",background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:8 }}>
                  <Ic n="send" s={18} c={C.p500} sw={2}/>
                  <div style={{ position:"absolute",top:0,right:0,width:9,height:9,background:C.r600,borderRadius:"50%",border:"2px solid #f8f7ff" }}/>
                </button>
              )}
              <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${C.p500},${C.p300})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" }}>
                {`${patient.fn?.[0]||""}${patient.ln?.[0]||""}`.toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="pp-content fade-up">
          {patient && nav === "home"         && <HomeTab patient={patient} appts={appts} heps={heps} plans={plans} claims={claims} messages={messages} outcomes={outcomes} exerciseLib={exerciseLib} clinicId={clinicId} onNav={setNav} onBookAppt={() => setNav("appointments")} onConfirmAppt={async(apptId)=>{ const appt=appts.find(a=>a.id===apptId); if(!appt)return; const updated={...appt,confirmStatus:"confirmed"}; await supabase.from("appointments").update({data:updated}).match({id:apptId}); setAppts(prev=>prev.map(a=>a.id===apptId?updated:a)); showToast("Appointment confirmed!"); }}/>}
          {patient && nav === "exercises"    && <ExercisesTab patient={patient} heps={heps} exerciseLib={exerciseLib} plans={plans} outcomes={outcomes} toast={showToast} clinicId={clinicId}/>}
          {patient && nav === "messages"     && <MessagesTab patient={patient} user={user} messages={messages} setMessages={setMessages} clinicId={clinicId}/>}
          {patient && nav === "appointments" && <AppointmentsTab patient={patient} appts={appts} setAppts={setAppts} allAppts={allAppts} setAllAppts={setAllAppts} providers={providers} clinicId={clinicId} toast={showToast}/>}
          {patient && nav === "profile"      && <ProfileTab patient={patient} user={user} onSignOut={onSignOut} onLegal={setLegalTab} clinicId={clinicId} claims={claims}/>}
          {patient && nav === "documents"    && <DocumentsTab patient={patient} clinicId={clinicId} docs={docs} setDocs={setDocs} toast={showToast}/>}
          {patient && nav === "outcomes"     && <OutcomesTab patient={patient} clinicId={clinicId} outcomes={outcomes} setOutcomes={setOutcomes} toast={showToast}/>}
        </div>

        {/* Mobile bottom nav — 5 main items + More */}
        <nav className="pp-nav">
          {NAV.filter(item => !item.desktopOnly).map(item => {
            const active = nav === item.id;
            const unreadCount = item.id === "messages" ? messages.filter(m=>m.fromType!=="patient"&&!m.read_by_patient).length : 0;
            return (
              <button key={item.id} className="pp-nav-btn" onClick={() => setNav(item.id)}>
                <div style={{ position:"relative", width:36, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:active?C.p100:"transparent", transition:"background .15s" }}>
                  <Ic n={item.icon} s={18} c={active?C.p600:C.g400} sw={active?2.2:1.8}/>
                  {unreadCount > 0 && <div style={{ position:"absolute",top:2,right:4,width:8,height:8,background:C.r600,borderRadius:"50%",border:"1.5px solid #fff" }}/>}
                </div>
                <span style={{ fontSize:10, fontWeight: active?700:500, color:active?C.p600:C.g400, letterSpacing:0.1 }}>{item.label}</span>
              </button>
            );
          })}
          {/* More button — reveals Documents & Outcomes */}
          <button className="pp-nav-btn" onClick={() => setMoreOpen(v=>!v)}>
            <div style={{ width:36, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:moreOpen?C.p100:"transparent", transition:"background .15s" }}>
              <Ic n="more-h" s={18} c={moreOpen?C.p600:C.g400} sw={moreOpen?2.2:1.8}/>
            </div>
            <span style={{ fontSize:10, fontWeight:moreOpen?700:500, color:moreOpen?C.p600:C.g400, letterSpacing:0.1 }}>More</span>
          </button>
        </nav>

        {/* More drawer */}
        {moreOpen && (
          <div style={{ position:"fixed",bottom:80,left:0,right:0,background:"#fff",borderTop:`1px solid ${C.g200}`,boxShadow:"0 -8px 24px rgba(0,0,0,.12)",zIndex:199,padding:"12px 16px 16px",display:"flex",gap:10 }}>
            {NAV.filter(item=>item.desktopOnly).map(item=>{
              const active = nav === item.id;
              return (
                <button key={item.id} onClick={()=>{ setNav(item.id); setMoreOpen(false); }} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"12px 8px", background:active?C.p50:"#f8f7ff", border:`1.5px solid ${active?C.p300:C.g100}`, borderRadius:14, cursor:"pointer" }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:active?C.p100:C.g100,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <Ic n={item.icon} s={18} c={active?C.p600:C.g500} sw={2}/>
                  </div>
                  <span style={{ fontSize:12,fontWeight:700,color:active?C.p700:C.g600 }}>{item.label}</span>
                </button>
              );
            })}
            <button onClick={()=>setMoreOpen(false)} style={{ position:"absolute",top:8,right:12,background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.g400,lineHeight:1 }}>x</button>
          </div>
        )}
        {/* Tap outside to close More drawer */}
        {moreOpen && <div style={{ position:"fixed",inset:0,zIndex:198 }} onClick={()=>setMoreOpen(false)}/>}

        {/* Toast */}
        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToastState(null)}/>}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT — AUTH GATE
══════════════════════════════════════════════════════ */
let _explicitSignOut = false;

async function doSignOut() {
  _explicitSignOut = true;
  await supabase.auth.signOut();
}

export default function PatientPortal() {
  const [user, setUser]       = useState(undefined); // undefined = checking
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        if (_explicitSignOut) { _explicitSignOut = false; setExpired(false); }
        else { setExpired(true); }
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setExpired(false);
      }
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) return <LoadingScreen/>;
  if (!user) return <PatientLogin onLogin={setUser} expired={expired}/>;

  return (
    <ErrorBoundary>
      <PatientApp user={user} onSignOut={doSignOut}/>
    </ErrorBoundary>
  );
}
