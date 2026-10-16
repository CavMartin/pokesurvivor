/* ============ login.js — inicio: entrar, crear cuenta o invitado ============ */
G.LoginUI = (() => {
  const $ = G.UI.$;
  let mode = 'login';

  function init() {
    document.querySelectorAll('#scr-login .tab').forEach(t => {
      t.onclick = () => setMode(t.dataset.tab);
    });
    $('login-form').onsubmit = async e => {
      e.preventDefault();
      $('login-err').textContent = '';
      $('btn-auth').disabled = true;
      const fn = mode === 'login' ? G.DB.login : G.DB.register;
      const r = await fn($('f-user').value, $('f-pass').value);
      $('btn-auth').disabled = false;
      if (!r.ok) { $('login-err').textContent = r.error; return; }
      $('f-pass').value = '';
      G.Flow.afterLogin();
    };
    $('btn-guest').onclick = () => { G.DB.playAsGuest(); G.Flow.afterLogin(); };
    // LAN: recuperar es poner contraseña nueva, sin más.
    $('f-forgot').onclick = e => {
      e.preventDefault();
      $('login-err').textContent = '';
      const who = ($('f-user').value || '').trim();
      if (!who) { $('login-err').textContent = 'Escribe tu nombre de jugador arriba.'; return; }
      $('forgot-who').textContent = who;
      $('forgot-err').textContent = '';
      $('f-newpass').value = ''; $('f-newpass2').value = '';
      $('forgot-form').classList.toggle('hidden');
    };
    $('btn-newpass').onclick = async () => {
      $('forgot-err').textContent = '';
      const who = ($('f-user').value || '').trim();
      const a = $('f-newpass').value, b = $('f-newpass2').value;
      if (a !== b) { $('forgot-err').textContent = 'No coinciden.'; return; }
      $('btn-newpass').disabled = true;
      const r = await G.DB.resetPasswordLAN(who, a);
      $('btn-newpass').disabled = false;
      if (!r.ok) { $('forgot-err').textContent = r.error; return; }
      $('forgot-form').classList.add('hidden');
      G.UI.toast('Contraseña actualizada: ya puedes entrar.', 4000);
    };
  }

  /**
   * LAN: sin Google no hay vinculación de Gmail; no se ofrece nada.
   * Se mantiene la función porque Flow la llama tras entrar.
   */
  function offerRecovery() {}

  /** Explica dónde se guarda la partida según el modo de la base de datos. */
  function modeNote() {
    if (G.DB.mode === 'cloud') return 'Tu partida se guarda en la nube: entra desde cualquier ordenador. Como invitado no se guarda.';
    const why = G.DB.localReason === 'file'
      ? 'Abierto desde un archivo: la partida sólo se guarda en este navegador. Para guardar en la nube, juega en la versión publicada.'
      : G.DB.localReason === 'host'
        ? 'Esta no es la web oficial: la partida sólo se guarda en este navegador. El juego oficial y gratis está en pokesurvivor.com.'
      : G.DB.localReason === 'config'
        ? 'Nube sin configurar: la partida sólo se guarda en este navegador.'
        : 'No se pudo conectar con la nube: la partida sólo se guarda en este navegador.';
    return why;
  }

  function setMode(m) {
    mode = m;
    document.querySelectorAll('#scr-login .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === m));
    $('btn-auth').textContent = m === 'login' ? 'Entrar' : 'Crear cuenta';
    $('f-pass').autocomplete = m === 'login' ? 'current-password' : 'new-password';
    $('login-err').textContent = '';
  }

  function open() {
    G.UI.chrome(false);
    G.UI.show('scr-login');
    if (!G.DB.storageOk) $('login-err').textContent = 'Este navegador no deja guardar datos: juega como invitado.';
    $('login-mode').textContent = modeNote();
    setTimeout(() => $('f-user').focus(), 50);
  }

  return { init, open, offerRecovery };
})();
