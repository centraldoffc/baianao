-- =====================================================================
-- 08_transfer.sql
-- =====================================================================

CREATE TABLE "Transfer" (
  "id"           TEXT           NOT NULL,
  "playerId"     TEXT           NOT NULL,
  "fromTeamId"   TEXT,
  "toTeamId"     TEXT,
  "transferDate" TIMESTAMP(3)   NOT NULL,
  "type"         "TransferType" NOT NULL,
  "feeValue"     DOUBLE PRECISION,
  "feeCurrency"  TEXT,
  "seasonId"     TEXT,

  CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Transfer_playerId_fkey"
    FOREIGN KEY ("playerId") REFERENCES "Player"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Transfer_fromTeamId_fkey"
    FOREIGN KEY ("fromTeamId") REFERENCES "Team"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Transfer_toTeamId_fkey"
    FOREIGN KEY ("toTeamId") REFERENCES "Team"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Transfer_seasonId_fkey"
    FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);
