/**
 * Pure decision logic for the mobile install bar. The component owns the
 * browser plumbing (beforeinstallprompt capture, storage writes); the
 * testable rules live here.
 */

/** The device families the install bar knows how to help. */
export type InstallPlatform = "ios" | "android" | "unsupported";

/**
 * Classifies the browser from its user agent and touch capability.
 * iOS includes iPadOS since version 13: Safari there requests the desktop
 * page and reports a Macintosh agent while keeping a touchscreen, so a
 * Macintosh agent with more than one touch point is an iPad.
 */
export function detectInstallPlatform(
  userAgent: string,
  maxTouchPoints: number,
): InstallPlatform {
  const agent = userAgent.toLowerCase();
  const ios =
    /iphone|ipad|ipod/.test(agent) ||
    (agent.includes("macintosh") && maxTouchPoints > 1);
  if (ios) return "ios";
  if (agent.includes("android")) return "android";
  return "unsupported";
}

/**
 * Whether the app already runs installed: the standalone display mode
 * covers Android and desktop installs, while iOS Safari only exposes its
 * legacy navigator.standalone flag.
 */
export function isStandalone(
  standaloneDisplay: boolean,
  navigatorStandalone: unknown,
): boolean {
  return standaloneDisplay || navigatorStandalone === true;
}

/** localStorage key recording an explicit dismissal of the install bar. */
export const INSTALL_DISMISSED_KEY = "amalyn:install-dismissed";

/**
 * Whether the reader dismissed the bar on an earlier visit. A throwing
 * store (private browsing, blocked storage) reads as not dismissed so a
 * blocked reader still sees the offer.
 */
export function installDismissed(store: Pick<Storage, "getItem">): boolean {
  try {
    return store.getItem(INSTALL_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}
