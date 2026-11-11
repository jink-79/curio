import type { Category, LessonView, PathOutline } from "../types";

/*
 * Temporary seed data so the reader screen can be built and tried on a phone
 * before the API exists. Facts are from the Wikipedia article "Treaty of
 * Versailles" and should be re-checked when the real content pipeline lands.
 */

export const SAMPLE_PATH: PathOutline = {
  pathId: "world-war-2",
  title: "World War II",
  description: "From the peace of 1919 to the start of the Cold War — why it happened, how it unfolded and what it left behind.",
  categorySlug: "history",
  difficulty: "Beginner",
  objectives: [
    "Explain why a second world war broke out only twenty years after the first.",
    "Follow the war’s main phases and the turning points that decided it.",
    "Connect the war’s end to the start of the Cold War.",
  ],
  stages: [
    {
      number: 1,
      title: "Origins",
      lessons: [
        { lessonKey: "background", title: "Background and origins", minutes: 9, summary: "The world the First World War left behind", seedCompleted: true },
        { lessonKey: "treaty-of-versailles", title: "The Treaty of Versailles", minutes: 8, summary: "A peace that bred resentment" },
        { lessonKey: "great-depression", title: "The Great Depression", minutes: 10, summary: "How economic collapse fed extremism" },
      ],
    },
    {
      number: 2,
      title: "Road to war",
      lessons: [
        { lessonKey: "rise-of-nazi-germany", title: "Rise of Nazi Germany", minutes: 12, summary: "From fringe party to dictatorship" },
        { lessonKey: "invasion-of-poland", title: "Invasion of Poland", minutes: 8, summary: "September 1939" },
      ],
    },
    {
      number: 3,
      title: "A global war",
      lessons: [
        { lessonKey: "expansion", title: "Expansion of the war", minutes: 14, summary: "Europe, Africa and the Pacific" },
        { lessonKey: "turning-points", title: "Major turning points", minutes: 15, summary: "Stalingrad, Midway, El Alamein" },
      ],
    },
    {
      number: 4,
      title: "Endings",
      lessons: [
        { lessonKey: "end-of-war", title: "End of the war", minutes: 11, summary: "1945 in Europe and Asia" },
        { lessonKey: "aftermath", title: "Aftermath and the Cold War", minutes: 13, summary: "A new world order" },
      ],
    },
  ],
};

