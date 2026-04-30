import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const contentDir = join(root, "content");
const imageDir = join(root, "apps", "web", "public", "images");

const topics = [
  {
    id: "food-health",
    title: "Food and Health",
    colorA: "#22c55e",
    colorB: "#06b6d4",
    words: [
      ["nutritious", "مغذی", "containing substances that help the body stay healthy", "Children need nutritious meals every day.", ["nutritious food", "nutritious meal", "highly nutritious"]],
      ["gluten-free", "بدون گلوتن", "made without gluten", "Gluten-free products are essential for many people with celiac disease.", ["gluten-free cake", "gluten-free diet", "gluten-free products"]],
      ["ingredient", "ماده اولیه", "one of the foods used to make a dish", "Fresh ingredients can improve the quality of a meal.", ["fresh ingredients", "natural ingredients", "main ingredient"]],
      ["allergy", "حساسیت", "a medical reaction to something", "Food allergies can be serious if they are ignored.", ["food allergy", "severe allergy", "allergy symptoms"]],
      ["balanced", "متعادل", "containing the right amounts of different things", "A balanced diet includes vegetables, protein, and grains.", ["balanced diet", "balanced meal", "balanced lifestyle"]]
    ]
  },
  {
    id: "environment",
    title: "Environment and Sustainability",
    colorA: "#84cc16",
    colorB: "#14b8a6",
    words: [
      ["biodegradable", "زیست‌تخریب‌پذیر", "able to break down naturally", "Biodegradable packaging can reduce plastic waste.", ["biodegradable packaging", "biodegradable material", "fully biodegradable"]],
      ["sustainable", "پایدار", "able to continue without damaging the environment", "Sustainable products are becoming more popular.", ["sustainable development", "sustainable packaging", "sustainable solution"]],
      ["waste", "پسماند", "unwanted material that is thrown away", "Food waste is a major problem in many cities.", ["reduce waste", "plastic waste", "household waste"]],
      ["recyclable", "قابل بازیافت", "able to be processed and used again", "Recyclable materials help protect natural resources.", ["recyclable bottle", "recyclable packaging", "easily recyclable"]],
      ["pollution", "آلودگی", "damage caused to air, water, or land", "Air pollution can affect public health.", ["air pollution", "water pollution", "reduce pollution"]]
    ]
  },
  {
    id: "technology",
    title: "Technology and Innovation",
    colorA: "#3b82f6",
    colorB: "#8b5cf6",
    words: [
      ["innovation", "نوآوری", "a new idea, method, or product", "Innovation is important in food science.", ["technological innovation", "product innovation", "drive innovation"]],
      ["device", "دستگاه", "a tool or machine made for a specific purpose", "The device measures temperature during production.", ["digital device", "medical device", "portable device"]],
      ["automated", "خودکار", "done by machines or software", "Automated systems can reduce human error.", ["automated process", "automated system", "fully automated"]],
      ["data", "داده", "information used for analysis", "Researchers collect data before making decisions.", ["collect data", "reliable data", "data analysis"]],
      ["platform", "پلتفرم", "a system used to provide a service", "Online platforms make learning more accessible.", ["learning platform", "digital platform", "online platform"]]
    ]
  },
  {
    id: "education",
    title: "Education and Learning",
    colorA: "#f59e0b",
    colorB: "#ef4444",
    words: [
      ["curriculum", "برنامه آموزشی", "the subjects and lessons in a course", "A clear curriculum helps students study consistently.", ["school curriculum", "IELTS curriculum", "structured curriculum"]],
      ["assessment", "ارزیابی", "a way to judge progress or ability", "Regular assessment shows which skills need more practice.", ["language assessment", "weekly assessment", "formal assessment"]],
      ["fluency", "روانی بیان", "the ability to speak smoothly", "Fluency improves when learners speak every day.", ["speaking fluency", "improve fluency", "natural fluency"]],
      ["accuracy", "دقت", "the quality of being correct", "Grammar accuracy is important in IELTS writing.", ["high accuracy", "improve accuracy", "grammatical accuracy"]],
      ["feedback", "بازخورد", "advice about performance", "Useful feedback helps learners avoid repeated mistakes.", ["detailed feedback", "teacher feedback", "constructive feedback"]]
    ]
  },
  {
    id: "work-career",
    title: "Work and Career",
    colorA: "#64748b",
    colorB: "#0f172a",
    words: [
      ["occupation", "شغل", "a person's job", "Food technologist is a skilled occupation.", ["skilled occupation", "main occupation", "future occupation"]],
      ["experience", "تجربه", "knowledge gained by doing something", "She has several years of professional experience.", ["work experience", "practical experience", "relevant experience"]],
      ["responsibility", "مسئولیت", "a duty or task you must do", "Quality control is one of her main responsibilities.", ["job responsibility", "take responsibility", "professional responsibility"]],
      ["colleague", "همکار", "a person who works with you", "My colleagues support each other at work.", ["friendly colleague", "former colleague", "senior colleague"]],
      ["deadline", "ضرب‌الاجل", "a time by which work must be completed", "Meeting deadlines is important in project management.", ["tight deadline", "meet a deadline", "project deadline"]]
    ]
  },
  {
    id: "canada-migration",
    title: "Canada and Migration",
    colorA: "#dc2626",
    colorB: "#f97316",
    words: [
      ["settle", "ساکن شدن", "to begin living in a new place", "Many families hope to settle in Canada permanently.", ["settle abroad", "settle in Canada", "settle permanently"]],
      ["community", "جامعه محلی", "people living in the same area", "A supportive community helps newcomers adapt.", ["local community", "immigrant community", "strong community"]],
      ["adapt", "سازگار شدن", "to change in order to fit a new situation", "Children often adapt to a new school quickly.", ["adapt quickly", "adapt to change", "adapt to a culture"]],
      ["permanent", "دائمی", "lasting for a long time", "Permanent residence gives families long-term stability.", ["permanent resident", "permanent home", "permanent status"]],
      ["opportunity", "فرصت", "a chance to do something useful", "Canada offers educational opportunities for children.", ["job opportunity", "better opportunity", "educational opportunity"]]
    ]
  }
];

