import { describe, expect, it } from "vitest";

import { flagBool, flagValue, parseArgv } from "./argv.ts";

describe("parseArgv", () => {
  it("collects positionals and space-separated flags", () => {
    const parsed = parseArgv([
      "status",
      "fb-group-x-12345678",
      "publish",
      "--post-url",
      "https://facebook.com/groups/x/posts/1",
      "--yes",
    ]);
    expect(parsed.positionals).toEqual([
      "status",
      "fb-group-x-12345678",
      "publish",
    ]);
    expect(flagValue(parsed.flags, "post-url")).toBe(
      "https://facebook.com/groups/x/posts/1",
    );
    expect(flagBool(parsed.flags, "yes")).toBe(true);
  });

  it("supports --flag=value and boolean flags at the end", () => {
    const parsed = parseArgv(["draft", "some-id", "--variant=3", "--copy"]);
    expect(flagValue(parsed.flags, "variant")).toBe("3");
    expect(flagBool(parsed.flags, "copy")).toBe(true);
  });

  it("treats negative numbers as values, not flags", () => {
    const parsed = parseArgv(["--members", "-5"]);
    expect(flagValue(parsed.flags, "members")).toBe("-5");
  });

  it("keeps a flag without value boolean", () => {
    const parsed = parseArgv(["--json"]);
    expect(flagBool(parsed.flags, "json")).toBe(true);
    expect(flagValue(parsed.flags, "json")).toBeUndefined();
  });

  it("lets a later occurrence of a flag win", () => {
    const parsed = parseArgv(["--name", "first", "--name", "second"]);
    expect(flagValue(parsed.flags, "name")).toBe("second");
  });
});
