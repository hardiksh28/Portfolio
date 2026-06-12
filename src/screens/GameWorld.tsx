import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import gsap from "gsap";
import posthog from "posthog-js";
import { Volume2, VolumeX, CircleHelp, MapPin } from "lucide-react";
import { drawSprite, type CharacterDef } from "../game/sprites";
import { WORLD_W, GROUND_H, SPAWN_X, CHAR_SCALE, ZONE_RADIUS, ZONES, DECOR, type Zone } from "../game/world";
import { ZoneProp } from "../components/ZoneProp";
import ZonePanel from "../components/panels/ZonePanel";
import { PixelSprite } from "../components/PixelSprite";
import { sfx } from "../game/sfx";

const WALK_SPEED = 360; // px/s
const CHAR_W = 12 * CHAR_SCALE;

export default function GameWorld({ character }: { character: CharacterDef }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const charCanvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const dustHostRef = useRef<HTMLDivElement>(null);
  const mapDotRef = useRef<HTMLDivElement>(null);

  const [nearZone, setNearZone] = useState<Zone | null>(null);
  const [openZone, setOpenZone] = useState<Zone | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [movedOnce, setMovedOnce] = useState(false);
  const [muted, setMuted] = useState(sfx.isMuted());
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  /* Mutable game state, never triggers React renders */
  const pos = useRef({ x: SPAWN_X, prevX: SPAWN_X, facing: 1, frame: 0, frameT: 0, dustT: 0, jumpV: 0, jumpY: 0 });
  const keys = useRef({ left: false, right: false });
  const touch = useRef({ left: false, right: false });
  const openRef = useRef<Zone | null>(null);
  const nearRef = useRef<Zone | null>(null);
  const travelTween = useRef<gsap.core.Tween | null>(null);
  const reduced = useRef(false);
  const completedRef = useRef(false);

  openRef.current = openZone;

  /* ---------------------------------------------------------------- */
  /* Open / close zone panels                                          */
  /* ---------------------------------------------------------------- */
  const openPanel = (zone: Zone) => {
    if (openRef.current) return;
    travelTween.current?.kill();
    sfx.open();
    posthog.capture("zone_visited", { zone: zone.id });
    setOpenZone(zone);
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(zone.id);
      return next;
    });
  };

  const travelTo = (zone: Zone) => {
    if (openRef.current) return;
    sfx.blip();
    travelTween.current?.kill();
    const dist = Math.abs(zone.x - pos.current.x);
    if (dist < ZONE_RADIUS) {
      openPanel(zone);
      return;
    }
    travelTween.current = gsap.to(pos.current, {
      x: zone.x - 60,
      duration: gsap.utils.clamp(0.6, 2.6, dist / 850),
      ease: "power2.inOut",
      onComplete: () => openPanel(zone),
    });
  };

  /* Quest-complete celebration */
  useEffect(() => {
    if (visited.size === ZONES.length && !completedRef.current) {
      completedRef.current = true;
      sfx.complete();
      setToast("🏆 QUEST COMPLETE — WORLD 100% EXPLORED");
      const t = setTimeout(() => setToast(null), 5200);

      // pixel confetti
      const host = rootRef.current;
      if (host && !reduced.current) {
        const colors = ZONES.map((z) => z.color);
        for (let i = 0; i < 70; i++) {
          const p = document.createElement("div");
          p.className = "confetti-px";
          p.style.background = colors[i % colors.length];
          p.style.left = `${Math.random() * 100}%`;
          host.appendChild(p);
          gsap.fromTo(
            p,
            { y: -40, x: 0, rotation: 0, opacity: 1 },
            {
              y: window.innerHeight + 60,
              x: gsap.utils.random(-120, 120),
              rotation: gsap.utils.random(-360, 360),
              opacity: 0.9,
              duration: gsap.utils.random(2.2, 4),
              delay: Math.random() * 0.8,
              ease: "power1.in",
              onComplete: () => p.remove(),
            },
          );
        }
      }
      return () => clearTimeout(t);
    }
  }, [visited]);

  /* ---------------------------------------------------------------- */
  /* Input                                                             */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = true;
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = true;
      else if ((e.key === "Enter" || e.key === "e" || e.key === "E") && !openRef.current && nearRef.current) {
        openPanel(nearRef.current);
      }
      if (e.key.startsWith("Arrow")) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.current.left = false;
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Detect touch devices (phones + tablets) to show the on-screen gamepad */
  useEffect(() => {
    const detect = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      if (coarse || hasTouch) setIsTouch(true);
    };
    detect();
    // Fallback: reveal the gamepad on the very first touch, in case detection missed.
    const onFirstTouch = () => setIsTouch(true);
    window.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });
    return () => window.removeEventListener("touchstart", onFirstTouch);
  }, []);

  /* Click-to-move on the ground */
  const onWorldPointerDown = (e: ReactPointerEvent) => {
    if (openRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-ui]")) return;
    const vw = window.innerWidth;
    const cam = gsap.utils.clamp(0, WORLD_W - vw, pos.current.x - vw * 0.45);
    const worldX = gsap.utils.clamp(60, WORLD_W - 60, e.clientX + cam);
    travelTween.current?.kill();
    sfx.blip();
    const dist = Math.abs(worldX - pos.current.x);
    travelTween.current = gsap.to(pos.current, {
      x: worldX,
      duration: gsap.utils.clamp(0.3, 2.2, dist / 800),
      ease: "power1.inOut",
    });
  };

  /* ---------------------------------------------------------------- */
  /* Starfield                                                         */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = starsRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * 0.7 * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() < 0.85 ? 2 : 3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.4,
    }));
    const tick = () => {
      const t = gsap.ticker.time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#cfe8ff";
      for (const s of stars) {
        ctx.globalAlpha = reduced.current ? 0.6 : 0.2 + 0.7 * Math.abs(Math.sin(t * s.speed + s.phase));
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

  /* ---------------------------------------------------------------- */
  /* Main game loop                                                    */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const p = pos.current;
    let lastNearId: string | null = null;
    let movedFired = false;

    // initial sprite
    if (charCanvasRef.current) drawSprite(charCanvasRef.current, character.idle, character.palette, CHAR_SCALE);

    const spawnDust = (x: number, dir: number) => {
      const host = dustHostRef.current;
      if (!host || reduced.current || host.childElementCount > 8) return;
      const d = document.createElement("div");
      d.className = "dust-px";
      d.style.left = `${x - dir * 14}px`;
      host.appendChild(d);
      gsap.to(d, {
        y: -gsap.utils.random(10, 22),
        x: -dir * gsap.utils.random(8, 20),
        opacity: 0,
        scale: gsap.utils.random(0.4, 1),
        duration: 0.55,
        ease: "power1.out",
        onComplete: () => d.remove(),
      });
    };

    const update = (_time: number, deltaMS: number) => {
      const dt = Math.min(deltaMS / 1000, 0.05);
      const vw = window.innerWidth;

      // keyboard / touch movement (disabled while a panel is open)
      if (!openRef.current) {
        const dir =
          (keys.current.right || touch.current.right ? 1 : 0) -
          (keys.current.left || touch.current.left ? 1 : 0);
        if (dir !== 0) {
          travelTween.current?.kill();
          p.x = gsap.utils.clamp(60, WORLD_W - 60, p.x + dir * WALK_SPEED * dt);
        }
      }

      const dx = p.x - p.prevX;
      const moving = Math.abs(dx) > 0.4;
      if (moving) {
        p.facing = dx > 0 ? 1 : -1;
        if (!movedFired) {
          movedFired = true;
          setMovedOnce(true);
        }
      }
      p.prevX = p.x;

      // jump physics (B button / D-pad up)
      if (p.jumpY > 0 || p.jumpV !== 0) {
        p.jumpY += p.jumpV * dt;
        p.jumpV -= 1700 * dt;
        if (p.jumpY <= 0) {
          p.jumpY = 0;
          p.jumpV = 0;
        }
      }

      // camera + parallax (transform-only, GPU composited)
      const cam = gsap.utils.clamp(0, WORLD_W - vw, p.x - vw * 0.45);
      if (worldRef.current) worldRef.current.style.transform = `translate3d(${-cam}px,0,0)`;
      if (midRef.current) midRef.current.style.transform = `translate3d(${-cam * 0.35}px,0,0)`;
      if (farRef.current) farRef.current.style.transform = `translate3d(${-cam * 0.12}px,0,0)`;

      // character: position + bob + facing
      const t = gsap.ticker.time;
      const bob = moving ? Math.sin(t * 16) * 3 : Math.sin(t * 2.4) * 1.5;
      if (charRef.current) {
        charRef.current.style.transform = `translate3d(${p.x - CHAR_W / 2}px, ${bob - p.jumpY}px, 0) scaleX(${p.facing})`;
      }

      // walk animation frames
      p.frameT += dt;
      if (moving && p.frameT > 0.13) {
        p.frameT = 0;
        p.frame = p.frame === 0 ? 1 : 0;
        if (charCanvasRef.current) {
          drawSprite(
            charCanvasRef.current,
            p.frame === 0 ? character.idle : character.walk,
            character.palette,
            CHAR_SCALE,
          );
        }
      } else if (!moving && p.frame !== 0) {
        p.frame = 0;
        if (charCanvasRef.current) drawSprite(charCanvasRef.current, character.idle, character.palette, CHAR_SCALE);
      }

      // footstep dust
      if (moving) {
        p.dustT += dt;
        if (p.dustT > 0.16) {
          p.dustT = 0;
          spawnDust(p.x, p.facing);
        }
      }

      // zone proximity (state update only on change)
      let near: Zone | null = null;
      for (const z of ZONES) {
        if (Math.abs(p.x - z.x) < ZONE_RADIUS) {
          near = z;
          break;
        }
      }
      if ((near?.id ?? null) !== lastNearId) {
        lastNearId = near?.id ?? null;
        nearRef.current = near;
        setNearZone(near);
        if (near) sfx.hover();
      }

      // minimap player dot
      if (mapDotRef.current) {
        mapDotRef.current.style.left = `${(p.x / WORLD_W) * 100}%`;
      }
    };

    gsap.ticker.add(update);
    return () => {
      gsap.ticker.remove(update);
      travelTween.current?.kill();
    };
  }, [character]);

  /* World entrance fade */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power2.out" });
      gsap.from(".hud-top > *", { y: -18, opacity: 0, duration: 0.5, stagger: 0.08, delay: 0.4, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, []);

  const toggleMute = () => {
    const next = !muted;
    sfx.setMuted(next);
    setMuted(next);
    if (!next) sfx.blip();
  };

  const bindTouch = (side: "left" | "right") => ({
    onPointerDown: (e: ReactPointerEvent) => {
      e.preventDefault();
      touch.current[side] = true;
    },
    onPointerUp: () => (touch.current[side] = false),
    onPointerLeave: () => (touch.current[side] = false),
    onPointerCancel: () => (touch.current[side] = false),
  });

  const jump = () => {
    if (openRef.current) return;
    const p = pos.current;
    if (p.jumpY === 0 && p.jumpV === 0) {
      p.jumpV = 560;
      sfx.blip();
    }
  };

  const interact = () => {
    if (!openRef.current && nearRef.current) openPanel(nearRef.current);
  };

  return (
    <div ref={rootRef} className="screen-root gw-root" onPointerDown={onWorldPointerDown}>
      {/* Sky */}
      <canvas ref={starsRef} className="gw-stars" aria-hidden="true" />
      <div className="gw-moon" aria-hidden="true" />

      {/* Parallax layers */}
      <div ref={farRef} className="gw-layer gw-layer-far" aria-hidden="true" />
      <div ref={midRef} className="gw-layer gw-layer-mid" aria-hidden="true" />

      {/* World layer */}
      <div ref={worldRef} className="gw-layer gw-world" style={{ width: WORLD_W }}>
        <div className="gw-ground" />

        {/* Spawn sign */}
        <div className="gw-spawn-sign" style={{ left: SPAWN_X - 130 }}>
          <div className="gw-sign-board">SPAWN<br />POINT</div>
          <div className="gw-sign-post" />
        </div>

        {/* Decor */}
        {DECOR.map((d, i) => (
          <div key={i} className={`gw-decor gw-decor--${d.type}`} style={{ left: d.x }} aria-hidden="true" />
        ))}

        {/* Zones */}
        {ZONES.map((z) => (
          <div key={z.id} className="gw-zone" style={{ left: z.x, "--zone-color": z.color } as CSSProperties}>
            <button
              type="button"
              data-ui="true"
              className="gw-zone-hit"
              aria-label={`Visit ${z.label}`}
              onClick={() => travelTo(z)}
            >
              <ZoneProp zone={z} />
            </button>
            <div className={`gw-zone-marker ${visited.has(z.id) ? "is-visited" : ""}`}>
              {visited.has(z.id) ? "✓" : "!"}
            </div>
            <div className="gw-zone-sign">
              <span className="gw-zone-sign-label">{z.label}</span>
              <span className="gw-zone-sign-sub">{z.sub}</span>
            </div>
          </div>
        ))}

        {/* Interact prompt */}
        {nearZone && !openZone && (
          <div className="gw-prompt" style={{ left: nearZone.x }} data-ui="true">
            <button type="button" className="gw-prompt-btn" onClick={() => openPanel(nearZone)}>
              <span className="gw-prompt-key">E</span> ENTER {nearZone.label}
            </button>
          </div>
        )}

        {/* Movement hint near spawn */}
        {!movedOnce && (
          <div className="gw-hint" style={{ left: isTouch ? SPAWN_X : SPAWN_X + 90 }}>
            {isTouch ? "USE THE D-PAD TO MOVE" : "← → / A D TO MOVE"}
            <br />
            <span>{isTouch ? "TAP THE GROUND TO AUTO-WALK" : "OR TAP ANYWHERE ON THE GROUND"}</span>
          </div>
        )}

        {/* Dust particles host */}
        <div ref={dustHostRef} className="gw-dust-host" aria-hidden="true" />

        {/* Character */}
        <div ref={charRef} className="gw-char">
          <canvas ref={charCanvasRef} style={{ imageRendering: "pixelated" }} />
          <div className="gw-char-shadow" aria-hidden="true" />
        </div>
      </div>

      {/* ------------------------- HUD ------------------------------ */}
      <div className="hud-top" data-ui="true">
        <div className="hud-player">
          <div className="hud-player-avatar">
            <PixelSprite grid={character.idle} palette={character.palette} scale={2} />
          </div>
          <div className="hud-player-meta">
            <div className="hud-player-name" style={{ color: character.accent }}>
              {character.name} <em>· {character.cls}</em>
            </div>
            <div className="hud-xp">
              <div className="hud-xp-fill" style={{ width: `${(visited.size / ZONES.length) * 100}%` }} />
            </div>
            <div className="hud-xp-label">
              {visited.size}/{ZONES.length} AREAS DISCOVERED
            </div>
          </div>
        </div>

        <div className="hud-map">
          <div className="hud-map-track">
            {ZONES.map((z) => (
              <button
                key={z.id}
                type="button"
                className={`hud-map-node ${visited.has(z.id) ? "is-visited" : ""}`}
                style={{ left: `${(z.x / WORLD_W) * 100}%`, "--zone-color": z.color } as CSSProperties}
                onClick={() => travelTo(z)}
                onMouseEnter={() => sfx.hover()}
                aria-label={`Fast travel to ${z.label}`}
              >
                <MapPin size={10} />
                <span className="hud-map-tip">{z.label}</span>
              </button>
            ))}
            <div ref={mapDotRef} className="hud-map-dot" style={{ background: character.accent }} />
          </div>
        </div>

        <div className="hud-actions">
          <button type="button" className="hud-icon-btn" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button type="button" className="hud-icon-btn" onClick={() => setShowHelp(true)} aria-label="Help">
            <CircleHelp size={15} />
          </button>
        </div>
      </div>

      {!isTouch && (
        <div className="hud-keys" data-ui="true">
          <span><b>← →</b> MOVE</span>
          <span><b>E</b> INTERACT</span>
          <span><b>ESC</b> CLOSE</span>
          <span><b>CLICK MAP</b> FAST TRAVEL</span>
        </div>
      )}

      {/* On-screen gamepad — phones & tablets */}
      {isTouch && !openZone && (
        <div className="gamepad" data-ui="true">
          <div className="gamepad-dpad" role="group" aria-label="Movement pad">
            <button
              type="button"
              className="dpad-btn dpad-up"
              aria-label="Jump"
              onPointerDown={(e) => {
                e.preventDefault();
                jump();
              }}
            />
            <button type="button" className="dpad-btn dpad-left" aria-label="Move left" {...bindTouch("left")} />
            <span className="dpad-center" aria-hidden="true" />
            <button type="button" className="dpad-btn dpad-right" aria-label="Move right" {...bindTouch("right")} />
            <span className="dpad-btn dpad-down dpad-inert" aria-hidden="true" />
          </div>

          <div className="gamepad-actions">
            <button
              type="button"
              className="pad-action pad-b"
              aria-label="Jump"
              onPointerDown={(e) => {
                e.preventDefault();
                jump();
              }}
            >
              <span>B</span>
              <em>JUMP</em>
            </button>
            <button
              type="button"
              className={`pad-action pad-a ${nearZone ? "is-ready" : ""}`}
              aria-label="Interact"
              onClick={interact}
            >
              <span>A</span>
              <em>{nearZone ? "ENTER" : "—"}</em>
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="gw-toast" data-ui="true">{toast}</div>}

      {/* Help overlay */}
      {showHelp && (
        <div className="panel-scrim" data-ui="true" onClick={() => setShowHelp(false)}>
          <div className="panel-window help-window" onClick={(e) => e.stopPropagation()}>
            <header className="panel-head">
              <h2 className="panel-zone-title">HOW TO PLAY</h2>
              <button type="button" className="panel-close" onClick={() => setShowHelp(false)} aria-label="Close help">X</button>
            </header>
            <div className="panel-body help-body">
              <p>▸ Walk with <b>← → / A D</b>, or the <b>D-pad</b> on the gamepad (mobile & tablet).</p>
              <p>▸ Click anywhere on the ground to auto-walk there.</p>
              <p>▸ Stand near a building and press <b>E / ENTER</b> — or the <b>A</b> button — to explore it.</p>
              <p>▸ Tap <b>B</b> (or D-pad up) to hop.</p>
              <p>▸ Use the map pins on top for instant fast travel.</p>
              <p>▸ Discover all 5 areas to complete the quest. 🏆</p>
            </div>
          </div>
        </div>
      )}

      {/* Zone content panel */}
      {openZone && (
        <ZonePanel zone={openZone} character={character} onClose={() => setOpenZone(null)} />
      )}
    </div>
  );
}
