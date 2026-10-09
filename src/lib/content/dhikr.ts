import type { Dhikr } from "./types";

/**
 * Catalog (2026-10-05). Text below is the widely memorized form of
 * each dhikr; Arabic and translations still need a proofread pass.
 * Bangla copy (2026-10-07) is authored for the Bangladeshi reader per the
 * localization brief; the native-speaker proofread is still open
 * (bead islamic-quest-8ow.2).
 *
 * Every entry below carries a citation cross-checked against the
 * established compilation (review.status "verified"). Entries without a
 * verified citation are excluded from production builds by
 * isQuestPublic() in index.ts.
 */
export const DHIKR: Dhikr[] = [
  {
    id: "astaghfirullah",
    names: { en: "Astaghfirullah", bn: "আস্তাগফিরুল্লাহ" },
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    meaning: {
      en: "I seek Allah's forgiveness.",
      bn: "আমি আল্লাহর কাছে ক্ষমা চাই।",
    },
    category: "istighfar",
    practiceGuidance: {
      en: "Any time. The Prophet ﷺ sought forgiveness more than seventy times a day.",
      bn: "যেকোনো সময়। রাসূলুল্লাহ (সা.) দিনে সত্তরেরও বেশি বার ক্ষমা চাইতেন।",
    },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "6307; 2702",
      note: {
        en: "Bukhari 6307 (Abu Huraira): more than seventy times a day. Muslim 2702 (al-Agharr al-Muzani): a hundred times a day.",
        bn: "বুখারী ৬৩০৭ (আবূ হুরায়রা): দিনে সত্তরেরও বেশি বার। মুসলিম ২৭০২ (আল-আগারর আল-মুযানী): দিনে একশো বার।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:6307", "sunnah.com/muslim:2702"],
      verifiedAt: "2026-10-05",
    },
    topics: [
      {
        topic: "forgiveness",
        link: "dua-for",
        evidence: {
          en: "The words themselves: \"I seek Allah's forgiveness.\"",
          bn: "কথাটিই এর ভিত্তি: \"আমি আল্লাহর কাছে ক্ষমা চাই।\"",
        },
      },
      {
        topic: "istighfar",
        link: "dua-for",
        evidence: {
          en: "The words themselves: \"I seek Allah's forgiveness.\"",
          bn: "কথাটিই এর ভিত্তি: \"আমি আল্লাহর কাছে ক্ষমা চাই।\"",
        },
      },
    ],
    searchTerms: [
      "ইস্তেগফার",
      "ক্ষমা",
      "গুনাহ",
      "গোনাহ",
      "পাপ",
      "istanja",
      "choma",
      "khoma",
      "gunah",
      "gonah",
      "pap",
      "istigfar",
      "istegfar",
      "astagfirullah",
      "forgiveness",
      "seek forgiveness",
      "maghfirah",
    ],
  },
  {
    id: "sayyid-ul-istighfar",
    names: { en: "Sayyid al-Istighfar", bn: "সাইয়িদুল ইস্তিগফার" },
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allahumma anta Rabbi, la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi, faghfir li, fa innahu la yaghfirudh-dhunuba illa anta.",
    meaning: {
      en: "O Allah, You are my Lord; there is no god but You. You created me and I am Your servant. I keep Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me — none forgives sins but You.",
      bn: "হে আল্লাহ, আপনিই আমার রব, আপনি ছাড়া কোনো মাবুদ নেই। আপনি আমাকে সৃষ্টি করেছেন, আমি আপনার বান্দা। যতটুকু সামর্থ্য আপনি দিয়েছেন, আমি আপনার প্রতিজ্ঞার ওপর অটল রইলাম। আমি যা করেছি, তার অনিষ্ট থেকে আপনার আশ্রয় চাই। আপনার আমার ওপর নিয়ামতের স্বীকৃতি দিচ্ছি এবং আমার গুনাহ স্বীকার করছি। কাজেই আমাকে ক্ষমা করুন - কারণ আপনি ছাড়া গুনাহ ক্ষমা করার কেউ নেই।",
    },
    category: "istighfar",
    practiceGuidance: {
      en: "Once in the morning and once in the evening, with conviction.",
      bn: "সকালে একবার, বিকেলে একবার - বিশ্বাসের সঙ্গে।",
    },
    source: {
      collection: "Sahih al-Bukhari",
      reference: "6306",
      note: {
        en: "Narrator: Shaddad ibn Aws. Parallel: Jami at-Tirmidhi 3393 (Sahih, Darussalam grading).",
        bn: "বর্ণনায়: শাদ্দাদ ইবনে আওস। সমতুল্য: জামে তিরমিজী ৩৩৯৩ (সহীহ, দারুসসালাম)।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:6306", "sunnah.com/tirmidhi:3393"],
      verifiedAt: "2026-10-05",
    },
    topics: [
      {
        topic: "forgiveness",
        link: "dua-for",
        evidence: {
          en: "The dua asks: \"so forgive me — none forgives sins but You.\"",
          bn: "দোয়াটিতে চাওয়া হয়েছে: \"আমাকে ক্ষমা করুন - আপনি ছাড়া গুনাহ ক্ষমা করার কেউ নেই।\"",
        },
      },
      {
        topic: "istighfar",
        link: "dua-for",
        evidence: {
          en: "The dua asks: \"so forgive me — none forgives sins but You.\"",
          bn: "দোয়াটিতে চাওয়া হয়েছে: \"আমাকে ক্ষমা করুন - আপনি ছাড়া গুনাহ ক্ষমা করার কেউ নেই।\"",
        },
      },
    ],
    searchTerms: [
      "সাইয়িদুল ইস্তেগফার",
      "ইস্তেগফার",
      "ক্ষমা",
      "গুনাহ",
      "choma",
      "khoma",
      "gunah",
      "sayyidul istigfar",
      "sayidul istighfar",
      "master of forgiveness",
      "forgiveness",
      "maghfirah",
    ],
  },
  {
    id: "subhanallah",
    names: { en: "Subhanallah", bn: "সুবহানাল্লাহ" },
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhanallah",
    meaning: {
      en: "Glory be to Allah.",
      bn: "আল্লাহ সকল ত্রুটি থেকে পবিত্র।",
    },
    category: "tasbih",
    practiceGuidance: {
      en: "After each prayer, 33, 33, then 34. Also before sleeping.",
      bn: "প্রতি নামাজের পরে ৩৩, ৩৩, তারপর ৩৪ বার। ঘুমানোর আগেও।",
    },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "843; 596a; 5362",
      note: {
        en: "Part of the 33/33/34 tasbih. Narrations: Bukhari 843 (Abu Huraira); Muslim 596a (Ka'b ibn Ujrah, explicit 33/33/34); Bukhari 5362 (Ali).",
        bn: "৩৩/৩৩/৩৪ তাসবিহের অংশ। বর্ণনা: বুখারী ৮৪৩ (আবূ হুরায়রা); মুসলিম ৫৯৬ক (কাব ইবনে উজরা, স্পষ্ট ৩৩/৩৩/৩৪); বুখারী ৫৩৬২ (আলী)।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:843", "sunnah.com/muslim:596a"],
      verifiedAt: "2026-10-05",
    },
    topics: [
      {
        topic: "general-dhikr",
        link: "related",
      },
      {
        topic: "sleep-evening",
        link: "related",
      },
    ],
    searchTerms: [
      "তাসবিহ",
      "সুবহান",
      "পবিত্র",
      "tasbih",
      "tasbeeh",
      "subhana",
      "sobhan",
      "glory",
      "holiness",
    ],
  },
  {
    id: "alhamdulillah",
    names: { en: "Alhamdulillah", bn: "আলহামদুলিল্লাহ" },
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    meaning: {
      en: "All praise is for Allah.",
      bn: "সকল প্রশংসা আল্লাহর।",
    },
    category: "tasbih",
    practiceGuidance: {
      en: "After each prayer, 33, 33, then 34. Also before sleeping.",
      bn: "প্রতি নামাজের পরে ৩৩, ৩৩, তারপর ৩৪ বার। ঘুমানোর আগেও।",
    },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "843; 596a; 5362",
      note: {
        en: "Part of the 33/33/34 tasbih. Narrations: Bukhari 843 (Abu Huraira); Muslim 596a (Ka'b ibn Ujrah, explicit 33/33/34); Bukhari 5362 (Ali).",
        bn: "৩৩/৩৩/৩৪ তাসবিহের অংশ। বর্ণনা: বুখারী ৮৪৩ (আবূ হুরায়রা); মুসলিম ৫৯৬ক (কাব ইবনে উজরা, স্পষ্ট ৩৩/৩৩/৩৪); বুখারী ৫৩৬২ (আলী)।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:843", "sunnah.com/muslim:596a"],
      verifiedAt: "2026-10-05",
    },
    topics: [
      {
        topic: "gratitude",
        link: "dua-for",
        evidence: {
          en: "The words themselves: \"All praise is for Allah.\"",
          bn: "কথাটিই এর ভিত্তি: \"সকল প্রশংসা আল্লাহর।\"",
        },
      },
      {
        topic: "general-dhikr",
        link: "related",
      },
      {
        topic: "sleep-evening",
        link: "related",
      },
    ],
    searchTerms: [
      "শুকরিয়া",
      "প্রশংসা",
      "হামদ",
      "shukriya",
      "shukor",
      "hamd",
      "alhamdo",
      "alhamdulillaha",
      "praise",
      "thank allah",
    ],
  },
  {
    id: "allahu-akbar",
    names: { en: "Allahu Akbar", bn: "আল্লাহু আকবার" },
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    meaning: {
      en: "Allah is the Greatest.",
      bn: "আল্লাহ সবচেয়ে বড়।",
    },
    category: "tasbih",
    practiceGuidance: {
      en: "After each prayer, 33, 33, then 34. Also before sleeping.",
      bn: "প্রতি নামাজের পরে ৩৩, ৩৩, তারপর ৩৪ বার। ঘুমানোর আগেও।",
    },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "843; 596a; 5362",
      note: {
        en: "Part of the 33/33/34 tasbih. Narrations: Bukhari 843 (Abu Huraira); Muslim 596a (Ka'b ibn Ujrah, explicit 33/33/34); Bukhari 5362 (Ali).",
        bn: "৩৩/৩৩/৩৪ তাসবিহের অংশ। বর্ণনা: বুখারী ৮৪৩ (আবূ হুরায়রা); মুসলিম ৫৯৬ক (কাব ইবনে উজরা, স্পষ্ট ৩৩/৩৩/৩৪); বুখারী ৫৩৬২ (আলী)।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:843", "sunnah.com/muslim:596a"],
      verifiedAt: "2026-10-05",
    },
    topics: [
      {
        topic: "general-dhikr",
        link: "related",
      },
      {
        topic: "sleep-evening",
        link: "related",
      },
    ],
    searchTerms: [
      "তাকবির",
      "আকবার",
      "takbir",
      "takbeer",
      "akbar",
      "greatest",
      "allah is greatest",
    ],
  },
  {
    id: "la-ilaha-illallah",
    names: { en: "La ilaha illallah", bn: "লা ইলাহা ইল্লাল্লাহ" },
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illallah",
    meaning: {
      en: "There is no god but Allah.",
      bn: "আল্লাহ ছাড়া কোনো মাবুদ নেই।",
    },
    category: "dhikr",
    practiceGuidance: {
      en: "Any time. The best of all remembrance.",
      bn: "যেকোনো সময়। সকল জিকিরের সেরা।",
    },
    source: {
      collection: "Jami at-Tirmidhi",
      reference: "3383",
      note: {
        en: "Jabir ibn Abdillah. Graded Hasan (Darussalam). Cited alone deliberately: no Bukhari/Muslim narration states this exact phrasing.",
        bn: "জাবির ইবনে আবদুল্লাহ। হাসান (দারুসসালাম)। ইচ্ছাকৃতভাবে এককভাবে উদ্ধৃত: বুখারী-মুসলিমে এই রূপটি নেই।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/tirmidhi:3383"],
      verifiedAt: "2026-10-05",
    },
    topics: [
      {
        topic: "general-dhikr",
        link: "related",
      },
    ],
    searchTerms: [
      "কালিমা",
      "কালেমা",
      "তাওহিদ",
      "kalima",
      "kalema",
      "tauhid",
      "tawhid",
      "kalima tayyaba",
      "no god but allah",
    ],
  },
  {
    id: "subhanallahi-wa-bihamdihi",
    names: { en: "Subhanallahi wa bihamdihi", bn: "সুবহানাল্লাহি ওয়া বিহামদিহি" },
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhanallahi wa bihamdihi",
    meaning: {
      en: "Glory be to Allah, and praise is His.",
      bn: "আল্লাহ সকল ত্রুটি থেকে পবিত্র, আর সব প্রশংসা তাঁরই।",
    },
    category: "tasbih",
    practiceGuidance: {
      en: "Any time. A hundred times a day.",
      bn: "যেকোনো সময়। দিনে একশো বার।",
    },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "6405; 2691",
      note: {
        en: "Abu Huraira. One hundred times a day. In Muslim 2691 this tasbih appears within a longer narration.",
        bn: "আবূ হুরায়রা। দিনে একশো বার। মুসলিম ২৬৯১-এ এই জিকিরটি দীর্ঘ এক বর্ণনার অংশ হিসেবে এসেছে।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:6405", "sunnah.com/muslim:2691"],
      verifiedAt: "2026-10-05",
    },
    topics: [
      {
        topic: "gratitude",
        link: "dua-for",
        evidence: {
          en: "The words include: \"and praise is His.\"",
          bn: "কথায় রয়েছে: \"আর সব প্রশংসা তাঁরই।\"",
        },
      },
      {
        topic: "general-dhikr",
        link: "related",
      },
    ],
    searchTerms: [
      "তাসবিহ",
      "শুকরিয়া",
      "প্রশংসা",
      "subhanallahi",
      "tasbih",
      "shukriya",
      "praise",
      "glory and praise",
    ],
  },
  {
    id: "hawqala",
    names: { en: "Hawqala", bn: "হাওকালা" },
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    meaning: {
      en: "There is no might nor power except with Allah.",
      bn: "আল্লাহ ছাড়া কোনো শক্তি নেই, সামর্থ্যও নেই।",
    },
    category: "dhikr",
    practiceGuidance: {
      en: "Any time, especially in difficulty.",
      bn: "যেকোনো সময়, বিশেষ করে কষ্টের সময়।",
    },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "6384; 2704",
      note: {
        en: "Abu Musa al-Ash'ari. Parallels: Bukhari 6610, 7386.",
        bn: "আবূ মূসা আল-আশআরী। সমতুল্য: বুখারী ৬৬১০, ৭৩৮৬।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:6384", "sunnah.com/muslim:2704"],
      verifiedAt: "2026-10-05",
    },
    topics: [
      {
        topic: "general-dhikr",
        link: "related",
      },
      {
        topic: "sabr",
        link: "related",
      },
      {
        topic: "tawakkul",
        link: "related",
      },
    ],
    searchTerms: [
      "হাওলা",
      "শক্তি",
      "সামর্থ্য",
      "la hawla",
      "hawla",
      "quwwata",
      "hawala",
      "shokti",
      "shakti",
      "no might",
      "power except allah",
    ],
  },
  {
    id: "salawat-ibrahimiyya",
    names: { en: "Salawat (Ibrahimiyya)", bn: "দরুদ শরীফ (ইব্রাহিমী)" },
    arabic:
      "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration:
      "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammadin, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahima, innaka Hamidum Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammadin, kama barakta 'ala Ibrahima wa 'ala ali Ibrahima, innaka Hamidum Majid.",
    meaning: {
      en: "O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious.",
      bn: "হে আল্লাহ, মুহাম্মদ ও মুহাম্মদের পরিবারের ওপর রহমত বর্ষণ করুন, যেভাবে ইব্রাহিম ও ইব্রাহিমের পরিবারের ওপর করেছেন। নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত। হে আল্লাহ, মুহাম্মদ ও মুহাম্মদের পরিবারের ওপর বরকত দিন, যেভাবে ইব্রাহিম ও ইব্রাহিমের পরিবারের ওপর দিয়েছেন। নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত।",
    },
    category: "salawat",
    practiceGuidance: {
      en: "Any time, and in abundance on Fridays.",
      bn: "যেকোনো সময়, আর শুক্রবারে বেশি বেশি।",
    },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "3370; 406",
      note: {
        en: "Ka'b ibn Ujrah. Parallels: Bukhari 4797, 6357; Tirmidhi 483 (hasan sahih gharib).",
        bn: "কাব ইবনে উজরা। সমতুল্য: বুখারী ৪৭৯৭, ৬৩৫৭; তিরমিজী ৪৮৩ (হাসান সহীহ গরিব)।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:3370", "sunnah.com/muslim:406"],
      verifiedAt: "2026-10-05",
    },
    topics: [
      {
        topic: "salawat",
        link: "dua-for",
        evidence: {
          en: "The dua asks: \"O Allah, send blessings upon Muhammad.\"",
          bn: "দোয়াটিতে চাওয়া হয়েছে: \"হে আল্লাহ, মুহাম্মদের ওপর রহমত বর্ষণ করুন।\"",
        },
      },
      {
        topic: "general-dhikr",
        link: "related",
      },
    ],
    searchTerms: [
      "দরুদ",
      "দরুদ শরীফ",
      "সালাওয়াত",
      "সালাম",
      "শুক্রবার",
      "ইব্রাহিমী",
      "durod",
      "dorud",
      "darood",
      "salawat",
      "salat",
      "ibrahimi",
      "durud sharif",
      "blessings on prophet",
    ],
  },

  /*
   * Expansion batch (2026-10-08). Every entry below went through the
   * verification pipeline: source located on a fetched page (sunnah.com
   * / quran.com), wording quoted from the fetched text, grading read
   * from the page, and iHadis-checked where noted. Two popular
   * candidates FAILED verification and were deliberately left out: the
   * "istighfar brings rizq" hadith (Abu Dawud 1518 — graded Da'if on
   * sunnah.com) and the "ghfir li walidayya" parents dua (no reliable
   * reference found). Weak or unverifiable content does not ship.
   */
  {
    id: "rabbi-inni-lima-anzalta",
    names: { en: "Rabbi inni lima anzalta", bn: "রাব্বি ইন্নী লিমা আনযালতা" },
    arabic: "رَبِّ إِنِّى لِمَآ أَنزَلْتَ إِلَىَّ مِنْ خَيْرٍ فَقِيرٌ",
    transliteration: "Rabbi inni lima anzalta ilayya min khayrin faqir",
    meaning: {
      en: "My Lord, I am in need of whatever good You send down to me.",
      bn: "হে আমার রব, আপনি আমার জন্য যে ভালো কিছু পাঠাবেন, আমি তারই মুখাপেক্ষী।",
    },
    category: "dua",
    practiceGuidance: {
      en: "A dua taught in the Quran. Musa (peace be upon him) prayed it, and it may be made at any time.",
      bn: "কুরআনে শেখানো দোয়া। মূসা (আঃ) এই দোয়া করেছিলেন। যেকোনো সময় করা যায়।",
    },
    source: {
      collection: "Quran",
      reference: "28:24",
      note: {
        en: "Surah al-Qasas 28:24 — Musa (as) made this dua after watering the flock of his future wife's family.",
        bn: "সূরা কাসাস ২৮:২৪ - মূসা (আঃ) তাঁর স্ত্রীর পরিবারের পশুগুলোকে পানি পান করিয়ে এই দোয়া করেছিলেন।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["quran.com/28:24"],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "rizq",
        link: "dua-for",
        evidence: {
          en: "The words ask directly for provision: \"My Lord, I am in need of whatever good You send down to me.\"",
          bn: "কথায় সরাসরি রিজিক চাওয়া হয়েছে: \"আপনি আমার জন্য যে ভালো কিছু পাঠাবেন, আমি তারই মুখাপেক্ষী।\"",
        },
      },
    ],
    searchTerms: [
      "রিজিক",
      "রিজিকের দোয়া",
      "রুজি",
      "জীবিকা",
      "মূসার দোয়া",
      "rijik",
      "rizik",
      "rizq dua",
      "musa dua",
      "sustenance",
      "provision",
      "income dua",
    ],
  },
  {
    id: "hasbunallahu-wa-nimal-wakil",
    names: { en: "Hasbunallahu wa ni'mal wakeel", bn: "হাসবুনাল্লাহু ওয়া নিমাল ওয়াকিল" },
    arabic: "حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakeel",
    meaning: {
      en: "Allah is sufficient for us, and He is the best Disposer of affairs.",
      bn: "আমাদের জন্য আল্লাহই যথেষ্ট, আর তিনিই সেরা ভরসাস্থল।",
    },
    category: "dua",
    practiceGuidance: {
      en: "Said when facing fear or hardship. The believers said it in the Quran, and Ibrahim (as) said it when he was thrown into the fire.",
      bn: "ভয় বা কঠিন মুহূর্তে বলা হয়। কুরআনে মুমিনরা এটি বলেছিলেন, আর ইব্রাহিম (আঃ) আগুনে নিক্ষেপের সময় বলেছিলেন।",
    },
    source: {
      collection: "Quran; Sahih al-Bukhari",
      reference: "3:173; 4564",
      note: {
        en: "Quran 3:173. Bukhari 4564 (Ibn Abbas): it was Ibrahim's (as) last statement when he was thrown into the fire.",
        bn: "কুরআন ৩:১৭৩। বুখারী ৪৫৬৪ (ইবনে আব্বাস): আগুনে নিক্ষেপের সময় এটিই ছিল ইব্রাহিম (আঃ)-এর শেষ কথা।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["quran.com/3:173", "sunnah.com/bukhari:4564"],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "tawakkul",
        link: "dua-for",
        evidence: {
          en: "The words declare reliance: \"Allah is sufficient for us, and He is the best Disposer of affairs.\"",
          bn: "কথায় ভরসার ঘোষণা আছে: \"আমাদের জন্য আল্লাহই যথেষ্ট, আর তিনিই সেরা ভরসাস্থল।\"",
        },
      },
      {
        topic: "sabr",
        link: "related",
      },
    ],
    searchTerms: [
      "ভরসা",
      "তাওয়াক্কুল",
      "হাসবুনাল্লাহ",
      "hasbunallah",
      "hasbuna",
      "hasbonallah",
      "tawakkul dua",
      "trust in allah",
      "ni'mal wakeel",
    ],
  },
  {
    id: "allahumma-inni-asaluka-alhuda",
    names: { en: "Allahumma inni as'aluka al-huda", bn: "আল্লাহুম্মা ইন্নী আসআলুকাল হুদা" },
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    transliteration:
      "Allahumma inni as'aluka al-huda wat-tuqa wal-'afafa wal-ghina",
    meaning: {
      en: "O Allah, I ask You for guidance, taqwa, chastity, and self-sufficiency.",
      bn: "হে আল্লাহ, আমি আপনার কাছে হেদায়েত, তাকওয়া, পাক-পবিত্রতা এবং অভাবমুক্তি চাই।",
    },
    category: "dua",
    practiceGuidance: {
      en: "Any time. The Prophet ﷺ used to make this dua regularly.",
      bn: "যেকোনো সময়। রাসূলুল্লাহ (সা.) নিয়মিত এই দোয়া করতেন।",
    },
    source: {
      collection: "Sahih Muslim",
      reference: "2721",
      note: {
        en: "Narrator: Abdullah (Ibn Mas'ud). Muslim 2721a — the Prophet ﷺ used to supplicate with these words.",
        bn: "বর্ণনায়: আবদুল্লাহ (ইবনে মাসউদ)। মুসলিম ২৭২১ক - রাসূলুল্লাহ (সা.) এই কথাগুলো দিয়েই দোয়া করতেন।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/muslim:2721a"],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "guidance",
        link: "dua-for",
        evidence: {
          en: "The words ask directly: \"I ask You for guidance (al-huda) and taqwa.\"",
          bn: "কথায় সরাসরি চাওয়া হয়েছে: \"আমি আপনার কাছে হেদায়েত ও তাকওয়া চাই।\"",
        },
      },
    ],
    searchTerms: [
      "হেদায়েত",
      "হেদায়াত",
      "তাকওয়া",
      "পথ দেখানোর দোয়া",
      "hedayet",
      "hedayat",
      "taqwa",
      "hidaayah",
      "guidance dua",
      "hidayah dua",
    ],
  },
  {
    id: "audhu-min-hammi-wal-hazan",
    names: { en: "Dua against worry & grief", bn: "দুশ্চিন্তা ও দুঃখ থেকে আশ্রয়ের দোয়া" },
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    transliteration:
      "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-jubni wal-bukhl, wa dala'id-dayni wa ghalabatir-rijal",
    meaning: {
      en: "O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from cowardice and miserliness, from the burden of debt, and from being overpowered by others.",
      bn: "হে আল্লাহ, আমি আপনার কাছে আশ্রয় চাই দুশ্চিন্তা ও দুঃখ থেকে, অক্ষমতা ও অলসতা থেকে, কাপুরুষতা ও কৃপণতা থেকে, ঋণের বোঝা থেকে এবং মানুষের প্রভাবাধীন হওয়া থেকে।",
    },
    category: "dua",
    practiceGuidance: {
      en: "Any time. The Prophet ﷺ used to say this dua, and Anas (ra) heard him repeat it whenever hardship came.",
      bn: "যেকোনো সময়। রাসূলুল্লাহ (সা.) এই দোয়া বলতেন; কোনো বিপদ এলেই তিনি এটি বেশি করে বলতেন - আনাস (রাঃ) শুনেছেন।",
    },
    source: {
      collection: "Sahih al-Bukhari",
      reference: "6369",
      note: {
        en: "Narrator: Anas bin Malik. Parallel: Bukhari 2893 (the Prophet ﷺ saying it repeatedly on a journey).",
        bn: "বর্ণনায়: আনাস ইবনে মালিক। সমতুল্য: বুখারী ২৮৯৩ (সফরে বারবার বলতেন)।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: [
        "sunnah.com/bukhari:6369",
        "sunnah.com/bukhari:2893",
        "ihadis.com/bukhari/hadith/6369",
      ],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "anxiety-worry",
        link: "dua-for",
        evidence: {
          en: "The dua opens by seeking refuge \"from worry and grief\" (al-hammi wal-hazan).",
          bn: "দোয়াটির শুরুতেই চাওয়া হয়েছে \"দুশ্চিন্তা ও দুঃখ থেকে\" আশ্রয়।",
        },
      },
    ],
    searchTerms: [
      "দুশ্চিন্তা",
      "দুঃখ",
      "উদ্বেগ",
      "টেনশন",
      "পেরেশানি",
      "মানসিক",
      "duschinta",
      "dushchinta",
      "pareshani",
      "tension",
      "anxiety dua",
      "worry dua",
      "grief",
      "hammi wal hazan",
    ],
  },
  {
    id: "bismika-allahumma-amutu-wa-ahya",
    names: { en: "Bismika Allahumma amutu wa ahya", bn: "বিসমিকা আল্লাহুম্মা আমূতু ওয়া আহইয়া" },
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    meaning: {
      en: "In Your name, O Allah, I die and I live.",
      bn: "হে আল্লাহ, আপনার নামেই আমি মরি আর বাঁচি।",
    },
    category: "dua",
    practiceGuidance: {
      en: "Before sleeping. The Prophet ﷺ said this whenever he went to bed.",
      bn: "ঘুমানোর আগে। রাসূলুল্লাহ (সা.) বিছানায় যাওয়ার সময় এই দোয়া বলতেন।",
    },
    source: {
      collection: "Sahih al-Bukhari",
      reference: "6324",
      note: {
        en: "Narrator: Hudhayfa. \"Whenever the Prophet ﷺ intended to go to bed, he would recite it.\"",
        bn: "বর্ণনায়: হুজাইফা। \"রাসূলুল্লাহ (সা.) যখনই ঘুমাতে যেতেন, তখন এই দোয়া বলতেন।\"",
      },
    },
    review: {
      status: "verified",
      verifiedSources: [
        "sunnah.com/bukhari:6324",
        "ihadis.com/bukhari/hadith/6324",
      ],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "sleep-evening",
        link: "occasion",
        evidence: {
          en: "The Prophet ﷺ said it whenever he went to bed (Bukhari 6324).",
          bn: "রাসূলুল্লাহ (সা.) বিছানায় যাওয়ার সময় এটি বলতেন (বুখারী ৬৩২৪)।",
        },
      },
    ],
    searchTerms: [
      "ঘুম",
      "ঘুমানোর আগের দোয়া",
      "রাতের দোয়া",
      "বিছানা",
      "ghum",
      "ghumar age",
      "ghumar doa",
      "bismika",
      "sleep dua",
      "bedtime dua",
      "night dua",
    ],
  },
  {
    id: "audhu-bikalimatillah-it-tammat",
    names: { en: "A'udhu bikalimatillahit-tammati", bn: "আউযু বিকালিমাতিল্লাহিত তাম্মাতি" },
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    meaning: {
      en: "I seek refuge in the perfect words of Allah from the evil of what He created.",
      bn: "আল্লাহর পূর্ণাঙ্গ কালিমার মাধ্যমে আমি তাঁর সৃষ্টির অনিষ্ট থেকে আশ্রয় চাই।",
    },
    category: "dua",
    practiceGuidance: {
      en: "In the evening. The Prophet ﷺ told a man stung by a scorpion at night that had he said it in the evening, the sting would not have harmed him. It is also said when stopping at a new place.",
      bn: "সন্ধ্যায়। রাতে বিচ্ছুতে দংশিত এক ব্যক্তিকে রাসূলুল্লাহ (সা.) বলেছিলেন, সন্ধ্যায় এই দোয়া পড়লে ক্ষতি হতো না। নতুন কোনো জায়গায় পৌঁছালেও এটি বলা হয়।",
    },
    source: {
      collection: "Sahih Muslim",
      reference: "2708; 2709",
      note: {
        en: "Narrators: Khaulah bint Hakim; Abu Huraira (the scorpion episode).",
        bn: "বর্ণনায়: খাওলা বিনতে হাকিম; আবূ হুরায়রা (বিচ্ছুর ঘটনা)।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: [
        "sunnah.com/muslim:2708",
        "sunnah.com/muslim:2709a",
      ],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "protection",
        link: "dua-for",
        evidence: {
          en: "The words seek refuge \"from the evil of what He created\" — a direct request for protection.",
          bn: "কথায় \"তাঁর সৃষ্টির অনিষ্ট থেকে\" আশ্রয় চাওয়া হয়েছে - সরাসরি হেফাজতের প্রার্থনা।",
        },
      },
      {
        topic: "sleep-evening",
        link: "occasion",
        evidence: {
          en: "The Prophet ﷺ tied it to the evening: \"Had you said it when evening came…\" (Muslim 2709).",
          bn: "রাসূলুল্লাহ (সা.) এটিকে সন্ধ্যার সঙ্গে যুক্ত করেছেন: \"যদি তুমি সন্ধ্যায় এটি বলতে...\" (মুসলিম ২৭০৯)।",
        },
      },
    ],
    searchTerms: [
      "হেফাজত",
      "সন্ধ্যার দোয়া",
      "বিচ্ছু",
      "hefazot",
      "hefajot",
      "shondhar doa",
      "bischhu",
      "protection dua",
      "evening dua",
      "kalimatillah",
      "tammati",
    ],
  },
  {
    id: "ayat-al-kursi",
    names: { en: "Ayat al-Kursi", bn: "আয়াতুল কুরসি" },
    arabic:
      "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
    transliteration:
      "Allahu la ilaha illa huwal-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard, man dhal-ladhi yashfa'u 'indahu illa bi'idhnih, ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bishay'im-min 'ilmihi illa bima sha', wasi'a kursiyyuhus-samawati wal-ard, wa la ya'uduhu hifzuhuma, wa huwal-'aliyyul-'azim",
    meaning: {
      en: "The greatest verse of the Quran (2:255) — a declaration of Allah's oneness, His ever-living nature, and His guardianship over all creation.",
      bn: "কুরআনের সর্বশ্রেষ্ঠ আয়াত (২:২৫৫) - আল্লাহর একত্ববাদ, তাঁর চিরঞ্জীবত্ব এবং সৃষ্টিজগতের ওপর তাঁর রক্ষণাবেক্ষণের ঘোষণা।",
    },
    category: "dua",
    practiceGuidance: {
      en: "Before sleeping. The Prophet ﷺ said: when you go to bed, recite Ayat al-Kursi — a guardian from Allah will remain over you, and no devil will come near you until morning.",
      bn: "ঘুমানোর আগে। রাসূলুল্লাহ (সা.) বলেছেন: বিছানায় গেলে আয়াতুল কুরসি পড়বে - আল্লাহর পক্ষ থেকে একজন হেফাজতকারী তোমার সঙ্গে থাকবে, ভোর পর্যন্ত শয়তান কাছে আসবে না।",
    },
    source: {
      collection: "Quran; Sahih al-Bukhari",
      reference: "2:255; 2311",
      note: {
        en: "Quran 2:255. Bukhari 2311 (Abu Huraira): the night-guard narration — the Prophet ﷺ commanded reciting it before sleep.",
        bn: "কুরআন ২:২৫৫। বুখারী ২৩১১ (আবূ হুরায়রা): রাতের প্রহরীর ঘটনা - রাসূলুল্লাহ (সা.) ঘুমানোর আগে পড়ার নির্দেশ দিয়েছেন।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["quran.com/2:255", "sunnah.com/bukhari:2311"],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "sleep-evening",
        link: "occasion",
        evidence: {
          en: "\"When you go to bed, recite Ayat al-Kursi…\" (Bukhari 2311).",
          bn: "\"বিছানায় গেলে আয়াতুল কুরসি পড়বে...\" (বুখারী ২৩১১)।",
        },
      },
      {
        topic: "protection",
        link: "related",
      },
    ],
    searchTerms: [
      "আয়াতুল কুরসি",
      "কুরসি",
      "ঘুমানোর আগে",
      "হেফাজত",
      "ayatul kursi",
      "ayat kursi",
      "kursi",
      "throne verse",
      "kursi ayat",
      "biggest ayat",
    ],
  },
  {
    id: "bismillahilladhi-la-yadurru",
    names: { en: "Bismillahilladhi la yadurru", bn: "বিসমিল্লাহিল্লাজি লা ইয়াদুররু" },
    arabic:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration:
      "Bismillahilladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim",
    meaning: {
      en: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm; and He is the All-Hearing, the All-Knowing.",
      bn: "আল্লাহর নামে, যাঁর নামের বরকতে আসমান ও জমিনের কোনো কিছুই ক্ষতি করতে পারে না; তিনি সর্বশ্রোতা, মহাজ্ঞানী।",
    },
    category: "dua",
    practiceGuidance: {
      en: "Three times in the morning and three times in the evening — the count and times come from the narration itself.",
      bn: "সকালে তিনবার ও সন্ধ্যায় তিনবার - সংখ্যা ও সময় নিজেই হাদিসে এসেছে।",
    },
    source: {
      collection: "Jami at-Tirmidhi; Sunan Abi Dawud",
      reference: "3388; 5088",
      note: {
        en: "Narrator: Uthman (ra). Tirmidhi 3388: Hasan (Darussalam); Abu Dawud 5088: Sahih (Al-Albani). The narration states the one who says it three times morning/evening will not be struck by sudden affliction.",
        bn: "বর্ণনায়: উসমান (রাঃ)। তিরমিজী ৩৩৮৮: হাসান (দারুসসালাম); আবু দাউদ ৫০৮৮: সহীহ (আলবানী)। হাদিসে এসেছে, সকাল-সন্ধ্যা তিনবার বললে হঠাৎ বিপদ আসবে না।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: [
        "sunnah.com/tirmidhi:3388",
        "sunnah.com/abudawud:5088",
        "ihadis.com/abu-dawud/hadith/5088",
      ],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "protection",
        link: "dua-for",
        evidence: {
          en: "The words invoke Allah's name against all harm, and the narration itself promises freedom from sudden affliction (Abu Dawud 5088).",
          bn: "কথায় সব ক্ষতির বিরুদ্ধে আল্লাহর নামে আশ্রয় নেওয়া হয়েছে; হাদিসেই হঠাৎ বিপদ থেকে নিরাপত্তার কথা এসেছে (আবু দাউদ ৫০৮৮)।",
        },
      },
      {
        topic: "sleep-evening",
        link: "occasion",
        evidence: {
          en: "\"Three times in the morning and three times in the evening\" (Tirmidhi 3388).",
          bn: "\"সকালে তিনবার ও সন্ধ্যায় তিনবার\" (তিরমিজী ৩৩৮৮)।",
        },
      },
    ],
    searchTerms: [
      "হেফাজত",
      "সকালের দোয়া",
      "সন্ধ্যার দোয়া",
      "ক্ষতি থেকে",
      "hefazot",
      "shokaler doa",
      "shondhar doa",
      "bismillahillaji",
      "la yadurru",
      "yadurru",
      "protection dua",
      "morning evening dua",
    ],
  },
  {
    id: "inna-lillahi-wa-inna-ilayhi-rajion",
    names: { en: "Inna lillahi wa inna ilayhi raji'un", bn: "ইন্না লিল্লাহি ওয়া ইন্না ইলাইহি রাজিউন" },
    arabic:
      "إِنَّا لِلَّهِ وَإِنَّآ إِلَيْهِ رَٰجِعُونَ ۝ اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
    transliteration:
      "Inna lillahi wa inna ilayhi raji'un. Allahumma'jurni fi musibati wa akhlif li khayran minha",
    meaning: {
      en: "We belong to Allah, and to Him we return. O Allah, reward me for my affliction and give me something better than it in exchange.",
      bn: "আমরা আল্লাহরই, আর তাঁরই দিকে প্রত্যাবর্তনকারী। হে আল্লাহ, আমার এই মুসিবতের প্রতিদান দিন এবং এর চেয়ে উত্তম কিছু দান করুন।",
    },
    category: "dua",
    practiceGuidance: {
      en: "At calamity or loss. The Prophet ﷺ taught this; Umm Salama (ra) said it at her husband's death, and Allah gave her better.",
      bn: "মুসিবত বা ক্ষতির সময়। রাসূলুল্লাহ (সা.) এটি শেখানোর নির্দেশ দিয়েছেন; উম্মু সালামা (রাঃ) স্বামীর মৃত্যুতে এটি বলেছিলেন, আর আল্লাহ তাঁকে তার চেয়ে উত্তম দান করেছেন।",
    },
    source: {
      collection: "Quran; Sahih Muslim",
      reference: "2:156; 918",
      note: {
        en: "Quran 2:156 — the istirja of those afflicted. Muslim 918 (Umm Salama): the Prophet ﷺ taught the dua said at calamity.",
        bn: "কুরআন ২:১৫৬ - মুসিবতের সময় বলার ইস্তিরজা। মুসলিম ৯১৮ (উম্মু সালামা): মুসিবতের সময়ের এই দোয়া রাসূলুল্লাহ (সা.) শেখিয়েছেন।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: [
        "quran.com/2:156",
        "sunnah.com/muslim:918",
        "ihadis.com/muslim/12",
      ],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "sabr",
        link: "occasion",
        evidence: {
          en: "Quran 2:156 and Muslim 918 tie these words to the moment calamity strikes — the practice of sabr itself.",
          bn: "কুরআন ২:১৫৬ ও মুসলিম ৯১৮ এই কথাগুলোকে মুসিবতের মুহূর্তের সঙ্গে যুক্ত করেছে - এটিই সবরের আমল।",
        },
      },
    ],
    searchTerms: [
      "মুসিবত",
      "সবর",
      "ধৈর্য",
      "কষ্ট",
      "মৃত্যু",
      "ক্ষতি",
      "musibot",
      "shobor",
      "istirja",
      "istirja dua",
      "inna lillah",
      "calamity dua",
      "loss",
      "death dua",
    ],
  },
  {
    id: "rabbana-atina-fid-dunya",
    names: { en: "Rabbana atina fid-dunya hasanah", bn: "রাব্বানা আতিনা ফিদ্দুনিয়া হাসানাহ" },
    arabic:
      "رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْـَٔاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ",
    transliteration:
      "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
    meaning: {
      en: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
      bn: "হে আমাদের রব, আমাদের দুনিয়াতে কল্যাণ দান করুন, আখিরাতেও কল্যাণ দান করুন, আর জাহান্নামের আযাব থেকে হেফাজত করুন।",
    },
    category: "dua",
    practiceGuidance: {
      en: "A dua the Quran itself teaches. It may be made at any time.",
      bn: "কুরআন নিজেই যে দোয়া শেখিয়েছে। যেকোনো সময় করা যায়।",
    },
    source: {
      collection: "Quran",
      reference: "2:201",
      note: {
        en: "Surah al-Baqarah 2:201 — presented as the dua of those who ask for good in both worlds.",
        bn: "সূরা বাকারা ২:২০১ - দুনিয়া ও আখিরাত দুজগতের কল্যাণ চাওয়া মানুষের দোয়া হিসেবে এসেছে।",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["quran.com/2:201"],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "akhirah",
        link: "dua-for",
        evidence: {
          en: "The words ask for \"good in the Hereafter\" and protection \"from the punishment of the Fire\".",
          bn: "কথায় \"আখিরাতের কল্যাণ\" এবং \"জাহান্নামের আযাব থেকে হেফাজত\" চাওয়া হয়েছে।",
        },
      },
    ],
    searchTerms: [
      "আখিরাত",
      "পরকাল",
      "জান্নাত",
      "দোজখ",
      "দুনিয়া",
      "akhirat",
      "porkal",
      "jannat",
      "dojok",
      "rabbana",
      "rabbana atina",
      "hasanah",
      "hereafter dua",
      "duniya o akhirat",
    ],
  },
  {
    id: "rabbir-hamhuma",
    names: { en: "Rabbir hamhuma kama rabbayani saghira", bn: "রব্বির হামহুমা কামা রাব্বায়ানী সগীরা" },
    arabic: "رَبِّ ٱرْحَمْهُمَا كَمَا رَبَّيَانِى صَغِيرًا",
    transliteration: "Rabbir-hamhuma kama rabbayani saghira",
    meaning: {
      en: "My Lord, have mercy on them as they raised me when I was young.",
      bn: "হে আমার রব, আমার বাবা-মায়ের ওপর রহম করুন, যেভাবে তাঁরা ছোটবেলায় আমাকে লালন-পালন করেছেন।",
    },
    category: "dua",
    practiceGuidance: {
      en: "A dua for parents that the Quran itself commands. May be made at any time.",
      bn: "কুরআন নিজেই যে দোয়ার নির্দেশ দিয়েছে - বাবা-মায়ের জন্য। যেকোনো সময় করা যায়।",
    },
    source: {
      collection: "Quran",
      reference: "17:24",
      note: {
        en: "Surah al-Isra 17:24 — \"and say: My Lord, have mercy on them as they raised me when I was small.\"",
        bn: "সূরা বনী ইসরাঈল ১৭:২৪ - \"এবং বলুন: হে আমার রব, তাঁদের ওপর রহম করুন, যেভাবে তাঁরা ছোটবেলায় আমাকে বড় করেছেন।\"",
      },
    },
    review: {
      status: "verified",
      verifiedSources: ["quran.com/17:24"],
      verifiedAt: "2026-10-08",
    },
    topics: [
      {
        topic: "family-parents",
        link: "dua-for",
        evidence: {
          en: "The verse commands: \"and say: My Lord, have mercy on them…\" — a Quran-prescribed dua for parents.",
          bn: "আয়াতে নির্দেশ এসেছে: \"এবং বলুন: হে আমার রব, তাঁদের ওপর রহম করুন...\" - বাবা-মায়ের জন্য কুরআন-নির্দেশিত দোয়া।",
        },
      },
    ],
    searchTerms: [
      "বাবা-মা",
      "বাবা-মার দোয়া",
      "মা",
      "বাবা",
      "baba-ma",
      "babar doa",
      "mar doa",
      "parents dua",
      "hamhuma",
      "rabbayani",
      "mercy for parents",
    ],
  },
];
