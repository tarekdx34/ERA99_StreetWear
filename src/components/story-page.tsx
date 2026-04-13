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

const chapterClass = "text-[11px] uppercase tracking-[0.5em] text-[#8B0000]";

const timelineEvents = [
  {
    label: "15 YEARS",
    body: "Our father spends fifteen years inside Egyptian factories as an External Operations Manager, running production for some of the country's largest retail orders. He learns every factory, every supplier, every weakness in the system.",
  },
  {
    label: "THE IDEA",
    body: "A conversation happens. The knowledge that built other people's brands gets redirected. We decide to build something of our own — from Alexandria, with the resources that were always there.",
  },
  {
    label: "THE NAME",
    body: "After months of searching for a name that felt like a statement, we arrive at ERA 99. The axis. The fixed point. The thing that doesn't move while everything else spins. It was always the right word.",
  },
  {
    label: "THE FABRIC",
    body: "220 GSM Egyptian combed cotton. Heavyweight. Boxy. Drop shoulder. Six months of sampling and washing and wearing until the shirt felt exactly like it should — heavy, structured, built to last.",
  },
  {
    label: "99 — DROP 001",
    body: "The first collection is here. Not a test. Not a soft launch. A position.",
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
    <div className="bg-[#080808] text-[#F0EDE8]">
      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#080808]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <motion.div
              className="font-blackletter display-hero text-[92px] text-[#F0EDE8] md:text-[124px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 1.2,
                times: [0, 0.25, 0.7, 1],
                ease: "easeOut",
              }}
            >
              ERA 99
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
            className="absolute top-24 text-[14px] tracking-[0.4em] text-[#F0EDE8]/55"
          >
            99
          </motion.p>

          <motion.h1
            {...reveal}
            className="max-w-[800px] text-[32px] leading-[1.1] md:text-[52px]"
          >
            This is the era.
          </motion.h1>

          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="mt-8 text-[13px] uppercase tracking-[0.3em] text-[#F0EDE8]/65"
          >
            ERA 99 — ALEXANDRIA
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
                  className="h-16 w-px bg-[#F0EDE8]/45"
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
          <div className="pointer-events-none absolute left-4 top-8 text-[18vw] leading-none text-[#F0EDE8]/[0.04] md:left-10">
            
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
                className="mt-6 font-blackletter display-hero text-[56px] leading-none text-[#F0EDE8]"
              >
                We are ERA 99.
              </motion.h2>

              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="mt-10 text-[18px] leading-[1.8] text-[rgba(240,237,232,0.85)]"
              >
                ERA 99 is not a trend. It is not a drop. It is not a brand
                built for the algorithm or the approval of strangers. ERA 99
                is a fixed point in a world that never stops spinning — the axis
                that everything else revolves around.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(240,237,232,0.85)]"
              >
                We make heavyweight boxy t-shirts for people who already know
                who they are. No loud graphics. No borrowed identity. Just
                fabric, fit, and the quiet confidence of someone who has nothing
                to prove.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(240,237,232,0.85)]"
              >
                Born in Alexandria. Built from the inside out. This is not
                fashion — this is a position.
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
          <div className="absolute bottom-8 left-6 flex items-center gap-3 text-[13px] uppercase tracking-[0.3em] text-[#F0EDE8]/70 md:left-10">
            <span>Alexandria, Egypt</span>
            <span>—</span>
            <span>2025</span>
          </div>
        </motion.section>

        <section className="px-6 py-24 md:px-10 md:py-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-14">
            <motion.div {...reveal} className="order-2 md:order-1">
              <p className={chapterClass}>THE ORIGIN</p>
              <h2 className="mt-6 font-blackletter display-hero text-[48px] leading-none">
                Built by two.
              </h2>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="mt-10 text-[18px] leading-[1.8] text-[rgba(240,237,232,0.85)]"
              >
                ERA 99 began with a conversation. A father. 15 years in Egyptian factories. A son. One question: why not ours? This is the era.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(240,237,232,0.85)]"
              >
                Most brands guess at quality. We grew up inside it. Every
                supplier we use, every fabric weight we chose, every stitch
                specification — nothing was decided blindly. This is the
                advantage you cannot buy and cannot fake.
              </motion.p>
              <motion.p
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
                className="mt-7 text-[18px] leading-[1.8] text-[rgba(240,237,232,0.85)]"
              >
                We are not a startup. We are a family that decided to stop
                building other people's brands and start building our own.
              </motion.p>
            </motion.div>

            <motion.div
              {...reveal}
              className="order-1 aspect-square w-full overflow-hidden bg-[linear-gradient(145deg,#0b0b0b,#131313)] md:order-2"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(240,237,232,0.05), transparent 40%), radial-gradient(circle at 80% 70%, rgba(240,237,232,0.04), transparent 45%)",
              }}
            />
          </div>
        </section>

        <section
          className="relative overflow-hidden px-6 py-24 md:px-10 md:py-32"
          style={{
            backgroundImage:
              "radial-gradient(rgba(240,237,232,0.02) 1px, transparent 1px)",
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
              className="mt-6 font-blackletter display-hero text-[48px] leading-none md:text-[72px]"
            >
              Alexandria.
            </motion.h2>
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mt-8 text-[12px] uppercase tracking-[0.3em] text-[#F0EDE8]/65"
            >
              32°N, 29°E — MEDITERRANEAN COAST — EST. 331 BC
            </motion.p>

            <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
              <motion.div
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
                className="text-[17px] leading-[1.85] text-[rgba(240,237,232,0.85)]"
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
                  without making a sound about it — that is the identity of ERA 99.
                </p>
              </motion.div>

              <motion.div
                {...reveal}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
                className="text-[17px] leading-[1.85] text-[rgba(240,237,232,0.85)]"
              >
                
                <p className="mt-8">
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
              className="mt-14 border-t border-[#F0EDE8]/10 pt-10"
            >
              <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                <div>
                  <p className="text-[48px] font-medium leading-none">331 BC</p>
                  <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-[#F0EDE8]/65">
                    Founded
                  </p>
                </div>
                <div>
                  <p className="text-[48px] font-medium leading-none">
                    220 GSM
                  </p>
                  <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-[#F0EDE8]/65">
                    Fabric Weight
                  </p>
                </div>
                <div>
                  <p className="text-[48px] font-medium leading-none">99</p>
                  <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-[#F0EDE8]/65">
                    The Code
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
              className="mt-6 font-blackletter display-hero text-[48px] leading-none"
            >
              How we got here.
            </motion.h2>

            <div className="relative mt-14">
              <div className="absolute bottom-0 left-4 top-0 w-px bg-[rgba(240,237,232,0.2)] md:left-1/2 md:-translate-x-1/2" />

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
                        <p className="text-[11px] uppercase tracking-[0.5em] text-[#8B0000]">
                          {event.label}
                        </p>
                        <p className="mt-4 text-[16px] leading-[1.8] text-[rgba(240,237,232,0.85)]">
                          {event.body}
                        </p>
                      </div>

                      <div className="absolute left-4 top-2 h-3 w-3 -translate-x-1/2 border border-[#F0EDE8]/50 bg-[#080808] md:left-1/2 md:top-3" />
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
              className="mt-8 text-[24px] font-medium leading-[1.4] text-[#F0EDE8] md:text-[36px]"
            >
              We do not make clothes for everyone. We make clothes for people
              who understand that how you dress is a statement about what you
              refuse to compromise on.
            </motion.blockquote>
            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mx-auto mt-10 h-px w-20 bg-[#F0EDE8]/30"
            />
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              className="mt-6 text-[13px] italic text-[#F0EDE8]/65"
            >
              — ERA 99, Alexandria
            </motion.p>
          </div>
        </section>

        <section className="px-6 pb-28 pt-20 text-center md:px-10 md:pb-36 md:pt-24">
          <div className="mx-auto max-w-3xl">
            <motion.h2
              {...reveal}
              className="font-blackletter display-hero text-[64px] leading-none text-[#F0EDE8]"
            >
              ERA 99
            </motion.h2>
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="mt-4 text-[20px] text-[#F0EDE8]/65"
            >
              
            </motion.p>
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mt-5 text-[13px] uppercase tracking-[0.4em] text-[#F0EDE8]/65"
            >
              99 IS LIVE
            </motion.p>

            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
              className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/shop"
                className="border border-[#F0EDE8] bg-[#F0EDE8] px-8 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#080808]"
              >
                SHOP THE DROP →
              </Link>
              <Link
                href="/"
                className="border border-[#F0EDE8] px-8 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#F0EDE8]"
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
