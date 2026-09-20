#!/usr/bin/env bash
# Copia as 30 fixtures do DokMD v1 (ADR 002) para dentro do app e commita.
#
# Existe porque o agente do Lovable não alcança o repositório da documentação, e
# o critério de pronto da fatia F1 do ADR 002 são as 30 fixtures rodando no app.
# É a única escrita que uma sessão faz em dok-draw-app, é dado de teste e não
# código, e copia sem transformar: origem e destino ficam byte a byte iguais.
#
# Não faz push. Publicar na main do app é categoria app-release e passa pelo humano.
# Uso: instalar-fixtures.sh
set -eu

docs=/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-documentation
app=/Users/ralphrenatodasilva/workspace/000-Pessoal/codebase/dok-draw-app
origem="$docs/adrs/ADR-002-anexos/fixtures"
destino="$app/src/content-format/testing/fixtures"

[ -d "$origem" ] || { echo "ERRO: $origem não existe" >&2; exit 1; }
[ -d "$app/.git" ] || { echo "ERRO: $app não é um repositório git" >&2; exit 1; }

mkdir -p "$(dirname "$destino")"
rm -rf "$destino"
cp -R "$origem" "$destino"

origem_n=$(find "$origem" -type f | wc -l | tr -d ' ')
destino_n=$(find "$destino" -type f | wc -l | tr -d ' ')
[ "$origem_n" = "$destino_n" ] || { echo "ERRO: $origem_n arquivos na origem, $destino_n no destino" >&2; exit 1; }
diff -r "$origem" "$destino" >/dev/null || { echo "ERRO: destino diverge da origem" >&2; exit 1; }

git -C "$app" add src/content-format/testing/fixtures
if git -C "$app" diff --cached --quiet; then
  echo "Nada a commitar: as fixtures no app já estão iguais às da documentação ($origem_n arquivos)."
  exit 0
fi
git -C "$app" commit -q -m "test(content-format): importa as fixtures do DokMD v1 do ADR 002 ($origem_n arquivos)"
echo "Commitado no app, sem push. $origem_n arquivos."
git -C "$app" log --oneline -1
