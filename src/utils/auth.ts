import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(plain: string, encrypted: string) {
  return bcrypt.compare(plain, encrypted);
}
