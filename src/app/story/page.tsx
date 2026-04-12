import type { Metadata } from "next";
import { StoryPage } from "@/components/story-page";

export const metadata: Metadata = {
  title: "Our Story — 6 STREET",
  description:
    "6 STREET is the axis: born in Alexandria, built by two, and rooted in heavyweight essentials with a fixed position.",
};

export default function StoryRoutePage() {
  return <StoryPage />;
}