const grammarSeeds = [
  ["Present Perfect for Experience", "برای تجربه‌ها و کارهایی استفاده می‌شود که اثرشان به زمان حال وصل است.", "Subject + have/has + past participle", "I have worked in food science for four years."],
  ["Past Simple vs Present Perfect", "برای زمان مشخص گذشته از Past Simple و برای تجربه یا اثر فعلی از Present Perfect استفاده می‌کنیم.", "Past Simple: finished time / Present Perfect: life experience", "I studied yesterday, but I have studied English for months."],
  ["Complex Sentences", "برای Band 7 باید بتوانید علت، نتیجه و تضاد را با جمله‌های مرکب بیان کنید.", "Although + clause, main clause", "Although online learning is flexible, it requires discipline."],
  ["Conditionals", "برای فرضیه، نتیجه و پیشنهاد از شرطی‌ها استفاده می‌کنیم.", "If + present, will + verb", "If people use biodegradable packaging, waste will decrease."],
  ["Passive Voice", "وقتی عمل مهم‌تر از فاعل است از مجهول استفاده می‌کنیم.", "Subject + be + past participle", "The product is tested before it is sold."],
  ["Comparatives", "برای مقایسه ایده‌ها در Writing و Speaking استفاده می‌شود.", "adjective + er / more + adjective + than", "Public transport is more affordable than private cars."],
  ["Relative Clauses", "برای توضیح دقیق‌تر درباره افراد یا چیزها استفاده می‌شود.", "noun + who/which/that + clause", "People who have celiac disease must avoid gluten."],
  ["Linking Devices", "برای انسجام نوشته و صحبت استفاده می‌شود.", "however / therefore / in addition / for example", "Many products are convenient; however, they create waste."],
  ["Modal Verbs", "برای پیشنهاد، احتمال و الزام استفاده می‌شود.", "should / must / might / could + base verb", "Governments should support sustainable businesses."],
  ["Noun Phrases", "برای نوشتن آکادمیک‌تر و دقیق‌تر استفاده می‌شود.", "adjective + noun + prepositional phrase", "The rapid growth of online education has changed learning."]
];

