"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand";
import { useConsent } from "@/contexts/consent-context";

const footerSections = [
  {
    heading: "Shop",
    links: [
      { label: "The Uniform", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Size Guide", href: "/shop" },
      { label: "Track Order", href: "/track-order" },
    ],
  },
  {
    heading: "Journal",
    links: [
      { label: "Cotton Journey", href: "/story#cotton" },
      { label: "Alexandria", href: "/story#alexandria" },
      { label: "Salt Journal", href: "/story#salt-journal" },
      { label: "Fabric Notes", href: "/story#fabric" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our Story", href: "/story" },
      { label: "Account", href: "/account" },
      { label: "Returns", href: "/return-policy" },
      { label: "Contact", href: "mailto:hello@qutb.studio" },
    ],
  },
];

export function QutbFooter() {
  const { resetConsentDecision } = useConsent();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    try {
      setStatus("loading");
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "footer" }),
      });
      if (!res.ok) throw new Error("early access request failed");
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-[#FAF8F4] text-[#111111]">
      <div className="border-y border-[#111111]/10 bg-[#F5F0E8] px-6 py-7 md:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 md:flex-row">
          <p className="qutb-eyebrow text-[#7C7C75]">
            From Alexandria. Built to stay.
          </p>
          <form
            onSubmit={handleJoin}
            className="flex w-full max-w-md flex-col gap-0 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              disabled={status === "loading" || status === "success"}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder={
                status === "success" ? "Added to the list" : "Your email"
              }
              aria-label="Email for early access"
              className="h-11 min-w-0 border border-[#111111]/20 bg-transparent px-4 text-sm font-light tracking-[0.04em] text-[#111111] outline-none placeholder:text-[#7C7C75]"
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="h-11 border border-[#111111] bg-[#111111] px-5 text-[11px] uppercase tracking-[0.16em] text-[#FAF8F4] transition-opacity hover:opacity-70 disabled:opacity-50"
            >
              {status === "loading"
                ? "Joining"
                : status === "success"
                  ? "Joined"
                  : "Join"}
            </button>
            {status === "error" ? (
              <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#8B0000] sm:ml-3 sm:mt-3">
                Try again
              </p>
            ) : null}
          </form>
        </div>
      </div>

      <div className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <BrandLogo className="text-[42px] text-[#111111]" />
            <p className="mt-6 max-w-[280px] text-[15px] font-light leading-[1.75] text-[#7C7C75]">
              Premium basics born in Alexandria, Egypt. Made by people who grew
              up around fabric, sea light, and everyday uniforms.
            </p>
            <p className="mt-6 text-[11px] font-light uppercase tracking-[0.16em] text-[#111111]/35">
              Alexandria, Egypt
            </p>
          </div>

          {footerSections.map((section) => (
            <nav key={section.heading} className="md:col-span-2">
              <p className="mb-5 text-[11px] uppercase tracking-[0.2em] text-[#111111]">
                {section.heading}
              </p>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="text-sm font-light tracking-[0.03em] text-[#7C7C75] transition-colors hover:text-[#111111]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm font-light tracking-[0.03em] text-[#7C7C75] transition-colors hover:text-[#111111]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
                {section.heading === "Company" ? (
                  <li>
                    <button
                      type="button"
                      onClick={resetConsentDecision}
                      className="text-left text-sm font-light tracking-[0.03em] text-[#7C7C75] transition-colors hover:text-[#111111]"
                    >
                      Cookie Preferences
                    </button>
                  </li>
                ) : null}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mx-auto mt-14 flex max-w-[1400px] flex-col items-start justify-between gap-4 border-t border-[#111111]/10 pt-7 text-[11px] font-light tracking-[0.1em] text-[#111111]/35 md:flex-row md:items-center">
          <p>© 2026 QUTB. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/return-policy" className="hover:text-[#111111]">
              Returns
            </Link>
            <Link href="/track-order" className="hover:text-[#111111]">
              Shipping
            </Link>
            <a href="mailto:hello@qutb.studio" className="hover:text-[#111111]">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
