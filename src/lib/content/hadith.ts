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
 * dhikrIds. Verification here is per-entry and never inherited from the
 * parent dhikr: each citation stands on its own evidence.
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
        bn: "আমি রাসূলুল্লাহ (ﷺ)-কে বলতে শুনেছি: আল্লাহর শপথ! আমি প্রতিদিন আল্লাহর কাছে সত্তরবারেরও অধিক ইস্তিগফার ও তাওবা করে থাকি।",
    },
    narrator: "Abu Huraira",
narratorBn: "আবূ হুরায়রা (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "6307",
    sourceUrl: "https://sunnah.com/bukhari:6307",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:6307", "https://ihadis.com/bukhari/hadith/6307"],
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
        bn: "তিনি নবী (ﷺ)-কে বলতে শুনেছেনঃ যে লোক বলে, أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَىَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ “মহান আল্লাহ তাআলার নিকট আমি ক্ষমা চাই যিনি ছাড়া কোন মাবুদ নেই, যিনি চিরজীবি, চিরস্থায়ী এবং আমি তাঁর কাছে তাওবা করি”, তাকে ক্ষমা করে দেয়া হয়, যদিও সে রণক্ষেত্র হতে পলায়ন করে থাকে।",
    },
    narrator: "Abdullah ibn Busr",
    collection: "Jami at-Tirmidhi",
    reference: "3577",
    grade: "Hasan (Darussalam)",
    sourceUrl: "https://sunnah.com/tirmidhi:3577",
    note: { en: "The istighfar here is the longer phrase quoted in the hadith.", bn: "এখানে ইস্তিগফার বলতে হাদিসে উদ্ধৃত দীর্ঘ বাক্যটিই বোঝানো হয়েছে।" },
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/tirmidhi:3577", "https://ihadis.com/tirmidhi/hadith/3577"],
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
        bn: "নবী (ﷺ) বলেছেনঃ সাইয়্যিদুল ইস্তিগফার হলো বান্দার এ দোয়া পড়া- “হে আল্লাহ! তুমি আমার প্রতিপালক। তুমিই আমাকে সৃষ্টি করেছ। আমি তোমারই গোলাম। আমি যথাসাধ্য তোমার সঙ্গে কৃত প্রতিজ্ঞা ও অঙ্গীকারের উপর আছি। আমি আমার সব কৃতকর্মের কুফল থেকে তোমার কাছে আশ্রয় চাচ্ছি। তুমি আমার প্রতি তোমার যে নিয়ামত দিয়েছ তা স্বীকার করছি। আর আমার কৃত গুনাহের কথাও স্বীকার করছি। তুমি আমাকে ক্ষমা কর।”\\n\\nযে ব্যক্তি দিনে (সকালে) দৃঢ় বিশ্বাসের সঙ্গে এ ইস্তিগফার পড়বে আর সন্ধ্যা হবার আগেই সে মারা যাবে, সে জান্নাতি হবে। আর যে ব্যক্তি রাতে (প্রথম ভাগে) দৃঢ় বিশ্বাসের সঙ্গে এ দোয়া পড়ে নেবে আর সে ভোর হবার আগেই মারা যাবে সে জান্নাতি হবে।",
    },
    narrator: "Shaddad ibn Aws",
narratorBn: "শাদ্দাদ ইবনু আউস (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "6306",
    sourceUrl: "https://sunnah.com/bukhari:6306",
    note: { en: "The Prophet ﷺ taught this as the master of all istighfar, for morning and night. Parallel: Jami at-Tirmidhi 3393.", bn: "রাসূলুল্লাহ (সা.) এটিকে সব ইস্তিগফারের সেরা হিসেবে সকাল-সন্ধ্যার জন্য শিখিয়েছেন। সমতুল্য: জামে তিরমিজী ৩৩৯৩।" },
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:6306", "https://ihadis.com/bukhari/hadith/6306"],
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
        bn: "দরিদ্র লোকেরা নবী (সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম)-এর নিকট এসে বললেন, ‘সম্পদশালী ও ধনী ব্যক্তিরা তাঁদের সম্পদের দ্বারা উচ্চমর্যাদা ও স্থায়ী আবাস লাভ করছেন, তাঁরা আমাদের মত সালাত আদায় করছেন, আমাদের মত সিয়াম পালন করছেন এবং অর্থের দ্বারা হজ্জ, ‘উমরাহ্‌, জিহাদ ও সদাকাহ করার মর্যাদাও লাভ করছেন।’ \\n \\n এ শুনে তিনি বললেন, “আমি কি তোমাদের এমন কিছু কাজের কথা বলব, যা তোমরা করলে, যারা নেক কাজে তোমাদের চেয়ে অগ্রগামী হয়ে গেছে, তাদের পর্যায়ে পৌঁছতে পারবে? তবে যারা পুনরায় এ ধরনের কাজ করবে তাদের কথা স্বতন্ত্র। তোমরা প্রত্যেক সালাতের পর তেত্রিশ বার করে তাসবীহ (সুবহানাল্লাহ), তাহমীদ (আলহামদু লিল্লাহ) এবং তাকবির (আল্লাহু আকবার) পাঠ করবে।” \\n \\n আমাদের মধ্যে মতানৈক্য সৃষ্টি হলো। কেউ বলল, ‘আমরা তেত্রিশ বার তাসবীহ পড়ব, তেত্রিশ বার তাহমীদ আর চৌত্রিশ বার তাকবীর পড়ব। অতঃপর আমি তাঁর নিকট ফিরে গেলাম। তিনি বললেন, سُبْحَانَ اللهِ وَالْحَمْدُ لِلَّهِ وَاللهُ أَكْبَرُ বলবে, যাতে সবগুলোই তেত্রিশবার করে হয়ে যায়।”",
    },
    narrator: "Abu Huraira",