export const SAMPLE_LESSON: LessonView = {
  lessonKey: "treaty-of-versailles",
  pathId: "world-war-2",
  pathTitle: "World War II",
  category: "History",
  title: "The Treaty of Versailles",
  subtitle: "How the peace that ended the First World War set the stage for the second.",
  estimatedMinutes: 8,
  stage: { number: 1, title: "Origins" },
  position: { index: 2, total: 9 },
  buildsOn: { lessonKey: "background", title: "Background and origins" },
  blocks: [
    {
      id: "intro",
      type: "authored",
      markdown:
        "The Treaty of Versailles was signed on 28 June 1919 in the Hall of Mirrors at the Palace of Versailles — five years to the day after the assassination of Archduke Franz Ferdinand. It formally ended the war between Germany and the Allied Powers.",
    },
    {
      id: "background",
      type: "authored",
      heading: "How it was made",
      markdown: [
        "The terms were negotiated at the Paris Peace Conference, which opened in January 1919. The talks were dominated by the “Big Four”: Woodrow Wilson of the United States, Georges Clemenceau of France, David Lloyd George of Britain and Vittorio Orlando of Italy.",
        "Germany was not invited to the negotiating table. Its delegation was handed the finished terms and given a short deadline to accept them.",
      ].join("\n\n"),
    },
    {
      id: "img-signing",
      type: "image",
      alt: "Painting of the treaty signing in the Hall of Mirrors",
      caption: "The Signing of Peace in the Hall of Mirrors",
      credit: "William Orpen, 1919 · Wikimedia Commons · Public domain",
    },
    {
      id: "what-it-did",
      type: "authored",
      heading: "What it did",
      markdown: [
        "The most controversial provision was Article 231, later called the “war guilt clause”. It held Germany and its allies responsible for the loss and damage caused by the war, and became the legal basis for reparations.",
        "In 1921 the total was fixed at 132 billion gold marks. Germany also lost around 13 percent of its European territory, its army was capped at 100,000 men, and the Rhineland was demilitarised.",
        "Many Germans saw the treaty as a dictated peace — a *Diktat*. That resentment became a powerful tool for nationalist movements in the 1920s and ’30s, which you’ll follow in Stage 2.",
      ].join("\n\n"),
    },
    {
      id: "timeline",
      type: "timeline",
      heading: "Key dates",
      items: [
        { date: "18 Jan 1919", text: "Paris Peace Conference opens" },
        { date: "28 Jun 1919", text: "Treaty signed in the Hall of Mirrors" },
        { date: "10 Jan 1920", text: "Treaty enters into force; League of Nations founded" },
        { date: "May 1921", text: "Reparations fixed at 132 billion gold marks" },
      ],
    },
    {
      id: "sources",
      type: "sources",
      items: [
        {
          provider: "Wikipedia",
          role: "Primary reading",
          title: "Treaty of Versailles",
          meta: "Retrieved 8 Nov 2026",
          url: "https://en.wikipedia.org/wiki/Treaty_of_Versailles",
          licence: { label: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
        },
        {
          provider: "Project Gutenberg",
          role: "Further reading",
          title: "The Economic Consequences of the Peace",
          meta: "John Maynard Keynes, 1919",
          url: "https://www.gutenberg.org/ebooks/15776",
          licence: { label: "Public domain" },
        },
      ],
    },
  ],
};

/** Lessons with written content, by lessonKey. Others show "not written yet". */
export const SAMPLE_LESSONS: Record<string, LessonView> = {
  [SAMPLE_LESSON.lessonKey]: SAMPLE_LESSON,
};

/** The ten launch categories from the product brief. New ones are data, not code. */
export const SAMPLE_CATEGORIES: Category[] = [
  { slug: "history", name: "History", description: "How the past unfolded, and why it still shapes today.", icon: "landmark" },
  { slug: "technology", name: "Technology", description: "The tools and systems that changed how we live.", icon: "cpu" },
  { slug: "artificial-intelligence", name: "Artificial Intelligence", description: "From early ideas about thinking machines to modern AI.", icon: "sparkles" },
  { slug: "science", name: "Science", description: "How the natural world works, and how we found out.", icon: "flask" },
  { slug: "business", name: "Business", description: "How organisations are built, run and grown.", icon: "briefcase" },
  { slug: "finance", name: "Finance", description: "Money, markets and the decisions behind them.", icon: "trending-up" },
  { slug: "philosophy", name: "Philosophy", description: "The big questions, and the people who asked them.", icon: "scale" },
  { slug: "psychology", name: "Psychology", description: "How minds work: thought, emotion and behaviour.", icon: "brain" },
  { slug: "mathematics", name: "Mathematics", description: "Ideas of number, shape and proof.", icon: "sigma" },
  { slug: "programming", name: "Programming", description: "Writing software, from first principles up.", icon: "code" },
];

/** Curriculum from the product brief's example. No lessons are written yet. */
export const SAMPLE_AI_PATH: PathOutline = {
  pathId: "history-of-ai",
  title: "History of Artificial Intelligence",
  description: "From the first computers to today’s generative models — the ideas, setbacks and breakthroughs that built modern AI.",
  categorySlug: "artificial-intelligence",
  difficulty: "Beginner",
  objectives: [
    "Trace how AI moved from symbolic reasoning to learning from data.",
    "Explain why AI went through boom-and-bust cycles.",
    "Understand what transformers and large language models changed.",
  ],
  stages: [
    {
      number: 1,
      title: "Beginnings",
      lessons: [
        { lessonKey: "foundations-of-computing", title: "Foundations of Computing", minutes: 10, summary: "Turing, computability and the first computers" },
        { lessonKey: "early-ai", title: "Early Artificial Intelligence", minutes: 9, summary: "Can machines think?" },
        { lessonKey: "dartmouth-conference", title: "The Dartmouth Conference", minutes: 8, summary: "1956: AI gets its name" },
      ],
    },
    {
      number: 2,
      title: "Booms and winters",
      lessons: [
        { lessonKey: "symbolic-ai", title: "Symbolic AI and Expert Systems", minutes: 11, summary: "Rules, logic and knowledge bases" },
        { lessonKey: "ai-winters", title: "AI Winters", minutes: 9, summary: "When funding and faith ran out" },
      ],
    },
    {
      number: 3,
      title: "Learning from data",
      lessons: [
        { lessonKey: "machine-learning", title: "Machine Learning", minutes: 12, summary: "Programs that improve with experience" },
        { lessonKey: "neural-networks", title: "Neural Networks", minutes: 12, summary: "From the perceptron to backpropagation" },
        { lessonKey: "deep-learning", title: "Deep Learning", minutes: 12, summary: "Data, GPUs and many layers" },
      ],
    },
    {
      number: 4,
      title: "The modern era",
      lessons: [
        { lessonKey: "transformers", title: "Transformers", minutes: 12, summary: "Attention is all you need" },
        { lessonKey: "large-language-models", title: "Large Language Models", minutes: 12, summary: "Scale, pre-training and prompting" },
        { lessonKey: "generative-ai", title: "Modern Generative AI", minutes: 11, summary: "Text, images and beyond" },
        { lessonKey: "future-of-ai", title: "Future of Artificial Intelligence", minutes: 9, summary: "Open questions and debates" },
      ],
    },
  ],
};

export const SAMPLE_PATHS: Record<string, PathOutline> = {
  [SAMPLE_PATH.pathId]: SAMPLE_PATH,
  [SAMPLE_AI_PATH.pathId]: SAMPLE_AI_PATH,
};
