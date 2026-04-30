import type { AcademicProfile } from "./schema";

export const sampleAcademicProfile: AcademicProfile = {
  personal: {
    fullName: "Your Name",
    email: "you@university.edu",
    phone: "",
    location: "City, Country",
    address: "",
    nationality: "",
    linkedin: "",
    website: "",
    orcid: ""
  },
  application: {
    program: "M.Sc. Computer Science (example)",
    institution: "Example University",
    intakeTerm: "Fall 2026"
  },
  researchInterests: ["Machine learning systems", "Software architecture for scientific computing"],
  education: [
    {
      degree: "B.Sc. in Computer Engineering",
      field: "Computer Engineering",
      school: "Your University",
      location: "",
      start: "2019",
      end: "2023",
      gpa: "",
      honors: ["Dean's List"],
      year: "2023"
    }
  ],
  teaching: [],
  researchExperience: [],
  publications: [],
  presentations: [],
  projects: [
    {
      name: "Undergraduate thesis / capstone project",
      url: "",
      role: "Lead",
      technologies: ["Python", "PyTorch"],
      description: "Short description of research or engineering contribution.",
      bullets: ["Designed experiments and evaluated models on benchmark datasets."]
    }
  ],
  honors: ["Merit scholarship (example)"],
  grants: [],
  service: [],
  skills: {
    Programming: ["Python", "C++", "TypeScript"],
    Tools: ["Git", "LaTeX", "Linux"]
  },
  languages: ["English — professional working proficiency", "Persian — native"],
  standardizedTests: [],
  references: []
};
