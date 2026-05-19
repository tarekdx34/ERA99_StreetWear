import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import {
  prisma,
  isDatabaseConfigured,
  markDatabaseUnavailable,
} from "@/lib/prisma";

const EARLY_ACCESS_KEY = "early_access_active";
const DROP_MODE_KEY = "drop_mode_active";
const EARLY_ACCESS_COUNTDOWN_ENABLED_KEY = "early_access_countdown_enabled";
const EARLY_ACCESS_DROP_AT_KEY = "early_access_drop_at";
const LOCAL_STATE_FILE = path.join(
  process.cwd(),
  ".next",
  "early-access-state.json",
);

type LocalEarlyAccessState = {
  earlyAccessActive: boolean;
  dropModeActive: boolean;
  countdownEnabled: boolean;
  earlyAccessDropAt: string | null;
};

const globalForEarlyAccess = globalThis as unknown as {
  earlyAccessState: LocalEarlyAccessState | undefined;
};

export type EarlyAccessSubscriber = {
  id: number;
  email: string;
  signed_up_at: Date;
  source: string;
  converted: boolean;
};

function envBoolean(name: string, fallback = false) {
  const value = process.env[name]?.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(value || "")) return true;
  if (["0", "false", "no", "off"].includes(value || "")) return false;
  return fallback;
}

