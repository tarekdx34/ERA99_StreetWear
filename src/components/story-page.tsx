"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" as const },
  viewport: { once: true, margin: "-80px" },
};

const chapterClass = "text-[11px] uppercase tracking-[0.5em] text-[#555555]";

const timelineEvents = [
  {
    label: "20+ YEARS",
    body: "Built by people who spent 20+ years in Egyptian factories before making a shirt for themselves.",
  },
  {
    label: "THE POSITION",
    body: "The axis stays fixed. The product carries the position.",
  },
  {
    label: "THE BUILD",
    body: "Six months of sampling. Washing. Wearing. Breaking fabric until it held. Until the shirt felt exactly like it should — heavy, structured, built to last.",
  },
  {
    label: "QUTB",
    body: "The axis. The fixed point that everything else revolves around.",
  },
  {
    label: "DROP 001",
    body: "ERA 99 is the first chapter. 100% COTTON Egyptian combed cotton. Heavyweight. Boxy. Drop shoulder. Built in Alexandria, Egypt.",
  },
];

export function StoryPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [hideScrollIndicator, setHideScrollIndicator] = useState(false);

  useEffect(() => {
    const introTimer = window.setTimeout(() => setShowIntro(false), 1700);
    return () => window.clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 10) setHideScrollIndicator(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const contentReveal = useMemo(
    () => ({
      initial: { clipPath: "inset(0 0 100% 0)", opacity: 0.2 },
      animate: { clipPath: "inset(0 0 0% 0)", opacity: 1 },
      transition: { duration: 0.8, ease: "easeOut" as const },
    }),
    [],
  );

  return (
    <div className="overflow-x-hidden bg-[#080808] text-[#EDE9E0]">
      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#080808]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <motion.div
              className="font-anton text-[72px] tracking-[0.18em] text-[#EDE9E0] sm:text-[92px] sm:tracking-[16px] md:text-[124px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 1.2,
                times: [0, 0.25, 0.7, 1],
                ease: "easeOut",
              }}
            >
              QUTB
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.main
        className="relative"
        initial={contentReveal.initial}
        animate={!showIntro ? contentReveal.animate : contentReveal.initial}
        transition={contentReveal.transition}
      >
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-32 text-center md:pt-36">
          <motion.p
            {...reveal}
            className="absolute top-32 text-[14px] tracking-[0.4em] text-[#555555] md:top-36"
          >
            NOT A BRAND. A POSITION.
          </motion.p>

          <motion.h1
            {...reveal}
            className="font-anton max-w-[800px] text-[64px] leading-none tracking-[0.18em] text-[#EDE9E0] sm:text-[72px] sm:tracking-[16px] md:text-[120px]"
          >
            QUTB
          </motion.h1>

          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="mt-8 text-[16px] leading-[1.6] text-[#EDE9E0]/70 md:text-[20px]"
          >
            Everything revolves.
            <br />
            We are the point it revolves around.
          </motion.p>

          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="mt-6 max-w-[20rem] text-[12px] uppercase leading-relaxed tracking-[0.2em] text-[#555555] sm:max-w-none sm:text-[13px] sm:tracking-[0.3em]"
          >
            ERA 99 — DROP 001 — ALEXANDRIA
          </motion.p>

          <AnimatePresence>
            {!hideScrollIndicator ? (
              <motion.div
                key="scroll-indicator"
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <motion.div
                  className="h-16 w-px bg-[#EDE9E0]/45"
                  animate={{ y: [0, 12, 0], opacity: [0.45, 1, 0.45] }}
                  transition={{
                    duration: 1.8,
                    ease: "easeOut",
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <section className="relative overflow-hidden px-6 py-24 md:px-10 md:py-32">
          <div className="pointer-events-none absolute left-4 top-8 text-[18vw] leading-none text-[#EDE9E0]/[0.04] md:left-10">
            Q
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-[1fr_1.2fr] md:gap-14">
            <div />
            <div className="relative z-10">
              <motion.p {...reveal} className={chapterClass}>
                THE AXIS
              </motion.p>
              <motion.h2
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                className="mt-6 font-anton text-[52px] leading-none tracking-[0.18em] text-[#EDE9E0] sm:text-[56px] sm:tracking-[16px]"
              >
                QUTB.
              </motion.h2>

              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="mt-10 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                Built by people who spent 20+ years in Egyptian factories before
                making a shirt for themselves.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                They built for global labels. They chose to build for themselves.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                Sampling, washing, and wear testing set the standard. QUTB holds
                the axis.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.65 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                Alexandria is the fixed point.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.8 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                ERA 99 is the first chapter. 100% COTTON. Garment dyed. Wash tested.
              </motion.p>
            </div>
          </div>
        </section>

        <motion.section
          {...reveal}
          className="relative h-[70vh] w-full overflow-hidden"
        >
          <img
            src="/images/1.jpeg"
            alt="Alexandria campaign"
            width={1600}
            height={1200}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(8,8,8,0.9)_100%)]" />
          <div className="absolute bottom-8 left-4 flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.18em] text-[#EDE9E0]/70 md:left-10 md:text-[13px] md:tracking-[0.3em]">
            <span>Alexandria, Egypt</span>
            <span>—</span>
            <span>2025</span>
          </div>
        </motion.section>

        <section className="px-6 py-24 md:px-10 md:py-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-14">
            <motion.div {...reveal} className="order-2 md:order-1">
              <p className={chapterClass}>THE ORIGIN</p>
              <h2 className="mt-6 font-anton text-[44px] leading-none tracking-[0.16em] text-[#EDE9E0] sm:text-[48px] sm:tracking-[16px]">
                Built by two.
              </h2>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="mt-10 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                A father and son building from factory memory, not moodboards.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                100% COTTON, garment dyed, wash tested. Specs earn the feeling.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                QUTB stands on production memory and deliberate standards.
              </motion.p>
            </motion.div>

            <motion.div
              {...reveal}
              className="relative order-1 flex aspect-square w-full items-center justify-center overflow-hidden border border-ash/10 bg-ash/5 md:order-2"
            >
              <img
                src="/images/story/factory-1.jpg"
                alt="QUTB factory process"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                onLoad={(event) => {
                  const label = event.currentTarget.nextElementSibling;
                  if (label instanceof HTMLElement) label.style.display = "none";
                }}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <p className="text-xs uppercase tracking-widest text-[#555555]">
                /images/story/factory-1.jpg
              </p>
            </motion.div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-10 md:py-32 bg-[#111]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
            <motion.div
              {...reveal}
              className="relative flex aspect-square w-full items-center justify-center overflow-hidden border border-ash/10 bg-ash/5"
            >
              <img
                src="/images/story/father-son-sketch.jpg"
                alt="Father and son sketch"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                onLoad={(event) => {
                  const label = event.currentTarget.nextElementSibling;
                  if (label instanceof HTMLElement) label.style.display = "none";
                }}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <p className="text-xs uppercase tracking-widest text-[#555555]">
                /images/story/father-son-sketch.jpg
              </p>
            </motion.div>

            <motion.div {...reveal}>
              <p className={chapterClass}>THE LEGACY</p>
              <h2 className="mt-6 font-anton text-[40px] leading-none tracking-[0.12em] text-[#EDE9E0] sm:text-[48px] sm:tracking-[16px]">
                A dialogue across generations.
              </h2>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="mt-10 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                What begins in the factory is passed down out of it. The conversations that start over sewing machines echo in the streets.
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section
          className="relative overflow-hidden px-6 py-24 md:px-10 md:py-32"
          style={{
            backgroundImage:
              "radial-gradient(rgba(237,233,224,0.02) 1px, transparent 1px)",
            backgroundSize: "6px 6px",
          }}
        >
          <div className="mx-auto max-w-7xl">
            <motion.p {...reveal} className={chapterClass}>
              THE CITY
            </motion.p>
            <motion.h2
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="mt-6 font-anton text-[44px] leading-none tracking-[0.16em] text-[#EDE9E0] sm:text-[48px] sm:tracking-[16px] md:text-[72px]"
            >
              Alexandria.
            </motion.h2>
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mt-8 text-[11px] uppercase leading-relaxed tracking-[0.18em] text-[#555555] sm:text-[12px] sm:tracking-[0.3em]"
            >
              32°N, 29°E — MEDITERRANEAN COAST — EST. 331 BC
            </motion.p>

            <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
              <motion.div
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
                className="text-[17px] leading-[1.85] text-[rgba(237,233,224,0.85)]"
              >
                <p>
                  Alexandria is not Cairo. It does not move the same way, does
                  not sound the same way, does not feel the same way. It is a
                  city that has held the weight of the world before — the
                  ancient lighthouse, the great library, the crossroads of
                  civilizations — and it has forgotten more history than most
                  cities will ever have.
                </p>
                <p className="mt-8">
                  We did not choose Alexandria. We are Alexandria. The way the
                  sea hits the corniche at 2am, the way the old walls peel and
                  hold their ground, the way this city survives everything
                  without making a sound about it — that is the identity of
                  QUTB.
                </p>
              </motion.div>

              <motion.div
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
                className="text-[17px] leading-[1.85] text-[rgba(237,233,224,0.85)]"
              >
                <p>
                  Alexandria holds. Every shirt carries that address — even
                  when no one can read it.
                </p>
              </motion.div>
            </div>

            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.55 }}
              className="mt-14 border-t border-[#EDE9E0]/10 pt-10"
            >
              <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                <div>
                  <p className="font-anton text-[42px] leading-none tracking-[0.14em] text-[#EDE9E0] sm:text-[48px] sm:tracking-[16px]">
                    331 BC
                  </p>
                  <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-[#555555]">
                    Founded
                  </p>
                </div>
                <div>
                  <p className="font-anton text-[34px] leading-none tracking-[0.08em] text-[#EDE9E0] sm:text-[48px] sm:tracking-[16px]">
                    100% COTTON
                  </p>
                  <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-[#555555]">
                    Fabric Weight
                  </p>
                </div>
                <div>
                  <p className="font-anton text-[42px] leading-none tracking-[0.14em] text-[#EDE9E0] sm:text-[48px] sm:tracking-[16px]">
                    QUTB
                  </p>
                  <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-[#555555]">
                    The Axis
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-7xl">
            <motion.p {...reveal} className={chapterClass}>
              THE BUILD
            </motion.p>
            <motion.h2
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="mt-6 font-anton text-[42px] leading-none tracking-[0.14em] text-[#EDE9E0] sm:text-[48px] sm:tracking-[16px]"
            >
              How we got here.
            </motion.h2>

            <div className="relative mt-14">
              <div className="absolute bottom-0 left-4 top-0 w-px bg-[rgba(237,233,224,0.2)] md:left-1/2 md:-translate-x-1/2" />

              <div className="space-y-10">
                {timelineEvents.map((event, index) => {
                  const right = index % 2 === 1;
                  return (
                    <motion.div
                      key={event.label}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.7,
                        ease: "easeOut",
                        delay: index * 0.2,
                      }}
                      viewport={{ once: true, margin: "-80px" }}
                      className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] md:gap-8"
                    >
                      <div
                        className={`pl-10 md:pl-0 ${right ? "md:col-start-3" : "md:col-start-1"}`}
                      >
                        <p className="text-[11px] uppercase tracking-[0.5em] text-[#555555]">
                          {event.label}
                        </p>
                        <p className="mt-4 text-[16px] leading-[1.8] text-[rgba(237,233,224,0.85)]">
                          {event.body}
                        </p>
                      </div>

                      <div className="absolute left-4 top-2 h-3 w-3 -translate-x-1/2 border border-[#EDE9E0]/50 bg-[#080808] md:left-1/2 md:top-3" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-[700px] text-center">
            <motion.p {...reveal} className={chapterClass}>
              THE POSITION
            </motion.p>
            <motion.blockquote
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="mt-8 font-anton text-[26px] leading-[1.35] tracking-[0.16em] text-[#EDE9E0] sm:tracking-[8px] md:text-[40px]"
            >
              Not a brand. A position.
            </motion.blockquote>
            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mx-auto mt-10 h-px w-20 bg-[#EDE9E0]/30"
            />
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              className="mt-6 text-[13px] italic text-[#555555]"
            >
              — QUTB, Alexandria
            </motion.p>
          </div>
        </section>

        <section className="px-6 pb-28 pt-20 text-center md:px-10 md:pb-36 md:pt-24">
          <div className="mx-auto max-w-3xl">
            <motion.h2
              {...reveal}
              className="font-anton text-[58px] leading-none tracking-[0.18em] text-[#EDE9E0] sm:text-[64px] sm:tracking-[16px] md:text-[90px]"
            >
              QUTB
            </motion.h2>
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="mt-4 text-[20px] text-[#EDE9E0]/65"
            >
              The axis holds.
            </motion.p>
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mt-5 text-[12px] uppercase leading-relaxed tracking-[0.22em] text-[#555555] sm:text-[13px] sm:tracking-[0.4em]"
            >
              ERA 99 — DROP 001 — LIVE
            </motion.p>

            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
              className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/shop"
                className="border border-[#EDE9E0] bg-[#EDE9E0] px-8 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[#080808]"
            >
              ENTER ERA 99
              </Link>
              <Link
                href="/"
                className="border border-[#EDE9E0] px-8 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[#EDE9E0]"
              >
                BACK TO HOME
              </Link>
            </motion.div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
