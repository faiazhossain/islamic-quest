import type { Dhikr } from "./types";

/**
 * Draft catalog (2026-10-05). Text below is the widely memorized form of
 * each dhikr; Arabic and translations still need a proofread pass.
 *
 * TODO(verify, task E1): fill source.collection and source.reference from
 * the established compilation, then a scholar or student of knowledge
 * flips review.status to "reviewed". Quests whose dhikr is not reviewed
 * are excluded from production builds by isQuestPublic() in index.ts.
 */
export const DHIKR: Dhikr[] = [
  {
    id: "astaghfirullah",
    names: { en: "Astaghfirullah" },
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    meaning: { en: "I seek Allah's forgiveness." },
    category: "istighfar",
    practiceGuidance: { en: "Any time." },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "6307; 2702",
      note: "Bukhari 6307 (Abu Huraira): more than seventy times a day. Muslim 2702 (al-Agharr al-Muzani): a hundred times a day.",
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:6307", "sunnah.com/muslim:2702"],
      verifiedAt: "2026-10-05",
    },
  },
  {
    id: "sayyid-ul-istighfar",
    names: { en: "Sayyid al-Istighfar" },
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allahumma anta Rabbi, la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi, faghfir li, fa innahu la yaghfirudh-dhunuba illa anta.",
    meaning: {
      en: "O Allah, You are my Lord; there is no god but You. You created me and I am Your servant. I keep Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me — none forgives sins but You.",
    },
    category: "istighfar",
    practiceGuidance: { en: "Any time." },
    source: {
      collection: "Sahih al-Bukhari",
      reference: "6306",
      note: "Narrator: Shaddad ibn Aws. Parallel: Jami at-Tirmidhi 3393 (Sahih, Darussalam grading).",
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:6306", "sunnah.com/tirmidhi:3393"],
      verifiedAt: "2026-10-05",
    },
  },
  {
    id: "subhanallah",
    names: { en: "Subhanallah" },
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhanallah",
    meaning: { en: "Glory be to Allah." },
    category: "tasbih",
    practiceGuidance: { en: "Any time." },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "843; 596a; 5362",
      note: "Part of the 33/33/34 tasbih. Narrations: Bukhari 843 (Abu Huraira); Muslim 596a (Ka'b ibn Ujrah, explicit 33/33/34); Bukhari 5362 (Ali).",
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:843", "sunnah.com/muslim:596a"],
      verifiedAt: "2026-10-05",
    },
  },
  {
    id: "alhamdulillah",
    names: { en: "Alhamdulillah" },
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    meaning: { en: "All praise is for Allah." },
    category: "tasbih",
    practiceGuidance: { en: "Any time." },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "843; 596a; 5362",
      note: "Part of the 33/33/34 tasbih. Narrations: Bukhari 843 (Abu Huraira); Muslim 596a (Ka'b ibn Ujrah, explicit 33/33/34); Bukhari 5362 (Ali).",
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:843", "sunnah.com/muslim:596a"],
      verifiedAt: "2026-10-05",
    },
  },
  {
    id: "allahu-akbar",
    names: { en: "Allahu Akbar" },
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    meaning: { en: "Allah is the Greatest." },
    category: "tasbih",
    practiceGuidance: { en: "Any time." },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "843; 596a; 5362",
      note: "Part of the 33/33/34 tasbih. Narrations: Bukhari 843 (Abu Huraira); Muslim 596a (Ka'b ibn Ujrah, explicit 33/33/34); Bukhari 5362 (Ali).",
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:843", "sunnah.com/muslim:596a"],
      verifiedAt: "2026-10-05",
    },
  },
  {
    id: "la-ilaha-illallah",
    names: { en: "La ilaha illallah" },
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illallah",
    meaning: { en: "There is no god but Allah." },
    category: "dhikr",
    practiceGuidance: { en: "Any time." },
    source: {
      collection: "Jami at-Tirmidhi",
      reference: "3383",
      note: "Jabir ibn Abdillah. Graded Hasan (Darussalam). Cited alone deliberately: no Bukhari/Muslim narration states this exact phrasing.",
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/tirmidhi:3383"],
      verifiedAt: "2026-10-05",
    },
  },
  {
    id: "subhanallahi-wa-bihamdihi",
    names: { en: "Subhanallahi wa bihamdih" },
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhanallahi wa bihamdih",
    meaning: { en: "Glory be to Allah, and praise is His." },
    category: "tasbih",
    practiceGuidance: { en: "Any time." },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "6405; 2691",
      note: "Abu Huraira. One hundred times a day. In Muslim 2691 this tasbih appears within a longer narration.",
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:6405", "sunnah.com/muslim:2691"],
      verifiedAt: "2026-10-05",
    },
  },
  {
    id: "hawqala",
    names: { en: "Hawqala" },
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    meaning: { en: "There is no might nor power except with Allah." },
    category: "dhikr",
    practiceGuidance: { en: "Any time." },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "6384; 2704",
      note: "Abu Musa al-Ash'ari. Parallels: Bukhari 6610, 7386.",
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:6384", "sunnah.com/muslim:2704"],
      verifiedAt: "2026-10-05",
    },
  },
  {
    id: "salawat-ibrahimiyya",
    names: { en: "Salawat (Ibrahimiyya)" },
    arabic:
      "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration:
      "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammadin, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahima, innaka Hamidum Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammadin, kama barakta 'ala Ibrahima wa 'ala ali Ibrahima, innaka Hamidum Majid.",
    meaning: {
      en: "O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious.",
    },
    category: "salawat",
    practiceGuidance: { en: "Any time." },
    source: {
      collection: "Sahih al-Bukhari; Sahih Muslim",
      reference: "3370; 406",
      note: "Ka'b ibn Ujrah. Parallels: Bukhari 4797, 6357; Tirmidhi 483 (hasan sahih gharib).",
    },
    review: {
      status: "verified",
      verifiedSources: ["sunnah.com/bukhari:3370", "sunnah.com/muslim:406"],
      verifiedAt: "2026-10-05",
    },
  },
];
