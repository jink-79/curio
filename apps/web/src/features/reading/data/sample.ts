import type { Highlight, LessonView, PathOutline } from "../types";

/*
 * Temporary seed data so the reader screen can be built and tried on a phone
 * before the API exists. Facts are from the Wikipedia article "Treaty of
 * Versailles" and should be re-checked when the real content pipeline lands.
 */

export const SAMPLE_PATH: PathOutline = {
  pathId: "world-war-2",
  title: "World War II",
  stages: [
    {
      number: 1,
      title: "Origins",
      lessons: [
        { lessonKey: "background", title: "Background and origins", minutes: 9, status: "done" },
        { lessonKey: "treaty-of-versailles", title: "The Treaty of Versailles", minutes: 8, status: "current" },
        { lessonKey: "great-depression", title: "The Great Depression", minutes: 10, status: "todo" },
      ],
    },
    {
      number: 2,
      title: "Road to war",
      lessons: [
        { lessonKey: "rise-of-nazi-germany", title: "Rise of Nazi Germany", minutes: 12, status: "todo" },
        { lessonKey: "invasion-of-poland", title: "Invasion of Poland", minutes: 8, status: "todo" },
      ],
    },
    {
      number: 3,
      title: "A global war",
      lessons: [
        { lessonKey: "expansion", title: "Expansion of the war", minutes: 14, status: "todo" },
        { lessonKey: "turning-points", title: "Major turning points", minutes: 15, status: "todo" },
      ],
    },
    {
      number: 4,
      title: "Endings",
      lessons: [
        { lessonKey: "end-of-war", title: "End of the war", minutes: 11, status: "todo" },
        { lessonKey: "aftermath", title: "Aftermath and the Cold War", minutes: 13, status: "todo" },
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
  difficulty: "Beginner",
  estimatedMinutes: 8,
  stage: { number: 1, title: "Origins" },
  position: { index: 2, total: 9 },
  buildsOn: { title: "Lesson 1 · Background and origins", completed: true },
  next: { title: "The Great Depression", minutes: 10 },
  blocks: [
    {
      id: "intro",
      type: "authored",
      heading: "Introduction",
      markdown:
        "The Treaty of Versailles was signed on 28 June 1919 in the Hall of Mirrors at the Palace of Versailles — five years to the day after the assassination of Archduke Franz Ferdinand. It formally ended the war between Germany and the Allied Powers.",
    },
    {
      id: "background",
      type: "authored",
      heading: "Background",
      markdown:
        "The terms were negotiated at the Paris Peace Conference, which opened in January 1919. Germany was not invited to the negotiating table; its delegation was handed the finished terms and given a short deadline to accept them.",
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
      id: "concepts",
      type: "concepts",
      heading: "Key concepts",
      items: ["Article 231", "Reparations", "Diktat", "League of Nations", "Rhineland"],
    },
    {
      id: "people",
      type: "people",
      heading: "People",
      items: [
        { name: "Woodrow Wilson", role: "United States" },
        { name: "Georges Clemenceau", role: "France" },
        { name: "David Lloyd George", role: "United Kingdom" },
        { name: "Vittorio Orlando", role: "Italy" },
      ],
    },
    {
      id: "timeline",
      type: "timeline",
      heading: "Timeline",
      items: [
        { date: "18 January 1919", text: "Paris Peace Conference opens" },
        { date: "28 June 1919", text: "Treaty signed in the Hall of Mirrors", emphasis: true },
        { date: "10 January 1920", text: "Treaty enters into force; League of Nations founded" },
        { date: "May 1921", text: "Reparations fixed at 132 billion gold marks" },
      ],
    },
    {
      id: "takeaways",
      type: "takeaways",
      items: [
        "Signed 28 June 1919, it ended the war between Germany and the Allies.",
        "Article 231 and reparations created a lasting economic and political grievance.",
        "That grievance fed the nationalist movements of the 1920s and ’30s.",
      ],
    },
    {
      id: "check",
      type: "quiz",
      questions: [
        {
          id: "q1",
          prompt: "What did Article 231 of the treaty establish?",
          options: [
            { id: "a", text: "The founding of the League of Nations" },
            { id: "b", text: "Responsibility of Germany and its allies for the war’s loss and damage" },
            { id: "c", text: "The demilitarisation of the Rhineland" },
            { id: "d", text: "The maximum size of the German army" },
          ],
          correctOptionId: "b",
          explanation:
            "Article 231 — the “war guilt clause” — assigned responsibility to Germany and its allies and became the legal basis for reparations.",
        },
      ],
    },
    {
      id: "sources",
      type: "sources",
      heading: "Sources & further reading",
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

export const SAMPLE_HIGHLIGHTS: Highlight[] = [
  {
    id: "hl-1",
    blockId: "what-it-did",
    exact: "It held Germany and its allies responsible for the loss and damage caused by the war",
    note: "Compare with how the 1945 settlement handled blame — Stage 4.",
  },
];
