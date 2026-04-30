// src/pages/PangishaHome.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listingsApi } from "../api/listings.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";

const DISTRICTS   = ["All Districts","Kinondoni","Ilala","Temeke","Ubungo","Kigamboni"];
const TYPES       = ["Any Type","ROOM","BUSINESS","APARTMENT"];
const PRICE_RANGES = [
  { label: "Any Price",              min: undefined, max: undefined },
  { label: "30k – 60k (Rooms)",      min: 30000,     max: 60000     },
  { label: "60k – 120k (Rooms)",     min: 60000,     max: 120000    },
  { label: "70k – 200k (Business)",  min: 70000,     max: 200000    },
  { label: "200k – 500k (Business)", min: 200000,    max: 500000    },
];
const TYPE_LABELS = { ROOM: "Room", APARTMENT: "Apartment", BUSINESS: "Business space" };
const TYPE_ICONS  = { ROOM: "🚪", APARTMENT: "🏢", BUSINESS: "🏪" };

function fmt(p) {
  if (p >= 1000000) return (p / 1000000).toFixed(1) + "M";
  if (p >= 1000)    return (p / 1000).toFixed(0) + "k";
  return p;
}

const T = {
  en: { search:"Search", district:"District", type:"Type", budget:"Budget (TZS/mo)",
        latest:"Latest listings", inDar:"in Dar es Salaam", properties:"properties",
        room:"Room", business:"Business space", apartment:"Apartment",
        whatsapp:"WhatsApp", contact:"Contact", perMonth:"/mo", by:"by",
        noResults:"No listings found. Try adjusting your filters.",
        heroTitle:"Find your", heroEm:"affordable", heroEnd:"home in Dar",
        heroPara:"Rooms and business spaces from TZS 30,000/mo. No agent fees.",
        listProperty:"+ List Property", browse:"Browse", forLandlords:"For Landlords",
        lang:"SW 🇹🇿", allDistricts:"All Districts", anyType:"Any Type",
        ctaTitle:"Own a property in Dar?", ctaPara:"List your room or space free. Reach thousands of tenants.",
        ctaBtn:"+ List your property — it's free" },
  sw: { search:"Tafuta", district:"Wilaya", type:"Aina", budget:"Bajeti (TZS/mwezi)",
        latest:"Matangazo mapya", inDar:"Dar es Salaam", properties:"mali",
        room:"Chumba", business:"Nafasi ya biashara", apartment:"Fleti",
        whatsapp:"WhatsApp", contact:"Wasiliana", perMonth:"/mwezi", by:"na",
        noResults:"Hakuna matangazo. Jaribu kubadilisha vichujio.",
        heroTitle:"Tafuta", heroEm:"nyumba nafuu", heroEnd:"Dar es Salaam",
        heroPara:"Vyumba na nafasi za biashara kuanzia TZS 30,000/mwezi. Bila ada ya wakala.",
        listProperty:"+ Weka Nyumba", browse:"Tazama", forLandlords:"Kwa Wamiliki",
        lang:"EN 🇬🇧", allDistricts:"Wilaya Zote", anyType:"Aina Yoyote",
        ctaTitle:"Una nyumba Dar?", ctaPara:"Weka tangazo lako bure. Wafikia wapangaji elfu.",
        ctaBtn:"+ Weka nyumba yako — ni bure" },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--clay:#C4622D;--clay2:#E07B45;--sand:#F5E6C8;--sand2:#FAF3E4;--bark:#3D2B1F;--bark2:#5C3D2E;--cream:#FFFBF4;--shadow:rgba(61,43,31,.10);--shadowM:rgba(61,43,31,.18)}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--bark)}
.nav{position:sticky;top:0;z-index:100;background:var(--bark);display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:56px;box-shadow:0 2px 12px var(--shadowM)}
.nav-logo{font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:var(--sand);cursor:pointer}
.nav-logo span{color:var(--clay2)}
.nav-right{display:flex;align-items:center;gap:12px}
.nav-link{color:var(--sand);opacity:.75;font-size:13px;font-weight:500;cursor:pointer;transition:opacity .2s}
.nav-link:hover{opacity:1}
.nav-btn{background:var(--clay);color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .2s}
.nav-btn:hover{background:var(--clay2)}
.lang-btn{background:rgba(245,230,200,.12);color:var(--sand);border:1px solid rgba(245,230,200,.2);border-radius:8px;padding:5px 11px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}
.hero{background:var(--bark);padding:44px 24px 52px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,rgba(196,98,45,.25) 0%,transparent 65%);pointer-events:none}
.hero-pattern{position:absolute;top:0;right:0;bottom:0;width:40%;opacity:.06;background-image:repeating-linear-gradient(45deg,var(--sand) 0,var(--sand) 1px,transparent 0,transparent 50%);background-size:18px 18px;pointer-events:none}
.hero-inner{max-width:620px;position:relative}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(196,98,45,.2);border:1px solid rgba(196,98,45,.35);color:var(--clay2);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;margin-bottom:18px}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(28px,5vw,46px);font-weight:900;color:var(--sand);line-height:1.1;margin-bottom:12px}
.hero h1 em{color:var(--clay2);font-style:normal}
.hero p{color:rgba(245,230,200,.7);font-size:15px;line-height:1.6;margin-bottom:28px;max-width:460px}
.search-bar{background:var(--cream);border-radius:14px;padding:14px;display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.25)}
@media(max-width:640px){.search-bar{grid-template-columns:1fr}}
.sf{display:flex;flex-direction:column;gap:3px;padding:0 8px}
.sl{font-size:9px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--bark2);opacity:.6}
.search-bar select{background:none;border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:var(--bark);cursor:pointer;appearance:none;padding:2px 0;width:100%}
.search-btn{background:var(--clay);color:#fff;border:none;border-radius:10px;padding:0 20px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;transition:background .2s,transform .1s;white-space:nowrap}
.search-btn:hover{background:var(--clay2);transform:translateY(-1px)}
.stats-bar{background:var(--sand);display:flex;border-bottom:1px solid rgba(61,43,31,.08)}
.stat{flex:1;text-align:center;padding:12px 8px;border-right:1px solid rgba(61,43,31,.08)}
.stat:last-child{border-right:none}
.stat-num{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--clay)}
.stat-lbl{font-size:10px;color:var(--bark2);opacity:.6;font-weight:500;margin-top:2px}
.main{max-width:1100px;margin:0 auto;padding:28px 20px 60px}
.section-header{display:flex;align-items:baseline;gap:10px;margin-bottom:20px}
.section-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:var(--bark)}
.section-sub{font-size:13px;color:var(--bark2);opacity:.55}
.filter-strip{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:22px}
.fp{padding:6px 13px;border-radius:18px;border:1.5px solid rgba(61,43,31,.15);background:#fff;color:var(--bark2);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit}
.fp:hover{border-color:var(--clay);color:var(--clay)}
.fp.active{background:var(--clay);border-color:var(--clay);color:#fff}
.results-count{margin-left:auto;font-size:12px;color:var(--bark2);opacity:.6;font-weight:500}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.card{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px var(--shadow);transition:transform .2s,box-shadow .2s;cursor:pointer;display:flex;flex-direction:column;border:1.5px solid transparent}
.card:hover{transform:translateY(-4px);box-shadow:0 12px 30px var(--shadowM);border-color:rgba(196,98,45,.2)}
.ciw{position:relative;height:185px;overflow:hidden;background:var(--sand)}
.ci{width:100%;height:100%;object-fit:cover;transition:transform .35s}
.card:hover .ci{transform:scale(1.04)}
.no-img{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;background:var(--sand)}
.csave{position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:transform .15s}
.csave:hover{transform:scale(1.1)}
.cb{padding:12px;flex:1;display:flex;flex-direction:column}
.ctype{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--clay);margin-bottom:4px}
.ctitle{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--bark);line-height:1.3;margin-bottom:4px}
.cloc{font-size:12px;color:var(--bark2);opacity:.6;margin-bottom:9px}
.cmeta{display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.cmi{font-size:11px;color:var(--bark2);font-weight:500}
.cf{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:9px;border-top:1px solid var(--sand)}
.cprice{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--bark)}
.cprice span{font-size:10px;font-family:'DM Sans',sans-serif;font-weight:400;color:var(--bark2);opacity:.6}
.cby{font-size:10px;color:var(--bark2);opacity:.45;margin-top:2px}
.bwa{background:#25D366;color:#fff;border:none;border-radius:7px;padding:6px 11px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px}
.bct{background:var(--sand);color:var(--bark);border:none;border-radius:7px;padding:6px 11px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit}
.empty{text-align:center;padding:60px 20px;color:var(--bark2);opacity:.5}
.spinner{display:flex;justify-content:center;padding:60px;color:var(--clay);font-size:14px}
.footer-cta{background:var(--bark);color:var(--sand);border-radius:18px;padding:44px 36px;text-align:center;margin-top:48px}
.footer-cta h2{font-family:'Playfair Display',serif;font-size:26px;margin-bottom:10px}
.footer-cta p{opacity:.65;font-size:14px;margin-bottom:22px}
.fcbtn{background:var(--clay);color:#fff;border:none;border-radius:10px;padding:12px 28px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit}
.fcbtn:hover{background:var(--clay2)}
.err-banner{background:#fff0ed;border:1px solid rgba(196,98,45,.3);color:var(--clay);border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;font-weight:500}
`;

export default function PangishaHome() {
  const navigate = useNavigate();
  const { user, logout, isLandlord } = useAuth();

  const { lang, toggleLang } = useLang();
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [saved,    setSaved]    = useState(new Set());
  const [total,    setTotal]    = useState(0);

  // Search bar state
  const [sDistrict, setSDistrict] = useState("All Districts");
  const [sType,     setSType]     = useState("Any Type");
  const [sPrice,    setSPrice]    = useState(0);

  // Active filters
  const [district, setDistrict] = useState("All Districts");
  const [type,     setType]     = useState("Any Type");
  const [priceIdx, setPriceIdx] = useState(0);

  const t = T[lang];

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (district && district !== "All Districts") params.district = district;
      if (type     && type     !== "Any Type")      params.type     = type;
      const range = PRICE_RANGES[priceIdx];
      if (range.min) params.minPrice = range.min;
      if (range.max) params.maxPrice = range.max;
      params.sort  = "newest";
      params.limit = 12;

      const res = await listingsApi.getAll(params);
      setListings(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [district, type, priceIdx]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  function doSearch() {
    setDistrict(sDistrict);
    setType(sType);
    setPriceIdx(sPrice);
  }

  function toggleSave(id, e) {
    e.stopPropagation();
    setSaved(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const primaryImage = (listing) =>
    listing.images?.find(i => i.isPrimary)?.url || listing.images?.[0]?.url;

  return (
    <>
      <style>{css}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => navigate("/")}>Pang<span>isha</span></div>
        <div className="nav-right">
          <button className="lang-btn" onClick={toggleLang}>{t.lang}</button>
          {user ? (
            <>
              {isLandlord && <span className="nav-link" onClick={() => navigate("/dashboard")}>{t.forLandlords}</span>}
              <span className="nav-link" onClick={() => navigate("/saved")}>{lang === "sw" ? "Zilizohifadhiwa" : "Saved"}</span>
              <span className="nav-link" onClick={logout}>{lang === "sw" ? "Toka" : "Logout"}</span>
              {isLandlord && <button className="nav-btn" onClick={() => navigate("/post")}>{t.listProperty}</button>}
            </>
          ) : (
            <>
              <span className="nav-link" onClick={() => navigate("/auth")}>{lang === "sw" ? "Ingia" : "Sign in"}</span>
              <button className="nav-btn" onClick={() => navigate("/post")}>{t.listProperty}</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-pattern" />
        <div className="hero-inner">
          <div className="hero-badge">Dar es Salaam · Tanzania</div>
          <h1>{t.heroTitle} <em>{t.heroEm}</em> {t.heroEnd}</h1>
          <p>{t.heroPara}</p>
          <div className="search-bar">
            <div className="sf">
              <div className="sl">{t.district}</div>
              <select value={sDistrict} onChange={e => setSDistrict(e.target.value)}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="sf">
              <div className="sl">{t.type}</div>
              <select value={sType} onChange={e => setSType(e.target.value)}>
                {TYPES.map(tp => <option key={tp} value={tp}>{tp === "Any Type" ? t.anyType : TYPE_LABELS[tp]}</option>)}
              </select>
            </div>
            <div className="sf">
              <div className="sl">{t.budget}</div>
              <select value={sPrice} onChange={e => setSPrice(Number(e.target.value))}>
                {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
              </select>
            </div>
            <button className="search-btn" onClick={doSearch}>🔍 {t.search}</button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        {[
          { num: total || "—",       lbl: lang === "sw" ? "Matangazo hai" : "Active listings" },
          { num: "5",                lbl: lang === "sw" ? "Wilaya" : "Districts" },
          { num: "WhatsApp",         lbl: lang === "sw" ? "Mawasiliano" : "Direct contact" },
          { num: lang==="sw"?"Bure":"Free", lbl: lang === "sw" ? "Bila ada" : "No hidden fees" },
        ].map(s => (
          <div key={s.lbl} className="stat">
            <div className="stat-num">{s.num}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <main className="main">
        <div className="section-header">
          <div className="section-title">{t.latest}</div>
          <div className="section-sub">{t.inDar}</div>
        </div>

        {/* FILTER PILLS */}
        <div className="filter-strip">
          {["Any Type","ROOM","BUSINESS"].map(tp => (
            <button key={tp} className={`fp ${type === tp ? "active" : ""}`} onClick={() => setType(tp)}>
              {tp === "Any Type" ? (lang === "sw" ? "Zote" : "All") : TYPE_LABELS[tp]}
            </button>
          ))}
          {DISTRICTS.slice(0, 4).map(d => (
            <button key={d} className={`fp ${district === d ? "active" : ""}`} onClick={() => setDistrict(d)}>
              {d === "All Districts" ? (lang === "sw" ? "Zote" : "All") : d}
            </button>
          ))}
          <span className="results-count">{listings.length} {t.properties}</span>
        </div>

        {error && <div className="err-banner">⚠️ {error}</div>}

        {loading ? (
          <div className="spinner">⏳ {lang === "sw" ? "Inapakia..." : "Loading listings..."}</div>
        ) : listings.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            <div>{t.noResults}</div>
          </div>
        ) : (
          <div className="grid">
            {listings.map(l => (
              <div key={l.id} className="card" onClick={() => navigate(`/listing/${l.id}`)}>
                <div className="ciw">
                  {primaryImage(l)
                    ? <img className="ci" src={primaryImage(l)} alt={l.title} />
                    : <div className="no-img">{TYPE_ICONS[l.type] || "🏠"}</div>
                  }
                  <button className={`csave ${saved.has(l.id) ? "saved" : ""}`} onClick={e => toggleSave(l.id, e)}>
                    {saved.has(l.id) ? "❤️" : "🤍"}
                  </button>
                </div>
                <div className="cb">
                  <div className="ctype">{TYPE_LABELS[l.type] || l.type}</div>
                  <div className="ctitle">{l.title}</div>
                  <div className="cloc">📍 {l.street ? `${l.street}, ` : ""}{l.district}</div>
                  <div className="cmeta">
                    {l.beds && <span className="cmi">🛏 {l.beds} bed{l.beds > 1 ? "s" : ""}</span>}
                    {l.sqm  && <span className="cmi">📐 {l.sqm}m²</span>}
                    {l.amenities?.length > 0 && <span className="cmi">✓ {l.amenities[0].name}</span>}
                  </div>
                  <div className="cf">
                    <div>
                      <div className="cprice">TZS {fmt(l.priceTzs)}<span>{t.perMonth}</span></div>
                      <div className="cby">{t.by} {l.owner?.name}</div>
                    </div>
                    {l.whatsappContact
                      ? <button className="bwa" onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${l.owner?.phone?.replace(/\D/g,"")}`) }}>💬 {t.whatsapp}</button>
                      : <button className="bct" onClick={e => { e.stopPropagation(); navigate(`/listing/${l.id}`) }}>{t.contact}</button>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER CTA */}
        <div className="footer-cta">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaPara}</p>
          <button className="fcbtn" onClick={() => navigate(user ? "/post" : "/auth")}>{t.ctaBtn}</button>
        </div>
      </main>
    </>
  );
}
