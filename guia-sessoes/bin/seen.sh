#!/usr/bin/env bash
# Marca um arquivo como já tratado pela sessão, para o wait-for.sh não devolvê-lo de novo.
# Uso: seen.sh <sessao A|B|C> <caminho>
set -eu
# Roda a partir da raiz de dok-draw-documentation, de onde quer que seja chamado.
cd "$(cd "$(dirname "$0")/../.." && pwd)"
echo "$2" >> "tasks/.state/$1.seen"
