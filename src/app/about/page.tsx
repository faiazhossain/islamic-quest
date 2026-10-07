import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "About & Privacy",
};

export default function AboutPage() {
  return <AboutContent />;
}
