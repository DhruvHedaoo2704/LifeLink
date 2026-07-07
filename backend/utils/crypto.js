import crypto from 'crypto';
import config from '../config/index.js';

const ALGORITHM = 'aes-256-cbc';
// ENCRYPTION_KEY must be 32 bytes (64 hex characters)
const getEncryptionKey = () => {
  const keyHex = config.encryptionKey;
  return Buffer.from(keyHex, 'hex');
};

// Encrypt text
export const encrypt = (text) => {
  if (!text) return null;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

// Decrypt text
export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    if (!ivHex || !encryptedHex) return null;
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};
