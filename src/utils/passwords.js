import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes, randomBytes, utf8ToBytes } from '@noble/hashes/utils.js';

const PBKDF2_SCHEME = 'pbkdf2-sha256';
const FAST_SCHEME = 'sha256-salt-v1';
const SALT_LENGTH = 16;
const HASH_LENGTH = 32;

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

async function hashFast(password) {
  const salt = randomBytes(SALT_LENGTH);
  const saltHex = bytesToHex(salt);
  const digest = bytesToHex(sha256(utf8ToBytes(`${saltHex}:${password}`)));
  return `${FAST_SCHEME}$${saltHex}$${digest}`;
}

async function verifyFast(password, saltHex, hashHex) {
  const expected = String(hashHex || '').toLowerCase();
  const actual = bytesToHex(sha256(utf8ToBytes(`${saltHex}:${password}`)));
  if (actual.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actual.length; i += 1) mismatch |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return mismatch === 0;
}

export async function hashPassword(password) {
  return hashFast(password);
}

export async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') {
    throw new Error('Stored password credentials are invalid.');
  }

  const [scheme, a, b, c, ...extra] = storedHash.split('$');

  if (scheme === FAST_SCHEME) {
    if (extra.length || !a || !b) throw new Error('Stored password credentials are invalid.');
    return verifyFast(password, a, b);
  }

  if (scheme === PBKDF2_SCHEME) {
    const iterations = Number(a);
    const saltHex = b;
    const hashHex = c;
    if (
      extra.length
      || !Number.isInteger(iterations)
      || iterations < 100000
      || iterations > 1000000
      || !saltHex
      || !hashHex
    ) {
      throw new Error('Stored password credentials are invalid.');
    }
    const salt = hexToBytes(saltHex);
    const expectedHash = hexToBytes(hashHex);
    if (salt.length !== SALT_LENGTH || expectedHash.length !== HASH_LENGTH) {
      throw new Error('Stored password credentials are invalid.');
    }
    const actualHash = await pbkdf2Async(sha256, password, salt, {
      c: iterations,
      dkLen: HASH_LENGTH,
    });
    return timingSafeEqual(actualHash, expectedHash);
  }

  throw new Error('Stored password credentials are invalid.');
}
