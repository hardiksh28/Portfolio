import { useEffect, useRef } from "react";
import gsap from "gsap";
import { sfx } from "../game/sfx";

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  /* Twinkling starfield */
  useEffect(() => {
    const canvas = starsRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 130 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.85,
      size: Math.random() < 0.8 ? 2 : 3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.6,
    }));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = () => {
      const t = gsap.ticker.time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#cfe8ff";
      for (const s of stars) {
        const a = reduced ? 0.7 : 0.25 + 0.75 * Math.abs(Math.sin(t * s.speed + s.phase));
        ctx.globalAlpha = a;
        ctx.fillRect(s.x * canvas.width, s.y * canvas.height, s.size * dpr, s.size * dpr);
      }
      ctx.globalAlpha = 1;
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* Entrance animation */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".title-badge", { y: -24, opacity: 0, duration: 0.6, delay: 0.2 })
        .from(".title-main", { y: 30, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.3")
        .from(".title-sub", { opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".title-start", { opacity: 0, scale: 0.9, duration: 0.5 }, "-=0.2")
        .from(".title-foot", { opacity: 0, duration: 0.6 }, "-=0.3");

      // Occasional glitch flicker on the logo
      const glitch = () => {
        gsap.to(".title-main", {
          x: () => gsap.utils.random(-3, 3),
          skewX: () => gsap.utils.random(-2, 2),
          duration: 0.05,
          repeat: 3,
          yoyo: true,
          onComplete: () => gsap.set(".title-main", { x: 0, skewX: 0 }),
        });
        gsap.delayedCall(gsap.utils.random(2.5, 5), glitch);
      };
      gsap.delayedCall(2, glitch);
    }, root);
    return () => ctx.revert();
  }, []);

  /* Start on any key / click */
  useEffect(() => {
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      sfx.confirm();
      const root = rootRef.current;
      if (root) {
        gsap.to(root, { opacity: 0, scale: 1.04, duration: 0.45, ease: "power2.in", onComplete: onStart });
      } else {
        onStart();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.metaKey || e.ctrlKey || e.altKey) return;
      start();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", start);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", start);
    };
  }, [onStart]);

  return (
    <div ref={rootRef} className="screen-root title-screen">
      <canvas ref={starsRef} className="title-stars" aria-hidden="true" />
      <div className="title-moon" aria-hidden="true" />
      <div className="title-horizon" aria-hidden="true" />

      <div className="title-content">
        <div className="title-badge">★ A FULL-STACK ADVENTURE ★</div>
        <h1 className="title-logo">
          <span className="title-main" data-text="PORTFOLIO">PORTFOLIO</span>
          <span className="title-main title-main--accent" data-text="QUEST">QUEST</span>
        </h1>
        <p className="title-sub">
          starring <strong>HARDIK SHARMA</strong> — Full-Stack Developer
        </p>

        <button className="title-start" type="button">
          ▶ PRESS START
        </button>

        <div className="title-foot">
          <span>© 2026 HARDIK.DEV</span>
          <span className="title-foot-dot">•</span>
          <span>INSERT CURIOSITY TO CONTINUE</span>
        </div>
      </div>
    </div>
  );
}
