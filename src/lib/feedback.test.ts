import { describe, expect, it } from "vitest";
import {
  MAX_FEEDBACK_CONTACT,
  MAX_FEEDBACK_MESSAGE,
  parseFeedback,
} from "./feedback";

describe("parseFeedback", () => {
  it("accepts a full submission and keeps the message verbatim", () => {
    const body = {
      topic: "mistake",
      message: "The translation of Riyad as-Salihin 1158 reads differently on sunnah.com.",
      contact: "user@example.com",
    };
    expect(parseFeedback(body)).toEqual({
      topic: "mistake",
      message: body.message,
      contact: "user@example.com",
    });
  });

  it("normalizes an omitted or blank contact to null", () => {
    const base = { topic: "suggestion", message: "Add more dhikr categories." };
    expect(parseFeedback(base)?.contact).toBeNull();
    expect(parseFeedback({ ...base, contact: "   " })?.contact).toBeNull();
  });

  it("trims surrounding whitespace from message and contact", () => {
    const parsed = parseFeedback({
      topic: "mistake",
      message: "  Wrong narrator name.  ",
      contact: "  me@example.com ",
    });
    expect(parsed?.message).toBe("Wrong narrator name.");
    expect(parsed?.contact).toBe("me@example.com");
  });

  it("rejects non-object bodies", () => {
    expect(parseFeedback(null)).toBeNull();
    expect(parseFeedback("mistake")).toBeNull();
    expect(parseFeedback(42)).toBeNull();
    expect(parseFeedback(["mistake"])).toBeNull();
  });

  it("rejects unknown topics", () => {
    expect(parseFeedback({ topic: "other", message: "hi" })).toBeNull();
    expect(parseFeedback({ message: "hi" })).toBeNull();
  });

  it("rejects empty and oversized messages", () => {
    expect(parseFeedback({ topic: "mistake", message: "" })).toBeNull();
    expect(parseFeedback({ topic: "mistake", message: "   " })).toBeNull();
    expect(
      parseFeedback({
        topic: "mistake",
        message: "x".repeat(MAX_FEEDBACK_MESSAGE + 1),
      }),
    ).toBeNull();
  });

  it("accepts a message at the size limit", () => {
    expect(
      parseFeedback({
        topic: "suggestion",
        message: "x".repeat(MAX_FEEDBACK_MESSAGE),
      }),
    ).not.toBeNull();
  });

  it("rejects an oversized contact instead of truncating it", () => {
    expect(
      parseFeedback({
        topic: "mistake",
        message: "ok",
        contact: "x".repeat(MAX_FEEDBACK_CONTACT + 1),
      }),
    ).toBeNull();
  });

  it("rejects non-string fields", () => {
    expect(parseFeedback({ topic: 3, message: "hi" })).toBeNull();
    expect(parseFeedback({ topic: "mistake", message: 42 })).toBeNull();
    expect(parseFeedback({ topic: "mistake", message: "hi", contact: 7 })).toBeNull();
  });
});
