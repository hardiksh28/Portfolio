import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Cold open: an academy-leader countdown (3 · 2 · 1), a "presents" card,
 * then hand-off to the opening titles.
 */
export default function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ onComplete: onDone });
      tl.current = t;
      const digits = gsap.utils.toArray<HTMLElement>(".leader-digit");

      t.set(".leader", { autoAlpha: 1 });
      digits.forEach((d, i) => {
        t.set(digits, { autoAlpha: 0 }, i * 0.7)
          .set(d, { autoAlpha: 1 }, i * 0.7)
          .fromTo(".leader-sweep", { "--sweep": "0deg" }, { "--sweep": "360deg", duration: 0.7, ease: "none" }, i * 0.7)
          .fromTo(".leader-flash", { opacity: 0.18 }, { opacity: 0, duration: 0.3 }, i * 0.7);
      });
      t.to(".leader", { autoAlpha: 0, duration: 0.25 }, "+=0.05")
        .fromTo(
          ".presents span",
          { autoAlpha: 0, y: 14, filter: "blur(6px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.18, ease: "power3.out" },
        )
        .to(".presents", { autoAlpha: 0, filter: "blur(8px)", duration: 0.7, ease: "power2.in" }, "+=0.9")
        .to(root.current, { autoAlpha: 0, duration: 0.6 }, "-=0.1");
    }, root);
    return () => ctx.revert();
  }, [onDone]);

  const skip = () => {
    tl.current?.progress(1);
  };

  return (
    <div ref={root} className="intro" role="presentation">
      <div className="leader">
        <div className="leader-sweep" />
        <div className="leader-cross" />
        <div className="leader-ring" />
        <div className="leader-ring leader-ring--inner" />
        {["3", "2", "1"].map((d) => (
          <span key={d} className="leader-digit">
            {d}
          </span>
        ))}
        <div className="leader-flash" />
      </div>
      <p className="presents">
        <span>Hardik Sharma</span>
        <span>presents</span>
      </p>
      <button type="button" className="intro-skip" onClick={skip}>
        Skip intro →
      </button>
    </div>
  );
}
