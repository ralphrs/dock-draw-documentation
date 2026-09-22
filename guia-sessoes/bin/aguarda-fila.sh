#!/usr/bin/env bash
# Espera até a fila de uma sessão ter trabalho no quadro DDP, e só então retorna.
#
# Substitui o par espera.sh + consulta JQL dentro da sessão. A diferença é onde a
# espera acontece: aqui ela é um laço de shell, fora do modelo. Enquanto a fila
# está vazia o custo é uma requisição HTTP por intervalo e zero token, porque a
# sessão continua bloqueada no comando em segundo plano. Ela só volta a pensar
# quando há trabalho de verdade, ou quando o limite estoura.
#
# Uso: aguarda-fila.sh <A|B|C> [intervalo_s] [limite_s]
#   intervalo padrão 60s, limite padrão 3600s.
#
# Credencial: um arquivo fora deste repositório, com JIRA_EMAIL e JIRA_TOKEN.
# Padrão ~/.config/dokdraw/jira.env, sobrescrito por DOKDRAW_JIRA_ENV.
# O token é criado em https://id.atlassian.com/manage-profile/security/api-tokens
set -eu

cred=${DOKDRAW_JIRA_ENV:-$HOME/.config/dokdraw/jira.env}
if [ ! -f "$cred" ]; then
  echo "ERRO: credencial não encontrada em $cred" >&2
  echo "Crie o arquivo com JIRA_EMAIL=<email> e JIRA_TOKEN=<api token>, com permissão 600." >&2
  exit 1
fi
# shellcheck disable=SC1090
. "$cred"
: "${JIRA_EMAIL:?JIRA_EMAIL não definido em $cred}"
: "${JIRA_TOKEN:?JIRA_TOKEN não definido em $cred}"

site=${JIRA_SITE:-https://dokdrawapp.atlassian.net}
sessao=${1:?uso: aguarda-fila.sh <A|B|C|D> [intervalo_s] [limite_s]}
intervalo=${2:-60}
limite=${3:-3600}

case "$sessao" in
  # A fila de A tem três entradas.
  #  1. BLOQUEADA e EM REVISÃO: dúvida e entrega das outras sessões.
  #     Menos o que tem bloqueio-externo: parado por algo que só o humano
  #     destrava, e acordar por isso a cada ciclo é ruído.
  #  2. Aprovação já respondida: o humano arrasta de AGUARDANDO APROVAÇÃO para EM
  #     ANDAMENTO, e o rótulo separa essas do trabalho corrente de B e de C.
  #  3. Pedido do humano pronto para refino: rótulo liberada. O rótulo draft não
  #     entra aqui de propósito, porque significa que ele ainda está escrevendo.
  # Card fechado que volta para EM ANDAMENTO é o humano pedindo algo novo num
  # card velho. Em 2026-09-21 o pedido dos 24 tipos chegou assim na DDP-184 e
  # ficou 25 minutos sem ser visto, porque nenhum rótulo o punha na fila.
  A | a) jql='project = DDP AND ((status in ("BLOQUEADA", "EM REVISÃO") AND (labels is EMPTY OR labels not in ("bloqueio-externo"))) OR (status = "EM ANDAMENTO" AND labels in ("aprovacao-humana", "revisao-humana")) OR (status = "AGUARDANDO APROVAÇÃO" AND (labels is EMPTY OR labels not in ("humano", "aprovacao-humana"))) OR (labels = "liberada" AND labels != "draft" AND status != "CONCLUÍDA") OR (status = "EM ANDAMENTO" AND status changed FROM "CONCLUÍDA" AFTER -1d))' ;;
  B | b) jql='project = DDP AND assignee = "712020:ec30868f-8e34-4c25-97e2-cd920e5da679" AND status in ("A FAZER", "EM ANDAMENTO")' ;;
  C | c) jql='project = DDP AND assignee = "712020:6ac2f667-9728-4b07-bffb-eaa19704a4c9" AND status in ("A FAZER", "EM ANDAMENTO")' ;;
  # D não tem conta no Jira: a fila dela é o rótulo sessao-d.
  D | d) jql='project = DDP AND labels = "sessao-d" AND status in ("A FAZER", "EM ANDAMENTO")' ;;
  *)
    echo "ERRO: sessão '$sessao' não é A, B, C nem D" >&2
    exit 1
    ;;
esac

corpo=$(printf '%s' "$jql" | python3 -c 'import json,sys; print(json.dumps({"jql": sys.stdin.read()}))')

