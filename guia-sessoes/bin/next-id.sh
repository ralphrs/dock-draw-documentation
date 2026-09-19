#!/usr/bin/env bash
# Próximo id livre para um prefixo (T, Q, D ou QD), olhando todas as pastas de tasks/.
# Uso: next-id.sh <T|Q|D|QD>
set -eu
# Roda a partir da raiz de dok-draw-documentation, de onde quer que seja chamado.
cd "$(cd "$(dirname "$0")/../.." && pwd)"
p=$1
ultimo=$(find tasks -type f -name "$p-[0-9][0-9][0-9][0-9]*" 2>/dev/null \
  | sed -E "s#.*/$p-([0-9]{4}).*#\1#" | sort -n | tail -1)
[ -z "$ultimo" ] && ultimo=0000
printf '%s-%04d\n' "$p" $(( 10#$ultimo + 1 ))