const writingTasks = [
  "Write a letter to a friend who wants to visit your city. Explain the best time to visit, where to stay, and what to see.",
  "Write a letter to a company asking for information about gluten-free products.",
  "Some people believe governments should support healthy food. Others think individuals are responsible for their own diet. Discuss both views and give your opinion.",
  "Write a letter to your manager requesting training for a new skill.",
  "Some people think technology makes education easier. Others believe it can distract learners. Discuss both views and give your opinion.",
  "Write a letter to a local council about reducing plastic waste in your area."
];

const speakingSets = [
  ["Do you work or study?", "What do you like about your work?", "Why do you want to improve your English?"],
  ["What kind of food is popular in your country?", "Do you prefer home-made food or restaurant food?", "Why do some people follow special diets?"],
  ["Describe a useful product you have used.", "What was it?", "Why was it useful?", "Would you recommend it to others?"],
  ["Do you think technology has changed education?", "What are the advantages of online learning?", "Can technology replace teachers?"],
  ["Describe a place where you would like to live.", "Where is it?", "What is special about it?", "Why would your family like it?"],
  ["How can people protect the environment?", "Should companies use sustainable packaging?", "What should governments do about waste?"]
];

const quizOptions = ["healthy", "expensive", "temporary", "dangerous"];

const pronunciationMap = {
  nutritious: "/nuːˈtrɪʃəs/",
  "gluten-free": "/ˌɡluːtən ˈfriː/",
  ingredient: "/ɪnˈɡriːdiənt/",
  allergy: "/ˈælədʒi/",
  balanced: "/ˈbælənst/",
  biodegradable: "/ˌbaɪoʊdɪˈɡreɪdəbl/",
  sustainable: "/səˈsteɪnəbl/",
  waste: "/weɪst/",
  recyclable: "/ˌriːˈsaɪkləbl/",
  pollution: "/pəˈluːʃn/",
  innovation: "/ˌɪnəˈveɪʃn/",
  device: "/dɪˈvaɪs/",
  automated: "/ˈɔːtəmeɪtɪd/",
  data: "/ˈdeɪtə/",
  platform: "/ˈplætfɔːrm/",
  curriculum: "/kəˈrɪkjələm/",
  assessment: "/əˈsesmənt/",
  fluency: "/ˈfluːənsi/",
  accuracy: "/ˈækjərəsi/",
  feedback: "/ˈfiːdbæk/",
  occupation: "/ˌɑːkjuˈpeɪʃn/",
  experience: "/ɪkˈspɪriəns/",
  responsibility: "/rɪˌspɑːnsəˈbɪləti/",
  colleague: "/ˈkɑːliːɡ/",
  deadline: "/ˈdedlaɪn/",
  settle: "/ˈsetl/",
  community: "/kəˈmjuːnəti/",
  adapt: "/əˈdæpt/",
  permanent: "/ˈpɜːrmənənt/",
  opportunity: "/ˌɑːpərˈtuːnəti/"
};

