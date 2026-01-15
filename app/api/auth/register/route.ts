import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, inviteCode } = body;

    if (!username || !password || !inviteCode) {
      return NextResponse.json(
        { message: "Hiányzó adat" },
        { status: 400 }
      );
    }

    const code = await prisma.inviteCode.findUnique({
      where: { code: inviteCode },
    });

    if (!code || code.used) {
      return NextResponse.json(
        { message: "Érvénytelen meghívókód" },
        { status: 400 }
      );
    }

    // Ellenőrizni, hogy a felhasználónév már foglalt-e
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Ez a felhasználónév már foglalt" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    // Kezdő kredit lekérése a Setting táblából
    let initialCredits = 0;
    const setting = await prisma.setting.findUnique({ where: { key: "initial_credits" } });
    if (setting && !isNaN(Number(setting.value))) {
      initialCredits = Number(setting.value);
    }

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        credits: initialCredits,
      },
    });

    await prisma.inviteCode.update({
      where: { code: inviteCode },
      data: { used: true },
    });

    return NextResponse.json({ message: "Sikeres regisztráció" });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { message: "Hiba történt a regisztrációkor" },
      { status: 500 }
    );
  }
}
