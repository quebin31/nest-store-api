import { Category, PrismaClient } from '@prisma/client';

const categories: Category[] = [
  { name: 'tech', description: 'Technology' },
  { name: 'pets', description: 'Pets' },
  { name: 'home', description: 'Home' },
  { name: 'food', description: 'Food' },
];

export default async function(prisma: PrismaClient) {
  await prisma.category.createMany({ data: categories, skipDuplicates: true });
}
