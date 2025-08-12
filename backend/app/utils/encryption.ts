import crypto from 'crypto';

// DOIT être dans une variable d'environnement sécurisée (.env, vault, etc.)
const ENCRYPTION_KEY = process.env.TOTP_SECRET_KEY || 'change_this_to_a_32_byte_key_minimum!'; // 32 chars for AES-256
const IV_LENGTH = 16; // AES block size

export function encryptSecret(secret: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(secret);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  // On retourne IV + encrypted (en base64)
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptSecret(encrypted: string): string {
  const [ivHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
