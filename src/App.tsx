import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Hud from "./components/Hud";
import Intro from "./components/Intro";
import { Arsenal, Casting, Credits, Opening, Origins, Protagonist, Work } from "./sections/Scenes";
import { cinema, prefersReducedMotion } from "./lib/cinema";
import { useFilm } from "./lib/useFilm";

gsap.registerPlugin(ScrollTrigger, SplitText);

// three.js is the heaviest dependency — keep it out of the first paint.
const Stage = lazy(() => import("./three/Stage"));

export default function App() {
  const [reduced] = useState(prefersReducedMotion);
  const [introDone, setIntroDone] = useState(reduced);
  const finishIntro = useCallback(() => setIntroDone(true), []);

  useFilm(!introDone);

  // Opening titles: bars open, camera dollies in, title rises out of the dark.
  useLayoutEffect(() => {
    if (!introDone) return;
    window.scrollTo(0, 0);
    if (reduced) {
      cinema.intro = 1;
      return;
    }
    const ctx = gsap.context(() => {
      const split = SplitText.create("[data-hero-title]", { type: "chars", mask: "chars" });
      gsap
        .timeline({ delay: 0.15 })
        .to(cinema, { intro: 1, duration: 4.2, ease: "power2.out" }, 0)
        .fromTo(
          split.chars,
          { yPercent: 115, filter: "blur(10px)" },
          { yPercent: 0, filter: "blur(0px)", duration: 1.6, stagger: 0.045, ease: "expo.out" },
          0.6,
        )
        .fromTo(
          "[data-hero]",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.12, ease: "power3.out" },
          1.2,
        );
    });
    return () => ctx.revert();
  }, [introDone, reduced]);

  // Scroll-driven reveals for every scene.
  useEffect(() => {
    if (!introDone || reduced) return;
    let ctx: gsap.Context | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
          const s = SplitText.create(el, { type: "words,chars", mask: "words" });
          gsap.from(s.chars, {
            yPercent: 110,
            duration: 1.3,
            stagger: 0.025,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 36,
            filter: "blur(8px)",
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-scrub-words]").forEach((el) => {
          const s = SplitText.create(el, { type: "words" });
          gsap.fromTo(
            s.words,
            { opacity: 0.12 },
            {
              opacity: 1,
              stagger: 0.1,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 55%", scrub: 0.6 },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-credits]").forEach((el) => {
          gsap.fromTo(
            el.children,
            { autoAlpha: 0, y: 60 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.12,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 60%", scrub: 0.8 },
            },
          );
        });
      });
      ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [introDone, reduced]);

  return (
    <>
      <Suspense fallback={<div className="stage stage-fallback" aria-hidden="true" />}>
        <Stage />
      </Suspense>
      <Hud rolling={introDone} />
      <main className={`film ${introDone ? "is-rolling" : ""}`}>
        <Opening />
        <Protagonist />
        <Arsenal />
        <Work />
        <Origins />
        <Credits />
        <Casting />
      </main>
      {!introDone && <Intro onDone={finishIntro} />}
      <div className="grain" aria-hidden="true" />
    </>
  );
}
