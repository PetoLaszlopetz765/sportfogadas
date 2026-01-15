import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find users whose credits field is not set to a number (shouldn't happen with default, but check)
  const users = await prisma.user.findMany();
  let updatedCount = 0;
  for (const user of users) {
    if (typeof user.credits !== "number" || isNaN(user.credits)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: 0 },
      });
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
