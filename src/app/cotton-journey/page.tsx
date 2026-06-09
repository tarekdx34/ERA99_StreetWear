import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Cotton Journey - QUTB",
  description:
    "The QUTB cotton journey: fabric weight, finish, fit, and construction behind the permanent uniform.",
};

export default function CottonJourneyPage() {
  redirect("/story#cotton");
}
