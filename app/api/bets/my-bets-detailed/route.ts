import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export async function GET(req: NextRequest) {
  try {
    // Auth ellenőrzés
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Nincs bejelentkezve" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: "Érvénytelen token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Felhasználó összes tippjei, az események és a napi pool adatokkal
    const bets = await prisma.bet.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            dailyPool: true,
            bets: true, // include all bets for this event to count telitalálat
          },
        },
      },
      orderBy: {
        event: { kickoffTime: "desc" },
      },
    });

    // Nyeremény számítás: ha az esemény poolja ki lett osztva (totalDistributed > 0) ÉS a felhasználó 6 pontot kapott, akkor nyeremény = totalDistributed / telitalálat szám
    const betsWithWinnings = bets.map((bet) => {
      let winnings = 0;
      const dailyPool = bet.event?.dailyPool;
      if (
        dailyPool &&
        dailyPool.totalDistributed > 0 &&
        bet.pointsAwarded === 6
      ) {
        // Telitalálatosok száma az eseményen
        const telitalalatokSzama = bet.event.bets?.filter((b: any) => b.pointsAwarded === 6).length;
        // Ha nincs bets reláció, fallback: 1 (de normálisan mindig van)
        const winnersCount = telitalalatokSzama || 1;
        winnings = Math.floor(dailyPool.totalDistributed / winnersCount);
      }
      return {
        ...bet,
        creditSpent: bet.creditSpent,
        winnings,
      };
    });

    return NextResponse.json(betsWithWinnings);
  } catch (err) {
    console.error("My bets error:", err);
    return NextResponse.json(
      { message: "Hiba történt" },
      { status: 500 }
    );
  }
}
