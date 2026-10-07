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
  },
];
