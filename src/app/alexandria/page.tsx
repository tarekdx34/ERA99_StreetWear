import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Alexandria - QUTB",
  description:
    "Alexandria as QUTB's emotional origin: sea light, textile memory, and modern Mediterranean essentials.",
};

export default function AlexandriaPage() {
  redirect("/story#alexandria");
}
