import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Beállítjuk az alapértelmezett kezdő kreditet 5000-re
  await prisma.setting.upsert({
    where: { key: "initial_credits" },
    update: { value: "5000" },
    create: { key: "initial_credits", value: "5000" },
  });
  console.log("Kezdő kredit beállítva: 5000");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
