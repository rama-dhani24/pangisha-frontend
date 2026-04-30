// src/pages/ListingDetail.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listingsApi } from "../api/listings.js";
import { inquiriesApi } from "../api/inquiries.js";
import { useFetch } from "../utils/useFetch.js";
import { useAuth } from "../context/AuthContext.jsx";

function fmt(p) { if (p >= 1000000) return (p/1e6).toFixed(1)+"M"; if (p >= 1000) return (p/1000).toFixed(0)+"k"; return p; }

const TYPE_LABELS = { ROOM:"Room", APARTMENT:"Apartment", BUSINESS:"Business space" };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--clay:#C4622D;--clay2:#E07B45;--sand:#F5E6C8;--sand2:#FAF3E4;--bark:#3D2B1F;--bark2:#5C3D2E;--cream:#FFFBF4;--shadow:rgba(61,43,31,.10);--shadowM:rgba(61,43,31,.18)}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--bark)}
.nav{background:var(--bark);display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:52px;box-shadow:0 2px 10px var(--shadowM)}
.nlo{font-family:'Playfair Display',serif;font-size:21px;font-weight:900;color:var(--sand);cursor:pointer}
.nlo span{color:var(--clay2)}
.nb{color:var(--sand);opacity:.75;font-size:13px;font-weight:500;cursor:pointer}
.gallery{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:260px 170px;gap:5px;overflow:hidden;max-height:436px}
.gm{grid-row:1/3;overflow:hidden;position:relative;cursor:pointer;background:var(--sand)}
.gm img{width:100%;height:100%;object-fit:cover}
.gt{overflow:hidden;position:relative;cursor:pointer;background:var(--sand)}
.gt img{width:100%;height:100%;object-fit:cover}
.gt.more::after{content:attr(data-more);position:absolute;inset:0;background:rgba(61,43,31,.55);display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:700;font-family:'Playfair Display',serif}
.gtag{position:absolute;top:10px;left:10px;background:#e8f5e9;color:#2e7d32;padding:3px 9px;border-radius:8px;font-size:10px;font-weight:700}
.no-img{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:56px}
.content{max-width:1060px;margin:0 auto;padding:28px 20px 60px;display:grid;grid-template-columns:1fr 310px;gap:28px;align-items:start}
@media(max-width:800px){.content{grid-template-columns:1fr}}
.bc{font-size:11px;color:var(--bark2);opacity:.55;margin-bottom:12px;cursor:pointer}
.ltype{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--clay);margin-bottom:6px}
.ltitle{font-family:'Playfair Display',serif;font-size:clamp(20px,3.5vw,30px);font-weight:900;color:var(--bark);line-height:1.15;margin-bottom:8px}
.lloc{font-size:13px;color:var(--bark2);opacity:.65;margin-bottom:16px}
.mrow{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px;padding-bottom:20px;border-bottom:1px solid var(--sand)}
.mc{display:flex;flex-direction:column;align-items:center;padding:10px 14px;background:#fff;border-radius:10px;border:1.5px solid rgba(61,43,31,.08);min-width:66px;box-shadow:0 1px 5px var(--shadow)}
.mcv{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--bark)}
.mcl{font-size:9px;color:var(--bark2);opacity:.5;font-weight:500;margin-top:2px;text-transform:uppercase;letter-spacing:.4px}
.st{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--bark);margin-bottom:12px;margin-top:24px}
.desc{font-size:14px;line-height:1.75;color:var(--bark2);margin-bottom:4px;white-space:pre-line}
.ag{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-bottom:4px}
.am{display:flex;align-items:center;gap:7px;padding:9px 12px;background:#fff;border-radius:9px;font-size:12px;font-weight:500;color:var(--bark2);border:1.5px solid rgba(61,43,31,.07)}
.am::before{content:'✓';color:var(--clay);font-weight:700;font-size:11px}
.mp{height:140px;background:var(--sand);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;margin-bottom:4px;border:2px dashed rgba(61,43,31,.12)}
.mp p{font-size:12px;color:var(--bark2);opacity:.55}
.ifm{background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 10px var(--shadow);border:1.5px solid rgba(61,43,31,.07);margin-top:8px}
.fg{margin-bottom:13px}
.fl{font-size:10px;font-weight:700;color:var(--bark2);margin-bottom:5px;display:block;text-transform:uppercase;letter-spacing:.5px;opacity:.65}
.fi,.fta{width:100%;background:var(--sand2);border:1.5px solid rgba(61,43,31,.1);border-radius:9px;padding:10px 13px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--bark);outline:none;transition:border-color .2s}
.fi:focus,.fta:focus{border-color:var(--clay)}
.fta{resize:vertical;min-height:80px}
.fsub{width:100%;background:var(--bark);color:var(--sand);border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:4px}
.fsub:hover{background:var(--bark2)}
.fsub:disabled{opacity:.6;cursor:not-allowed}
.fsucc{background:#e8f5e9;color:#2e7d32;border-radius:9px;padding:13px;text-align:center;font-size:13px;font-weight:600}
.ferr{background:#fff0ed;color:var(--clay);border-radius:9px;padding:10px;font-size:12px;margin-bottom:10px}
.sb{position:sticky;top:16px}
.pc{background:#fff;border-radius:16px;padding:22px;box-shadow:0 4px 22px var(--shadowM);border:1.5px solid rgba(61,43,31,.08);margin-bottom:16px}
.pm{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:var(--bark);margin-bottom:3px}
.pm span{font-size:14px;font-family:'DM Sans',sans-serif;font-weight:400;color:var(--bark2);opacity:.6}
.ps2{font-size:12px;color:var(--bark2);opacity:.55;margin-bottom:14px}
.avb{display:inline-flex;align-items:center;gap:5px;background:#e8f5e9;color:#2e7d32;border-radius:7px;padding:5px 11px;font-size:11px;font-weight:600;margin-bottom:16px}
.bwa{width:100%;background:#25D366;color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:9px}
.bc2{width:100%;background:var(--clay);color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:9px}
.bc2:hover{background:var(--clay2)}
.bs2{width:100%;background:var(--sand);color:var(--bark);border:1.5px solid rgba(61,43,31,.1);border-radius:10px;padding:11px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.lc{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 10px var(--shadow);border:1.5px solid rgba(61,43,31,.08)}
.lh{display:flex;align-items:center;gap:10px;margin-bottom:13px;padding-bottom:13px;border-bottom:1px solid var(--sand)}
.la{width:44px;height:44px;border-radius:50%;background:var(--clay);display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Playfair Display',serif;font-size:18px;font-weight:700;flex-shrink:0}
.ln2{font-weight:600;font-size:14px;color:var(--bark);margin-bottom:3px}
.vb{display:inline-flex;align-items:center;gap:3px;background:#e8f5e9;color:#2e7d32;border-radius:5px;padding:2px 7px;font-size:10px;font-weight:700}
.ls2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lsi{text-align:center;padding:9px;background:var(--sand2);border-radius:9px}
.lsv{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--bark)}
.lsl2{font-size:9px;color:var(--bark2);opacity:.55;margin-top:2px}
.spinner{text-align:center;padding:80px;font-size:14px;color:var(--bark2);opacity:.6}
.err-pg{text-align:center;padding:80px 20px;color:var(--clay)}
`;

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: listing, loading, error } = useFetch(() => listingsApi.getOne(id), [id]);

  const [activeImg, setActiveImg] = useState(0);
  const [saved,     setSaved]     = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [inq,       setInq]       = useState({ name: user?.name || "", phone: user?.phone || "", message: "Hi, I'm interested in this property. Is it still available?" });
  const [sent,      setSent]      = useState(false);
  const [sending,   setSending]   = useState(false);
  const [inqErr,    setInqErr]    = useState("");

  async function submitInquiry(e) {
    e.preventDefault();
    if (!user) { navigate("/auth", { state: { from: `/listing/${id}` } }); return; }
    setSending(true); setInqErr("");
    try {
      await inquiriesApi.send({ listingId: id, message: inq.message, phone: inq.phone });
      setSent(true);
    } catch (err) {
      setInqErr(err.message || "Failed to send inquiry.");
    } finally { setSending(false); }
  }

  if (loading) return <><style>{css}</style><div className="spinner">⏳ Loading listing…</div></>;
  if (error || !listing) return <><style>{css}</style><div className="err-pg"><h2>Listing not found</h2><button onClick={() => navigate("/")} style={{ marginTop:16, padding:"10px 20px", background:"var(--clay)", color:"#fff", border:"none", borderRadius:8, cursor:"pointer" }}>← Back home</button></div></>;

  const images = listing.images || [];
  const currentImg = images[activeImg]?.url;

  return (
    <>
      <style>{css}</style>
      <nav className="nav">
        <div className="nlo" onClick={() => navigate("/")}>Pang<span>isha</span></div>
        <div className="nb" onClick={() => navigate(-1)}>← Back to listings</div>
      </nav>

      {/* GALLERY */}
      <div className="gallery">
        <div className="gm" onClick={() => setActiveImg(0)}>
          {currentImg ? <img src={currentImg} alt={listing.title} /> : <div className="no-img">🏠</div>}
          <span className="gtag">{listing.status}</span>
        </div>
        {images.slice(1, 3).map((img, i) => (
          <div key={i} className={`gt ${i === 1 && images.length > 3 ? "more" : ""}`}
            data-more={i === 1 && images.length > 3 ? `+${images.length - 2}` : ""}
            onClick={() => setActiveImg(i + 1)}>
            <img src={img.url} alt="" />
          </div>
        ))}
        {images.length < 2 && <div className="gt"><div className="no-img">📷</div></div>}
        {images.length < 3 && <div className="gt"><div className="no-img">📷</div></div>}
      </div>

      <div className="content">
        {/* LEFT */}
        <div>
          <div className="bc" onClick={() => navigate("/")}>Home › {listing.district} › {TYPE_LABELS[listing.type] || listing.type}</div>
          <div className="ltype">{TYPE_LABELS[listing.type] || listing.type}</div>
          <h1 className="ltitle">{listing.title}</h1>
          <div className="lloc">📍 {listing.street ? `${listing.street}, ` : ""}{listing.district}, Dar es Salaam</div>

          <div className="mrow">
            {[
              listing.beds  && { v: listing.beds,          l: "Bedrooms"  },
              listing.baths && { v: listing.baths,         l: "Bathrooms" },
              listing.sqm   && { v: listing.sqm + "m²",    l: "Area"      },
              listing.floor && { v: "Floor " + listing.floor, l: "Level"  },
              { v: listing.furnished ? "Yes" : "No",       l: "Furnished" },
              { v: listing.parking   ? "Yes" : "No",       l: "Parking"   },
            ].filter(Boolean).map(m => (
              <div className="mc" key={m.l}>
                <div className="mcv">{m.v}</div>
                <div className="mcl">{m.l}</div>
              </div>
            ))}
          </div>

          <div className="st">About this property</div>
          <div className="desc">{listing.description}</div>

          {listing.amenities?.length > 0 && <>
            <div className="st">Amenities</div>
            <div className="ag">{listing.amenities.map(a => <div key={a.name} className="am">{a.name}</div>)}</div>
          </>}

          {listing.landmarks && <>
            <div className="st">Nearby</div>
            <div style={{ fontSize: 14, color: "var(--bark2)", padding: "10px 14px", background: "#fff", borderRadius: 10, border: "1.5px solid rgba(61,43,31,.07)" }}>
              📍 {listing.landmarks}
            </div>
          </>}

          <div className="st">Send an inquiry</div>
          <div className="ifm">
            {sent ? (
              <div className="fsucc">✓ Inquiry sent! {listing.owner?.name} will contact you shortly.</div>
            ) : (
              <form onSubmit={submitInquiry}>
                {inqErr && <div className="ferr">⚠️ {inqErr}</div>}
                <div className="fg"><label className="fl">Your name</label><input className="fi" value={inq.name} onChange={e => setInq({ ...inq, name: e.target.value })} placeholder="e.g. John Mwangi" required /></div>
                <div className="fg"><label className="fl">Phone / WhatsApp</label><input className="fi" value={inq.phone} onChange={e => setInq({ ...inq, phone: e.target.value })} placeholder="+255 7XX XXX XXX" required /></div>
                <div className="fg"><label className="fl">Message</label><textarea className="fta" value={inq.message} onChange={e => setInq({ ...inq, message: e.target.value })} /></div>
                <button type="submit" className="fsub" disabled={sending}>{sending ? "Sending…" : "Send Inquiry"}</button>
              </form>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="sb">
          <div className="pc">
            <div className="pm">TZS {fmt(listing.priceTzs)}<span>/mo</span></div>
            <div className="ps2">{listing.negotiable ? "Negotiable · " : ""}Bills not included</div>
            <div className="avb">● Available Now</div>

            {listing.whatsappContact && (
              <button className="bwa" onClick={() => window.open(`https://wa.me/${(listing.owner?.phone || "").replace(/\D/g, "")}`)}>
                💬 Contact via WhatsApp
              </button>
            )}
            <button className="bc2" onClick={() => setShowPhone(!showPhone)}>
              {showPhone ? listing.owner?.phone || "No phone listed" : "📞 Show Phone Number"}
            </button>
            <button className="bs2" onClick={() => setSaved(!saved)}>
              {saved ? "❤️ Saved" : "🤍 Save listing"}
            </button>
          </div>

          <div className="lc">
            <div className="lh">
              <div className="la">{listing.owner?.name?.[0]}</div>
              <div>
                <div className="ln2">{listing.owner?.name}</div>
                {listing.owner?.isVerified && <div className="vb">✓ Verified Landlord</div>}
              </div>
            </div>
            <div className="ls2">
              <div className="lsi"><div className="lsv">{listing._count?.inquiries || 0}</div><div className="lsl2">Inquiries</div></div>
              <div className="lsi"><div className="lsv">{listing.viewCount || 0}</div><div className="lsl2">Views</div></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
