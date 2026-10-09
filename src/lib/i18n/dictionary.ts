import type { Lang } from "./lang";

/**
 * UI copy table: EN is the source of truth, BN must satisfy typeof EN, so
 * a missing Bangla key is a compile error and the dictionary test catches
 * empty strings.
 *
 * Terminology map (Bangla-First Localization brief, section 8) - the
 * product vocabulary stays consistent everywhere:
 *
 *   Quest      -> Quest / Quest (English term kept in Bangla copy)
 *   Journey    -> Journey / জার্নি (kept: product brand term)
 *   Journey of Light -> Journey of Light (English phrase kept in Bangla
 *                        copy; never translated as "আলোর পথ")
 *   Amal       -> Amal / আমল
 *   Dhikr      -> Dhikr / জিকির (Bangladesh's common spoken form)
 *   Hadith     -> Hadith / হাদিস
 *   Streak     -> never guilt-framed; "টানা {n} দিন"
 *   Progress   -> Progress / অগ্রগতি
 *   Milestone  -> milestone / অর্জন (product-level achievement sense)
 *   Hadiya     -> Hadiya / হাদিয়া
 *   Settings   -> Settings / সেটিংস
 *   Narrated   -> "বর্ণনায় {narrator}" (iHadis convention)
 *
 * Copy rules: natural Bangladeshi Bangla, not literal translation;
 * established Islamic terms stay (নামাজ, রোজা, দোয়া, ইস্তিগফার, সওয়াব,
 * রাসূলুল্লাহ (সা.)); no modality upgrades anywhere. Functions receive
 * already-formatted strings (numerals resolved by the caller) so this
 * file stays free of Intl logic.
 */

