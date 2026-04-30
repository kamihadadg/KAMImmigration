import "server-only";

import { getDb } from "./db";

export type ResumeTarget = {
  type: string;
  name: string;
  url: string;
  email: string;
  location: string;
  notes: string;
  tags: string[];
};

export type ResumeTargetList = {
  country: string;
  targets: ResumeTarget[];
  updatedAt: string;
};

/** Same row shape as work targets; `type` is often "University" or "Graduate school". */
export type UniversityTargetList = {
  country: string;
  field: string;
  targets: ResumeTarget[];
  updatedAt: string;
};

const defaultTargetLists: Array<{ country: string; targets: ResumeTarget[] }> = [
  {
    country: "Netherlands",
    targets: [
      {
        type: "Recruiter",
        name: "Hays Netherlands - IT",
        url: "https://www.hays.nl/en/job-sectors/technology",
        email: "",
        location: "Amsterdam / Netherlands",
        notes: "Useful for senior technology, software architecture, and IT leadership roles.",
        tags: ["recruiter", "technology", "senior roles"]
      },
      {
        type: "Recruiter",
        name: "Michael Page Netherlands - Technology",
        url: "https://www.michaelpage.nl/en/jobs/technology",
        email: "",
        location: "Netherlands",
        notes: "Search and apply for technology leadership and software roles.",
        tags: ["recruiter", "technology"]
      },
      {
        type: "Job Board",
        name: "LinkedIn Jobs Netherlands",
        url: "https://www.linkedin.com/jobs/search/?location=Netherlands&keywords=Software%20Architect",
        email: "",
        location: "Netherlands",
        notes: "Use targeted searches for Software Architect, Technical Lead, and Backend Architect.",
        tags: ["job board", "software architect"]
      },
      {
        type: "Job Board",
        name: "IamExpat Jobs",
        url: "https://www.iamexpat.nl/career/jobs-netherlands",
        email: "",
        location: "Netherlands",
        notes: "International-friendly job board with English-language roles.",
        tags: ["job board", "expat"]
      },
      {
        type: "Company",
        name: "Booking.com Careers",
        url: "https://careers.booking.com/",
        email: "",
        location: "Amsterdam",
        notes: "Large international tech employer. Watch architecture, platform, and backend roles.",
        tags: ["company", "tech", "platform"]
      }
    ]
  },
  {
    country: "Canada",
    targets: [
      {
        type: "Recruiter",
        name: "Robert Half Canada - Technology",
        url: "https://www.roberthalf.com/ca/en/jobs/technology",
        email: "",
        location: "Canada",
        notes: "Technology recruitment across Canadian provinces.",
        tags: ["recruiter", "technology"]
      },
      {
        type: "Recruiter",
        name: "Hays Canada - Technology",
        url: "https://www.hays.ca/technology",
        email: "",
        location: "Canada",
        notes: "Useful for senior IT, architecture, and infrastructure roles.",
        tags: ["recruiter", "technology", "senior roles"]
      },
      {
        type: "Job Board",
        name: "Job Bank Canada",
        url: "https://www.jobbank.gc.ca/",
        email: "",
        location: "Canada",
        notes: "Official Canadian job board. Search by NOC/role and province.",
        tags: ["job board", "official"]
      },
      {
        type: "Job Board",
        name: "LinkedIn Jobs Canada",
        url: "https://www.linkedin.com/jobs/search/?location=Canada&keywords=Software%20Architect",
        email: "",
        location: "Canada",
        notes: "Use searches for Software Architect, Technical Lead, Backend Architect, and Engineering Manager.",
        tags: ["job board", "software architect"]
      },
      {
        type: "Company",
        name: "Shopify Careers",
        url: "https://www.shopify.com/careers",
        email: "",
        location: "Canada / Remote",
        notes: "Watch senior backend, platform, architecture, and engineering leadership roles.",
        tags: ["company", "remote", "platform"]
      }
    ]
  },
  {
    country: "United States",
    targets: [
      {
        type: "Recruiter",
        name: "Robert Half — Technology & IT staffing",
        url: "https://www.roberthalf.com/us/en/jobs/technology",
        email: "",
        location: "United States",
        notes: "National technology and IT contract / permanent placement; filter by metro and seniority.",
        tags: ["recruiter", "technology", "US"]
      },
      {
        type: "Recruiter",
        name: "Hays US — Technology",
        url: "https://www.hays.com/us/technology",
        email: "",
        location: "United States",
        notes: "Enterprise and senior engineering roles; useful for architecture and leadership searches.",
        tags: ["recruiter", "technology"]
      },
      {
        type: "Job Board",
        name: "LinkedIn Jobs — United States",
        url: "https://www.linkedin.com/jobs/search/?location=United%20States&keywords=Software%20Architect",
        email: "",
        location: "United States",
        notes: "Broad coverage; combine keywords (Staff Engineer, Principal, Architect) with visa filter if needed.",
        tags: ["job board", "LinkedIn"]
      },
      {
        type: "Job Board",
        name: "Indeed — US technology jobs",
        url: "https://www.indeed.com/",
        email: "",
        location: "United States",
        notes: "High volume; refine by salary estimate, remote, and company size.",
        tags: ["job board", "Indeed"]
      },
      {
        type: "Job Board",
        name: "Built In — US tech hubs",
        url: "https://builtin.com/jobs",
        email: "",
        location: "US tech cities",
        notes: "Startup and scale-up heavy; good for senior IC and lead roles in SF, NYC, Austin, Seattle, etc.",
        tags: ["job board", "startups"]
      },
      {
        type: "Company",
        name: "Amazon Jobs (US)",
        url: "https://www.amazon.jobs/en/search?base_query=&loc_query=United+States",
        email: "",
        location: "United States / Remote",
        notes: "Large pipeline for SDE, systems, and principal engineer levels; check team and org before applying.",
        tags: ["company", "FAANG", "scale"]
      }
    ]
  },
  {
    country: "United Kingdom",
    targets: [
      {
        type: "Recruiter",
        name: "Hays UK — Technology",
        url: "https://www.hays.co.uk/job/technology-jobs",
        email: "",
        location: "United Kingdom",
        notes: "Permanent and contract IT leadership across England, Scotland, Wales, and NI.",
        tags: ["recruiter", "technology", "UK"]
      },
      {
        type: "Recruiter",
        name: "Michael Page UK — Technology",
        url: "https://www.michaelpage.co.uk/job-detail/technology",
        email: "",
        location: "United Kingdom",
        notes: "Architecture, engineering management, and senior developer roles nationwide.",
        tags: ["recruiter", "technology"]
      },
      {
        type: "Job Board",
        name: "LinkedIn Jobs — United Kingdom",
        url: "https://www.linkedin.com/jobs/search/?location=United%20Kingdom&keywords=Software%20Architect",
        email: "",
        location: "United Kingdom",
        notes: "Skilled Worker visa sponsorship sometimes flagged in listings — verify with employer.",
        tags: ["job board", "visa"]
      },
      {
        type: "Job Board",
        name: "Reed.co.uk — IT & technology",
        url: "https://www.reed.co.uk/jobs/it-jobs",
        email: "",
        location: "United Kingdom",
        notes: "Large UK-specific board; good for London, Manchester, Edinburgh, and remote UK.",
        tags: ["job board", "UK"]
      },
      {
        type: "Job Board",
        name: "CWJobs — technology careers",
        url: "https://www.cwjobs.co.uk/",
        email: "",
        location: "United Kingdom",
        notes: "Contract-heavy market; useful for day-rate and inside-IR35 awareness.",
        tags: ["job board", "contract"]
      },
      {
        type: "Company",
        name: "ARM Careers",
        url: "https://careers.arm.com/",
        email: "",
        location: "Cambridge / UK-wide",
        notes: "Semiconductor and software platforms; strong for low-level systems and architecture adjacent roles.",
        tags: ["company", "semiconductor", "Cambridge"]
      }
    ]
  },
  {
    country: "Germany",
    targets: [
      {
        type: "Recruiter",
        name: "Hays Germany — IT & Engineering",
        url: "https://www.hays.de/jobs/it-und-technik",
        email: "",
        location: "Germany",
        notes: "English and German roles; Berlin, Munich, Frankfurt, and Hamburg hubs.",
        tags: ["recruiter", "technology", "Germany"]
      },
      {
        type: "Job Board",
        name: "StepStone — IT jobs Germany",
        url: "https://www.stepstone.de/",
        email: "",
        location: "Germany",
        notes: "Leading German-language board; use English keywords and filters for international employers.",
        tags: ["job board", "StepStone"]
      },
      {
        type: "Job Board",
        name: "LinkedIn Jobs — Germany",
        url: "https://www.linkedin.com/jobs/search/?location=Germany&keywords=Software%20Architect",
        email: "",
        location: "Germany",
        notes: "Mix of startups and Mittelstand; Blue Card eligibility often mentioned for non-EU candidates.",
        tags: ["job board", "Blue Card"]
      },
      {
        type: "Job Board",
        name: "XING Jobs",
        url: "https://www.xing.com/jobs",
        email: "",
        location: "Germany / DACH",
        notes: "DACH-focused professional network; strong for German-speaking applicants.",
        tags: ["job board", "DACH"]
      },
      {
        type: "Company",
        name: "SAP Careers",
        url: "https://jobs.sap.com/",
        email: "",
        location: "Walldorf / Germany / Remote",
        notes: "Enterprise software; cloud platform, architecture, and engineering leadership roles.",
        tags: ["company", "enterprise", "Germany"]
      },
      {
        type: "Company",
        name: "Siemens Careers",
        url: "https://jobs.siemens.com/",
        email: "",
        location: "Germany / Global",
        notes: "Industrial software, automation, and digital industries — relevant for embedded and systems architects.",
        tags: ["company", "industrial", "Germany"]
      }
    ]
  }
];

