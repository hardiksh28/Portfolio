import type Lenis from "lenis";

/**
 * Shared, mutable "film state". Written by the scroll engine every frame and
 * read inside the WebGL render loop — kept outside React so scrolling never
 * triggers re-renders.
 */
export const cinema = {
  /** Continuous scene index (0 … SCENES.length - 1) that drives the camera. */
  scene: 0,
  /** 0 → 1 through the whole page. */
  progress: 0,
  /** Smoothed scroll velocity (px / frame-ish), used for motion blur-ish effects. */
  velocity: 0,
  /** 0 → 1 as the opening dolly-in plays after the intro. */
  intro: 0,
  /** Normalised pointer position, -1 … 1. */
  pointerX: 0,
  pointerY: 0,
  lenis: null as Lenis | null,
};

export type SceneMeta = { id: string; no: string; title: string; slug: string };

/** One entry per `[data-scene]` section, in page order. */
export const SCENES: SceneMeta[] = [
  { id: "opening", no: "00", title: "Opening Titles", slug: "FADE IN" },
  { id: "protagonist", no: "01", title: "The Protagonist", slug: "INT. JAIPUR — NIGHT" },
  { id: "arsenal", no: "02", title: "The Arsenal", slug: "INT. THE WORKSHOP — CONTINUOUS" },
  { id: "reel-1", no: "03", title: "The Work — Reel I", slug: "EXT. THE INTERNET — DAY" },
  { id: "reel-2", no: "03", title: "The Work — Reel II", slug: "EXT. THE INTERNET — DAY" },
  { id: "reel-3", no: "03", title: "The Work — Reel III", slug: "INT. TERMINAL — NIGHT" },
  { id: "origins", no: "04", title: "Origins", slug: "EXT. JECRC CAMPUS — DAY" },
  { id: "credits", no: "05", title: "Roll Credits", slug: "FADE OUT" },
  { id: "casting", no: "06", title: "Now Casting", slug: "POST-CREDITS SCENE" },
];

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (cinema.lenis) cinema.lenis.scrollTo(el, { duration: 2.2 });
  else el.scrollIntoView({ behavior: "smooth" });
}
