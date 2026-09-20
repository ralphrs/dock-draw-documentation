#!/usr/bin/env bash
# Compara o schema aplicado no banco com o DDL da ordem versionada.
#
# Defeito medido em 2026-09-20: a conferência da sub-fatia S1b foi feita na
# mão, linha a linha, duas vezes, trinta e cinco linhas de cada lado.
# Conferência manual não escala para a sprint inteira e não deixa registro
# repetível. Este script é o mecanismo que faltava (DDP-126).
#
# Nenhuma sessão alcança o banco por shell: quem consulta é o MCP do Lovable.
# Por isso o trabalho acontece em duas fases.
#
#   1. confere-execucao.sh --sql ORDEM.md
#      Imprime o SQL de conferência. A sessão roda esse SQL pelo MCP e salva a
#      saída num arquivo, uma linha por objeto.
#
#   2. confere-execucao.sh --compara ORDEM.md saida.txt
#      Compara o esperado, derivado do DDL da ordem, com o que veio do banco.
#      Sai 0 quando batem, 1 quando divergem, e imprime as duas listas.
#
# O SQL só lê catálogo do sistema: pg_class, pg_attribute, pg_constraint,
# pg_index e pg_trigger. Nada de information_schema, que filtra por privilégio
# do papel corrente e devolve zero linha sem provar nada (DDP-121).
#
# O que ele confere: coluna (nome, tipo, nulidade, default), chave primária,
# chave estrangeira, unicidade (distinguindo NULLS NOT DISTINCT), CHECK,
# índice e trigger. Restrição escrita dentro do CREATE TABLE é comparada por
# tipo mais lista ordenada de colunas, porque o nome dela é gerado pelo
# Postgres e o DDL da ordem não o conhece.
#
# LACUNA DECLARADA: ele NÃO confere o corpo de um CHECK nem a tabela de
# destino de uma chave estrangeira. Uma FK na coluna certa, apontando para a
# tabela errada, passa. Fechar isso pede o conteúdo de confrelid e de
# pg_get_constraintdef, e a comparação com o texto do DDL é frágil o bastante
# para merecer issue própria.
set -eu

modo=${1:-}
ordem=${2:-}
saida=${3:-}

case "$modo" in
--sql)   [ -n "$ordem" ] || { echo "uso: confere-execucao.sh --sql ORDEM.md" >&2; exit 2; } ;;
--compara)
  [ -n "$ordem" ] && [ -n "$saida" ] || { echo "uso: confere-execucao.sh --compara ORDEM.md saida.txt" >&2; exit 2; }
  [ -f "$saida" ] || { echo "ERRO: saída do banco não encontrada em $saida" >&2; exit 2; } ;;
*)
  echo "uso: confere-execucao.sh --sql ORDEM.md" >&2
  echo "     confere-execucao.sh --compara ORDEM.md saida.txt" >&2
  exit 2 ;;
esac
[ -f "$ordem" ] || { echo "ERRO: ordem não encontrada em $ordem" >&2; exit 2; }

export modo ordem saida

python3 <<'PYEOF'
import os, re, sys

modo = os.environ["modo"]
texto = open(os.environ["ordem"], encoding="utf-8").read()

# O bloco da migração é o primeiro bloco cercado que cria objeto. O segundo
# bloco de toda ordem é o roteiro de verificação, que não define schema.
blocos = re.findall(r"^```sql\s*$(.*?)^```\s*$", texto, re.S | re.M)
ddl = next((b for b in blocos if re.search(r"\bCREATE\s+(TABLE|TRIGGER)\b", b, re.I)), None)
if ddl is None:
    print("ERRO: nenhum bloco sql com CREATE TABLE ou CREATE TRIGGER em %s" % os.environ["ordem"], file=sys.stderr)
    sys.exit(2)

# Apelidos que o DDL usa e format_type() do Postgres devolve por extenso.
TIPOS = {
    "timestamptz": "timestamp with time zone",
    "timestamp":   "timestamp without time zone",
    "bool":        "boolean",
    "int":         "integer",
    "int4":        "integer",
    "int8":        "bigint",
    "int2":        "smallint",
    "varchar":     "character varying",
}

