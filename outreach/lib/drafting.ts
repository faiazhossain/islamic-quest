// Personalized post and permission-request drafts in English and Bangla.
//
// Design rules baked in here:
// - No two communities receive identical text (fingerprint guard).
// - Drafts interpolate only whitelisted, operator-recorded fields
//   (display name, focus phrase, dhikr name) - never free-form research
//   notes, so nothing can be fabricated by accident.
// - No religious-reward claims, no testimonials, no membership numbers.
// - The disclosure line is fixed: the operator is connected to Amalyn
//   and says so.
// - Same inputs produce byte-identical output; --variant re-rolls
//   deterministically.

import { challengeUrl } from "./link.ts";
import { fingerprint, fnv1a32, mulberry32 } from "./hash.ts";
import type { Community } from "./types.ts";

export const TEMPLATE_VERSION = 1;
const MAX_VARIANT_ADVANCE = 500;

export type DraftLang = "en" | "bn";
export type DraftTemplate = "post" | "permission";

export interface DraftInput {
  community: Pick<
    Community,
    | "dedupKey"
    | "displayName"
    | "focus"
    | "lang"
    | "dhikrId"
  >;
  template: DraftTemplate;
  // Overrides community.dhikrId.
  dhikrId?: string | null;
  siteUrl?: string;
  // Overrides the languages implied by community.lang.
  langs?: DraftLang[];
  // Explicit variant (from --variant); otherwise seeded by dedupKey.
  variant?: number;
  // Fingerprints of drafts already issued to other communities; the
  // generator advances the variant until the text is distinct.
  taken?: Set<string>;
}

export interface GeneratedDraft {
  en: string | null;
  bn: string | null;
  variant: number;
  fingerprint: string;
}

function dhikrPhrase(lang: DraftLang, dhikrId: string | null | undefined): string {
  if (!dhikrId) {
    return lang === "bn"
      ? "আপনার পছন্দের জিকিরের ৩০ দিন"
      : "30 days of your chosen dhikr";
  }
  const names = DRAFT_DHIKR_NAMES[dhikrId];
  if (!names) {
    throw new Error(`unknown dhikr id: ${dhikrId}`);
  }
  return lang === "bn" ? `৩০ দিনের ${names.bn}` : `30 days of ${names.en}`;
}

// Kept as plain data here (rather than importing the app catalog) so the
// CLI keeps running under node --experimental-strip-types; the ids and
// names are cross-checked against src/lib/content/dhikr.ts by tests.
const DRAFT_DHIKR_NAMES: Record<string, { en: string; bn: string }> = {
  astaghfirullah: { en: "Astaghfirullah", bn: "আস্তাগফিরুল্লাহ" },
  "sayyid-ul-istighfar": { en: "Sayyid al-Istighfar", bn: "সাইয়িদুল ইস্তিগফার" },
  subhanallah: { en: "Subhanallah", bn: "সুবহানাল্লাহ" },
  alhamdulillah: { en: "Alhamdulillah", bn: "আলহামদুলিল্লাহ" },
  "allahu-akbar": { en: "Allahu Akbar", bn: "আল্লাহু আকবার" },
  "la-ilaha-illallah": { en: "La ilaha illallah", bn: "লা ইলাহা ইল্লাল্লাহ" },
  "subhanallahi-wa-bihamdihi": {
    en: "Subhanallahi wa bihamdihi",
    bn: "সুবহানাল্লাহি ওয়া বিহামদিহি",
  },
  hawqala: { en: "Hawqala", bn: "হাওকালা" },
  "salawat-ibrahimiyya": { en: "Salawat (Ibrahimiyya)", bn: "দরুদ শরীফ (ইব্রাহিমী)" },
  "rabbi-inni-lima-anzalta": { en: "Rabbi inni lima anzalta", bn: "রাব্বি ইন্নী লিমা আনযালতা" },
  "hasbunallahu-wa-nimal-wakil": {
    en: "Hasbunallahu wa ni'mal wakeel",
    bn: "হাসবুনাল্লাহু ওয়া নিমাল ওয়াকিল",
  },
  "allahumma-inni-asaluka-alhuda": {
    en: "Allahumma inni as'aluka al-huda",
    bn: "আল্লাহুম্মা ইন্নী আসআলুকাল হুদা",
  },
  "audhu-min-hammi-wal-hazan": {
    en: "Dua against worry & grief",
    bn: "দুশ্চিন্তা ও দুঃখ থেকে আশ্রয়ের দোয়া",
  },
  "bismika-allahumma-amutu-wa-ahya": {
    en: "Bismika Allahumma amutu wa ahya",
    bn: "বিসমিকা আল্লাহুম্মা আমূতু ওয়া আহইয়া",
  },
  "audhu-bikalimatillah-it-tammat": {
    en: "A'udhu bikalimatillahit-tammati",
    bn: "আউযু বিকালিমাতিল্লাহিত তাম্মাতি",
  },
  "ayat-al-kursi": { en: "Ayat al-Kursi", bn: "আয়াতুল কুরসি" },
  "bismillahilladhi-la-yadurru": {
    en: "Bismillahilladhi la yadurru",
    bn: "বিসমিল্লাহিল্লাজি লা ইয়াদুররু",
  },
  "inna-lillahi-wa-inna-ilayhi-rajion": {
    en: "Inna lillahi wa inna ilayhi raji'un",
    bn: "ইন্না লিল্লাহি ওয়া ইন্না ইলাইহি রাজিউন",
  },
  "rabbana-atina-fid-dunya": {
    en: "Rabbana atina fid-dunya hasanah",
    bn: "রাব্বানা আতিনা ফিদ্দুনিয়া হাসানাহ",
  },
  "rabbir-hamhuma": {
    en: "Rabbir hamhuma kama rabbayani saghira",
    bn: "রব্বির হামহুমা কামা রাব্বায়ানী সগীরা",
  },
};

