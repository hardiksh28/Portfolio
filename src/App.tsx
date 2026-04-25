/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, 
  Github, 
  Linkedin, 
  Twitter,
  Mail, 
  ExternalLink, 
  Code2, 
  Database, 
  Cpu, 
  Layout, 
  ChevronRight,
  User,
  Coffee,
  Briefcase
} from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import posthog from "posthog-js";

const RESUME_DATA = {
  name: "Hardik Sharma",
  role: "Full-Stack Developer",
  email: "hardik9462@gmail.com",
  linkedin: "https://www.linkedin.com/in/hardik-sharma-a4293528b",
  github: "https://github.com/hardiksh28",
  twitter: "https://x.com/hardikhs2806",
  mobile: "+91-7597524070",
  summary: "Curious B.Tech Computer Science student who architects and ships full-stack web applications from scratch. I build secure, scalable systems using the MERN stack — complete with JWT authentication, RESTful APIs, and real-time features — driven entirely by self-initiative and a passion for writing production-ready code.",
  skills: [
    { category: "Frontend", items: ["HTML5", "CSS3", "JavaScript (ES6+)", "React.js", "Tailwind CSS"] },
    { category: "Backend", items: ["Node.js", "Express.js", "REST API Design", "JWT Auth"] },
    { category: "Database", items: ["MongoDB (Mongoose)", "JSON-based Persistence"] },
    { category: "Tooling", items: ["Git", "GitHub", "npm", "Postman", "Commander.js"] }
  ],
  projects: [
    {
      title: "FocusForge",
      tech: "React.js, Node.js, Express.js, MongoDB, JWT, Tailwind CSS",
      url: "https://focus-forge-rose.vercel.app/",
      description: "A gamified platform that transforms tasks into rewarding 'quests' and enforces focus through an anti-cheat Pomodoro timer.",
      highlights: [
        "Full-stack MERN application with JWT-based authentication",
        "Strict server-side validation for time-tracking",
        "Optimized MongoDB schema for real-time leaderboard aggregations",
        "Pixel-perfect UI built from scratch without external component libraries"
      ]
    },
    {
      title: "Todo CLI",
      tech: "Node.js, JavaScript, Commander.js, Async File I/O",
      description: "A terminal-based task management application with a modular command-driven design.",
      highlights: [
        "Modular command-driven architecture with scalable argument parsing",
        "Optimized JSON state management for reliable task operations",
        "Storage abstraction layer for future database flexibility",
        "Maintainable, extensible CLI tool using Node.js core APIs"
      ]
    }
  ],
  experience: [
    {
      role: "Photography Head",
      org: "Maverick Club, JECRC",
      date: "2023 - Dec 2025",
      points: [
        "Led a team of 20 members across 25+ events",
        "Built team workflows from scratch—shoot schedules, editing pipelines, and review cycles"
      ]
    }
  ],
  education: [
    {
      degree: "B.Tech Computer Science & Engineering",
      inst: "Jaipur Engineering College & Research Center (JECRC)",
      date: "2023 - 2027",
      marks: "CGPA: 8.0 (expected)"
    }
  ]
};

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
        posthog.capture('contact_form_submitted', {
          subject: formData.subject,
          email: formData.email
        });
        setStatus("success");
        setResponseMsg(data.message);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setStatus("error");
      setResponseMsg(err instanceof Error ? `System error: ${err.message}` : "System error: Unable to dispatch inquiry. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col items-center justify-center text-center p-8 border border-arch-accent/20 bg-arch-accent/5"
      >
        <div className="w-16 h-16 border border-arch-accent flex items-center justify-center text-arch-accent mb-6">
          <ChevronRight size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter">Transmission Successful</h3>
        <p className="text-arch-muted max-w-sm">{responseMsg}</p>
        <button 
          onClick={() => setStatus("idle")}
          className="mt-8 text-xs font-bold uppercase tracking-widest text-arch-accent hover:underline"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-arch-muted tracking-widest">Name</label>
          <input 
            required
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-transparent border-b border-arch-border py-2 focus:border-arch-accent outline-none transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-arch-muted tracking-widest">Email</label>
          <input 
            required
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-transparent border-b border-arch-border py-2 focus:border-arch-accent outline-none transition-colors"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-arch-muted tracking-widest">Subject</label>
        <input 
          required
          type="text"
          placeholder="Project Inquiry"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full bg-transparent border-b border-arch-border py-2 focus:border-arch-accent outline-none transition-colors"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-arch-muted tracking-widest">Message</label>
        <textarea 
          required
          rows={4}
          placeholder="How can I help you?"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full bg-transparent border-b border-arch-border py-2 focus:border-arch-accent outline-none transition-colors resize-none"
        />
      </div>
      {status === "error" && <p className="text-red-500 text-xs">{responseMsg}</p>}
      <button 
        disabled={status === "submitting"}
        type="submit"
        className="group relative flex items-center gap-4 bg-arch-accent text-black px-8 py-4 font-black uppercase tracking-tighter hover:bg-white transition-all disabled:opacity-50"
      >
        {status === "submitting" ? "Dispatching..." : "Send Message"}
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
};

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {currentText}
      {index < text.length ? (
        <span className="animate-pulse">|</span>
      ) : (
        <motion.span 
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2.5 h-6 bg-terminal-green ml-1 align-middle"
        />
      )}
    </motion.span>
  );
};

