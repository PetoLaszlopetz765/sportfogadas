import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Admin felhasználó létrehozása
  const adminPassword = await bcrypt.hash("admin123", 10);
  
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
      points: 0,
    },
  });

  console.log("Admin felhasználó: ", adminUser.username, "✅");

  const events = [
    { homeTeam: "Magyarország", awayTeam: "Románia", kickoffTime: new Date("2026-01-12T18:00:00") },
    { homeTeam: "Olaszország", awayTeam: "Németország", kickoffTime: new Date("2026-01-13T20:00:00") },
    { homeTeam: "Brazília", awayTeam: "Argentína", kickoffTime: new Date("2026-01-14T19:30:00") },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }

  console.log("Események feltöltve ✅");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
