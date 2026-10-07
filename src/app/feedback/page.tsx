import type { Metadata } from "next";
import { FeedbackContent } from "./feedback-content";

export const metadata: Metadata = {
  title: "Send feedback",
};

export default function FeedbackPage() {
  return <FeedbackContent />;
}
