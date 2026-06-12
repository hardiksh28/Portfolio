import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import gsap from "gsap";
import posthog from "posthog-js";
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  ExternalLink,
  X,
  Swords,
  ScrollText,
  Backpack,
  UserRound,
  Send,
} from "lucide-react";
import { RESUME_DATA } from "../../game/data";
import type { Zone } from "../../game/world";
import type { CharacterDef } from "../../game/sprites";
import { PixelSprite } from "../PixelSprite";
import { sfx } from "../../game/sfx";

/* ------------------------------------------------------------------ */
/* Contact form — same API contract as before (/api/contact + posthog) */
/* ------------------------------------------------------------------ */
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [responseMsg, setResponseMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server responded with error:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        posthog.capture("contact_form_submitted", {
          subject: formData.subject,
          email: formData.email,
        });
        sfx.complete();
        setStatus("success");
        setResponseMsg(data.message);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setStatus("error");
      setResponseMsg(
        err instanceof Error
          ? `System error: ${err.message}`
          : "System error: Unable to dispatch inquiry. Please try again.",
      );
    }
  };

  if (status === "success") {
    return (
      <div className="panel-item raven-success">
        <div className="raven-success-icon">✉</div>
        <h3>RAVEN DISPATCHED!</h3>
        <p>{responseMsg}</p>
        <div className="raven-xp">+250 XP — CONNECTION UNLOCKED</div>
        <button type="button" className="pixel-btn" onClick={() => setStatus("idle")}>
          SEND ANOTHER
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="raven-form">
      <div className="raven-row">
        <label className="panel-item raven-field">
          <span>PLAYER NAME</span>
          <input
            required
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </label>
        <label className="panel-item raven-field">
          <span>RETURN ADDRESS (EMAIL)</span>
          <input
            required
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </label>
      </div>
      <label className="panel-item raven-field">
        <span>QUEST TITLE (SUBJECT)</span>
        <input
          required
          type="text"
          placeholder="Project Inquiry"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />
      </label>
      <label className="panel-item raven-field">
        <span>SCROLL CONTENTS (MESSAGE)</span>
        <textarea
          required
          rows={4}
          placeholder="How can I help you?"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </label>
      {status === "error" && <p className="raven-error">{responseMsg}</p>}
      <button
        disabled={status === "submitting"}
        type="submit"
        className="pixel-btn pixel-btn--primary panel-item"
      >
        <Send size={14} />
        {status === "submitting" ? "DISPATCHING RAVEN..." : "SEND MESSAGE"}
      </button>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Per-zone content                                                    */
/* ------------------------------------------------------------------ */
function AboutContent({ character }: { character: CharacterDef }) {
  const socials = [
    { label: "GitHub", icon: Github, href: RESUME_DATA.github, platform: "github" },
    { label: "LinkedIn", icon: Linkedin, href: RESUME_DATA.linkedin, platform: "linkedin" },
    { label: "Twitter / X", icon: Twitter, href: RESUME_DATA.twitter, platform: "twitter" },
  ];
  return (
    <div className="about-layout">
      <div className="panel-item about-card-player">
        <div className="about-avatar">
          <PixelSprite grid={character.idle} palette={character.palette} scale={6} />
        </div>
        <div className="about-id">
          <div className="about-name">{RESUME_DATA.name}</div>
          <div className="about-role">LV.20 — {RESUME_DATA.role}</div>
          <div className="about-tags">
            <span>MERN STACK</span>
            <span>B.TECH CSE</span>
            <span>SELF-TAUGHT</span>
          </div>
        </div>
      </div>

      <p className="panel-item about-summary">"{RESUME_DATA.summary}"</p>

      <div className="panel-item about-contacts">
        <a href={`mailto:${RESUME_DATA.email}`} className="about-contact-chip">
          <Mail size={14} /> {RESUME_DATA.email}
        </a>
        <span className="about-contact-chip">
          <Phone size={14} /> {RESUME_DATA.mobile}
        </span>
      </div>

      <div className="panel-item about-socials">
        {socials.map((s) => (
          <a
            key={s.platform}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="pixel-btn"
            onClick={() => posthog.capture("social_link_clicked", { platform: s.platform })}
          >
            <s.icon size={14} /> {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function SkillsContent() {
  return (
    <div className="skills-layout">
      <p className="panel-item panel-intro">
        Items collected on the journey so far. Equip freely — durability is infinite.
      </p>
      {RESUME_DATA.skills.map((group) => (
        <div key={group.category} className="panel-item skill-group">
          <div className="skill-group-head">
            <Backpack size={13} />
            <span>{group.category.toUpperCase()}</span>
            <em>{group.items.length} ITEMS</em>
          </div>
          <div className="skill-items">
            {group.items.map((item) => (
              <span key={item} className="skill-chip" onMouseEnter={() => sfx.hover()}>
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsContent() {
  return (
    <div className="projects-layout">
      <p className="panel-item panel-intro">
        Completed quests. Each one shipped end-to-end, from blank repo to deployment.
      </p>
      {RESUME_DATA.projects.map((p, idx) => (
        <article key={p.title} className="panel-item quest-card">
          <header className="quest-head">
            <div>
              <div className="quest-no">QUEST {String(idx + 1).padStart(2, "0")} — ★ COMPLETED</div>
              <h3 className="quest-title">{p.title}</h3>
            </div>
            {p.url ? (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="pixel-btn pixel-btn--small"
                onClick={() => posthog.capture("project_viewed", { project: p.title })}
              >
                <ExternalLink size={13} /> PLAY
              </a>
            ) : (
              <span className="quest-cli-badge">CLI BUILD</span>
            )}
          </header>
          <div className="quest-tech">
            {p.tech.split(", ").map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="quest-desc">{p.description}</p>
          <ul className="quest-points">
            {p.highlights.map((h) => (
              <li key={h}>
                <Swords size={12} /> <span>{h}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function HistoryContent() {
  return (
    <div className="history-layout">
      <p className="panel-item panel-intro">The adventure log — chapters written so far.</p>

      <div className="panel-item log-section-title">
        <ScrollText size={13} /> EXPERIENCE
      </div>
      {RESUME_DATA.experience.map((exp) => (
        <div key={exp.role} className="panel-item log-entry">
          <div className="log-entry-head">
            <h3>{exp.role}</h3>
            <span className="log-date">{exp.date}</span>
          </div>
          <div className="log-org">{exp.org}</div>
          <ul>
            {exp.points.map((pt) => (
              <li key={pt}>▸ {pt}</li>
            ))}
          </ul>
        </div>
      ))}

      <div className="panel-item log-section-title">
        <UserRound size={13} /> TRAINING GROUNDS
      </div>
      {RESUME_DATA.education.map((edu) => (
        <div key={edu.degree} className="panel-item log-entry">
          <div className="log-entry-head">
            <h3>{edu.degree}</h3>
            <span className="log-date">{edu.date}</span>
          </div>
          <div className="log-org">{edu.inst}</div>
          <div className="log-marks">{edu.marks}</div>
        </div>
      ))}
    </div>
  );
}

function ContactContent() {
  return (
    <div className="contact-layout">
      <p className="panel-item panel-intro">
        Open to collaborations and full-stack opportunities. Fill the scroll — the raven flies
        straight to my inbox.
      </p>
      <ContactForm />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel shell                                                         */
/* ------------------------------------------------------------------ */
export default function ZonePanel({
  zone,
  character,
  onClose,
}: {
  zone: Zone;
  character: CharacterDef;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    sfx.close();
    const root = rootRef.current;
    if (!root) return onClose();
    gsap
      .timeline({ onComplete: onClose })
      .to(root.querySelector(".panel-window"), {
        y: 26,
        opacity: 0,
        scale: 0.96,
        duration: 0.28,
        ease: "power2.in",
      })
      .to(root, { opacity: 0, duration: 0.2 }, "-=0.1");
  };

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.22 })
        .fromTo(
          ".panel-window",
          { y: 40, opacity: 0, scale: 0.94 },
          { y: 0, opacity: 1, scale: 1, duration: 0.42, ease: "back.out(1.4)" },
          "-=0.08",
        )
        .fromTo(
          ".panel-item",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power3.out" },
          "-=0.15",
        );
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="panel-scrim" data-ui="true" role="dialog" aria-modal="true" aria-label={zone.label}>
      <div className="panel-window" style={{ "--zone-color": zone.color } as CSSProperties}>
        <header className="panel-head">
          <div>
            <div className="panel-zone-sub">◆ {zone.sub.toUpperCase()}</div>
            <h2 className="panel-zone-title">{zone.label}</h2>
          </div>
          <button type="button" className="panel-close" onClick={close} aria-label="Close panel" autoFocus>
            <X size={16} />
          </button>
        </header>
        <div className="panel-body">
          {zone.id === "about" && <AboutContent character={character} />}
          {zone.id === "skills" && <SkillsContent />}
          {zone.id === "projects" && <ProjectsContent />}
          {zone.id === "history" && <HistoryContent />}
          {zone.id === "contact" && <ContactContent />}
        </div>
        <footer className="panel-foot">PRESS ESC TO RETURN TO THE WORLD</footer>
      </div>
    </div>
  );
}
