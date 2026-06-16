-- =====================================================================
-- 06_match_lineup_broadcast.sql
-- =====================================================================

CREATE TABLE "Match" (
  "id"            TEXT          NOT NULL,
  "seasonId"      TEXT          NOT NULL,
  "roundId"       TEXT          NOT NULL,
  "homeTeamId"    TEXT          NOT NULL,
  "awayTeamId"    TEXT          NOT NULL,
  "stadiumId"     TEXT,
  "matchDateTime" TIMESTAMP(3)  NOT NULL,
  "status"        "MatchStatus" NOT NULL DEFAULT 'AGENDADO',
  "homeScore"     INTEGER,
  "awayScore"     INTEGER,

  CONSTRAINT "Match_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Match_seasonId_fkey"
    FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Match_roundId_fkey"
    FOREIGN KEY ("roundId") REFERENCES "Round"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Match_homeTeamId_fkey"
    FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Match_awayTeamId_fkey"
    FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Match_stadiumId_fkey"
    FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

-- -----------------------------------------------------------------------

CREATE TABLE "Lineup" (
  "id"          TEXT    NOT NULL,
  "matchId"     TEXT    NOT NULL,
  "teamId"      TEXT    NOT NULL,
  "playerId"    TEXT    NOT NULL,
  "isStarter"   BOOLEAN NOT NULL DEFAULT true,
  "position"    TEXT    NOT NULL,
  "shirtNumber" INTEGER,

  CONSTRAINT "Lineup_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Lineup_matchId_fkey"
    FOREIGN KEY ("matchId") REFERENCES "Match"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Lineup_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Lineup_playerId_fkey"
    FOREIGN KEY ("playerId") REFERENCES "Player"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Lineup_matchId_teamId_playerId_key"
  ON "Lineup"("matchId", "teamId", "playerId");

-- -----------------------------------------------------------------------

CREATE TABLE "Broadcast" (
  "id"          TEXT            NOT NULL,
  "matchId"     TEXT            NOT NULL,
  "channelName" TEXT            NOT NULL,
  "type"        "BroadcastType" NOT NULL,
  "url"         TEXT,

  CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Broadcast_matchId_fkey"
    FOREIGN KEY ("matchId") REFERENCES "Match"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);
