import { prisma } from "./lib/db";
import bcrypt from "bcrypt";

async function main() {
  // Ellenőrizzük, hogy létezik-e az admin
  const admin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  console.log("Admin felhasználó a DB-ben:", admin);

  if (admin) {
    console.log("Admin jelszó hash:", admin.password);
    
    // Próbáljuk meg a jelszót ellenőrizni
    const passwordMatch = await bcrypt.compare("admin123", admin.password);
    console.log("Jelszó match (admin123):", passwordMatch);
  } else {
    console.log("❌ Nincs admin felhasználó!");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
