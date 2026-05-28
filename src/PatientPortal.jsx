import { useState, useEffect, useCallback, useRef, Component } from "react";
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
  plus:"M12 5v14 M5 12h14",
  clock:"M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2",
  alert:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  fire:"M12 22c0 0-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z",
  send:"M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  repeat:"M17 1l4 4-4 4 M3 11V9a4 4 0 014-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 01-4 4H3",
  info:"M12 22a10 10 0 100-20 10 10 0 000 20z M12 8h.01 M12 12v4",
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
  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
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
   TAB: HOME / DASHBOARD
══════════════════════════════════════════════════════ */
function HomeTab({ patient, appts, heps, plans, claims, exerciseLib, onNav, onBookAppt }) {
  const upcoming = appts.filter(a => isFuture(a.date) && a.status !== "Cancelled").sort((a,b) => a.date.localeCompare(b.date));
  const nextAppt = upcoming[0];
  const myHep    = heps[0]; // latest active HEP
  const myPlan   = plans.find(p => p.status === "Active") || plans[0];
  const unpaidBills = claims.filter(c => c.status !== "Paid" && c.status !== "Void");

  // Exercise streak from localStorage
  const getStreak = () => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const k = `hep_done_${d.toISOString().slice(0,10)}_${patient.id}`;
      if (!localStorage.getItem(k)) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };
  const streak = getStreak();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ padding:"0 0 24px" }}>
      {/* Hero greeting */}
      <div style={{ background:`linear-gradient(135deg,${C.p900} 0%,${C.p700} 55%,${C.p500} 100%)`, borderRadius:20, padding:"22px 22px 20px", marginBottom:18, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-30, top:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,.06)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", right:20, bottom:-20, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,.04)", pointerEvents:"none" }}/>
        <p style={{ fontSize:13, color:C.p200, fontWeight:500, marginBottom:4 }}>{greeting()},</p>
        <h1 style={{ fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-0.5px", marginBottom:2 }}>{patient.fn} {patient.ln}</h1>
        <p style={{ fontSize:12, color:"rgba(196,181,253,.75)" }}>
          {patient.dob ? `${ptAge(patient.dob)} years old · ` : ""}{patient.insurance || "No insurance on file"}
        </p>
      </div>

      {/* Quick stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:18 }}>
        {[
          { label:"Upcoming", value:upcoming.length, icon:"calendar", color:C.p500, bg:C.p50 },
          { label:"Ex. Streak", value:`${streak}d`, icon:"fire", color:C.a600, bg:C.a50 },
          { label:"Unpaid", value:unpaidBills.length, icon:"dollar", color: unpaidBills.length ? C.r600 : C.gr600, bg: unpaidBills.length ? C.r50 : C.gr50 },
        ].map((s, i) => (
          <div key={i} style={{ background:C.w, borderRadius:14, border:`1px solid ${C.g200}`, padding:"14px 12px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ width:32, height:32, borderRadius:9, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
              <Ic n={s.icon} s={16} c={s.color} sw={2}/>
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:C.g800, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:10, color:C.g400, marginTop:3, fontWeight:600, textTransform:"uppercase", letterSpacing:0.4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Next appointment */}
      {nextAppt ? (
        <Card style={{ marginBottom:14 }}>
          <div style={{ background:`linear-gradient(135deg,${C.b50},${C.p50})`, padding:"14px 18px", borderBottom:`1px solid ${C.g100}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <Ic n="calendar" s={15} c={C.p500} sw={2}/>
              <span style={{ fontSize:11, fontWeight:700, color:C.p600, textTransform:"uppercase", letterSpacing:0.6 }}>Next Appointment</span>
            </div>
          </div>
          <div style={{ padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:C.g800 }}>{nextAppt.type}</p>
                <p style={{ fontSize:13, color:C.g500, marginTop:3 }}>{fmtDateFull(nextAppt.date)} at {fmtTime(nextAppt.time)}</p>
                <p style={{ fontSize:12, color:C.g400, marginTop:2 }}>with {nextAppt.provider} · {nextAppt.room}</p>
              </div>
              <Bdg label={nextAppt.status} color={apptColor(nextAppt.status)}/>
            </div>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom:14 }}>
          <div style={{ padding:"20px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:C.g700, marginBottom:3 }}>No upcoming appointments</p>
              <p style={{ fontSize:12, color:C.g400 }}>Book your next visit with us</p>
            </div>
            <button onClick={onBookAppt} style={{ padding:"8px 16px", background:C.p500, color:"#fff", border:"none", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>Book Now</button>
          </div>
        </Card>
      )}

      {/* HEP snapshot */}
      {myHep && (
        <Card style={{ marginBottom:14 }}>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.g100}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Ic n="dumbbell" s={15} c={C.p500} sw={2}/>
              <span style={{ fontSize:11, fontWeight:700, color:C.p600, textTransform:"uppercase", letterSpacing:0.6 }}>Today's Exercises</span>
            </div>
            <button onClick={() => onNav("exercises")} style={{ fontSize:12, fontWeight:600, color:C.p500, background:"none", border:"none", cursor:"pointer" }}>View All →</button>
          </div>
          <div style={{ padding:"14px 18px" }}>
            <p style={{ fontSize:14, fontWeight:700, color:C.g800, marginBottom:4 }}>{myHep.title}</p>
            <p style={{ fontSize:12, color:C.g500 }}>{myHep.exercises?.length || 0} exercises · {myHep.exercises?.[0]?.freq || "Daily"}</p>
            {streak > 0 && <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.a600, fontWeight:600 }}><Ic n="fire" s={14} c={C.a600} sw={2}/>{streak}-day streak — keep it up! 🎉</div>}
          </div>
        </Card>
      )}

      {/* Active plan */}
      {myPlan && (
        <Card>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.g100}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Ic n="clipboard" s={15} c={C.teal600} sw={2}/>
              <span style={{ fontSize:11, fontWeight:700, color:C.teal600, textTransform:"uppercase", letterSpacing:0.6 }}>Active Treatment Plan</span>
            </div>
            <button onClick={() => onNav("plan")} style={{ fontSize:12, fontWeight:600, color:C.teal600, background:"none", border:"none", cursor:"pointer" }}>View →</button>
          </div>
          <div style={{ padding:"14px 18px" }}>
            <p style={{ fontSize:14, fontWeight:700, color:C.g800, marginBottom:3 }}>{myPlan.title}</p>
            <p style={{ fontSize:12, color:C.g500 }}>{myPlan.phase} · Started {fmtDate(myPlan.startDate)}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TAB: APPOINTMENTS
══════════════════════════════════════════════════════ */
function AppointmentsTab({ patient, appts, setAppts, providers, clinicId, toast }) {
  const [tab, setTab]           = useState("upcoming");
  const [showBook, setShowBook] = useState(false);
  const [form, setForm]         = useState({ type:"Follow-up", date:"", time:"09:00", provider: providers[0] || "", notes:"" });
  const [saving, setSaving]     = useState(false);

  const APPT_TYPES = ["Initial Assessment","Follow-up","Re-assessment","Manual Therapy","Dry Needling","Group Session","Telehealth","Discharge Assessment"];
  const TIMES = ["07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];

  const upcoming = appts.filter(a => isFuture(a.date) && a.status !== "Cancelled").sort((a,b) => a.date.localeCompare(b.date));
  const past     = appts.filter(a => isPast(a.date) || a.status === "Completed" || a.status === "Cancelled").sort((a,b) => b.date.localeCompare(a.date));

  async function bookAppt() {
    if (!form.date || !form.type) return;
    setSaving(true);
    const newAppt = { id:`AP-${Date.now()}`, pid:patient.id, status:"Requested", duration:30, room:"TBD", cc:form.notes||"", ...form };
    const { error } = await supabase.from("appointments").upsert({ id:newAppt.id, clinic_id:clinicId, data:newAppt });
    setSaving(false);
    if (error) { toast("Failed to book — please call the clinic", "error"); return; }
    setAppts(p => [newAppt, ...p]);
    setShowBook(false);
    setForm({ type:"Follow-up", date:"", time:"09:00", provider:providers[0]||"", notes:"" });
    toast("Appointment request sent! We'll confirm shortly.");
  }

  function ApptCard({ a }) {
    return (
      <div style={{ background:C.w, borderRadius:14, border:`1px solid ${C.g200}`, padding:"14px 16px", marginBottom:10, boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
          <p style={{ fontSize:14, fontWeight:700, color:C.g800 }}>{a.type}</p>
          <Bdg label={a.status} color={apptColor(a.status)}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:C.g600 }}>
            <Ic n="calendar" s={13} c={C.g400} sw={2}/>{fmtDateFull(a.date)}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:C.g500 }}>
            <Ic n="clock" s={13} c={C.g400} sw={2}/>{fmtTime(a.time)} · {a.duration} min
          </div>
          {a.provider && <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:C.g500 }}>
            <Ic n="user" s={13} c={C.g400} sw={2}/>{a.provider}
          </div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHead
        title="Appointments"
        sub="View your schedule and request new visits"
        action={<button onClick={() => setShowBook(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:C.p500, color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}><Ic n="plus" s={14} c="#fff" sw={2.5}/>Book</button>}
      />

      {/* Tab switcher */}
      <div style={{ display:"flex", gap:4, background:C.g100, borderRadius:10, padding:3, marginBottom:16 }}>
        {[["upcoming","Upcoming"], ["past","Past"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:"7px 12px", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", background:tab===k?C.w:"transparent", color:tab===k?C.p600:C.g500, boxShadow:tab===k?"0 1px 4px rgba(0,0,0,.08)":"none", transition:"all .15s" }}>{l} {k==="upcoming"?`(${upcoming.length})`:`(${past.length})`}</button>
        ))}
      </div>

      {tab === "upcoming" && (
        upcoming.length ? upcoming.map(a => <ApptCard key={a.id} a={a}/>) : <Empty icon="calendar" title="No upcoming appointments" sub="Use the Book button to request your next visit."/>
      )}
      {tab === "past" && (
        past.length ? past.map(a => <ApptCard key={a.id} a={a}/>) : <Empty icon="calendar" title="No past appointments" sub="Your visit history will appear here."/>
      )}

      {/* Book appointment modal */}
      {showBook && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,10,30,.6)", backdropFilter:"blur(3px)", zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center", padding:"0" }}>
          <div style={{ background:C.w, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", padding:"24px 22px 32px", animation:"fadeUp .25s ease both" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:800, color:C.g800 }}>Request Appointment</h3>
              <button onClick={() => setShowBook(false)} style={{ background:C.g100, border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}><Ic n="x" s={16} c={C.g500}/></button>
            </div>

            {[
              { label:"Appointment Type", el: <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={IST}>{APPT_TYPES.map(t=><option key={t}>{t}</option>)}</select> },
              { label:"Preferred Date", el: <input type="date" value={form.date} min={TODAY} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={IST}/> },
              { label:"Preferred Time", el: <select value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} style={IST}>{TIMES.map(t=><option key={t} value={t}>{fmtTime(t)}</option>)}</select> },
              ...(providers.length > 0 ? [{ label:"Preferred Provider", el: <select value={form.provider} onChange={e=>setForm(p=>({...p,provider:e.target.value}))} style={IST}><option value="">— No preference —</option>{providers.map(pr=><option key={pr}>{pr}</option>)}</select> }] : []),
              { label:"Notes (optional)", el: <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Anything you'd like the clinic to know…" rows={3} style={{...IST,resize:"vertical"}}/> },
            ].map((f,i) => (
              <div key={i} style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.g600, marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 }}>{f.label}</label>
                {f.el}
              </div>
            ))}

            <div style={{ background:C.a50, border:`1px solid #fcd34d`, borderRadius:10, padding:"10px 12px", marginBottom:18, fontSize:12, color:C.a700, display:"flex", gap:8, alignItems:"flex-start" }}>
              <Ic n="info" s={14} c={C.a600} sw={2}/>
              <span>This sends a <strong>request</strong> to the clinic. Staff will confirm your appointment and you'll be notified.</span>
            </div>

            <button onClick={bookAppt} disabled={saving||!form.date} style={{ width:"100%", padding:"13px", background:saving||!form.date?C.g300:C.p500, color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:saving||!form.date?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"background .15s" }}>
              {saving ? <><div style={{ width:15,height:15,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite" }}/>Sending…</> : "Send Request"}
            </button>
          </div>
        </div>
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

      {/* Video player modal */}
      {playUrl && (
        <div onClick={()=>setPlayUrl(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
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
        </div>
      )}
    </div>
  );
}

function ExercisesTab({ patient, heps, exerciseLib, toast }) {
  const [subTab, setSubTab] = useState("program");
  const [selHep, setSelHep] = useState(heps[0]?.id || null);
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

  function toggleDone(exId) {
    const key = doneKey(exId);
    const nowDone = !done[exId];
    if (nowDone) { localStorage.setItem(key, "1"); } else { localStorage.removeItem(key); }
    setDone(p => ({ ...p, [exId]: nowDone }));
    if (nowDone) toast("Exercise marked complete! 💪", "success");
  }

  const videoCount = exerciseLib.filter(e => e.videoUrl).length;

  return (
    <div>
      {/* Sub-tab switcher */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:C.g100, borderRadius:12, padding:4, width:"fit-content" }}>
        {[["program","My Program","dumbbell"],["videos","Video Library","play-circle"]].map(([id,label,icon])=>(
          <button key={id} onClick={()=>setSubTab(id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:9, border:"none", cursor:"pointer", fontWeight:subTab===id?700:500, fontSize:13, background:subTab===id?C.w:"transparent", color:subTab===id?C.p600:C.g500, boxShadow:subTab===id?"0 1px 4px rgba(0,0,0,.1)":"none", transition:"all .15s" }}>
            <Ic n={icon} s={13} c={subTab===id?C.p600:C.g400} sw={2}/>
            {label}
            {id==="videos"&&videoCount>0&&<span style={{ fontSize:10, fontWeight:700, background:C.p100, color:C.p700, borderRadius:99, padding:"1px 6px" }}>{videoCount}</span>}
          </button>
        ))}
      </div>

      {subTab === "videos" && <VideoLibrary exerciseLib={exerciseLib}/>}

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
                      {(libEx.svg || libEx.imageUrl) && (
                        <div style={{ background:isDone?C.gr50:C.p50, display:"flex", justifyContent:"center", padding:"14px 18px 10px", borderBottom:`1px solid ${isDone?C.gr100:C.p100}` }}>
                          {libEx.svg
                            ? <div style={{ width:110, height:75, opacity:isDone?.6:1, transition:"opacity .2s" }} dangerouslySetInnerHTML={{ __html: libEx.svg }}/>
                            : <img src={libEx.imageUrl} alt={libEx.name} style={{ width:110, height:75, objectFit:"contain", opacity:isDone?.6:1, transition:"opacity .2s" }} onError={e=>e.currentTarget.style.display="none"}/>
                          }
                        </div>
                      )}
                      {libEx.videoUrl && (
                        <div style={{padding:"10px 18px 0"}}>
                          <a href={libEx.videoUrl} target="_blank" rel="noopener noreferrer"
                            style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,color:C.p600,textDecoration:"none",background:C.p50,border:`1px solid ${C.p200}`,borderRadius:8,padding:"7px 12px",width:"fit-content"}}>
                            ▶ Watch Demo Video
                          </a>
                        </div>
                      )}
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
                        <button onClick={() => toggleDone(ex.exId)} style={{ width:"100%", padding:"9px", border:`1.5px solid ${isDone?C.gr600:C.p300}`, borderRadius:9, background:isDone?C.gr600:C.w, color:isDone?"#fff":C.p600, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all .2s" }}>
                          <Ic n={isDone?"check":"repeat"} s={14} c={isDone?"#fff":C.p600} sw={2.5}/>
                          {isDone ? "Done for today" : "Mark Complete"}
                        </button>
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
  const totalOwed   = outstanding.reduce((s, c) => s + (c.amount - (c.paidAmt || 0)), 0);

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
            {c.paidAmt > 0 && c.status !== "Paid" ? `$${c.paidAmt.toFixed(2)} paid` : "Billed amount"}
          </span>
          <span style={{ fontSize:16, fontWeight:800, color: c.status === "Paid" ? C.gr600 : owed > 0 ? C.r600 : C.g800 }}>
            {c.status === "Paid" ? `$${(c.paidAmt||c.amount||0).toFixed(2)}` : `$${owed.toFixed(2)}`}
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
        <Ic n={open?"chevron-up":"chevron-down"} s={16} c={C.g400} sw={2}/>
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
function ProfileTab({ patient, user, onSignOut, clinicId }) {
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

      {/* Sign out */}
      <button onClick={onSignOut} style={{ width:"100%", padding:"13px", background:C.w, color:C.r600, border:`1.5px solid #fca5a5`, borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .15s" }} onMouseEnter={e=>{e.currentTarget.style.background=C.r50;}} onMouseLeave={e=>{e.currentTarget.style.background=C.w;}}>
        <Ic n="logout" s={16} c={C.r600} sw={2}/>
        Sign Out
      </button>
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
    await supabase.from("messages").insert([{ id: msg.id, clinic_id: clinicId, data: msg }]);
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
   MAIN PATIENT APP (after login + patient lookup)
══════════════════════════════════════════════════════ */
function PatientApp({ user, onSignOut }) {
  const [nav, setNav]             = useState("home");
  const [patient, setPatient]     = useState(null);
  const [clinicId, setClinicId]   = useState(null);
  const [appts, setAppts]         = useState([]);
  const [heps, setHeps]           = useState([]);
  const [plans, setPlans]         = useState([]);
  const [outcomes, setOutcomes]   = useState([]);
  const [claims, setClaims]       = useState([]);
  const [providers, setProviders] = useState([]);
  const [exerciseLib, setExLib]   = useState([]);
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [toast, setToastState]    = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToastState({ msg, type, key: Date.now() });
  }, []);

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

      setAppts(extract(apptRows).filter(a => a.pid === pid));
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

      setLoading(false);
    }
    load();
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
    { id:"appointments",label:"Bookings",   icon:"calendar" },
    { id:"exercises",   label:"Exercises",  icon:"dumbbell" },
    { id:"plan",        label:"My Plan",    icon:"clipboard" },
    { id:"billing",     label:"Billing",    icon:"dollar" },
    { id:"messages",    label:"Messages",   icon:"send" },
    { id:"profile",     label:"Profile",    icon:"user" },
  ];

  return (
    <>
      <style>{GLOBAL_CSS}{`
        /* ── Mobile-first base ── */
        .pp-root { min-height: 100vh; background: ${C.bg}; position: relative; padding-bottom: 80px; }
        .pp-sidebar { display: none; }
        .pp-header { position: sticky; top: 0; z-index: 100; background: rgba(248,247,255,.92); backdrop-filter: blur(10px); border-bottom: 1px solid ${C.g200}; padding: 14px 18px 10px; display: flex; justify-content: space-between; align-items: center; }
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
              <div style={{ width:38, height:38, borderRadius:11, background:`linear-gradient(135deg,${C.p700},${C.p500})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 17 C5 14 5 11 7 9 C9 7.5 10.5 7 12 7 C13.5 7 15 7.5 17 9 C19 11 19 14 18 17"/>
                  <path d="M1 17 Q12 20.5 23 17"/>
                  <path d="M10 7.8 Q12 6.5 14 7.8"/>
                  <path d="M12 10.5v3 M10.5 12h3"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.g800, lineHeight:1 }}>Cowboy EHR</div>
                <div style={{ fontSize:10, color:C.g400, fontWeight:600, marginTop:2 }}>Patient Portal</div>
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
            </div>
          )}
        </aside>

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
              <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${C.p500},${C.p300})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" }}>
                {`${patient.fn?.[0]||""}${patient.ln?.[0]||""}`.toUpperCase()}
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:C.g700 }}>{patient.fn}</span>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="pp-content fade-up">
          {patient && nav === "home"         && <HomeTab patient={patient} appts={appts} heps={heps} plans={plans} claims={claims} exerciseLib={exerciseLib} onNav={setNav} onBookAppt={() => setNav("appointments")}/>}
          {patient && nav === "appointments" && <AppointmentsTab patient={patient} appts={appts} setAppts={setAppts} providers={providers} clinicId={clinicId} toast={showToast}/>}
          {patient && nav === "exercises"    && <ExercisesTab patient={patient} heps={heps} exerciseLib={exerciseLib} toast={showToast}/>}
          {patient && nav === "plan"         && <PlanTab patient={patient} plans={plans} outcomes={outcomes}/>}
          {patient && nav === "billing"      && <BillingTab claims={claims}/>}
          {patient && nav === "messages"    && <MessagesTab patient={patient} user={user} messages={messages} setMessages={setMessages} clinicId={clinicId}/>}
          {patient && nav === "profile"      && <ProfileTab patient={patient} user={user} onSignOut={onSignOut} clinicId={clinicId}/>}
        </div>

        {/* Mobile bottom nav */}
        <nav className="pp-nav">
          {NAV.map(item => {
            const active = nav === item.id;
            return (
              <button key={item.id} className="pp-nav-btn" onClick={() => setNav(item.id)}>
                <div style={{ width:36, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:active?C.p100:"transparent", transition:"background .15s" }}>
                  <Ic n={item.icon} s={18} c={active?C.p600:C.g400} sw={active?2.2:1.8}/>
                </div>
                <span style={{ fontSize:10, fontWeight: active?700:500, color:active?C.p600:C.g400, letterSpacing:0.1 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

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
