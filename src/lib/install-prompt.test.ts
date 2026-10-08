import { describe, expect, it } from "vitest";
import {
  INSTALL_DISMISSED_KEY,
  detectInstallPlatform,
  installDismissed,
  isStandalone,
} from "./install-prompt";

const IOS_IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

// iPadOS 13+ requests the desktop page and reports a Macintosh agent.
const IPADOS_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15";

const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";

const MAC_DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const WINDOWS_TOUCH_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

describe("detectInstallPlatform", () => {
  it("classifies iPhone Safari as ios", () => {
    expect(detectInstallPlatform(IOS_IPHONE_UA, 5)).toBe("ios");
  });

  it("classifies an iPad reporting the Macintosh agent as ios", () => {
    expect(detectInstallPlatform(IPADOS_UA, 5)).toBe("ios");
  });

  it("classifies Android Chrome as android", () => {
    expect(detectInstallPlatform(ANDROID_UA, 5)).toBe("android");
  });

  it("leaves desktop browsers untargeted", () => {
    expect(detectInstallPlatform(MAC_DESKTOP_UA, 0)).toBe("unsupported");
  });

  it("does not mistake a touch-capable Windows laptop for a phone", () => {
    expect(detectInstallPlatform(WINDOWS_TOUCH_UA, 5)).toBe("unsupported");
  });
});

describe("isStandalone", () => {
  it("is true for the standalone display mode (Android, desktop)", () => {
    expect(isStandalone(true, undefined)).toBe(true);
  });

  it("is true for the iOS navigator.standalone flag", () => {
    expect(isStandalone(false, true)).toBe(true);
  });

  it("is false in a normal browser tab", () => {
    expect(isStandalone(false, undefined)).toBe(false);
  });
});

describe("installDismissed", () => {
  const storeOf = (value: string | null) => ({
    getItem: (key: string) => (key === INSTALL_DISMISSED_KEY ? value : null),
  });

  it("is true only after an explicit dismissal", () => {
    expect(installDismissed(storeOf("1"))).toBe(true);
    expect(installDismissed(storeOf(null))).toBe(false);
    expect(installDismissed(storeOf("0"))).toBe(false);
  });

  it("reads a throwing store as not dismissed", () => {
    expect(
      installDismissed({
        getItem: () => {
          throw new Error("storage blocked");
        },
      }),
    ).toBe(false);
  });
});
