export const RESUME_DATA = {
  name: "Hardik Sharma",
  role: "Full-Stack Developer",
  email: "hardik9462@gmail.com",
  linkedin: "https://www.linkedin.com/in/hardik-sharma-a4293528b",
  github: "https://github.com/hardiksh28",
  twitter: "https://x.com/hardikhs2806",
  mobile: "+91-7597524070",
  summary:
    "Curious B.Tech Computer Science student who architects and ships full-stack web applications from scratch. I build secure, scalable systems using the MERN stack — complete with JWT authentication, RESTful APIs, and real-time features — driven entirely by self-initiative and a passion for writing production-ready code.",
  skills: [
    { category: "Frontend", items: ["HTML5", "CSS3", "JavaScript (ES6+)", "React.js", "Tailwind CSS"] },
    { category: "Backend", items: ["Node.js", "Express.js", "REST API Design", "JWT Auth"] },
    { category: "Database", items: ["MongoDB (Mongoose)", "JSON-based Persistence"] },
    { category: "Tooling", items: ["Git", "GitHub", "npm", "Postman", "Commander.js"] },
  ],
  projects: [
    {
      title: "ApplyJi",
      tech: "Next.js 14, Supabase, PostgreSQL, Claude AI, Chrome Extension, Lemon Squeezy",
      url: "https://applyji.online",
      description:
        "A free SaaS job-application tracker built solo from scratch — Kanban dashboard, a Chrome extension, and AI-powered Gmail sync that kills the spreadsheet for good.",
      highlights: [
        "Architected a multi-tenant PostgreSQL schema with Row Level Security, soft deletes, audit trails, and pg_cron cleanup on Supabase",
        "Built a Chrome Manifest V3 extension that flags already-applied jobs across LinkedIn, Indeed, Greenhouse & Lever with one-click save",
        "Integrated Anthropic Claude for server-side Gmail parsing — auto-detects interviews, offers, and rejections and updates status",
        "Shipped Lemon Squeezy billing (Merchant of Record) with idempotent webhooks, trials, and automatic US/CA/AU sales tax",
        "Designed a privacy-first stack: read-only Gmail, email bodies never stored, pgsodium field encryption, GDPR/CCPA deletion",
      ],
    },
    {
      title: "FocusForge",
      tech: "React.js, Node.js, Express.js, MongoDB, JWT, Tailwind CSS",
      url: "https://focus-forge-rose.vercel.app/",
      description:
        "A gamified platform that transforms tasks into rewarding 'quests' and enforces focus through an anti-cheat Pomodoro timer.",
      highlights: [
        "Full-stack MERN application with JWT-based authentication",
        "Strict server-side validation for time-tracking",
        "Optimized MongoDB schema for real-time leaderboard aggregations",
        "Pixel-perfect UI built from scratch without external component libraries",
      ],
    },
    {
      title: "Todo CLI",
      tech: "Node.js, JavaScript, Commander.js, Async File I/O",
      url: "",
      description:
        "A terminal-based task management application with a modular command-driven design.",
      highlights: [
        "Modular command-driven architecture with scalable argument parsing",
        "Optimized JSON state management for reliable task operations",
        "Storage abstraction layer for future database flexibility",
        "Maintainable, extensible CLI tool using Node.js core APIs",
      ],
    },
  ],
  experience: [
    {
      role: "Photography Head",
      org: "Maverick Club, JECRC",
      date: "2023 - Dec 2025",
      points: [
        "Led a team of 20 members across 25+ events",
        "Built team workflows from scratch—shoot schedules, editing pipelines, and review cycles",
      ],
    },
  ],
  education: [
    {
      degree: "B.Tech Computer Science & Engineering",
      inst: "Jaipur Engineering College & Research Center (JECRC)",
      date: "2023 - 2027",
      marks: "CGPA: 8.0 (expected)",
    },
  ],
};