function parseDateSetting(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function getDefaultLocalState(): LocalEarlyAccessState {
  return {
    earlyAccessActive: envBoolean("EARLY_ACCESS_ACTIVE", false),
    dropModeActive: envBoolean("DROP_MODE_ACTIVE", false),
    countdownEnabled: envBoolean("EARLY_ACCESS_COUNTDOWN_ENABLED", false),
    earlyAccessDropAt: parseDateSetting(process.env.EARLY_ACCESS_DROP_AT),
  };
}

async function readLocalState(): Promise<LocalEarlyAccessState> {
  if (globalForEarlyAccess.earlyAccessState) {
    return globalForEarlyAccess.earlyAccessState;
  }

  try {
    const raw = await readFile(LOCAL_STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalEarlyAccessState>;
    const fallback = getDefaultLocalState();
    const next = {
      earlyAccessActive:
        typeof parsed.earlyAccessActive === "boolean"
          ? parsed.earlyAccessActive
          : fallback.earlyAccessActive,
      dropModeActive:
        typeof parsed.dropModeActive === "boolean"
          ? parsed.dropModeActive
          : fallback.dropModeActive,
      countdownEnabled:
        typeof parsed.countdownEnabled === "boolean"
          ? parsed.countdownEnabled
          : fallback.countdownEnabled,
      earlyAccessDropAt:
        typeof parsed.earlyAccessDropAt === "string" ||
        parsed.earlyAccessDropAt === null
          ? parsed.earlyAccessDropAt
          : fallback.earlyAccessDropAt,
    };
    globalForEarlyAccess.earlyAccessState = next;
    return next;
  } catch {
    const fallback = getDefaultLocalState();
    globalForEarlyAccess.earlyAccessState = fallback;
    return fallback;
  }
}

async function writeLocalState(patch: Partial<LocalEarlyAccessState>) {
  const current = await readLocalState();
  const next = {
    ...current,
    ...patch,
  } satisfies LocalEarlyAccessState;

  globalForEarlyAccess.earlyAccessState = next;

  try {
    await writeFile(LOCAL_STATE_FILE, JSON.stringify(next, null, 2), "utf8");
  } catch {
    // The local fallback is best-effort; DB or env defaults remain available.
  }

  return next;
}

async function readLocalBooleanSetting(key: string) {
  const state = await readLocalState();
  if (key === EARLY_ACCESS_KEY) return state.earlyAccessActive;
  if (key === DROP_MODE_KEY) return state.dropModeActive;
  if (key === EARLY_ACCESS_COUNTDOWN_ENABLED_KEY) return state.countdownEnabled;
  return false;
}

async function readLocalStringSetting(key: string) {
  const state = await readLocalState();
  if (key === EARLY_ACCESS_DROP_AT_KEY) return state.earlyAccessDropAt;
  return null;
}

async function ensureEarlyAccessTable() {
  if (!isDatabaseConfigured()) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS early_access_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      signed_up_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      source TEXT NOT NULL DEFAULT 'early-access',
      converted BOOLEAN NOT NULL DEFAULT false
    )
  `);
}

async function getBooleanSetting(key: string, envName: string) {
  const fallback = envBoolean(envName, false);
  if (!isDatabaseConfigured()) return readLocalBooleanSetting(key);

  let row: { value: string } | null = null;
  try {
    row = await prisma.setting.findUnique({
      where: { key },
      select: { value: true },
    });
  } catch (error) {
    markDatabaseUnavailable(error);
    console.warn(`Unable to read setting ${key}; using local fallback.`);
    return readLocalBooleanSetting(key);
  }

  if (!row?.value) return readLocalBooleanSetting(key);
  return row.value === "true";
}

async function setBooleanSetting(key: string, value: boolean) {
  if (isDatabaseConfigured()) {
    try {
      await prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      });
    } catch (error) {
      markDatabaseUnavailable(error);
      console.warn(`Unable to save setting ${key}; using local fallback.`);
    }
  }

  await writeLocalState(
    key === EARLY_ACCESS_KEY
      ? { earlyAccessActive: value }
      : key === DROP_MODE_KEY
        ? { dropModeActive: value }
        : { countdownEnabled: value },
  );
  return value;
}

async function getStringSetting(key: string, envName: string) {
  const fallback = parseDateSetting(process.env[envName]);
  if (!isDatabaseConfigured()) return readLocalStringSetting(key) || fallback;

  let row: { value: string } | null = null;
  try {
    row = await prisma.setting.findUnique({
      where: { key },
      select: { value: true },
    });
  } catch (error) {
    markDatabaseUnavailable(error);
    console.warn(`Unable to read setting ${key}; using local fallback.`);
    return readLocalStringSetting(key);
  }

  return (
    parseDateSetting(row?.value) || readLocalStringSetting(key) || fallback
  );
}

async function setStringSetting(key: string, value: string | null) {
  const parsed = parseDateSetting(value);
  if (isDatabaseConfigured()) {
    try {
      if (!value) {
        await prisma.setting.deleteMany({ where: { key } });
      } else if (parsed) {
        await prisma.setting.upsert({
          where: { key },
          create: { key, value: parsed },
          update: { value: parsed },
        });
      }
    } catch (error) {
      markDatabaseUnavailable(error);
      console.warn(`Unable to save setting ${key}; using local fallback.`);
    }
  }

  if (!value) {
    await writeLocalState({ earlyAccessDropAt: null, countdownEnabled: false });
    return null;
  }
  if (!parsed) return null;

  await writeLocalState({ earlyAccessDropAt: parsed, countdownEnabled: true });
  return parsed;
}

async function releaseEarlyAccessIfExpired() {
  const [earlyAccessActive, countdownEnabled, dropAt] = await Promise.all([
    getBooleanSetting(EARLY_ACCESS_KEY, "EARLY_ACCESS_ACTIVE"),
    getBooleanSetting(
      EARLY_ACCESS_COUNTDOWN_ENABLED_KEY,
      "EARLY_ACCESS_COUNTDOWN_ENABLED",
    ),
    getEarlyAccessDropAt(),
  ]);

  if (
    !earlyAccessActive ||
    !countdownEnabled ||
    !dropAt ||
    Date.now() < new Date(dropAt).getTime()
  ) {
    return false;
  }

  try {
    await Promise.all([
      setBooleanSetting(EARLY_ACCESS_KEY, false),
      setBooleanSetting(DROP_MODE_KEY, true),
      setBooleanSetting(EARLY_ACCESS_COUNTDOWN_ENABLED_KEY, false),
    ]);
  } catch (error) {
    console.error("Unable to release expired early access", error);
    return false;
  }
  return true;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function isEarlyAccessActive() {
  if (await releaseEarlyAccessIfExpired()) return false;
  return getBooleanSetting(EARLY_ACCESS_KEY, "EARLY_ACCESS_ACTIVE");
}

export async function setEarlyAccessActive(value: boolean) {
  return setBooleanSetting(EARLY_ACCESS_KEY, value);
}

export async function isDropModeActive() {
  if (await releaseEarlyAccessIfExpired()) return true;
  return getBooleanSetting(DROP_MODE_KEY, "DROP_MODE_ACTIVE");
}

export async function setDropModeActive(value: boolean) {
  return setBooleanSetting(DROP_MODE_KEY, value);
}

export async function isEarlyAccessCountdownEnabled() {
  return getBooleanSetting(
    EARLY_ACCESS_COUNTDOWN_ENABLED_KEY,
    "EARLY_ACCESS_COUNTDOWN_ENABLED",
  );
}

export async function setEarlyAccessCountdownEnabled(value: boolean) {
  return setBooleanSetting(EARLY_ACCESS_COUNTDOWN_ENABLED_KEY, value);
}

export async function getEarlyAccessDropAt() {
  return getStringSetting(EARLY_ACCESS_DROP_AT_KEY, "EARLY_ACCESS_DROP_AT");
}

export async function setEarlyAccessDropAt(value: string | null) {
  return setStringSetting(EARLY_ACCESS_DROP_AT_KEY, value);
}

export async function getEarlyAccessState() {
  const released = await releaseEarlyAccessIfExpired();
  const [
    earlyAccessActive,
    dropModeActive,
    countdownEnabled,
    earlyAccessDropAt,
  ] = await Promise.all([
    released
      ? Promise.resolve(false)
      : getBooleanSetting(EARLY_ACCESS_KEY, "EARLY_ACCESS_ACTIVE"),
    released
      ? Promise.resolve(true)
      : getBooleanSetting(DROP_MODE_KEY, "DROP_MODE_ACTIVE"),
    released ? Promise.resolve(false) : isEarlyAccessCountdownEnabled(),
    getEarlyAccessDropAt(),
  ]);

  return {
    earlyAccessActive,
    dropModeActive,
    countdownEnabled,
    earlyAccessDropAt,
  };
}

export async function addEarlyAccessSubscriber(input: {
  email: string;
  source: string;
  timestamp?: string;
}) {
  if (!isDatabaseConfigured()) return;
  await ensureEarlyAccessTable();
  await prisma.$executeRaw`
    INSERT INTO early_access_subscribers (email, signed_up_at, source, converted)
    VALUES (${input.email}, ${input.timestamp ? new Date(input.timestamp) : new Date()}, ${input.source}, false)
    ON CONFLICT (email) DO NOTHING
  `;
}

export async function getEarlyAccessSubscribers() {
  if (!isDatabaseConfigured()) return [] as EarlyAccessSubscriber[];
  await ensureEarlyAccessTable();
  return prisma.$queryRaw<EarlyAccessSubscriber[]>`
    SELECT id, email, signed_up_at, source, converted
    FROM early_access_subscribers
    ORDER BY signed_up_at DESC
  `;
}
