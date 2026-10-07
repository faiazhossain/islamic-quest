"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MAX_FEEDBACK_CONTACT,
  MAX_FEEDBACK_MESSAGE,
  type FeedbackTopic,
} from "@/lib/feedback";
import { useCopy } from "@/lib/i18n";

type SendState = "idle" | "sending" | "sent" | "failed";

/**
 * Client body of the Feedback page: a topic choice (mistake report or
 * general feedback), the message, and an optional reply channel. The
 * submission posts to /api/feedback, which relays it to the developer.
 */
export function FeedbackContent() {
  const copy = useCopy();
  const [topic, setTopic] = useState<FeedbackTopic>("mistake");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<SendState>("idle");

  // The sent confirmation is momentary; the form is ready for another
  // message once it fades.
  useEffect(() => {
    if (state !== "sent") return;
    const timer = window.setTimeout(() => setState("idle"), 6000);
    return () => window.clearTimeout(timer);
  }, [state]);

  const trimmed = message.trim();
  const canSend =
    state !== "sending" && trimmed.length > 0 && trimmed.length <= MAX_FEEDBACK_MESSAGE;

  const send = async () => {
    if (!canSend) return;
    setState("sending");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          topic,
          message: trimmed,
          contact: contact.trim() || null,
        }),
      });
      if (!response.ok) {
        setState("failed");
        return;
      }
      setMessage("");
      setContact("");
      setState("sent");
    } catch {
      setState("failed");
    }
  };

  const topics: Array<[FeedbackTopic, string, string]> = [
    ["mistake", copy.feedbackMistakeTitle, copy.feedbackMistakeHint],
    ["suggestion", copy.feedbackIdeaTitle, copy.feedbackIdeaHint],
  ];

  return (
    <div className="flex flex-1 flex-col lg:mx-auto lg:max-w-xl">
      <div className="rise">
        <Link
          href="/settings"
          className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-sm text-ink-3 transition-colors hover:text-ink-2 active:opacity-60"
        >
          <BackChevron />
          {copy.settingsBack}
        </Link>
      </div>

      <header className="rise mt-2">
        <h1 className="font-display text-[2rem] leading-tight text-ink lg:text-4xl">
          {copy.feedbackTitle}
        </h1>
      </header>

      <p className="rise mt-6 text-[15px] leading-relaxed text-ink-2 [animation-delay:80ms]">
        {copy.feedbackIntro}
      </p>

      <form
        className="rise mt-8 [animation-delay:160ms]"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <fieldset
          className="mt-0"
          aria-label={copy.feedbackTitle}
        >
          <div className="space-y-2">
            {topics.map(([id, title, hint]) => (
              <label
                key={id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors active:opacity-70 ${
                  topic === id
                    ? "border-accent bg-accent/5"
                    : "border-line bg-surface hover:bg-surface-2"
                }`}
              >
                <input
                  type="radio"
                  name="topic"
                  value={id}
                  checked={topic === id}
                  onChange={() => setTopic(id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--accent)]"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">{title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-3">
                    {hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5">
          <label
            htmlFor="feedback-message"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3"
          >
            {copy.feedbackMessageLabel}
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={copy.feedbackMessagePlaceholder}
            rows={6}
            maxLength={MAX_FEEDBACK_MESSAGE}
            required
            className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-base leading-relaxed text-ink outline-none placeholder:text-ink-3 focus:border-accent"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="feedback-contact"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3"
          >
            {copy.feedbackContactLabel}
          </label>
          <input
            id="feedback-contact"
            type="text"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            maxLength={MAX_FEEDBACK_CONTACT}
            // 16px minimum: smaller inputs trigger iOS Safari's focus zoom.
            className="mt-2 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-ink outline-none placeholder:text-ink-3 focus:border-accent"
          />
          <p className="mt-2 text-xs leading-relaxed text-ink-3">
            {copy.feedbackContactHint}
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px disabled:opacity-50"
        >
          {state === "sending" ? copy.feedbackSending : copy.feedbackSend}
        </button>

        {state === "sent" && (
          <p role="status" className="mt-3 text-sm leading-relaxed text-jade">
            {copy.feedbackSent}
          </p>
        )}
        {state === "failed" && (
          <p role="alert" className="mt-3 text-sm leading-relaxed text-danger">
            {copy.feedbackFailed}
          </p>
        )}
      </form>

      <p className="rise mt-6 pb-2 text-xs leading-relaxed text-ink-3 [animation-delay:240ms]">
        {copy.feedbackPrivacy}
      </p>
    </div>
  );
}

function BackChevron() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M10 3.5 5.5 8 10 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