def tipo(t):
    t = t.strip().lower()
    return TIPOS.get(t, t)

def normaliza_default(d):
    # O catálogo devolve o default com cast explícito e às vezes com o schema
    # na frente. Comparar sem normalizar produziria divergência em toda linha,
    # que é falso positivo, e falso positivo treina a ignorar o script.
    if d is None:
        return ""
    d = d.strip()
    d = re.sub(r"::[a-z_ ]+(\[\])?", "", d, flags=re.I)   # tira ::text, ::numeric
    d = re.sub(r"\bpg_catalog\.", "", d, flags=re.I)
    d = re.sub(r"\s+", " ", d)
    return d.strip().lower()

# Palavras que abrem uma restrição de tabela, não uma coluna.
RESTRICAO = re.compile(r"^\s*(PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY|CONSTRAINT|EXCLUDE)\b", re.I)

esperado = []

# Restrição declarada dentro do CREATE TABLE não tem nome no DDL: o Postgres
# gera um (spaces_workspace_id_slug_key). Casar por nome seria impossível, e
# ignorá-la deixa o script verde com um sistema errado. Medido em 2026-09-20:
# apagar o índice UNIQUE de content.spaces da saída do banco não produzia
# divergência nenhuma, e é justamente o UNIQUE NULLS NOT DISTINCT de
# content.pages que a DEC-0014 decidiu. Por isso a comparação é por tipo mais
# lista ordenada de colunas, não por nome.
def restricao(tipo_, tabela, colunas):
    esperado.append("%s|%s|%s" % (tipo_, tabela.lower(),
                                  ",".join(c.strip().lower() for c in colunas)))

criadas = []

for tabela, corpo in re.findall(r"CREATE\s+TABLE\s+([\w.]+)\s*\((.*?)\n\s*\)\s*;", ddl, re.S | re.I):
    criadas.append(tabela.lower())
    # O comentário sai ANTES de separar por vírgula. Medido em 2026-09-20 na
    # conferência da S1c1: o comentário "-- cache de leitura, sempre derivável"
    # tem vírgula de topo, o separador partia a linha dentro dele, e o resto do
    # comentário virava uma coluna inventada chamada "pode".
    corpo = re.sub(r"--.*$", "", corpo, flags=re.M)
    # Quebra por vírgula de topo: vírgula dentro de parêntese pertence a um
    # CHECK ou a uma lista de colunas, não separa definição.
    partes, nivel, atual = [], 0, ""
    for ch in corpo:
        if ch == "(":
            nivel += 1
        elif ch == ")":
            nivel -= 1
        if ch == "," and nivel == 0:
            partes.append(atual); atual = ""
        else:
            atual += ch
    partes.append(atual)

    for parte in partes:
        linha = parte.strip()
        if not linha:
            continue
        if RESTRICAO.match(linha):
            # Restrição no nível da tabela.
            m = re.match(r"^\s*PRIMARY\s+KEY\s*\((.*?)\)", linha, re.I | re.S)
            if m:
                restricao("pk", tabela, m.group(1).split(","))
                continue
            m = re.match(r"^\s*UNIQUE\s+NULLS\s+NOT\s+DISTINCT\s*\((.*?)\)", linha, re.I | re.S)
            if m:
                restricao("unique_nnd", tabela, m.group(1).split(","))
                continue
            m = re.match(r"^\s*UNIQUE\s*\((.*?)\)", linha, re.I | re.S)
            if m:
                restricao("unique", tabela, m.group(1).split(","))
                continue
            continue
        m = re.match(r"^([a-z_][\w]*)\s+([a-z][\w ]*?)(?=\s|$)", linha, re.I)
        if not m:
            continue
        nome, t = m.group(1), tipo(m.group(2))
        notnull = "t" if re.search(r"\bNOT\s+NULL\b", linha, re.I) else "f"
        if re.search(r"\bPRIMARY\s+KEY\b", linha, re.I):
            notnull = "t"          # PRIMARY KEY implica NOT NULL no catálogo
        if re.search(r"\bGENERATED\s+ALWAYS\s+AS\s+IDENTITY\b", linha, re.I):
            notnull = "t"
        d = re.search(r"\bDEFAULT\s+(.+?)(?=\s+(?:NOT\s+NULL|REFERENCES|CHECK|PRIMARY|UNIQUE)\b|$)", linha, re.I)
        esperado.append("coluna|%s|%s|%s|%s|%s" % (
            tabela.lower(), nome.lower(), t, notnull,
            normaliza_default(d.group(1) if d else None)))

        # Restrição escrita na própria coluna.
        if re.search(r"\bPRIMARY\s+KEY\b", linha, re.I):
            restricao("pk", tabela, [nome])
        if re.search(r"\bUNIQUE\b", linha, re.I):
            restricao("unique", tabela, [nome])
        if re.search(r"\bREFERENCES\b", linha, re.I):
            restricao("fk", tabela, [nome])
        if re.search(r"\bCHECK\b", linha, re.I):
            restricao("check", tabela, [nome])

