import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Összes felhasználó pontjaival rendezve
    // Minden felhasználó összesített pontjának lekérdezése (összes bet pontjainak összege)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        credits: true,
        role: true,
        bets: {
          select: {
            pointsAwarded: true,
          },
        },
      },
    });

    // Összesített pontszám és tippelt meccsek számának számítása
    const leaderboard = users.map(user => ({
      id: user.id,
      username: user.username,
      credits: user.credits,
      role: user.role,
      points: user.bets.reduce((sum, bet) => sum + (bet.pointsAwarded || 0), 0),
      tipsCount: user.bets.length,
      perfectCount: user.bets.filter(bet => bet.pointsAwarded === 6).length,
    })).sort((a, b) => b.points - a.points);

    return NextResponse.json(leaderboard);
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json(
      { message: "Hiba történt" },
      { status: 500 }
    );
  }
}
