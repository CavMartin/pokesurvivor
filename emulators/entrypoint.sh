#!/bin/sh
# Arranca los emuladores con el proyecto demo-ps.
# Si hay datos guardados de otra vez (/data/save), se importan;
# al parar el contenedor, se exportan (cuentas y partidas persisten).
set -e
cd /app
ARGS="--project demo-ps --config /app/firebase.lan.json"
if [ -d /data/save ] && [ -n "$(ls -A /data/save 2>/dev/null)" ]; then
  ARGS="$ARGS --import /data/save"
fi
# shellcheck disable=SC2086
exec firebase emulators:start $ARGS --export-on-exit /data/save
