/**
 * Shared contract for the feedback form and its API route. The parser is
 * the single source of truth for what a submission is, so the client
 * cannot send - and the route cannot relay - anything outside these
 * limits.
 */

export const FEEDBACK_TOPICS = ["mistake", "suggestion"] as const;
export type FeedbackTopic = (typeof FEEDBACK_TOPICS)[number];

/** Discord caps embed descriptions at 4096; 2000 keeps reports readable. */
export const MAX_FEEDBACK_MESSAGE = 2000;
export const MAX_FEEDBACK_CONTACT = 120;

export interface FeedbackSubmission {
  topic: FeedbackTopic;
  message: string;
  /** Optional reply channel; empty input is normalized to null. */
  contact: string | null;
}

const asTrimmed = (value: unknown): string | null =>
  typeof value === "string" ? value.trim() : null;

/**
 * Validates an untrusted request body into a submission, or null when it
 * is outside the contract (wrong shape, unknown topic, empty or oversized
 * message, oversized contact).
 */
export function parseFeedback(body: unknown): FeedbackSubmission | null {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }
  const record = body as Record<string, unknown>;

  const topic = record.topic;
  if (typeof topic !== "string" || !FEEDBACK_TOPICS.includes(topic as FeedbackTopic)) {
    return null;
  }

  const message = asTrimmed(record.message);
  if (message === null || message.length === 0 || message.length > MAX_FEEDBACK_MESSAGE) {
    return null;
  }

  // The form sends an explicit null when no contact was entered; any
  // other non-string type is outside the contract, not an empty value.
  const rawContact = record.contact;
  if (
    rawContact !== undefined &&
    rawContact !== null &&
    typeof rawContact !== "string"
  ) {
    return null;
  }
  const contact = typeof rawContact === "string" ? rawContact.trim() : null;
  if (contact !== null && contact.length > MAX_FEEDBACK_CONTACT) {
    return null;
  }

  return { topic: topic as FeedbackTopic, message, contact: contact || null };
}
