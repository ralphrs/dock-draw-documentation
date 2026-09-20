#!/usr/bin/env bash
# Reprova, por máquina, os defeitos de processo que a sessão A já cometeu.
#
# Cada checagem aqui nasceu de um defeito medido, não de uma precaução. A regra
# equivalente existe em prosa no PROTOCOLO.md, e prosa só funciona se alguém
# lembrar de ler. Este script é o mecanismo que a prosa não tem.
#
# Uso: confere-quadro.sh [quantas_issues_recentes]
# Saída: 0 quando limpo, 1 quando achou algo. O texto vai para stdout.
#
# Credencial: ~/.config/dokdraw/jira.env, sobrescrita por DOKDRAW_JIRA_ENV.
set -eu

cred=${DOKDRAW_JIRA_ENV:-$HOME/.config/dokdraw/jira.env}
[ -f "$cred" ] || { echo "ERRO: credencial não encontrada em $cred" >&2; exit 2; }
# shellcheck disable=SC1090
. "$cred"
: "${JIRA_EMAIL:?}" "${JIRA_TOKEN:?}"

site=${JIRA_SITE:-https://dokdrawapp.atlassian.net}
recentes=${1:-12}

export JIRA_EMAIL JIRA_TOKEN site recentes

python3 <<'PYEOF'
import os, re, json, urllib.request, base64, sys

site = os.environ["site"]
auth = base64.b64encode(f'{os.environ["JIRA_EMAIL"]}:{os.environ["JIRA_TOKEN"]}'.encode()).decode()
N = int(os.environ["recentes"])

def get(path):
    req = urllib.request.Request(site + path, headers={"Authorization": "Basic " + auth})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def busca(jql, fields, expand="", limit=50):
    from urllib.parse import quote
    p = f"/rest/api/2/search/jql?jql={quote(jql)}&fields={quote(fields)}&maxResults={limit}"
    if expand:
        p += "&expand=" + quote(expand)
    return get(p).get("issues", [])

achados = []

# --------------------------------------------------------------------------
# 1. Issue tratada pela sessão A e deixada num status que a JQL dela vigia.
#    Defeito medido quatro vezes em 2026-09-20. Cada ocorrência queimou um
#    ciclo inteiro de escuta com trabalho que a própria sessão acabou de fazer.
#    Sinal preciso: o último comentário é da sessão A e começa por "Sessão A:".
# --------------------------------------------------------------------------
VIGIADA = ('project = DDP AND (status in ("BLOQUEADA", "EM REVISÃO") '
           'OR (status = "EM ANDAMENTO" AND labels in ("aprovacao-humana", "revisao-humana")))')
for i in busca(VIGIADA, "key,summary,status,comment"):
    cs = (i["fields"].get("comment") or {}).get("comments") or []
    if cs and cs[-1]["body"].strip().startswith("Sessão A:"):
        achados.append((i["key"],
            f'está em {i["fields"]["status"]["name"]}, que a JQL da sessão A vigia, '
            f'e o último comentário é da própria sessão A. '
            f'Ela vai se acordar sozinha no próximo tique sem trabalho novo.'))

# --------------------------------------------------------------------------
# 2. Chave de issue citada antes de a issue existir.
#    Defeito medido duas vezes em 2026-09-20. Manda o leitor para a issue errada,
#    porque a numeração do Jira segue e a chave acaba pertencendo a outra coisa.
# --------------------------------------------------------------------------
# Issue fechada fica de fora das checagens de texto de propósito. Ninguém vai
# agir nela, e achado que não se pode consertar deixa o script vermelho para
# sempre. Checagem que nunca alcança o verde ensina a ignorar a checagem.
recentes_l = busca('project = DDP AND status != "CONCLUÍDA" ORDER BY updated DESC',
                   "key,summary,description,comment", limit=N)
existentes = {i["key"] for i in busca("project = DDP ORDER BY key ASC", "key", limit=200)}
for i in recentes_l:
    textos = [i["fields"].get("description") or ""]
    textos += [c["body"] for c in ((i["fields"].get("comment") or {}).get("comments") or [])]
    citadas = set()
    for t in textos:
        citadas |= set(re.findall(r"\bDDP-\d+\b", t))
    fantasmas = sorted(c for c in citadas if c not in existentes)
    if fantasmas:
        achados.append((i["key"], f'cita issue que não existe: {", ".join(fantasmas)}'))

# --------------------------------------------------------------------------
# 3. Texto publicado no formato errado para o caminho de escrita.
#    O conector MCP converte Markdown; curl na REST v2 espera wiki markup.
#    Escrever no formato do caminho errado corrompe em silêncio: o campo cru
#    guarda o que foi enviado e só o renderizado mostra o que o leitor recebe.
#    Marcador dentro de <pre>/<code>/<tt> é literal de propósito e não conta.
# --------------------------------------------------------------------------
LIMPA = re.compile(r"<(pre|code|tt)\b.*?</\1>", re.S | re.I)
MARCADORES = [("{code", "macro {code} que não abriu"),
              ("{{", "monospace {{...}} que não renderizou"),
              ("`", "crase de Markdown que não virou código")]
for i in recentes_l:
    d = get(f'/rest/api/2/issue/{i["key"]}?expand=renderedFields&fields=description,comment')
    rf = d.get("renderedFields") or {}
    partes = [("descrição", rf.get("description") or "")]
    partes += [(f'comentário {n+1}', c["body"])
               for n, c in enumerate(((rf.get("comment") or {}).get("comments") or []))]
    for onde, html in partes:
        nu = LIMPA.sub("", html)
        vazou = [nome for m, nome in MARCADORES if m in nu]
        if re.search(r"(^|>)\s*##\s", nu):
            vazou.append("## de Markdown que não virou cabeçalho")
        if vazou:
            achados.append((i["key"], f'{onde} renderizou com {"; ".join(vazou)}'))

# --------------------------------------------------------------------------
# 4. Issue de aprovação que oferece opções sem nomear a recomendada.
#    Aprovar é arrastar o cartão, e arrastar carrega um bit. A DDP-110 voltou
#    movida e sem comentário porque o gesto não tinha destino definido.
# --------------------------------------------------------------------------
OPCOES = re.compile(r"\b(sa[ií]da|op[çc][ãa]o|alternativa)\s*[2-9]\b", re.I)
for i in busca('project = DDP AND labels = "aprovacao-humana" AND status = "AGUARDANDO APROVAÇÃO"',
               "key,summary,description"):
    t = i["fields"].get("description") or ""
    if OPCOES.search(t) and not re.search(r"recomend", t, re.I):
        achados.append((i["key"],
            'é aprovação com mais de uma opção e não nomeia a recomendada. '
            'Arrastar o cartão não vai dizer qual foi escolhida.'))

# --------------------------------------------------------------------------
# 5. Emenda que muda o entregável deixada só em comentário.
#    Defeito medido em 2026-09-20: a sessão A mandou por comentário a coluna
#    workspace_id de space_members, a sessão B entregou sem ela, e o ciclo se
#    repetiu. Comentário não viaja com a descrição, e quem executa lê a
#    descrição. É a mesma regra que a sessão A aplica em revisão de ordem,
#    violada na direção contrária.
#    Sinal: último comentário é da sessão A, traz bloco de código, e o
#    changelog não registra mudança de descrição depois dele.
# --------------------------------------------------------------------------
def blocos_de_codigo(t):
    """Conteúdo dos blocos de código, em wiki markup e em Markdown."""
    return (re.findall(r"\{code(?::[^}]*)?\}(.*?)\{code\}", t, re.S)
            + re.findall(r"```[a-z]*\n(.*?)```", t, re.S))

def linhas_uteis(bloco):
    return [l.strip() for l in bloco.splitlines() if len(l.strip()) > 3]

ABERTA = ('project = DDP AND status in ("A FAZER", "EM ANDAMENTO") '
          'AND assignee is not EMPTY')
for i in busca(ABERTA, "key,summary,description,comment"):
    cs = (i["fields"].get("comment") or {}).get("comments") or []
    if not cs:
        continue
    ult = cs[-1]
    if not ult["body"].strip().startswith("Sessão A:"):
        continue
    desc = i["fields"].get("description") or ""
    # Só é emenda perdida o bloco de código do comentário cujo conteúdo não
    # está na descrição. Repetir na descrição e no comentário é o caminho
    # certo, e um script que reprovasse isso reprovaria o sistema correto.
    orfaos = []
    for bloco in blocos_de_codigo(ult["body"]):
        uteis = linhas_uteis(bloco)
        if uteis and not all(l in desc for l in uteis):
            orfaos.append(uteis[0][:60])
    if orfaos:
        achados.append((i["key"],
            'tem emenda da sessão A só em comentário, fora da descrição: '
            + '; '.join(orfaos)
            + '. Quem executa lê a descrição, não o comentário.'))

if achados:
    print("ATENÇÃO: a conferência do quadro achou %d problema(s).\n" % len(achados))
    for k, m in achados:
        print(f"  {k}: {m}")
    print("\nCada um destes corresponde a um defeito já cometido, com regra no PROTOCOLO.md.")
    sys.exit(1)
print("Conferência do quadro: limpa.")
PYEOF
