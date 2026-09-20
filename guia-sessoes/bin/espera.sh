#!/usr/bin/env bash
# Espera N segundos e termina. Serve de relógio do ciclo de escuta desde que a
# comunicação passou para o Jira (DEC-0009): não há mais arquivo para observar,
# então a sessão espera aqui e consulta o Jira por JQL a cada volta.
# Uso: espera.sh [segundos]   (padrão 540)
# Chamar pelo Bash com run_in_background: a sessão é reinvocada quando o comando
# termina, sem prender a conversa.
set -eu
segundos=${1:-540}
sleep "$segundos"
printf 'TICK %s\n' "$(date +%Y-%m-%dT%H:%M:%S)"
