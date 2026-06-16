-- =====================================================================
-- 09_collaborator_request.sql
-- =====================================================================

CREATE TABLE "CollaboratorRequest" (
  "id"          TEXT                  NOT NULL,
  "userId"      TEXT                  NOT NULL,
  "teamId"      TEXT                  NOT NULL,
  "status"      "CollaboratorStatus"  NOT NULL DEFAULT 'PENDING',
  "message"     TEXT,
  "requestedAt" TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt"  TIMESTAMP(3),
  "reviewedBy"  TEXT,

  CONSTRAINT "CollaboratorRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CollaboratorRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CollaboratorRequest_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CollaboratorRequest_reviewedBy_fkey"
    FOREIGN KEY ("reviewedBy") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CollaboratorRequest_userId_teamId_key"
  ON "CollaboratorRequest"("userId", "teamId");
