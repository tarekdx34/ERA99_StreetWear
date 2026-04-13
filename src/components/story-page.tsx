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
    label: "15 YEARS",
    body: "Our father spent 15 years inside Egyptian factories. Not owning. Serving. Learning every thread, every supplier, every machine that other people's brands ran on.",
  },
  {
    label: "THE QUESTION",
    body: 'One day I asked him — why are we building their brand and not ours?',
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
    body: "ERA 99 is the first chapter. 220 GSM Egyptian combed cotton. Heavyweight. Boxy. Drop shoulder. Built in Alexandria, Egypt.",
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
    <div className="bg-[#080808] text-[#ede9e0]">
      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#080808]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <motion.div
              className="font-anton text-[92px] tracking-[16px] text-[#ede9e0] md:text-[124px]"
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
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <motion.p
            {...reveal}
            className="absolute top-24 text-[14px] tracking-[0.4em] text-[#555555]"
          >
            NOT A BRAND. A POSITION.
          </motion.p>

          <motion.h1
            {...reveal}
            className="font-anton max-w-[800px] text-[72px] leading-none tracking-[16px] text-[#ede9e0] md:text-[120px]"
          >
            QUTB
          </motion.h1>

          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="mt-8 text-[16px] leading-[1.6] text-[#ede9e0]/70 md:text-[20px]"
          >
            Everything revolves.
            <br />
            We are the point it revolves around.
          </motion.p>

          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="mt-6 text-[13px] uppercase tracking-[0.3em] text-[#555555]"
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
                  className="h-16 w-px bg-[#ede9e0]/45"
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
          <div className="pointer-events-none absolute left-4 top-8 text-[18vw] leading-none text-[#ede9e0]/[0.04] md:left-10">
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
                className="mt-6 font-anton text-[56px] leading-none tracking-[16px] text-[#ede9e0]"
              >
                QUTB.
              </motion.h2>

              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="mt-10 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                My father spent 15 years inside Egyptian factories. Not owning.
                Serving. Learning every thread, every supplier, every machine
                that other people&apos;s brands ran on.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                One day I asked him — why are we building their brand and not
                ours?
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                Six months of sampling. Washing. Wearing. Breaking fabric until
                it held. QUTB. The axis. The fixed point that everything else
                revolves around.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.65 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                Alexandria is that point. This family is that point. This brand
                is that point.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.8 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                ERA 99 is the first chapter.
              </motion.p>
            </div>
          </div>
        </section>

        <motion.section
          {...reveal}
          className="relative left-1/2 right-1/2 -mx-[50vw] h-[70vh] w-screen overflow-hidden"
        >
          <img
            src="/images/1.jpeg"
            alt="Alexandria campaign"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(8,8,8,0.9)_100%)]" />
          <div className="absolute bottom-8 left-6 flex items-center gap-3 text-[13px] uppercase tracking-[0.3em] text-[#ede9e0]/70 md:left-10">
            <span>Alexandria, Egypt</span>
            <span>—</span>
            <span>2025</span>
          </div>
        </motion.section>

        <section className="px-6 py-24 md:px-10 md:py-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-14">
            <motion.div {...reveal} className="order-2 md:order-1">
              <p className={chapterClass}>THE ORIGIN</p>
              <h2 className="mt-6 font-anton text-[48px] leading-none tracking-[16px] text-[#ede9e0]">
                Built by two.
              </h2>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="mt-10 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                ERA 99 began with a conversation. A father. 15 years in
                Egyptian factories. A son. One question: why not ours?
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                Most brands guess at quality. We grew up inside it. Every
                supplier we use, every fabric weight we chose, every stitch
                specification — nothing was decided blindly. This is the
                advantage you cannot buy and cannot fake.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(237,233,224,0.85)]"
              >
                We are not a startup. We are a family that decided to stop
                building other people&apos;s brands and start building our own.
              </motion.p>
            </motion.div>

            <motion.div
              {...reveal}
              className="order-1 aspect-square w-full overflow-hidden bg-[linear-gradient(145deg,#0b0b0b,#131313)] md:order-2"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(237,233,224,0.05), transparent 40%), radial-gradient(circle at 80% 70%, rgba(237,233,224,0.04), transparent 45%)",
              }}
            />
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
              className="mt-6 font-anton text-[48px] leading-none tracking-[16px] text-[#ede9e0] md:text-[72px]"
            >
              Alexandria.
            </motion.h2>
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mt-8 text-[12px] uppercase tracking-[0.3em] text-[#555555]"
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
                  Alexandria is our axis. The fixed point. The place we come
                  from and the place everything in this brand points back to.
                  Every shirt we make carries that address — even when no one
                  can read it.
                </p>
              </motion.div>
            </div>

            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.55 }}
              className="mt-14 border-t border-[#ede9e0]/10 pt-10"
            >
              <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                <div>
                  <p className="font-anton text-[48px] leading-none tracking-[16px] text-[#ede9e0]">
                    331 BC
                  </p>
                  <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-[#555555]">
                    Founded
                  </p>
                </div>
                <div>
                  <p className="font-anton text-[48px] leading-none tracking-[16px] text-[#ede9e0]">
                    220 GSM
                  </p>
                  <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-[#555555]">
                    Fabric Weight
                  </p>
                </div>
                <div>
                  <p className="font-anton text-[48px] leading-none tracking-[16px] text-[#ede9e0]">
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
              className="mt-6 font-anton text-[48px] leading-none tracking-[16px] text-[#ede9e0]"
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

                      <div className="absolute left-4 top-2 h-3 w-3 -translate-x-1/2 border border-[#ede9e0]/50 bg-[#080808] md:left-1/2 md:top-3" />
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
              className="mt-8 font-anton text-[28px] leading-[1.4] tracking-[8px] text-[#ede9e0] md:text-[40px]"
            >
              Not a brand. A position.
            </motion.blockquote>
            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mx-auto mt-10 h-px w-20 bg-[#ede9e0]/30"
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
              className="font-anton text-[64px] leading-none tracking-[16px] text-[#ede9e0] md:text-[90px]"
            >
              QUTB
            </motion.h2>
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="mt-4 text-[20px] text-[#ede9e0]/65"
            >
              Everything revolves. We are the point it revolves around.
            </motion.p>
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mt-5 text-[13px] uppercase tracking-[0.4em] text-[#555555]"
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
                className="border border-[#ede9e0] bg-[#ede9e0] px-8 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#080808]"
              >
                SHOP THE DROP →
              </Link>
              <Link
                href="/"
                className="border border-[#ede9e0] px-8 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#ede9e0]"
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
