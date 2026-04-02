import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '$lib/server/encryption';

describe('encryption', () => {
  const key = 'a'.repeat(64); // 32-byte hex key

  it('encrypts and decrypts a string', () => {
    const plaintext = 'my-secret-n8n-password';
    const encrypted = encrypt(plaintext, key);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted).toContain(':'); // iv:authTag:encrypted format
    const decrypted = decrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it('produces different ciphertexts for the same input', () => {
    const plaintext = 'same-input';
    const a = encrypt(plaintext, key);
    const b = encrypt(plaintext, key);
    expect(a).not.toBe(b); // Different IVs
  });

  it('throws on tampered ciphertext', () => {
    const encrypted = encrypt('test', key);
    const tampered = encrypted.slice(0, -2) + 'xx';
    expect(() => decrypt(tampered, key)).toThrow();
  });
});
