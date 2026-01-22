import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export async function POST(req: NextRequest) {
  try {
    // Auth ellenőrzés
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Nincs token - csak adminok tudnak eseményt létrehozni" },
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

    // TODO: role ellenőrzés (később kellhet ADMIN szerepkör)
    // if (decoded.role !== "ADMIN") {
    //   return NextResponse.json(
    //     { message: "Csak adminok tudnak eseményt létrehozni" },
    //     { status: 403 }
    //   );
    // }

    const { homeTeam, awayTeam, kickoffTime, status, creditCost } = await req.json();

    // Magyar időzóna (Europe/Budapest) → UTC átalakítás
    // A frontendről érkező kickoffTime pl. "2026-01-22T20:00" magyar idő, ezt UTC-re kell konvertálni
    function localToUTC(dateString: string) {
      // Europe/Budapest időzóna
      const localDate = new Date(dateString);
      // Budapest offset (télen +1, nyáron +2)
      const offsetMinutes = localDate.getTimezoneOffset();
      // UTC idő
      return new Date(localDate.getTime() - offsetMinutes * 60000);
    }

    const kickoffUTC = localToUTC(kickoffTime);

    const event = await prisma.event.create({
      data: {
        homeTeam,
        awayTeam,
        kickoffTime: kickoffUTC,
        status: status || "OPEN",
        creditCost: creditCost || 100,
      },
    });

    return NextResponse.json(event);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Hiba az esemény létrehozásakor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        dailyPool: true,
      },
      orderBy: { kickoffTime: "asc" },
    });

    // Dinamikusan átszámoljuk a carriedFromPrevious értékeket
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event.dailyPool) continue;

      // Az előző esemény keresése (időrendben)
      const previousEvent = events
        .filter(e => e.kickoffTime < event.kickoffTime && e.dailyPool)
        .sort((a, b) => b.kickoffTime.getTime() - a.kickoffTime.getTime())[0];

      if (previousEvent?.dailyPool && previousEvent.dailyPool.totalDistributed === 0) {
        // Az előző esemény pool-ja nem lett szétosztva, átgöngyöljük
        const carriedAmount = previousEvent.dailyPool.totalDaily + previousEvent.dailyPool.carriedFromPrevious;
        event.dailyPool.carriedFromPrevious = carriedAmount;
      }
    }

    return NextResponse.json(events);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Hiba az események lekérésekor" },
      { status: 500 }
    );
  }
}
