import { PrismaClient, Role } from '@prisma/client';
import { readFile } from 'fs/promises';
import { plainToInstance } from 'class-transformer';
import { SignUpDto } from '../../src/modules/auth/dto/sign-up.dto';
import { validateOrReject } from 'class-validator';
import { hash } from 'bcrypt';

export default async function(prisma: PrismaClient) {
  const adminsFile = process.env.ADMINS_FILE;
  if (adminsFile === undefined) {
    console.log('Skipping seeding of admins as ADMINS_FILE is not defined');
    return;
  }

  console.log(`Seeding admins from file ${adminsFile}`);

  const adminsRaw: any[] = JSON.parse(await readFile(adminsFile, { encoding: 'utf-8' }));
  const admins = adminsRaw.map(value => plainToInstance(SignUpDto, value));
  const validations = admins
    .map(dto => validateOrReject(dto, { forbidNonWhitelisted: true }));

  await Promise.all(validations);

  const dataPromises = admins.map(async admin => ({
    ...admin,
    password: await hash(admin.password, 10),
    role: Role.admin,
    verifiedAt: new Date(),
  }));

  const data = await Promise.all(dataPromises);
  await prisma.user.createMany({ data, skipDuplicates: true });
}
