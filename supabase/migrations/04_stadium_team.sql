-- =====================================================================
-- 04_stadium_team.sql
-- =====================================================================

CREATE TABLE "Stadium" (
  "id"       TEXT    NOT NULL,
  "name"     TEXT    NOT NULL,
  "city"     TEXT    NOT NULL,
  "capacity" INTEGER,

  CONSTRAINT "Stadium_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------

CREATE TABLE "Team" (
  "id"           TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "shortName"    TEXT NOT NULL,
  "slug"         TEXT NOT NULL,
  "logoUrl"      TEXT,
  "city"         TEXT NOT NULL,
  "foundedYear"  INTEGER,
  "description"  TEXT,
  "primaryColor" TEXT,
  "stadiumId"    TEXT,

  CONSTRAINT "Team_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Team_stadiumId_fkey"
    FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");
