import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "istighfar",
    name: { en: "Istighfar", bn: "ইস্তিগফার" },
    description: { en: "Seeking forgiveness", bn: "ক্ষমা প্রার্থনা" },
  },
  {
    id: "tasbih",
    name: { en: "Tasbih", bn: "তাসবিহ" },
    description: {
      en: "Declaring Allah's perfection and praise",
      bn: "আল্লাহর পবিত্রতা ও প্রশংসা ঘোষণা",
    },
  },
  {
    id: "salawat",
    name: { en: "Salawat", bn: "দরুদ" },
    description: {
      en: "Blessings upon the Prophet",
      bn: "রাসূলুল্লাহ (সা.)-এর ওপর দরুদ",
    },
  },
  {
    id: "dhikr",
    name: { en: "Dhikr", bn: "জিকির" },
    description: {
      en: "Words of remembrance",
      bn: "আল্লাহকে স্মরণের কথা",
    },
  },
];
