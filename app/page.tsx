"use client";
import { useEffect, useRef, useState } from "react";
import { PRESETS, cost, Preset } from "@/lib/presets";

type Item = { img: string; video?: string; presetId: string; dur: number; prompt: string };

export default function Studio() {
  const [img, setImg] = useState<string>("");
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [dur, setDur] = useState(5);
  const [prompt, setPrompt] = useState("");
  const [credits, setCredits] = useState(20);
  const [status, setStatus] = useState("");
  const [video, setVideo] = useState("");
  const [hist, setHist] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const c = cost(dur, preset);

  useEffect(() => {
    try { const d = JSON.parse(localStorage.getItem("dolly") || "null"); if (d) { setCredits(d.c); setHist(d.h); } } catch {}
  }, []);
  const persist = (cr: number, h: Item[]) => { try { localStorage.setItem("dolly", JSON.stringify({ c: cr, h: h.slice(0, 10) })); } catch {} };

  const play = (p: Preset, s = 2.5) =>
    imgRef.current?.animate([{ transform: p.from }, { transform: p.to }], { duration: s * 1000, easing: "ease-in-out", fill: "forwards" });
  useEffect(() => { if (img && !video) play(preset); }, [preset, img]);

  function upload(f: File) {
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => {
        const s = Math.min(1, 1024 / i.width), cv = document.createElement("canvas");
        cv.width = i.width * s; cv.height = i.height * s;
        cv.getContext("2d")!.drawImage(i, 0, 0, cv.width, cv.height);
        setVideo(""); setImg(cv.toDataURL("image/jpeg", 0.85));
      };
      i.src = r.result as string;
    };
    r.readAsDataURL(f);
  }

  function assist() {
    const t = prompt.toLowerCase();
    setPreset(PRESETS.find((p) => p.keys.some((k) => t.includes(k))) || PRESETS[0]);
  }

  async function generate() {
    if (!img || c > credits) return;
    setBusy(true); setVideo(""); setCredits((x) => x - c); setStatus("Queued…");
    const response = await fetch("/api/generate", { method: "POST", body: JSON.stringify({ image: img, prompt, presetId: preset.id, duration: dur }) });
    const res = await response.json();
    if (!response.ok) {
      setCredits((x) => x + c); setStatus(res.error || "Unable to start render."); setBusy(false); return;
    }
    let url = "";
    if (res.mock) {
      setStatus("Rendering preview (no video key set)…");
      await new Promise((r) => setTimeout(r, 4000));
    } else if (res.id) {
      for (let n = 0; n < 90; n++) {
        await new Promise((r) => setTimeout(r, 3000));
        const s = await (await fetch(`/api/status?id=${res.id}`)).json();
        setStatus(s.status === "IN_PROGRESS" ? "Rendering motion…" : "Queued…");
        if (s.status === "COMPLETED") { url = s.video; break; }
      }
    }
    if (!url && !res.mock) { setCredits((x) => x + c); setStatus("Render timed out. Credits refunded."); setBusy(false); return; }
    const h = [{ img, video: url, presetId: preset.id, dur, prompt }, ...hist];
    setHist(h); persist(credits - c, h); setVideo(url); setStatus("Done."); setBusy(false);
    if (!url) play(preset, Math.min(dur, 5));
  }

  return (
    <>
      <header><h1>Dolly</h1><b>{credits} credits</b></header>
      <main>
        <div>
          <section className="panel">
            <div className="stage">
              {video ? <video src={video} controls autoPlay loop /> : img ? <img ref={imgRef} src={img} alt="Source frame" /> : null}
            </div>
            <p className="mut">{status || "Upload a frame, pick a move, and preview it instantly."}</p>
          </section>
          <section className="panel">
            <b>History</b>
            <div className="row">
              {hist.map((h, i) => (
                <button key={i} onClick={() => { setImg(h.img); setVideo(h.video || ""); setPreset(PRESETS.find((p) => p.id === h.presetId)!); setDur(h.dur); setPrompt(h.prompt); }}>
                  {PRESETS.find((p) => p.id === h.presetId)?.name}
                </button>
              ))}
              {!hist.length && <span className="mut">Nothing rendered yet.</span>}
            </div>
          </section>
        </div>
        <div>
          <section className="panel">
            <b>1. Source frame</b>
            <p><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></p>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the shot" />
            <p><button onClick={assist}>Suggest a move</button></p>
          </section>
          <section className="panel">
            <b>2. Camera move</b>
            <div className="presets">
              {PRESETS.map((p) => (
                <button key={p.id} className={p.id === preset.id ? "on" : ""} onClick={() => setPreset(p)}>{p.name}<br /><small className="mut">{p.desc}</small></button>
              ))}
            </div>
            <p className="row">{[5, 10].map((d) => <button key={d} className={d === dur ? "on" : ""} onClick={() => setDur(d)}>{d} seconds</button>)}</p>
            <p className="mut">Costs {c} credits. You'll have {Math.max(credits - c, 0)} left.</p>
            <button className="go" disabled={busy || !img || c > credits} onClick={generate}>Generate</button>
          </section>
        </div>
      </main>
    </>
  );
}
