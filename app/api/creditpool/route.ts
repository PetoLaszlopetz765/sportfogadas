import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const pool = await prisma.creditPool.findFirst();
    return NextResponse.json({
      totalDaily: pool?.totalDaily || 0,
      totalChampionship: pool?.totalChampionship || 0,
    });
  } catch (err) {
    return NextResponse.json({ message: "Hiba a pool lekérdezésekor" }, { status: 500 });
  }
}