function ensureDirs() {
  [
    contentDir,
    join(imageDir, "real")
  ].forEach((dir) => mkdirSync(dir, { recursive: true }));
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function realImagePath(topicId) {
  return `/images/real/${topicId}.jpg`;
}

function pronunciationFor(word) {
  const baseWord = Object.keys(pronunciationMap).find((entry) => word.startsWith(entry));
  return pronunciationMap[baseWord ?? word] ?? `/${word}/`;
}

function rotateOptions(options, offset) {
  if (!options || options.length === 0) {
    return options;
  }

  const normalizedOffset = offset % options.length;
  return [...options.slice(normalizedOffset), ...options.slice(0, normalizedOffset)];
}

function shuffleQuestionOptions(questions, seed) {
  return questions.map((question) => ({
    ...question,
    options: question.options ? rotateOptions(question.options, seed + question.id) : question.options
  }));
}

function svg(title, subtitle, colorA, colorB) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${colorA}"/>
      <stop offset="100%" stop-color="${colorB}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#020617" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="1200" height="720" rx="48" fill="#020617"/>
  <circle cx="1000" cy="120" r="260" fill="${colorA}" opacity="0.18"/>
  <circle cx="180" cy="650" r="320" fill="${colorB}" opacity="0.2"/>
  <rect x="110" y="110" width="980" height="500" rx="44" fill="url(#g)" filter="url(#shadow)" opacity="0.92"/>
  <rect x="170" y="170" width="210" height="210" rx="42" fill="#ffffff" opacity="0.18"/>
  <path d="M225 330c70-18 112-74 116-150 54 40 82 90 78 150-3 70-59 120-129 120-61 0-112-40-129-94 22-2 43-10 64-26Z" fill="#fff" opacity="0.86"/>
  <text x="430" y="285" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="62" font-weight="800">${title}</text>
  <text x="430" y="355" fill="#e2e8f0" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="500">${subtitle}</text>
  <text x="430" y="430" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="24" opacity="0.84">CLB9 Coach • IELTS General • 2 hours daily</text>
</svg>`;
}

function buildVocabulary(day, topic, indexInDay) {
  const seed = topic.words[indexInDay % topic.words.length];
  const cycle = Math.floor(indexInDay / topic.words.length) + Math.ceil(day / topics.length);
  const suffixes = ["foundation", "practice", "exam use", "collocation", "review", "advanced use"];
  const phrase = `${seed[0]} ${suffixes[cycle % suffixes.length]}`;

  return {
    id: (day - 1) * 20 + indexInDay + 1,
    day,
    word: indexInDay < topic.words.length ? seed[0] : phrase,
    meaningFa: seed[1],
    pronunciation: pronunciationFor(seed[0]),
    definitionEn: seed[2],
    topic: topic.id,
    level: day < 45 ? "B1-B2" : day < 120 ? "B2" : "B2-C1",
    image: realImagePath(topic.id),
    example: indexInDay < topic.words.length ? seed[3] : `${phrase[0].toUpperCase()}${phrase.slice(1)} can help candidates produce more precise IELTS answers.`,
    translationFa: "این عبارت برای پاسخ‌های دقیق‌تر در آیلتس استفاده می‌شود.",
    collocations: seed[4],
    synonyms: ["useful", "relevant", "effective"],
    quiz: {
      question: `Choose the closest meaning of "${seed[0]}".`,
      options: rotateOptions([quizOptions[indexInDay % quizOptions.length], seed[1], "unrelated", "unknown"], day + indexInDay),
      answer: seed[1]
    }
  };
}

function buildReadingQuestions(topic) {
  return shuffleQuestionOptions([
    { id: 1, type: "true_false_not_given", question: "The text says this topic connects personal experience with social issues.", answer: "True", explanationFa: "این جمله مستقیم در متن آمده است." },
    { id: 2, type: "multiple_choice", question: "According to the text, progress depends on...", options: ["luck only", "education and consistent habits", "expensive products", "short answers"], answer: "education and consistent habits" },
    { id: 3, type: "short_answer", question: "What should a strong answer give?", answer: "a realistic example" },
    { id: 4, type: "multiple_choice", question: "The text is mainly useful for IELTS candidates because it helps them connect...", options: ["grammar with handwriting", "personal ideas with wider social issues", "numbers with spelling", "sports with entertainment"], answer: "personal ideas with wider social issues" },
    { id: 5, type: "true_false_not_given", question: "The text says learners should only memorize model answers.", answer: "False", explanationFa: "متن روی تمرین با موضوعات آشنا و بهبود واژگان و دقت تاکید دارد، نه حفظ کردن." },
    { id: 6, type: "short_answer", question: "Name one skill learners can improve through familiar topics.", answer: "vocabulary" },
    { id: 7, type: "multiple_choice", question: `Which phrase is closest to the topic "${topic.title}"?`, options: [topic.words[0][0], "unrelated habit", "silent room", "random number"], answer: topic.words[0][0] },
    { id: 8, type: "true_false_not_given", question: "The text suggests examples can make an answer stronger.", answer: "True", explanationFa: "در متن گفته شده پاسخ قوی باید مثال واقع‌بینانه داشته باشد." }
  ], topic.title.length);
}

function buildListeningQuestions(topic) {
  return shuffleQuestionOptions([
    { id: 1, type: "short_answer", question: "What topic are the speakers discussing?", answer: topic.title },
    { id: 2, type: "multiple_choice", question: "What should learners listen for?", options: ["only names", "key words, numbers, opinions, and examples", "music", "spelling only"], answer: "key words, numbers, opinions, and examples" },
    { id: 3, type: "multiple_choice", question: "Why is the topic common in IELTS?", options: ["It appears in daily life and public discussions", "It is never used in tests", "It is only for children", "It has no vocabulary"], answer: "It appears in daily life and public discussions" },
    { id: 4, type: "true_false_not_given", question: "The speakers recommend reading the transcript after listening.", answer: "True", explanationFa: "در script گفته شده بعد از listening باید transcript خوانده شود." },
    { id: 5, type: "short_answer", question: "What should learners repeat aloud?", answer: "useful phrases" },
    { id: 6, type: "multiple_choice", question: "The listening strategy is mainly about improving...", options: ["active listening", "drawing", "cooking", "sleep"], answer: "active listening" },
    { id: 7, type: "true_false_not_given", question: "The speakers say learners should ignore examples.", answer: "False", explanationFa: "Examples یکی از چیزهایی است که باید هنگام شنیدن دنبال شود." },
    { id: 8, type: "multiple_choice", question: "Which vocabulary item belongs to today's focus?", options: [topic.words[1][0], "departure gate", "mathematical proof", "ancient coin"], answer: topic.words[1][0] }
  ], topic.id.length);
}

function buildQuizQuestions(topic, day) {
  const words = topic.words;
  const vocabularyQuestions = words.flatMap((word, index) => [
    {
      id: index + 1,
      type: "vocabulary",
      question: `What is the Persian meaning of "${word[0]}"?`,
      options: [word[1], "تصادفی", "بی‌ارتباط", "قدیمی"],
      answer: word[1],
      explanationFa: `معنی درست "${word[0]}" برابر است با "${word[1]}".`
    },
    {
      id: index + 6,
      type: "collocation",
      question: `Choose the best collocation with "${word[0]}".`,
      options: [word[4][0], `heavy ${word[0]}`, `${word[0]} loudly`, `ancient ${word[0]}`],
      answer: word[4][0],
      explanationFa: "این ترکیب در انگلیسی طبیعی‌تر و IELTS-friendly است."
    }
  ]);

  const questions = [
    ...vocabularyQuestions,
    { id: 11, type: "grammar", question: "Choose the correct sentence.", options: ["I have studied English for months.", "I have studied English yesterday.", "I studying English.", "I have study English."], answer: "I have studied English for months.", explanationFa: "با for months از Present Perfect استفاده می‌کنیم." },
    { id: 12, type: "grammar", question: "Which sentence uses a good contrast linker?", options: ["Although it is expensive, it is useful.", "Because but it is useful.", "It useful although.", "Useful it although expensive."], answer: "Although it is expensive, it is useful.", explanationFa: "Although برای تضاد در جمله مرکب استفاده می‌شود." },
    { id: 13, type: "grammar", question: "Choose the passive sentence.", options: ["The product is tested before sale.", "The product tests before sale.", "The product testing before sale.", "The product test before sale."], answer: "The product is tested before sale.", explanationFa: "ساختار passive: be + past participle." },
    { id: 14, type: "strategy", question: "What should you do after a listening practice?", options: ["Ignore mistakes", "Read the transcript and repeat phrases", "Memorize all answers", "Stop studying"], answer: "Read the transcript and repeat phrases", explanationFa: "این کار هم دقت listening را بالا می‌برد هم pronunciation و fluency را." },
    { id: 15, type: "strategy", question: "What is the best way to improve IELTS writing?", options: ["Write and review mistakes", "Only read vocabulary lists", "Avoid feedback", "Use very long sentences only"], answer: "Write and review mistakes", explanationFa: "Writing بدون بازبینی خطاها معمولاً رشد کندی دارد." },
    { id: 16, type: "reading", question: "For True/False/Not Given questions, you should...", options: ["Use only the text", "Use personal opinion", "Guess from the title only", "Translate every word first"], answer: "Use only the text", explanationFa: "در TFNG ملاک فقط اطلاعات متن است." },
    { id: 17, type: "speaking", question: "A strong Speaking Part 2 answer should include...", options: ["details and examples", "one-word answers", "silence", "only memorized grammar"], answer: "details and examples", explanationFa: "جزئیات و مثال به fluency و coherence کمک می‌کند." },
    { id: 18, type: "writing", question: "A Band 7 essay needs...", options: ["clear position and organized paragraphs", "random ideas", "no examples", "only simple words"], answer: "clear position and organized paragraphs", explanationFa: "Task Response و Coherence برای Band 7 حیاتی هستند." },
    { id: 19, type: "listening", question: `Today's listening topic is connected to...`, options: [topic.title, "ancient history only", "unrelated music", "airport announcements only"], answer: topic.title, explanationFa: "موضوع روز از برنامه 180 روزه انتخاب شده است." },
    { id: 20, type: "review", question: `Day ${day} review: what should you record in your mistake notebook?`, options: ["wrong answers and useful corrections", "only correct answers", "nothing", "random words"], answer: "wrong answers and useful corrections", explanationFa: "دفتر خطا باعث می‌شود اشتباهات تکراری کم شوند." }
  ];

  return shuffleQuestionOptions(questions, day);
}

