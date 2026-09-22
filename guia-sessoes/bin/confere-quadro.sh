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

raiz="$(cd "$(dirname "$0")/../.." && pwd)"

export JIRA_EMAIL JIRA_TOKEN site recentes raiz

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
VIGIADA = ('project = DDP AND ((status in ("BLOQUEADA", "EM REVISÃO") '
           'AND (labels is EMPTY OR labels not in ("bloqueio-externo"))) '
           'OR (status = "EM ANDAMENTO" AND labels = "humano"))')
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
# Os checks 2 e 3 olham texto publicado, e o texto mais longo da sessão A é o
# comentário de fechamento, escrito imediatamente antes de mover a issue para
# CONCLUÍDA. Filtrar por status aberto deixava esses comentários fora de toda
# conferência. Achado em DDP-150, cujo monospace mal fechado passou verde.
recentes_l = busca('project = DDP ORDER BY updated DESC',
                   "key,summary,description,comment", limit=N)
# Lista completa, paginada. Com limit fixo, toda chave acima do limite parecia
# inexistente: em 2026-09-21 o projeto passou de 200 issues e a DDP-243, que
# existe, foi acusada de fantasma. O check reprovava um quadro correto.
def todas_as_chaves():
    from urllib.parse import quote
    chaves, token = set(), None
    while True:
        p = (f"/rest/api/2/search/jql?jql={quote('project = DDP ORDER BY key ASC')}"
             f"&fields=key&maxResults=100")
        if token:
            p += "&nextPageToken=" + quote(token)
        d = get(p)
        chaves |= {i["key"] for i in d.get("issues", [])}
        token = d.get("nextPageToken")
        if d.get("isLast", True) or not token:
            return chaves
existentes = todas_as_chaves()
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
              ("{{", "monospace {{...}} que não renderizou. Causa quase sempre: chave dentro do conteúdo, como um trecho de código com objeto. Use {noformat} ou {code} para qualquer coisa que tenha chave"),
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
        # Monospace mal fechado não vaza {{: ele renderiza e engole o resto do
        # parágrafo. O rastro é chave solta dentro do <tt>. Pego em DDP-150,
        # onde {{DEC-0022}] passou verde pelo teste acima.
        if any(re.search(r"[{}]", m) for m in re.findall(r"<tt>(.*?)</tt>", html, re.S)):
            vazou.append("monospace mal fechado, com chave solta dentro do <tt>")
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
for i in busca('project = DDP AND labels = "humano" AND status = "AGUARDANDO APROVAÇÃO"',
               "key,summary,description"):
    t = i["fields"].get("description") or ""
    if OPCOES.search(t) and not re.search(r"recomend", t, re.I):
        achados.append((i["key"],
            'é aprovação com mais de uma opção e não nomeia a recomendada. '
            'Arrastar o cartão não vai dizer qual foi escolhida.'))

# --------------------------------------------------------------------------
# 4b. Issue que espera o humano sem o rótulo `humano`.
#    Pedido do humano em 2026-09-22: todo cartão que espera aprovação,
#    resposta, conferência no preview ou tarefa manual dele leva o rótulo
#    `humano`, que é o filtro que ele usa para achar o que é dele.
for i in busca('project = DDP AND status != "CONCLUÍDA" AND labels = "humano" AND labels != "humano"',
               "key,summary"):
    achados.append((i["key"], 'espera o humano e não tem o rótulo humano. Acrescente o rótulo.'))

# --------------------------------------------------------------------------
# 4c. Coluna FAZER DEPLOY (DEC-0042): só card app-release com rótulo humano
#    fica lá, e card app-release pronto para o humano não fica em
#    AGUARDANDO APROVAÇÃO.
for i in busca('project = DDP AND status = "FAZER DEPLOY" AND (labels != "humano" OR labels != "app-release" OR labels is EMPTY)',
               "key,summary"):
    achados.append((i["key"], 'está em FAZER DEPLOY sem os rótulos humano e app-release. Essa coluna é só para publicação e migração que o humano executa (DEC-0042).'))
for i in busca('project = DDP AND status = "AGUARDANDO APROVAÇÃO" AND labels = "app-release" AND labels = "humano"',
               "key,summary"):
    achados.append((i["key"], 'é app-release esperando o humano e está em AGUARDANDO APROVAÇÃO. Publicação e migração vão para FAZER DEPLOY (DEC-0042).'))

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