const defaultUniversityTargetLists: Array<{ country: string; field: string; targets: ResumeTarget[] }> = [
  {
    country: "Netherlands",
    field: "Computer Science & Engineering",
    targets: [
      {
        type: "University",
        name: "TU Delft — MSc Computer Science & Engineering",
        url: "https://www.tudelft.nl/en/education/programmes/masters/cs/msc-computer-science",
        email: "",
        location: "Delft",
        notes:
          "QS World University Rankings (indicative): top ~50 worldwide. Strong systems, HCI, and software engineering tracks; check English quotas and two annual intakes.",
        tags: ["MSc", "QS top ~50", "research university", "English"]
      },
      {
        type: "University",
        name: "University of Amsterdam — MSc Software Engineering / AI",
        url: "https://www.uva.nl/en/programmes/masters/software-engineering/software-engineering.html",
        email: "",
        location: "Amsterdam",
        notes: "QS (indicative): top ~55 worldwide. Faculty of Science; verify selection/numerus fixus for specific programmes.",
        tags: ["MSc", "QS top ~60", "English"]
      },
      {
        type: "University",
        name: "Eindhoven University of Technology (TU/e) — CS & graduate admissions",
        url: "https://www.tue.nl/en/education/become-a-student/admission-and-enrollment/",
        email: "",
        location: "Eindhoven",
        notes: "QS (indicative): top ~150 worldwide. High-tech Brainport region; many English-taught MSc programmes in CS-related fields.",
        tags: ["MSc", "QS top ~150", "technical university"]
      },
      {
        type: "University",
        name: "University of Twente — MSc Computer Science",
        url: "https://www.utwente.nl/en/education/master/programmes/computer-science/",
        email: "",
        location: "Enschede",
        notes: "QS (indicative): top ~250 worldwide. Campus university; strong security and software engineering profile.",
        tags: ["MSc", "English"]
      },
      {
        type: "University",
        name: "Utrecht University — Graduate School of Natural Sciences (CS-related MSc)",
        url: "https://www.uu.nl/en/masters",
        email: "",
        location: "Utrecht",
        notes: "QS (indicative): top ~100 worldwide. Browse Computing Sciences and interdisciplinary data / AI masters.",
        tags: ["MSc", "QS top ~100", "research"]
      },
      {
        type: "University",
        name: "Leiden University — LIACS (MSc Computer Science)",
        url: "https://www.universiteitleiden.nl/en/education/study-programmes/master",
        email: "",
        location: "Leiden",
        notes: "QS (indicative): top ~80 worldwide. LIACS for CS and AI-oriented programmes.",
        tags: ["MSc", "QS top ~80"]
      },
      {
        type: "University",
        name: "Vrije Universiteit Amsterdam (VU) — MSc Computer Science",
        url: "https://vu.nl/en/education/master/computer-science",
        email: "",
        location: "Amsterdam",
        notes: "QS (indicative): top ~200 worldwide. Joint degrees with UvA possible for some tracks — read programme pages.",
        tags: ["MSc", "English"]
      },
      {
        type: "University",
        name: "Radboud University Nijmegen — Institute for Computing and Information Sciences (iCIS)",
        url: "https://www.ru.nl/icis/",
        email: "",
        location: "Nijmegen",
        notes: "QS (indicative): top ~200 worldwide. Research-oriented MSc in Computer Science and AI specialisations.",
        tags: ["MSc", "research"]
      },
      {
        type: "University",
        name: "University of Groningen — MSc Computing Science",
        url: "https://www.rug.nl/masters/computing-science/",
        email: "",
        location: "Groningen",
        notes: "QS (indicative): top ~150 worldwide. Affordable student city; strong CS, computational intelligence, and HPC groups.",
        tags: ["MSc", "QS top ~150", "English"]
      }
    ]
  },
  {
    country: "Netherlands",
    field: "Business & MBA",
    targets: [
      {
        type: "Business school",
        name: "Rotterdam School of Management (RSM) — MSc / MBA",
        url: "https://www.rsm.nl/education/",
        email: "",
        location: "Rotterdam",
        notes:
          "Erasmus University QS (indicative): top ~150 worldwide; RSM triple accredited (AACSB, EQUIS, AMBA). GMAT/GRE and English tests typical.",
        tags: ["MBA", "MSc", "QS parent ~150", "triple accredited"]
      },
      {
        type: "University",
        name: "University of Amsterdam — Amsterdam Business School (ABS)",
        url: "https://www.uva.nl/en/about-the-uva/faculties/amsterdam-business-school/amsterdam-business-school.html",
        email: "",
        location: "Amsterdam",
        notes: "QS (indicative): top ~55 worldwide for parent university. MSc Finance, Business Administration, and MBA tracks.",
        tags: ["MSc", "MBA", "QS top ~60"]
      },
      {
        type: "University",
        name: "Maastricht University — School of Business and Economics (SBE)",
        url: "https://www.maastrichtuniversity.nl/education",
        email: "",
        location: "Maastricht",
        notes: "QS (indicative): top ~200 worldwide. Problem-based learning; strong international business MSc portfolio.",
        tags: ["MSc", "business", "international"]
      },
      {
        type: "University",
        name: "Tilburg University — School of Economics and Management (TiSEM)",
        url: "https://www.tilburguniversity.edu/education/masters-programmes",
        email: "",
        location: "Tilburg",
        notes: "QS (indicative): top ~350 worldwide; economics and econometrics historically very strong in Europe.",
        tags: ["MSc", "economics"]
      },
      {
        type: "Business school",
        name: "Nyenrode Business University",
        url: "https://www.nyenrode.nl/",
        email: "",
        location: "Breukelen",
        notes: "Private Dutch university; MBA and executive programmes with corporate network focus.",
        tags: ["MBA", "executive"]
      },
      {
        type: "University",
        name: "University of Groningen — Faculty of Economics and Business (FEB)",
        url: "https://www.rug.nl/feb/education/",
        email: "",
        location: "Groningen",
        notes: "QS (indicative): top ~150 worldwide. Research MSc in economics, finance, and international business.",
        tags: ["MSc", "QS top ~150"]
      }
    ]
  },
  {
    country: "Netherlands",
    field: "Food Science & Food Technology",
    targets: [
      {
        type: "University",
        name: "Wageningen University & Research — MSc Food Technology",
        url: "https://www.wur.nl/en/education-programmes/master/food-technology.htm",
        email: "",
        location: "Wageningen",
        notes:
          "QS Agriculture & Forestry often ranked #1 worldwide; overall university QS (indicative): top ~150. Flagship for food science, product design, and safety.",
        tags: ["MSc", "food science", "QS ag #1", "English"]
      },
      {
        type: "University",
        name: "Wageningen University & Research — MSc Food Safety",
        url: "https://www.wur.nl/en/education-programmes/master/food-safety.htm",
        email: "",
        location: "Wageningen",
        notes: "Joint programme options with partner universities in EU; strong regulatory and microbiology focus.",
        tags: ["MSc", "food safety", "English"]
      },
      {
        type: "University of applied sciences",
        name: "HAS green academy — Food Innovation / Food Technology (BSc; pathways to industry)",
        url: "https://www.has.nl/en/",
        email: "",
        location: "'s-Hertogenbosch / Venlo",
        notes: "Applied sciences; practical food innovation, agri-food chain, and entrepreneurship — compare with research MSc at WUR.",
        tags: ["applied", "food innovation"]
      },
      {
        type: "University",
        name: "University of Amsterdam — MSc Chemistry (food / analytical tracks)",
        url: "https://www.uva.nl/en/programmes/masters/chemistry/chemistry.html",
        email: "",
        location: "Amsterdam",
        notes: "QS (indicative): top ~55 worldwide. Analytical and molecular science routes relevant to food R&D and quality labs.",
        tags: ["MSc", "chemistry", "QS top ~60"]
      },
      {
        type: "University",
        name: "Delft University of Technology — Process & Energy (food-relevant process engineering)",
        url: "https://www.tudelft.nl/en/education/programmes/masters",
        email: "",
        location: "Delft",
        notes: "QS (indicative): top ~50 worldwide. Look for Chemical Engineering / Bioprocess tracks touching food process design.",
        tags: ["MSc", "process engineering", "QS top ~50"]
      },
      {
        type: "University",
        name: "Utrecht University — Graduate School of Life Sciences (food-related MSc)",
        url: "https://www.uu.nl/en/masters",
        email: "",
        location: "Utrecht",
        notes: "QS (indicative): top ~100 worldwide. Science for Sustainable Foods, Biology of Food-associated Microbes, and related tracks.",
        tags: ["MSc", "life sciences", "QS top ~100"]
      },
      {
        type: "University of applied sciences",
        name: "HZ University of Applied Sciences — Food Technology",
        url: "https://www.hz.nl/en/programmes/food-technology",
        email: "",
        location: "Vlissingen",
        notes: "Applied BSc/MSc routes; dairy technology, fermentation, and coastal food value chains — verify English intake per year.",
        tags: ["applied", "food technology", "Zeeland"]
      },
      {
        type: "University",
        name: "Wageningen University & Research — MSc Food Quality Management",
        url: "https://www.wur.nl/en/education-programmes/master/food-quality-management.htm",
        email: "",
        location: "Wageningen",
        notes: "Links quality assurance, supply chain, and consumer science; pairs well with EU food law coursework.",
        tags: ["MSc", "quality", "supply chain"]
      },
      {
        type: "Research institute",
        name: "NIZO food research — careers & collaboration (industry-linked R&D)",
        url: "https://www.nizo.com/",
        email: "",
        location: "Ede",
        notes: "Not a degree-granting university; world-class contract research for dairy, ingredients, and sensory science — useful for internship targets.",
        tags: ["R&D", "industry", "internship"]
      }
    ]
  },
  {
    country: "Canada",
    field: "Computer Science & Engineering",
    targets: [
      {
        type: "University",
        name: "University of Toronto — School of Graduate Studies (CS / ECE)",
        url: "https://www.sgs.utoronto.ca/",
        email: "",
        location: "Toronto, ON",
        notes: "QS (indicative): top ~25 worldwide. Extremely competitive MSc/PhD; align with faculty research before applying.",
        tags: ["graduate", "QS top ~25", "research"]
      },
      {
        type: "University",
        name: "University of British Columbia — Faculty of Graduate Studies",
        url: "https://www.grad.ubc.ca/",
        email: "",
        location: "Vancouver / Kelowna, BC",
        notes: "QS (indicative): top ~40 worldwide. Departmental deadlines for CS / ECE; funding packages vary by supervisor.",
        tags: ["graduate", "QS top ~40"]
      },
      {
        type: "University",
        name: "McGill University — Graduate and Postdoctoral Studies",
        url: "https://www.mcgill.ca/gps/",
        email: "",
        location: "Montreal, QC",
        notes: "QS (indicative): top ~30 worldwide. School of Computer Science; bilingual context in Montreal outside campus life.",
        tags: ["graduate", "QS top ~30", "Quebec"]
      },
      {
        type: "University",
        name: "University of Waterloo — Future graduate students",
        url: "https://uwaterloo.ca/future-graduate-students/",
        email: "",
        location: "Waterloo, ON",
        notes: "QS (indicative): top ~115 worldwide. Famous for co-op; Cheriton School of Computer Science.",
        tags: ["MSc", "PhD", "co-op", "CS"]
      },
      {
        type: "University",
        name: "University of Alberta — Faculty of Graduate Studies (Computing Science)",
        url: "https://www.ualberta.ca/graduate-studies/",
        email: "",
        location: "Edmonton, AB",
        notes: "QS (indicative): top ~100 worldwide. Strong AI institute (Amii) links for thesis-based programmes.",
        tags: ["graduate", "AI", "QS top ~100"]
      },
      {
        type: "University",
        name: "Université de Montréal — MILA / DIRO (graduate CS)",
        url: "https://admission.umontreal.ca/en/programs/",
        email: "",
        location: "Montreal, QC",
        notes: "QS (indicative): top ~150 worldwide. French-language programmes common; verify English options at DIRO/MILA.",
        tags: ["graduate", "AI", "French/English"]
      },
      {
        type: "University",
        name: "Simon Fraser University — School of Computing Science (grad)",
        url: "https://www.sfu.ca/computing/prospective-students/graduate-students.html",
        email: "",
        location: "Burnaby, BC",
        notes: "QS (indicative): top ~350 worldwide; respected in Canada for HCI, graphics, and systems.",
        tags: ["MSc", "PhD", "BC"]
      },
      {
        type: "University",
        name: "Queen's University — School of Computing (graduate)",
        url: "https://www.queensu.ca/school-of-computing/",
        email: "",
        location: "Kingston, ON",
        notes: "QS (indicative): top ~200 worldwide. Smaller cohorts; strong undergraduate-to-graduate pipeline.",
        tags: ["MSc", "PhD", "Ontario"]
      },
      {
        type: "University",
        name: "McMaster University — Computing and Software Department (graduate)",
        url: "https://www.cas.mcmaster.ca/cas/future-graduate-students",
        email: "",
        location: "Hamilton, ON",
        notes: "QS (indicative): top ~180 worldwide. MSc/PhD in CS, software engineering, and health-informatics crossovers.",
        tags: ["MSc", "PhD", "Ontario", "software"]
      }
    ]
  },
  {
    country: "Canada",
    field: "Business & MBA",
    targets: [
      {
        type: "Business school",
        name: "Rotman School of Management — University of Toronto",
        url: "https://www.rotman.utoronto.ca/",
        email: "",
        location: "Toronto, ON",
        notes: "Parent university QS (indicative): top ~25 worldwide. Full-time MBA, Master of Finance, and specialized masters.",
        tags: ["MBA", "MFin", "QS parent ~25"]
      },
      {
        type: "Business school",
        name: "Schulich School of Business — York University",
        url: "https://schulich.yorku.ca/",
        email: "",
        location: "Toronto, ON",
        notes: "Triple-accredited; MBA, MMgt, Master of Marketing, and analytics-oriented MSc programmes.",
        tags: ["MBA", "MSc", "triple crown"]
      },
      {
        type: "Business school",
        name: "Ivey Business School — Western University",
        url: "https://www.ivey.uwo.ca/",
        email: "",
        location: "London, ON",
        notes: "One-year MBA (case method) and MSc in Management; strong placement in Canada.",
        tags: ["MBA", "Ontario"]
      },
      {
        type: "Business school",
        name: "Smith School of Business — Queen's University",
        url: "https://smith.queensu.ca/",
        email: "",
        location: "Kingston, ON",
        notes: "Queen's QS (indicative): top ~200 worldwide. Full-time MBA, Master of Finance, Management Analytics, and MSc in Management.",
        tags: ["MBA", "MSc", "Ontario", "QS parent ~200"]
      },
      {
        type: "Business school",
        name: "Sauder School of Business — UBC",
        url: "https://www.sauder.ubc.ca/",
        email: "",
        location: "Vancouver, BC",
        notes: "Parent QS (indicative): top ~40 worldwide. MBA, MM, and professional masters in business analytics.",
        tags: ["MBA", "BC"]
      },
      {
        type: "Business school",
        name: "Desautels Faculty of Management — McGill",
        url: "https://www.mcgill.ca/desautels/",
        email: "",
        location: "Montreal, QC",
        notes: "Parent QS (indicative): top ~30 worldwide. MBA, MMF, and analytics programmes; bilingual city context.",
        tags: ["MBA", "Montreal"]
      },
      {
        type: "Business school",
        name: "HEC Montréal",
        url: "https://www.hec.ca/en/programs/",
        email: "",
        location: "Montreal, QC",
        notes: "French-first institution; some English MBA/MSc options — verify language requirements early.",
        tags: ["MBA", "MSc", "French"]
      }
    ]
  },
  {
    country: "Canada",
    field: "Food Science & Food Technology",
    targets: [
      {
        type: "University",
        name: "University of Guelph — Department of Food Science (MSc / PhD)",
        url: "https://www.uoguelph.ca/foodscience/",
        email: "",
        location: "Guelph, ON",
        notes:
          "Often ranked Canada's top food science programme. QS overall (indicative): top ~400 worldwide — do not judge by overall rank alone for food specialism.",
        tags: ["MSc", "PhD", "food science", "Canada #1 food"]
      },
      {
        type: "University",
        name: "University of British Columbia — Faculty of Land and Food Systems",
        url: "https://lfs.ubc.ca/",
        email: "",
        location: "Vancouver, BC",
        notes: "Parent QS (indicative): top ~40 worldwide. Food Science MSc/PhD; wine science and human nutrition adjacent programmes.",
        tags: ["MSc", "PhD", "food systems", "QS parent ~40"]
      },
      {
        type: "University",
        name: "McGill University — Food Science and Agricultural Chemistry",
        url: "https://www.mcgill.ca/foodscience/",
        email: "",
        location: "Montreal, QC",
        notes: "Parent QS (indicative): top ~30 worldwide. Graduate research in food safety, chemistry, and processing.",
        tags: ["MSc", "PhD", "food safety", "QS parent ~30"]
      },
      {
        type: "University",
        name: "University of Alberta — Faculty of Agricultural, Life & Environmental Sciences (AFNS)",
        url: "https://www.ualberta.ca/agriculture-life-environment-sciences/index.html",
        email: "",
        location: "Edmonton, AB",
        notes: "QS (indicative): top ~100 worldwide. Human nutrition, meat science, and food processing research groups.",
        tags: ["MSc", "PhD", "food processing", "QS ~100"]
      },
      {
        type: "University",
        name: "University of Manitoba — Department of Food and Human Nutritional Sciences",
        url: "https://umanitoba.ca/agricultural-food-sciences/food-human-nutritional-sciences",
        email: "",
        location: "Winnipeg, MB",
        notes: "Graduate programmes in food science with prairie grains and protein research strengths.",
        tags: ["MSc", "PhD", "food science"]
      },
      {
        type: "University",
        name: "Dalhousie University — Faculty of Agriculture (Food Science)",
        url: "https://www.dal.ca/faculty/agriculture.html",
        email: "",
        location: "Truro, NS",
        notes: "Atlantic Canada hub; MSc and PhD in food science and bioprocessing near Halifax region.",
        tags: ["MSc", "PhD", "Atlantic"]
      },
      {
        type: "University",
        name: "Université Laval — Sciences des aliments (graduate)",
        url: "https://www.fsaa.ulaval.ca/programmes/",
        email: "",
        location: "Quebec City, QC",
        notes: "French-language programmes dominant; world-class dairy and maple / carbohydrate research clusters.",
        tags: ["MSc", "PhD", "French", "dairy science"]
      },
      {
        type: "University",
        name: "University of Saskatchewan — College of Agriculture and Bioresources (Food & bioproducts)",
        url: "https://grad.usask.ca/programs/",
        email: "",
        location: "Saskatoon, SK",
        notes: "QS (indicative): top ~350 worldwide. Strong cereal proteins, pulse ingredients, and cold-climate food research.",
        tags: ["MSc", "PhD", "food science", "Prairies"]
      }
    ]
  },
  {
    country: "Germany",
    field: "Computer Science & Engineering",
    targets: [
      {
        type: "University",
        name: "Technical University of Munich (TUM) — Department of Informatics",
        url: "https://www.tum.de/en/studies/degree-programs",
        email: "",
        location: "Munich / Garching",
        notes: "QS (indicative): top ~25 worldwide. Elite informatics; verify language of instruction (English vs German) per programme.",
        tags: ["MSc", "PhD", "QS top ~30", "TUM"]
      },
      {
        type: "University",
        name: "RWTH Aachen University — Faculty of Computer Science",
        url: "https://www.rwth-aachen.de/cms/root/studium/~een/Studierende/",
        email: "",
        location: "Aachen",
        notes: "QS (indicative): top ~110 worldwide. Strong in CS, embedded systems, and automotive-adjacent software.",
        tags: ["MSc", "PhD", "engineering"]
      },
      {
        type: "University",
        name: "Karlsruhe Institute of Technology (KIT) — Faculty of Informatics",
        url: "https://www.kit.edu/english/",
        email: "",
        location: "Karlsruhe",
        notes: "QS (indicative): top ~120 worldwide. Informatics, cybersecurity, and HPC; Cyber Valley industry links.",
        tags: ["MSc", "PhD", "research"]
      },
      {
        type: "University",
        name: "TU Berlin — Faculty IV Electrical Engineering and Computer Science",
        url: "https://www.tu.berlin/en/studying/",
        email: "",
        location: "Berlin",
        notes: "QS (indicative): top ~150 worldwide. Growing English MSc portfolio in CS-related fields.",
        tags: ["MSc", "Berlin"]
      },
      {
        type: "University",
        name: "University of Stuttgart — Faculty of Computer Science",
        url: "https://www.uni-stuttgart.de/en/study/",
        email: "",
        location: "Stuttgart",
        notes: "QS (indicative): top ~320 worldwide. Simulation science and automotive software ecosystem.",
        tags: ["MSc", "PhD", "industry"]
      },
      {
        type: "University",
        name: "LMU Munich — Institute for Informatics (graduate)",
        url: "https://www.en.uni-muenchen.de/students/index.html",
        email: "",
        location: "Munich",
        notes: "QS (indicative): top ~60 worldwide. Research MSc/PhD; compare with TUM for English-taught options.",
        tags: ["graduate", "QS top ~60"]
      }
    ]
  },
  {
    country: "Germany",
    field: "Food Science & Food Technology",
    targets: [
      {
        type: "University",
        name: "Technical University of Munich — TUM School of Life Sciences Weihenstephan",
        url: "https://www.ls.tum.de/en/home/",
        email: "",
        location: "Freising",
        notes:
          "TUM QS (indicative): top ~25 worldwide. Weihenstephan is a European hub for brewing science, food technology, nutrition, and sustainable food systems.",
        tags: ["MSc", "food science", "brewing", "QS top ~30"]
      },
      {
        type: "University",
        name: "University of Hohenheim — Food Science and Biotechnology",
        url: "https://www.uni-hohenheim.de/en",
        email: "",
        location: "Stuttgart (south)",
        notes: "QS (indicative): top ~350 worldwide; very strong in agricultural economics, food security, and crop-to-food research.",
        tags: ["MSc", "PhD", "agriculture", "food"]
      },
      {
        type: "University",
        name: "University of Bonn — Faculty of Agriculture (nutrition & food sciences)",
        url: "https://www.uni-bonn.de/en/study",
        email: "",
        location: "Bonn",
        notes: "QS (indicative): top ~230 worldwide. Graduate routes in nutritional sciences and food-related life sciences.",
        tags: ["graduate", "life sciences"]
      },
      {
        type: "University",
        name: "Technische Universität Berlin — Food-relevant process / life-science MSc routes",
        url: "https://www.tu.berlin/en/studying/",
        email: "",
        location: "Berlin",
        notes: "QS (indicative): top ~150 worldwide. Check Faculty III process sciences for food-relevant MSc pathways.",
        tags: ["MSc", "food chemistry", "Berlin"]
      }
    ]
  },
  {
    country: "Germany",
    field: "Business & MBA",
    targets: [
      {
        type: "Business school",
        name: "Mannheim Business School — University of Mannheim",
        url: "https://www.bschool.mannheim.de/",
        email: "",
        location: "Mannheim",
        notes: "University of Mannheim QS (indicative): top ~350 worldwide; MBS consistently top-tier in European rankings.",
        tags: ["MBA", "MSc", "Germany"]
      },
      {
        type: "Business school",
        name: "WHU — Otto Beisheim School of Management",
        url: "https://www.whu.edu/",
        email: "",
        location: "Vallendar",
        notes: "Private German business school; MBA, MSc, and Kellogg-WHU EMBA; triple-accredited profile.",
        tags: ["MBA", "MSc", "accredited"]
      },
      {
        type: "University",
        name: "Frankfurt School of Finance & Management",
        url: "https://www.frankfurt-school.de/",
        email: "",
        location: "Frankfurt",
        notes: "Finance-heavy MBA/MSc; ECB proximity; English-taught flagship programmes.",
        tags: ["MBA", "MSc", "finance"]
      },
      {
        type: "University",
        name: "ESMT Berlin",
        url: "https://www.esmt.berlin/",
        email: "",
        location: "Berlin",
        notes: "Private non-profit business school; MBA and Master in Analytics; strong tech and startup ecosystem links.",
        tags: ["MBA", "MSc", "English", "Berlin"]
      }
    ]
  },
  {
    country: "Netherlands",
    field: "صنایع غذایی — Food Science & Technology",
    targets: [
      {
        type: "University",
        name: "Wageningen University & Research — MSc Food Technology",
        url: "https://www.wur.nl/en/education-programmes/master/food-technology.htm",
        email: "",
        location: "Wageningen",
        notes:
          "رشته صنایع غذایی / food industry focus. QS Agriculture & Forestry often #1 globally; overall university QS (indicative): top ~150.",
        tags: ["MSc", "صنایع غذایی", "QS ag #1", "English"]
      },
      {
        type: "University",
        name: "Wageningen University & Research — MSc Food Quality Management",
        url: "https://www.wur.nl/en/education-programmes/master/food-quality-management.htm",
        email: "",
        location: "Wageningen",
        notes: "Quality systems, sensory science, and supply chain for food companies; English-taught.",
        tags: ["MSc", "quality", "food industry"]
      },
      {
        type: "University of applied sciences",
        name: "HAS green academy — Food Innovation",
        url: "https://www.has.nl/en/",
        email: "",
        location: "'s-Hertogenbosch / Venlo",
        notes: "کاربردی؛ مسیرهای صنایع غذایی و زنجیره تأمین در هلند.",
        tags: ["applied", "food innovation"]
      },
      {
        type: "University",
        name: "Utrecht University — Graduate School of Life Sciences (food-related)",
        url: "https://www.uu.nl/en/masters",
        email: "",
        location: "Utrecht",
        notes: "QS (indicative): top ~100 worldwide. Science for Sustainable Foods and related MSc programmes.",
        tags: ["MSc", "life sciences"]
      }
    ]
  },
  {
    country: "Canada",
    field: "صنایع غذایی — Food Science & Technology",
    targets: [
      {
        type: "University",
        name: "University of Guelph — Department of Food Science",
        url: "https://www.uoguelph.ca/foodscience/",
        email: "",
        location: "Guelph, ON",
        notes: "رشته صنایع غذایی؛ معمولاً قوی‌ترین برنامهٔ تحقیقاتی مواد غذایی در کانادا؛ MSc/PhD.",
        tags: ["MSc", "PhD", "صنایع غذایی", "Canada"]
      },
      {
        type: "University",
        name: "University of British Columbia — Faculty of Land and Food Systems",
        url: "https://lfs.ubc.ca/",
        email: "",
        location: "Vancouver, BC",
        notes: "QS parent (indicative): top ~40 worldwide. Food Science MSc/PhD.",
        tags: ["MSc", "PhD", "food science"]
      },
      {
        type: "University",
        name: "McGill — Food Science and Agricultural Chemistry",
        url: "https://www.mcgill.ca/foodscience/",
        email: "",
        location: "Montreal, QC",
        notes: "QS parent (indicative): top ~30 worldwide. پردازش، ایمنی و شیمی مواد غذایی.",
        tags: ["MSc", "PhD", "food safety"]
      },
      {
        type: "University",
        name: "University of Alberta — ALES (food-related graduate programmes)",
        url: "https://www.ualberta.ca/agriculture-life-environment-sciences/index.html",
        email: "",
        location: "Edmonton, AB",
        notes: "QS (indicative): top ~100 worldwide. Human nutrition and food processing research.",
        tags: ["MSc", "PhD", "QS ~100"]
      }
    ]
  },
  {
    country: "Germany",
    field: "صنایع غذایی — Food Science & Technology",
    targets: [
      {
        type: "University",
        name: "TUM School of Life Sciences Weihenstephan — Food / nutrition graduate programmes",
        url: "https://www.ls.tum.de/en/home/",
        email: "",
        location: "Freising",
        notes: "TUM QS (indicative): top ~25 worldwide. صنایع غذایی، تغذیه و فناوری نوشیدنی.",
        tags: ["MSc", "PhD", "صنایع غذایی", "Weihenstephan"]
      },
      {
        type: "University",
        name: "University of Hohenheim — Food Science and Biotechnology",
        url: "https://www.uni-hohenheim.de/en",
        email: "",
        location: "Stuttgart",
        notes: "QS (indicative): top ~350 worldwide; قوی در امنیت غذایی و کشاورزی دقیق.",
        tags: ["MSc", "PhD", "food security"]
      },
      {
        type: "University",
        name: "University of Bonn — Agricultural and nutritional sciences",
        url: "https://www.uni-bonn.de/en/study",
        email: "",
        location: "Bonn",
        notes: "QS (indicative): top ~230 worldwide. Food-related life sciences graduate tracks.",
        tags: ["graduate", "nutrition"]
      }
    ]
  },
  {
    country: "United States",
    field: "Computer Science & Engineering",
    targets: [
      {
        type: "University",
        name: "Massachusetts Institute of Technology (MIT) — EECS graduate programmes",
        url: "https://www.eecs.mit.edu/academics/graduate-programs/",
        email: "",
        location: "Cambridge, MA",
        notes: "QS (indicative): top ~1 worldwide. Extremely selective MSc/PhD; research fit and faculty sponsorship critical.",
        tags: ["PhD", "MEng", "QS top ~5", "research"]
      },
      {
        type: "University",
        name: "Stanford University — Computer Science (graduate)",
        url: "https://cs.stanford.edu/academics/masters",
        email: "",
        location: "Stanford, CA",
        notes: "QS (indicative): top ~5 worldwide. Silicon Valley proximity; competitive admissions and funding.",
        tags: ["MS", "PhD", "QS top ~10"]
      },
      {
        type: "University",
        name: "Carnegie Mellon University — School of Computer Science",
        url: "https://www.cs.cmu.edu/academics/masters/programs",
        email: "",
        location: "Pittsburgh, PA",
        notes: "QS CS subject often top ~3 worldwide; strong in systems, AI, HCI, and security.",
        tags: ["MS", "PhD", "CS ranking"]
      },
      {
        type: "University",
        name: "University of California, Berkeley — EECS",
        url: "https://eecs.berkeley.edu/academics/graduate-program",
        email: "",
        location: "Berkeley, CA",
        notes: "QS (indicative): top ~15 worldwide. MEng EECS and PhD routes; large cohorts and industry pipeline.",
        tags: ["MEng", "PhD", "QS top ~20"]
      },
      {
        type: "University",
        name: "Georgia Institute of Technology — College of Computing",
        url: "https://www.cc.gatech.edu/",
        email: "",
        location: "Atlanta, GA",
        notes: "QS (indicative): top ~80 worldwide. Excellent value; online OMSCS pathway also available separately.",
        tags: ["MS", "PhD", "online OMSCS"]
      },
      {
        type: "University",
        name: "University of Illinois Urbana-Champaign — Grainger CS",
        url: "https://cs.illinois.edu/academics/graduate",
        email: "",
        location: "Urbana-Champaign, IL",
        notes: "QS (indicative): top ~100 worldwide. Large research faculty; systems, theory, and scientific computing strengths.",
        tags: ["MS", "PhD", "research"]
      },
      {
        type: "University",
        name: "University of Washington — Paul G. Allen School of Computer Science & Engineering",
        url: "https://www.cs.washington.edu/academics/uw-cse-graduate-programs",
        email: "",
        location: "Seattle, WA",
        notes: "QS (indicative): top ~80 worldwide. Strong ties to Pacific Northwest cloud and product companies.",
        tags: ["MS", "PhD", "Seattle tech"]
      },
      {
        type: "University",
        name: "Cornell University — Computer Science (Ithaca)",
        url: "https://www.cs.cornell.edu/ms",
        email: "",
        location: "Ithaca, NY",
        notes: "QS (indicative): top ~20 worldwide. MEng CS (Ithaca) and PhD; rigorous technical preparation.",
        tags: ["MEng", "PhD", "Ivy"]
      }
    ]
  },
  {
    country: "United States",
    field: "Business & MBA",
    targets: [
      {
        type: "Business school",
        name: "Harvard Business School — MBA / Doctoral",
        url: "https://www.hbs.edu/",
        email: "",
        location: "Boston, MA",
        notes: "Harvard QS (indicative): top ~5 worldwide. Two-year MBA; case method; highly selective.",
        tags: ["MBA", "doctoral", "Ivy"]
      },
      {
        type: "Business school",
        name: "The Wharton School — University of Pennsylvania",
        url: "https://www.wharton.upenn.edu/",
        email: "",
        location: "Philadelphia, PA",
        notes: "UPenn QS (indicative): top ~15 worldwide. MBA, MBA/MA Lauder, and specialized masters in analytics and finance.",
        tags: ["MBA", "MSc", "finance"]
      },
      {
        type: "Business school",
        name: "MIT Sloan School of Management",
        url: "https://mitsloan.mit.edu/",
        email: "",
        location: "Cambridge, MA",
        notes: "MIT QS (indicative): top ~1 worldwide. MBA, Master of Finance, Master of Business Analytics.",
        tags: ["MBA", "analytics", "QS top ~5"]
      },
      {
        type: "Business school",
        name: "Stanford Graduate School of Business",
        url: "https://www.gsb.stanford.edu/",
        email: "",
        location: "Stanford, CA",
        notes: "MBA, MSx, and PhD; venture and technology leadership ecosystem.",
        tags: ["MBA", "California"]
      },
      {
        type: "Business school",
        name: "Northwestern Kellogg School of Management",
        url: "https://www.kellogg.northwestern.edu/",
        email: "",
        location: "Evanston, IL",
        notes: "MBA, MMM with Engineering, and analytics-oriented masters; strong marketing and strategy brand.",
        tags: ["MBA", "MMM", "Midwest"]
      },
      {
        type: "Business school",
        name: "Chicago Booth School of Business",
        url: "https://www.chicagobooth.edu/",
        email: "",
        location: "Chicago, IL",
        notes: "Full-time, evening, and executive MBA; rigorous analytics and economics core.",
        tags: ["MBA", "executive"]
      }
    ]
  },
  {
    country: "United States",
    field: "Food Science & Food Technology",
    targets: [
      {
        type: "University",
        name: "University of California, Davis — Department of Food Science and Technology",
        url: "https://foodscience.ucdavis.edu/",
        email: "",
        location: "Davis, CA",
        notes: "Globally top-tier food science department; MSc/PhD in sensory, safety, engineering, and brewing science.",
        tags: ["MSc", "PhD", "food science", "US West"]
      },
      {
        type: "University",
        name: "Cornell University — Department of Food Science",
        url: "https://foodscience.cals.cornell.edu/",
        email: "",
        location: "Ithaca, NY",
        notes: "QS parent (indicative): top ~20 worldwide. Dairy science, product development, and food chemistry research strength.",
        tags: ["MSc", "PhD", "dairy", "Ivy"]
      },
      {
        type: "University",
        name: "Rutgers University — Food Science graduate programme",
        url: "https://foodsci.rutgers.edu/",
        email: "",
        location: "New Brunswick, NJ",
        notes: "Industry-linked research; strong FDA-adjacent food safety and quality programmes.",
        tags: ["MSc", "PhD", "food safety"]
      },
      {
        type: "University",
        name: "University of Massachusetts Amherst — Food Science",
        url: "https://www.umass.edu/life-sciences/food-science",
        email: "",
        location: "Amherst, MA",
        notes: "Highly cited faculty; polymer and colloid science relevant to food texture and packaging.",
        tags: ["MSc", "PhD", "research"]
      },
      {
        type: "University",
        name: "Texas A&M University — Department of Food Science and Technology",
        url: "https://foodscience.tamu.edu/",
        email: "",
        location: "College Station, TX",
        notes: "Meat science, grain science, and food safety; large graduate cohort and extension network.",
        tags: ["MSc", "PhD", "meat science"]
      },
      {
        type: "University",
        name: "University of Wisconsin–Madison — Food Science (graduate)",
        url: "https://foodsci.wisc.edu/",
        email: "",
        location: "Madison, WI",
        notes: "Historic dairy research strength; food chemistry and rheology internationally recognized.",
        tags: ["MSc", "PhD", "dairy"]
      }
    ]
  },
  {
    country: "United States",
    field: "صنایع غذایی — Food Science & Technology",
    targets: [
      {
        type: "University",
        name: "UC Davis — Food Science and Technology",
        url: "https://foodscience.ucdavis.edu/",
        email: "",
        location: "Davis, CA",
        notes: "رشته صنایع غذایی؛ از قوی‌ترین بخش‌های تحقیقاتی مواد غذایی در آمریکا.",
        tags: ["MSc", "PhD", "صنایع غذایی", "California"]
      },
      {
        type: "University",
        name: "Cornell — Food Science (CALS)",
        url: "https://foodscience.cals.cornell.edu/",
        email: "",
        location: "Ithaca, NY",
        notes: "QS parent (indicative): top ~20 worldwide. شیمی و فناوری لبنی و محصولات.",
        tags: ["MSc", "PhD", "food science"]
      },
      {
        type: "University",
        name: "University of Wisconsin–Madison — Food Science",
        url: "https://foodsci.wisc.edu/",
        email: "",
        location: "Madison, WI",
        notes: "تحقیقات لبنی و فرایند؛ MSc/PhD.",
        tags: ["MSc", "PhD", "dairy"]
      }
    ]
  },
  {
    country: "United Kingdom",
    field: "Computer Science & Engineering",
    targets: [
      {
        type: "University",
        name: "University of Oxford — Department of Computer Science (graduate)",
        url: "https://www.cs.ox.ac.uk/admissions/",
        email: "",
        location: "Oxford, England",
        notes: "QS (indicative): top ~5 worldwide. MSc Advanced Computer Science and DPhil; college membership applies.",
        tags: ["MSc", "DPhil", "Oxbridge"]
      },
      {
        type: "University",
        name: "University of Cambridge — Department of Computer Science and Technology",
        url: "https://www.cst.cam.ac.uk/admissions",
        email: "",
        location: "Cambridge, England",
        notes: "QS (indicative): top ~5 worldwide. MPhil ACS and PhD; competitive funding and supervision match.",
        tags: ["MPhil", "PhD", "Oxbridge"]
      },
      {
        type: "University",
        name: "Imperial College London — Department of Computing",
        url: "https://www.imperial.ac.uk/computing/prospective-students/",
        email: "",
        location: "London, England",
        notes: "QS (indicative): top ~10 worldwide. MSc Computing variants (AI, ML, Software Engineering).",
        tags: ["MSc", "PhD", "London", "QS top ~15"]
      },
      {
        type: "University",
        name: "UCL — Computer Science (graduate)",
        url: "https://www.ucl.ac.uk/computer-science/study",
        email: "",
        location: "London, England",
        notes: "QS (indicative): top ~10 worldwide. Large MSc portfolio; machine learning and financial computing popular.",
        tags: ["MSc", "PhD", "London"]
      },
      {
        type: "University",
        name: "University of Edinburgh — School of Informatics",
        url: "https://informatics.ed.ac.uk/",
        email: "",
        location: "Edinburgh, Scotland",
        notes: "QS (indicative): top ~30 worldwide. AI, NLP, and systems groups with strong publication output.",
        tags: ["MSc", "PhD", "Scotland", "AI"]
      },
      {
        type: "University",
        name: "University of Manchester — Department of Computer Science",
        url: "https://www.cs.manchester.ac.uk/study/",
        email: "",
        location: "Manchester, England",
        notes: "QS (indicative): top ~35 worldwide. Broad MSc programmes; good industry links in Northern England.",
        tags: ["MSc", "PhD", "Manchester"]
      }
    ]
  },
  {
    country: "United Kingdom",
    field: "Business & MBA",
    targets: [
      {
        type: "Business school",
        name: "London Business School (LBS) — MBA / Masters",
        url: "https://www.london.edu/",
        email: "",
        location: "London, England",
        notes: "Consistently top-ranked in Europe; MBA, Masters in Finance, and Masters in Management.",
        tags: ["MBA", "MiF", "London"]
      },
      {
        type: "Business school",
        name: "Saïd Business School — University of Oxford",
        url: "https://www.sbs.ox.ac.uk/",
        email: "",
        location: "Oxford, England",
        notes: "Oxford QS (indicative): top ~5 worldwide. MBA, Executive MBA, and MSc Financial Economics.",
        tags: ["MBA", "Oxford"]
      },
      {
        type: "Business school",
        name: "Cambridge Judge Business School",
        url: "https://www.jbs.cam.ac.uk/",
        email: "",
        location: "Cambridge, England",
        notes: "Cambridge QS (indicative): top ~5 worldwide. MBA, Executive MBA, and MFin.",
        tags: ["MBA", "Cambridge"]
      },
      {
        type: "Business school",
        name: "Warwick Business School — University of Warwick",
        url: "https://www.wbs.ac.uk/",
        email: "",
        location: "Coventry, England",
        notes: "Triple-accredited; strong MSc in Business Analytics, Finance, and Management.",
        tags: ["MBA", "MSc", "UK"]
      },
      {
        type: "Business school",
        name: "Alliance Manchester Business School",
        url: "https://www.alliancembs.manchester.ac.uk/",
        email: "",
        location: "Manchester, England",
        notes: "University of Manchester QS (indicative): top ~35 worldwide. MBA and specialist MSc portfolio.",
        tags: ["MBA", "MSc", "Northern England"]
      }
    ]
  },
  {
    country: "United Kingdom",
    field: "Food Science & Food Technology",
    targets: [
      {
        type: "University",
        name: "University of Reading — Department of Food and Nutritional Sciences",
        url: "https://www.reading.ac.uk/food-and-nutritional-sciences",
        email: "",
        location: "Reading, England",
        notes: "UK flagship for food and nutrition research; MSc Food Technology — Quality Assurance, Food Science, etc.",
        tags: ["MSc", "PhD", "food science", "UK"]
      },
      {
        type: "University",
        name: "University of Nottingham — School of Biosciences (food-related MSc)",
        url: "https://www.nottingham.ac.uk/biosciences/",
        email: "",
        location: "Nottingham, England",
        notes: "QS (indicative): top ~100 worldwide. Food production management, brewing, and biotechnology routes.",
        tags: ["MSc", "PhD", "brewing"]
      },
      {
        type: "University",
        name: "University of Leeds — School of Food Science and Nutrition",
        url: "https://environment.leeds.ac.uk/food-science",
        email: "",
        location: "Leeds, England",
        notes: "Food science, nutrition, and global food environment MSc programmes; strong industry projects.",
        tags: ["MSc", "PhD", "nutrition"]
      },
      {
        type: "University",
        name: "Queen's University Belfast — Institute for Global Food Security",
        url: "https://www.qub.ac.uk/schools/geography/",
        email: "",
        location: "Belfast, Northern Ireland",
        notes: "Food security, authenticity, and analytical science; check cross-border visa context for ROI/UK.",
        tags: ["MSc", "PhD", "food security"]
      },
      {
        type: "University",
        name: "University of Surrey — Department of Nutritional Sciences (food systems)",
        url: "https://www.surrey.ac.uk/school-biosciences-medicine",
        email: "",
        location: "Guildford, England",
        notes: "Nutrition, microbiome, and food-related MSc routes with placement year options on some programmes.",
        tags: ["MSc", "placement", "South East"]
      }
    ]
  },
  {
    country: "United Kingdom",
    field: "صنایع غذایی — Food Science & Technology",
    targets: [
      {
        type: "University",
        name: "University of Reading — Food and Nutritional Sciences",
        url: "https://www.reading.ac.uk/food-and-nutritional-sciences",
        email: "",
        location: "Reading, England",
        notes: "رشته صنایع غذایی در بریتانیا؛ دوره‌های کارشناسی ارشد علوم و فناوری غذا.",
        tags: ["MSc", "صنایع غذایی", "UK"]
      },
      {
        type: "University",
        name: "University of Nottingham — Food production and biosciences",
        url: "https://www.nottingham.ac.uk/biosciences/",
        email: "",
        location: "Nottingham, England",
        notes: "QS (indicative): top ~100 worldwide. Brewing and food biotechnology.",
        tags: ["MSc", "food science"]
      },
      {
        type: "University",
        name: "University of Leeds — Food Science and Nutrition",
        url: "https://environment.leeds.ac.uk/food-science",
        email: "",
        location: "Leeds, England",
        notes: "علوم و تغذیهٔ مواد غذایی؛ پروژه‌های صنعتی.",
        tags: ["MSc", "PhD", "nutrition"]
      }
    ]
  }
];

