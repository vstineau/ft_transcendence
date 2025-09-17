import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
export async function hashPassword(password) {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
}
export async function comparePassword(password, hash) {
    const match = await bcrypt.compare(password, hash);
    return match;
}
//# sourceMappingURL=hashPassword.js.map