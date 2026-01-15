// scripts/test-pool-distribution.ts
// Teszt: 5 user, 12 esemény, különböző tippek, pontok, pool elosztás

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Új események hozzáadása a meglévőkhöz (nem törlünk semmit)
  const users = await prisma.user.findMany({ where: { role: { not: 'ADMIN' } } });
  const events = await prisma.event.findMany();
  // 4 új esemény
  const now = Date.now();
  const newEvents = await Promise.all([
    prisma.event.create({
      data: {
        homeTeam: 'TeamI',
        awayTeam: 'TeamJ',
        kickoffTime: new Date(now + 4 * 3600 * 1000),
        status: 'OPEN',
        finalHomeGoals: null,
        finalAwayGoals: null,
        creditCost: 100,
      },
    }),
    prisma.event.create({
      data: {
        homeTeam: 'TeamK',
        awayTeam: 'TeamL',
        kickoffTime: new Date(now + 5 * 3600 * 1000),
        status: 'OPEN',
        finalHomeGoals: null,
        finalAwayGoals: null,
        creditCost: 100,
      },
    }),
    prisma.event.create({
      data: {
        homeTeam: 'TeamM',
        awayTeam: 'TeamN',
        kickoffTime: new Date(now + 6 * 3600 * 1000),
        status: 'OPEN',
        finalHomeGoals: null,
        finalAwayGoals: null,
        creditCost: 100,
      },
    }),
    prisma.event.create({
      data: {
        homeTeam: 'TeamO',
        awayTeam: 'TeamP',
        kickoffTime: new Date(now + 7 * 3600 * 1000),
        status: 'OPEN',
        finalHomeGoals: null,
        finalAwayGoals: null,
        creditCost: 100,
      },
    }),
  ]);

  // Tippelés: minden user tippel minden új meccsre, különböző tippekkel
  const newPredictions = [
    [ { home: 1, away: 1 }, { home: 2, away: 0 }, { home: 0, away: 2 }, { home: 3, away: 2 } ], // event 5
    [ { home: 2, away: 2 }, { home: 1, away: 3 }, { home: 0, away: 1 }, { home: 2, away: 1 } ], // event 6
    [ { home: 0, away: 0 }, { home: 1, away: 2 }, { home: 2, away: 1 }, { home: 1, away: 1 } ], // event 7
    [ { home: 3, away: 0 }, { home: 0, away: 3 }, { home: 1, away: 2 }, { home: 2, away: 0 } ], // event 8
  ];
  for (let e = 0; e < newEvents.length; e++) {
    for (let i = 0; i < users.length; i++) {
      await prisma.bet.create({
        data: {
          userId: users[i].id,
          eventId: newEvents[e].id,
          predictedHomeGoals: newPredictions[e][i].home,
          predictedAwayGoals: newPredictions[e][i].away,
          pointsAwarded: 0,
          creditSpent: 100,
        },
      });
      await prisma.user.update({
        where: { id: users[i].id },
        data: { credits: { decrement: 100 } },
      });
      // Pool frissítése: 60% napi, 40% bajnoki
      await prisma.creditPool.updateMany({
        data: {
          totalDaily: { increment: 60 },
          totalChampionship: { increment: 40 },
        },
      });
    }
  }

  // Pool logika: minden tippelés után frissül a pool

  // Pool és eredmény kiírás
  const results = await prisma.user.findMany({ orderBy: { points: 'desc' } });
  const pool = await prisma.creditPool.findFirst();
  console.log('Felhasználók állapota:');
  for (const user of results) {
    console.log(`${user.username}: ${user.points} pont, ${user.credits} kredit`);
  }
  console.log(`Napi pool: ${pool?.totalDaily} kredit, Bajnoki pool: ${pool?.totalChampionship} kredit`);
}

main().finally(() => prisma.$disconnect());
