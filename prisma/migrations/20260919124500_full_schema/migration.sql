-- Ensure tournament registration tables exist (older Hostinger DBs may lack them).
CREATE TABLE IF NOT EXISTS "TournamentRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "allowPartner" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL DEFAULT 'Registracija',
    "intro" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TournamentRegistration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TournamentRegistration_tournamentId_key" ON "TournamentRegistration"("tournamentId");

CREATE TABLE IF NOT EXISTS "TournamentRegistrationEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "partnerFirstName" TEXT,
    "partnerLastName" TEXT,
    "partnerEmail" TEXT,
    "partnerPhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TournamentRegistrationEntry_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "TournamentRegistration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TournamentRegistrationEntry_registrationId_idx" ON "TournamentRegistrationEntry"("registrationId");
