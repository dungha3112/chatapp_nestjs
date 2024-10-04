import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

export async function compareHash(rawPassword: string, hashedPassword: string) {
  return await bcrypt.compare(rawPassword, hashedPassword);
}
