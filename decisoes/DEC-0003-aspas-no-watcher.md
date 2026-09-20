# DEC-0003 — O comando de escuta passa os padrões entre aspas simples

- **Data:** 2026-09-19
- **Decidido por:** arquiteto (defeito de kit, não há alternativa de projeto)
- **Alcance:** as três sessões
- **Aplicado em:** `guia-sessoes/PROMPT-SESSAO-A.md`, `PROMPT-SESSAO-B.md`, `PROMPT-SESSAO-C.md`, `CONFIGURACAO.md`, `PROTOCOLO.md`

## Decisão

Todo padrão passado ao `wait-for.sh` vai entre aspas simples.

```
guia-sessoes/bin/wait-for.sh A 570 'tasks/questions:Q-*.md' 'tasks/done:T-*.md'
```

## Contexto

O shell da máquina é zsh (`/opt/homebrew/bin/zsh`). O kit publicava o comando sem aspas nos três prompts de sessão. O zsh tenta expandir `Q-*.md` antes de chamar o script, não encontra arquivo quando a fila está vazia e aborta o comando inteiro.

Medição:

```
$ guia-sessoes/bin/wait-for.sh A 570 tasks/questions:Q-*.md tasks/done:T-*.md
(eval):1: no matches found: tasks/questions:Q-*.md
exit 1

$ guia-sessoes/bin/wait-for.sh A 3 'tasks/questions:Q-*.md' 'tasks/done:T-*.md'
TIMEOUT
exit 0
```

O efeito é pior do que parece. A fila vazia é o estado normal de quem está esperando trabalho, então o ciclo de escuta quebrava exatamente na situação para a qual foi escrito. Uma sessão aberta antes de existir tarefa na fila dela morre na primeira chamada, em vez de entrar em `TIMEOUT`.

O defeito apareceu quando a sessão A tentou retomar a escuta com as pastas `questions/` e `todo/` vazias, em 2026-09-19.

## Alternativa descartada

Mudar o `wait-for.sh` para aceitar os padrões já expandidos pelo shell. Descartada porque o script precisa do padrão literal para detectar arquivo que ainda não existe, que é a função dele.

## Custo aceito

Nenhum de execução. O custo é de manutenção: as aspas são fáceis de perder numa cópia manual do comando, e nada no script avisa quando isso acontece. Cada prompt de sessão recebeu um alerta `[!IMPORTANT]` ao lado do bloco, em vez de deixar a regra implícita.
