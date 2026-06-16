-- =====================================================================
-- 01_enums.sql
-- Crie os tipos ENUM antes de qualquer tabela.
-- =====================================================================

CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "CollaboratorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "Division" AS ENUM ('SERIE_A', 'SERIE_B');
CREATE TYPE "SquadStatus" AS ENUM ('ATIVO', 'LESIONADO', 'SUSPENSO', 'EMPRESTADO');
CREATE TYPE "MatchStatus" AS ENUM ('AGENDADO', 'EM_ANDAMENTO', 'FINALIZADO', 'ADIADO', 'CANCELADO');
CREATE TYPE "BroadcastType" AS ENUM ('TV_ABERTA', 'TV_FECHADA', 'STREAMING', 'RADIO');
CREATE TYPE "TransferType" AS ENUM (
  'CONTRATACAO',
  'EMPRESTIMO',
  'RETORNO_EMPRESTIMO',
  'LIVRE',
  'ENCERRAMENTO_CONTRATO'
);
