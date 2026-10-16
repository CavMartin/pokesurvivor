/* ============ firebase-config.js — conexión con tu proyecto de Firebase ============
 * Pega aquí la configuración de tu app web de Firebase (Consola de Firebase >
 * Configuración del proyecto > Tus apps > SDK setup and configuration > Config).
 * Los pasos completos están en docs/FIREBASE.md.
 *
 * Estos datos NO son secretos: Firebase los diseña para ir en la web. Lo que
 * protege las partidas son las reglas de Firestore (firestore.rules).
 *
 * Si se pone a null, el juego funciona en modo local (sólo en el navegador).
 */
// LAN local (sin internet): emuladores de Firebase en el PC anfitrión.
// Cuentas de nombre+contraseña, salas e invitaciones 100% en red local.
// Los puertos deben coincidir con docker-compose.yml (servicio emuladores).
// `emulator: true` además salta el filtro de HOSTS de db.js, así vale cualquier
// IP/nombre de la LAN (location.hostname llega solo al anfitrión y a cada invitado).
G.FIREBASE_CONFIG = {
  apiKey: 'demo',
  authDomain: 'demo-ps.firebaseapp.com',
  projectId: 'demo-ps',
  appId: 'demo',
  databaseURL: 'http://' + location.hostname + ':9201?ns=demo-ps-default-rtdb',
  emulator: true,
  emuHost: location.hostname,
  emuAuthPort: 9099,
  emuFsPort: 8280,
  emuDbPort: 9201
};

/* Ejemplo de cómo debe quedar:
G.FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto',
  storageBucket: 'tu-proyecto.firebasestorage.app',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123'
};
*/
