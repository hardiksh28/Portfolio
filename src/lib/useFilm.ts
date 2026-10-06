import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cinema, prefersReducedMotion } from "./cinema";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling + the scroll → camera mapping.
 * `cinema.scene` hits an integer exactly when that section's centre is at the
 * centre of the viewport, so each 3D shot "holds" on its matching section.
 */
export function useFilm(locked: boolean) {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const lenis = new Lenis({ duration: 1.5, smoothWheel: !reduced, wheelMultiplier: 0.9 });
    cinema.lenis = lenis;

    let sections: HTMLElement[] = [];
    const collect = () => {
      sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    };

    const measure = () => {
      if (!sections.length) collect();
      const mid = window.innerHeight / 2;
      let scene = 0;
      for (let i = 0; i < sections.length; i++) {
        const r = sections[i].getBoundingClientRect();
        if (r.top <= mid) scene = i + Math.min((mid - r.top) / r.height, 1) - 0.5;
      }
      cinema.scene = Math.max(0, Math.min(scene, sections.length - 1));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      cinema.progress = max > 0 ? window.scrollY / max : 0;
    };

    lenis.on("scroll", (e: Lenis) => {
      cinema.velocity += (e.velocity - cinema.velocity) * 0.2;
      ScrollTrigger.update();
      measure();
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
      // Let velocity decay when the scroll settles (frame-rate independent).
      cinema.velocity *= Math.pow(0.9, gsap.ticker.deltaRatio(60));
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => {
      collect();
      measure();
    };
    const onPointer = (e: PointerEvent) => {
      cinema.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      cinema.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    requestAnimationFrame(onResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      lenis.destroy();
      cinema.lenis = null;
    };
  }, []);

  useEffect(() => {
    const lenis = cinema.lenis;
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
    document.documentElement.classList.toggle("is-locked", locked);
  }, [locked]);
}
