// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--clay:#C4622D;--clay2:#E07B45;--sand:#F5E6C8;--sand2:#FAF3E4;--bark:#3D2B1F;--bark2:#5C3D2E;--cream:#FFFBF4;--shadow:rgba(61,43,31,.10);--shadowM:rgba(61,43,31,.22)}
body{font-family:'DM Sans',sans-serif;color:var(--bark)}
.page{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
@media(max-width:700px){.page{grid-template-columns:1fr}}
.left{background:var(--bark);display:flex;flex-direction:column;justify-content:space-between;padding:36px 40px;position:relative;overflow:hidden}
@media(max-width:700px){.left{display:none}}
.lp{position:absolute;inset:0;opacity:.05;background-image:repeating-linear-gradient(45deg,var(--sand) 0,var(--sand) 1px,transparent 0,transparent 50%);background-size:20px 20px;pointer-events:none}
.lg{position:absolute;bottom:-80px;left:-50px;width:320px;height:320px;background:radial-gradient(circle,rgba(196,98,45,.3) 0%,transparent 65%);pointer-events:none}
.ll{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:var(--sand);position:relative;cursor:pointer}
.ll span{color:var(--clay2)}
.lc{position:relative}
.lh{font-family:'Playfair Display',serif;font-size:clamp(22px,3vw,36px);font-weight:900;color:var(--sand);line-height:1.15;margin-bottom:14px}
.lh em{color:var(--clay2);font-style:normal}
.lsb{font-size:13px;color:rgba(245,230,200,.6);line-height:1.65;margin-bottom:24px}
.lst{display:flex;gap:22px;flex-wrap:wrap}
.lsn{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--clay2)}
.lsl{font-size:10px;color:rgba(245,230,200,.45);margin-top:2px;font-weight:500}
.ltrust{display:flex;align-items:center;gap:10px;position:relative}
.tavs{display:flex}
.tav{width:32px;height:32px;border-radius:50%;border:2px solid var(--bark);background:var(--clay);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;margin-left:-8px;font-family:'Playfair Display',serif}
.tav:first-child{margin-left:0}
.ttxt{font-size:11px;color:rgba(245,230,200,.55);line-height:1.4}
.right{background:var(--cream);display:flex;flex-direction:column;justify-content:center;padding:36px 44px}
@media(max-width:900px){.right{padding:36px 24px}}
.mob-logo{font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:var(--bark);margin-bottom:28px;display:none}
.mob-logo span{color:var(--clay2)}
@media(max-width:700px){.mob-logo{display:block}}
.ft{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:var(--bark);margin-bottom:5px}
.fsb{font-size:13px;color:var(--bark2);opacity:.6;margin-bottom:22px}
.tabs{display:flex;background:var(--sand2);border-radius:11px;padding:4px;margin-bottom:22px}
.tab{flex:1;padding:8px;border-radius:8px;border:none;background:none;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--bark2)}
.tab.on{background:#fff;color:var(--bark);box-shadow:0 1px 5px var(--shadow)}
.rg{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:18px}
.rc{padding:14px 12px;border-radius:12px;border:2px solid rgba(61,43,31,.1);background:#fff;cursor:pointer;transition:all .2s;text-align:center;user-select:none}
.rc.sel{border-color:var(--clay);background:rgba(196,98,45,.06)}
.ri{font-size:22px;margin-bottom:6px}
.rl{font-size:13px;font-weight:600;color:var(--bark);margin-bottom:2px}
.rd{font-size:10px;color:var(--bark2);opacity:.5;line-height:1.35}
.fg{margin-bottom:14px}
.fl{font-size:10px;font-weight:700;color:var(--bark2);margin-bottom:5px;display:block;text-transform:uppercase;letter-spacing:.6px;opacity:.65}
.iw{position:relative}
.fi{width:100%;background:var(--sand2);border:1.5px solid rgba(61,43,31,.1);border-radius:10px;padding:11px 38px 11px 13px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--bark);outline:none;transition:border-color .2s}
.fi:focus{border-color:var(--clay);background:#fff}
.ii{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;opacity:.3;cursor:pointer;user-select:none}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.chk{display:flex;align-items:flex-start;gap:9px;margin-bottom:16px;cursor:pointer;user-select:none}
.cb2{width:17px;height:17px;border-radius:4px;border:1.5px solid rgba(61,43,31,.2);flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;font-size:10px;transition:all .15s}
.cb2.on{background:var(--clay);border-color:var(--clay);color:#fff}
.ct{font-size:12px;color:var(--bark2);opacity:.65;line-height:1.5}
.ct a{color:var(--clay);font-weight:600}
.bsub{width:100%;background:var(--clay);color:#fff;border:none;border-radius:11px;padding:13px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;margin-bottom:14px}
.bsub:hover{background:var(--clay2)}
.bsub:disabled{opacity:.6;cursor:not-allowed}
.err{background:#fff0ed;border:1.5px solid rgba(196,98,45,.25);color:var(--clay);border-radius:9px;padding:10px 13px;font-size:12px;font-weight:500;margin-bottom:14px;display:flex;align-items:center;gap:7px}
.swl{text-align:center;font-size:12px;color:var(--bark2);opacity:.6}
.swl a{color:var(--clay);font-weight:600;cursor:pointer}
`;

export default function AuthPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, register } = useAuth();

  const [mode,    setMode]    = useState("login");
  const [role,    setRole]    = useState("TENANT");
  const [showPw,  setShowPw]  = useState(false);
  const [agreed,  setAgreed]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({ fn: "", ln: "", email: "", phone: "", pw: "" });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError(""); }

  const from = location.state?.from || "/";

  async function handleSubmit() {
    setError("");
    if (mode === "register") {
      if (!form.fn || !form.email || !form.pw) return setError("Please fill in all required fields.");
      if (form.pw.length < 6) return setError("Password must be at least 6 characters.");
      if (!agreed) return setError("Please agree to the Terms & Privacy Policy.");
    } else {
      if (!form.email || !form.pw) return setError("Please enter your email and password.");
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await register({ name: `${form.fn} ${form.ln}`.trim(), email: form.email, phone: form.phone || undefined, password: form.pw, role });
      } else {
        await login(form.email, form.pw);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isReg = mode === "register";

  return (
    <>
      <style>{css}</style>
      <div className="page">
        {/* LEFT PANEL */}
        <div className="left">
          <div className="lp" /><div className="lg" />
          <div className="ll" onClick={() => navigate("/")}>Pang<span>isha</span></div>
          <div className="lc">
            <h2 className="lh">Your next home in <em>Dar es Salaam</em> starts here</h2>
            <p className="lsb">Connect with verified landlords across Kinondoni, Ilala, Temeke and beyond. No middlemen, no hidden fees.</p>
            <div className="lst">
              {[{ n: "1,000+", l: "Active listings" }, { n: "5", l: "Districts" }, { n: "Free", l: "Always" }]
                .map(s => <div key={s.l}><div className="lsn">{s.n}</div><div className="lsl">{s.l}</div></div>)}
            </div>
          </div>
          <div className="ltrust">
            <div className="tavs">{["A","J","M","F"].map((l,i) => <div key={i} className="tav">{l}</div>)}</div>
            <div className="ttxt">Joined by thousands of tenants<br />and landlords this year</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right">
          <div className="mob-logo" onClick={() => navigate("/")}>Pang<span>isha</span></div>
          <div className="ft">{isReg ? "Create your account" : "Welcome back"}</div>
          <div className="fsb">{isReg ? "Join thousands finding homes in Dar es Salaam" : "Sign in to your Pangisha account"}</div>

          <div className="tabs">
            <button className={`tab ${mode === "login" ? "on" : ""}`} onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
            <button className={`tab ${isReg ? "on" : ""}`} onClick={() => { setMode("register"); setError(""); }}>Create account</button>
          </div>

          {isReg && (
            <div className="fg">
              <div className="fl">I am a</div>
              <div className="rg">
                {[{ v: "TENANT", i: "🔍", l: "Tenant", d: "Looking for a place to rent" },
                  { v: "LANDLORD", i: "🏠", l: "Landlord / Agent", d: "I have a property to list" }]
                  .map(r => (
                    <div key={r.v} className={`rc ${role === r.v ? "sel" : ""}`} onClick={() => setRole(r.v)}>
                      <div className="ri">{r.i}</div><div className="rl">{r.l}</div><div className="rd">{r.d}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {error && <div className="err">⚠️ {error}</div>}

          {isReg && (
            <div className="frow">
              <div className="fg"><label className="fl">First name *</label><input className="fi" placeholder="Amina" value={form.fn} onChange={e => set("fn", e.target.value)} /></div>
              <div className="fg"><label className="fl">Last name</label><input className="fi" placeholder="Juma" value={form.ln} onChange={e => set("ln", e.target.value)} /></div>
            </div>
          )}

          <div className="fg">
            <label className="fl">Email address *</label>
            <div className="iw"><input className="fi" type="email" placeholder="you@email.com" value={form.email} onChange={e => set("email", e.target.value)} /><span className="ii">✉️</span></div>
          </div>

          {isReg && (
            <div className="fg">
              <label className="fl">Phone / WhatsApp</label>
              <div className="iw"><input className="fi" placeholder="+255 7XX XXX XXX" value={form.phone} onChange={e => set("phone", e.target.value)} /><span className="ii">📱</span></div>
            </div>
          )}

          <div className="fg">
            <label className="fl">Password *</label>
            <div className="iw">
              <input className="fi" type={showPw ? "text" : "password"} placeholder={isReg ? "Min. 6 characters" : "Your password"} value={form.pw} onChange={e => set("pw", e.target.value)} />
              <span className="ii" onClick={() => setShowPw(!showPw)}>{showPw ? "🙈" : "👁️"}</span>
            </div>
          </div>

          {isReg ? (
            <div className="chk" onClick={() => setAgreed(!agreed)}>
              <div className={`cb2 ${agreed ? "on" : ""}`}>{agreed ? "✓" : ""}</div>
              <div className="ct">I agree to Pangisha's <a>Terms of Service</a> and <a>Privacy Policy</a></div>
            </div>
          ) : (
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <a style={{ fontSize: 12, color: "var(--clay)", fontWeight: 600, cursor: "pointer" }}>Forgot password?</a>
            </div>
          )}

          <button className="bsub" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait…" : isReg ? `Create ${role === "LANDLORD" ? "landlord" : "tenant"} account →` : "Sign in →"}
          </button>

          <div className="swl">
            {isReg ? "Already have an account? " : "New to Pangisha? "}
            <a onClick={() => { setMode(isReg ? "login" : "register"); setError(""); }}>
              {isReg ? "Sign in" : "Create account"}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