const DISCLOSURE_EN =
  "Full disclosure: I'm one of the people behind Amalyn, so take that into account - sharing it because I believe it genuinely helps.";
const DISCLOSURE_BN =
  "স্বচ্ছতার জন্য বলছি: আমি Amalyn-এর পেছনের একজন মানুষ, তাই সেটা মাথায় রেখে দেখবেন - উপকার হবে ভেবেই শেয়ার করছি।";

function pick<T>(options: readonly T[], rng: () => number): T {
  return options[Math.floor(rng() * options.length) % options.length];
}

// Which languages to render for a community. Mixed renders both.
export function draftLangs(lang: Community["lang"]): DraftLang[] {
  if (lang === "bn") return ["bn"];
  if (lang === "mixed") return ["en", "bn"];
  return ["en"];
}

function renderPost(lang: DraftLang, input: DraftInput, rng: () => number): string {
  const { community } = input;
  const name = community.displayName;
  const focus = community.focus.trim().replace(/\s+/g, " ");
  const link = challengeUrl(
    input.dhikrId ?? community.dhikrId ?? "subhanallah",
    { siteUrl: input.siteUrl },
  );
  const dhikr = dhikrPhrase(lang, input.dhikrId ?? community.dhikrId);

  if (lang === "en") {
    const opener = pick(
      [
        `As-salamu alaykum, ${name} family.`,
        "As-salamu alaykum, everyone.",
        `Assalamu alaykum - peace and greetings to ${name}.`,
        "As-salamu alaykum wa rahmatullah.",
        "Salaam, everyone.",
        `As-salamu alaykum, ${name}.`,
      ] as const,
      rng,
    );
    const relevanceFirst = rng() < 0.5;
    const relevance = pick(
      [
        `I have noticed how this community keeps up ${focus} - and keeping that up every single day is where most of us struggle.`,
        `Staying consistent with ${focus} is the hard part, and that seems to be exactly what this group cares about.`,
      ] as const,
      rng,
    );
    const feature = pick(
      [
        `Amalyn is a free app (no ads, no subscription) for building a steady daily dhikr habit: pick an amal, set a daily target, and check in with one tap. There is also a commitment mode for goals like ${dhikr}.`,
        `I wanted to share Amalyn, a free app for daily amal. It keeps things simple: choose your dhikr, set how many per day, and tap to count. If you want more structure, commitment challenges like ${dhikr} are there too.`,
        `Amalyn is a free, offline-first app that helps with consistency in daily dhikr - one tap to count each day, gentle quests to follow, and commitment challenges like ${dhikr}.`,
        `For anyone trying to stay regular with dhikr: Amalyn is a free app that turns it into a simple daily routine - a target, a big counting button, and an honest record of your practice.`,
        `Amalyn (a free app, no ads) is built around one idea: make daily amal easy to keep. Choose a dhikr and a daily target, count with one tap, and optionally commit to challenges like ${dhikr}.`,
      ] as const,
      rng,
    );
    const cta = pick(
      [
        `If that sounds helpful, Amalyn is free to use here: ${link}`,
        `You can try it free, no account needed: ${link}`,
        `It is completely free if you would like to try it: ${link}`,
        `Free to use, works offline, no account needed: ${link}`,
        `Here is the link if you want to take a look: ${link}`,
      ] as const,
      rng,
    );
    const signoff = pick(
      [
        "May your practice stay steady.",
        "JazakumAllahu khayran for reading.",
        "Wishing you consistency in your amal.",
      ] as const,
      rng,
    );
    const body = relevanceFirst
      ? `${relevance}\n\n${feature}\n\n${cta}`
      : `${feature}\n\n${relevance}\n\n${cta}`;
    return `${opener}\n\n${body}\n\n${signoff}\n\n${DISCLOSURE_EN}`;
  }

  const opener = pick(
    [
      `আসসালামু আলাইকুম, ${name} পরিবার।`,
      "আসসালামু আলাইকুম সবাইকে।",
      `আসসালামু আলাইকুম - ${name} এর সবাইকে শুভেচ্ছা।`,
      "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ।",
      "সবাইকে সালাম।",
      "আসসালামু আলাইকুম, প্রিয় ভাই ও বোনেরা।",
    ] as const,
    rng,
  );
  const relevanceFirst = rng() < 0.5;
  const relevance = pick(
    [
      `এই গ্রুপে ${focus} চর্চা দেখে ভালো লেগেছে - আসল চ্যালেঞ্জ তো প্রতিদিন একটানা চালিয়ে নেওয়া।`,
      `${focus} নিয়মিত রাখাটাই সবচেয়ে কঠিন, আর মনে হচ্ছে এই গ্রুপ সেটাই নিয়ে ভাবে।`,
    ] as const,
    rng,
  );
  const feature = pick(
    [
      `Amalyn একটি ফ্রি অ্যাপ (কোনো বিজ্ঞাপন বা সাবস্ক্রিপশন নেই) যা প্রতিদিনের জিকির নিয়মিত রাখতে সাহায্য করে: আমল বেছে নিন, দৈনিক টার্গেট ঠিক করুন, এক ট্যাপে হিসাব। কমিটমেন্ট চ্যালেঞ্জও আছে (যেমন ${dhikr})।`,
      `Amalyn নামে একটি ফ্রি অ্যাপ শেয়ার করছি: জিকির বেছে নিন, দিনে কতবার হবে ঠিক করুন, আর প্রতিদিন এক ট্যাপে গুনে রাখুন। চাইলে কমিটমেন্ট চ্যালেঞ্জও করা যায় (যেমন ${dhikr})।`,
      `Amalyn একটি ফ্রি, অফলাইন-ফার্স্ট অ্যাপ - দৈনিক জিকির এক ট্যাপে গোনা যায়, ধীরে-সুস্থ কোয়েস্ট ফলো করা যায়, আর কমিটমেন্ট চ্যালেঞ্জও নেওয়া যায় (যেমন ${dhikr})।`,
      `জিকির নিয়মিত রাখার চেষ্টা করছেন এমন যারা আছেন, তাদের জন্য: Amalyn ফ্রি অ্যাপে একটি দৈনিক টার্গেট, একটি বড় কাউন্টিং বাটন আর আপনার চর্চার সৎ হিসাব থাকে।`,
      `Amalyn (ফ্রি অ্যাপ, বিজ্ঞাপন নেই) একটি ভাবনা নিয়ে বানানো: দৈনন্দিন আমল সহজে চালিয়ে নেওয়া। জিকির ও টার্গেট ঠিক করুন, এক ট্যাপে গুনুন, চাইলে কমিটমেন্ট চ্যালেঞ্জ নিন (যেমন ${dhikr})।`,
    ] as const,
    rng,
  );
  const cta = pick(
    [
      `ভালো লাগলে Amalyn এখান থেকে ফ্রি ব্যবহার করা যায়: ${link}`,
      `অ্যাকাউন্ট ছাড়াই ফ্রি চেষ্টা করা যায়: ${link}`,
      `সম্পূর্ণ ফ্রি, ইচ্ছা হলে দেখতে পারেন: ${link}`,
      `ফ্রি, অফলাইনেও চলে, অ্যাকাউন্ট লাগে না: ${link}`,
      `দেখতে চাইলে লিংক এখানে: ${link}`,
    ] as const,
    rng,
  );
  const signoff = pick(
    [
      "সবার আমল যেন একটানা থাকে।",
      "পড়ার জন্য ধন্যবাদ।",
      "আমলে একাগ্রতা সবার জন্য।",
    ] as const,
    rng,
  );
  const body = relevanceFirst
    ? `${relevance}\n\n${feature}\n\n${cta}`
    : `${feature}\n\n${relevance}\n\n${cta}`;
  return `${opener}\n\n${body}\n\n${signoff}\n\n${DISCLOSURE_BN}`;
}

