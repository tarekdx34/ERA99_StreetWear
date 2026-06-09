"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/brand";
import { QutbFooter } from "@/components/qutb-footer";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: "easeOut" as const },
  viewport: { once: true, margin: "-80px" },
};

const notes = [
  {
    title: "Weight",
    body: "A tee begins with GSM. The number matters because the fabric has to hold its own shape before it can hold yours.",
  },
  {
    title: "Finish",
    body: "Dye, wash, and hand feel are tested as part of construction, not styling. Softness should never cost the garment its structure.",
  },
  {
    title: "Fit",
    body: "The silhouette is simple because the standard is not. Shoulder, sleeve, body, and hem are tuned until the garment becomes quiet.",
  },
];

export function StoryPage() {
  return (
    <div className="overflow-x-hidden bg-[#FAF8F4] text-[#111111]">
      <main>
        <section
          className="relative flex min-h-[620px] items-center justify-center overflow-hidden text-center"
          style={{ height: "100svh", backgroundColor: "#1D2635" }}
        >
          <img
            src="https://images.unsplash.com/photo-1718846526824-f7f30a177d3a?w=1920&h=1200&fit=crop&auto=format"
            alt="Alexandria waterfront on the Mediterranean"
            width={1920}
            height={1200}
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(17,17,17,0.35),rgba(17,17,17,0.7))]" />
          <div className="relative z-10 flex flex-col items-center px-6 pt-16 text-[#FAF8F4]">
            <motion.p {...reveal} className="qutb-eyebrow text-[#FAF8F4]/70">
              Alexandria, Egypt
            </motion.p>
            <motion.h1 {...reveal} className="mt-8">
              <BrandLogo className="text-[clamp(5rem,16vw,11rem)]" />
            </motion.h1>
            <motion.p
              {...reveal}
              transition={{ duration: 0.75, ease: "easeOut", delay: 0.15 }}
              className="mt-8 max-w-[520px] text-[14px] font-light uppercase leading-[1.9] tracking-[0.18em] text-[#FAF8F4]/80"
            >
              Modern Mediterranean essentials, shaped by cotton, craft, and the
              quiet life of the coast.
            </motion.p>
          </div>
        </section>

        <section className="px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-12">
            <motion.div {...reveal} className="lg:col-span-5">
              <p className="qutb-eyebrow text-[#7C7C75]">The Premise</p>
              <h2 className="mt-6 font-brand-serif text-[clamp(2.7rem,6vw,5.8rem)] font-medium leading-none tracking-[-0.01em]">
                Premium basics, made by people who know fabric.
              </h2>
            </motion.div>
            <motion.div
              {...reveal}
              transition={{ duration: 0.75, ease: "easeOut", delay: 0.15 }}
              className="space-y-6 text-[17px] font-light leading-[1.9] text-[#7C7C75] lg:col-span-5 lg:col-start-8"
            >
              <p>
                QUTB is not built around novelty. It is built around the
                repeated garment: the tee you reach for, wash, wear again, and
                keep in rotation because nothing about it asks too loudly.
              </p>
              <p>
                The work begins before design. Fabric behavior, construction,
                fit, and finishing define the garment. Branding follows the
                standard, never the other way around.
              </p>
            </motion.div>
          </div>
        </section>

        <section id="alexandria" className="bg-[#111111] text-[#FAF8F4]">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <motion.div
              {...reveal}
              className="relative min-h-[520px] overflow-hidden bg-[#1D2635]"
            >
              <img
                src="/images/1.avif"
                alt="QUTB Alexandria campaign"
                width={1200}
                height={1500}
                loading="lazy"
                className="h-full w-full object-cover opacity-85"
              />
            </motion.div>
            <div className="flex items-center px-6 py-24 md:px-12 md:py-32">
              <motion.div {...reveal} className="max-w-lg">
                <p className="qutb-eyebrow text-[#FAF8F4]/35">
                  Alexandria
                </p>
                <h2 className="mt-6 font-brand-serif text-[clamp(2.6rem,5vw,4.8rem)] leading-[1.05]">
                  Made near
                  <br />
                  the sea.
                </h2>
                <p className="mt-8 text-[16px] font-light leading-[1.9] text-[#FAF8F4]/60">
                  Alexandria gives QUTB its emotional origin: the Corniche, the
                  old light, the practical rhythm of the city, and a textile
                  memory that runs through families, workshops, and factory
                  floors.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="cotton" className="bg-[#FAF8F4] px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-12">
            <motion.div {...reveal} className="lg:col-span-5">
              <p className="qutb-eyebrow text-[#7C7C75]">Cotton Journey</p>
              <h2 className="mt-6 font-brand-serif text-[clamp(2.6rem,5vw,4.8rem)] leading-[1.05]">
                Fabric before fashion.
              </h2>
            </motion.div>
            <div className="grid gap-8 lg:col-span-6 lg:col-start-7">
              {notes.map((note, index) => (
                <motion.article
                  key={note.title}
                  {...reveal}
                  transition={{
                    duration: 0.75,
                    ease: "easeOut",
                    delay: index * 0.12,
                  }}
                  className="border-t border-[#111111]/10 pt-6"
                >
                  <p className="qutb-eyebrow text-[#111111]">{note.title}</p>
                  <p className="mt-4 text-[16px] font-light leading-[1.85] text-[#7C7C75]">
                    {note.body}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="fabric" className="relative overflow-hidden bg-[#EDE8DF]">
          <div className="aspect-[16/10] md:aspect-[21/9]">
            <img
              src="/images/4.webp"
              alt="Cotton fabric texture"
              width={1800}
              height={900}
              loading="lazy"
              className="h-full w-full object-cover opacity-80"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(17,17,17,0.65),transparent)] p-6 text-[#FAF8F4] md:p-12">
            <p className="font-brand-serif text-[clamp(1.7rem,4vw,3.6rem)]">
              Cotton engineered for structure. Softened through wear.
            </p>
          </div>
        </section>

        <section
          id="salt-journal"
          className="bg-[#F5F0E8] px-6 py-24 text-center md:px-12 md:py-32"
        >
          <div className="mx-auto max-w-[980px]">
            <motion.p {...reveal} className="qutb-eyebrow text-[#7C7C75]">
              Salt Journal
            </motion.p>
            <motion.h2
              {...reveal}
              transition={{ duration: 0.75, ease: "easeOut", delay: 0.12 }}
              className="mt-8 font-brand-serif text-[clamp(2.6rem,6vw,5.6rem)] font-medium leading-[1.05]"
            >
              Fabric first.
              <br />
              Logo second.
              <br />
              Always.
            </motion.h2>
            <motion.p
              {...reveal}
              transition={{ duration: 0.75, ease: "easeOut", delay: 0.22 }}
              className="mx-auto mt-8 max-w-xl text-[16px] font-light leading-[1.9] text-[#7C7C75]"
            >
              Notes on fit, cotton, making, care, and the small decisions that
              turn a basic into a permanent uniform.
            </motion.p>
            <motion.div
              {...reveal}
              transition={{ duration: 0.75, ease: "easeOut", delay: 0.32 }}
              className="mt-10"
            >
              <Link
                href="/shop"
                className="qutb-link-underline text-[12px] uppercase tracking-[0.18em] text-[#111111]"
              >
                Shop The Uniform
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <QutbFooter />
    </div>
  );
}
