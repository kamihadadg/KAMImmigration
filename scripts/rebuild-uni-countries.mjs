/**
 * One-off: strip Ireland, add Finland / Spain / Italy / Turkey; reorder by ORDER.
 * Run: node scripts/rebuild-uni-countries.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const path = join(root, "content/defaults/university-targets.json");

const ORDER = [
  "United States",
  "Canada",
  "United Kingdom",
  "Finland",
  "Netherlands",
  "Spain",
  "Italy",
  "Sweden",
  "Germany",
  "Turkey",
  "Austria",
  "Australia",
];

const NEW_BLOCKS = [
  {
    country: "Finland",
    universities: [
      {
        type: "Technical university",
        name: "Aalto University — Department of Computer Science",
        fields: ["Computer Science & Engineering"],
        notes: "English MSc Computer Science, Communication, and Information Sciences; strong HCI and ML groups.",
        url: "https://www.aalto.fi/en/study-at-aalto/masters-programmes",
        location: "Espoo",
      },
      {
        type: "University",
        name: "University of Helsinki — Department of Computer Science",
        fields: ["Computer Science & Engineering"],
        notes: "Research MSc and doctoral routes; compare taught vs thesis programmes for international applicants.",
        url: "https://www.helsinki.fi/en/degree-finders/masters-programmes",
        location: "Helsinki",
      },
      {
        type: "Technical university",
        name: "Tampere University — Computing Sciences",
        fields: ["Computer Science & Engineering"],
        notes: "Former TUT lineage; software, signal processing, and games research clusters.",
        url: "https://www.tuni.fi/en/study-with-us",
        location: "Tampere",
      },
      {
        type: "Technical university",
        name: "LUT University — Software Engineering / Computer Science",
        fields: ["Computer Science & Engineering"],
        notes: "Smaller campus; English MSc options in software engineering and related ICT.",
        url: "https://www.lut.fi/en/study-at-lut",
        location: "Lappeenranta / Lahti",
      },
      {
        type: "University",
        name: "University of Helsinki — Faculty of Agriculture and Forestry (food sciences)",
        fields: ["Food Science & Food Technology"],
        notes: "Agri-food research MSc routes (food economy, safety, sustainability); verify English-language intake per programme.",
        url: "https://www.helsinki.fi/en/faculty-agriculture-and-forestry",
        location: "Helsinki",
      },
      {
        type: "University",
        name: "University of Turku — Food Chemistry and Food Development",
        fields: ["Food Science & Food Technology"],
        notes: "Seafood, sensory science, and molecular nutrition angles in Faculty of Science.",
        url: "https://www.utu.fi/en/study-at-utu/masters-degree-programmes",
        location: "Turku",
      },
    ],
  },
  {
    country: "Spain",
    universities: [
      {
        type: "Technical university",
        name: "Universitat Politècnica de Catalunya (UPC) — Barcelona School of Informatics (FIB)",
        fields: ["Computer Science & Engineering"],
        notes: "Large CS faculty; many MSc tracks in English — confirm language per concentration.",
        url: "https://www.upc.edu/en/masters",
        location: "Barcelona",
      },
      {
        type: "Technical university",
        name: "Universidad Politécnica de Madrid — ETSI Informáticos",
        fields: ["Computer Science & Engineering"],
        notes: "Flagship technical university in Spain; MSc Artificial Intelligence and formal CS tracks.",
        url: "https://www.upm.es/internacional",
        location: "Madrid",
      },
      {
        type: "University",
        name: "Universidad Carlos III de Madrid — Computer Science",
        fields: ["Computer Science & Engineering"],
        notes: "Young university with growing CS MSc portfolio; Leganés / Getafe campuses.",
        url: "https://www.uc3m.es/ss/Satellite/Postgrado/en/",
        location: "Madrid region",
      },
      {
        type: "Technical university",
        name: "Universitat Politècnica de València — Informatics",
        fields: ["Computer Science & Engineering"],
        notes: "Strong engineering faculty; English options vary — check programme sheets.",
        url: "https://www.upv.es/en/postgraduate/",
        location: "València",
      },
      {
        type: "University",
        name: "University of Barcelona — Faculty of Pharmacy and Food Sciences",
        fields: ["Food Science & Food Technology"],
        notes: "Food science and nutrition MSc programmes; Spanish proficiency often expected — verify English tracks.",
        url: "https://web.ub.edu/en/web/estudis/university-masters-degree",
        location: "Barcelona",
      },
      {
        type: "Technical university",
        name: "Universitat Politècnica de València — Food Biotechnology",
        fields: ["Food Science & Food Technology"],
        notes: "Engineering-led food science and biotechnology MSc routes.",
        url: "https://www.upv.es/en/postgraduate/",
        location: "València",
      },
    ],
  },
  {
    country: "Italy",
    universities: [
      {
        type: "Technical university",
        name: "Politecnico di Milano — Computer Science and Engineering",
        fields: ["Computer Science & Engineering"],
        notes: "QS engineering band often top ~25 worldwide (indicative); English MSc programmes in CS and AI.",
        url: "https://www.polimi.it/en/education/laurea-magistrale-programmes-equivalent-to-master-of-science",
        location: "Milan",
      },
      {
        type: "Technical university",
        name: "Politecnico di Torino — Department of Control and Computer Engineering",
        fields: ["Computer Science & Engineering"],
        notes: "Automotive and aerospace adjacent computing research; English MSc options.",
        url: "https://www.polito.it/en/education/programmes",
        location: "Turin",
      },
      {
        type: "University",
        name: "Sapienza University of Rome — Computer Science",
        fields: ["Computer Science & Engineering"],
        notes: "Large department; MSc Informatica and specialised masters — language requirements vary.",
        url: "https://www.uniroma1.it/en/pagina-strutturale/courses",
        location: "Rome",
      },
      {
        type: "University",
        name: "University of Bologna — Computer Science",
        fields: ["Computer Science & Engineering"],
        notes: "Historic university; CS MSc in Bologna and Cesena hubs.",
        url: "https://www.unibo.it/en/study/second-cycle-degree/programme",
        location: "Bologna",
      },
      {
        type: "University",
        name: "University of Bologna — Food Science and Technology (CESENA campus)",
        fields: ["Food Science & Food Technology"],
        notes: "Product innovation and quality; strong Italian food-industry links.",
        url: "https://www.unibo.it/en/study/second-cycle-degree/programme",
        location: "Cesena",
      },
      {
        type: "University",
        name: "University of Naples Federico II — Food Science",
        fields: ["Food Science & Food Technology"],
        notes: "Southern Italy hub for food science MSc and doctoral routes.",
        url: "https://www.unina.it/",
        location: "Naples",
      },
    ],
  },
  {
    country: "Turkey",
    universities: [
      {
        type: "Technical university",
        name: "Middle East Technical University (METU) — Computer Engineering",
        fields: ["Computer Science & Engineering"],
        notes: "English-medium engineering education in Ankara; competitive admissions for international students.",
        url: "https://www.metu.edu.tr/",
        location: "Ankara",
      },
      {
        type: "University",
        name: "Bilkent University — Computer Science / Engineering",
        fields: ["Computer Science & Engineering"],
        notes: "Private English-language university; MSc and PhD in CS with theory and systems strength.",
        url: "https://www.cs.bilkent.edu.tr/",
        location: "Ankara",
      },
      {
        type: "University",
        name: "Koç University — Computer Engineering",
        fields: ["Computer Science & Engineering"],
        notes: "Istanbul campus; graduate programmes in CS and AI-related fields (English).",
        url: "https://www.ku.edu.tr/en/",
        location: "Istanbul",
      },
      {
        type: "Technical university",
        name: "Istanbul Technical University (ITU) — Computer Engineering",
        fields: ["Computer Science & Engineering"],
        notes: "Historic technical university; graduate CS routes — verify English vs Turkish tracks.",
        url: "https://www.itu.edu.tr/en/",
        location: "Istanbul",
      },
      {
        type: "Technical university",
        name: "Middle East Technical University (METU) — Food Engineering",
        fields: ["Food Science & Food Technology"],
        notes: "Food process engineering, biosystems, and safety — English undergraduate legacy; confirm MSc language.",
        url: "https://www.metu.edu.tr/",
        location: "Ankara",
      },
      {
        type: "University",
        name: "Hacettepe University — Food Engineering",
        fields: ["Food Science & Food Technology"],
        notes: "Large public university; food engineering MSc aligned with Turkish industry standards.",
        url: "https://www.hacettepe.edu.tr/english",
        location: "Ankara",
      },
    ],
  },
];

function inferType(u) {
  if ((u.type || "").trim() === "Business school") return "Business school";
  const n = u.name || "";
  if (/Massachusetts Institute of Technology/i.test(n)) return "University";
  if (
    /Polytechnic|Technical University|Polit[eè]cnico|\bUPC\b|\bUPV\b|Institute of Technology|\bTU |\bKTH\b|Chalmers|\bAalto\b|\bLUT\b|\bITU\b|Istanbul Technical|İstanbul Technical|Middle East Technical|\bMETU\b|École polytechnique|Technische Universit/i.test(
      n
    )
  ) {
    return "Technical university";
  }
  return "University";
}

const raw = JSON.parse(readFileSync(path, "utf8"));
if (!Array.isArray(raw)) throw new Error("expected array");

let blocks = raw.filter((b) => b && b.country && b.country !== "Ireland");

const have = new Set(blocks.map((b) => b.country));
for (const nb of NEW_BLOCKS) {
  if (!have.has(nb.country)) {
    blocks.push(nb);
    have.add(nb.country);
  }
}

for (const b of blocks) {
  for (const u of b.universities || []) {
    u.type = inferType(u);
  }
}

const orderIndex = new Map(ORDER.map((c, i) => [c, i]));
blocks.sort((a, b) => (orderIndex.get(a.country) ?? 999) - (orderIndex.get(b.country) ?? 999));

const allowed = new Set(ORDER);
blocks = blocks.filter((b) => allowed.has(b.country));

writeFileSync(path, `${JSON.stringify(blocks, null, 2)}\n`);
console.log("OK countries:", blocks.map((b) => b.country).join(", "));
