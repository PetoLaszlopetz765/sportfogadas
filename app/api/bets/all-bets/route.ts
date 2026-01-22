import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // User azonosítása tokenből
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Nincs bejelentkezve" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Érvénytelen token" }, { status: 401 });
    }
    const userId = decoded.userId;

    // Minden tipp lekérése, admin tippek nélkül, csak bejelentkezett felhasználónak
    const bets = await prisma.bet.findMany({
      where: {
        user: {
          username: {
            not: "admin"
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            points: true,
          },
        },
        event: {
          include: {
            dailyPool: true,
          },
        },
      },
      orderBy: [
        { event: { kickoffTime: "desc" } },
        { user: { username: "asc" } },
      ],
    });
    console.log("API /bets/all-bets: bets count:", bets.length);
    if (bets.length > 0) {
      console.log("API /bets/all-bets: first bet event:", bets[0].event);
      console.log("API /bets/all-bets: first bet dailyPool:", bets[0].event.dailyPool);
    }

    // Dinamikusan átszámoljuk a carriedFromPrevious értékeket
    const allEvents = await prisma.event.findMany({
      include: { dailyPool: true },
      orderBy: { kickoffTime: "asc" },
    });

    for (const bet of bets) {
      if (!bet.event.dailyPool) continue;

      // Az előző esemény keresése (időrendben)
      const previousEvent = allEvents
        .filter(e => e.kickoffTime < bet.event.kickoffTime && e.dailyPool)
        .sort((a, b) => b.kickoffTime.getTime() - a.kickoffTime.getTime())[0];

      if (previousEvent?.dailyPool && previousEvent.dailyPool.totalDistributed === 0) {
        // Az előző esemény pool-ja nem lett szétosztva, átgöngyöljük
        const carriedAmount = previousEvent.dailyPool.totalDaily + previousEvent.dailyPool.carriedFromPrevious;
        bet.event.dailyPool.carriedFromPrevious = carriedAmount;
      }
    }

    return NextResponse.json({ bets });
  } catch (err) {
    console.error("All bets error:", err);
    return NextResponse.json(
      { message: "Hiba történt" },
      { status: 500 }
    );
  }
}
