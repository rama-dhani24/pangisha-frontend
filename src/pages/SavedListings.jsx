// src/pages/SavedListings.jsx
// Note: "saved" listings are stored in localStorage for MVP.
// In v2, replace with a backend SavedListing model.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listingsApi } from "../api/listings.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";

const TYPE_LABELS = { ROOM:"Room", APARTMENT:"Apartment", BUSINESS:"Business space" };
const TYPE_ICONS  = { ROOM:"🚪", APARTMENT:"🏢", BUSINESS:"🏪" };

function fmt(p) { if (p >= 1000000) return (p/1e6).toFixed(1)+"M"; if (p >= 1000) return (p/1000).toFixed(0)+"k"; return p; }

const T = {
  en:{ savedTitle:"Saved Listings",savedSub:"Properties you've bookmarked",noSaved:"You haven't saved any listings yet.",browseNow:"Browse listings →",viewListing:"View",remove:"Remove",whatsapp:"WhatsApp",back:"← Back",perMonth:"/mo",by:"by",lang:"SW 🇹🇿",filterAll:"All",filterRooms:"Rooms",filterBusiness:"Business",available:"Available",notAvailable:"No longer available",sortNew:"Newest",sortPrice:"Lowest price",of:"of",listings:"listings" },
  sw:{ savedTitle:"Zilizohifadhiwa",savedSub:"Mali ulizoweka alama",noSaved:"Bado hujahifadhi tangazo lolote.",browseNow:"Tazama matangazo →",viewListing:"Angalia",remove:"Ondoa",whatsapp:"WhatsApp",back:"← Rudi",perMonth:"/mwezi",by:"na",lang:"EN 🇬🇧",filterAll:"Zote",filterRooms:"Vyumba",filterBusiness:"Biashara",available:"Inapatikana",notAvailable:"Haipatikani tena",sortNew:"Mpya",sortPrice:"Bei ndogo",of:"kati ya",listings:"matangazo" },
};

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
.hb{background:var(--bark);padding:24px 20px 30px;position:relative;overflow:hidden}
.hb::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 80% 50%,rgba(196,98,45,.2) 0%,transparent 60%);pointer-events:none}
.hi{max-width:1000px;margin:0 auto;position:relative}
.pt{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:var(--sand);margin-bottom:4px}
.ps{font-size:12px;color:rgba(245,230,200,.6);margin-bottom:10px}
.sb{display:inline-flex;align-items:center;gap:6px;background:rgba(196,98,45,.2);border:1px solid rgba(196,98,45,.35);color:var(--clay2);border-radius:18px;padding:4px 12px;font-size:11px;font-weight:600}
.mn{max-width:1000px;margin:0 auto;padding:24px 16px 50px}
.tb{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:22px}
.fp{padding:6px 13px;border-radius:18px;border:1.5px solid rgba(61,43,31,.15);background:#fff;color:var(--bark2);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit}
.fp:hover{border-color:var(--clay);color:var(--clay)}
.fp.ac{background:var(--clay);border-color:var(--clay);color:#fff}
.ss2{background:var(--sand2);border:1.5px solid rgba(61,43,31,.1);border-radius:18px;padding:6px 13px;font-size:12px;font-family:'DM Sans',sans-serif;color:var(--bark);outline:none;cursor:pointer;appearance:none;margin-left:auto}
.ct{font-size:12px;color:var(--bark2);opacity:.55;font-weight:500;margin-left:4px}
.gd{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:18px}
.cd{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 9px var(--shadow);transition:transform .2s,box-shadow .2s;border:1.5px solid transparent;display:flex;flex-direction:column}
.cd:hover{transform:translateY(-3px);box-shadow:0 9px 26px var(--shadowM);border-color:rgba(196,98,45,.18)}
.cd.un{opacity:.72}
.ciw{position:relative;height:170px;overflow:hidden;background:var(--sand)}
.ci{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.cd:hover .ci{transform:scale(1.04)}
.no-img{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px}
.uo{position:absolute;inset:0;background:rgba(61,43,31,.5);display:flex;align-items:center;justify-content:center}
.ub{background:rgba(255,255,255,.9);color:var(--bark);padding:5px 13px;border-radius:7px;font-size:11px;font-weight:700}
.sv{position:absolute;top:9px;left:9px;background:rgba(255,255,255,.92);border-radius:7px;padding:2px 8px;font-size:10px;font-weight:600;color:var(--bark2)}
.rb{position:absolute;top:7px;right:7px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px}
.cb2{padding:12px;flex:1;display:flex;flex-direction:column}
.ct2{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--clay);margin-bottom:4px}
.cti{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:var(--bark);line-height:1.3;margin-bottom:4px}
.cl{font-size:11px;color:var(--bark2);opacity:.6;margin-bottom:9px}
.cm{display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.cmi{font-size:11px;color:var(--bark2);font-weight:500}
.cf{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:9px;border-top:1px solid var(--sand)}
.cp{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--bark)}
.cp span{font-size:10px;font-family:'DM Sans',sans-serif;font-weight:400;color:var(--bark2);opacity:.6}
.cby{font-size:10px;color:var(--bark2);opacity:.4;margin-top:2px}
.ca{display:flex;flex-direction:column;gap:5px;align-items:flex-end}
.bv{background:var(--bark);color:var(--sand);border:none;border-radius:7px;padding:6px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit}
.bwa{background:#25D366;color:#fff;border:none;border-radius:7px;padding:6px 11px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px}
.es{text-align:center;padding:60px 20px}
.ei{font-size:44px;margin-bottom:14px}
.et{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--bark);margin-bottom:8px}
.em{font-size:13px;color:var(--bark2);opacity:.6;margin-bottom:18px}
.eb{background:var(--clay);color:#fff;border:none;border-radius:9px;padding:11px 22px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}
.spinner{text-align:center;padding:60px;font-size:13px;color:var(--bark2);opacity:.6}
`;

export default function SavedListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, toggleLang } = useLang();
  const [filter,   setFilter]   = useState("all");
  const [sort,     setSort]     = useState("new");
  const [loading,  setLoading]  = useState(true);
  const [listings, setListings] = useState([]);

  const t = T[lang];

  // Load saved IDs from localStorage, then fetch each listing
  useEffect(() => {
    const savedIds = JSON.parse(localStorage.getItem("pangisha_saved") || "[]");
    if (savedIds.length === 0) { setLoading(false); return; }

    // Fetch all listings and filter to saved ones
    listingsApi.getAll({ limit: 100 })
      .then(res => {
        const all = res.data || [];
        const saved = all.filter(l => savedIds.includes(l.id));
        setListings(saved);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  function remove(id) {
    const saved = JSON.parse(localStorage.getItem("pangisha_saved") || "[]");
    localStorage.setItem("pangisha_saved", JSON.stringify(saved.filter(i => i !== id)));
    setListings(prev => prev.filter(l => l.id !== id));
  }

  const filtered = listings
    .filter(l => filter === "all" || l.type === filter.toUpperCase())
    .sort((a, b) => sort === "price" ? a.priceTzs - b.priceTzs : 0);

  const primaryImg = (l) => l.images?.find(i => i.isPrimary)?.url || l.images?.[0]?.url;

  return (
    <>
      <style>{css}</style>
      <nav className="nav">
        <div className="nlo" onClick={() => navigate("/")}>Pang<span>isha</span></div>
        <div className="nr">
          <button className="lb" onClick={toggleLang}>{t.lang}</button>
          <span className="nb" onClick={() => navigate(-1)}>{t.back}</span>
        </div>
      </nav>

      <div className="hb">
        <div className="hi">
          <div className="pt">{t.savedTitle}</div>
          <div className="ps">{t.savedSub}</div>
          <div className="sb">❤️ {listings.length} {lang === "sw" ? "zilizohifadhiwa" : "saved"}</div>
        </div>
      </div>

      <div className="mn">
        {loading ? (
          <div className="spinner">⏳ {lang === "sw" ? "Inapakia…" : "Loading…"}</div>
        ) : listings.length === 0 ? (
          <div className="es">
            <div className="ei">🤍</div>
            <div className="et">{t.savedTitle}</div>
            <div className="em">{t.noSaved}</div>
            <button className="eb" onClick={() => navigate("/")}>{t.browseNow}</button>
          </div>
        ) : (
          <>
            <div className="tb">
              {[{v:"all",l:t.filterAll},{v:"room",l:t.filterRooms},{v:"business",l:t.filterBusiness}]
                .map(f => <button key={f.v} className={`fp ${filter===f.v?"ac":""}`} onClick={() => setFilter(f.v)}>{f.l}</button>)}
              <select className="ss2" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="new">{t.sortNew}</option>
                <option value="price">{t.sortPrice}</option>
              </select>
              <span className="ct">{filtered.length} {t.of} {listings.length} {t.listings}</span>
            </div>

            <div className="gd">
              {filtered.map(item => (
                <div key={item.id} className={`cd ${item.status !== "ACTIVE" ? "un" : ""}`}>
                  <div className="ciw">
                    {primaryImg(item) ? <img className="ci" src={primaryImg(item)} alt="" /> : <div className="no-img">{TYPE_ICONS[item.type]}</div>}
                    {item.status !== "ACTIVE" && <div className="uo"><div className="ub">⚠️ {t.notAvailable}</div></div>}
                    <div className="sv">❤️ {lang === "sw" ? "Imehifadhiwa" : "Saved"}</div>
                    <button className="rb" onClick={() => remove(item.id)}>✕</button>
                  </div>
                  <div className="cb2">
                    <div className="ct2">{TYPE_ICONS[item.type]} {TYPE_LABELS[item.type]}</div>
                    <div className="cti">{item.title}</div>
                    <div className="cl">📍 {item.street ? `${item.street}, ` : ""}{item.district}</div>
                    <div className="cm">
                      {item.beds && <span className="cmi">🛏 {item.beds} bed</span>}
                      {item.sqm  && <span className="cmi">📐 {item.sqm}m²</span>}
                      <span className="cmi" style={{ color: item.status==="ACTIVE"?"#2e7d32":"#e53935" }}>
                        {item.status === "ACTIVE" ? "✓ "+t.available : "✗ "+t.notAvailable}
                      </span>
                    </div>
                    <div className="cf">
                      <div>
                        <div className="cp">TZS {fmt(item.priceTzs)}<span>{t.perMonth}</span></div>
                        <div className="cby">{t.by} {item.owner?.name}</div>
                      </div>
                      <div className="ca">
                        <button className="bv" onClick={() => navigate(`/listing/${item.id}`)}>{t.viewListing}</button>
                        {item.whatsappContact && item.status === "ACTIVE" && (
                          <button className="bwa" onClick={() => window.open(`https://wa.me/${(item.owner?.phone||"").replace(/\D/g,"")}`)}>💬 {t.whatsapp}</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
