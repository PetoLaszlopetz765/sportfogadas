import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Nincs token" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ message: "Érvénytelen token" }, { status: 401 });
    }

    // A felhasználó összes tippjét lekérjük
    const userBets = await prisma.bet.findMany({
      where: { userId },
      select: { eventId: true, predictedHomeGoals: true, predictedAwayGoals: true },
    });

    return NextResponse.json(userBets);
  } catch (err) {
    console.error("Get user bets error:", err);
    return NextResponse.json(
      { message: "Hiba a tippek lekérésekor" },
      { status: 500 }
    );
  }
}
