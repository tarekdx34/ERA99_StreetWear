CREATE TABLE IF NOT EXISTS "early_access_subscribers" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "signed_up_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "source" TEXT NOT NULL DEFAULT 'early-access',
  "converted" BOOLEAN NOT NULL DEFAULT false
);
