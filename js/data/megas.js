/* ============ megas.js — megaevoluciones LAN (POC) ============
 * La especie NO cambia (sigue dex 150 en colección, guardado y red);
 * la mega sólo cambia el sprite (pseudo-dex 150mx/150my, ver
 * tools/fetch_mega.py) y los stats de la run.
 * Se compran en Mejoras (max 1) cuando el Pokémon llega a nivel 100
 * (todas las demás mejoras al máximo) y se activan a voluntad.
 */
G.MEGA = (() => {
  const TABLE = {
    // Tipos por forma (genérico POC: mismos bonus en las tres).
    150: [
      { id: 'mega150x', form: 'x', key: '150mx', name: 'Mega-Mewtwo X', types: ['psychic', 'fighting'], price: 10000, hp: 50, atk: 1.2, cd: 0.8, def: 0.2 },
      { id: 'mega150y', form: 'y', key: '150my', name: 'Mega-Mewtwo Y', types: ['psychic'], price: 10000, hp: 50, atk: 1.2, cd: 0.8, def: 0.2 },
      { id: 'mega150o', form: 'o', key: '150mo', name: 'Mewtwo Oscuro', types: ['psychic', 'steel'], price: 10000, hp: 50, atk: 1.2, cd: 0.8, def: 0.2 },
    ]
  };
  const BY_ID = {};
  for (const d of Object.keys(TABLE)) for (const e of TABLE[d]) { e.dex = +d; BY_ID[e.id] = e; }

  // Entradas comprables en Mejoras (se filtran por especie en menu.js).
  if (G.Upgrades) for (const id of Object.keys(BY_ID)) {
    const e = BY_ID[id];
    const u = { id, icon: 'star', name: e.name,
      unit: `Forma mega: +${e.hp} vida, +${Math.round((e.atk - 1) * 100)}% daño, -${Math.round((1 - e.cd) * 100)}% recarga, +${Math.round(e.def * 100)}% defensa`,
      max: 1, base: e.price, grow: 1, mega: { dex: e.dex, form: e.form } };
    G.Upgrades.LIST.push(u);
    G.Upgrades.BY[id] = u;
  }

  /** Entradas mega de una especie. */
  function of(dex) { return TABLE[dex] || []; }

  /** Total de niveles no-mega para desbloquear (el "nivel 100"). */
  function needTotal() {
    if (!G.Upgrades) return 100;
    return G.Upgrades.LIST.filter(u => !u.mega).reduce((a, u) => a + u.max, 0);
  }

  /** Niveles no-mega que tiene ese Pokémon. */
  function haveTotal(levels) {
    let n = 0;
    if (G.Upgrades) for (const u of G.Upgrades.LIST) {
      if (u.mega) continue;
      n += Math.min(u.max, Math.floor((levels || {})[u.id] || 0));
    }
    return n;
  }

  /** ¿Tiene sprites descargados? (sin ellos la forma no se ofrece). */
  function hasSprites(e) { return !!(e && G.SPRITE_META && G.SPRITE_META[e.key]); }

  /** Mega seleccionada y comprada para ese dex (o null). */
  function selected(save, dex) {
    const id = save && save.pmega && save.pmega[dex];
    const e = id && BY_ID[id];
    if (!e || e.dex !== dex || !hasSprites(e)) return null;
    const lv = save && G.DB && G.DB.upgradesOf ? G.DB.upgradesOf(dex) : {};
    return lv[e.id] > 0 ? e : null;
  }

  /** Mega activa del compañero (o null). */
  function active(save) { return save ? selected(save, save.partner) : null; }

  /** Nombre a mostrar (mega o base). */
  function dispName(dex, mega) {
    return mega ? mega.name : (G.DEX_BY[dex] ? G.DEX_BY[dex].name : '');
  }

  return { TABLE, BY_ID, of, needTotal, haveTotal, hasSprites, selected, active, dispName };
})();
