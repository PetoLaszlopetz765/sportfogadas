import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

function generateInviteCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Nincs O, 0, I, 1
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
    return NextResponse.json({ message: "Csak admin generálhat!" }, { status: 403 });
  }
  let code: string = "";
  let exists: boolean = true;
  // Egyedi kódot generálunk
  while (exists) {
    code = generateInviteCode();
    exists = (await prisma.inviteCode.findUnique({ where: { code } })) !== null;
  }
  await prisma.inviteCode.create({ data: { code } });
  return NextResponse.json({ code });
}

export async function GET(req: NextRequest) {
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
    return NextResponse.json({ message: "Csak admin láthatja!" }, { status: 403 });
  }
  const codes = await prisma.inviteCode.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json({ codes });
}
