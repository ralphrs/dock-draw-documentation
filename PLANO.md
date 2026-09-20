# Plano e previsão de fim

**Escrito em:** 2026-09-20
**Mantido por:** sessão A

O `ESTADO.md` diz onde o projeto está. Este arquivo diz quanto falta e quando acaba, com o número que sustenta cada afirmação e com as lacunas declaradas em vez de preenchidas por estimativa confortável.

---

## 1. O inventário completo

Duas trilhas, e a de desenvolvimento cresce a cada ADR aceito, porque cada ADR publica fatias novas.

### Trilha de ADR: 8 ADRs restantes

| ADR | Camada | Depende de | Fatias que vai gerar |
| :--- | :--- | :--- | :--- |
| 013 | Tenancy e acesso | 003 | Desconhecido. Fecha os conflitos C-3 e C-7 |
| 007 | Renderização | 002, 005 | Desconhecido. Desbloqueia a fatia F5 do ADR 005 e o ADR 014 |
| 008 | Navegação e descoberta | 003, 007 | Desconhecido |
| 009 | Busca | 002, 003, 004, 013 | Desconhecido |
| 010 | Exportação e sincronização | 002, 003, 004, 007 | Desconhecido. Consome `toProfile`, premissa da Emenda 1 |
| 011 | Publicação | 004, 007, 008, 009 | Desconhecido |
| 014 | Developer Portal | 002, 007 | Desconhecido |
| 012 | Consolidação da stack | Todos | Nenhuma. Audita os outros e encerra a trilha |

Sete deles publicam fatias de implementação que ainda não existem no backlog abaixo. **O backlog de desenvolvimento de hoje é parcial por construção**, e não há como somar o total do projeto antes de o ADR 012 fechar.

### Trilha de desenvolvimento: 28 fatias conhecidas, 1 entregue

Dentro da meta de `DEC-0004`, editar e publicar uma página da Wiki ponta a ponta:

| ADR | Fatias | Dias estimados | Situação |
| :--- | ---: | ---: | :--- |
| 002 Formato | 5 | 5 | F0 entregue. F1 com ordem sendo escrita (`DDP-9`) |
| 003 Armazenamento | 4 | 6,5 | Não começou |
| 004 Fluxo editorial | 3 | 4,5 | Não começou |
| 005 Edição | 4 | **sem estimativa** | Não começou |
| **Total na meta** | **16** | **16 mais 4 fatias não estimadas** | 1 entregue |

Fora da meta, mas dentro dos ADRs já aceitos:

| ADR | Fatias | Dias estimados |
| :--- | ---: | ---: |
| 002 | 2 (F5 migração, F6 importadores) | 5 |
| 003 | 3 (S5 assets, S6 lixeira, S7 `sync_state`) | 2,5 |
| 004 | 3 (E4 comentários, E5 notificações, E6 `rev`) | 2,5 |
| 005 | 4 (F5 a F8) | **sem estimativa** |
| **Total fora** | **12** | **10 mais 4 fatias não estimadas** |

**Somando o que está estimado: 26 dias.** Oito fatias, todas do ADR 005, nunca foram estimadas por ninguém: a seção de fatias daquele ADR tem coluna de critério de pronto e de bloqueio, e não tem coluna de dias.

---

## 2. A lacuna que impede a previsão de ser melhor que uma faixa

**Uma amostra.** A fatia F0 é a única entregue, e foi a primeira de tudo: junto com ela nasceram o script de fixtures, a permissão nomeada, a revisão de ordem e metade do protocolo. Usar o tempo dela para projetar as outras 27 mede o processo sendo construído, não o processo rodando.

**"Dias" do ADR não são dias de calendário.** A estimativa nas tabelas dos ADRs é de esforço de uma pessoa programando. Quem executa aqui é o agente do Lovable, e a execução da F0 levou minutos. O que consumiu a madrugada foi o ciclo em volta: escrever a ordem, revisar a ordem, despachar, revisar o resultado, aceitar.

Isso inverte o gargalo. **O tempo do projeto não é proporcional aos dias estimados, é proporcional ao número de fatias**, porque cada fatia paga um ciclo de governança de custo quase fixo, independente do tamanho dela.

