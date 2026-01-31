/**
 * Lista blanca de usuarios ADMIN
 * Solo los usuarios con email en esta lista tendrán acceso al panel admin
 * 
 * Fácil de modificar: solo agrega/elimina emails aquí
 */

export const ADMIN_EMAILS = [
  'admin@mangas.com',
  'jon@mangas.com',
  'jose@gmail.com',
  // Agrega más emails aquí si necesitas más admins
];

/**
 * Función para verificar si un usuario es admin
 * @param {Object} user - Objeto usuario con email
 * @returns {boolean} true si el email está en la lista blanca
 */
export const isUserAdmin = (user) => {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email);
};
