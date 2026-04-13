import type { Metadata } from "next";
import { StoryPage } from "@/components/story-page";

export const metadata: Metadata = {
  title: "Our Story — QUTB",
  description:
    "QUTB is the axis: born in Alexandria, built from the inside out, and rooted in heavyweight essentials with a fixed position.",
};

export default function StoryRoutePage() {
  return <StoryPage />;
}
