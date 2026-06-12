import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import posthog from "posthog-js";
import { CHARACTERS, type CharacterDef } from "../game/sprites";
import { PixelSprite } from "../components/PixelSprite";
import { sfx } from "../game/sfx";

export default function CharacterSelect({
  onSelect,
}: {
  onSelect: (c: CharacterDef) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const confirmedRef = useRef(false);

  const confirm = (i: number) => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    const char = CHARACTERS[i];
    sfx.confirm();
    posthog.capture("character_selected", { character: char.name });
    const root = rootRef.current;
    if (root) {
      gsap
        .timeline({ onComplete: () => onSelect(char) })
        .to(`.cs-card:not([data-idx="${i}"])`, {
          opacity: 0,
          y: 30,
          scale: 0.92,
          duration: 0.35,
          ease: "power2.in",
        })
        .to(`.cs-card[data-idx="${i}"]`, { scale: 1.08, duration: 0.25, ease: "back.out(2)" }, "<")
        .to(root, { opacity: 0, duration: 0.4, ease: "power2.in" }, "+=0.25");
    } else {
      onSelect(char);
    }
  };

  /* Entrance */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".cs-heading", { y: -22, opacity: 0, duration: 0.55 })
        .from(".cs-card", { y: 46, opacity: 0, duration: 0.6, stagger: 0.12 }, "-=0.2")
        .from(".cs-hint", { opacity: 0, duration: 0.5 }, "-=0.2");
    }, root);
    return () => ctx.revert();
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setIndex((i) => {
          sfx.blip();
          return (i + 1) % CHARACTERS.length;
        });
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setIndex((i) => {
          sfx.blip();
          return (i - 1 + CHARACTERS.length) % CHARACTERS.length;
        });
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIndex((i) => {
          confirm(i);
          return i;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Animate stat bars of the focused card */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const card = root.querySelector(`.cs-card[data-idx="${index}"]`);
    if (!card) return;
    gsap.fromTo(
      card.querySelectorAll(".cs-stat-fill"),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.55, ease: "power2.out", stagger: 0.08, transformOrigin: "left center" },
    );
  }, [index]);

  return (
    <div ref={rootRef} className="screen-root cs-screen">
      <div className="cs-heading">
        <div className="cs-kicker">— CHOOSE YOUR EXPLORER —</div>
        <h2 className="cs-title">SELECT CHARACTER</h2>
      </div>

      <div className="cs-grid">
        {CHARACTERS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            data-idx={i}
            className={`cs-card ${i === index ? "is-active" : ""}`}
            style={{ "--char-accent": c.accent, "--char-accent-dim": c.accentDim } as CSSProperties}
            onMouseEnter={() => {
              if (i !== index) sfx.hover();
              setIndex(i);
            }}
            onClick={() => (i === index ? confirm(i) : setIndex(i))}
          >
            <div className="cs-card-glow" aria-hidden="true" />
            <div className="cs-sprite-stage">
              <PixelSprite grid={c.idle} palette={c.palette} scale={7} className="cs-sprite" />
              <div className="cs-sprite-shadow" aria-hidden="true" />
            </div>
            <div className="cs-name">{c.name}</div>
            <div className="cs-class">{c.cls}</div>
            <p className="cs-flavor">{c.flavor}</p>
            <div className="cs-stats">
              {c.stats.map((s) => (
                <div key={s.label} className="cs-stat">
                  <span className="cs-stat-label">{s.label}</span>
                  <span className="cs-stat-bar">
                    <span className="cs-stat-fill" style={{ width: `${s.value}%` }} />
                  </span>
                  <span className="cs-stat-val">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="cs-select-cta">{i === index ? "▶ START JOURNEY" : "SELECT"}</div>
          </button>
        ))}
      </div>

      <div className="cs-hint">← → TO BROWSE &nbsp;•&nbsp; ENTER TO CONFIRM &nbsp;•&nbsp; ALL HEROES SHARE ONE RESUME</div>
    </div>
  );
}
