"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useConsent } from "@/contexts/consent-context";

export function CookieConsentBanner() {
  const {
    decided,
    acceptAll,
    preferencesOpen,
    openPreferences,
    closePreferences,
    savePreferences,
    analytics,
    marketing,
  } = useConsent();

  const [analyticsPref, setAnalyticsPref] = useState(analytics);
  const [marketingPref, setMarketingPref] = useState(marketing);

  useEffect(() => {
    setAnalyticsPref(analytics);
    setMarketingPref(marketing);
  }, [analytics, marketing, preferencesOpen]);

  const showBanner = !decided;

  return (
    <>
      <AnimatePresence>
        {showBanner ? (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-0 left-0 z-[120] w-full border-t border-[rgba(26, 23, 20, 0.12)] bg-[#EBE4D8]/88 px-4 py-3 backdrop-blur-sm md:px-8"
          >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-[#1A1714]/72 md:text-sm">
                QUTB uses cookies to personalise your experience and measure our
                marketing.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={acceptAll}
                  className="h-9 border border-[#1A1714] bg-[#1A1714] px-4 text-[11px] uppercase tracking-[0.16em] text-[#EBE4D8]"
                >
                  Accept all
                </button>
                <button
                  onClick={openPreferences}
                  className="h-9 border border-[#1A1714]/35 px-4 text-[11px] uppercase tracking-[0.16em] text-[#1A1714]"
                >
                  Manage preferences
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {preferencesOpen ? (
          <>
            <motion.button
              aria-label="Close preferences backdrop"
              onClick={() => {}}
              className="fixed inset-0 z-[125] bg-[#1A1714]/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 z-[130] w-[94vw] max-w-xl -translate-x-1/2 -translate-y-1/2 border border-[#1A1714]/25 bg-[#EBE4D8] p-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h2 className="text-sm uppercase tracking-[0.2em] text-[#1A1714]/80">
                Cookie preferences
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border border-[#1A1714]/10 p-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em]">
                      Essential
                    </p>
                    <p className="text-[12px] text-[#1A1714]/65">
                      Required for cart, checkout, and login to work.
                    </p>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#1A1714]/60">
                    Always on
                  </p>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border border-[#1A1714]/10 p-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em]">
                      Analytics
                    </p>
                    <p className="text-[12px] text-[#1A1714]/65">
                      Helps us understand how people use the site.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnalyticsPref((v) => !v)}
                    className={`h-7 w-12 border ${analyticsPref ? "border-[#1A1714] bg-[#1A1714] text-[#EBE4D8]" : "border-[#1A1714]/30 text-[#1A1714]"} text-[10px] uppercase`}
                  >
                    {analyticsPref ? "Yes" : "No"}
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border border-[#1A1714]/10 p-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em]">
                      Marketing
                    </p>
                    <p className="text-[12px] text-[#1A1714]/65">
                      Powers our Facebook and Instagram ads.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMarketingPref((v) => !v)}
                    className={`h-7 w-12 border ${marketingPref ? "border-[#1A1714] bg-[#1A1714] text-[#EBE4D8]" : "border-[#1A1714]/30 text-[#1A1714]"} text-[10px] uppercase`}
                  >
                    {marketingPref ? "Yes" : "No"}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() =>
                    savePreferences({
                      analytics: analyticsPref,
                      marketing: marketingPref,
                    })
                  }
                  className="h-11 flex-1 border border-[#1A1714] bg-[#1A1714] px-4 text-xs uppercase tracking-[0.18em] text-[#EBE4D8]"
                >
                  Save preferences
                </button>
                <button
                  onClick={closePreferences}
                  className="h-11 border border-[#1A1714]/35 px-4 text-xs uppercase tracking-[0.16em]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
