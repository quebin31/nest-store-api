import { Role, User } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const fakeUser = (overrides?: Partial<User>): User => ({
  id: faker.datatype.uuid(),
  createdAt: faker.date.recent(),
  email: faker.internet.email(),
  name: faker.name.firstName(),
  role: Role.user,
  password: faker.datatype.string(),
  verifiedAt: null,
  ...overrides,
});