for nome, tabela in re.findall(r"CREATE\s+(?:UNIQUE\s+)?INDEX\s+([\w]+)\s+ON\s+([\w.]+)", ddl, re.I):
    esperado.append("indice|%s|%s" % (tabela.lower(), nome.lower()))

for nome, tabela in re.findall(r"CREATE\s+TRIGGER\s+([\w]+)\s+.*?\bON\s+([\w.]+)", ddl, re.S | re.I):
    esperado.append("trigger|%s|%s" % (tabela.lower(), nome.lower()))

for tabela, nome, cols in re.findall(
        r"ALTER\s+TABLE\s+([\w.]+)\s+ADD\s+CONSTRAINT\s+([\w]+)\s+FOREIGN\s+KEY\s*\((.*?)\)", ddl, re.S | re.I):
    esperado.append("constraint|%s|%s" % (tabela.lower(), nome.lower()))
    restricao("fk", tabela, cols.split(","))

esperado = sorted(set(esperado))
tabelas = sorted({l.split("|")[1] for l in esperado})

if modo == "--sql":
    lista = ", ".join("'%s'::regclass" % t for t in tabelas)
    print("""-- Conferência da execução, gerada por confere-execucao.sh a partir de
-- %s
-- Só catálogo do sistema. Nada de information_schema (DDP-121).
-- Rode e salve a saída num arquivo, uma linha por objeto.

WITH alvo AS (SELECT unnest(ARRAY[%s]) AS oid)
SELECT 'coluna|' || c.oid::regclass::text || '|' || a.attname || '|'
       || format_type(a.atttypid, a.atttypmod) || '|'
       || CASE WHEN a.attnotnull THEN 't' ELSE 'f' END || '|'
       || lower(regexp_replace(
            coalesce(pg_get_expr(d.adbin, d.adrelid), ''),
            '::[a-z_ ]+', '', 'gi')) AS linha
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
 WHERE c.oid IN (SELECT oid FROM alvo) AND a.attnum > 0 AND NOT a.attisdropped
UNION ALL
-- Restrição por tipo e lista ordenada de colunas. O nome fica de fora porque
-- restrição escrita dentro do CREATE TABLE é batizada pelo Postgres, e o DDL
-- da ordem não o conhece.
SELECT CASE con.contype
         WHEN 'p' THEN 'pk'
         WHEN 'f' THEN 'fk'
         WHEN 'c' THEN 'check'
         WHEN 'u' THEN CASE WHEN i.indnullsnotdistinct THEN 'unique_nnd' ELSE 'unique' END
       END
       || '|' || con.conrelid::regclass::text || '|'
       || coalesce((SELECT string_agg(att.attname, ',' ORDER BY k.ord)
                      FROM unnest(con.conkey) WITH ORDINALITY AS k(num, ord)
                      JOIN pg_attribute att
                        ON att.attrelid = con.conrelid AND att.attnum = k.num), '')
  FROM pg_constraint con
  LEFT JOIN pg_index i ON i.indexrelid = con.conindid
 WHERE con.conrelid IN (SELECT oid FROM alvo) AND con.contype IN ('p','f','c','u')
UNION ALL
-- Índice que não serve de apoio a restrição. O índice que apoia um UNIQUE já
-- foi contado na linha de cima, e contá-lo duas vezes criaria divergência
-- inventada contra uma ordem que não escreve CREATE INDEX para ele.
SELECT 'indice|' || i.indrelid::regclass::text || '|' || ic.relname
  FROM pg_index i JOIN pg_class ic ON ic.oid = i.indexrelid
 WHERE i.indrelid IN (SELECT oid FROM alvo) AND NOT i.indisprimary
   AND NOT EXISTS (SELECT 1 FROM pg_constraint c2 WHERE c2.conindid = i.indexrelid)
UNION ALL
SELECT 'trigger|' || t.tgrelid::regclass::text || '|' || t.tgname
  FROM pg_trigger t
 WHERE t.tgrelid IN (SELECT oid FROM alvo) AND NOT t.tgisinternal
UNION ALL
SELECT 'constraint|' || con.conrelid::regclass::text || '|' || con.conname
  FROM pg_constraint con
 WHERE con.conrelid IN (SELECT oid FROM alvo)
 ORDER BY 1;""" % (os.environ["ordem"], lista))
    sys.exit(0)