narratorBn: "আবূ হুরায়রা (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "843",
    sourceUrl: "https://sunnah.com/bukhari:843",
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:843", "https://ihadis.com/bukhari/hadith/843"],
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
        bn: "ফাতিমা (রাঃ) আটা পেষার কষ্টের কথা জানান। তখন তাঁর নিকট সংবাদ পৌঁছে যে, আল্লাহর রসূল (ﷺ)-এর নিকট কয়েকজন বন্দী আনা হয়েছে। ফাতিমা (রাঃ) আল্লাহর রসূল (ﷺ)-এর নিকট এসে একজন খাদেম চাইলেন। তিনি তাঁকে পেলেন না। তখন তিনি আয়িশা (রাঃ)-এর নিকট তা উল্লেখ করেন।\\n\\nঅতঃপর নবী (ﷺ) এলে আয়িশা (রাঃ) তাঁর নিকট বিষয়টি বললেন। (রাবী বলেন) আল্লাহর রসূল (ﷺ) আমাদের নিকট এলেন। তখন আমরা শুয়ে পড়েছিলাম। আমরা উঠতে চাইলাম। তিনি বললেন, তোমরা নিজ নিজ জায়গায় থাক। আমি তাঁর পায়ের শীতলতা আমার বুকে অনুভব করলাম। তখন তিনি বললেন, ‘তোমরা যা চেয়েছ, আমি কি তোমাদের তার চেয়ে উত্তম জিনিসের সন্ধান দিব না? যখন তোমরা বিছানায় যাবে, তখন চৌত্রিশ বার ‘আল্লাহু আকবার’, তেত্রিশবার ‘আলহামদুলিল্লাহ’ এবং তেত্রিশবার ‘সুবহানাল্লাহ’ বলবে, এটাই তোমাদের জন্য তার চেয়ে উত্তম, যা তোমরা চেয়েছ।’",
    },
    narrator: "Ali",
narratorBn: "‘আলী (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "3113",
    sourceUrl: "https://sunnah.com/bukhari:3113",
    note: { en: "The Prophet ﷺ said this to Ali and Fatimah. Parallel: Sahih Muslim 2727a.", bn: "রাসূলুল্লাহ (সা.) একথা আলী ও ফাতিমাকে বলেছেন। সমতুল্য: সহীহ মুসলিম ২৭২৭ক।" },
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:3113", "https://ihadis.com/bukhari/hadith/3113"],
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
        bn: "জাবির ইবন আবদুল্লাহ (রাঃ) বলেন, রাসূলুল্লাহ (ﷺ)-কে আমি বলতে শুনেছি: “লা ইলাহা ইল্লাল্লাহ” অতি উত্তম জিকর এবং “আলহামদু লিল্লাহ” অধিক উত্তম দোয়া।",
    },
    narrator: "Jabir ibn Abdillah",
