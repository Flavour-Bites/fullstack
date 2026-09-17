-- Telegram-first identity, category relations, order pricing, payments,
-- recovery requests, status audit events, and soft deletes.
-- This migration is written to preserve legacy data before the application
-- stops mapping removed email/order-estimate fields.

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('customer', 'staff', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'partial', 'paid');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RecoveryStatus" AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "telegramPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

UPDATE "User"
SET "telegramId" = CONCAT('legacy:', "id")
WHERE "telegramId" IS NULL OR TRIM("telegramId") = '';

UPDATE "User"
SET "passwordHash" = "password"
WHERE "passwordHash" IS NULL
  AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'password'
  )
  AND "password" IS NOT NULL;

ALTER TABLE "User" ALTER COLUMN "telegramId" SET NOT NULL;

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "Role"
  USING (
    CASE
      WHEN "role" IN ('customer', 'staff', 'admin') THEN "role"
      ELSE 'customer'
    END
  )::"Role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'customer';

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "icon" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "Category_isActive_sortOrder_idx" ON "Category"("isActive", "sortOrder");

INSERT INTO "Category" ("id", "name", "slug", "description", "color", "icon", "sortOrder")
SELECT
  CONCAT('cat_', REGEXP_REPLACE(LOWER("category"), '[^a-z0-9]+', '-', 'g')),
  INITCAP(REPLACE("category", '-', ' ')),
  REGEXP_REPLACE(LOWER("category"), '[^a-z0-9]+', '-', 'g'),
  NULL,
  '#c5a880',
  'cake',
  ROW_NUMBER() OVER (ORDER BY MIN("id")) - 1
FROM "CakeGalleryItem"
WHERE "category" IS NOT NULL AND TRIM("category") <> ''
GROUP BY "category"
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Category" ("id", "name", "slug", "description", "color", "icon", "sortOrder")
VALUES ('cat-celebration', 'Celebration', 'celebration', NULL, '#c5a880', 'cake', 0)
ON CONFLICT ("slug") DO NOTHING;

ALTER TABLE "CakeGalleryItem"
  ADD COLUMN IF NOT EXISTS "categoryId" TEXT,
  ADD COLUMN IF NOT EXISTS "imagePublicId" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "CakeGalleryItem" item
SET "categoryId" = cat."id"
FROM "Category" cat
WHERE item."categoryId" IS NULL
  AND cat."slug" = REGEXP_REPLACE(LOWER(item."category"), '[^a-z0-9]+', '-', 'g');

UPDATE "CakeGalleryItem"
SET "categoryId" = 'cat-celebration'
WHERE "categoryId" IS NULL;

ALTER TABLE "CakeGalleryItem" ALTER COLUMN "categoryId" SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE "CakeGalleryItem"
    ADD CONSTRAINT "CakeGalleryItem_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "CustomCakeRequest"
  ADD COLUMN IF NOT EXISTS "referenceImagePublicId" TEXT,
  ADD COLUMN IF NOT EXISTS "referenceImageFormat" TEXT,
  ADD COLUMN IF NOT EXISTS "referenceImageBytes" INTEGER,
  ADD COLUMN IF NOT EXISTS "legacyContact" JSONB,
  ADD COLUMN IF NOT EXISTS "quotedPrice" INTEGER,
  ADD COLUMN IF NOT EXISTS "finalPrice" INTEGER,
  ADD COLUMN IF NOT EXISTS "priceConfirmedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "depositAmount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "depositPaidAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "remainingBalance" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

UPDATE "CustomCakeRequest"
SET "legacyContact" = COALESCE("legacyContact", '{}'::jsonb) || jsonb_build_object('email', "contactEmail")
WHERE "contactEmail" IS NOT NULL;

UPDATE "CustomCakeRequest"
SET
  "quotedPrice" = COALESCE("quotedPrice", "estimatedCost"),
  "finalPrice" = COALESCE("finalPrice", CASE WHEN "status" IN ('Confirmed', 'InProgress', 'Ready', 'Completed') THEN "estimatedCost" ELSE NULL END)
WHERE "estimatedCost" IS NOT NULL;

UPDATE "CustomCakeRequest"
SET
  "depositAmount" = GREATEST(COALESCE("depositAmount", 0), 0),
  "remainingBalance" = GREATEST(COALESCE("finalPrice", 0) - GREATEST(COALESCE("depositAmount", 0), 0), 0),
  "paymentStatus" = CASE
    WHEN COALESCE("finalPrice", 0) <= 0 OR COALESCE("depositAmount", 0) <= 0 THEN 'unpaid'::"PaymentStatus"
    WHEN COALESCE("depositAmount", 0) >= COALESCE("finalPrice", 0) THEN 'paid'::"PaymentStatus"
    ELSE 'partial'::"PaymentStatus"
  END;

CREATE INDEX IF NOT EXISTS "CustomCakeRequest_userId_deletedAt_idx" ON "CustomCakeRequest"("userId", "deletedAt");
CREATE INDEX IF NOT EXISTS "CustomCakeRequest_status_deletedAt_idx" ON "CustomCakeRequest"("status", "deletedAt");

CREATE TABLE IF NOT EXISTS "RecoveryRequest" (
  "id" TEXT NOT NULL,
  "oldTelegramId" TEXT NOT NULL,
  "newTelegramId" TEXT NOT NULL,
  "status" "RecoveryStatus" NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RecoveryRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RecoveryRequest_oldTelegramId_newTelegramId_status_idx"
  ON "RecoveryRequest"("oldTelegramId", "newTelegramId", "status");

CREATE TABLE IF NOT EXISTS "OrderStatusEvent" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "fromStatus" "OrderStatus",
  "toStatus" "OrderStatus" NOT NULL,
  "changedById" TEXT,
  "source" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderStatusEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OrderStatusEvent_orderId_createdAt_idx" ON "OrderStatusEvent"("orderId", "createdAt");
CREATE INDEX IF NOT EXISTS "OrderStatusEvent_changedById_idx" ON "OrderStatusEvent"("changedById");

DO $$ BEGIN
  ALTER TABLE "OrderStatusEvent"
    ADD CONSTRAINT "OrderStatusEvent_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "CustomCakeRequest"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "OrderStatusEvent"
    ADD CONSTRAINT "OrderStatusEvent_changedById_fkey"
    FOREIGN KEY ("changedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