function cleanTarget(target: ResumeTarget): ResumeTarget {
  return {
    type: target.type?.trim() || "Target",
    name: target.name?.trim() || "Unnamed target",
    url: target.url?.trim() || "",
    email: target.email?.trim() || "",
    location: target.location?.trim() || "",
    notes: target.notes?.trim() || "",
    tags: Array.from(new Set((target.tags ?? []).map((tag) => tag.trim()).filter(Boolean)))
  };
}

function parseTargets(value: unknown): ResumeTarget[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value) as ResumeTarget[];
    return Array.isArray(parsed) ? parsed.map(cleanTarget).filter((target) => target.name) : [];
  } catch {
    return [];
  }
}

function ensureDefaultResumeTargets() {
  const statement = getDb().prepare("INSERT OR IGNORE INTO resume_targets (country, targets_json) VALUES (?, ?)");
  defaultTargetLists.forEach((item) => {
    statement.run(item.country, JSON.stringify(item.targets));
  });
}

export function listResumeTargetLists(): ResumeTargetList[] {
  ensureDefaultResumeTargets();
  const rows = getDb().prepare("SELECT country, targets_json, updated_at FROM resume_targets ORDER BY country").all() as Array<{
    country: string;
    targets_json: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    country: row.country,
    targets: parseTargets(row.targets_json),
    updatedAt: row.updated_at
  }));
}

