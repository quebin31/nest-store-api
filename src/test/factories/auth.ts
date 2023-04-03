import { SignUpDto } from '../../modules/auth/dto/sign-up.dto';
import { faker } from '@faker-js/faker';

export const fakeSignUpDto = (overrides?: Partial<SignUpDto>): SignUpDto => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  name: faker.name.firstName(),
  role: undefined,
  ...overrides,
});
