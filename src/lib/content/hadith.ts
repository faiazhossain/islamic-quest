import type { HadithEntry } from "./types";

/**
 * Guidance hadith for the quest detail sheet (2026-10-06).
 *
 * Verification pass: every Arabic matn below was cross-checked on
 * 2026-10-06 against sunnah.com (web reader) and the open
 * fawazahmed0/hadith-api dataset (whose Bukhari numbering and Muslim
 * "arabicnumber" field reproduce the sunnah.com/Fu'ad Abdul Baqi
 * numbering). English renderings are composed for Amalyn — they are
 * faithful paraphrases, never copies of published translations.
 *
 * Drop rule enforced during research: a narration whose number or grading
 * could not be confirmed online was left out entirely (e.g. Tirmidhi 2457,
 * graded da'if by Darussalam; Muslim 2723, a different narration).
 *
 * Narrations are entered once and may guide several amals through
 * dhikrIds. Review status here is per-entry and never inherited from the
 * parent dhikr: these citations are reference-verified, and scholar
 * re-review of this guidance layer is an open launch item.
 *
 * Access hadith through hadithForDhikr() in index.ts, never by reading
 * HADITH directly from UI code — the helper applies the environment gate.
 */
export const HADITH: HadithEntry[] = [
  {
    id: "istighfar-seventy-a-day-bukhari-6307",
    dhikrIds: ["astaghfirullah"],
    theme: "prophets-practice",
    arabic:
      "وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً",
    translation: {
      en: "By Allah, I seek Allah's forgiveness and turn to Him in repentance more than seventy times a day.",
    },
    narrator: "Abu Huraira",
    collection: "Sahih al-Bukhari",
    reference: "6307",
    sourceUrl: "https://sunnah.com/bukhari:6307",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:6307"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "istighfar-hundred-a-day-muslim-2702",
    dhikrIds: ["astaghfirullah"],
    theme: "prophets-practice",
    arabic:
      "إِنَّهُ لَيُغَانُ عَلَى قَلْبِي وَإِنِّي لأَسْتَغْفِرُ اللَّهَ فِي الْيَوْمِ مِائَةَ مَرَّةٍ",
    translation: {
      en: "At times a veil settles over my heart, so I seek Allah's forgiveness a hundred times a day.",
    },
    narrator: "al-Agharr al-Muzani",
    collection: "Sahih Muslim",
    reference: "2702",
    sourceUrl: "https://sunnah.com/muslim:2702",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/muslim:2702"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "istighfar-al-azim-forgiveness-tirmidhi-3577",
    dhikrIds: ["astaghfirullah"],
    theme: "reward",
    arabic:
      "مَنْ قَالَ أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَىُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ، غُفِرَ لَهُ وَإِنْ كَانَ فَرَّ مِنَ الزَّحْفِ",
    translation: {
      en: "Whoever says, 'I seek the forgiveness of Allah the Almighty, than whom there is no god but He, the Ever-Living, the Sustainer, and I turn to Him in repentance,' is forgiven — even if he fled from battle.",
    },
    narrator: "Abdullah ibn Busr",
    collection: "Jami at-Tirmidhi",
    reference: "3577",
    grade: "Hasan (Darussalam)",
    sourceUrl: "https://sunnah.com/tirmidhi:3577",
    note: "The istighfar here is the longer phrase quoted in the hadith.",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/tirmidhi:3577"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "sayyid-ul-istighfar-paradise-bukhari-6306",
    dhikrIds: ["sayyid-ul-istighfar"],
    theme: "occasion",
    arabic:
      "وَمَنْ قَالَهَا مِنَ النَّهَارِ مُوقِنًا بِهَا، فَمَاتَ مِنْ يَوْمِهِ قَبْلَ أَنْ يُمْسِيَ، فَهُوَ مِنْ أَهْلِ الْجَنَّةِ، وَمَنْ قَالَهَا مِنَ اللَّيْلِ وَهْوَ مُوقِنٌ بِهَا، فَمَاتَ قَبْلَ أَنْ يُصْبِحَ، فَهْوَ مِنْ أَهْلِ الْجَنَّةِ",
    translation: {
      en: "Whoever says it once during the day, believing firmly in it, and dies before evening is among the people of Paradise; and whoever says it at night, believing firmly in it, and dies before morning is among the people of Paradise.",
    },
    narrator: "Shaddad ibn Aws",
    collection: "Sahih al-Bukhari",
    reference: "6306",
    sourceUrl: "https://sunnah.com/bukhari:6306",
    note: "The Prophet ﷺ taught this as the master of all istighfar, for morning and night. Parallel: Jami at-Tirmidhi 3393.",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:6306"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "tasbih-after-prayer-bukhari-843",
    dhikrIds: ["subhanallah", "alhamdulillah", "allahu-akbar"],
    theme: "prophets-practice",
    arabic:
      "أَلاَ أُحَدِّثُكُمْ بِأَمْرٍ إِنْ أَخَذْتُمْ بِهِ أَدْرَكْتُمْ مَنْ سَبَقَكُمْ وَلَمْ يُدْرِكْكُمْ أَحَدٌ بَعْدَكُمْ، وَكُنْتُمْ خَيْرَ مَنْ أَنْتُمْ بَيْنَ ظَهْرَانَيْهِ، إِلاَّ مَنْ عَمِلَ مِثْلَهُ: تُسَبِّحُونَ وَتَحْمَدُونَ وَتُكَبِّرُونَ خَلْفَ كُلِّ صَلاَةٍ ثَلاَثًا وَثَلاَثِينَ",
    translation: {
      en: "Shall I not tell you of a practice by which you will catch up with those ahead of you, and no one after you will overtake you — none who does its like? Glorify Allah, praise Him, and declare His greatness thirty-three times after every prayer.",
    },
    narrator: "Abu Huraira",
    collection: "Sahih al-Bukhari",
    reference: "843",
    sourceUrl: "https://sunnah.com/bukhari:843",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:843"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "tasbih-33-33-34-muslim-596a",
    dhikrIds: ["subhanallah", "alhamdulillah", "allahu-akbar"],
    theme: "prophets-practice",
    arabic:
      "مُعَقِّبَاتٌ لاَ يَخِيبُ قَائِلُهُنَّ - أَوْ فَاعِلُهُنَّ - دُبُرَ كُلِّ صَلاَةٍ مَكْتُوبَةٍ ثَلاَثٌ وَثَلاَثُونَ تَسْبِيحَةً وَثَلاَثٌ وَثَلاَثُونَ تَحْمِيدَةً وَأَرْبَعٌ وَثَلاَثُونَ تَكْبِيرَةً",
    translation: {
      en: "Phrases that follow one another — never disappointing the one who says them — after every prescribed prayer: thirty-three glorifications, thirty-three praises, and thirty-four declarations of greatness.",
    },
    narrator: "Ka'b ibn Ujrah",
    collection: "Sahih Muslim",
    reference: "596a",
    sourceUrl: "https://sunnah.com/muslim:596a",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/muslim:596a"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "tasbih-sea-foam-muslim-597a",
    dhikrIds: ["subhanallah", "alhamdulillah", "allahu-akbar"],
    theme: "reward",
    arabic:
      "مَنْ سَبَّحَ اللَّهَ فِي دُبُرِ كُلِّ صَلاَةٍ ثَلاَثًا وَثَلاَثِينَ وَحَمِدَ اللَّهَ ثَلاَثًا وَثَلاَثِينَ وَكَبَّرَ اللَّهَ ثَلاَثًا وَثَلاَثِينَ فَتِلْكَ تِسْعَةٌ وَتِسْعُونَ وَقَالَ تَمَامَ الْمِائَةِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ غُفِرَتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ",
    translation: {
      en: "Whoever glorifies Allah after every prayer thirty-three times, praises Him thirty-three times, and declares His greatness thirty-three times — ninety-nine in all — and completes the hundred by saying 'There is no god but Allah alone, without partner; His is the dominion and His is the praise, and He is over all things powerful' — his wrongs are forgiven, even if they were as abundant as the foam of the sea.",
    },
    narrator: "Abu Huraira",
    collection: "Sahih Muslim",
    reference: "597a",
    sourceUrl: "https://sunnah.com/muslim:597a",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/muslim:597a"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "tasbih-fatimah-before-sleep-bukhari-3113",
    dhikrIds: ["subhanallah", "alhamdulillah", "allahu-akbar"],
    theme: "occasion",
    arabic:
      "أَلاَ أَدُلُّكُمَا عَلَى خَيْرٍ مِمَّا سَأَلْتُمَاهُ، إِذَا أَخَذْتُمَا مَضَاجِعَكُمَا فَكَبِّرَا اللَّهَ أَرْبَعًا وَثَلاَثِينَ، وَاحْمَدَا ثَلاَثًا وَثَلاَثِينَ، وَسَبِّحَا ثَلاَثًا وَثَلاَثِينَ، فَإِنَّ ذَلِكَ خَيْرٌ لَكُمَا مِمَّا سَأَلْتُمَاهُ",
    translation: {
      en: "Shall I not guide you both to something better than what you asked for? When you go to your beds, declare Allah's greatness thirty-four times, praise Him thirty-three times, and glorify Him thirty-three times — that is better for you both than a servant.",
    },
    narrator: "Ali",
    collection: "Sahih al-Bukhari",
    reference: "3113",
    sourceUrl: "https://sunnah.com/bukhari:3113",
    note: "The Prophet ﷺ said this to Ali and Fatimah. Parallel: Sahih Muslim 2727a.",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:3113"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "four-beloved-words-muslim-2137a",
    dhikrIds: [
      "subhanallah",
      "alhamdulillah",
      "allahu-akbar",
      "la-ilaha-illallah",
    ],
    theme: "reward",
    arabic:
      "أَحَبُّ الْكَلاَمِ إِلَى اللَّهِ أَرْبَعٌ سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلاَ إِلَهَ إِلاَّ اللَّهُ وَاللَّهُ أَكْبَرُ",
    translation: {
      en: "The words most beloved to Allah are four: Glory be to Allah; all praise is for Allah; there is no god but Allah; and Allah is the Greatest.",
    },
    narrator: "Samura ibn Jundab",
    collection: "Sahih Muslim",
    reference: "2137a",
    sourceUrl: "https://sunnah.com/muslim:2137a",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/muslim:2137a"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "la-best-dhikr-tirmidhi-3383",
    dhikrIds: ["la-ilaha-illallah"],
    theme: "reward",
    arabic:
      "أَفْضَلُ الذِّكْرِ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَفْضَلُ الدُّعَاءِ الْحَمْدُ لِلَّهِ",
    translation: {
      en: "The best remembrance is 'There is no god but Allah,' and the best supplication is 'All praise is for Allah.'",
    },
    narrator: "Jabir ibn Abdillah",
    collection: "Jami at-Tirmidhi",
    reference: "3383",
    grade: "Hasan (Darussalam)",
    sourceUrl: "https://sunnah.com/tirmidhi:3383",
    note: "Cited alone deliberately: no Bukhari or Muslim narration states this exact phrasing.",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/tirmidhi:3383"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "la-hundred-freeing-slaves-bukhari-3293",
    dhikrIds: ["la-ilaha-illallah"],
    theme: "reward",
    arabic:
      "مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ، فِي يَوْمٍ مِائَةَ مَرَّةٍ، كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ، وَكُتِبَتْ لَهُ مِائَةُ حَسَنَةٍ، وَمُحِيَتْ عَنْهُ مِائَةُ سَيِّئَةٍ، وَكَانَتْ لَهُ حِرْزًا مِنَ الشَّيْطَانِ يَوْمَهُ ذَلِكَ حَتَّى يُمْسِيَ، وَلَمْ يَأْتِ أَحَدٌ بِأَفْضَلَ مِمَّا جَاءَ بِهِ، إِلاَّ أَحَدٌ عَمِلَ أَكْثَرَ مِنْ ذَلِكَ",
    translation: {
      en: "Whoever says one hundred times in a day, 'There is no god but Allah alone, without partner; His is the dominion and His is the praise, and He is over all things powerful' — it is the like of freeing ten slaves; a hundred good deeds are written for him, a hundred wrongs are wiped away, and he is sheltered from Satan that day until evening. No one brings anything better than what he brought, except one who does more.",
    },
    narrator: "Abu Huraira",
    collection: "Sahih al-Bukhari",
    reference: "3293",
    sourceUrl: "https://sunnah.com/bukhari:3293",
    note: "The promised wording is the fuller declaration that opens with the shahada itself.",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:3293"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "la-dies-knowing-paradise-muslim-26a",
    dhikrIds: ["la-ilaha-illallah"],
    theme: "reward",
    arabic: "مَنْ مَاتَ وَهُوَ يَعْلَمُ أَنَّهُ لاَ إِلَهَ إِلاَّ اللَّهُ دَخَلَ الْجَنَّةَ",
    translation: {
      en: "Whoever dies knowing that there is no god but Allah enters Paradise.",
    },
    narrator: "Uthman ibn Affan",
    collection: "Sahih Muslim",
    reference: "26a",
    sourceUrl: "https://sunnah.com/muslim:26a",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/muslim:26a"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "swb-hundred-a-day-bukhari-6405",
    dhikrIds: ["subhanallahi-wa-bihamdihi"],
    theme: "reward",
    arabic:
      "مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ، وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ",
    translation: {
      en: "Whoever says 'Glory be to Allah, and praise is His' a hundred times in a day, his wrongs are cast away, even if they were as abundant as the foam of the sea.",
    },
    narrator: "Abu Huraira",
    collection: "Sahih al-Bukhari",
    reference: "6405",
    sourceUrl: "https://sunnah.com/bukhari:6405",
    note: "Parallel: Sahih Muslim 2691.",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:6405"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "swb-light-on-the-tongue-bukhari-6682",
    dhikrIds: ["subhanallahi-wa-bihamdihi"],
    theme: "reward",
    arabic:
      "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    translation: {
      en: "Two phrases, light on the tongue, heavy on the scale, beloved to the Most Merciful: 'Glory be to Allah, and praise is His; glory be to Allah the Almighty.'",
    },
    narrator: "Abu Huraira",
    collection: "Sahih al-Bukhari",
    reference: "6682",
    sourceUrl: "https://sunnah.com/bukhari:6682",
    note: "Parallel: Sahih Muslim 2694.",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:6682"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "hawqala-treasure-bukhari-6384",
    dhikrIds: ["hawqala"],
    theme: "prophets-practice",
    arabic:
      "ثُمَّ أَتَى عَلَيَّ وَأَنَا أَقُولُ فِي نَفْسِي لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ، فَقَالَ: يَا عَبْدَ اللَّهِ بْنَ قَيْسٍ، قُلْ لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ فَإِنَّهَا كَنْزٌ مِنْ كُنُوزِ الْجَنَّةِ",
    translation: {
      en: "He came upon me while I was saying quietly, 'There is no might nor power except with Allah,' and he said: O Abdullah ibn Qays, say 'There is no might nor power except with Allah,' for it is a treasure among the treasures of Paradise.",
    },
    narrator: "Abu Musa al-Ashari",
    collection: "Sahih al-Bukhari",
    reference: "6384",
    sourceUrl: "https://sunnah.com/bukhari:6384",
    note: "On a journey, after telling the Companions not to raise their voices in du'a. Parallel: Sahih Muslim 2704.",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:6384"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "salawat-tashahhud-gift-bukhari-3370",
    dhikrIds: ["salawat-ibrahimiyya"],
    theme: "prophets-practice",
    arabic:
      "قُولُوا اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    translation: {
      en: "They asked: O Messenger of Allah, how should we send blessings upon you, the people of the household? For Allah has taught us how to greet you. He said: Say — O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. And O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious.",
    },
    narrator: "Ka'b ibn Ujrah",
    collection: "Sahih al-Bukhari",
    reference: "3370",
    sourceUrl: "https://sunnah.com/bukhari:3370",
    note: "The wording of the tashahhud taught to the Companions. Parallel: Sahih Muslim 406.",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:3370"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "salawat-ten-mercies-muslim-408",
    dhikrIds: ["salawat-ibrahimiyya"],
    theme: "reward",
    arabic: "مَنْ صَلَّى عَلَىَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا",
    translation: {
      en: "Whoever sends one blessing upon me, Allah sends ten blessings upon him.",
    },
    narrator: "Abu Huraira",
    collection: "Sahih Muslim",
    reference: "408",
    sourceUrl: "https://sunnah.com/muslim:408",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/muslim:408"],
      verifiedAt: "2026-10-06",
    },
  },
  {
    id: "salawat-friday-presented-riyad-1158",
    dhikrIds: ["salawat-ibrahimiyya"],
    theme: "occasion",
    arabic:
      "إِنَّ مِنْ أَفْضَلِ أَيَّامِكُمْ يَوْمَ الْجُمُعَةِ، فَأَكْثِرُوا عَلَيَّ مِنَ الصَّلاَةِ فِيهِ، فَإِنَّ صَلاَتَكُمْ مَعْرُوضَةً عَلَيَّ",
    translation: {
      en: "Among the best of your days is Friday. Increase your blessings upon me on it, for your blessings are presented to me.",
    },
    narrator: "Aws ibn Aws al-Thaqafi",
    collection: "Riyad as-Salihin",
    reference: "1158",
    sourceUrl: "https://sunnah.com/riyadussalihin:1158",
    note: "Compiled by Imam an-Nawawi from Sunan Abi Dawud, with a sound chain. The wordings in Sunan an-Nasa'i and Sunan Ibn Majah are graded weak by Darussalam.",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/riyadussalihin:1158"],
      verifiedAt: "2026-10-06",
    },
  },
];
