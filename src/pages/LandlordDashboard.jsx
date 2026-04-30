// src/pages/LandlordDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listingsApi } from "../api/listings.js";
import { inquiriesApi } from "../api/inquiries.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";

const T = {
  en: { dashTitle:"My Dashboard",dashSub:"Manage your listings and inquiries",newListing:"+ New listing",activeListings:"Active",totalInquiries:"Inquiries",totalViews:"Views",unread:"Unread",myListingsTab:"My Listings",inquiriesTab:"Inquiries",edit:"Edit",delete:"Delete",markRented:"Mark Rented",markAvailable:"Mark Available",views:"views",rented:"Rented",active:"Active",suspended:"Suspended",pending:"Pending",noListings:"You have no listings yet.",noInquiries:"No inquiries yet.",reply:"Reply via WhatsApp",back:"← Back",lang:"SW 🇹🇿",room:"Room",business:"Business space",apartment:"Apartment",perMonth:"/mo",loading:"Loading…",error:"Failed to load" },
  sw: { dashTitle:"Dashibodi Yangu",dashSub:"Simamia matangazo na maombi yako",newListing:"+ Tangazo Jipya",activeListings:"Hai",totalInquiries:"Maombi",totalViews:"Matalio",unread:"Mapya",myListingsTab:"Matangazo Yangu",inquiriesTab:"Maombi",edit:"Hariri",delete:"Futa",markRented:"Imekodishwa",markAvailable:"Inapatikana",views:"matalio",rented:"Imekodishwa",active:"Hai",suspended:"Imesimamishwa",pending:"Inasubiri",noListings:"Bado huna matangazo.",noInquiries:"Bado hakuna maombi.",reply:"Jibu kwa WhatsApp",back:"← Rudi",lang:"EN 🇬🇧",room:"Chumba",business:"Nafasi ya biashara",apartment:"Fleti",perMonth:"/mwezi",loading:"Inapakia…",error:"Imeshindwa kupakia" },
};

const STATUS_STYLE = { ACTIVE:{bg:"#e8f5e9",color:"#2e7d32"}, RENTED:{bg:"#e3f2fd",color:"#1565c0"}, SUSPENDED:{bg:"#fce4ec",color:"#880e4f"}, PENDING:{bg:"#fff3e0",color:"#e65100"} };
const TYPE_ICON    = { ROOM:"🚪", BUSINESS:"🏪", APARTMENT:"🏢" };

