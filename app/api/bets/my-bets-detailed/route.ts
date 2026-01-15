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

    // Felhasználó összes tippjei és az eventos adatok, plusz kredit és nyeremény számítás
    const bets = await prisma.bet.findMany({
      where: { userId },
      include: {
        event: true,
      },
      orderBy: {
        event: { kickoffTime: "desc" },
      },
    });

    // Nyeremény számítás: ha pontot kapott, akkor a feltett kredit * szorzó (pl. 2x, 3x, 4x, 6x)
    // Itt a szorzó a pontszám, de ezt később lehet finomítani
    const betsWithWinnings = bets.map((bet) => {
      let winnings = 0;
      if (bet.pointsAwarded > 0 && bet.creditSpent > 0) {
        winnings = bet.creditSpent * bet.pointsAwarded;
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