export function getResumeTargetList(country: string): ResumeTargetList {
  ensureDefaultResumeTargets();
  const normalizedCountry = country.trim() || "Netherlands";
  const row = getDb().prepare("SELECT country, targets_json, updated_at FROM resume_targets WHERE country = ?").get(normalizedCountry) as
    | { country: string; targets_json: string; updated_at: string }
    | undefined;

  return row
    ? { country: row.country, targets: parseTargets(row.targets_json), updatedAt: row.updated_at }
    : { country: normalizedCountry, targets: [], updatedAt: "" };
}

export function updateResumeTargetList(country: string, targets: ResumeTarget[]) {
  const normalizedCountry = country.trim();
  if (!normalizedCountry) throw new Error("Country is required.");

  getDb()
    .prepare(
      `INSERT INTO resume_targets (country, targets_json, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(country) DO UPDATE SET
         targets_json = excluded.targets_json,
         updated_at = CURRENT_TIMESTAMP`
    )
    .run(normalizedCountry, JSON.stringify(targets.map(cleanTarget).filter((target) => target.name)));
}

export function targetsToText(targets: ResumeTarget[]) {
  return targets
    .map((target) => [target.type, target.name, target.url, target.email, target.location, target.notes, target.tags.join(", ")].join(" | "))
    .join("\n");
}

