#!/usr/bin/env bash
# Marca um arquivo como já tratado pela sessão, para o wait-for.sh não devolvê-lo de novo.
# Uso: seen.sh <sessao A|B> <caminho>
set -eu
echo "$2" >> "tasks/.state/$1.seen"