# A credencial é conferida antes do laço, e a conferência não é opcional.
# /rest/api/3/search/approximate-count responde {"count":0} com HTTP 200 mesmo
# sem autenticação válida, então uma credencial quebrada é indistinguível de uma
# fila vazia: a sessão esperaria para sempre por trabalho que ela nunca veria.
# /rest/api/3/myself distingue os dois casos, porque exige autenticação.
eu=$(curl -sS --max-time 30 -u "$JIRA_EMAIL:$JIRA_TOKEN" "$site/rest/api/3/myself" 2>/dev/null |
  python3 -c 'import json,sys
try:
    d = json.load(sys.stdin)
    print(d["accountId"] + " " + d.get("displayName", ""))
except Exception:
    print("")')
if [ -z "$eu" ]; then
  echo "ERRO: a credencial de $cred não autentica em $site." >&2
  echo "Confira JIRA_EMAIL e JIRA_TOKEN. O token é criado em https://id.atlassian.com/manage-profile/security/api-tokens" >&2
  exit 2
fi
printf 'Autenticado como %s. Escutando a fila da sessão %s a cada %ss, por até %ss.\n' "$eu" "$sessao" "$intervalo" "$limite" >&2

# A conferência do quadro roda aqui de propósito, e não num comando à parte.
# Toda regra de processo deste projeto nasceu de um defeito medido, e todas
# viviam só em prosa no PROTOCOLO.md, que depende de alguém lembrar de ler.
# Religar a escuta é o único ponto por onde a sessão A passa em todo ciclo,
# então é aqui que a conferência não pode ser esquecida: esquecê-la significa
# parar de escutar, que é parar de trabalhar.
#
# Ela não bloqueia a escuta. Um falso positivo que trave a fila custaria mais
# que o defeito que ela procura, e a saída aparece no mesmo lugar onde a sessão
# lê o motivo de ter acordado.
if [ "$sessao" = "A" ] || [ "$sessao" = "a" ]; then
  conferencia="$(dirname "$0")/confere-quadro.sh"
  if [ -x "$conferencia" ]; then
    "$conferencia" || true
  fi
fi

# Estoque de melhoria de processo, lido só quando a fila esvazia (DEC-0016).
#
# A regra de prioridade em tempo ocioso é: fila vigiada, depois desbloqueio de
# quem espera resposta de A, depois estoque processo, depois parar. Escrevê-la
# só no PROTOCOLO.md cometeria o defeito que a própria DEC-0016 nomeia: regra
# em prosa depende de alguém lembrar de ler. O script já conhece o estado da
# fila, então a prioridade sai daqui executável.
#
# Estoque não é fila. Estas issues nascem sem responsável e em A FAZER, que a
# JQL da sessão A não vigia, justamente para que a fila possa esvaziar de
# verdade. Fila que nunca esvazia apagaria o gatilho que faz isto rodar.
#
# Falha de rede aqui não é erro: o limite já foi atingido e a sessão vai
# acordar de todo jeito. Silêncio é melhor que travar a saída.
proxima() {
  # Uma sessão que já está rodando não relê o próprio prompt. Em 2026-09-21 a
  # sessão D passou por uma tarefa de prioridade porque a regra entrou no prompt
  # depois que ela começou. A escuta é o texto que ela lê a cada volta, então a
  # ordem certa sai daqui. Desde 2026-09-22 (DEC-0038) a ordem vale para toda
  # sessão e é a do quadro lido da direita para a esquerda: EM REVISÃO,
  # AGUARDANDO APROVAÇÃO, BLOQUEADA, EM ANDAMENTO, A FAZER. Dentro da coluna,
  # prioridade primeiro, depois a menor chave.
  curl -sS --max-time 20 -u "$JIRA_EMAIL:$JIRA_TOKEN" -G \
    --data-urlencode "jql=$jql ORDER BY key ASC" --data-urlencode 'fields=summary,labels,status' \
    --data-urlencode 'maxResults=100' "$site/rest/api/2/search/jql" 2>/dev/null |
    SESSAO="$sessao" python3 -c 'import json,sys,os
try:
    itens = json.load(sys.stdin).get("issues", [])
except Exception:
    itens = []
colunas = ["EM REVISÃO", "AGUARDANDO APROVAÇÃO", "BLOQUEADA", "EM ANDAMENTO", "A FAZER"]
def chave(i):
    st = i["fields"]["status"]["name"]
    col = colunas.index(st) if st in colunas else len(colunas)
    prio = 0 if "prioridade" in i["fields"]["labels"] else 1
    return (col, prio, int(i["key"].split("-")[1]))
ordem = sorted(itens, key=chave)
if ordem:
    s = os.environ.get("SESSAO", "?").upper()
    i = ordem[0]
    print("PRÓXIMA TAREFA DA SESSÃO %s: %s [%s] %s" % (s, i["key"], i["fields"]["status"]["name"], i["fields"]["summary"]))
    print("Fila na ordem do quadro, da direita para a esquerda (DEC-0038):")
    for i in ordem:
        print("  %s  [%s]  %s" % (i["key"], i["fields"]["status"]["name"], i["fields"]["summary"]))
    print("Leia a descrição inteira antes de começar: ela pode trazer correção da sessão A.")
    print("No comentário de resultado, nunca ponha chave dentro de monospace: use a macro de código.")
    if s == "D":
        print("Nunca mova card com o rótulo aprovacao-humana: só o humano e a sessão A movem esse card.")' || true
}

religue() {
  # A escuta morre em toda saída, e religá-la depende de alguém lembrar. Em
  # 2026-09-20 a sessão A esqueceu depois da DDP-139, despachou a DDP-146 e
  # ficou sem ouvir a volta. O lembrete vive aqui porque este é o único texto
  # que a sessão lê no instante exato em que a escuta acabou de cair.
  printf '\n>>> A ESCUTA CAIU. Religue agora, antes de qualquer outra coisa:\n'
  printf '>>>   %s %s %s %s\n' "$0" "$sessao" "$intervalo" "$limite"
}

estoque_processo() {
  jqlp='project = DDP AND labels = "processo" AND assignee IS EMPTY AND status = "A FAZER" ORDER BY key ASC'
  curl -sS --max-time 20 -u "$JIRA_EMAIL:$JIRA_TOKEN" -G \
    --data-urlencode "jql=$jqlp" \
    --data-urlencode 'fields=summary' \
    --data-urlencode 'maxResults=3' \
    "$site/rest/api/2/search/jql" 2>/dev/null |
    python3 -c 'import json,sys
try:
    d = json.load(sys.stdin)
    itens = d.get("issues", [])
except Exception:
    itens = []
if itens:
    print("ESTOQUE processo: os próximos da fila de melhoria. Prioridade em tempo ocioso, DEC-0016.")
    for i in itens:
        print("  %s  %s" % (i["key"], i["fields"]["summary"]))
    if not d.get("isLast", True):
        print("  (há mais, veja o rótulo processo em DDP-55)")' || true
}

conta() {
  resposta=$(curl -sS --max-time 30 -u "$JIRA_EMAIL:$JIRA_TOKEN" \
    -H 'Content-Type: application/json' \
    -w '\n%{http_code}' \
    -X POST "$site/rest/api/3/search/approximate-count" \
    -d "$corpo" 2>/dev/null)
  codigo=$(printf '%s' "$resposta" | tail -n 1)
  [ "$codigo" = "200" ] || { echo -1; return 0; }
  printf '%s' "$resposta" | sed '$d' | python3 -c 'import json,sys
try:
    print(int(json.load(sys.stdin)["count"]))
except Exception:
    print(-1)'
}

fim=$(($(date +%s) + limite))
falhas=0
while :; do
  n=$(conta || echo -1)
  case "$n" in
  '' | *[!0-9-]*) n=-1 ;;
  esac

  if [ "$n" -gt 0 ]; then
    printf 'FILA %s: %s issue(s) esperando, %s\n' "$sessao" "$n" "$(date +%Y-%m-%dT%H:%M:%S)"
    proxima
    case "$sessao" in
    B | b | C | c)
      # Sessão rodando não relê o próprio prompt, e a escuta é o texto que ela
      # lê a cada volta. Em 2026-09-21 a sessão C pôs chave em monospace em
      # dois comentários seguidos (DDP-305, DDP-307).
      echo "No comentário, nunca ponha chave dentro de monospace: trecho com chave vai na macro de código."
      ;;
    esac
    religue
    exit 0
  fi

  if [ "$n" -lt 0 ]; then
    falhas=$((falhas + 1))
    if [ "$falhas" -ge 5 ]; then
      printf 'ERRO: cinco consultas seguidas falharam. Confira a credencial em %s\n' "$cred" >&2
      religue
      exit 2
    fi
  else
    falhas=0
  fi

  if [ "$(date +%s)" -ge "$fim" ]; then
    printf 'LIMITE %s: %ss sem novidade na fila, %s\n' "$sessao" "$limite" "$(date +%Y-%m-%dT%H:%M:%S)"
    # Só a sessão A puxa estoque de processo, e só aqui: a fila está vazia por
    # definição, porque a saída com trabalho acontece antes, no bloco acima.
    if [ "$sessao" = "A" ] || [ "$sessao" = "a" ]; then
      estoque_processo
    fi
    religue
    exit 0
  fi
  sleep "$intervalo"
done
