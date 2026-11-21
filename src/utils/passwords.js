import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import * as Crypto from 'expo-crypto';

const HASH_SCHEME = 'pbkdf2-sha256';
const ITERATIONS = 310000;
const SALT_LENGTH = 16;
const HASH_LENGTH = 32;

export async function hashPassword(password) {
  const salt = await Crypto.getRandomBytesAsync(SALT_LENGTH);
  const hash = await pbkdf2Async(sha256, password, salt, {
    c: ITERATIONS,
    dkLen: HASH_LENGTH,
  });
  return `${HASH_SCHEME}$${ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(hash)}`;
}

export async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') {
    throw new Error('Stored password credentials are invalid.');
  }

  const [scheme, iterationText, saltHex, hashHex, ...extra] = storedHash.split('$');
  const iterations = Number(iterationText);
  if (
    scheme !== HASH_SCHEME
    || extra.length
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
  let mismatch = 0;
  for (let index = 0; index < HASH_LENGTH; index += 1) {
    mismatch |= actualHash[index] ^ expectedHash[index];
  }
  return mismatch === 0;
}
