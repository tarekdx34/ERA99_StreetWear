import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Salt Journal - QUTB",
  description:
    "QUTB Salt Journal: notes on cotton, fit, craft, care, and the everyday uniform.",
};

export default function SaltJournalPage() {
  redirect("/story#salt-journal");
}
