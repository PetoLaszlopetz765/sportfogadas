-- CreateTable
CREATE TABLE "CreditPool" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalDaily" INTEGER NOT NULL DEFAULT 0,
    "totalChampionship" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "predictedHomeGoals" INTEGER NOT NULL,
    "predictedAwayGoals" INTEGER NOT NULL,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "creditSpent" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bet" ("eventId", "id", "pointsAwarded", "predictedAwayGoals", "predictedHomeGoals", "userId") SELECT "eventId", "id", "pointsAwarded", "predictedAwayGoals", "predictedHomeGoals", "userId" FROM "Bet";
DROP TABLE "Bet";
ALTER TABLE "new_Bet" RENAME TO "Bet";
CREATE UNIQUE INDEX "Bet_userId_eventId_key" ON "Bet"("userId", "eventId");
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "kickoffTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "finalHomeGoals" INTEGER,
    "finalAwayGoals" INTEGER,
    "creditCost" INTEGER NOT NULL DEFAULT 100
);
INSERT INTO "new_Event" ("awayTeam", "finalAwayGoals", "finalHomeGoals", "homeTeam", "id", "kickoffTime", "status") SELECT "awayTeam", "finalAwayGoals", "finalHomeGoals", "homeTeam", "id", "kickoffTime", "status" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "points" INTEGER NOT NULL DEFAULT 0,
    "credits" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("id", "password", "points", "role", "username") SELECT "id", "password", "points", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