function fmt(p) { if (p >= 1000000) return (p/1e6).toFixed(1)+"M"; if (p >= 1000) return (p/1000).toFixed(0)+"k"; return p; }

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--clay:#C4622D;--clay2:#E07B45;--sand:#F5E6C8;--sand2:#FAF3E4;--bark:#3D2B1F;--bark2:#5C3D2E;--cream:#FFFBF4;--shadow:rgba(61,43,31,.10);--shadowM:rgba(61,43,31,.16)}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--bark)}
.nav{background:var(--bark);display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:52px;box-shadow:0 2px 10px var(--shadowM)}
.nlo{font-family:'Playfair Display',serif;font-size:21px;font-weight:900;color:var(--sand);cursor:pointer}
.nlo span{color:var(--clay2)}
.nr{display:flex;align-items:center;gap:10px}
.nb{color:var(--sand);opacity:.75;font-size:13px;cursor:pointer}
.lb{background:rgba(245,230,200,.12);color:var(--sand);border:1px solid rgba(245,230,200,.2);border-radius:7px;padding:4px 11px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}
.hb{background:var(--bark);padding:24px 20px 28px;position:relative;overflow:hidden}
.hb::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 80% 50%,rgba(196,98,45,.2) 0%,transparent 60%);pointer-events:none}
.hi{max-width:1000px;margin:0 auto;position:relative;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px}
.pt{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:var(--sand)}
.ps{font-size:12px;color:rgba(245,230,200,.6);margin-top:3px}
.nb2{background:var(--clay);color:#fff;border:none;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}
.sr{background:var(--sand);display:flex;border-bottom:1px solid rgba(61,43,31,.08)}
.st{flex:1;text-align:center;padding:12px 6px;border-right:1px solid rgba(61,43,31,.08)}
.st:last-child{border-right:none}
.sn{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--clay)}
.sl{font-size:10px;color:var(--bark2);opacity:.6;font-weight:500;margin-top:2px}
.mn{max-width:1000px;margin:0 auto;padding:22px 16px 50px}
.tabs{display:flex;background:var(--sand2);border-radius:11px;padding:3px;margin-bottom:20px;max-width:300px}
.tab{flex:1;padding:8px 14px;border-radius:8px;border:none;background:none;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--bark2)}
.tab.on{background:#fff;color:var(--bark);box-shadow:0 1px 5px var(--shadow)}
.ll{display:flex;flex-direction:column;gap:12px}
.lr{background:#fff;border-radius:12px;padding:14px;display:flex;gap:14px;align-items:center;box-shadow:0 1px 7px var(--shadow);border:1.5px solid transparent;transition:border-color .2s}
.lr:hover{border-color:rgba(196,98,45,.18)}
.li{width:72px;height:62px;border-radius:9px;object-fit:cover;flex-shrink:0;background:var(--sand)}
.li-ph{width:72px;height:62px;border-radius:9px;background:var(--sand);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.lb2{flex:1;min-width:0}
.lt{display:flex;align-items:center;gap:7px;margin-bottom:4px;flex-wrap:wrap}
.lty{font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--clay)}
.ls2{padding:2px 8px;border-radius:7px;font-size:10px;font-weight:700}
.lti{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:var(--bark);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lm{display:flex;gap:12px;font-size:11px;color:var(--bark2);opacity:.6;flex-wrap:wrap}
.la2{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0}
.lp2{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--bark)}
.lp2 span{font-size:10px;font-family:'DM Sans',sans-serif;font-weight:400;opacity:.6}
.bts{display:flex;gap:6px}
.bs{padding:5px 10px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;border:1.5px solid rgba(61,43,31,.12);background:#fff;color:var(--bark2);transition:all .15s;white-space:nowrap}
.bs:hover{border-color:var(--clay);color:var(--clay)}
.bsp{background:var(--clay);color:#fff;border-color:var(--clay)}
.bsp:hover{background:var(--clay2)}
.bsd:hover{border-color:#e53935;color:#e53935}
.il{display:flex;flex-direction:column;gap:10px}
.ic{background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 7px var(--shadow);border:1.5px solid transparent;cursor:pointer}
.ic:hover{border-color:rgba(196,98,45,.18)}
.ic.un{border-left:3px solid var(--clay)}
.ud{width:7px;height:7px;background:var(--clay);border-radius:50%;display:inline-block;margin-right:4px}
.ih{display:flex;align-items:center;gap:9px;margin-bottom:9px}
.ia{width:36px;height:36px;border-radius:50%;background:var(--clay);display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Playfair Display',serif;font-size:15px;font-weight:700;flex-shrink:0}
.in2{font-weight:600;font-size:13px;color:var(--bark)}
.iln{font-size:11px;color:var(--bark2);opacity:.55;margin-top:2px}
.it{margin-left:auto;font-size:11px;color:var(--bark2);opacity:.4;white-space:nowrap}
.im{font-size:12px;color:var(--bark2);line-height:1.55;margin-bottom:10px;padding:9px 12px;background:var(--sand2);border-radius:8px}
.ifo{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:7px}
.ip{font-size:11px;font-weight:600;color:var(--bark2)}
.bwa{background:#25D366;color:#fff;border:none;border-radius:7px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit}
.es{text-align:center;padding:50px 20px;color:var(--bark2);opacity:.45;font-size:13px}
.spinner{text-align:center;padding:40px;font-size:13px;color:var(--bark2);opacity:.6}
.err-b{background:#fff0ed;border:1px solid rgba(196,98,45,.3);color:var(--clay);border-radius:9px;padding:10px 14px;font-size:13px;margin-bottom:16px}
`;

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, toggleLang } = useLang();
  const [tab,        setTab]        = useState("listings");
  const [listings,   setListings]   = useState([]);
  const [inquiries,  setInquiries]  = useState([]);
  const [loadingL,   setLoadingL]   = useState(true);
  const [loadingI,   setLoadingI]   = useState(true);
  const [error,      setError]      = useState(null);

  const t = T[lang];

  useEffect(() => {
    listingsApi.getMine()
      .then(res => setListings(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoadingL(false));
    inquiriesApi.getReceived()
      .then(res => setInquiries(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingI(false));
  }, []);

  async function toggleStatus(id, currentStatus) {
    const next = currentStatus === "ACTIVE" ? "RENTED" : "ACTIVE";
    try {
      await listingsApi.setStatus(id, next);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: next } : l));
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await listingsApi.remove(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) { alert(err.message); }
  }

  async function markRead(id) {
    try {
      await inquiriesApi.markRead(id);
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: "READ" } : i));
    } catch {}
  }

  const activeCount = listings.filter(l => l.status === "ACTIVE").length;
  const totalViews  = listings.reduce((a, l) => a + (l.viewCount || 0), 0);
  const unread      = inquiries.filter(i => i.status === "UNREAD").length;
  const primaryImg  = (l) => l.images?.find(i => i.isPrimary)?.url || l.images?.[0]?.url;

  return (
    <>
      <style>{css}</style>
      <nav className="nav">
        <div className="nlo" onClick={() => navigate("/")}>Pang<span>isha</span></div>
        <div className="nr">
          <button className="lb" onClick={toggleLang}>{t.lang}</button>
          <span className="nb" onClick={() => navigate("/")}>{t.back}</span>
        </div>
      </nav>

      <div className="hb">
        <div className="hi">
          <div>
            <div className="pt">{t.dashTitle}</div>
            <div className="ps">{t.dashSub} — {user?.name}</div>
          </div>
          <button className="nb2" onClick={() => navigate("/post")}>{t.newListing}</button>
        </div>
      </div>

      <div className="sr">
        {[{ n: activeCount, l: t.activeListings }, { n: inquiries.length, l: t.totalInquiries }, { n: totalViews, l: t.totalViews }, { n: unread, l: t.unread }]
          .map(s => <div key={s.l} className="st"><div className="sn">{s.n}</div><div className="sl">{s.l}</div></div>)}
      </div>

      <div className="mn">
        <div className="tabs">
          <button className={`tab ${tab === "listings" ? "on" : ""}`} onClick={() => setTab("listings")}>{t.myListingsTab}</button>
          <button className={`tab ${tab === "inquiries" ? "on" : ""}`} onClick={() => setTab("inquiries")}>{t.inquiriesTab}{unread > 0 ? ` (${unread})` : ""}</button>
        </div>

        {error && <div className="err-b">⚠️ {error}</div>}

        {tab === "listings" && (
          loadingL ? <div className="spinner">⏳ {t.loading}</div>
          : listings.length === 0 ? <div className="es">{t.noListings}</div>
          : <div className="ll">
            {listings.map(l => (
              <div key={l.id} className="lr">
                {primaryImg(l) ? <img className="li" src={primaryImg(l)} alt="" /> : <div className="li-ph">{TYPE_ICON[l.type]}</div>}
                <div className="lb2">
                  <div className="lt">
                    <span className="lty">{TYPE_ICON[l.type]} {t[l.type.toLowerCase()] || l.type}</span>
                    <span className="ls2" style={{ background: STATUS_STYLE[l.status]?.bg, color: STATUS_STYLE[l.status]?.color }}>{t[l.status.toLowerCase()] || l.status}</span>
                  </div>
                  <div className="lti">{l.title}</div>
                  <div className="lm">
                    <span>📍 {l.district}</span>
                    <span>👁 {l.viewCount || 0} {t.views}</span>
                    <span>💬 {l._count?.inquiries || 0}</span>
                  </div>
                </div>
                <div className="la2">
                  <div className="lp2">TZS {fmt(l.priceTzs)}<span>{t.perMonth}</span></div>
                  <div className="bts">
                    <button className="bs" onClick={() => navigate(`/listing/${l.id}`)}>{t.edit}</button>
                    <button className="bs bsp" onClick={() => toggleStatus(l.id, l.status)}>{l.status === "ACTIVE" ? t.markRented : t.markAvailable}</button>
                    <button className="bs bsd" onClick={() => handleDelete(l.id)}>{t.delete}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "inquiries" && (
          loadingI ? <div className="spinner">⏳ {t.loading}</div>
          : inquiries.length === 0 ? <div className="es">{t.noInquiries}</div>
          : <div className="il">
            {inquiries.map(i => (
              <div key={i.id} className={`ic ${i.status === "UNREAD" ? "un" : ""}`} onClick={() => markRead(i.id)}>
                <div className="ih">
                  {i.status === "UNREAD" && <span className="ud" />}
                  <div className="ia">{i.tenant?.name?.[0]}</div>
                  <div>
                    <div className="in2">{i.tenant?.name}</div>
                    <div className="iln">→ {i.listing?.title}</div>
                  </div>
                  <div className="it">{new Date(i.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="im">"{i.message}"</div>
                <div className="ifo">
                  <span className="ip">📞 {i.tenant?.phone || i.phone || "—"}</span>
                  <button className="bwa" onClick={() => window.open(`https://wa.me/${(i.tenant?.phone || i.phone || "").replace(/\D/g, "")}`)}> 💬 {t.reply}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
