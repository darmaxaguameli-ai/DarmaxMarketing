import bcrypt from 'bcryptjs';

/**
 * Costo de procesamiento para la generación del salt en bcrypt.
 * Un factor de 10 equilibra una alta seguridad contra ataques de fuerza bruta
 * con un tiempo de respuesta óptimo en el servidor.
 */
const SALT_ROUNDS = 10;

/**
 * Genera un hash seguro a partir de una contraseña en texto plano utilizando bcrypt.
 *
 * @param plainPassword - La contraseña sin procesar introducida por el usuario.
 * @returns La cadena con el hash seguro que debe almacenarse en la base de datos.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compara una contraseña en texto plano contra el hash almacenado en la base de datos.
 *
 * @param plainPassword - La contraseña ingresada por el usuario en el formulario.
 * @param hashedPassword - El hash previamente almacenado en la base de datos.
 * @returns Verdadero si la contraseña coincide con el hash; falso en caso contrario.
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
