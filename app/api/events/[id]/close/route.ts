import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    console.log("=== CLOSE EVENT ENDPOINT CALLED ===");
    
    const params = await props.params;
    const eventId = parseInt(params.id);
    
    console.log("Event ID:", eventId);
    
    // Auth ellenőrzés
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No auth header");
      return NextResponse.json(
        { message: "Nincs token - csak adminok tudnak eseményt lezárni" },
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

    // Esemény lezárása
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "CLOSED",
      },
    });

    console.log("✓ Event closed:", updatedEvent);

    return NextResponse.json({
      message: "Esemény sikeresen lezárva",
      event: updatedEvent,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Hiba az esemény lezárásakor" },
      { status: 500 }
    );
  }
}