# --------------------------------------------------------------------------
# 6. Ordem versionada acima do teto de 10.000 bytes.
#    Defeito medido em 2026-09-20: o teto da S1c foi descoberto na mão, depois
#    de a ordem já estar escrita, e a sub-fatia teve de ser partida em duas
#    (DEC-0015). Na volta da revisão a ordem da S1c1 estourou de novo ao
#    absorver as correções. Nada media isso.
#
# 7. information_schema dentro de bloco SQL executável.
#    DDP-121: as views filtram por privilégio do papel corrente, então uma
#    tabela que existe some da resposta quando o papel não tem direito sobre
#    ela. O roteiro fica verde sem provar nada. Os catálogos do sistema
#    (pg_class, pg_constraint, pg_index, pg_trigger) carregam GRANT SELECT
#    para PUBLIC e não têm esse problema.
#
#    Menção em prosa que PROÍBE o uso não conta, e por isso a checagem lê só
#    o interior dos blocos cercados por crase tripla. A ordem da S1c1 escreve
#    "SQL puro, sem information_schema" fora de bloco: um grep ingênuo
#    reprovaria o sistema correto.
#
# As duas checagens pulam as ordens já executadas. Achado que ninguém pode
# consertar deixa o script vermelho para sempre, e checagem que nunca alcança
# o verde ensina a ignorar a checagem. A lista abaixo está fechada: ordem
# nova só entra depois de despachada, quando já não pode ser corrigida, e
# com o erro que a deixou passar. Cada entrada diz por que está fora.
# --------------------------------------------------------------------------
HISTORICAS = {
    # Anteriores ao teto, que nasceu com a DEC-0015 em 2026-09-20.
    "ORDEM-F0-fundacao-content-format.md": "17.329 bytes, executada antes do teto existir",
    "ORDEM-F1-nucleo-content-format.md":   "40.392 bytes, executada antes do teto existir",
    "ORDEM-F3-uris-e-referencias.md":      "10.813 bytes, executada antes do teto existir",
    # Anterior à DDP-121, que descobriu o falso-negativo do information_schema.
    "ORDEM-S1b-spaces-e-pages.md":         "usa information_schema, aplicada antes da DDP-121",
    # Despachada acima do teto por erro da sessão A em 2026-09-21: o roteiro de
    # verificação, acrescentado na revisão, levou a ordem a 10.319 bytes, e a
    # conferência não rodou antes do envio. Depois de despachada não se corta.
    "ORDEM-DDP297-pastas-de-diagrama.md":  "10.319 bytes, despachada sem rodar a conferência (DDP-311)",
}

TETO = 10000

# --------------------------------------------------------------------------
# 8. Issue que pede aprovação sem fazer pergunta. Defeito medido em
#    2026-09-20: DDP-140, DDP-141 e DDP-142 nasceram afirmando e propondo,
#    sem uma linha pedindo decisão. O humano então precisa adivinhar o que o
#    arraste do cartão significa, e o gesto de aprovar perde o sentido.
#    O sinal é a seção "A pergunta" na descrição, não num comentário: quem
#    abre o cartão pela primeira vez lê a descrição.
# --------------------------------------------------------------------------
PEDE = ('project = DDP AND labels = "humano" '
        'AND status != "CONCLUÍDA"')
for i in busca(PEDE, "key,summary,description"):
    desc = i["fields"].get("description") or ""
    if not re.search(r"^h[1-6]\.\s*A pergunta\s*$", desc, re.M):
        achados.append((i["key"],
            "pede aprovação humana e não tem seção \"A pergunta\" na descrição. "
            "Cartão que só afirma obriga o humano a adivinhar o que o arraste "
            "aprova. Escreva a pergunta cuja resposta muda o trabalho."))

