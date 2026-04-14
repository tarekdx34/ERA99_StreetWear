"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ConsentState = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: "1";
};

type ConsentContextValue = ConsentState & {
  decided: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  preferencesOpen: boolean;
  acceptAll: () => void;
  savePreferences: (next: {
    analytics: boolean;
    marketing: boolean;
  }) => void;
};

const CONSENT_COOKIE_NAME = "qutb_consent";

const defaultConsent: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  timestamp: new Date(0).toISOString(),
  version: "1",
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

function readConsentCookie(): ConsentState | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!cookie) return null;

  const encoded = cookie.split("=").slice(1).join("=");
  if (!encoded) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(encoded)) as ConsentState;
    if (parsed.version !== "1") return null;
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      timestamp: parsed.timestamp || new Date().toISOString(),
      version: "1",
    };
  } catch {
    return null;
  }
}

function writeConsentCookie(consent: ConsentState) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setDate(expires.getDate() + 365);

  const isProduction = process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "; Secure" : "";

  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);
  const [decided, setDecided] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const cookieConsent = readConsentCookie();
    if (!cookieConsent) {
      setDecided(false);
      return;
    }

    setConsent(cookieConsent);
    setDecided(true);
  }, []);

  const acceptAll = () => {
    const next: ConsentState = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: "1",
    };
    writeConsentCookie(next);
    setConsent(next);
    setDecided(true);
    setPreferencesOpen(false);
  };

  const savePreferences = (next: { analytics: boolean; marketing: boolean }) => {
    const full: ConsentState = {
      essential: true,
      analytics: next.analytics,
      marketing: next.marketing,
      timestamp: new Date().toISOString(),
      version: "1",
    };
    writeConsentCookie(full);
    setConsent(full);
    setDecided(true);
    setPreferencesOpen(false);
  };

  const value = useMemo<ConsentContextValue>(
    () => ({
      ...consent,
      decided,
      preferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      acceptAll,
      savePreferences,
    }),
    [consent, decided, preferencesOpen],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return context;
}
