import { createHash, randomInt } from 'node:crypto';
import { DYNAMIC_SECRET } from '../models/dynamic-secret.const.ts';

/** `t,r,md5("salt=…&t=…&r=…")`: segundos, 6 letras al azar y el hash. */
export function generateDynamicSecret(now: number = Date.now()): string {
  const { randomAlphabet, randomLength, salt } = DYNAMIC_SECRET;
  const timestamp = Math.floor(now / 1000);
  const random = Array.from({ length: randomLength }, () => randomAlphabet[randomInt(randomAlphabet.length)]).join('');
  const hash = createHash('md5').update(`salt=${salt}&t=${timestamp}&r=${random}`).digest('hex');
  return `${timestamp},${random},${hash}`;
}
