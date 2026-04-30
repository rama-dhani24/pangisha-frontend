// src/pages/AdminPanel.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../api/admin.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";

const T = {
  en:{ adminTitle:"Admin Panel",adminSub:"Moderate listings and manage users",allListingsTab:"Listings",usersTab:"Users",reportsTab:"Reports",approve:"Approve",suspend:"Suspend",reinstate:"Reinstate",deactivate:"Deactivate",activate:"Activate",allStatuses:"All",pending:"Pending",active:"Active",suspended:"Suspended",rented:"Rented",totalUsers:"Users",totalListings:"Listings",flagged:"Reports",pendingReview:"Pending",resolved:"Resolve",viewListing:"View",back:"← Back",lang:"SW 🇹🇿",room:"Room",business:"Business",apartment:"Apt",perMonth:"/mo",landlord:"Landlord",tenant:"Tenant",admin:"Admin",joined:"Joined",listings:"listings",filterLabel:"Status:",searchPlaceholder:"Search listings…",userActive:"Active",userInactive:"Inactive",reportReason:{SPAM:"Spam",FAKE:"Fake",WRONG_PRICE:"Wrong price",INAPPROPRIATE:"Inappropriate",OTHER:"Other"},loading:"Loading…",noItems:"Nothing to show." },
  sw:{ adminTitle:"Jopo la Msimamizi",adminSub:"Kagua matangazo na simamia watumiaji",allListingsTab:"Matangazo",usersTab:"Watumiaji",reportsTab:"Ripoti",approve:"Idhinisha",suspend:"Simamisha",reinstate:"Rejesha",deactivate:"Zima",activate:"Washa",allStatuses:"Zote",pending:"Inasubiri",active:"Hai",suspended:"Imesimamishwa",rented:"Imekodishwa",totalUsers:"Watumiaji",totalListings:"Matangazo",flagged:"Ripoti",pendingReview:"Inasubiri",resolved:"Shimghulikia",viewListing:"Angalia",back:"← Rudi",lang:"EN 🇬🇧",room:"Chumba",business:"Biashara",apartment:"Fleti",perMonth:"/mwezi",landlord:"Mmiliki",tenant:"Mpangaji",admin:"Msimamizi",joined:"Alijiunga",listings:"matangazo",filterLabel:"Hali:",searchPlaceholder:"Tafuta…",userActive:"Hai",userInactive:"Imezimwa",reportReason:{SPAM:"Barua taka",FAKE:"Bandia",WRONG_PRICE:"Bei potofu",INAPPROPRIATE:"Yasiyofaa",OTHER:"Nyingine"},loading:"Inapakia…",noItems:"Hakuna kitu." },
};

const SS = { ACTIVE:{background:"#e8f5e9",color:"#2e7d32"}, PENDING:{background:"#fff3e0",color:"#e65100"}, SUSPENDED:{background:"#fce4ec",color:"#880e4f"}, RENTED:{background:"#e3f2fd",color:"#1565c0"} };
const AC = ["#C4622D","#7A8C4B","#3D7AB5","#8B4513","#5C3D2E","#9B59B6"];
const RL = { LANDLORD:{background:"#fff3e0",color:"#e65100"}, TENANT:{background:"#FAF3E4",color:"#5C3D2E"}, ADMIN:{background:"#e8f5e9",color:"#2e7d32"} };

