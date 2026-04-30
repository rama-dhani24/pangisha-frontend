// src/pages/PostListing.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { listingsApi } from "../api/listings.js";
import { useAuth } from "../context/AuthContext.jsx";

const STEPS     = ["Basic info", "Location", "Photos", "Publish"];
const DISTRICTS = ["Kinondoni","Ilala","Temeke","Ubungo","Kigamboni"];
const AMENITIES = ["24hr Security","Generator","Parking","Water tank","Balcony","Furnished","WiFi","CCTV","Gas cooker","Air conditioning","Lift","Garden","Electricity","Private bathroom","Kitchenette"];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--clay:#C4622D;--clay2:#E07B45;--sand:#F5E6C8;--sand2:#FAF3E4;--bark:#3D2B1F;--bark2:#5C3D2E;--cream:#FFFBF4;--shadow:rgba(61,43,31,.10);--shadowM:rgba(61,43,31,.18)}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--bark)}
.nav{background:var(--bark);display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:52px;box-shadow:0 2px 10px var(--shadowM)}
.nlo{font-family:'Playfair Display',serif;font-size:21px;font-weight:900;color:var(--sand);cursor:pointer}
.nlo span{color:var(--clay2)}
.nb{color:var(--sand);opacity:.75;font-size:13px;cursor:pointer}
.page{max-width:640px;margin:0 auto;padding:32px 20px 80px}
.stepper{display:flex;align-items:center;margin-bottom:36px}
.step{display:flex;align-items:center;gap:7px;flex:1}
.sd{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;transition:all .3s}
.sd.done{background:var(--clay);color:#fff}
.sd.active{background:var(--bark);color:var(--sand);box-shadow:0 0 0 4px rgba(196,98,45,.2)}
.sd.pending{background:var(--sand);color:var(--bark2);opacity:.5}
.sl{font-size:11px;font-weight:600;color:var(--bark2);opacity:.6}
.sd.active+.sl{color:var(--bark);opacity:1}
.sline{flex:1;height:2px;background:var(--sand);margin:0 6px;border-radius:2px;overflow:hidden}
.slf{height:100%;background:var(--clay);border-radius:2px;transition:width .4s}
.fc{background:#fff;border-radius:18px;padding:28px;box-shadow:0 4px 22px var(--shadow);border:1.5px solid rgba(61,43,31,.07)}
.sh{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--bark);margin-bottom:5px}
.ss{font-size:13px;color:var(--bark2);opacity:.6;margin-bottom:24px}
.fg{margin-bottom:16px}
.fl{font-size:10px;font-weight:700;color:var(--bark2);margin-bottom:6px;display:block;text-transform:uppercase;letter-spacing:.6px;opacity:.65}
.fi,.fse,.fta{width:100%;background:var(--sand2);border:1.5px solid rgba(61,43,31,.1);border-radius:10px;padding:11px 13px;font-size:14px;font-family:'DM Sans',sans-serif;color:var(--bark);outline:none;transition:border-color .2s;appearance:none}
.fi:focus,.fse:focus,.fta:focus{border-color:var(--clay);background:#fff}
.fta{resize:vertical;min-height:90px;line-height:1.6}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:500px){.frow{grid-template-columns:1fr}}
.tg{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:16px}
.tc{padding:14px 8px;border-radius:11px;border:1.5px solid rgba(61,43,31,.12);background:#fff;text-align:center;cursor:pointer;transition:all .2s;user-select:none}
.tc:hover{border-color:var(--clay2)}
.tc.sel{border-color:var(--clay);background:rgba(196,98,45,.07)}
.ti{font-size:24px;margin-bottom:5px}
.tlb{font-size:12px;font-weight:600;color:var(--bark)}
.tsb{font-size:10px;color:var(--bark2);opacity:.5;margin-top:2px}
.amg{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:7px;margin-bottom:16px}
.at{display:flex;align-items:center;gap:6px;padding:8px 11px;border-radius:9px;border:1.5px solid rgba(61,43,31,.1);background:#fff;cursor:pointer;font-size:12px;font-weight:500;color:var(--bark2);transition:all .15s;user-select:none}
.at.on{border-color:var(--clay);background:rgba(196,98,45,.07);color:var(--bark)}
.at .ck{width:15px;height:15px;border-radius:3px;border:1.5px solid rgba(61,43,31,.2);display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0}
.at.on .ck{background:var(--clay);border-color:var(--clay);color:#fff}
.sw{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--sand2);border-radius:10px;margin-bottom:10px;cursor:pointer;user-select:none}
.sw-lbl{font-size:13px;font-weight:500;color:var(--bark)}
.sw-sub{font-size:11px;color:var(--bark2);opacity:.5;margin-top:2px}
.swt{width:38px;height:20px;background:rgba(61,43,31,.15);border-radius:10px;position:relative;transition:background .2s;flex-shrink:0}
.swt.on{background:var(--clay)}
.swt::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.swt.on::after{transform:translateX(18px)}
.pw{position:relative}
.ppfx{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:600;color:var(--bark2);opacity:.55;pointer-events:none}
.pi{padding-left:52px !important}
.fh{font-size:11px;color:var(--bark2);opacity:.45;margin-top:4px}
.pg{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:14px}
.ps{aspect-ratio:4/3;border-radius:11px;border:2px dashed rgba(61,43,31,.15);background:var(--sand2);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;user-select:none}
.ps:hover{border-color:var(--clay)}
.ps.fl2{border-style:solid;border-color:rgba(61,43,31,.1)}
.ps img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
.ps .rm{position:absolute;top:5px;right:5px;width:22px;height:22px;background:rgba(61,43,31,.7);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;cursor:pointer;border:none;z-index:2}
.ps .ai{font-size:20px;color:var(--bark2);opacity:.35;margin-bottom:3px}
.ps .at2{font-size:10px;color:var(--bark2);opacity:.45;font-weight:500}
.ps:first-child::after{content:'Cover';position:absolute;bottom:0;left:0;right:0;background:rgba(61,43,31,.5);color:#fff;font-size:9px;font-weight:700;text-align:center;padding:3px;pointer-events:none}
.br{display:flex;gap:10px;margin-top:24px}
.bb{flex:1;background:var(--sand);color:var(--bark);border:1.5px solid rgba(61,43,31,.12);border-radius:11px;padding:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.bn{flex:2;background:var(--clay);color:#fff;border:none;border-radius:11px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s}
.bn:hover{background:var(--clay2)}
.bn:disabled{opacity:.6;cursor:not-allowed}
.bp{flex:2;background:var(--bark);color:var(--sand);border:none;border-radius:11px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit}
.bp:hover{background:var(--bark2)}
.bp:disabled{opacity:.6;cursor:not-allowed}
.sum{background:var(--sand2);border-radius:12px;padding:18px;margin-bottom:16px}
.err-b{background:#fff0ed;border:1px solid rgba(196,98,45,.3);color:var(--clay);border-radius:9px;padding:10px 13px;font-size:12px;margin-bottom:14px}
.ch{font-size:10px;color:var(--bark2);opacity:.4;text-align:right;margin-top:3px}
.sucw{text-align:center;padding:30px 10px}
.suci{font-size:48px;margin-bottom:14px}
.suct{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:var(--bark);margin-bottom:8px}
.sucm{font-size:14px;color:var(--bark2);opacity:.65;line-height:1.6;margin-bottom:22px}
.sucb{background:var(--clay);color:#fff;border:none;border-radius:11px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;margin-right:8px}
.sucb2{background:var(--sand);color:var(--bark);border:1.5px solid rgba(61,43,31,.12);border-radius:11px;padding:12px 24px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
`;

export default function PostListing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step,      setStep]      = useState(0);
  const [published, setPublished] = useState(false);
  const [newId,     setNewId]     = useState(null);
  const [submitting,setSubmitting]= useState(false);
  const [error,     setError]     = useState("");

  const [form, setForm] = useState({
    type: "ROOM", title: "", description: "", beds: "1", baths: "1", sqm: "", floor: "",
    district: "Kinondoni", street: "", landmarks: "",
    priceTzs: "", negotiable: true, furnished: false, parking: false, whatsappContact: true,
    amenities: new Set(["Water tank", "Electricity"]),
    photos: [null, null, null, null, null],
    contactName: user?.name || "", contactPhone: user?.phone || "",
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function toggleAmenity(a) {
    setForm(f => {
      const s = new Set(f.amenities);
      s.has(a) ? s.delete(a) : s.add(a);
      return { ...f, amenities: s };
    });
  }

  function handlePhotoSelect(i, e) {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm(f => {
      const photos = [...f.photos];
      photos[i] = { file, preview };
      return { ...f, photos };
    });
  }

  function removePhoto(i, e) {
    e.stopPropagation();
    setForm(f => {
      const photos = [...f.photos];
      photos[i] = null;
      return { ...f, photos };
    });
  }

  async function handlePublish() {
    setError("");
    if (!form.title)    return setError("Please add a listing title.");
    if (!form.priceTzs) return setError("Please enter the monthly rent.");
    if (!form.district) return setError("Please select a district.");

    setSubmitting(true);
    try {
      // 1. Create the listing
      const res = await listingsApi.create({
        title:          form.title,
        description:    form.description || `${form.type} for rent in ${form.district}.`,
        type:           form.type,
        priceTzs:       parseInt(form.priceTzs),
        negotiable:     form.negotiable,
        furnished:      form.furnished,
        parking:        form.parking,
        whatsappContact:form.whatsappContact,
        district:       form.district,
        street:         form.street || undefined,
        landmarks:      form.landmarks || undefined,
        beds:           form.beds  ? parseInt(form.beds)  : undefined,
        baths:          form.baths ? parseInt(form.baths) : undefined,
        sqm:            form.sqm   ? parseInt(form.sqm)   : undefined,
        floor:          form.floor ? parseInt(form.floor) : undefined,
        amenities:      Array.from(form.amenities),
      });

      const listingId = res.data.id;
      setNewId(listingId);

      // 2. Upload photos if any were selected
      const selectedFiles = form.photos.filter(Boolean).map(p => p.file);
      if (selectedFiles.length > 0) {
        await listingsApi.uploadImages(listingId, selectedFiles);
      }

      setPublished(true);
    } catch (err) {
      setError(err.message || "Failed to publish listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (published) return (
    <>
      <style>{css}</style>
      <nav className="nav">
        <div className="nlo" onClick={() => navigate("/")}>Pang<span>isha</span></div>
      </nav>
      <div className="page">
        <div className="fc sucw">
          <div className="suci">🎉</div>
          <div className="suct">Listing submitted!</div>
          <div className="sucm">
            Your listing is pending admin approval and will go live shortly.<br />
            You can track it from your dashboard.
          </div>
          <button className="sucb" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
          <button className="sucb2" onClick={() => { setPublished(false); setStep(0); setForm(f => ({ ...f, title:"", description:"", photos:[null,null,null,null,null] })); }}>Post another</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <nav className="nav">
        <div className="nlo" onClick={() => navigate("/")}>Pang<span>isha</span></div>
        <div className="nb" onClick={() => navigate(-1)}>← Back</div>
      </nav>

      <div className="page">
        {/* STEPPER */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s} className="step">
              <div className={`sd ${i < step ? "done" : i === step ? "active" : "pending"}`}>{i < step ? "✓" : i + 1}</div>
              <div className={`sl ${i === step ? "active" : ""}`}>{s}</div>
              {i < STEPS.length - 1 && <div className="sline"><div className="slf" style={{ width: i < step ? "100%" : "0%" }} /></div>}
            </div>
          ))}
        </div>

        <div className="fc">
          {/* ── STEP 0: BASIC INFO ── */}
          {step === 0 && <>
            <div className="sh">Tell us about your property</div>
            <div className="ss">Type, size, and description</div>

            <div className="fg">
              <div className="fl">Property type</div>
              <div className="tg">
                {[{v:"ROOM",i:"🚪",l:"Room",s:"Single room"},{v:"BUSINESS",i:"🏪",l:"Business space",s:"Shop/office"},{v:"APARTMENT",i:"🏢",l:"Apartment",s:"Flat/unit"}]
                  .map(t => (
                    <div key={t.v} className={`tc ${form.type === t.v ? "sel" : ""}`} onClick={() => set("type", t.v)}>
                      <div className="ti">{t.i}</div><div className="tlb">{t.l}</div><div className="tsb">{t.s}</div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="fg">
              <label className="fl">Listing title *</label>
              <input className="fi" placeholder={`e.g. Spacious ${form.type === "ROOM" ? "room" : form.type === "BUSINESS" ? "shop space" : "apartment"} in Kinondoni`} value={form.title} onChange={e => set("title", e.target.value)} maxLength={80} />
              <div className="ch">{form.title.length}/80</div>
            </div>

            <div className="fg">
              <label className="fl">Description</label>
              <textarea className="fta" placeholder="Describe the property — condition, nearby amenities, who it's suitable for..." value={form.description} onChange={e => set("description", e.target.value)} maxLength={600} />
              <div className="ch">{form.description.length}/600</div>
            </div>

            <div className="frow">
              {form.type !== "BUSINESS" && (
                <div className="fg">
                  <label className="fl">Bedrooms</label>
                  <select className="fse" value={form.beds} onChange={e => set("beds", e.target.value)}>
                    {["1","2","3","4","5+"].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              )}
              <div className="fg">
                <label className="fl">Area (m²)</label>
                <input className="fi" type="number" placeholder="e.g. 18" value={form.sqm} onChange={e => set("sqm", e.target.value)} />
              </div>
            </div>

            <div className="fg">
              <div className="fl">Amenities</div>
              <div className="amg">
                {AMENITIES.map(a => (
                  <div key={a} className={`at ${form.amenities.has(a) ? "on" : ""}`} onClick={() => toggleAmenity(a)}>
                    <div className="ck">{form.amenities.has(a) ? "✓" : ""}</div>{a}
                  </div>
                ))}
              </div>
            </div>

            <div className="br">
              <button className="bn" onClick={() => setStep(1)}>Continue →</button>
            </div>
          </>}

          {/* ── STEP 1: LOCATION ── */}
          {step === 1 && <>
            <div className="sh">Where is it?</div>
            <div className="ss">Help tenants find you — be specific</div>

            <div className="fg">
              <label className="fl">District *</label>
              <select className="fse" value={form.district} onChange={e => set("district", e.target.value)}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="fg">
              <label className="fl">Street / Ward / Mtaa</label>
              <input className="fi" placeholder="e.g. Kariakoo, Sinza, Msasani..." value={form.street} onChange={e => set("street", e.target.value)} />
            </div>

            <div className="fg">
              <label className="fl">Nearby landmarks (optional)</label>
              <input className="fi" placeholder="e.g. Near Shoppers Plaza, 5 min from bus stop" value={form.landmarks} onChange={e => set("landmarks", e.target.value)} />
            </div>

            <div className="fg">
              <div className="fl">Monthly rent (TZS) *</div>
              <div className="pw">
                <span className="ppfx">TZS</span>
                <input className="fi pi" type="number" placeholder="e.g. 55000" value={form.priceTzs} onChange={e => set("priceTzs", e.target.value)} />
              </div>
              {form.priceTzs && <div className="fh">= TZS {Number(form.priceTzs).toLocaleString()} per month</div>}
            </div>

            {[
              { k:"negotiable",     l:"Price is negotiable",  s:"Tenants can make offers"          },
              { k:"furnished",      l:"Property is furnished",s:"Includes furniture & appliances"  },
              { k:"parking",        l:"Parking available",    s:"On-site parking space"            },
              { k:"whatsappContact",l:"Show WhatsApp button", s:"Tenants message you directly"     },
            ].map(sw => (
              <div key={sw.k} className="sw" onClick={() => set(sw.k, !form[sw.k])}>
                <div><div className="sw-lbl">{sw.l}</div><div className="sw-sub">{sw.s}</div></div>
                <div className={`swt ${form[sw.k] ? "on" : ""}`} />
              </div>
            ))}

            <div className="br">
              <button className="bb" onClick={() => setStep(0)}>← Back</button>
              <button className="bn" onClick={() => setStep(2)}>Continue →</button>
            </div>
          </>}

          {/* ── STEP 2: PHOTOS ── */}
          {step === 2 && <>
            <div className="sh">Add photos</div>
            <div className="ss">Listings with photos get 5× more inquiries</div>

            <div className="pg">
              {form.photos.map((p, i) => (
                <div key={i} className={`ps ${p ? "fl2" : ""}`}>
                  {p ? (
                    <>
                      <img src={p.preview} alt="" />
                      <button className="rm" onClick={e => removePhoto(i, e)}>✕</button>
                    </>
                  ) : (
                    <label style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                      <div className="ai">+</div>
                      <div className="at2">Add photo</div>
                      <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => handlePhotoSelect(i, e)} />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <div className="fh" style={{ marginBottom:16 }}>{form.photos.filter(Boolean).length} / 5 photos · First photo will be the cover image</div>

            <div className="br">
              <button className="bb" onClick={() => setStep(1)}>← Back</button>
              <button className="bn" onClick={() => setStep(3)}>Continue →</button>
            </div>
          </>}

          {/* ── STEP 3: PUBLISH ── */}
          {step === 3 && <>
            <div className="sh">Review & publish</div>
            <div className="ss">Your listing will go live after admin approval</div>

            {error && <div className="err-b">⚠️ {error}</div>}

            <div className="sum">
              <div style={{ fontSize:12,fontWeight:700,color:"var(--bark2)",opacity:.6,textTransform:"uppercase",letterSpacing:".5px",marginBottom:10 }}>Summary</div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"var(--bark)",marginBottom:6 }}>{form.title || `${form.type} in ${form.district}`}</div>
              <div style={{ fontSize:12,color:"var(--bark2)",opacity:.65,marginBottom:10 }}>📍 {form.street ? `${form.street}, ` : ""}{form.district}</div>
              <div style={{ display:"flex",gap:16,flexWrap:"wrap" }}>
                {[
                  { l:"Type",   v:form.type   },
                  { l:"Price",  v:form.priceTzs ? `TZS ${Number(form.priceTzs).toLocaleString()}/mo` : "—" },
                  { l:"Photos", v:`${form.photos.filter(Boolean).length}/5` },
                  { l:"Amenities", v:form.amenities.size },
                ].map(m => (
                  <div key={m.l} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:14,fontWeight:700,color:"var(--bark)" }}>{m.v}</div>
                    <div style={{ fontSize:9,color:"var(--bark2)",opacity:.5,textTransform:"uppercase",letterSpacing:".5px" }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="br">
              <button className="bb" onClick={() => setStep(2)}>← Back</button>
              <button className="bp" onClick={handlePublish} disabled={submitting}>{submitting ? "Publishing…" : "🚀 Publish listing"}</button>
            </div>
          </>}
        </div>
      </div>
    </>
  );
}