function buildContent() {
  const dailyLessons = [];
  const vocabulary = [];
  const grammar = [];
  const listening = [];
  const reading = [];
  const writing = [];
  const speaking = [];
  const quizzes = [];
  const images = [];

  topics.forEach((topic) => {
    images.push({ id: `real-${topic.id}`, path: realImagePath(topic.id), alt: `${topic.title} realistic photo` });
  });

  for (let i = 0; i < 60; i++) {
    const seed = grammarSeeds[i % grammarSeeds.length];
    const id = i + 1;
    const topic = topics[i % topics.length];
    const imagePath = realImagePath(topic.id);
    grammar.push({
      id,
      day: i + 1,
      title: `${seed[0]} ${i >= grammarSeeds.length ? `- Review ${Math.floor(i / grammarSeeds.length)}` : ""}`.trim(),
      level: i < 20 ? "B1-B2" : i < 45 ? "B2" : "B2-C1",
      image: imagePath,
      explanationFa: seed[1],
      structure: seed[2],
      examples: [
        { en: seed[3], fa: "این جمله نمونه برای استفاده در Writing یا Speaking است." },
        { en: `Candidates can use this structure to explain ${topic.title.toLowerCase()} clearly.`, fa: "داوطلبان می‌توانند با این ساختار ایده را واضح‌تر توضیح دهند." }
      ],
      commonMistakes: [
        {
          wrong: "I have studied English yesterday.",
          correct: "I studied English yesterday.",
          reasonFa: "با زمان مشخص گذشته مثل yesterday از Past Simple استفاده می‌کنیم."
        }
      ],
      exercise: {
        instruction: "Write five IELTS-style sentences using this grammar point.",
        sampleAnswer: seed[3]
      }
    });
  }

  for (let day = 1; day <= 180; day++) {
    const topic = topics[(day - 1) % topics.length];
    const lessonImage = realImagePath(topic.id);

    const vocabIds = [];
    for (let i = 0; i < 20; i++) {
      const item = buildVocabulary(day, topic, i);
      vocabulary.push(item);
      vocabIds.push(item.id);
    }

    const readingId = day <= 120 ? day : ((day - 1) % 120) + 1;
    if (day <= 120) {
      reading.push({
        id: readingId,
        day,
        title: `${topic.title}: Reading Practice ${readingId}`,
        level: day < 40 ? "B1-B2" : day < 90 ? "B2" : "B2-C1",
        image: lessonImage,
        text: `In many countries, ${topic.title.toLowerCase()} has become an important public topic. People often want practical solutions, but real progress depends on education, clear information, and consistent habits. For IELTS candidates, this topic is useful because it connects personal experience with social issues. A strong answer should describe the problem, explain the reasons, and give a realistic example. When learners practise with familiar topics, they can improve vocabulary, grammar accuracy, and confidence at the same time.`,
        questions: buildReadingQuestions(topic)
      });
    }

    listening.push({
      id: day,
      day,
      title: `${topic.title}: Listening Practice ${day}`,
      level: day < 45 ? "B1-B2" : day < 120 ? "B2" : "B2-C1",
      image: lessonImage,
      audioMode: "browser-tts",
      script: `Speaker A: Today we are discussing ${topic.title.toLowerCase()}. Speaker B: This topic is common in IELTS because it appears in daily life and public discussions. Speaker A: What should learners focus on? Speaker B: They should listen for key words, numbers, opinions, and examples. Speaker A: That sounds practical. Speaker B: Yes, and after listening they should read the transcript and repeat useful phrases aloud.`,
      questions: buildListeningQuestions(topic),
      vocabularyFocus: topic.words.map((word) => word[0])
    });

    writing.push({
      id: day,
      day,
      type: day % 2 === 0 ? "Task 2" : "Task 1 General",
      title: `Writing Practice ${day}`,
      prompt: writingTasks[(day - 1) % writingTasks.length],
      checklist: [
        "Answer every part of the task",
        "Use clear paragraphs",
        "Include topic-specific vocabulary",
        "Check verb tense and articles",
        "Keep the tone suitable for the task",
        "Use at least two accurate complex sentences",
        "Add one clear example or reason",
        "Avoid memorized sentences that do not match the question",
        "Review spelling, articles, and plural nouns",
        "Rewrite two weak sentences after finishing"
      ],
      band7TipFa: "برای Band 7، پاسخ باید کامل، منسجم، دقیق و با خطاهای محدود باشد."
    });

    speaking.push({
      id: day,
      day,
      title: `Speaking Practice ${day}`,
      part1: [
        ...speakingSets[(day - 1) % speakingSets.length],
        `How often do you think about ${topic.title.toLowerCase()}?`,
        `Is ${topic.title.toLowerCase()} important for families?`,
        "Do you prefer learning alone or with other people?"
      ],
      part2: {
        cueCard: `Describe something related to ${topic.title.toLowerCase()} that is important to you.`,
        prompts: ["What it is", "When you first learned about it", "Why it matters", "How it could be improved"]
      },
      part3: [
        `Why is ${topic.title.toLowerCase()} important in modern society?`,
        "How can governments support people in this area?",
        "Do you think this topic will become more important in the future?",
        "What problems can happen if people ignore this topic?",
        "How can schools teach this topic more effectively?",
        "Should companies take more responsibility in this area?"
      ],
      sampleStarter: `I would like to talk about ${topic.title.toLowerCase()} because it is closely connected to everyday life.`
    });

    quizzes.push({
      id: day,
      day,
      title: `Daily Quiz ${day}`,
      questions: buildQuizQuestions(topic, day)
    });

    dailyLessons.push({
      day,
      title: `${topic.title} - CLB9 Training`,
      level: day < 45 ? "B1-B2" : day < 120 ? "B2" : "B2-C1",
      target: `Build IELTS vocabulary and skills around ${topic.title.toLowerCase()}.`,
      image: lessonImage,
      estimatedMinutes: 120,
      sections: {
        vocabulary: vocabIds,
        grammar: ((day - 1) % 60) + 1,
        listening: day,
        reading: readingId,
        writing: day,
        speaking: day,
        quiz: day
      },
      plan: [
        { label: "Vocabulary", minutes: 20 },
        { label: "Listening", minutes: 30 },
        { label: "Reading", minutes: 30 },
        { label: "Writing", minutes: 25 },
        { label: "Speaking", minutes: 15 }
      ]
    });
  }

  const write = (name, data) => writeFileSync(join(contentDir, name), JSON.stringify(data, null, 2), "utf8");
  write("daily-lessons.json", dailyLessons);
  write("vocabulary.json", vocabulary);
  write("grammar.json", grammar);
  write("listening.json", listening);
  write("reading.json", reading);
  write("writing.json", writing);
  write("speaking.json", speaking);
  write("quizzes.json", quizzes);
  write("images.json", images);
}

ensureDirs();
buildContent();

console.log("Generated CLB9 curriculum JSON with real local JPG image paths.");
