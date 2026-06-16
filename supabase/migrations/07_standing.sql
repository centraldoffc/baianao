-- =====================================================================
-- 07_standing.sql
-- =====================================================================

CREATE TABLE "Standing" (
  "id"           TEXT    NOT NULL,
  "seasonId"     TEXT    NOT NULL,
  "teamId"       TEXT    NOT NULL,
  "played"       INTEGER NOT NULL DEFAULT 0,
  "wins"         INTEGER NOT NULL DEFAULT 0,
  "draws"        INTEGER NOT NULL DEFAULT 0,
  "losses"       INTEGER NOT NULL DEFAULT 0,
  "goalsFor"     INTEGER NOT NULL DEFAULT 0,
  "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
  "points"       INTEGER NOT NULL DEFAULT 0,
  "position"     INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "Standing_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Standing_seasonId_fkey"
    FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Standing_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Standing_seasonId_teamId_key"
  ON "Standing"("seasonId", "teamId");
