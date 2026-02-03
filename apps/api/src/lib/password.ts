/**
 * Password utility functions for secure password generation
 */

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SPECIAL = '!@#$%^&*';

/**
 * Generates a cryptographically secure random password
 * @param length - Password length (default: 12)
 * @returns A secure random password with mixed character types
 */
export function generateSecurePassword(length = 12): string {
  const allChars = LOWERCASE + UPPERCASE + DIGITS + SPECIAL;
  const password: string[] = [];

  // Ensure at least one of each character type
  password.push(getRandomChar(LOWERCASE));
  password.push(getRandomChar(UPPERCASE));
  password.push(getRandomChar(DIGITS));
  password.push(getRandomChar(SPECIAL));

  // Fill the rest with random characters from all types
  for (let i = password.length; i < length; i++) {
    password.push(getRandomChar(allChars));
  }

  // Shuffle the password array using Fisher-Yates
  for (let i = password.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

/**
 * Get a random character from a string
 */
function getRandomChar(chars: string): string {
  return chars[getRandomInt(chars.length)];
}

/**
 * Get a cryptographically secure random integer between 0 and max-1
 */
function getRandomInt(max: number): number {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] % max;
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns true if password meets minimum requirements
 */
export function isPasswordStrong(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}
