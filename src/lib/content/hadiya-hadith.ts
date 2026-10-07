import type { HadiyaHadith } from "./types";

/**
 * Hadiya hadith for the Support page (2026-10-07 pass).
 *
 * Verification pass: every entry was cross-checked online on the same
 * day it was added — Arabic and reference against sunnah.com (web
 * reader) and the open fawazahmed0/hadith-api dataset (whose Bukhari
 * hadithnumber reproduces the sunnah.com numbering), and the Bangla
 * taken VERBATIM from the matching iHadis page (ihadis.com, Al Hadith /
 * IRD Foundation), whose Bukhari numbering matches sunnah.com's. The
 * iHadis page each Bangla text was extracted from is recorded in
 * verifiedSources. English renderings are composed for Amalyn — faithful
 * paraphrases, never copies of published translations.
 *
 * Drop rule enforced during research (same as HADITH): a narration whose
 * grading could not be confirmed was left out entirely — Al-Adab Al-Mufrad
 * 594 ("Exchanging gifts") carries no confirmable grade on sunnah.com, and
 * Jami at-Tirmidhi 664 is graded Da'if (Darussalam) there. Muslim 2588
 * ("Charity does not decrease wealth") could not be located under iHadis's
 * Islamic Foundation numbering and is deferred with the other Muslim
 * entries tracked in bead islamic-quest-8ow.2.
 *
 * Shown on the Support page: the first entry is the main hadith, the rest
 * open inside the support hadith sheet.
 */
export const HADIYA_HADITH: HadiyaHadith[] = [
  {
    id: "hadiya-accepted-and-rewarded-bukhari-2585",
    arabic:
      "كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم يَقْبَلُ الْهَدِيَّةَ وَيُثِيبُ عَلَيْهَا",
    translation: {
      en: "The Messenger of Allah ﷺ used to accept gifts and would give something in return.",
      bn: "রাসূলুল্লাহ (ﷺ) হাদিয়া গ্রহণ করতেন এবং তার প্রতিদানও দিতেন।",
    },
    narrator: "Aisha",
    narratorBn: "আয়িশা (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "2585",
    sourceUrl: "https://sunnah.com/bukhari:2585",
    review: {
      status: "verified",
      verifiedSources: [
        "https://sunnah.com/bukhari:2585",
        "https://ihadis.com/bukhari/hadith/2585",
      ],
      verifiedAt: "2026-10-07",
    },
  },
  {
    id: "hadiya-perfume-never-refused-bukhari-2582",
    arabic:
      "دَخَلْتُ عَلَيْهِ فَنَاوَلَنِي طِيبًا، قَالَ كَانَ أَنَسٌ ـ رضى الله عنه ـ لاَ يَرُدُّ الطِّيبَ، قَالَ وَزَعَمَ أَنَسٌ أَنَّ النَّبِيَّ صلى الله عليه وسلم كَانَ لاَ يَرُدُّ الطِّيبَ",
    translation: {
      en: "When I visited Thumama ibn Abdullah he handed me perfume and said: Anas never turned away a gift of perfume - and Anas held that the Prophet ﷺ never turned away perfume.",
      bn: "আমি একদা সুমামা ইবন আবদুল্লাহ (রহঃ)-এর নিকট গেলাম, তিনি আমাকে সুগন্ধি দিলেন এবং বললেন, আনাস (রাঃ) কখনো সুগন্ধি দ্রব্য ফিরিয়ে দিতেন না। তিনি আরও বলেন, আর আনাস (রাঃ) বলেছেন, নবী (ﷺ) সুগন্ধি ফিরিয়ে দিতেন না।",
    },
    narrator: "Azra ibn Thabit al-Ansari",
    narratorBn: "আয্‌রাহ ইবনু সাবিত আনসারী (রহঃ)",
    collection: "Sahih al-Bukhari",
    reference: "2582",
    sourceUrl: "https://sunnah.com/bukhari:2582",
    note: {
      en: "Reported in the chapter on the gift that is never refused.",
      bn: "হাদিসটি 'যে হাদিয়া ফিরিয়ে দেওয়া হয় না' অধ্যায়ে বর্ণিত।",
    },
    review: {
      status: "verified",
      verifiedSources: [
        "https://sunnah.com/bukhari:2582",
        "https://ihadis.com/bukhari/hadith/2582",
      ],
      verifiedAt: "2026-10-07",
    },
  },
  {
    id: "hadiya-spend-and-spend-on-you-bukhari-4684",
    arabic:
      "قَالَ اللهُ عَزَّ وَجَلَّ أَنْفِقْ أُنْفِقْ عَلَيْكَ وَقَالَ يَدُ اللهِ مَلْأَى لَا تَغِيْضُهَا نَفَقَةٌ سَحَّاءُ اللَّيْلَ وَالنَّهَارَ",
    translation: {
      en: "The Messenger of Allah ﷺ said: Allah, the Almighty, said, 'Spend, and I will spend on you.' And he said: 'The Hand of Allah is full and is never diminished by continuous spending, night and day.'",
      bn: "রাসূলুল্লাহ (ﷺ) বলেছেন, আল্লাহ তা‘আলা বলেন, “তুমি খরচ কর। আমি তোমার উপর খরচ করব।” এবং [রাসূলুল্লাহ (ﷺ)] বললেন, “আল্লাহ তা‘আলার হাত পরিপূর্ণ। রাতদিন অনবরত খরচেও তা কমবে না।”",
    },
    narrator: "Abu Huraira",
    narratorBn: "আবূ হুরাইরাহ (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "4684",
    sourceUrl: "https://sunnah.com/bukhari:4684",
    note: {
      en: "From the longer narration of this verse (Surah Hud 11:7) in Sahih al-Bukhari; what He has spent since creating the heavens and the earth has never diminished what is in His Hand.",
      bn: "সহীহ বুখারীতে এই আয়াতের (সূরা হূদ ১১:৭) দীর্ঘ বর্ণনার অংশ; আসমান-জমিন সৃষ্টির পর থেকে এত খরচের পরও তাঁর হাতের সম্পদ কমেনি।",
    },
    review: {
      status: "verified",
      verifiedSources: [
        "https://sunnah.com/bukhari:4684",
        "https://ihadis.com/bukhari/hadith/4684",
      ],
      verifiedAt: "2026-10-07",
    },
  },
  {
    id: "hadiya-half-a-date-bukhari-1417",
    arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
    translation: {
      en: "I heard the Messenger of Allah ﷺ say: Protect yourselves from the Fire, even with half a date in charity.",
      bn: "আমি নবী (ﷺ)-কে বলতে শুনেছি, তোমরা জাহান্নাম হতে আত্মরক্ষা কর এক টুকরা খেজুর সদকা করে হলেও।",
    },
    narrator: "Adi ibn Hatim",
    narratorBn: "আদী ইব্‌নু হাতিম (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "1417",
    sourceUrl: "https://sunnah.com/bukhari:1417",
    review: {
      status: "verified",
      verifiedSources: [
        "https://sunnah.com/bukhari:1417",
        "https://ihadis.com/bukhari/hadith/1417",
      ],
      verifiedAt: "2026-10-07",
    },
  },
];
