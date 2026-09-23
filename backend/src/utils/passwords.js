import bcrypt from 'bcryptjs';

const PEPPER = process.env.PIN_PEPPER || process.env.PEPPER || '';

function withPepper(pin) {
  return `${String(pin)}${PEPPER}`;
}

export async function hashPin(pin) {
  return bcrypt.hash(withPepper(pin), 10);
}

export async function comparePin(pin, hash) {
  return bcrypt.compare(withPepper(pin), hash);
}

export default { hashPin, comparePin };
