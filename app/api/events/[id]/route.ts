import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    console.log("=== DELETE EVENT ENDPOINT CALLED ===");
    
    const params = await props.params;
    const eventId = parseInt(params.id);
    
    console.log("Event ID:", eventId);
    
    // Auth ellenőrzés
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No auth header");
      return NextResponse.json(
        { message: "Nincs token - csak adminok tudnak eseményt törölni" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("✓ Token verified:", decoded);
    } catch (err) {
      console.log("❌ Token verification failed:", err);
      return NextResponse.json(
        { message: "Érvénytelen token" },
        { status: 401 }
      );
    }

    // Esemény lekérése
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Esemény nem található" },
        { status: 404 }
      );
    }

    // Összes tipp lekérése erre az eseményre
    const allBets = await prisma.bet.findMany({
      where: { eventId },
    });

    console.log(`Found ${allBets.length} bets for this event`);

    // Felhasználók pontjainak frissítése (mivel törlünk tippeket)
    const userIds = new Set(allBets.map(bet => bet.userId));
    for (const userId of userIds) {
      const totalPoints = await prisma.bet.aggregate({
        where: { 
          userId,
          eventId: { not: eventId } // Except the bets we're about to delete
        },
        _sum: { pointsAwarded: true },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { points: totalPoints._sum.pointsAwarded || 0 },
      });

      console.log(`Updated user ${userId} points`);
    }

    // Összes tipp törlése erre az eseményre
    await prisma.bet.deleteMany({
      where: { eventId },
    });

    console.log(`Deleted ${allBets.length} bets`);

    // Esemény törlése
    await prisma.event.delete({
      where: { id: eventId },
    });

    console.log("✓ Event deleted:", eventId);

    return NextResponse.json({
      message: `Esemény és ${allBets.length} tipp sikeresen törölve`,
      deletedBetsCount: allBets.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Hiba az esemény törlésekor" },
      { status: 500 }
    );
  }
}
