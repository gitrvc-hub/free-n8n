import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

export function encrypt(plaintext: string, hexKey: string): string {
	const key = Buffer.from(hexKey, 'hex');
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv);
	const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const authTag = cipher.getAuthTag();
	return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(ciphertext: string, hexKey: string): string {
	const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
	const key = Buffer.from(hexKey, 'hex');
	const iv = Buffer.from(ivHex, 'hex');
	const authTag = Buffer.from(authTagHex, 'hex');
	const encrypted = Buffer.from(encryptedHex, 'hex');
	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);
	return decipher.update(encrypted) + decipher.final('utf8');
}
