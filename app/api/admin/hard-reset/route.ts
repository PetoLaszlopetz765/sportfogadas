import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Nincs token!" }, { status: 401 });
  }
  const token = authHeader.substring(7);
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ message: "Érvénytelen token" }, { status: 401 });
  }
  if (decoded.role !== "ADMIN") {
    return NextResponse.json({ message: "Csak admin törölhet!" }, { status: 403 });
  }
  // Törlés: sorrendben, hogy ne legyen idegen kulcs hiba
  await prisma.bet.deleteMany();
  await prisma.event.deleteMany();
  // Meghívó kódok törlése
  await prisma.inviteCode.deleteMany();
  // Csak az admin maradjon meg
  await prisma.user.deleteMany({ where: { role: { not: "ADMIN" } } });
  // Kredit pool törlése és újra létrehozása
  await prisma.creditPool.deleteMany();
  await prisma.creditPool.create({ data: { totalDaily: 0, totalChampionship: 0 } });
  return NextResponse.json({ message: "Minden adat törölve! Kredit pool újraindítva." });
}