# --compara
bruto = open(os.environ["saida"], encoding="utf-8").read()
real = set()
for l in bruto.splitlines():
    l = l.strip()
    # Só um par de aspas duplas em volta da linha inteira sai, que é como
    # cliente de CSV embrulha o campo. Arrancar aspa solta do fim comeria a
    # aspa de fechamento de um default como 'Sem título', e a divergência
    # inventada apareceria em toda coluna com default de texto. Medido.
    if len(l) > 1 and l[0] == '"' and l[-1] == '"':
        l = l[1:-1]
    if l.count("|") >= 2 and l.split("|")[0] in (
            "coluna", "indice", "trigger", "constraint",
            "pk", "fk", "check", "unique", "unique_nnd"):
        real.add(l.lower())

# Duas regras diferentes, por uma razão medida.
#
# Para coluna, restrição por colunas, índice e trigger a comparação é de
# conjunto: o que o banco tem a mais também é divergência, porque a ordem é a
# descrição completa do que ela cria.
#
# Para constraint batizada a regra é só de presença. O banco carrega dezenas
# de nomes gerados pelo Postgres que a ordem nunca escreve, e cobrar igualdade
# ali acusaria o sistema correto.
EXATOS = {"coluna", "pk", "fk", "check", "unique", "unique_nnd", "indice", "trigger"}

esperado_exato = {l for l in esperado if l.split("|")[0] in EXATOS}
esperado_nomes = {l for l in esperado if l.split("|")[0] == "constraint"}

# Tabela que a ordem só altera entra na comparação apenas pelo que a ordem
# diz dela. A S1c1 faz ALTER TABLE content.pages para fechar uma constraint, e
# não descreve as colunas dessa tabela: cobrá-las acusaria o sistema correto,
# que é a falha que este projeto persegue desde a primeira conferência.
real_exato = {l for l in real
              if l.split("|")[0] in EXATOS
              and (l.split("|")[1] in criadas
                   or l in esperado_exato)}
real_nomes = {l for l in real if l.split("|")[0] == "constraint"}

faltam = sorted((esperado_exato - real_exato) | (esperado_nomes - real_nomes))
sobram = sorted(real_exato - esperado_exato)

if not faltam and not sobram:
    print("Execução confere: %d objeto(s) do DDL batem com o catálogo." % len(esperado))
    sys.exit(0)

print("DIVERGÊNCIA entre a ordem e o banco.\n")
for l in faltam:
    print("  a ordem pede e o banco não tem:  %s" % l)
for l in sobram:
    print("  o banco tem e a ordem não pede:  %s" % l)
print("\nOrdem: %s" % os.environ["ordem"])
sys.exit(1)
PYEOF
