import { PrismaClient } from '@prisma/client';
import adminsSeed from './seeds/admins.seed';

const prisma = new PrismaClient();

async function main() {
  await adminsSeed(prisma);
}

main()
  .catch((e) => {
    console.error({ error: e });
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