function renderPermission(lang: DraftLang, input: DraftInput, rng: () => number): string {
  const { community } = input;
  const name = community.displayName;
  const focus = community.focus.trim().replace(/\s+/g, " ");
  const dhikr = dhikrPhrase(lang, input.dhikrId ?? community.dhikrId);

  if (lang === "en") {
    const opener = pick(
      [
        `As-salamu alaykum, ${name} admins.`,
        "As-salamu alaykum.",
        `Salaam - a question for the admins of ${name}.`,
      ] as const,
      rng,
    );
    const closing = pick(
      [
        "Would it be okay to share a single, clearly-disclosed post about it? Happy to follow any rules or wording you prefer.",
        "May I share one clearly-disclosed post about it here? I will follow any rules or wording you prefer.",
      ] as const,
      rng,
    );
    return [
      opener,
      "",
      `I help build Amalyn, a free app (no ads, no subscription) that helps people keep a steady daily dhikr habit - one tap a day, plus optional commitment challenges like ${dhikr}.`,
      "",
      `I noticed this group's focus on ${focus}, and I think some members would genuinely find it useful. Before posting anything, I wanted to ask your permission first, since I know many groups keep self-promotion off the feed. ${closing}`,
      "",
      "JazakumAllahu khayran for your time.",
      "",
      DISCLOSURE_EN,
    ].join("\n");
  }

  const opener = pick(
    [
      `আসসালামু আলাইকুম, ${name} এর অ্যাডমিনরা।`,
      "আসসালামু আলাইকুম।",
      `সালাম - ${name} এর অ্যাডমিনদের একটি অনুরোধ।`,
    ] as const,
    rng,
  );
  const closing = pick(
    [
      "একটি মাত্র, স্পষ্ট ডিসক্লোজারসহ পোস্ট শেয়ার করা কি ঠিক হবে? আপনাদের নিয়ম বা শব্দ অনুযায়ী চলতে রাজি আছি।",
      "এখানে একটি স্পষ্ট ডিসক্লোজারসহ পোস্ট দেওয়া কি অনুমোদন করবেন? যেভাবে বলবেন সেভাবেই লিখব।",
    ] as const,
    rng,
  );
  return [
    opener,
    "",
    `আমি Amalyn নামের একটি ফ্রি অ্যাপ বানানোর কাজের সঙ্গে যুক্ত (কোনো বিজ্ঞাপন বা সাবস্ক্রিপশন নেই) - এটি প্রতিদিনের জিকির নিয়মিত রাখতে সাহায্য করে: দিনে এক ট্যাপ, চাইলে কমিটমেন্ট চ্যালেঞ্জ (যেমন ${dhikr})।`,
    "",
    `এই গ্রুপের ${focus} নিয়ে কাজ দেখে মনে হয়েছে কিছু সদস্য উপকার পেতে পারেন। পোস্ট করার আগে আপনাদের অনুমতি চাইছি, কারণ জানি অনেক গ্রুপে সেলফ-প্রমোশন নিষেধ। ${closing}`,
    "",
    "সময় দেওয়ার জন্য জাযাকাল্লাহু খাইরান।",
    "",
    DISCLOSURE_BN,
  ].join("\n");
}

