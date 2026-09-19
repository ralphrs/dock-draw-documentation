#!/usr/bin/env bash
# Espera aparecer arquivo pendente em uma ou mais pastas.
# Uso: wait-for.sh <sessao A|B> <timeout_s> <pasta:glob> [pasta:glob ...]
# Saída: uma linha "NEW <caminho>" por arquivo pendente, ou "TIMEOUT".
# Pendente = casa com o glob, não termina em .tmp e não está no seen da sessão.
set -u
sessao=$1; timeout=$2; shift 2
state="tasks/.state/$sessao.seen"
touch "$state"
fim=$(( $(date +%s) + timeout ))
while :; do
  achou=0
  for spec in "$@"; do
    pasta=${spec%%:*}; glob=${spec#*:}
    for f in "$pasta"/$glob; do
      [ -f "$f" ] || continue
      case "$f" in *.tmp) continue ;; esac
      if ! grep -qxF "$f" "$state"; then
        echo "NEW $f"; achou=1
      fi
    done
  done
  [ "$achou" = 1 ] && exit 0
  if [ "$(date +%s)" -ge "$fim" ]; then echo "TIMEOUT"; exit 0; fi
  sleep 5
done
