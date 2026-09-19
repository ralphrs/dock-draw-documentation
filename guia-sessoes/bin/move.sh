#!/usr/bin/env bash
# Move (ou publica) um arquivo entre pastas de tasks/ de forma atômica e registra no LOG.
# Uso: move.sh <sessao A|B|C> <evento> <origem> <pasta_destino>
#   Se a origem termina em .tmp, o sufixo é removido no destino (publicação).
# Eventos: create, claim, ask, answer, resume, consume, complete, review
set -eu
# Roda a partir da raiz de dok-draw-documentation, de onde quer que seja chamado.
cd "$(cd "$(dirname "$0")/../.." && pwd)"
sessao=$1; evento=$2; origem=$3; destino=$4
[ -f "$origem" ] || { echo "ERRO: $origem não existe" >&2; exit 1; }
case "$destino" in tasks/todo|tasks/in-progress|tasks/questions|tasks/done) ;; *)
  echo "ERRO: destino inválido: $destino" >&2; exit 1 ;; esac
nome=$(basename "$origem"); nome=${nome%.tmp}
mv "$origem" "$destino/$nome"
printf '%s %s %-8s %s -> %s\n' "$(date +%Y-%m-%dT%H:%M:%S)" "$sessao" "$evento" "$nome" "$destino" >> tasks/LOG.md
echo "$destino/$nome"