export function textToTargets(value: string): ResumeTarget[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [type = "", name = "", url = "", email = "", location = "", notes = "", tags = ""] = line.split("|").map((part) => part.trim());
      return cleanTarget({
        type,
        name,
        url,
        email,
        location,
        notes,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      });
    })
    .filter((target) => target.name);
}

function ensureDefaultUniversityTargets() {
  const statement = getDb().prepare(
    "INSERT OR IGNORE INTO university_targets (country, field, targets_json) VALUES (?, ?, ?)"
  );
  defaultUniversityTargetLists.forEach((item) => {
    statement.run(item.country, item.field, JSON.stringify(item.targets));
  });
}

export function listUniversityTargetLists(): UniversityTargetList[] {
  ensureDefaultUniversityTargets();
  const rows = getDb()
    .prepare("SELECT country, field, targets_json, updated_at FROM university_targets ORDER BY country, field COLLATE NOCASE")
    .all() as Array<{ country: string; field: string; targets_json: string; updated_at: string }>;

  return rows.map((row) => ({
    country: row.country,
    field: row.field,
    targets: parseTargets(row.targets_json),
    updatedAt: row.updated_at
  }));
}

export function listUniversityFieldsForCountry(country: string): string[] {
  ensureDefaultUniversityTargets();
  const normalized = country.trim() || "Netherlands";
  const rows = getDb()
    .prepare("SELECT DISTINCT field FROM university_targets WHERE country = ? ORDER BY field COLLATE NOCASE")
    .all(normalized) as Array<{ field: string }>;
  return rows.map((r) => r.field);
}

