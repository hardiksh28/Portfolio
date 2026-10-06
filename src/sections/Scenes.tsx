import posthog from "posthog-js";
import { ArrowUpRight, Github, Linkedin, Mail, Phone, Twitter } from "lucide-react";
import { RESUME_DATA as R } from "../data";
import { jumpTo, SCENES } from "../lib/cinema";
import ContactForm from "../components/ContactForm";

const scene = (id: string) => {
  const i = SCENES.findIndex((s) => s.id === id);
  return { id, "data-scene": i } as const;
};

function Slug({ id, label }: { id: string; label?: string }) {
  const s = SCENES.find((x) => x.id === id)!;
  return (
    <p className="slug" data-reveal>
      <span className="slug-no">Scene {s.no}</span>
      <span className="slug-line" />
      <span>{label ?? s.slug}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
export function Opening() {
  return (
    <section {...scene("opening")} className="scene opening">
      <p className="opening-kicker" data-hero>
        A Hardik Sharma production
      </p>
      <h1 className="opening-title" aria-label={R.name}>
        <span className="opening-line" data-hero-title>
          Hardik
        </span>
        <span className="opening-line opening-line--italic" data-hero-title>
          Sharma
        </span>
      </h1>
      <p className="opening-sub" data-hero>
        A full-stack story about taking ideas from a blank repo all the way to production.
      </p>
      <dl className="opening-meta" data-hero>
        <div>
          <dt>Genre</dt>
          <dd>{R.role}</dd>
        </div>
        <div>
          <dt>Filmed in</dt>
          <dd>Jaipur, India</dd>
        </div>
        <div>
          <dt>Now showing</dt>
          <dd>3 shipped projects</dd>
        </div>
      </dl>
      <button type="button" className="opening-cue" data-hero onClick={() => jumpTo("protagonist")}>
        <span className="opening-cue-line" />
        Scroll to roll film
      </button>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function Protagonist() {
  const socials = [
    { label: "GitHub", icon: Github, href: R.github, platform: "github" },
    { label: "LinkedIn", icon: Linkedin, href: R.linkedin, platform: "linkedin" },
    { label: "X / Twitter", icon: Twitter, href: R.twitter, platform: "twitter" },
  ];
  return (
    <section {...scene("protagonist")} className="scene scene--right protagonist">
      <div className="panel">
        <Slug id="protagonist" />
        <h2 className="h-scene" data-split>
          The <em>Protagonist</em>
        </h2>
        <p className="scrub-words" data-scrub-words>
          {R.summary}
        </p>
        <div className="cast" data-reveal>
          <p className="cast-label">Cast</p>
          <p className="cast-line">
            <strong>{R.name}</strong>
            <span className="cast-dots" />
            <span>as The Full-Stack Developer</span>
          </p>
          <ul className="tags">
            <li>MERN stack</li>
            <li>B.Tech CSE ’27</li>
            <li>Self-taught</li>
            <li>Ships solo</li>
          </ul>
        </div>
        <div className="contact-chips" data-reveal>
          <a href={`mailto:${R.email}`} className="chip">
            <Mail size={14} /> {R.email}
          </a>
          <a href={`tel:${R.mobile.replace(/[^+\d]/g, "")}`} className="chip">
            <Phone size={14} /> {R.mobile}
          </a>
        </div>
        <div className="socials" data-reveal>
          {socials.map((s) => (
            <a
              key={s.platform}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost"
              onClick={() => posthog.capture("social_link_clicked", { platform: s.platform })}
            >
              <s.icon size={15} /> {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function Arsenal() {
  return (
    <section {...scene("arsenal")} className="scene arsenal">
      <div className="arsenal-head">
        <Slug id="arsenal" />
        <h2 className="h-scene" data-split>
          The <em>Arsenal</em>
        </h2>
        <p className="lede" data-reveal>
          Every hero needs gear. These are the tools I use from the first commit to the final cut.
        </p>
      </div>
      <div className="arsenal-grid">
        {R.skills.map((g, i) => (
          <div key={g.category} className="arsenal-col" data-reveal>
            <p className="arsenal-cat">
              <span>0{i + 1}</span> {g.category}
            </p>
            <ul>
              {g.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
const REEL_SIDE = ["right", "left", "right"] as const;
const REEL_NUM = ["I", "II", "III"];

export function Work() {
  return (
    <>
      {R.projects.map((p, i) => (
        <section
          key={p.title}
          {...scene(`reel-${i + 1}`)}
          className={`scene scene--${REEL_SIDE[i]} reel`}
        >
          <div className="panel">
            <Slug id={`reel-${i + 1}`} label={`The Work — Reel ${REEL_NUM[i]}`} />
            <h2 className="h-reel" data-split>
              {p.title}
            </h2>
            <p className="logline" data-reveal>
              {p.description}
            </p>
            <div className="starring" data-reveal>
              <span className="starring-label">Starring</span>
              <ul className="tags">
                {p.tech.split(", ").map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <ol className="beats">
              {p.highlights.map((h, k) => (
                <li key={h} data-reveal>
                  <span className="beat-no">{String(k + 1).padStart(2, "0")}</span>
                  <span>{h}</span>
                </li>
              ))}
            </ol>
            <div data-reveal>
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--primary"
                  onClick={() => posthog.capture("project_viewed", { project: p.title })}
                >
                  Watch it live <ArrowUpRight size={16} />
                </a>
              ) : (
                <span className="btn btn--ghost btn--static">Terminal release · CLI</span>
              )}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
export function Origins() {
  return (
    <section {...scene("origins")} className="scene scene--left origins">
      <div className="panel">
        <Slug id="origins" />
        <h2 className="h-scene" data-split>
          <em>Origins</em>
        </h2>
        <p className="lede" data-reveal>
          Before the code, there was the camera.
        </p>
        <div className="timeline">
          {R.experience.map((e) => (
            <article key={e.role} className="tl-item" data-reveal>
              <p className="tl-date">{e.date}</p>
              <h3>{e.role}</h3>
              <p className="tl-org">{e.org}</p>
              <ul>
                {e.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </article>
          ))}
          {R.education.map((e) => (
            <article key={e.degree} className="tl-item" data-reveal>
              <p className="tl-date">{e.date}</p>
              <h3>{e.degree}</h3>
              <p className="tl-org">{e.inst}</p>
              <p className="tl-note">{e.marks}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
const CREDITS: [string, string][] = [
  ["Directed by", R.name],
  ["Written by", R.name],
  ["Produced by", R.name],
  ["Starring", "React · Node.js · Express · MongoDB"],
  ["Supporting cast", "Tailwind CSS · Supabase · PostgreSQL"],
  ["Cinematography", "three.js"],
  ["Motion", "GSAP"],
  ["Filmed on location", "Jaipur, India"],
];

export function Credits() {
  return (
    <section {...scene("credits")} className="scene credits-scene">
      <div className="credits" data-credits>
        <p className="credits-the-end">The End?</p>
        {CREDITS.map(([role, name]) => (
          <div key={role} className="credit">
            <span className="credit-role">{role}</span>
            <span className="credit-name">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Casting() {
  return (
    <section {...scene("casting")} className="scene scene--left casting">
      <div className="panel">
        <Slug id="casting" />
        <h2 className="h-scene" data-split>
          Now <em>casting.</em>
        </h2>
        <p className="lede" data-reveal>
          I'm open to collaborations and full-stack roles. Your project could be the sequel. Send me the script and
          it goes straight to my inbox.
        </p>
        <div data-reveal>
          <ContactForm />
        </div>
        <footer className="fin">
          <span>© {new Date().getFullYear()} {R.name}</span>
          <span>No developers were harmed in the making of this website.</span>
        </footer>
      </div>
    </section>
  );
}
