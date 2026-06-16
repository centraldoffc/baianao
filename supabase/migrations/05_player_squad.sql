-- =====================================================================
-- 05_player_squad.sql
-- =====================================================================

CREATE TABLE "Player" (
  "id"            TEXT NOT NULL,
  "name"          TEXT NOT NULL,
  "birthDate"     TIMESTAMP(3),
  "nationality"   TEXT,
  "photoUrl"      TEXT,
  "heightCm"      INTEGER,
  "weightKg"      INTEGER,
  "preferredFoot" TEXT,

  CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------

CREATE TABLE "SquadMembership" (
  "id"           TEXT          NOT NULL,
  "playerId"     TEXT          NOT NULL,
  "teamId"       TEXT          NOT NULL,
  "seasonId"     TEXT          NOT NULL,
  "jerseyNumber" INTEGER,
  "position"     TEXT          NOT NULL,
  "status"       "SquadStatus" NOT NULL DEFAULT 'ATIVO',

  CONSTRAINT "SquadMembership_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SquadMembership_playerId_fkey"
    FOREIGN KEY ("playerId") REFERENCES "Player"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "SquadMembership_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "SquadMembership_seasonId_fkey"
    FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SquadMembership_teamId_seasonId_jerseyNumber_key"
  ON "SquadMembership"("teamId", "seasonId", "jerseyNumber");
