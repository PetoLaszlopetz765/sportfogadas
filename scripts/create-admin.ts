// scripts/create-admin.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  // Ellenőrizzük, van-e már admin
  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (existing) {
    console.log('Admin már létezik:', existing.username);
    return;
  }
  // Admin létrehozása bcrypt hash jelszóval
  const hashed = await bcrypt.hash('ToleDo1974', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashed, // bcrypt hash
      role: 'ADMIN',
      credits: 10000,
      points: 0,
    },
  });
  console.log('Admin létrehozva:', admin.username);
}

main().finally(() => prisma.$disconnect());