export function getUniversityTargetList(country: string, field: string): UniversityTargetList {
  ensureDefaultUniversityTargets();
  const c = country.trim() || "Netherlands";
  const f = field.trim();
  if (!f) {
    const fields = listUniversityFieldsForCountry(c);
    const first = fields[0] ?? "";
    if (!first) return { country: c, field: "", targets: [], updatedAt: "" };
    return getUniversityTargetList(c, first);
  }

  const row = getDb()
    .prepare("SELECT country, field, targets_json, updated_at FROM university_targets WHERE country = ? AND field = ?")
    .get(c, f) as { country: string; field: string; targets_json: string; updated_at: string } | undefined;

  return row
    ? { country: row.country, field: row.field, targets: parseTargets(row.targets_json), updatedAt: row.updated_at }
    : { country: c, field: f, targets: [], updatedAt: "" };
}

export function updateUniversityTargetList(country: string, field: string, targets: ResumeTarget[]) {
  const c = country.trim();
  const f = field.trim();
  if (!c) throw new Error("Country is required.");
  if (!f) throw new Error("Field of study is required.");

  getDb()
    .prepare(
      `INSERT INTO university_targets (country, field, targets_json, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(country, field) DO UPDATE SET
         targets_json = excluded.targets_json,
         updated_at = CURRENT_TIMESTAMP`
    )
    .run(c, f, JSON.stringify(targets.map(cleanTarget).filter((target) => target.name)));
}
