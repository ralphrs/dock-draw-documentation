# DEC-0047: a fila de cada sessão é um rótulo `para-*`

**Data:** 2026-09-23
**Quem decidiu:** humano, em conversa com a sessão A
**Alcance:** como B, C, D, o agente do Lovable e o humano recebem trabalho e como devolvem. Substitui o responsável (B e C), o rótulo `sessao-d` e os rótulos `sessao-b` e `sessao-c` como endereço de fila

## A decisão

Toda issue aberta leva exatamente um rótulo de destino: `para-a`, `para-b`, `para-c`, `para-d`, `para-lovable` ou `humano`. O rótulo diz com quem está a bola. A escuta de cada sessão vigia o rótulo dela em qualquer status diferente de `CONCLUÍDA`.

Quem passa a bola faz quatro coisas, nesta ordem:

1. Escreve um comentário curto que começa por `Sessão X:`.
2. Troca o rótulo de destino, sem deixar dois.
3. Move o status conforme a tabela abaixo.
4. Avisa a sessão de destino por mensagem, quando ela estiver aberta.

O aviso é conveniência. O registro é o Jira, e a escuta é a rede de segurança para a sessão que estava fechada ou ocupada.

| Destino | Status |
| --- | --- |
| `para-b`, `para-c`, `para-d` | `A FAZER` |
| `para-a` | `EM REVISÃO`, ou `BLOQUEADA` quando for dúvida |
| `para-lovable` | `EM ANDAMENTO` |
| `humano` | `AGUARDANDO APROVAÇÃO` |

A lista de espera da A é `para-a` com o rótulo `espera`, que a escuta dela não vigia: a issue que aguarda uma dependência fica ali até a A liberá-la para outra sessão. `para-a` sem `espera`, em qualquer status, acorda a A, inclusive `A FAZER`.

O status deriva do destino e não é escolhido à parte, para rótulo e status não se contradizerem. Quem recebe confirma movendo a issue para `EM ANDAMENTO`, sem trocar o rótulo.

## Quem devolve para quem

B, C e D devolvem sempre para A. A distribui. Só A cria o rótulo `humano`, com orientação e pergunta explícita. Trabalho que precise de duas sessões ao mesmo tempo vira duas issues ligadas, porque uma issue tem um dono por vez.

O agente do Lovable não troca rótulo, como já valia. A põe `para-lovable` ao despachar, e a devolução é o Lovable mover a issue para `EM REVISÃO`. A escuta de A reconhece `para-lovable` em `EM REVISÃO` como entrega e A troca para `para-a` ao tratar.

## Checagens

O `bin/confere-quadro.sh` acusa issue aberta com zero ou dois ou mais rótulos de destino, exceto épico e as issues com `backlog`, `acao-humana`, `bloqueio-externo`, `draft`, `liberada` ou `processo` sem responsável. Avisa rótulo incoerente com o status, issue `para-b`, `para-c` ou `para-d` em `A FAZER` há mais de 12 horas (a sessão pode estar fechada), `para-lovable` há mais de 4 horas sem resultado, e comentário sem prefixo nas últimas 24 horas.

## Alternativas descartadas

- Manter três mecanismos (responsável para B e C, rótulo para D, status para A). Foi o que deixou card para a C sem responsável e fora da fila.
- Mensagem direta como canal único. Some quando a sessão está fechada ou ocupada.
- Passagem direta entre B, C e D, sem passar por A. Simplifica a escuta e custa um salto a mais em revisão cruzada.

## Custo aceito

A no centro do fluxo: se a sessão A estiver fechada, nada anda, e o alerta de parada é a única cobertura. Migração das issues abertas e reinício da escuta das sessões B, C e D. Escrita direta pelo MCP contorna qualquer script, então a garantia é a checagem, não uma ferramenta de passagem.

## Lacunas declaradas

O nome de uma sessão no `SendMessage` é livre e muda. O protocolo registra o nome usado por cada sessão, e a atualização fica com A. A entrega de mensagem a uma sessão ocupada com um comando em segundo plano não foi testada.
