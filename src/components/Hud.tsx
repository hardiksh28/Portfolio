import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cinema, jumpTo, SCENES } from "../lib/cinema";

const RUNTIME_SECONDS = 108 * 60; // a respectable 1h 48m feature
const FPS = 24;

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
function timecode(p: number) {
  const total = p * RUNTIME_SECONDS;
  const h = total / 3600;
  const m = (total % 3600) / 60;
  const s = total % 60;
  const f = (total * FPS) % FPS;
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}

/** Letterbox bars with the "camera monitor" overlay: scene slate, timecode, playhead, scene menu. */
export default function Hud({ rolling }: { rolling: boolean }) {
  const tcRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(0);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      if (tcRef.current) tcRef.current.textContent = timecode(cinema.progress);
      if (headRef.current) headRef.current.style.transform = `scaleX(${cinema.progress})`;
      const s = Math.round(cinema.scene);
      if (s !== last) {
        last = s;
        setScene(s);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    cinema.lenis?.[menu ? "stop" : "start"]();
    if (menu) {
      gsap.fromTo(el, { clipPath: "inset(50% 0 50% 0)" }, { clipPath: "inset(0% 0 0% 0)", duration: 0.8, ease: "expo.inOut" });
      gsap.fromTo(
        el.querySelectorAll(".menu-item"),
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "expo.out", delay: 0.35 },
      );
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const meta = SCENES[scene] ?? SCENES[0];
  const chapters = SCENES.filter((s) => s.id !== "reel-2" && s.id !== "reel-3");

  return (
    <>
      <div className={`bar bar--top ${rolling ? "is-open" : ""}`}>
        <div className="bar-inner">
          <button type="button" className="hud-brand" onClick={() => jumpTo("opening")}>
            <span className="hud-mono">HS</span>
            <span className="hud-hide-sm">Hardik Sharma — A Film</span>
          </button>
          <div className="hud-slate hud-hide-sm" key={meta.id}>
            <span className="hud-dot" /> SC. {meta.no} — {meta.title}
          </div>
          <button type="button" className="hud-menu-btn" onClick={() => setMenu(true)} aria-haspopup="dialog">
            Scenes <span className="hud-burger" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={`bar bar--bottom ${rolling ? "is-open" : ""}`}>
        <div className="bar-inner">
          <span className="hud-tc">
            <span className="hud-rec" /> TC <span ref={tcRef}>00:00:00:00</span>
          </span>
          <div className="hud-track hud-hide-sm" aria-hidden="true">
            <div ref={headRef} className="hud-track-fill" />
          </div>
          <span className="hud-format">35MM · 2.39:1</span>
        </div>
      </div>

      {menu && (
        <div ref={menuRef} className="menu" role="dialog" aria-modal="true" aria-label="Scene selection">
          <div className="menu-head">
            <span>Scene selection</span>
            <button type="button" className="hud-menu-btn" onClick={() => setMenu(false)} autoFocus>
              Close ✕
            </button>
          </div>
          <ol className="menu-list">
            {chapters.map((s) => (
              <li key={s.id} className="menu-row">
                <button
                  type="button"
                  className="menu-item"
                  onClick={() => {
                    setMenu(false);
                    requestAnimationFrame(() => jumpTo(s.id));
                  }}
                >
                  <span className="menu-no">{s.no}</span>
                  <span className="menu-title">{s.id === "reel-1" ? "The Work" : s.title}</span>
                  <span className="menu-slug">{s.slug}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}
