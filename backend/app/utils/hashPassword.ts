import bcrypt from 'bcrypt'

//plus c'est grand plus c'est hacher mais plus c'est lent
const SALT_ROUNDS = 10;

// Fonction pour hacher le mot de passe 
export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
}

// Vérifier le mot de passe
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const match = await bcrypt.compare(password, hash);
  return match;
}
