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

// Pass fresh=true to bypass the in-memory cache and always read from disk.
// This is important for the internal API route called by the middleware, which
// runs in a separate process/worker and would otherwise see stale cached state
// after an admin toggle.
async function readLocalState(fresh = false): Promise<LocalEarlyAccessState> {
  if (!fresh && globalForEarlyAccess.earlyAccessState) {
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
    // Only update the in-memory cache when not doing a fresh read, so a fresh
    // read doesn't pollute the cache with a value that may be superseded before
    // the next write.
    if (!fresh) {
      globalForEarlyAccess.earlyAccessState = next;
    }
    return next;
  } catch {
    const fallback = getDefaultLocalState();
    if (!fresh) {
      globalForEarlyAccess.earlyAccessState = fallback;
    }
    return fallback;
  }
}

async function writeLocalState(patch: Partial<LocalEarlyAccessState>) {
  // Always read a fresh copy from disk to avoid overwriting newer updates
  // from other processes (for example the admin UI or the middleware
  // internal API), then merge the patch and persist.
  const current = await readLocalState(true);
  const next = {
    ...current,
    ...patch,
  } satisfies LocalEarlyAccessState;

  // Always update the in-memory cache so same-process reads are consistent.
  globalForEarlyAccess.earlyAccessState = next;

  try {
    await writeFile(LOCAL_STATE_FILE, JSON.stringify(next, null, 2), "utf8");
  } catch {
    // The local fallback is best-effort; DB or env defaults remain available.
  }

  return next;
}

async function readLocalBooleanSetting(key: string, fresh = false) {
  const state = await readLocalState(fresh);
  if (key === EARLY_ACCESS_KEY) return state.earlyAccessActive;
  if (key === DROP_MODE_KEY) return state.dropModeActive;
  if (key === EARLY_ACCESS_COUNTDOWN_ENABLED_KEY) return state.countdownEnabled;
  return false;
}

async function readLocalStringSetting(key: string, fresh = false) {
  const state = await readLocalState(fresh);
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

async function getBooleanSetting(key: string, envName: string, fresh = false) {
  const fallback = envBoolean(envName, false);
  if (!isDatabaseConfigured()) return readLocalBooleanSetting(key, fresh);

  let row: { value: string } | null = null;
  try {
    row = await prisma.setting.findUnique({
      where: { key },
      select: { value: true },
    });
  } catch (error) {
    markDatabaseUnavailable(error);
    console.warn(`Unable to read setting ${key}; using local fallback.`);
    // Always read fresh from disk on DB error so middleware sees current state.
    return readLocalBooleanSetting(key, true);
  }

  if (!row?.value) return readLocalBooleanSetting(key, fresh);
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

async function getStringSetting(key: string, envName: string, fresh = false) {
  const fallback = parseDateSetting(process.env[envName]);
  if (!isDatabaseConfigured())
    return readLocalStringSetting(key, fresh) || fallback;

  let row: { value: string } | null = null;
  try {
    row = await prisma.setting.findUnique({
      where: { key },
      select: { value: true },
    });
  } catch (error) {
    markDatabaseUnavailable(error);
    console.warn(`Unable to read setting ${key}; using local fallback.`);
    // Always read fresh from disk on DB error.
    return readLocalStringSetting(key, true);
  }

  return (
    parseDateSetting(row?.value) ||
    readLocalStringSetting(key, fresh) ||
    fallback
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
  const [earlyAccessActive, dropModeActive, countdownEnabled, dropAt] =
    await Promise.all([
      getBooleanSetting(EARLY_ACCESS_KEY, "EARLY_ACCESS_ACTIVE", true),
      getBooleanSetting(DROP_MODE_KEY, "DROP_MODE_ACTIVE", true),
      getBooleanSetting(
        EARLY_ACCESS_COUNTDOWN_ENABLED_KEY,
        "EARLY_ACCESS_COUNTDOWN_ENABLED",
        true,
      ),
      getEarlyAccessDropAt(),
    ]);

  // Debug logging to trace expiry behaviour in dev only.
  try {
    console.log("releaseEarlyAccessIfExpired:", {
      earlyAccessActive,
      dropModeActive,
      countdownEnabled,
      earlyAccessDropAt: dropAt,
      now: new Date().toISOString(),
    });
  } catch {}

  if (!countdownEnabled || !dropAt) {
    return false;
  }

  const dropAtTime = new Date(dropAt).getTime();
  if (Number.isNaN(dropAtTime) || Date.now() < dropAtTime) {
    return false;
  }

  const shouldDisableEarlyAccess = earlyAccessActive;
  const shouldEnableDropMode = !dropModeActive;
  const shouldDisableCountdown = countdownEnabled;

  if (
    !shouldDisableEarlyAccess &&
    !shouldEnableDropMode &&
    !shouldDisableCountdown
  ) {
    return false;
  }

  try {
    const updates: Promise<boolean>[] = [];
    if (shouldDisableEarlyAccess) {
      updates.push(setBooleanSetting(EARLY_ACCESS_KEY, false));
    }
    if (shouldEnableDropMode) {
      updates.push(setBooleanSetting(DROP_MODE_KEY, true));
    }
    if (shouldDisableCountdown) {
      updates.push(
        setBooleanSetting(EARLY_ACCESS_COUNTDOWN_ENABLED_KEY, false),
      );
    }
    await Promise.all(updates);
    try {
      console.log(
        "releaseEarlyAccessIfExpired: released -> earlyAccess disabled, dropMode enabled",
      );
    } catch {}
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
  return getBooleanSetting(EARLY_ACCESS_KEY, "EARLY_ACCESS_ACTIVE", true);
}

export async function setEarlyAccessActive(value: boolean) {
  return setBooleanSetting(EARLY_ACCESS_KEY, value);
}

export async function isDropModeActive() {
  if (await releaseEarlyAccessIfExpired()) return true;
  return getBooleanSetting(DROP_MODE_KEY, "DROP_MODE_ACTIVE", true);
}

export async function setDropModeActive(value: boolean) {
  return setBooleanSetting(DROP_MODE_KEY, value);
}

export async function isEarlyAccessCountdownEnabled() {
  return getBooleanSetting(
    EARLY_ACCESS_COUNTDOWN_ENABLED_KEY,
    "EARLY_ACCESS_COUNTDOWN_ENABLED",
    true,
  );
}

export async function setEarlyAccessCountdownEnabled(value: boolean) {
  return setBooleanSetting(EARLY_ACCESS_COUNTDOWN_ENABLED_KEY, value);
}

export async function getEarlyAccessDropAt() {
  return getStringSetting(
    EARLY_ACCESS_DROP_AT_KEY,
    "EARLY_ACCESS_DROP_AT",
    true,
  );
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
      : getBooleanSetting(EARLY_ACCESS_KEY, "EARLY_ACCESS_ACTIVE", true),
    released
      ? Promise.resolve(true)
      : getBooleanSetting(DROP_MODE_KEY, "DROP_MODE_ACTIVE", true),
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