const SectionHeader = ({ command, title }: { command: string; title: string }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 text-arch-accent text-xs font-bold uppercase tracking-tighter mb-2">
        <span className="block w-2 h-2 bg-arch-accent animate-pulse" />
        {command}
      </div>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
        {title}
      </h2>
    </div>
  );
};

const LoadingScreen = ({ onComplete }: { onComplete: () => void; key?: string }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 bg-arch-bg flex flex-col items-center justify-center p-8 font-mono"
    >
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-arch-accent font-black text-xs uppercase tracking-widest">System Initialization</div>
            <div className="text-arch-muted text-[10px]">AUTH_MODE: ARCHITECT_ROOT</div>
          </div>
          <div className="text-4xl font-black text-arch-accent">{Math.min(progress, 100)}%</div>
        </div>
        <div className="w-full h-1 bg-arch-border relative overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-arch-accent"
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-arch-muted uppercase tracking-tighter">
          <div>Fetching_Modules...</div>
          <div>Stack: MERN_PRODUCTION</div>
        </div>
      </div>
    </motion.div>
  );
};

const SideNav = () => {
  const sections = [
    { id: "about", label: "01", title: "About" },
    { id: "projects", label: "02", title: "Projects" },
    { id: "history", label: "03", title: "History" },
    { id: "contact", label: "04", title: "Contact" }
  ];

  const [activeId, setActiveId] = useState("about");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;

      // Special case for history: check if we are in either experience or education area
      const experienceEl = document.getElementById("history");
      const educationEl = document.getElementById("education-area");
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          
          // If checking history, also consider the height of the next section if it's tied
          let totalHeight = offsetHeight;
          if (section.id === "history" && educationEl) {
             totalHeight += educationEl.offsetHeight;
          }

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + totalHeight) {
            setActiveId(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="group flex items-center relative py-2"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(s.id);
            if (el) {
              const rect = el.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              window.scrollTo({
                top: rect.top + scrollTop - 100,
                behavior: "smooth"
              });
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 border transition-all duration-300 flex items-center justify-center font-mono text-[10px] font-bold
              ${activeId === s.id 
                ? 'bg-arch-accent border-arch-accent text-black scale-110 shadow-[0_0_15px_rgba(var(--arch-accent),0.3)]' 
                : 'bg-zinc-900/50 border-arch-border text-arch-muted hover:border-arch-accent hover:text-arch-accent'}`}>
              {s.label}
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 ${activeId === s.id ? 'w-24 opacity-100' : 'w-0 opacity-0 group-hover:w-24 group-hover:opacity-100'}`}>
              <span className="bg-arch-accent text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 ml-2 whitespace-nowrap block">
                {s.title}
              </span>
            </div>
          </div>
        </a>
      ))}
    </nav>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="min-h-screen bg-arch-bg text-arch-text selection:bg-arch-accent selection:text-black">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loader" onComplete={() => setIsLoading(false)} />
        ) : (
          <>
            <SideNav />
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="pt-12 pb-24 px-4 md:px-8"
            >
            <div className="max-w-7xl mx-auto">
              {/* Navigation / Header Area */}
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-arch-border pb-12 mb-12 gap-8">
                <div className="space-y-4">
                  <div className="text-arch-accent text-xs font-black tracking-widest uppercase mb-6 flex items-center gap-2">
                     <span className="inline-block w-4 h-0.5 bg-arch-accent"></span>
                     Deployment: Stable
                  </div>
                  <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
                    HARDIK<br />SHARMA
                  </h1>
                  <p className="text-xl md:text-2xl text-arch-muted max-w-xl font-medium leading-tight">
                    <TypewriterText text={RESUME_DATA.role} />
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-start md:items-end text-sm">
                  <a href={`mailto:${RESUME_DATA.email}`} className="hover:text-arch-accent transition-colors border-b border-transparent hover:border-arch-accent">{RESUME_DATA.email}</a>
                  <span className="text-arch-muted">{RESUME_DATA.mobile}</span>
                  <div className="flex gap-4 mt-4">
                    <a 
                      href={RESUME_DATA.linkedin} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-2 border border-arch-border hover:bg-arch-accent hover:text-black transition-all rounded" 
                      aria-label="LinkedIn"
                      onClick={() => posthog.capture('social_link_clicked', { platform: 'linkedin' })}
                    >
                      <Linkedin size={18} />
                    </a>
                    <a 
                      href={RESUME_DATA.github} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-2 border border-arch-border hover:bg-arch-accent hover:text-black transition-all rounded" 
                      aria-label="GitHub"
                      onClick={() => posthog.capture('social_link_clicked', { platform: 'github' })}
                    >
                      <Github size={18} />
                    </a>
                    <a 
                      href={RESUME_DATA.twitter} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-2 border border-arch-border hover:bg-arch-accent hover:text-black transition-all rounded" 
                      aria-label="Twitter/X"
                      onClick={() => posthog.capture('social_link_clicked', { platform: 'twitter' })}
                    >
                      <Twitter size={18} />
                    </a>
                  </div>
                </div>
              </header>

              {/* The Grid System */}
              <div className="arch-grid">
                {/* Summary */}
                <div id="about" className="arch-grid-item-full scroll-mt-24">
                  <SectionHeader command="01. About" title="The Philosophy" />
                  <p className="text-2xl md:text-3xl text-arch-muted leading-tight max-w-4xl italic">
                    "{RESUME_DATA.summary}"
                  </p>
                </div>

                {/* Skills Grid */}
                <div className="md:col-span-12 border-r border-b border-arch-border p-0 grid grid-cols-1 md:grid-cols-4">
                  {RESUME_DATA.skills.map((skillGroup, idx) => (
                    <div key={idx} className="p-8 border-r border-arch-border last:border-r-0 border-b md:border-b-0 border-arch-border">
                      <h3 className="text-arch-accent text-xs font-bold uppercase mb-6 tracking-widest">{skillGroup.category}</h3>
                      <ul className="space-y-3">
                        {skillGroup.items.map((item, i) => (
                          <li key={i} className="text-sm font-medium hover:text-arch-accent transition-colors cursor-default">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Projects */}
                <div id="projects" className="arch-grid-item-full scroll-mt-24">
                  <SectionHeader command="02. Core" title="Featured Systems" />
                </div>

                {RESUME_DATA.projects.map((project, idx) => (
                  <div key={idx} className="md:col-span-6 border-r border-b border-arch-border p-8 group hover:bg-zinc-900/40 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        {project.url ? (
                          <a href={project.url} target="_blank" rel="noreferrer" className="hover:text-arch-accent transition-colors">
                            <h3 className="text-2xl font-bold tracking-tight mb-1">{project.title}</h3>
                          </a>
                        ) : (
                          <h3 className="text-2xl font-bold tracking-tight mb-1">{project.title}</h3>
                        )}
                        <code className="text-xs text-arch-accent tracking-tighter">{project.tech}</code>
                      </div>
                      {project.url ? (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 border border-arch-border group-hover:border-arch-accent group-hover:text-arch-accent transition-colors"
                          onClick={() => posthog.capture('project_viewed', { project: project.title })}
                        >
                          <ExternalLink size={20} />
                        </a>
                      ) : (
                        <div className="p-2 border border-arch-border group-hover:border-arch-muted transition-colors opacity-30">
                          <ExternalLink size={20} />
                        </div>
                      )}
                    </div>
                    <p className="text-arch-muted mb-8 text-lg leading-relaxed">
                      {project.description}
                    </p>
                    <ul className="space-y-4">
                      {project.highlights.map((point, i) => (
                        <li key={i} className="flex gap-4 text-sm text-arch-text/80">
                          <span className="text-arch-accent font-bold">/</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Experience & Education Mixed */}
                <div id="history" className="md:col-span-8 border-r border-b border-arch-border p-8 scroll-mt-24">
                  <SectionHeader command="03. History" title="Professional Experience" />
                  <div className="space-y-12 mt-12">
                    {RESUME_DATA.experience.map((exp, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between items-baseline mb-4">
                          <h3 className="text-2xl font-bold">{exp.role}</h3>
                          <span className="text-xs font-mono text-arch-muted">{exp.date}</span>
                        </div>
                        <p className="text-arch-accent mb-4 tracking-widest uppercase text-xs font-black">{exp.org}</p>
                        <ul className="space-y-4">
                          {exp.points.map((point, i) => (
                            <li key={i} className="flex gap-4 text-arch-muted text-sm leading-relaxed">
                              <span className="text-arch-border">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div id="education-area" className="md:col-span-4 border-r border-b border-arch-border p-8 bg-zinc-900/10 scroll-mt-24">
                  <SectionHeader command="03. Path" title="Academic Path" />
                  <div className="space-y-8 mt-12">
                    {RESUME_DATA.education.map((edu, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="text-xs text-arch-muted">{edu.date}</div>
                        <h4 className="text-xl font-bold tracking-tight">{edu.degree}</h4>
                        <p className="text-sm text-arch-muted">{edu.inst}</p>
                        <div className="pt-2 text-arch-accent font-black text-sm uppercase">{edu.marks}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Section */}
                <div id="contact" className="md:col-span-12 border-r border-b border-arch-border p-0 scroll-mt-24">
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    <div className="md:col-span-4 p-8 border-r border-arch-border">
                      <SectionHeader command="04. Contact" title="Get In Touch" />
                      <p className="text-arch-muted mb-8 text-lg mt-12">
                        Currently open to collaborations and full-stack opportunities. Drop a message to start a conversation.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border border-arch-border flex items-center justify-center text-arch-accent"><Mail size={14} /></div>
                          <span className="text-sm">{RESUME_DATA.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border border-arch-border flex items-center justify-center text-arch-accent"><Terminal size={14} /></div>
                          <span className="text-sm">{RESUME_DATA.mobile}</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-8 p-8">
                      <ContactForm />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Area */}
              <footer className="mt-24 pt-12 border-t border-arch-border flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border border-arch-border flex items-center justify-center text-arch-accent">
                    <Terminal size={24} />
                  </div>
                  <div className="text-xs text-arch-muted leading-tight">
                    SYSTEM TIME: {new Date().toLocaleTimeString()}<br />
                    TCP/IP STACK INJECTED<br />
                    PORTFOLIO.ARC V2.0
                  </div>
                </div>
              </footer>
            </div>
            
            {/* Decorative architectural background */}
            <div className="fixed inset-0 -z-10 bg-arch-bg pointer-events-none overflow-hidden">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-arch-accent/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-arch-accent/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

