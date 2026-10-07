import type { Lang } from "./lang";

/**
 * UI copy table: EN is the source of truth, BN must satisfy typeof EN, so
 * a missing Bangla key is a compile error and the dictionary test catches
 * empty strings.
 *
 * Terminology map (Bangla-First Localization brief, section 8) - the
 * product vocabulary stays consistent everywhere:
 *
 *   Quest      -> Quest / কুয়েস্ট (kept: natural to Bangladeshi users)
 *   Journey    -> Journey / জার্নি (kept: product brand term)
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

  // Home
  greeting: "As-salamu alaykum.",
  todayLine: (n: string) => `Today: ${n} dhikr. Your Journey is waiting.`,
  nextStep: "Next step",
  beginNextQuest: "Begin your next quest.",
  journeyGrows: "Your journey grows with every quest you complete.",
  chooseQuest: "Choose a quest",
  viewJourney: "View your Journey",
  questsComplete: (done: string, total: string) =>
    `${done} / ${total} quests complete`,
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
  yourProgress: "Your progress",
  daysPracticed: "Days practiced",
  statTotal: "Total",
  statBest: "Best",
  dayCount: (n: string) => `${n} ${n === "1" ? "day" : "days"}`,
  daysInARow: (n: string) =>
    `${n} ${n === "1" ? "day" : "days"} in a row`,
  firstQuest: "First quest",
  chooseDhikrBegin: "Choose a dhikr and begin.",
  firstQuestBody:
    "Pick a quest, count with intention, and watch your journey of light grow. Everything stays on your device.",
  chooseFirstQuest: "Choose your first quest",
  firstVisit: "First visit?",
  howAmalynWorks: "How Amalyn works",
  howItWorksIntro:
    "Amalyn turns daily dhikr into a gentle journey: each quest gives your remembrance a beginning, a rhythm, and a visible path.",
  howStep1Title: "Choose a quest",
  howStep1Body:
    "Pick a dhikr with a target, like 33 or 100. Every quest shows the Arabic, its meaning, and its source, so you always know what you are reciting.",
  howStep2Title: "Count with intention",
  howStep2Body:
    "A calm, fullscreen counter: tap to count, undo anytime. It works fully offline, and your practice stays private on your device.",
  howStep3Title: "Watch your Journey grow",
  howStep3Body:
    "Reaching the target extends your path of light. Completing a quest is a milestone, not an ending - the Amal stays with you, ready to practice any day.",
  noStreaks:
    "No streaks to break, no points, no pressure - and no finish line. Just your practice, at your pace.",

  // Explore
  exploreTitle: "Explore",
  exploreSubtitle: "Choose a quest at your own pace.",
  allFilter: "All",
  preparingQuests: "Quests are being prepared with care.",
  scholarReviewEmpty:
    "Every dhikr goes through scholar review before it appears here. Please check back soon, in shaa Allah.",
  filterAria: "Filter quests by category",
  completeBadge: "Complete",

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

  // Quest detail
  exploreBack: "Explore",
  questLabel: "Quest",
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
  shareMilestone: "Share this milestone",
  backHome: "Back home",

  // Share
  shareTitle: "Share milestone",
  backAria: "Back",
  cardTheme: "Card theme",
  shareThemeNight: "night",
  shareThemeDawn: "dawn",
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
    "Your progress syncs automatically when online. Only event data (counts and quests) is stored — under a pseudonymous id, never your email — and never personal notes or content.",
  syncNow: "Sync now",
  signOut: "Sign out",
  deleteServerCopy: "Delete my server copy",
  deleteConfirmTitle: "Delete your server copy?",
  deleteConfirmBody:
    "Your synced events are removed from the server. Progress on this device stays untouched.",
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
      body: "Every dhikr is drawn from established, widely used collections, shown with its reference, and reviewed by a scholar or student of knowledge before public launch. Nothing is invented here.",
    },
    {
      title: "Honest rewards",
      body: "Amalyn celebrates product milestones — quests completed, a journey growing. It never claims to measure Allah's reward, rank believers, or promise spiritual outcomes. That measure belongs to Allah alone.",
    },
  ],
  versionFooter: (v: string) => `Amalyn v${v} - made with care for the Ummah.`,

  // Support
  supportFree: "Amalyn is completely free. There are no ads, no subscriptions, and no paid features — nothing is locked, ever.",
  hadiyaBefore: "If you personally wish to support this work, you may give a ",
  hadiyaWord: "Hadiya",
  hadiyaAfter:
    " — a voluntary gift. It is never required and never asked of you during your practice.",
  hadiyaBox:
    "A Hadiya unlocks nothing, because nothing needs unlocking. It does not change your quests, your journey, or your experience in any way.",
  supportHelps:
    "Support helps with keeping the app online, verifying its religious content with scholars, and keeping it free for everyone.",
  giveHadiya: "Give a Hadiya",
  hadiyaPending: "The support link will appear here once it is set up.",
  supportFooter: "Amalyn remains fully usable with or without it.",

  // Missing quest
  missingTitle: "That quest doesn't exist.",
  missingBody: "It may have been renamed or removed.",
  backToExplore: "Back to Explore",

  // Hadith sheet
  hadithTitle: "Hadith",
  closeAria: "Close",
  themePracticeHeading: "How the Prophet ﷺ practiced it",
  themeRewardHeading: "What the Prophet ﷺ said about its reward",
  themeOccasionHeading: "Special times",
  narratedBy: (name: string) => `Narrated ${name}`,
  footnoteVerifiedIntro: "Reference verified; scholar review pending.",
  footnoteComposed:
    "Translations are composed for Amalyn; tap a citation to read the full narration on sunnah.com.",
  footnoteReviewed: "Scholar reviewed.",
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
  navExplore: "কুয়েস্ট",
  navJourney: "জার্নি",
  navSettings: "সেটিংস",

  greeting: "আসসালামু আলাইকুম।",
  todayLine: (n) => `আজ ${n} জিকির হয়েছে। জার্নি আপনার অপেক্ষায়।`,
  nextStep: "পরবর্তী ধাপ",
  beginNextQuest: "পরের কুয়েস্ট শুরু করুন।",
  journeyGrows: "প্রতিটি কুয়েস্ট সম্পন্ন করার সঙ্গে আপনার জার্নি বাড়তে থাকে।",
  chooseQuest: "কুয়েস্ট বেছে নিন",
  viewJourney: "জার্নি দেখুন",
  questsComplete: (done, total) => `${total}টির মধ্যে ${done}টি কুয়েস্ট সম্পন্ন`,
  questsCompleteOf: (done, total) => `${total}টির মধ্যে ${done}টি কুয়েস্ট সম্পন্ন`,
  freeForever: "চিরদিনের জন্য ফ্রি। কোনো বিজ্ঞাপন নেই, অ্যাকাউন্টেরও দরকার নেই।",
  currentQuest: "চলমান কুয়েস্ট",
  currentQuestProgressAria: "চলমান কুয়েস্টের অগ্রগতি",
  continueQuest: "চালিয়ে যান",
  todaysAmal: "আজকের আমল",
  timesComplete: (n) => `${n}x সম্পন্ন`,
  todayCountLine: (n) => `আজ: ${n}x`,
  todaysAmalProgressAria: "আজকের আমলের অগ্রগতি",
  practiceNow: "আমল শুরু করুন",
  yourProgress: "আপনার অগ্রগতি",
  daysPracticed: "আমলের দিন",
  statTotal: "মোট",
  statBest: "সর্বোচ্চ",
  dayCount: (n) => `${n} দিন`,
  daysInARow: (n) => `টানা ${n} দিন`,
  firstQuest: "প্রথম কুয়েস্ট",
  chooseDhikrBegin: "একটি জিকির বেছে নিয়ে শুরু করুন।",
  firstQuestBody:
    "একটি কুয়েস্ট বেছে নিন, মন দিয়ে গুনুন - আর দেখুন আলোর পথ বাড়তে থাকছে। সবকিছু থাকে আপনার ডিভাইসেই।",
  chooseFirstQuest: "প্রথম কুয়েস্ট বেছে নিন",
  firstVisit: "প্রথমবার আসছেন?",
  howAmalynWorks: "Amalyn কীভাবে কাজ করে",
  howItWorksIntro:
    "Amalyn প্রতিদিনের জিকিরকে সাজায় এক মৃদু জার্নিতে: প্রতিটি কুয়েস্ট আপনার জিকিরকে দেয় একটি শুরু, একটি ছন্দ আর চোখে দেখা একটি পথ।",
  howStep1Title: "কুয়েস্ট বেছে নিন",
  howStep1Body:
    "লক্ষ্যসহ একটি জিকির বেছে নিন - যেমন ৩৩ বা ১০০। প্রতিটি কুয়েস্টে আরবি, তার অর্থ ও সূত্র দেখা যায়, তাই আপনি সবসময় জানেন কী পড়ছেন।",
  howStep2Title: "মন দিয়ে গুনুন",
  howStep2Body:
    "শান্ত, ফুলস্ক্রিন কাউন্টার: ট্যাপ করে গুনুন, দরকার হলে কমিয়ে নিন। সম্পূর্ণ অফলাইনে কাজ করে, আর আপনার আমল থাকে ডিভাইসেই প্রাইভেট।",
  howStep3Title: "জার্নি বাড়তে দেখুন",
  howStep3Body:
    "লক্ষ্য পূর্ণ হলে আলোর পথ এগিয়ে যায়। কুয়েস্ট সম্পন্ন হওয়া একটি মাইলস্টোন, সমাপ্তি নয় - আমলটি থেকে যায় আপনার কাছে, যেকোনো দিন আমল করার জন্য।",
  noStreaks:
    "ভাঙার মতো কোনো স্ট্রিক নেই, কোনো পয়েন্ট নেই, কোনো চাপ নেই, শেষের রেখাও নেই। শুধু আপনার আমল, আপনার গতিতে।",

  exploreTitle: "কুয়েস্ট",
  exploreSubtitle: "নিজের সুবিধামতো কুয়েস্ট বেছে নিন।",
  allFilter: "সব",
  preparingQuests: "কুয়েস্টগুলো যত্নের সঙ্গে প্রস্তুত হচ্ছে।",
  scholarReviewEmpty:
    "প্রতিটি জিকির এখানে আসার আগে আলেমদের পর্যালোচনা হয়। ইন শা আল্লাহ, খুব শিগগিরই আবার দেখা হবে।",
  filterAria: "ক্যাটাগরি অনুযায়ী কুয়েস্ট ফিল্টার করুন",
  completeBadge: "সম্পন্ন",

  journeyTitle: "জার্নি",
  pathOfLight: "আলোর পথ।",
  journeyEmptyTitle: "প্রথম কুয়েস্ট দিয়েই পথ শুরু হয়।",
  journeyEmptyBody: "প্রতিটি সম্পন্ন কুয়েস্ট এই পথে একটি আলো যোগ করে।",
  statDays: "দিন",
  statQuests: "কুয়েস্ট",
  statDhikr: "জিকির",
  upNext: "সামনে আসছে",
  journeyContinues: "জার্নি চলতেই থাকে",
  completedOnDate: (date) => `সম্পন্ন ${date}`,
  journeyAria: (n) => `${n}টি সম্পন্ন কুয়েস্টের জার্নি`,
  amalsInPractice: (n) =>
    `আপনার আমলে এখন ${n}টি আমল যুক্ত হয়েছে। যেকোনো দিন, যেকোনো একটিতে ফিরে যান - আপনার সঙ্গে পথও এগিয়ে চলবে।`,
  thisMonthDhikr: (n) => `এ মাসে ${n} জিকির`,
  overLastMonth: (n) => ` - গত মাসের চেয়ে +${n}`,

  exploreBack: "কুয়েস্ট",
  questLabel: "কুয়েস্ট",
  guidanceLabel: "নির্দেশনা",
  seeHadith: (n) => `হাদিস দেখুন (${n})`,
  sourceLabel: "সূত্র",
  verificationInProgress: "যাচাই চলছে",
  continueWithCount: (count, target) => `চলছে - ${count} / ${target}`,
  startQuest: (n) => `কুয়েস্ট শুরু - ${n}x`,
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
  questProgressAria: "কুয়েস্টের অগ্রগতি",
  tapToCount: "গুনতে যেকোনো জায়গায় ট্যাপ করুন",
  todaysAmalCompleteAria: "আজকের আমল সম্পন্ন",
  done: "ঠিক আছে",
  alhamdulillah: "আলহামদুলিল্লাহ",

  questComplete: "কুয়েস্ট সম্পন্ন",
  amalStaysInJourney: "এই আমল আপনার জার্নির অংশ থেকে যাবে।",
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
  notCompleteYet: "কুয়েস্টটি এখনো সম্পন্ন হয়নি।",
  finishFirst: "আগে এটি সম্পন্ন করুন, তারপর এই কার্ডটি এখানে অপেক্ষা করবে।",
  backToQuest: "কুয়েস্টে ফিরুন",
  shareText: "কুয়েস্ট সম্পন্ন - আলহামদুলিল্লাহ",
  statusShared: "শেয়ার হয়েছে।",
  statusSaved: "কার্ড ডিভাইসে সেভ হয়েছে।",
  statusImageFailed: "কার্ডের ছবি তৈরি করা যায়নি।",
  canvasCompleted: "সম্পন্ন",
  canvasAria: (name, n) => `অর্জনের কার্ড: ${name} ${n} বার, কুয়েস্ট সম্পন্ন`,

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
  wakeLockHint: "কুয়েস্টের কাউন্টার খোলা থাকাকালীন",
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
    "এতে এই ডিভাইসের সব কুয়েস্ট, গণনা ও সেটিংস স্থায়ীভাবে মুছে যাবে। চাইলে আগে ব্যাকআপ নিয়ে রাখুন। এটি আর ফেরানো যাবে না।",
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
    "অনলাইনে এলে অগ্রগতি নিজে থেকেই সিঙ্ক হয়। শুধু ইভেন্ট ডেটা (গণনা ও কুয়েস্ট) জমা থাকে - একটি গোপন আইডির অধীনে, ইমেইল কখনো নয় - আর কোনো ব্যক্তিগত নোট বা কনটেন্ট কখনোই নয়।",
  syncNow: "এখন সিঙ্ক করুন",
  signOut: "সাইন আউট",
  deleteServerCopy: "সার্ভার কপি মুছে দিন",
  deleteConfirmTitle: "সার্ভার কপি মুছে ফেলা হবে?",
  deleteConfirmBody:
    "সিঙ্ক করা ইভেন্টগুলো সার্ভার থেকে মুছে যাবে। এই ডিভাইসের অগ্রগতি অক্ষত থাকবে।",
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
      body: "প্রতিটি জিকির প্রসিদ্ধ ও প্রচলিত সংকলন থেকে নেওয়া, তথ্যসূত্রসহ দেখানো হয়, এবং প্রকাশের আগে আলেম বা জ্ঞানের ছাত্রের পর্যালোচনা হয়। এখানে কিছুই বানানো হয় না।",
    },
    {
      title: "সওয়াব নিয়ে সততা",
      body: "Amalyn উদযাপন করে শুধু অ্যাপের মাইলস্টোন - সম্পন্ন কুয়েস্ট, বাড়তে থাকা জার্নি। এটি কখনো দাবি করে না যে আল্লাহর প্রতিদান মাপা যায়, বান্দাদের স্তরে স্তরে সাজায় না, বা রুহানি ফলের ওয়াদা করে না। সেই হিসাব একমাত্র আল্লাহর।",
    },
  ],
  versionFooter: (v) => `Amalyn v${v} - উম্মাহর জন্য যত্নে তৈরি।`,

  supportFree:
    "Amalyn সম্পূর্ণ ফ্রি। এখানে বিজ্ঞাপন নেই, সাবস্ক্রিপশন নেই, পেইড ফিচার নেই - কিছুই কখনো লক করা হয় না।",
  hadiyaBefore: "নিজে ইচ্ছা হলে আপনি এই কাজের জন্য ",
  hadiyaWord: "হাদিয়া",
  hadiyaAfter:
    " দিতে পারেন - একটি স্বেচ্ছায় দেওয়া উপহার। এটি কখনো বাধ্যতামূলক নয়, আর আমলের মাঝে কখনো চাওয়াও হয় না।",
  hadiyaBox:
    "হাদিয়া কিছুই আনলক করে না - কারণ আনলক করার মতো কিছু নেইই। এটি আপনার কুয়েস্ট, জার্নি বা অভিজ্ঞতার কোনো কিছুই বদলায় না।",
  supportHelps:
    "আপনার সাপোর্ট অ্যাপটি অনলাইনে রাখতে, ধর্মীয় বিষয়বস্তু আলেম দিয়ে যাচাই করতে এবং সবার জন্য ফ্রি রাখতে সাহায্য করে।",
  giveHadiya: "হাদিয়া দিন",
  hadiyaPending: "সাপোর্ট লিংকটি চালু হলে এখানে দেখা যাবে।",
  supportFooter: "হাদিয়া থাকুক বা না থাকুক, Amalyn সম্পূর্ণ ব্যবহারযোগ্য।",

  missingTitle: "এই কুয়েস্টটি নেই।",
  missingBody: "হয়তো নাম বদলানো হয়েছে বা সরিয়ে ফেলা হয়েছে।",
  backToExplore: "কুয়েস্টে ফিরুন",

  hadithTitle: "হাদিস",
  closeAria: "বন্ধ করুন",
  themePracticeHeading: "রাসূলুল্লাহ (সা.) নিজে কীভাবে আমল করতেন",
  themeRewardHeading: "সওয়াব সম্পর্কে রাসূলুল্লাহ (সা.) যা বলেছেন",
  themeOccasionHeading: "বিশেষ সময়",
  narratedBy: (name) => `বর্ণনায় ${name}`,
  footnoteVerifiedIntro: "তথ্যসূত্র যাচাই হয়েছে; আলেমের পর্যালোচনা বাকি।",
  footnoteComposed:
    "বাংলা অনুবাদ: আল হাদিস (ihadis.com)। পুরো হাদিস পড়তে সূত্রে ট্যাপ করুন।",
  footnoteReviewed: "আলেম কর্তৃক পর্যালোচিত।",
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
  };
};