export const EN = {
  // Navigation (nav-icons NAV_ITEMS labels resolve through copy)
  navHome: "Home",
  navExplore: "Explore",
  navJourney: "Journey",
  navSettings: "Settings",
  navPrimaryAria: "Primary navigation",

  // Home
  greeting: "As-salamu alaykum.",
  todayLine: (n: string) => `Today: ${n} dhikr. Your Journey is waiting.`,
  nextStep: "Next step",
  chooseQuest: "Choose a quest",
  viewJourney: "View your Journey",
  questsCompleteOf: (done: string, total: string) =>
    `${done} of ${total} quests complete`,
  freeForever: "Free forever. No ads, no account needed.",
  currentQuest: "Current quest",
  currentQuestProgressAria: "Current quest progress",
  continueQuest: "Continue quest",
  todaysAmal: "Today's Amal",
  timesComplete: (n: string) => `${n}x complete`,
  todayCountLine: (n: string) => `Today: ${n}x`,
  todaysAmalProgressAria: "Today's Amal progress",
  practiceNow: "Practice now",
  startThisQuest: "Start this quest",
  yourProgress: "Your progress",
  daysPracticed: "Days practiced",
  statTotal: "Total",
  statBest: "Best run",
  dayCount: (n: string) => `${n} ${n === "1" ? "day" : "days"}`,
  daysInARow: (n: string) =>
    `${n} ${n === "1" ? "day" : "days"} in a row`,
  firstQuest: "First quest",
  firstQuestBody:
    "Pick a quest, count with intention, and watch your journey of light grow.",
  beginSuggested: "Begin with this quest",
  orChooseAnother: "or choose another",
  firstVisit: "First visit?",
  howAmalynWorks: "How Amalyn works",
  howItWorksIntro:
    "Each quest gives your remembrance a beginning, a rhythm, and a visible path.",
  howStep1Title: "Choose a quest",
  howStep1Body:
    "Pick a dhikr with a target, like 33 or 100. Every quest shows the Arabic, its meaning, and its source, so you always know what you are reciting.",
  howStep2Title: "Count with intention",
  howStep2Body:
    "A calm, fullscreen counter: tap to count, undo anytime. It works fully offline, and your practice stays private on your device.",
  howStep3Title: "Watch your Journey grow",
  howStep3Body:
    "Reaching the target extends your path of light. Completing a quest is a milestone, not an ending - the Amal, the practice itself, stays with you, ready any day.",
  noStreaks:
    "No streaks to break, no points, no pressure - and no finish line. Just your practice, at your pace.",
  howChallengeBody:
    "One amal, a daily target, and a set number of days. Meet the target each day and the streak grows - miss a day and the challenge starts over. Every count stays in your history, so trying again is always easy.",

  // Explore
  exploreTitle: "Explore",
  exploreSubtitle: "Choose a quest at your own pace.",
  allFilter: "All",
  preparingQuests: "Quests are being prepared with care.",
  verificationEmpty:
    "Every dhikr is verified against authentic sources before it appears here. Please check back soon, in shaa Allah.",
  noCategoryQuests: "No quests in this category yet - try another filter.",
  filterAria: "Filter quests by category",
  completeBadge: "Complete",
  searchPlaceholder: "Search an amal or topic…",
  searchAria: "Search amals and topics",
  clearSearch: "Clear search",
  topicsHeading: "Topics",
  categoryHeading: "Category",
  challengePill: "Challenge",
  noResultsTitle: "Nothing found for this search.",
  noResultsBody:
    "Try another word, or explore a topic below - you don't need to know an amal's exact name.",
  tryTopicsLabel: "Explore a topic",
  topicsAria: "Browse amals by topic",
  duaForLabel: "Asks Allah for this",
  occasionLabel: "Sunnah times & occasions",
  relatedLabel: "Related dhikr",
  questCount: (n: string) => `${n} ${n === "1" ? "Quest" : "Quests"}`,
  strictChallengesRunning: (n: string) =>
    `${n} ${n === "1" ? "Challenge" : "Challenges"} running`,
  strictShareTitle: "Challenge card",
  strictCanvasComplete: "CHALLENGE COMPLETE",
  strictCanvasDays: "days completed",
  strictShowNamesOnCard: "Show amal names on card",
  strictShareText:
    "Challenge complete - Alhamdulillah! Start your own journey with Amalyn.",
  strictSeeShareCard: "See share card",
  strictShareNotComplete: "This Challenge isn't complete yet.",
  strictFinishFirst:
    "Finish all its days first, and the milestone card will be waiting here.",
  startChallenge: "Do it as a Challenge",
  startChallengeAria: (name: string) => `Start a Challenge with ${name}`,

  // Journey
  journeyTitle: "Journey",
  pathOfLight: "Your path of light.",
  journeyEmptyTitle: "Your path begins with the first quest.",
  journeyEmptyBody: "Every completed quest adds a light to this path.",
  statDays: "Days",
  statQuests: "Quests",
  statDhikr: "Dhikr",
  upNext: "Up next",
  journeyContinues: "Your Journey continues",
  completedOnDate: (date: string) => `Completed ${date}`,
  journeyAria: (n: string) => `Journey with ${n} completed quests`,
  amalsInPractice: (n: string) =>
    `${n} ${n === "1" ? "Amal is" : "Amals are"} now part of your practice. Return to any of them, any day - the path grows with you.`,
  thisMonthDhikr: (n: string) => `This month ${n} dhikr`,
  overLastMonth: (n: string) => ` - +${n} over last month`,

  // Journey track (a suggested order, never a lock - every quest stays
  // freely startable. Stage names describe practice amounts, product-designed
  // for habit-building; they never imply a prescribed scheme.)
  trackHeading: "The path ahead",
  stageFoundation: "Foundation",
  stageFoundationDesc: "Small, gentle quests to begin with.",
  stageGrowth: "Growth",
  stageGrowthDesc: "A little more each time - still manageable.",
  stageDepth: "Depth",
  stageDepthDesc: "Longer sessions for a steadier rhythm.",
  stageAbundance: "Abundance",
  stageAbundanceDesc: "The long-distance milestones.",
  youAreHere: "You are here",
  stageComplete: "Stage complete",
  regularPractice: "Regular practice",
  regularPracticeDesc:
    "Every quest complete. A daily Amal keeps the rhythm - at your own pace.",

  // Simple Challenge (a personal commitment: one or more amals, each
  // with a daily target, one duration. Product terms "Simple Challenge" /
  // "Challenge" / "streak" stay in English where natural. A day counts
  // only when the target is met - but copy stays calm, never punitive.)
  strictTitle: "Simple Challenge",
  strictTagline: "A small daily habit, a commitment to yourself!",
  strictRules:
    "The rule here is simple - meet the target and the day counts. Miss a day and you start over, but all your past records stay in the app.",
  strictChooseAmals: "Choose your amals",
  strictAmalsSelected: (n: string) => `${n} selected`,
  strictAmalsDaily: (n: string) => `${n} amals daily:`,
  strictTodayAmalsDone: (done: string, total: string) =>
    `${done} / ${total} amals done today`,
  strictGroupAmals: (n: string) => `${n} amals`,
  strictParallelNote:
    "This challenge will run alongside your current one.",
  strictDailyTarget: "How many per day?",
  strictDuration: "How many days?",
  strictCustom: "Custom",
  strictRecommended: "Recommended",
  strictTimes: (n: string) => `${n} times`,
  strictDayProgress: (day: string, total: string) => `Day ${day} / ${total}`,
  strictPerDay: (n: string) => `${n} per day`,
  strictToday: "Today's amal",
  strictTodayComplete: "Today's amal complete",
  strictStreak: (n: string) => `${n}-day streak`,
  strictTodayProgressAria: "Today's challenge progress",
  strictYourChallenge: "Your Simple Challenge",
  strictStart: "Start the challenge",
  strictMissedYesterday: "Yesterday wasn't completed",
  strictMissedOn: (date: string) => `${date} wasn't completed`,
  strictCompleteTitle: "Simple Challenge complete",
  strictCompleteBody: (n: string) => `${n}-day commitment finished.`,
  strictNewChallenge: "New challenge",
  strictEnd: "End challenge",
  strictEndConfirmTitle: "End this challenge?",
  strictEndConfirmBody:
    "Ending the challenge keeps everything you have done in your history. Only this challenge stops moving forward.",
  strictEndConfirm: "End it",
  strictKeep: "Keep going",
  strictTargetInputAria: "Custom daily target",
  strictDurationInputAria: "Custom duration in days",

  // Quest detail
  exploreBack: "Explore",
  questLabel: "Target",
  guidanceLabel: "Guidance",
  seeHadith: (n: string) => `See the hadith (${n})`,
  sourceLabel: "Source",
  verificationInProgress: "Verification in progress",
  continueWithCount: (count: string, target: string) =>
    `Continue - ${count} / ${target}`,
  startQuest: (n: string) => `Start quest - ${n}x`,
  practicedTimes: (n: string) => `You've practiced this Amal ${n} times.`,
  completedShortLine: (date: string, n: string) =>
    `Completed ${date} · practiced ${n} times`,

  // Counter
  milestoneQuarter: "A quarter of the way",
  milestoneHalf: "Halfway there",
  milestoneThreeQuarters: "Three quarters done",
  milestoneAlmost: "Almost there",
  leaveCounterAria: "Leave counter (progress is saved)",
  undoCountAria: "Undo one count",
  countAria: (name: string, count: string, target: string, today: string) =>
    `Count one ${name}. ${count} of ${target}${today}.`,
  todaySuffix: " today",
  ofTarget: (n: string) => `of ${n}`,
  questProgressAria: "Quest progress",
  tapToCount: "Tap anywhere to count",
  todaysAmalCompleteAria: "Today's amal complete",
  done: "Done",
  alhamdulillah: "Alhamdulillah",

  // Completion
  questComplete: "Quest complete",
  amalStaysInJourney: "This Amal stays part of your Journey.",
  nextQuest: (name: string, n: string) => `Next: ${name} ${n}x`,
  shareMilestone: "Share this milestone",
  backHome: "Back home",

  // Share
  shareTitle: "Share milestone",
  backAria: "Back",
  cardTheme: "Card theme",
  shareThemeNight: "Night",
  shareThemeDawn: "Dawn",
  showCountOnCard: "Show the count on the card",
  shareOrSave: "Share or save card",
  cardPrivacy:
    "Your card only shows what you choose. Sharing is always up to you.",
  notCompleteYet: "This quest isn't complete yet.",
  finishFirst: "Finish it first, and its milestone card will be waiting here.",
  backToQuest: "Back to the quest",
  shareText: "Quest complete - Alhamdulillah",
  statusShared: "Shared.",
  statusSaved: "Card saved to your device.",
  statusImageFailed: "Could not create the card image.",
  canvasCompleted: "COMPLETED",
  canvasAria: (name: string, n: string) =>
    `Milestone card: ${n} times ${name}, quest complete`,

  // Settings
  settingsTitle: "Settings",
  appearance: "Appearance",
  themeSystem: "System",
  themeDawn: "Dawn",
  themeNight: "Night",
  counting: "Counting",
  hapticsLabel: "Haptic feedback",
  hapticsHint: "A soft tick per tap, where supported",
  soundLabel: "Sound",
  soundHint: "A gentle tone per tap",
  wakeLockLabel: "Keep screen awake",
  wakeLockHint: "While a quest counter is open",
  yourData: "Your data",
  exportProgress: "Export progress",
  importFromFile: "Import from file",
  eraseData: "Erase all local data",
  dataNote:
    "Your practice lives on this device. Export creates a backup file you can re-import anytime.",
  account: "Account",
  more: "More",
  supportAmalyn: "Support Amalyn",
  aboutPrivacy: "About & privacy",
  language: "Language",
  exportDownloaded: "Export downloaded.",
  exportFailed: "Export failed.",
  fileTooLarge: "That file is too large to be an Amalyn export.",
  fileInvalid: "That file is not a valid Amalyn export.",
  importedEvents: (n: string) => `Imported ${n} events. Progress rebuilt.`,
  fileUnreadable: "That file could not be read.",
  importFailed: "Import failed.",
  eraseConfirmTitle: "Erase all local data?",
  eraseConfirmBody:
    "This permanently deletes every quest, count, and setting on this device. Consider exporting a backup first. This cannot be undone.",
  eraseConfirm: "Erase everything",
  eraseCancel: "Keep my data",

  // Account / sync
  syncNotConfigured:
    "Optional cloud sync is being prepared. The app is fully usable without an account — now and always. Your practice already lives on this device.",
  enterEmail: "Enter your email first.",
  checkInbox: "Check your inbox for the sign-in link.",
  sendFailed: "Could not send the link. Please try again.",
  optionalSignIn:
    "Optional. Signing in only adds private backup across your devices.",
  continueWithGoogle: "Continue with Google",
  emailPlaceholder: "you@example.com",
  sendLink: "Send link",
  serverCopyDeleted: "Server copy deleted.",
  deleteFailed: "Could not delete right now.",
  synced: "Synced.",
  offlineWillSync: "You are offline - will sync later.",
  syncUnavailable: "Sync is not available right now.",
  syncPrivacy:
    "When you're online, your counts and quests back up automatically. They're stored under a random ID — never your name or email — and nothing else ever leaves your device.",
  syncNow: "Sync now",
  signOut: "Sign out",
  signOutHint: "Signing out keeps everything on this device.",
  deleteServerCopy: "Delete my server copy",
  deleteConfirmTitle: "Delete your server copy?",
  deleteConfirmBody:
    "Your backed-up counts and quests are removed from the server. Everything on this device stays untouched.",
  deleteConfirm: "Delete server copy",
  deleteCancel: "Keep it",

  // About
  aboutTitle: "About & privacy",
  aboutSubtitle: "What Amalyn promises you.",
  settingsBack: "Settings",
  aboutPromises: [
    {
      title: "Free, forever",
      body: "No ads, no subscription, no paid features, no paywalls. A voluntary Hadiya never unlocks anything or changes your experience.",
    },
    {
      title: "Private by default",
      body: "Your worship history stays on your device. No account is needed, nothing is published unless you choose to share it, and we do not sell or profile your data. Page visits are counted with Plausible — cookieless, aggregate, and anonymous: no profiles, no advertising, and never connected to your practice.",
    },
    {
      title: "Content with care",
      body: "Every dhikr is drawn from established, widely used collections, shown with its reference, and verified against authentic sources. Nothing is invented here.",
    },
    {
      title: "Honest rewards",
      body: "Amalyn celebrates product milestones — quests completed, a journey growing. It never claims to measure Allah's reward, rank believers, or promise spiritual outcomes. That measure belongs to Allah alone.",
    },
  ],
  versionFooter: (v: string) => `Amalyn v${v} - made with care for the Ummah.`,

  // Support
  supportIntroBefore:
    "Amalyn is completely free — nothing is locked, ever. If you wish to support this work, you may give a ",
  hadiyaWord: "Hadiya",
  supportIntroAfter:
    " — a voluntary gift. It is never required, never asked of you during your practice, and changes nothing about your experience. Support helps keep the app online, its content verified, and Amalyn free for everyone.",
  giveHadiya: "Give a Hadiya",
  supportHadithHeading: "The Prophet ﷺ and the Hadiya",
  seeMoreHadith: (n: string) => `More hadith (${n})`,
  // Two paragraphs via "\n\n" + pre-line rendering, dua first (mirrors bn).
  hadiyaDua:
    "Your dua is the biggest Hadiya for me. Please keep me in your dua - that alone is enough.\n\nAnd if you wish, you may also support this work with a Hadiya - a voluntary gift that encourages me to keep creating more Islamic content.",
  wayToGive: "Send a Hadiya",
  regionHint: "Choose where you are sending your gift from.",
  regionInsideBd: "Inside Bangladesh",
  regionOutsideBd: "Outside Bangladesh",
  intlVisaNote: "Sending from outside Bangladesh? Use the EBL Visa account.",
  bkashLabel: "bKash (Personal)",
  eblVisaLabel: "EBL Visa",
  bankNameLabel: "Eastern Bank PLC",
  accountName: "Account name",
  accountNumber: "Account number",
  branchLabel: "Branch",
  copyAria: "Copy",
  copiedStatus: "Copied.",
  hadiyaSentButton: "I've sent a Hadiya",
  hadiyaSentHint:
    "Optional. Nothing personal is shared - only that a Hadiya was sent.",
  hadiyaThanks:
    "JazakAllahu khayran. Your Hadiya encourages this work - may Allah accept it.",

  // Feedback
  feedbackLink: "Send feedback",
  feedbackTitle: "Feedback",
  feedbackIntro:
    "Amalyn is a small, sincere effort - no matter how carefully it is built, a mistake can slip in. Every message reaches me directly, and I read each one.",
  feedbackMistakeTitle: "Report a mistake",
  feedbackMistakeHint:
    "A wrong hadith text, translation, or reference - or anything else that looks off",
  feedbackIdeaTitle: "Share feedback",
  feedbackIdeaHint: "Suggestions, ideas, or kind words - all are welcome",
  feedbackMessageLabel: "Your message",
  feedbackMessagePlaceholder: "Describe the mistake, or share your thoughts...",
  feedbackContactLabel: "Email or contact (optional)",
  feedbackContactHint: "Only if you would like a reply. Your message reaches the developer alone.",
  feedbackSend: "Send",
  feedbackSending: "Sending...",
  feedbackSent:
    "JazakAllahu khayran - your message has reached me. Every report is read with care.",
  feedbackFailed: "Could not send right now. Please try again.",
  feedbackPrivacy:
    "Your message goes straight to the developer - no account needed, nothing published, nothing tracked.",

  // Missing quest
  missingTitle: "That quest doesn't exist.",
  missingBody: "It may have been renamed or removed.",
  backToExplore: "Back to Explore",

  // Install bar (mobile browsers, pre-install)
  installTitle: "Get Amalyn on your device",
  installAndroidHint:
    "Install the app for one-tap dhikr from your home screen, even offline.",
  installIosHint: "Tap the Share icon, then choose Add to Home Screen.",
  installAction: "Install",

  // Hadith sheet
  hadithTitle: "Hadith",
  closeAria: "Close",
  themePracticeHeading: "How the Prophet ﷺ practiced it",
  themeRewardHeading: "What the Prophet ﷺ said about its reward",
  themeOccasionHeading: "Special times",
  narratedBy: (name: string) => `Narrated ${name}`,
  footnoteComposed:
    "Translations are composed for Amalyn; tap a citation to read the full narration on sunnah.com.",
  hadithBnPending:
    "The Bangla translation of this narration is being verified; read it from the source for now.",

  // Standard Bangla names for the cited collections (citation lines only).
  collectionBn: {
    "Sahih al-Bukhari": "সহীহ বুখারী",
    "Sahih Muslim": "সহীহ মুসলিম",
    "Jami at-Tirmidhi": "জামে তিরমিজী",
    "Riyad as-Salihin": "রিয়াদুস সালেহীন",
  } as Record<string, string>,

  // Hadith grading, transliterated per Bangladeshi convention.
  gradeBn: {
    "Hasan (Darussalam)": "হাসান (দারুসসালাম)",
  } as Record<string, string>,
};

