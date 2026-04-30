import type { ResumeProfile } from "./schema";

export const sampleResumeProfile: ResumeProfile = {
  personal: {
    fullName: "Kamran Hadadmarandi",
    headline: "Software Architect | Technical Lead | Fintech & Enterprise Systems",
    location: "Tehran, Iran",
    address: "Tehran, Iran",
    nationality: "Iranian",
    phone: "+98 912 471 8227",
    email: "kamihadad@gmail.com",
    linkedin: "https://www.linkedin.com/in/kamran-hadad-marandi-995aa7162",
    github: "https://github.com/kamihadadg",
    website: "https://kamihadad.com"
  },
  target: {
    country: "Netherlands",
    relocationLine: "Open to relocate with employer sponsorship",
    permitLine: "I am open to relocating with my family and would require employer sponsorship through the appropriate skilled migration route.",
    availability: "Available for remote interviews; relocation timeline negotiable",
    preferredLocations: ["Amsterdam", "Rotterdam", "Eindhoven", "Utrecht", "Remote / Hybrid"],
    targetRoles: ["Software Architect", "Solution Architect", "Technical Lead", "Backend Architect", "Platform Architect", "Engineering Manager", "Senior Backend Engineer"]
  },
  summary: [
    "Software Architect and Technical Lead with 20+ years of experience designing, modernizing, and operating fintech, AI-enabled, and enterprise software platforms.",
    "Specialized in transforming legacy systems into scalable service-oriented and cloud-ready architectures using Node.js, TypeScript, Python, React, SQL, Docker, and Linux-based infrastructure."
  ],
  skills: {
    Languages: ["Node.js", "TypeScript", "JavaScript", "Python", "SQL"],
    Backend: ["NestJS", "FastAPI", "Flask", "REST APIs", "Authentication", "Authorization"],
    Frontend: ["React", "Modern Web Applications"],
    Architecture: ["Microservices", "Service-Oriented Architecture", "Distributed Systems", "Event-Driven Architecture", "Legacy Modernization"],
    "DevOps & Infrastructure": ["Docker", "Linux", "Nginx", "Cloudflare", "VMware ESXi", "Veeam Replication"],
    "Data & BI": ["MSSQL", "PostgreSQL", "Database Optimization", "Power BI", "QlikView", "SSRS"],
    "AI & Automation": ["Production AI Integration", "Applied Machine Learning R&D", "LLM-Assisted Software Development"],
    Leadership: ["Engineering Leadership", "Team Scaling", "Agile/Scrum", "Stakeholder Communication"]
  },
  experience: [
    {
      company: "Karafarin Exchange",
      location: "Tehran, Iran",
      title: "Lead Software Architect / IT Manager",
      employmentType: "Full-time",
      start: "Sep 2021",
      end: "Present",
      technologies: ["Node.js", "React", "MSSQL", "Docker", "Nginx", "Cloudflare", "VMware ESXi"],
      bullets: [
        "Architected and delivered a modern foreign exchange platform supporting high-volume financial operations.",
        "Led the modernization of a 19-year-old Delphi/MSSQL legacy system into a scalable Node.js and React-based service-oriented platform with zero downtime.",
        "Designed and implemented high-availability backend services for financial operations, achieving 99.9% uptime.",
        "Improved response times and operational performance through database optimization, backend redesign, and infrastructure tuning.",
        "Designed and managed production infrastructure using Docker, Nginx, Cloudflare, Linux, VMware ESXi, and Veeam-based disaster recovery."
      ]
    },
    {
      company: "Royal Pioneer East",
      location: "Tehran, Iran",
      title: "IT Manager",
      employmentType: "Full-time",
      start: "Sep 2011",
      end: "Sep 2021",
      technologies: ["Power BI", "QlikView", "MSSQL", "Network Infrastructure", "ERP Systems"],
      bullets: [
        "Managed enterprise IT infrastructure, networks, systems, and security across multi-branch operations.",
        "Designed and developed business-critical software systems for accounting, inventory, sales, and operational workflows.",
        "Built real-time BI dashboards using Power BI and QlikView for management reporting and operational visibility.",
        "Increased operational efficiency by 35% through system redesign, process automation, and database optimization."
      ]
    }
  ],
  projects: [
    {
      name: "KAM Ecosystem",
      url: "https://kamihadad.com",
      role: "Founder / Architect / Full-stack Developer",
      technologies: ["Node.js", "TypeScript", "React", "Python", "MQTT", "AI/ML"],
      description: "A suite of AI, fintech, and IoT platforms designed around scalable software architecture, intelligent automation, and real-time operations.",
      bullets: [
        "AI-powered support system with intelligent ticket routing, SLA management, support automation, and operational reporting.",
        "Smart portfolio analysis platform with portfolio analytics and machine learning models for financial decision support.",
        "IoT device monitoring platform using MQTT, ESP32, and embedded systems.",
        "Digital exchange platform with order management, wallet systems, secure financial workflows, and backend service architecture."
      ]
    }
  ],
  education: [
    {
      degree: "B.Sc. in Computer Engineering",
      field: "Computer Hardware Engineering",
      school: "Islamic Azad University",
      location: "Iran",
      start: "",
      end: "2003",
      gpa: "12/20",
      honors: [],
      year: "2003"
    }
  ],
  certifications: [],
  awards: [],
  publications: [],
  patents: [],
  volunteer: [],
  languages: ["Persian: Native", "English: Professional Working Proficiency", "Turkish: Fluent"],
  coverLetter: {
    greeting: "Dear Hiring Manager,",
    opening: "I am writing to express my interest in Software Architect, Technical Lead, Solution Architect, and senior backend/platform engineering opportunities.",
    closing: "Thank you for your time and consideration. I would welcome the opportunity to discuss how my experience can contribute to your engineering organization."
  }
};