narratorBn: "জাবির ইবনু ‘আবদুল্লাহ (রাঃ)",
    collection: "Jami at-Tirmidhi",
    reference: "3383",
    grade: "Hasan (Darussalam)",
    sourceUrl: "https://sunnah.com/tirmidhi:3383",
    note: { en: "Cited alone deliberately: no Bukhari or Muslim narration states this exact phrasing.", bn: "ইচ্ছাকৃতভাবে এককভাবে উদ্ধৃত: বুখারী-মুসলিমে এই রূপটি নেই।" },
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/tirmidhi:3383", "https://ihadis.com/tirmidhi/hadith/3383"],
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
        bn: "আল্লাহর রসূল (ﷺ) বলেছেন, যে লোক একশবার এ দোয়াটি পড়বেঃ \\n \\n لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ\\n\\n(লা ইলাহা ইল্লাল্লাহ ওয়াহুদাহু লা শারীকা লাহু লাহুল মুলকু ওয়া হুল হামদু, ওয়া হুয়া আলা কুল্লি শাইয়িন কাদীর।)\\n\\n\\\"আল্লাহ ব্যতীত কোন ইলাহ নেই, তিনি একক, তাঁর কোন শরীক নেই, রাজত্ব একমাত্র তাঁরই, সমস্ত প্রশংসাও একমাত্র তাঁরই জন্য, আর তিনি সকল বিষয়ের উপর ক্ষমতাবান।\\\"\\n \\n তাহলে দশটি গোলাম আজাদ করার সমান সওয়াব তার হবে। তার জন্য একশটি সওয়াব লেখা হবে এবং একশটি গুনাহ মিটিয়ে ফেলা হবে। ঐদিন সন্ধ্যা পর্যন্ত সে শয়তান হতে মাহফুজ থাকবে। কোন লোক তার চেয়ে উত্তম সওয়াবের কাজ করতে পারবে না। তবে হ্যাঁ, ঐ ব্যক্তি সক্ষম হবে, যে এর চেয়ে ঐ দোয়াটির আমল বেশি পরিমাণ করবে।",
    },
    narrator: "Abu Huraira",
narratorBn: "আবূ হুরায়রা (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "3293",
    sourceUrl: "https://sunnah.com/bukhari:3293",
    note: { en: "The promised wording is the fuller declaration that opens with the shahada itself.", bn: "প্রতিদানের ওয়াদা ওই পূর্ণ ঘোষণার জন্য, যা কালেমা দিয়েই শুরু হয়।" },
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:3293", "https://ihadis.com/bukhari/hadith/3293"],
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
        bn: "রাসূলুল্লাহ (ﷺ) বলেছেন: যে লোক প্রতিদিন একশ বার ‘সুবহানাল্লাহি ওয়া বিহামদিহি’ বলবে, তার গুনাহগুলো ক্ষমা করে দেয়া হবে, তা সমুদ্রের ফেনার পরিমাণ হলেও।",
    },
    narrator: "Abu Huraira",
narratorBn: "আবূ হুরায়রা (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "6405",
    sourceUrl: "https://sunnah.com/bukhari:6405",
    note: { en: "Parallel: Sahih Muslim 2691.", bn: "সমতুল্য: সহীহ মুসলিম ২৬৯১।" },
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:6405", "https://ihadis.com/bukhari/hadith/6405"],
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
        bn: "রসূলুল্লাহ (ﷺ) বলেছেন: দুটি কালেমা যা জবানে অতি হালকা, মিজানে ভারী, আর রহমানের নিকট খুব পছন্দনীয়; তা হচ্ছে ‘সুবহানাল্লাহ ওয়া বিহামদিহি, সুবহানাল্লাহিল আযীম’।",
    },
    narrator: "Abu Huraira",
narratorBn: "আবূ হুরাইরা (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "6682",
    sourceUrl: "https://sunnah.com/bukhari:6682",
    note: { en: "Parallel: Sahih Muslim 2694.", bn: "সমতুল্য: সহীহ মুসলিম ২৬৯৪।" },
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:6682", "https://ihadis.com/bukhari/hadith/6682"],
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
        bn: "একবার এক সফরে আমরা নবী (ﷺ)-এর সঙ্গে ছিলাম। যখন আমরা উঁচু স্থানে আরোহণ করতাম তখন উচ্চৈঃস্বরে ‘আল্লাহু আকবার’ বলতাম। তখন নবী (ﷺ) বললেন: “হে লোকেরা! তোমরা নিজেদের জানের উপর দয়া করো। কারণ তোমরা কোন বধির অথবা অনুপস্থিতকে আহ্বান করছ না বরং তোমরা আহ্বান জানাচ্ছ সর্বশ্রোতা ও সর্বদ্রষ্টাকে।”\\n\\nকিছুক্ষণ পর তিনি আমার কাছে এলেন, তখন আমি মনে মনে পড়ছিলাম: ‘লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ’। তখন তিনি বলেন, “হে আবদুল্লাহ ইবন কায়স! তুমি পড়বে ‘লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ’। কারণ এ দোয়া হলো জান্নাতের রত্ন ভাণ্ডারগুলোর একটি।” অথবা তিনি বললেন: “আমি কি তোমাকে এমন একটি কথার সন্ধান দেব না যে কথাটি জান্নাতের রত্ন ভাণ্ডার? তা থেকে একটি রত্নভাণ্ডার হলো ‘লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ’।”",
    },
    narrator: "Abu Musa al-Ashari",