import pathlib
dir_ordens = pathlib.Path(os.environ["raiz"]) / "adrs" / "_work" / "ordens"
for arq in sorted(dir_ordens.glob("*.md")):
    if arq.name in HISTORICAS:
        continue
    bruto = arq.read_bytes()
    if len(bruto) > TETO:
        achados.append((arq.name,
            "tem %d bytes e o teto da ordem é %d. Parta a sub-fatia, ou corte prosa. "
            "Cada metade precisa deixar o schema consistente (DEC-0015)."
            % (len(bruto), TETO)))
    texto = bruto.decode("utf-8", "replace")
    # Só o interior dos blocos cercados. Fora deles a palavra pode estar
    # proibindo o uso, que é o certo.
    dentro = re.findall(r"^```.*?$(.*?)^```\s*$", texto, re.S | re.M)
    if any("information_schema" in b for b in dentro):
        achados.append((arq.name,
            "usa information_schema dentro de bloco SQL. Ele filtra por privilégio "
            "e devolve zero linha sem provar nada (DDP-121). Use pg_class, "
            "pg_constraint, pg_index ou pg_trigger."))

# --------------------------------------------------------------------------
# 9. Rastro entre o recorte e as ordens. Nenhum comando respondia qual decisão
#    do ADR nenhuma ordem implementou: a ordem citava a fatia em prosa, e prosa
#    não é consultável (DDP-127). Cada bloco do recorte tem id estável e cada
#    ordem declara os ids que implementa.
#
#    Só reprova o que é defeito: ordem sem declaração, e ordem citando id que
#    não existe. Bloco sem ordem é inventário do que falta, e sai como nota:
#    um check sempre vermelho é um check que ninguém lê.
# --------------------------------------------------------------------------
notas = []
arq_recorte = pathlib.Path(os.environ["raiz"]) / "adrs" / "_work" / "RECORTE-S1-ADR-003.md"
if arq_recorte.exists():
    ids_recorte = set(re.findall(r"`(S1-B\d+)`", arq_recorte.read_text(encoding="utf-8")))
    cobertos = set()
    for arq in sorted(dir_ordens.glob("ORDEM-S1*.md")):
        texto = arq.read_text(encoding="utf-8")
        decl = re.search(r"^\*\*Blocos do recorte:\*\*\s*(.+)$", texto, re.M)
        if not decl:
            achados.append((arq.name,
                "não declara quais blocos do recorte implementa. Ponha "
                "'**Blocos do recorte:** `S1-Bn`' logo abaixo do título, ou "
                "'nenhum' com a razão, quando o DDL não vier do recorte."))
            continue
        citados = set(re.findall(r"S1-B\d+", decl.group(1)))
        fantasmas = sorted(c for c in citados if c not in ids_recorte)
        if fantasmas:
            achados.append((arq.name,
                "declara bloco que não existe no recorte: %s" % ", ".join(fantasmas)))
        cobertos |= citados
    faltam = sorted(ids_recorte - cobertos, key=lambda s: int(s.split("B")[1]))
    if faltam:
        notas.append("Blocos do recorte S1 ainda sem ordem: %s" % ", ".join(faltam))

# --------------------------------------------------------------------------
# Pendência do humano fora do quadro (DDP-131). A DDP-66 e a DDP-75 fecharam
# com linhas por colar em insumos/ORDEM.md, e nada lembrava delas. Issue aberta
# com acao-humana ou bloqueio-externo sai aqui como aviso, nunca como achado:
# o bloqueio é do humano, e reprová-lo deixaria a conferência vermelha para
# sempre. Some sozinha quando a issue fecha.
# --------------------------------------------------------------------------
HUMANO = ('project = DDP AND status != "CONCLUÍDA" '
          'AND labels in ("acao-humana", "bloqueio-externo") ORDER BY key ASC')
esperando = busca(HUMANO, "key,summary,labels")
if esperando:
    notas.append("Esperando o humano, fora do quadro:")
    for i in esperando:
        tipo = "permissão" if "bloqueio-externo" in i["fields"]["labels"] else "arquivo"
        notas.append("  %s (%s) %s" % (i["key"], tipo, i["fields"]["summary"][:70]))

if notas:
    print("Avisos:")
    for n in notas:
        print("  " + n)
    print("")

if achados:
    print("ATENÇÃO: a conferência do quadro achou %d problema(s).\n" % len(achados))
    for k, m in achados:
        print(f"  {k}: {m}")
    print("\nCada um destes corresponde a um defeito já cometido, com regra no PROTOCOLO.md.")
    sys.exit(1)
print("Conferência do quadro: limpa.")
PYEOF
