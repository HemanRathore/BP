import { randomBytes } from 'node:crypto';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const input = randomBytes(20);
let bits = '';
for (const byte of input) bits += byte.toString(2).padStart(8, '0');
let secret = '';
for (let i = 0; i < bits.length; i += 5) secret += alphabet[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)];
const account = encodeURIComponent('BP website admin');
console.log('Authenticator secret (keep private; do not commit):');
console.log(secret);
console.log('\nManual-entry URL:');
console.log(`otpauth://totp/${account}?secret=${secret}&issuer=BP%20Enterprises&digits=6&period=30`);