narratorBn: "আবূ মূসা (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "6384",
    sourceUrl: "https://sunnah.com/bukhari:6384",
    note: { en: "On a journey, after telling the Companions not to raise their voices in du'a. Parallel: Sahih Muslim 2704.", bn: "সফরের সময়, সাহাবিদের দোয়ায় উচ্চস্বরে ডাক না করতে বলার পর। সমতুল্য: সহীহ মুসলিম ২৭০৪।" },
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:6384", "https://ihadis.com/bukhari/hadith/6384"],
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
        bn: "কা’ব ইবনু উজরা (রাঃ) আমার সঙ্গে দেখা করে বললেন, আমি কি আপনাকে এমন একটি হাদিয়া দেব না যা আমি নবী (ﷺ) হতে শুনেছি? আমি বললাম, হ্যাঁ, আপনি আমাকে সে হাদিয়া দিন। তিনি বললেন, আমরা রাসূলুল্লাহ (ﷺ)-কে জিজ্ঞেস করলাম, হে আল্লাহর রাসূল! আপনাদের উপর অর্থাৎ আহলে বাইতের উপর কিভাবে দরুদ পাঠ করতে হবে? কেননা, আল্লাহ তো (কেবল) আমাদেরকে জানিয়ে দিয়েছেন, আমরা কিভাবে আপনার উপর সালাম করব।\\n\\nতিনি বললেন, তোমরা এভাবে বল, “হে আল্লাহ! আপনি মুহাম্মাদ (ﷺ)-এর উপর এবং মুহাম্মাদ (ﷺ)-এর বংশধরদের উপর রহমত বর্ষণ করুন, যেরূপ আপনি ইবরাহিম (আঃ) এবং তাঁর বংশধরদের উপর রহমত বর্ষণ করেছেন। নিশ্চয়ই আপনি অতি প্রশংসিত, অত্যন্ত মর্যাদার অধিকারী। হে আল্লাহ! মুহাম্মাদ (ﷺ) ও মুহাম্মাদ (ﷺ)-এর বংশধরদের উপর তেমনি বরকত দান করুন যেমনি আপনি বরকত দান করেছেন ইবরাহিম (আঃ) এবং ইবরাহিম (আঃ)-এর বংশধরদের উপর। নিশ্চয়ই আপনি অতি প্রশংসিত, অতি মর্যাদার অধিকারী।",
    },
    narrator: "Ka'b ibn Ujrah",
narratorBn: "কা’ব ইবনু উজরা (রাঃ)",
    collection: "Sahih al-Bukhari",
    reference: "3370",
    sourceUrl: "https://sunnah.com/bukhari:3370",
    note: { en: "The wording of the tashahhud taught to the Companions. Parallel: Sahih Muslim 406.", bn: "সাহাবিদের শেখানো তাশাহহুদের দরুদের রূপ। সমতুল্য: সহীহ মুসলিম ৪০৬।" },
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/bukhari:3370", "https://ihadis.com/bukhari/hadith/3370"],
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
        bn: "রাসূলুল্লাহ (ﷺ) বলেছেন, “তোমাদের দিনগুলির মধ্যে সর্বোত্তম দিন হচ্ছে জুমুআর দিন। সুতরাং ঐ দিন তোমরা আমার উপর অধিকমাত্রায় দরূদ পড়। কেননা, তোমাদের দরূদ আমার কাছে পেশ করা হয়।” লোকেরা বলল, ’ইয়া রাসূলুল্লাহ! আপনি তো (মারা যাওয়ার পর) পচে-গলে নিশ্চিহ্ন হয়ে যাবেন। সে ক্ষেত্রে আমাদের দরূদ কিভাবে আপনার কাছে পেশ করা হবে?’ তিনি বললেন, “আল্লাহ পয়গম্বরদের দেহসমূহকে খেয়ে ফেলা মাটির উপর হারাম করে দিয়েছেন।” (বিধায় তাঁদের শরীর আবহমান কাল ধরে অক্ষত থাকবে।)(আবু দাউদ, বিশুদ্ধ সনদ)[১]",
    },
    narrator: "Aws ibn Aws al-Thaqafi",
narratorBn: "আওস ইবনে আওস (রাঃ)",
    collection: "Riyad as-Salihin",
    reference: "1158",
    sourceUrl: "https://sunnah.com/riyadussalihin:1158",
    note: { en: "Compiled by Imam an-Nawawi from Sunan Abi Dawud, with a sound chain. The wordings in Sunan an-Nasa'i and Sunan Ibn Majah are graded weak by Darussalam.", bn: "ইমাম নববী সুনানে আবু দাউদ থেকে সহিহ সনদে সংকলন করেছেন। সুনানে নাসায়ী ও সুনানে ইবনে মাজাহের রূপগুলো দারুসসালাম মতে দুর্বল।" },
    review: {
      status: "verified",
      verifiedSources: ["https://sunnah.com/riyadussalihin:1158", "https://ihadis.com/riyadus-salihin/hadith/1407"],
      verifiedAt: "2026-10-06",
    },
  },
];
