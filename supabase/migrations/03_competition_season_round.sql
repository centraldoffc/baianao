-- =====================================================================
-- 03_competition_season_round.sql
-- =====================================================================

CREATE TABLE "Competition" (
  "id"       TEXT       NOT NULL,
  "name"     TEXT       NOT NULL,
  "division" "Division" NOT NULL,

  CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------

CREATE TABLE "Season" (
  "id"            TEXT    NOT NULL,
  "competitionId" TEXT    NOT NULL,
  "year"          INTEGER NOT NULL,
  "name"          TEXT    NOT NULL,

  CONSTRAINT "Season_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Season_competitionId_fkey"
    FOREIGN KEY ("competitionId") REFERENCES "Competition"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Season_competitionId_year_key"
  ON "Season"("competitionId", "year");

-- -----------------------------------------------------------------------

CREATE TABLE "Round" (
  "id"       TEXT    NOT NULL,
  "seasonId" TEXT    NOT NULL,
  "number"   INTEGER NOT NULL,
  "name"     TEXT    NOT NULL,

  CONSTRAINT "Round_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Round_seasonId_fkey"
    FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Round_seasonId_number_key"
  ON "Round"("seasonId", "number");
