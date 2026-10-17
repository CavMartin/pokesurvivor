#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LAN: baja formas mega de SpriteCollab y las añade a sprites-meta.js.

    py tools/fetch_mega.py        # una vez con internet; re-ejecutable

Las megas viven en subcarpetas de forma (sprite/0150/0002, ...), así que no
las trae fetch_sprites.py. Se guardan como pseudo-dex (assets/pokemon/150mx)
para que el cargador del juego las use sin cambios: la especie sigue siendo
150 en colección, guardado y red; la forma sólo afecta al sprite.

NOTA: si algún día se regenera sprites-meta.js con fetch_sprites.py, hay que
relanzar este script para reponer las entradas mega.

Sin shiny de momento (el cargador cae a la mega normal automáticamente).

Si una forma no existe o está incompleta en SpriteCollab, NO se usan
alternativas (Showdown GIF, iconos PokéSprite, PokeAPI): son sprites
frontales estáticos o de otro estilo y el motor necesita hojas estilo PMD
(Idle/Walk/Attack/Shoot/Charge/Hurt/Faint, 8 direcciones cada una).
En ese caso se avisa por consola: hay que buscar la hoja en los foros o el
Discord de la comunidad y colocarla a mano en assets/pokemon/<clave>/ con
su entrada en sprites-meta.js (mismo formato que las demás).
"""
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_sprites as F

# dex -> { forma: subcarpeta en SpriteCollab }. Mapeo según tracker.json
# de SpriteCollab (0001 Mega_X, 0002 Mega_Y, 0003 Shadow).
FORMS = {150: {'x': '0001', 'y': '0002', 'o': '0003'}}
KEYS = {dex: {form: f'{dex}m{form}' for form in forms} for dex, forms in FORMS.items()}


def do_form(dex, form):
    tag = f'{dex:04d}'
    sub = FORMS[dex][form]
    key = KEYS[dex][form]
    cache_file = os.path.join(F.CACHE, f'mega-{key}.json')
    out_dir = os.path.join(F.OUT_ASSETS, key)
    if os.path.exists(cache_file):
        meta = json.load(open(cache_file, encoding='utf-8'))
        if all(os.path.exists(os.path.join(out_dir, a + '.png')) for a in meta['a']):
            print(f'  {key}: en caché')
            return key, meta
    xml = F.fetch(f'{F.BASE}/{tag}/{sub}/AnimData.xml')
    if not xml:
        print(f'  {key}: forma no disponible en SpriteCollab (ver sprites.pmdcollab.org,'
              f' foros o Discord de la comunidad para una hoja estilo PMD)')
        return key, None
    anims, shadow = F.parse_animdata(xml.decode('utf-8', 'replace'))
    normal = F.download_set(f'{F.BASE}/{tag}/{sub}', out_dir, anims)
    if not F.REQUIRED & set(normal):
        print(f'  {key}: faltan animaciones base')
        return key, None
    meta = {'s': shadow, 'a': normal}
    os.makedirs(F.CACHE, exist_ok=True)
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(meta, f, separators=(',', ':'))
    print(f'  {key}: {len(normal)} animaciones')
    return key, meta


def patch_meta(entries):
    with io.open(F.OUT_META, encoding='utf-8') as f:
        txt = f.read()
    # Fuera entradas mega viejas (re-ejecución limpia).
    txt = re.sub(r"^  '\d+m\w': .*,$\n", '', txt, flags=re.M)
    assert txt.rstrip().endswith('};'), 'formato inesperado en sprites-meta.js'
    add = [f"  '{k}': {json.dumps(m, separators=(',', ':'))}," for k, m in entries]
    txt = txt.rstrip()[:-3].rstrip() + '\n' + '\n'.join(add) + '\n};\n'
    with io.open(F.OUT_META, 'w', encoding='utf-8', newline='\n') as f:
        f.write(txt)


def main():
    got = []
    for dex, forms in FORMS.items():
        for form in forms:
            key, meta = do_form(dex, form)
            if meta:
                got.append((key, meta))
    if got:
        patch_meta(got)
        print(f'\n{len(got)} megaformas en sprites-meta.js: ' + ', '.join(k for k, _ in got))


if __name__ == '__main__':
    main()