function renderLang(lang: DraftLang, input: DraftInput, variant: number): string {
  const seed = fnv1a32(
    `${input.community.dedupKey}|${input.template}|v${variant}`,
  );
  const rng = mulberry32(seed);
  return input.template === "post"
    ? renderPost(lang, input, rng)
    : renderPermission(lang, input, rng);
}

// Generate a draft. If `taken` already holds this text's fingerprint
// (another community received identical wording), the variant advances
// deterministically until it is distinct.
export function generateDraft(input: DraftInput): GeneratedDraft {
  const focus = input.community.focus.trim().replace(/\s+/g, " ");
  if (!focus) {
    throw new Error(
      "drafting requires a short focus phrase recorded on the community " +
        "(e.g. 'daily morning and evening adhkar') - drafts never invent one",
    );
  }
  if (focus.length > 80) {
    throw new Error(
      `focus phrase is ${focus.length} chars; keep it under 80 so drafts stay natural`,
    );
  }

  const langs = input.langs ?? draftLangs(input.community.lang);
  const startVariant = input.variant ?? 0;
  const taken = input.taken;

  for (let offset = 0; offset <= MAX_VARIANT_ADVANCE; offset++) {
    const variant = startVariant + offset;
    const rendered: Partial<Record<DraftLang, string>> = {};
    for (const lang of langs) rendered[lang] = renderLang(lang, input, variant);
    const fp = fingerprint(
      langs.map((lang) => rendered[lang]).join("\n---\n"),
    );
    if (!taken || !taken.has(fp)) {
      return {
        en: rendered.en ?? null,
        bn: rendered.bn ?? null,
        variant,
        fingerprint: fp,
      };
    }
  }
  throw new Error(
    `could not find a distinct draft within ${MAX_VARIANT_ADVANCE} variants`,
  );
}

// Guard used by tests: Bangla drafts must actually be Bangla.
export function containsBengali(text: string): boolean {
  return /\p{Script=Bengali}/u.test(text);
}