export type Copy = typeof EN;

/**
 * Bangla UI copy. Natural Bangladeshi Bangla throughout: short UI lines,
 * naturalized loans where Bangladeshis use them (সেটিংস, ব্যাকআপ, সিঙ্ক),
 * established Islamic terms kept, no literal translationese. Numerals are
 * formatted by the caller, so these strings interpolate Bangla-digit
 * strings produced by formatCount/toBnDigits.
 */
export const BN: Copy = {
  navHome: "হোম",
  navExplore: "Quest",
  navJourney: "জার্নি",
  navSettings: "সেটিংস",
  navPrimaryAria: "প্রধান নেভিগেশন",

  greeting: "আসসালামু আলাইকুম।",
  todayLine: (n) => `আজ ${n} জিকির হয়েছে। জার্নি আপনার অপেক্ষায়।`,
  nextStep: "পরবর্তী ধাপ",
  chooseQuest: "Quest বেছে নিন",
  viewJourney: "জার্নি দেখুন",
  questsCompleteOf: (done, total) => `${total}টির মধ্যে ${done}টি Quest সম্পন্ন`,
  freeForever: "চিরদিনের জন্য ফ্রি। কোনো বিজ্ঞাপন নেই, অ্যাকাউন্টেরও দরকার নেই।",
  currentQuest: "চলমান Quest",
  currentQuestProgressAria: "চলমান Quest-এর অগ্রগতি",
  continueQuest: "চালিয়ে যান",
  todaysAmal: "আজকের আমল",
  timesComplete: (n) => `${n}x সম্পন্ন`,
  todayCountLine: (n) => `আজ: ${n}x`,
  todaysAmalProgressAria: "আজকের আমলের অগ্রগতি",
  practiceNow: "আমল শুরু করুন",
  startThisQuest: "এই Quest শুরু করুন",
  yourProgress: "আপনার অগ্রগতি",
  daysPracticed: "আমলের দিন",
  statTotal: "মোট",
  statBest: "সর্বোচ্চ টানা",
  dayCount: (n) => `${n} দিন`,
  daysInARow: (n) => `টানা ${n} দিন`,
  firstQuest: "প্রথম Quest",
  firstQuestBody:
    "একটি Quest বেছে নিন, মন দিয়ে জিকির করুন—আর দেখুন, ধীরে ধীরে আপনার Journey of Light এগিয়ে যাচ্ছে।",
  beginSuggested: "এই Quest দিয়েই শুরু করুন",
  orChooseAnother: "অথবা অন্যটি বেছে নিন",
  firstVisit: "প্রথমবার আসছেন?",
  howAmalynWorks: "Amalyn কীভাবে কাজ করে",
  howItWorksIntro:
    "প্রতিটি Quest আপনার জিকিরকে দেয় একটা শুরু, একটা ছন্দ, আর চোখের সামনে এগিয়ে চলা একটা পথ।",
  howStep1Title: "একটি Quest বেছে নিন",
  howStep1Body:
    "আপনার পছন্দের একটি জিকির আর তার লক্ষ্য বেছে নিন—যেমন ৩৩ বা ১০০ বার। প্রতিটি Quest-এ আরবি, অর্থ ও সূত্র দেওয়া থাকে, তাই আপনি কী পড়ছেন সেটা সবসময়ই জানতে পারবেন।",
  howStep2Title: "মন দিয়ে জিকির করুন",
  howStep2Body:
    "শান্ত, Fullscreen Counter-এ Tap করে জিকির Count করুন। ভুল হলে সংখ্যা কমিয়েও নিতে পারবেন। Amalyn পুরোপুরি Offline-এ কাজ করে, আর আপনার আমল আপনার Device-এই Private থাকে।",
  howStep3Title: "আপনার Journey এগোতে দেখুন",
  howStep3Body:
    "একটা Quest-এর লক্ষ্য পূর্ণ হলে আপনার Journey আরও একটু এগিয়ে যায়। Quest Complete করা একটা Milestone—এটাই শেষ নয়। আপনার আমল থেকে যায়, আর আপনি চাইলে যেকোনো দিন আবার জিকির করতে পারবেন।",
  noStreaks:
    "এখানে কোনো ভাঙার মতো Streak নেই, কোনো Point নেই, কোনো চাপ নেই, কোনো শেষের লাইনও নেই। শুধু আপনার আমল—আপনার নিজের গতিতে।",
  howChallengeBody:
    "একটা আমল, প্রতিদিনের টার্গেট, আর নির্দিষ্ট কিছু দিন। প্রতিদিন টার্গেট পূরণ হলেই streak এগিয়ে যায় - একটা দিন বাদ পড়লে Challenge নতুন করে শুরু হয়। আপনার প্রতিটি গণনা History-তে থেকে যায়, তাই আবার শুরু করা সবসময়ই সহজ।",

  exploreTitle: "Quest",
  exploreSubtitle: "নিজের সুবিধামতো Quest বেছে নিন।",
  allFilter: "সব",
  preparingQuests: "Quest-গুলো যত্নের সঙ্গে প্রস্তুত হচ্ছে।",
  verificationEmpty:
    "প্রতিটি জিকির নির্ভরযোগ্য সূত্রে যাচাই করেই এখানে আসে। ইন শা আল্লাহ, খুব শিগগিরই আবার দেখা হবে।",
  noCategoryQuests: "এই ক্যাটাগরিতে এখনো কোনো Quest নেই - অন্য একটি বেছে নিন।",
  filterAria: "ক্যাটাগরি অনুযায়ী Quest ফিল্টার করুন",
  completeBadge: "সম্পন্ন",
  searchPlaceholder: "আমল বা বিষয় খুঁজুন…",
  searchAria: "আমল ও বিষয় সার্চ করুন",
  clearSearch: "সার্চ মুছুন",
  topicsHeading: "বিষয়",
  categoryHeading: "ক্যাটাগরি",
  challengePill: "Challenge",
  noResultsTitle: "এই সার্চে কিছু পাওয়া যায়নি।",
  noResultsBody:
    "অন্য শব্দে খুঁজে দেখুন, অথবা নিচের বিষয়গুলো ঘুরে দেখুন - আমলের ঠিক নাম জানা থাকা জরুরি নয়।",
  tryTopicsLabel: "বিষয় ঘুরে দেখুন",
  topicsAria: "বিষয় অনুযায়ী আমল দেখুন",
  duaForLabel: "এই চাওয়ার জন্য",
  occasionLabel: "সুন্নাহ সময় ও অনুষ্ঠান",
  relatedLabel: "সম্পর্কিত জিকির",
  questCount: (n: string) => `${n}টি Quest`,
  strictChallengesRunning: (n: string) => `${n}টি Challenge চলছে`,
  strictShareTitle: "Challenge কার্ড",
  strictCanvasComplete: "Challenge সম্পন্ন",
  strictCanvasDays: "দিন সম্পন্ন",
  strictShowNamesOnCard: "কার্ডে আমলের নাম দেখান",
  strictShareText:
    "Challenge সম্পন্ন - আলহামদুলিল্লাহ! আপনিও Amalyn-এ আপনার Journey শুরু করুন।",
  strictSeeShareCard: "শেয়ার কার্ড দেখুন",
  strictShareNotComplete: "Challenge-টি এখনো সম্পন্ন হয়নি।",
  strictFinishFirst:
    "আগে এর সব দিন সম্পন্ন করুন - তারপর এই কার্ডটি এখানে অপেক্ষা করবে।",
  startChallenge: "Challenge হিসেবে করুন",
  startChallengeAria: (name: string) => `${name} দিয়ে Challenge শুরু করুন`,

  journeyTitle: "জার্নি",
  pathOfLight: "Journey of Light",
  journeyEmptyTitle: "প্রথম Quest দিয়েই পথ শুরু হয়।",
  journeyEmptyBody: "প্রতিটি সম্পন্ন Quest এই পথে একটি আলো যোগ করে।",
  statDays: "দিন",
  statQuests: "Quest",
  statDhikr: "জিকির",
  upNext: "সামনে আসছে",
  journeyContinues: "জার্নি চলতেই থাকে",
  completedOnDate: (date) => `সম্পন্ন ${date}`,
  journeyAria: (n) => `${n}টি সম্পন্ন Quest-এর জার্নি`,
  amalsInPractice: (n) =>
    `আপনার আমলে এখন ${n}টি আমল যুক্ত হয়েছে। যেকোনো দিন, যেকোনো একটিতে ফিরে যান - আপনার সঙ্গে পথও এগিয়ে চলবে।`,
  thisMonthDhikr: (n) => `এ মাসে ${n} জিকির`,
  overLastMonth: (n) => ` - গত মাসের চেয়ে +${n}`,

  trackHeading: "সামনের পথ",
  stageFoundation: "ভিত্তি",
  stageFoundationDesc: "শুরুর জন্য ছোট, সহজ Quest।",
  stageGrowth: "বৃদ্ধি",
  stageGrowthDesc: "একটু একটু করে বাড়ে - তবু সহজেই সম্ভব।",
  stageDepth: "গভীরতা",
  stageDepthDesc: "দীর্ঘ সেশন - আরও স্থির ছন্দের জন্য।",
  stageAbundance: "প্রাচুর্য",
  stageAbundanceDesc: "দূরপাল্লার অর্জন।",
  youAreHere: "আপনি এখানে",
  stageComplete: "ধাপ সম্পন্ন",
  regularPractice: "নিয়মিত আমল",
  regularPracticeDesc:
    "সব Quest সম্পন্ন। প্রতিদিনের একটি আমল ছন্দ ধরে রাখে - নিজের গতিতে।",

  strictTitle: "Simple Challenge",
  strictTagline: "প্রতিদিনের একটি ছোট্ট অভ্যাস, নিজের সাথে একটা commitment!",
  strictRules:
    "এখানে নিয়ম একদম সহজ—টার্গেট পূরণ হলেই দিন কাউন্ট হবে। কোনোদিন মিস হয়ে গেলে নতুন করে শুরু করতে হবে, তবে আপনার আগের সব রেকর্ড অ্যাপে থেকে যাব।",
  strictChooseAmals: "আপনার Challenge বেছে নিন",
  strictAmalsSelected: (n) => `${n}টি আমল selected`,
  strictAmalsDaily: (n) => `${n}টি আমল প্রতিদিন:`,
  strictTodayAmalsDone: (done, total) => `আজ ${done}/${total}টি আমল সম্পন্ন`,
  strictGroupAmals: (n) => `${n}টি আমল`,
  strictParallelNote: "এটি আপনার চলমান Challenge-এর পাশাপাশি চলবে।",
  strictDailyTarget: "প্রতিদিন কতবার?",
  strictDuration: "কতদিন চালাবেন?",
  strictCustom: "কাস্টম",
  strictRecommended: "প্রস্তাবিত",
  strictTimes: (n) => `${n} বার`,
  strictDayProgress: (day, total) => `দিন ${day} / ${total}`,
  strictPerDay: (n) => `${n} বার প্রতিদিন`,
  strictToday: "আজকের আমল",
  strictTodayComplete: "আজকের আমল complete",
  strictStreak: (n) => `${n} দিনের streak`,
  strictTodayProgressAria: "আজকের Challenge অগ্রগতি",
  strictYourChallenge: "আপনার Simple Challenge",
  strictStart: "Challenge শুরু করুন",
  strictMissedYesterday: "গতকাল সম্পূর্ণ হয়নি",
  strictMissedOn: (date) => `${date} সম্পূর্ণ হয়নি`,
  strictCompleteTitle: "Simple Challenge সম্পন্ন",
  strictCompleteBody: (n) => `${n} দিনের commitment শেষ হয়েছে।`,
  strictNewChallenge: "নতুন Challenge",
  strictEnd: "Challenge শেষ করুন",
  strictEndConfirmTitle: "Challenge শেষ করবেন?",
  strictEndConfirmBody:
    "Challenge শেষ করলে আপনার করা সব আমল History-তে থেকে যাবে। শুধু এই Challenge-টা আর এগোবে না।",
  strictEndConfirm: "শেষ করুন",
  strictKeep: "চালিয়ে যান",
  strictTargetInputAria: "নিজের দৈনিক টার্গেট",
  strictDurationInputAria: "নিজের দিনসংখ্যা",

  exploreBack: "Quest",
  questLabel: "টার্গেট",
  guidanceLabel: "নির্দেশনা",
  seeHadith: (n) => `হাদিস দেখুন (${n})`,
  sourceLabel: "সূত্র",
  verificationInProgress: "যাচাই চলছে",
  continueWithCount: (count, target) => `চলছে - ${count} / ${target}`,
  startQuest: (n) => `Quest শুরু - ${n}x`,
  practicedTimes: (n) => `এই আমলটি আপনি ${n} বার করেছেন।`,
  completedShortLine: (date, n) => `সম্পন্ন: ${date} · ${n} বার আমল`,

  milestoneQuarter: "এক-চতুর্থাংশ হয়ে গেছে",
  milestoneHalf: "অর্ধেক শেষ",
  milestoneThreeQuarters: "তিন-চতুর্থাংশ শেষ",
  milestoneAlmost: "প্রায় শেষ",
  leaveCounterAria: "কাউন্টার বন্ধ করুন (অগ্রগতি সংরক্ষিত)",
  undoCountAria: "একটি গণনা কমান",
  countAria: (name, count, target, today) =>
    `একবার ${name} পড়ুন। ${target}-এর মধ্যে ${count}${today}।`,
  todaySuffix: " - আজকের",
  ofTarget: (n) => `লক্ষ্য ${n}`,
  questProgressAria: "Quest-এর অগ্রগতি",
  tapToCount: "গুনতে যেকোনো জায়গায় ট্যাপ করুন",
  todaysAmalCompleteAria: "আজকের আমল সম্পন্ন",
  done: "ঠিক আছে",
  alhamdulillah: "আলহামদুলিল্লাহ",

  questComplete: "Quest সম্পন্ন",
  amalStaysInJourney: "এই আমল আপনার জার্নির অংশ থেকে যাবে।",
  nextQuest: (name, n) => `পরবর্তী: ${name} ${n}x`,
  shareMilestone: "এই অর্জন শেয়ার করুন",
  backHome: "হোমে ফিরুন",

  shareTitle: "অর্জন শেয়ার",
  backAria: "পেছনে",
  cardTheme: "কার্ডের থিম",
  shareThemeNight: "রাত",
  shareThemeDawn: "ভোর",
  showCountOnCard: "কার্ডে সংখ্যা দেখান",
  shareOrSave: "কার্ড শেয়ার বা সেভ করুন",
  cardPrivacy:
    "কার্ডে শুধু আপনার বেছে নেওয়া তথ্যই দেখা যায়। শেয়ার করবেন কি না, সেটা সম্পূর্ণ আপনার।",
  notCompleteYet: "Quest-টি এখনো সম্পন্ন হয়নি।",
  finishFirst: "আগে এটি সম্পন্ন করুন, তারপর এই কার্ডটি এখানে অপেক্ষা করবে।",
  backToQuest: "Quest-এ ফিরুন",
  shareText: "Quest সম্পন্ন - আলহামদুলিল্লাহ",
  statusShared: "শেয়ার হয়েছে।",
  statusSaved: "কার্ড ডিভাইসে সেভ হয়েছে।",
  statusImageFailed: "কার্ডের ছবি তৈরি করা যায়নি।",
  canvasCompleted: "সম্পন্ন",
  canvasAria: (name, n) => `অর্জনের কার্ড: ${name} ${n} বার, Quest সম্পন্ন`,

  settingsTitle: "সেটিংস",
  appearance: "থিম",
  themeSystem: "সিস্টেম",
  themeDawn: "ভোর",
  themeNight: "রাত",
  counting: "গণনা",
  hapticsLabel: "ভাইব্রেশন",
  hapticsHint: "প্রতি ট্যাপে হালকা কম্পন (যেখানে সমর্থিত)",
  soundLabel: "শব্দ",
  soundHint: "প্রতি ট্যাপে মৃদু টোন",
  wakeLockLabel: "স্ক্রিন জাগিয়ে রাখুন",
  wakeLockHint: "Quest-এর কাউন্টার খোলা থাকাকালীন",
  yourData: "আপনার ডেটা",
  exportProgress: "অগ্রগতি এক্সপোর্ট",
  importFromFile: "ফাইল থেকে ইমপোর্ট",
  eraseData: "সব লোকাল ডেটা মুছুন",
  dataNote:
    "আপনার আমল থাকে এই ডিভাইসেই। এক্সপোর্ট করলে একটি ব্যাকআপ ফাইল তৈরি হয়, যা যেকোনো সময় আবার ইমপোর্ট করা যায়।",
  account: "অ্যাকাউন্ট",
  more: "আরও",
  supportAmalyn: "Amalyn-কে সাপোর্ট করুন",
  aboutPrivacy: "পরিচিতি ও প্রাইভেসি",
  language: "ভাষা",
  exportDownloaded: "এক্সপোর্ট ডাউনলোড হয়েছে।",
  exportFailed: "এক্সপোর্ট ব্যর্থ হয়েছে।",
  fileTooLarge: "ফাইলটি অনেক বড়, Amalyn-এর এক্সপোর্ট নয়।",
  fileInvalid: "ফাইলটি Amalyn-এর বৈধ এক্সপোর্ট নয়।",
  importedEvents: (n) => `${n}টি ইভেন্ট ইমপোর্ট হয়েছে। অগ্রগতি পুনর্গঠিত হয়েছে।`,
  fileUnreadable: "ফাইলটি পড়া যায়নি।",
  importFailed: "ইমপোর্ট ব্যর্থ হয়েছে।",
  eraseConfirmTitle: "সব লোকাল ডেটা মুছে ফেলা হবে?",
  eraseConfirmBody:
    "এতে এই ডিভাইসের সব Quest, গণনা ও সেটিংস স্থায়ীভাবে মুছে যাবে। চাইলে আগে ব্যাকআপ নিয়ে রাখুন। এটি আর ফেরানো যাবে না।",
  eraseConfirm: "সব মুছে ফেলুন",
  eraseCancel: "ডেটা রেখে দিন",

  syncNotConfigured:
    "অ্যাকাউন্ট ছাড়াই অ্যাপটি পুরোপুরি ব্যবহারযোগ্য - এখনও, সবসময়। ক্লাউড সিঙ্কের কাজ চলছে। আপনার আমল এখনই আছে এই ডিভাইসে।",
  enterEmail: "আগে ইমেইল লিখুন।",
  checkInbox: "সাইন-ইন লিংকের জন্য ইনবক্স দেখুন।",
  sendFailed: "লিংক পাঠানো যায়নি। আবার চেষ্টা করুন।",
  optionalSignIn:
    "ঐচ্ছিক। সাইন-ইন করলে শুধু ডিভাইসগুলোর মধ্যে প্রাইভেট ব্যাকআপ যুক্ত হয়।",
  continueWithGoogle: "Google দিয়ে চালিয়ে যান",
  emailPlaceholder: "you@example.com",
  sendLink: "লিংক পাঠান",
  serverCopyDeleted: "সার্ভার কপি মুছে গেছে।",
  deleteFailed: "এখন মুছে ফেলা যাচ্ছে না।",
  synced: "সিঙ্ক হয়েছে।",
  offlineWillSync: "আপনি অফলাইনে আছেন - পরে সিঙ্ক হবে।",
  syncUnavailable: "সিঙ্ক এখন পাওয়া যাচ্ছে না।",
  syncPrivacy:
    "অনলাইনে এলে আপনার গণনা আর Quest নিজে থেকেই ব্যাকআপ হয়। সব জমা থাকে একটি গোপন আইডির অধীনে - আপনার নাম বা ইমেইল কখনোই নয় - আর আপনার ডিভাইস থেকে এর বাইরে আর কিছুই যায় না।",
  syncNow: "এখন সিঙ্ক করুন",
  signOut: "সাইন আউট",
  signOutHint: "সাইন আউট করলেও সবকিছু এই ডিভাইসেই থাকবে।",
  deleteServerCopy: "সার্ভার কপি মুছে দিন",
  deleteConfirmTitle: "সার্ভার কপি মুছে ফেলা হবে?",
  deleteConfirmBody:
    "ব্যাকআপ করা গণনা ও Quest সার্ভার থেকে মুছে যাবে। এই ডিভাইসের সবকিছু অক্ষত থাকবে।",
  deleteConfirm: "সার্ভার কপি মুছে ফেলুন",
  deleteCancel: "রেখে দিন",

  aboutTitle: "পরিচিতি ও প্রাইভেসি",
  aboutSubtitle: "Amalyn আপনাকে যা প্রতিশ্রুতি দেয়।",
  settingsBack: "সেটিংস",
  aboutPromises: [
    {
      title: "চিরদিনের জন্য ফ্রি",
      body: "কোনো বিজ্ঞাপন নেই, সাবস্ক্রিপশন নেই, পেইড ফিচার নেই, পেওয়াল নেই। স্বেচ্ছায় দেওয়া হাদিয়া কখনো কিছু আনলক করে না, আপনার অভিজ্ঞতা বদলায় না।",
    },
    {
      title: "প্রাইভেসি নিশ্চিত",
      body: "আপনার ইবাদতের ইতিহাস থাকে আপনার ডিভাইসেই। অ্যাকাউন্ট লাগে না; নিজে না চাইলে কিছুই শেয়ার হয় না, আর আপনার ডেটা কেউ বিক্রি বা প্রোফাইল করে না। পেজ ভিজিট গোনা হয় Plausible দিয়ে - কুকি ছাড়া, সামগ্রিক হিসাবে, নাম প্রকাশ ছাড়াই: কোনো প্রোফাইল নেই, কোনো বিজ্ঞাপন নেই, আর কখনোই আপনার আমলের সঙ্গে যুক্ত করা হয় না।",
    },
    {
      title: "যত্নে নেওয়া বিষয়বস্তু",
      body: "প্রতিটি জিকির প্রসিদ্ধ ও প্রচলিত সংকলন থেকে নেওয়া, তথ্যসূত্রসহ দেখানো হয়, এবং নির্ভরযোগ্য সূত্রে যাচাই করা হয়। এখানে কিছুই বানানো হয় না।",
    },
    {
      title: "সওয়াব নিয়ে সততা",
      body: "Amalyn উদযাপন করে শুধু অ্যাপের মাইলস্টোন - সম্পন্ন Quest, বাড়তে থাকা জার্নি। এটি কখনো দাবি করে না যে আল্লাহর প্রতিদান মাপা যায়, বান্দাদের স্তরে স্তরে সাজায় না, বা রুহানি ফলের ওয়াদা করে না। সেই হিসাব একমাত্র আল্লাহর।",
    },
  ],
  versionFooter: (v) => `Amalyn v${v} - উম্মাহর জন্য যত্নে তৈরি।`,

  // Paragraph breaks inside the preamble ride on "\n\n" + pre-line
  // rendering; the highlighted word stays between the two halves.
  supportIntroBefore:
    "Amalyn সবার জন্য, সম্পূর্ণ ফ্রি। এখানে কোনো কিছু Lock করা নেই, আর কোনো কিছু ব্যবহার করতে আপনাকে কখনো টাকা দিতে হবে না।\n\nতবে Amalyn আপনার ভালো লাগলে, আপনার ইচ্ছায় ",
  hadiyaWord: "হাদিয়া",
  supportIntroAfter:
    " দিতে পারেন। এটা একান্তই আপনার ইচ্ছা—কোনো বাধ্যবাধকতা নেই। আমল করার সময়ও আমরা আপনাকে হাদিয়ার কথা মনে করিয়ে দেব না।\n\nআপনার এই ছোট্ট Support Amalyn-কে Online রাখতে, ধর্মীয় বিষয়বস্তু যাচাই করতে এবং সবার জন্য Free রাখতে সাহায্য করবে। 🤍",
  giveHadiya: "হাদিয়া দিন",
  supportHadithHeading: "রাসূলুল্লাহ (সা.) এবং হাদিয়া",
  seeMoreHadith: (n) => `আরও হাদিস (${n})`,
  // Two paragraphs via "\n\n" + pre-line rendering, dua first.
  hadiyaDua:
    "আপনার দোয়াই আমার জন্য সবচেয়ে বড় হাদিয়া। দোয়ায় আমাকে মনে রাখবেন—এটুকুই আমার জন্য অনেক।\n\nআর আপনার ইচ্ছা হলে, হাদিয়ার মাধ্যমে Amalyn-এর পাশে থাকতে পারেন। আপনার হাদিয়া আমাকে আরও ইসলামিক কনটেন্ট তৈরি করে যেতে উৎসাহ দেয়। 🤍",
  wayToGive: "হাদিয়া পাঠান",
  regionHint: "আপনি কোথা থেকে হাদিয়া পাঠাচ্ছেন, সেটি বেছে নিন।",
  regionInsideBd: "বাংলাদেশে",
  regionOutsideBd: "বাংলাদেশের বাইরে",
  intlVisaNote: "বাংলাদেশের বাইরে থেকে পাঠালে নিচের EBL ভিসা হিসাবটি ব্যবহার করুন।",
  bkashLabel: "বিকাশ (Personal)",
  eblVisaLabel: "EBL ভিসা",
  bankNameLabel: "ইস্টার্ন ব্যাংক পিএলসি",
  accountName: "হিসাবের নাম",
  accountNumber: "হিসাব নম্বর",
  branchLabel: "শাখা",
  copyAria: "কপি করুন",
  copiedStatus: "কপি হয়েছে।",
  hadiyaSentButton: "আমি হাদিয়া পাঠিয়েছি",
  hadiyaSentHint:
    "ঐচ্ছিক। কোনো ব্যক্তিগত তথ্য যায় না - শুধু একটি হাদিয়া পাঠানো হয়েছে জানানো হয়।",
  hadiyaThanks:
    "জাযাকাল্লাহু খাইরান। আপনার হাদিয়া এই কাজকে উৎসাহিত করে - আল্লাহ যেন এটি কবুল করেন।",

  feedbackLink: "মতামত জানান",
  feedbackTitle: "মতামত",
  feedbackIntro:
    "Amalyn একটি ছোট, আন্তরিক চেষ্টা - যতই যত্ন নেওয়া হোক, কোথাও ভুল থেকে যেতে পারে। প্রতিটি বার্তা সরাসরি আমার কাছে পৌঁছায়, আর আমি প্রতিটি বার্তাই মন দিয়ে পড়ি।",
  feedbackMistakeTitle: "ভুল জানান",
  feedbackMistakeHint:
    "কোনো হাদিসের লেখা, অনুবাদ বা সূত্রে ভুল - কিংবা অন্য যেকোনো অসঙ্গতি",
  feedbackIdeaTitle: "মতামত শেয়ার করুন",
  feedbackIdeaHint: "পরামর্শ, আইডিয়া কিংবা ভালো লাগার কথা - সবই সমাদৃত",
  feedbackMessageLabel: "আপনার বার্তা",
  feedbackMessagePlaceholder: "ভুলটি বিস্তারিত লিখুন, বা আপনার মতামত শেয়ার করুন...",
  feedbackContactLabel: "ইমেইল বা যোগাযোগের মাধ্যম (ঐচ্ছিক)",
  feedbackContactHint:
    "উত্তর চাইলেই কেবল লিখুন। আপনার বার্তা কেবল ডেভেলপারের কাছেই পৌঁছায়।",
  feedbackSend: "পাঠান",
  feedbackSending: "পাঠানো হচ্ছে...",
  feedbackSent:
    "জাযাকাল্লাহু খাইরান - আপনার বার্তা পৌঁছে গেছে। প্রতিটি বার্তা মন দিয়ে পড়া হয়।",
  feedbackFailed: "এখন পাঠানো যায়নি। আবার চেষ্টা করুন।",
  feedbackPrivacy:
    "আপনার বার্তা সরাসরি ডেভেলপারের কাছে যায় - অ্যাকাউন্ট লাগে না, কিছু প্রকাশ হয় না, কিছু ট্র্যাকও করা হয় না।",

  missingTitle: "এই Quest-টি নেই।",
  missingBody: "হয়তো নাম বদলানো হয়েছে বা সরিয়ে ফেলা হয়েছে।",
  backToExplore: "Quest-এ ফিরুন",

  installTitle: "আপনার ডিভাইসে Amalyn রাখুন",
  installAndroidHint:
    "অ্যাপ ইনস্টল করুন: হোম স্ক্রিন থেকে এক ট্যাপে জিকির, অফলাইনেও কাজ করে।",
  installIosHint: "Share আইকনে ট্যাপ করে Add to Home Screen নির্বাচন করুন।",
  installAction: "ইনস্টল করুন",

  hadithTitle: "হাদিস",
  closeAria: "বন্ধ করুন",
  themePracticeHeading: "রাসূলুল্লাহ (সা.) নিজে কীভাবে আমল করতেন",
  themeRewardHeading: "সওয়াব সম্পর্কে রাসূলুল্লাহ (সা.) যা বলেছেন",
  themeOccasionHeading: "বিশেষ সময়",
  narratedBy: (name) => `বর্ণনায় ${name}`,
  footnoteComposed:
    "বাংলা অনুবাদ: আল হাদিস (ihadis.com)। পুরো হাদিস পড়তে সূত্রে ট্যাপ করুন।",
  hadithBnPending:
    "এই বর্ণনার বাংলা অনুবাদ এখনো যাচাই করা হচ্ছে; আপাতত সূত্র থেকে পড়ুন।",

  collectionBn: {
    "Sahih al-Bukhari": "সহীহ বুখারী",
    "Sahih Muslim": "সহীহ মুসলিম",
    "Jami at-Tirmidhi": "জামে তিরমিজী",
    "Riyad as-Salihin": "রিয়াদুস সালেহীন",
  },
  gradeBn: {
    "Hasan (Darussalam)": "হাসান (দারুসসালাম)",
  },
};

/** Copy for the active UI language; unset language falls back to English. */
export const copyFor = (language: "en" | "bn" | null): Copy =>
  language === "bn" ? BN : EN;

/** Shared nav labels (BottomNav + SideRail), resolved per language. */
export const navLabels = (lang: Lang): Record<string, string> => {
  const copy = lang === "bn" ? BN : EN;
  return {
    "/": copy.navHome,
    "/explore": copy.navExplore,
    "/journey": copy.navJourney,
    "/settings": copy.navSettings,
    navPrimaryAria: copy.navPrimaryAria,
  };
};
