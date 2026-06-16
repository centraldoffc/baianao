-- =====================================================================
-- Baianão — schema completo para o Supabase (SQL Editor)
-- Equivalente ao `npx prisma db push` a partir de prisma/schema.prisma
-- Execute este arquivo inteiro de uma vez no SQL Editor do Supabase.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "CollaboratorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "Division" AS ENUM ('SERIE_A', 'SERIE_B');
CREATE TYPE "SquadStatus" AS ENUM ('ATIVO', 'LESIONADO', 'SUSPENSO', 'EMPRESTADO');
CREATE TYPE "MatchStatus" AS ENUM ('AGENDADO', 'EM_ANDAMENTO', 'FINALIZADO', 'ADIADO', 'CANCELADO');
CREATE TYPE "BroadcastType" AS ENUM ('TV_ABERTA', 'TV_FECHADA', 'STREAMING', 'RADIO');
CREATE TYPE "TransferType" AS ENUM ('CONTRATACAO', 'EMPRESTIMO', 'RETORNO_EMPRESTIMO', 'LIVRE', 'ENCERRAMENTO_CONTRATO');

-- ---------------------------------------------------------------------
-- User
-- ---------------------------------------------------------------------
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- ---------------------------------------------------------------------
-- Competition / Season / Round
-- ---------------------------------------------------------------------
CREATE TABLE "Competition" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "division" "Division" NOT NULL,
  CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Season" (
  "id" TEXT NOT NULL,
  "competitionId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Season_competitionId_year_key" ON "Season"("competitionId", "year");
ALTER TABLE "Season"
  ADD CONSTRAINT "Season_competitionId_fkey"
  FOREIGN KEY ("competitionId") REFERENCES "Competition"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Round" (
  "id" TEXT NOT NULL,
  "seasonId" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Round_seasonId_number_key" ON "Round"("seasonId", "number");
ALTER TABLE "Round"
  ADD CONSTRAINT "Round_seasonId_fkey"
  FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- Stadium / Team / Player
-- ---------------------------------------------------------------------
CREATE TABLE "Stadium" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "capacity" INTEGER,
  CONSTRAINT "Stadium_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Team" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "shortName" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logoUrl" TEXT,
  "city" TEXT NOT NULL,
  "foundedYear" INTEGER,
  "description" TEXT,
  "primaryColor" TEXT,
  "stadiumId" TEXT,
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");
ALTER TABLE "Team"
  ADD CONSTRAINT "Team_stadiumId_fkey"
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Player" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "birthDate" TIMESTAMP(3),
  "nationality" TEXT,
  "photoUrl" TEXT,
  "heightCm" INTEGER,
  "weightKg" INTEGER,
  "preferredFoot" TEXT,
  CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------
-- SquadMembership (elenco)
-- ---------------------------------------------------------------------
CREATE TABLE "SquadMembership" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "seasonId" TEXT NOT NULL,
  "jerseyNumber" INTEGER,
  "position" TEXT NOT NULL,
  "status" "SquadStatus" NOT NULL DEFAULT 'ATIVO',
  CONSTRAINT "SquadMembership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SquadMembership_teamId_seasonId_jerseyNumber_key"
  ON "SquadMembership"("teamId", "seasonId", "jerseyNumber");
ALTER TABLE "SquadMembership"
  ADD CONSTRAINT "SquadMembership_playerId_fkey"
  FOREIGN KEY ("playerId") REFERENCES "Player"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SquadMembership"
  ADD CONSTRAINT "SquadMembership_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SquadMembership"
  ADD CONSTRAINT "SquadMembership_seasonId_fkey"
  FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- Match / Lineup / Broadcast