Se isso se confirmar nas próximas fatias, a soma de 26 dias vira uma medida de risco e de complexidade, não de prazo.

---

## 3. Previsão

Em ciclos de fatia, não em dias. Um ciclo é ordem escrita, ordem revisada, execução, resultado revisado, aceite.

| Alvo | Fatias restantes | Previsão |
| :--- | ---: | :--- |
| **Meta `DEC-0004`** (editar e publicar uma página) | 15 | 15 ciclos |
| Tudo dos ADRs já aceitos | 27 | 27 ciclos |
| Projeto inteiro | 27 mais as fatias de 7 ADRs não escritos | não estimável hoje |

Quanto vale um ciclo em tempo de relógio depende de quanto tempo o humano dedica, porque as sessões só avançam quando ele está presente para as aprovações. Na madrugada de 2026-09-19 para 20, uma sessão ativa de cerca de quatro horas produziu: uma fatia entregue e aceita, três tarefas de ADR fechadas, uma emenda aceita e a migração do protocolo para o Jira.

Com o processo já construído, uma sessão dessas deveria caber mais de um ciclo. **Isso é hipótese, não medição.** As próximas três fatias (F1, F2, F3 do ADR 002) são a base para trocar a hipótese por número, e cada uma vai ter o tempo registrado aqui.

Antes disso, qualquer data é invenção.

---

## 4. As voltas

A crítica de que o projeto dá voltas tem base. O que aconteceu na primeira madrugada, em ordem: protocolo por arquivo, migração para Jira, conector do Lovable no Jira, mudança do canal de ordem, mudança do ciclo de escuta, credencial de API. Seis mudanças de processo para uma fatia de produto entregue.

Parte disso é fundação que não se paga duas vezes: o quadro, o canal do Lovable e o modo de escuta agora existem e não voltam à mesa. Parte é retrabalho real, e vale nomear: o ciclo de escuta foi desenhado três vezes em um dia, e o canal de ordem, duas.

A regra que sai disso, e que vale a partir de agora:

> **Nenhuma mudança de processo entra enquanto a sprint 1 não entregar as quatro fatias**, a menos que ela desbloqueie trabalho parado. Melhoria que só deixa o processo mais bonito espera a sprint fechar.

O `ESTADO.md` já trazia essa regra na seção de riscos desde 2026-09-19, e ela foi quebrada quatro vezes no mesmo dia. Repetir a regra sem mudar nada seria a quinta. O que muda é o teste: antes de tocar no protocolo, a pergunta é se existe alguém parado esperando aquilo. Se não existe, não entra.

---

## 5. O que estreita a previsão

Três coisas, em ordem de valor:

1. **Estimar as oito fatias do ADR 005.** É o único ADR aceito sem número de esforço, e quatro dessas fatias estão dentro da meta. Tarefa para a sessão B.
2. **Medir as três próximas fatias do ADR 002.** F1, F2 e F3 dão a primeira base real de duração de ciclo, com o processo já pronto.
3. **Escrever o ADR 013.** Ele fecha os conflitos C-3 e C-7 e publica as fatias de Tenancy, que hoje são um buraco no backlog. Segurado de propósito até a sprint 1 entregar.

---

## 6. Ordem de execução

| Sprint | Conteúdo | Alvo |
| :--- | :--- | :--- |
| **1** (aberta) | ADR 002: F1 núcleo, F2 validação, F3 URIs, F4 save | `src/content-format` completo, 30 fixtures verdes no app |
| 2 | ADR 003: S1 schema, S2 RLS, S3 server functions, S4 `page_refs` | Página criada, rascunho salvo, revisão gravada |
| 3 | ADR 004: E1 tabelas, E2 FSM, E3 server functions | Rascunho até publicado, pelo fluxo de aprovação |
| 4 | ADR 005: F1 adaptador, F2 registry, F3 colar `html`, F4 lista frouxa | Editor real sobre o DokMD |
| — | **Meta `DEC-0004` atingida** | Editar e publicar uma página da Wiki, ponta a ponta |

Depois da meta, a trilha de ADR retoma pelo 013, e o backlog de desenvolvimento cresce com as fatias que cada ADR novo publicar.
