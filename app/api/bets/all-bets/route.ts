import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Összes tipp, összes felhasználótól, esemény adatokkal
    const bets = await prisma.bet.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            points: true,
          },
        },
        event: true,
      },
      orderBy: [
        { event: { kickoffTime: "desc" } },
        { user: { username: "asc" } },
      ],
    });

    return NextResponse.json(bets);
  } catch (err) {
    console.error("All bets error:", err);
    return NextResponse.json(
      { message: "Hiba történt" },
      { status: 500 }
    );
  }
}