function fmt(p) { if (p >= 1000) return (p/1000).toFixed(0)+"k"; return p; }

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--clay:#C4622D;--clay2:#E07B45;--sand:#F5E6C8;--sand2:#FAF3E4;--bark:#3D2B1F;--bark2:#5C3D2E;--cream:#FFFBF4;--shadow:rgba(61,43,31,.10);--shadowM:rgba(61,43,31,.15)}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--bark)}
.nav{background:var(--bark);display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:52px}
.nlo{font-family:'Playfair Display',serif;font-size:21px;font-weight:900;color:var(--sand);cursor:pointer}
.nlo span{color:var(--clay2)}
.nr{display:flex;align-items:center;gap:9px}
.nb{color:var(--sand);opacity:.75;font-size:13px;cursor:pointer}
.ab{background:rgba(196,98,45,.25);color:var(--clay2);border:1px solid rgba(196,98,45,.3);border-radius:6px;padding:3px 9px;font-size:11px;font-weight:700}
.lb{background:rgba(245,230,200,.12);color:var(--sand);border:1px solid rgba(245,230,200,.2);border-radius:7px;padding:4px 11px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}
.hb{background:var(--bark);padding:22px 20px 28px;position:relative;overflow:hidden}
.hb::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 80% 50%,rgba(196,98,45,.18) 0%,transparent 60%);pointer-events:none}
.hi{max-width:1100px;margin:0 auto;position:relative}
.pt{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:var(--sand);margin-bottom:3px}
.ps{font-size:12px;color:rgba(245,230,200,.6)}
.sr{background:var(--sand);display:flex;border-bottom:1px solid rgba(61,43,31,.08)}
.st{flex:1;text-align:center;padding:12px 6px;border-right:1px solid rgba(61,43,31,.08)}
.st:last-child{border-right:none}
.sn{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--clay)}
.sl{font-size:10px;color:var(--bark2);opacity:.6;font-weight:500;margin-top:2px}
.mn{max-width:1100px;margin:0 auto;padding:22px 16px 50px}
.tabs{display:flex;background:var(--sand2);border-radius:11px;padding:3px;margin-bottom:20px;max-width:380px}
.tab{flex:1;padding:8px 10px;border-radius:8px;border:none;background:none;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--bark2)}
.tab.on{background:#fff;color:var(--bark);box-shadow:0 1px 5px var(--shadow)}
.tb{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.fl2{font-size:11px;font-weight:600;color:var(--bark2);opacity:.55}
.fp{padding:5px 12px;border-radius:14px;border:1.5px solid rgba(61,43,31,.15);background:#fff;color:var(--bark2);font-size:11px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit}
.fp:hover{border-color:var(--clay);color:var(--clay)}
.fp.ac{background:var(--clay);border-color:var(--clay);color:#fff}
.si{background:var(--sand2);border:1.5px solid rgba(61,43,31,.1);border-radius:9px;padding:7px 13px;font-size:12px;font-family:'DM Sans',sans-serif;color:var(--bark);outline:none;transition:border-color .2s;margin-left:auto;min-width:180px}
.si:focus{border-color:var(--clay)}
.tw{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 9px var(--shadow);border:1.5px solid rgba(61,43,31,.07)}
.tr{display:grid;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(61,43,31,.05);transition:background .15s;gap:10px}
.tr:last-child{border-bottom:none}
.tr:hover{background:var(--sand2)}
.th2{background:var(--sand);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--bark2);opacity:.7;cursor:default}
.th2:hover{background:var(--sand)}
.lr2{grid-template-columns:40px 1fr 80px 70px 88px 130px}
.ri{width:40px;height:36px;border-radius:7px;object-fit:cover;background:var(--sand)}
.ri-ph{width:40px;height:36px;border-radius:7px;background:var(--sand);display:flex;align-items:center;justify-content:center;font-size:18px}
.rtm{font-weight:600;font-size:12px;color:var(--bark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.rmt{font-size:10px;color:var(--bark2);opacity:.5}
.rty{font-size:10px;font-weight:600;color:var(--bark2)}
.rp2{font-family:'Playfair Display',serif;font-size:13px;font-weight:700;color:var(--bark)}
.rp2 span{font-size:9px;font-family:'DM Sans',sans-serif;font-weight:400;opacity:.6}
.sb2{display:inline-block;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:700}
.ra{display:flex;gap:5px;flex-wrap:wrap}
.bx{padding:4px 9px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit;border:none;transition:opacity .15s}
.bx:hover{opacity:.85}
.bap{background:#e8f5e9;color:#2e7d32}
.bsu{background:#fce4ec;color:#880e4f}
.bri{background:#e3f2fd;color:#1565c0}
.bvw{background:var(--sand);color:var(--bark)}
.ur{grid-template-columns:36px 1fr 76px 60px 72px 82px}
.uav{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Playfair Display',serif;font-size:15px;font-weight:700;flex-shrink:0}
.un2{font-weight:600;font-size:12px;color:var(--bark);margin-bottom:2px}
.ue{font-size:10px;color:var(--bark2);opacity:.5}
.rb2{padding:2px 7px;border-radius:5px;font-size:9px;font-weight:700}
.vb{font-size:10px;font-weight:700;color:#2e7d32}
.rpr{grid-template-columns:1fr 90px 68px 96px}
.rlt{font-weight:600;font-size:12px;color:var(--bark);margin-bottom:2px}
.rby{font-size:10px;color:var(--bark2);opacity:.5}
.rdt{font-size:11px;color:var(--bark2);margin-top:3px;line-height:1.35;opacity:.8}
.reb{padding:3px 7px;border-radius:5px;font-size:9px;font-weight:700;background:var(--sand);color:var(--bark2)}
.ro{color:#e65100;font-size:10px;font-weight:700}
.rre{color:#2e7d32;font-size:10px;font-weight:700}
.brs{background:var(--sand2);color:var(--bark);border:none;border-radius:6px;padding:4px 9px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit}
.es{text-align:center;padding:40px 20px;color:var(--bark2);opacity:.45;font-size:13px}
.spinner{text-align:center;padding:40px;font-size:13px;color:var(--bark2);opacity:.6}
.err-b{background:#fff0ed;border:1px solid rgba(196,98,45,.3);color:var(--clay);border-radius:9px;padding:10px;font-size:12px;margin-bottom:14px}
`;

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { lang, toggleLang } = useLang();
  const [tab,      setTab]      = useState("listings");
  const [stats,    setStats]    = useState(null);
  const [listings, setListings] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [sf,       setSf]       = useState("all");
  const [search,   setSearch]   = useState("");

  const t = T[lang];

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    Promise.all([
      adminApi.getStats(),
      adminApi.getListings({ limit: 50 }),
      adminApi.getUsers({ limit: 50 }),
      adminApi.getReports({ status: "all" }),
    ]).then(([s, l, u, r]) => {
      setStats(s.data);
      setListings(l.data || []);
      setUsers(u.data || []);
      setReports(r.data || []);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAdmin, navigate]);

  async function setListingStatus(id, status) {
    try {
      await adminApi.updateListing(id, { status });
      setListings(p => p.map(l => l.id === id ? { ...l, status } : l));
    } catch (err) { alert(err.message); }
  }

  async function toggleUser(id, currentActive) {
    try {
      await adminApi.updateUser(id, { isActive: !currentActive });
      setUsers(p => p.map(u => u.id === id ? { ...u, isActive: !currentActive } : u));
    } catch (err) { alert(err.message); }
  }

  async function resolveReport(id) {
    try {
      await adminApi.resolveReport(id);
      setReports(p => p.map(r => r.id === id ? { ...r, status: "RESOLVED" } : r));
    } catch (err) { alert(err.message); }
  }

  const filteredListings = listings.filter(l => {
    const ms = sf === "all" || l.status === sf.toUpperCase();
    const mq = l.title.toLowerCase().includes(search.toLowerCase()) || l.owner?.name?.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  const openReports = reports.filter(r => r.status === "OPEN").length;
  const pendingCount = listings.filter(l => l.status === "PENDING").length;

  if (loading) return <><style>{css}</style><div className="spinner">⏳ Loading admin panel…</div></>;

  return (
    <>
      <style>{css}</style>
      <nav className="nav">
        <div className="nlo" onClick={() => navigate("/")}>Pang<span>isha</span></div>
        <div className="nr">
          <span className="ab">🛡️ Admin</span>
          <button className="lb" onClick={toggleLang}>{t.lang}</button>
          <span className="nb" onClick={() => navigate("/")}>{t.back}</span>
        </div>
      </nav>

      <div className="hb">
        <div className="hi">
          <div className="pt">{t.adminTitle}</div>
          <div className="ps">{t.adminSub}</div>
        </div>
      </div>

      <div className="sr">
        {[
          { n: stats?.totalListings ?? "—", l: t.totalListings },
          { n: stats?.totalUsers    ?? "—", l: t.totalUsers    },
          { n: pendingCount,                l: t.pendingReview  },
          { n: openReports,                 l: t.flagged        },
        ].map(s => <div key={s.l} className="st"><div className="sn">{s.n}</div><div className="sl">{s.l}</div></div>)}
      </div>

      <div className="mn">
        {error && <div className="err-b">⚠️ {error}</div>}

        <div className="tabs">
          {[
            { v:"listings", l:t.allListingsTab },
            { v:"users",    l:t.usersTab       },
            { v:"reports",  l:`${t.reportsTab}${openReports > 0 ? ` (${openReports})` : ""}` },
          ].map(tb => <button key={tb.v} className={`tab ${tab===tb.v?"on":""}`} onClick={() => setTab(tb.v)}>{tb.l}</button>)}
        </div>

        {/* LISTINGS */}
        {tab === "listings" && <>
          <div className="tb">
            <span className="fl2">{t.filterLabel}</span>
            {["all","pending","active","suspended"].map(s => (
              <button key={s} className={`fp ${sf===s?"ac":""}`} onClick={() => setSf(s)}>{t[s] || t.allStatuses}</button>
            ))}
            <input className="si" placeholder={t.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tw">
            <div className="tr th2 lr2"><div/><div>Title</div><div>Type</div><div>Price</div><div>Status</div><div>Actions</div></div>
            {filteredListings.length === 0
              ? <div className="es">{t.noItems}</div>
              : filteredListings.map(l => (
                <div key={l.id} className="tr lr2">
                  {l.images?.[0]?.url ? <img className="ri" src={l.images[0].url} alt="" /> : <div className="ri-ph">🏠</div>}
                  <div><div className="rtm">{l.title}</div><div className="rmt">📍 {l.district} · {l.owner?.name} · {new Date(l.createdAt).toLocaleDateString()}</div></div>
                  <div className="rty">{l.type}</div>
                  <div className="rp2">TZS {fmt(l.priceTzs)}<span>{t.perMonth}</span></div>
                  <div><span className="sb2" style={SS[l.status]}>{t[l.status.toLowerCase()]||l.status}</span></div>
                  <div className="ra">
                    <button className="bx bvw" onClick={() => navigate(`/listing/${l.id}`)}>{t.viewListing}</button>
                    {l.status === "PENDING"   && <button className="bx bap" onClick={() => setListingStatus(l.id,"ACTIVE")}>{t.approve}</button>}
                    {l.status === "ACTIVE"    && <button className="bx bsu" onClick={() => setListingStatus(l.id,"SUSPENDED")}>{t.suspend}</button>}
                    {l.status === "SUSPENDED" && <button className="bx bri" onClick={() => setListingStatus(l.id,"ACTIVE")}>{t.reinstate}</button>}
                  </div>
                </div>
              ))
            }
          </div>
        </>}

        {/* USERS */}
        {tab === "users" && (
          <div className="tw">
            <div className="tr th2 ur"><div/><div>User</div><div>Role</div><div>Listings</div><div>Status</div><div>Action</div></div>
            {users.map((u, i) => (
              <div key={u.id} className="tr ur">
                <div className="uav" style={{ background: AC[i % AC.length] }}>{u.name[0]}</div>
                <div>
                  <div className="un2">{u.name} {u.isVerified && <span className="vb">✓</span>}</div>
                  <div className="ue">{u.email} · {t.joined} {new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
                <div><span className="rb2" style={RL[u.role]}>{u.role}</span></div>
                <div style={{ fontSize:12,fontWeight:600,color:"var(--bark2)" }}>{u._count?.listings||0} {t.listings}</div>
                <div><span style={{ fontSize:10,fontWeight:700,color:u.isActive?"#2e7d32":"#e53935" }}>{u.isActive?"● "+t.userActive:"○ "+t.userInactive}</span></div>
                <div><button className={`bx ${u.isActive?"bsu":"bri"}`} onClick={() => toggleUser(u.id, u.isActive)}>{u.isActive?t.deactivate:t.activate}</button></div>
              </div>
            ))}
          </div>
        )}

        {/* REPORTS */}
        {tab === "reports" && (
          <div className="tw">
            <div className="tr th2 rpr"><div>Report</div><div>{lang==="sw"?"Sababu":"Reason"}</div><div>Status</div><div>Action</div></div>
            {reports.map(r => (
              <div key={r.id} className="tr rpr">
                <div>
                  <div className="rlt">{r.listing?.title || "Deleted listing"}</div>
                  <div className="rby">{lang==="sw"?"Imeripotiwa na":"By"} {r.reporter?.name} · {new Date(r.createdAt).toLocaleDateString()}</div>
                  {r.detail && <div className="rdt">"{r.detail}"</div>}
                </div>
                <span className="reb">{t.reportReason[r.reason] || r.reason}</span>
                <div><span className={r.status==="OPEN"?"ro":"rre"}>{r.status==="OPEN"?"⚠️ Open":"✓ Done"}</span></div>
                <div>{r.status==="OPEN" && <button className="brs" onClick={() => resolveReport(r.id)}>{t.resolved}</button>}</div>
              </div>
            ))}
            {reports.length === 0 && <div className="es">{t.noItems}</div>}
          </div>
        )}
      </div>
    </>
  );
}