-- ---------------------------------------------------------------------
CREATE TABLE "Match" (
  "id" TEXT NOT NULL,
  "seasonId" TEXT NOT NULL,
  "roundId" TEXT NOT NULL,
  "homeTeamId" TEXT NOT NULL,
  "awayTeamId" TEXT NOT NULL,
  "stadiumId" TEXT,
  "matchDateTime" TIMESTAMP(3) NOT NULL,
  "status" "MatchStatus" NOT NULL DEFAULT 'AGENDADO',
  "homeScore" INTEGER,
  "awayScore" INTEGER,
  CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Match"
  ADD CONSTRAINT "Match_seasonId_fkey"
  FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match"
  ADD CONSTRAINT "Match_roundId_fkey"
  FOREIGN KEY ("roundId") REFERENCES "Round"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match"
  ADD CONSTRAINT "Match_homeTeamId_fkey"
  FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match"
  ADD CONSTRAINT "Match_awayTeamId_fkey"
  FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match"
  ADD CONSTRAINT "Match_stadiumId_fkey"
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Lineup" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "isStarter" BOOLEAN NOT NULL DEFAULT true,
  "position" TEXT NOT NULL,
  "shirtNumber" INTEGER,
  CONSTRAINT "Lineup_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Lineup_matchId_teamId_playerId_key"
  ON "Lineup"("matchId", "teamId", "playerId");
ALTER TABLE "Lineup"
  ADD CONSTRAINT "Lineup_matchId_fkey"
  FOREIGN KEY ("matchId") REFERENCES "Match"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lineup"
  ADD CONSTRAINT "Lineup_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lineup"
  ADD CONSTRAINT "Lineup_playerId_fkey"
  FOREIGN KEY ("playerId") REFERENCES "Player"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Broadcast" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "channelName" TEXT NOT NULL,
  "type" "BroadcastType" NOT NULL,
  "url" TEXT,
  CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Broadcast"
  ADD CONSTRAINT "Broadcast_matchId_fkey"
  FOREIGN KEY ("matchId") REFERENCES "Match"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- Standing (classificação)
-- ---------------------------------------------------------------------
CREATE TABLE "Standing" (
  "id" TEXT NOT NULL,
  "seasonId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "played" INTEGER NOT NULL DEFAULT 0,
  "wins" INTEGER NOT NULL DEFAULT 0,
  "draws" INTEGER NOT NULL DEFAULT 0,
  "losses" INTEGER NOT NULL DEFAULT 0,
  "goalsFor" INTEGER NOT NULL DEFAULT 0,
  "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
  "points" INTEGER NOT NULL DEFAULT 0,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Standing_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Standing_seasonId_teamId_key" ON "Standing"("seasonId", "teamId");
ALTER TABLE "Standing"
  ADD CONSTRAINT "Standing_seasonId_fkey"
  FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Standing"
  ADD CONSTRAINT "Standing_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- Transfer (transferências)
-- ---------------------------------------------------------------------
CREATE TABLE "Transfer" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "fromTeamId" TEXT,
  "toTeamId" TEXT,
  "transferDate" TIMESTAMP(3) NOT NULL,
  "type" "TransferType" NOT NULL,
  "feeValue" DOUBLE PRECISION,
  "feeCurrency" TEXT,
  "seasonId" TEXT,
  CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Transfer"
  ADD CONSTRAINT "Transfer_playerId_fkey"
  FOREIGN KEY ("playerId") REFERENCES "Player"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transfer"
  ADD CONSTRAINT "Transfer_fromTeamId_fkey"
  FOREIGN KEY ("fromTeamId") REFERENCES "Team"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transfer"
  ADD CONSTRAINT "Transfer_toTeamId_fkey"
  FOREIGN KEY ("toTeamId") REFERENCES "Team"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transfer"
  ADD CONSTRAINT "Transfer_seasonId_fkey"
  FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- CollaboratorRequest
-- ---------------------------------------------------------------------
CREATE TABLE "CollaboratorRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "status" "CollaboratorStatus" NOT NULL DEFAULT 'PENDING',
  "message" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  CONSTRAINT "CollaboratorRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CollaboratorRequest_userId_teamId_key"
  ON "CollaboratorRequest"("userId", "teamId");
ALTER TABLE "CollaboratorRequest"
  ADD CONSTRAINT "CollaboratorRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollaboratorRequest"
  ADD CONSTRAINT "CollaboratorRequest_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollaboratorRequest"
  ADD CONSTRAINT "CollaboratorRequest_reviewedBy_fkey"
  FOREIGN KEY ("reviewedBy") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================================
-- Fim do schema. Depois de rodar isso no Supabase:
--
-- 1. No seu .env local, coloque a DATABASE_URL do Supabase
-- 2. Rode: npx prisma generate
-- 3. (Opcional) Rode: npm run db:seed  -> popula times/jogadores de exemplo
--
-- Não é necessário rodar `npx prisma db push` se você já executou este
-- arquivo — as tabelas já existem e batem exatamente com o schema.prisma.
-- =====================================================================
