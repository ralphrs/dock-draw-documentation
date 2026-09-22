# DEC-0035: lateral pinável com espaços e projetos, e administração da plataforma e do tenant

**Data:** 2026-09-22
**Quem decidiu:** humano, no terminal da sessão A
**Alcance:** ADR 013 (Tenancy e acesso, a escrever), ADR 008 (Navegação), interface do app (`app-shell.tsx`)

## A decisão

Três pedidos do humano na mesma tarde, todos sobre a lateral e sobre quem administra o quê:

1. **Lateral pinável.** A lateral onde ficam Projetos e Convidados ganha um controle de pinar e despinar. Pinada, fica sempre aberta, como hoje. Despinada, recolhe e só abre quando o ponteiro passa por cima.
2. **Espaços na lateral.** A pessoa vê todos os espaços de que é membro e, dentro de cada espaço, os projetos. Um tenant pode ter espaços de gestão, arquitetura, IA, contabilidade e outros. Hoje o app tem um `workspace` por dono, criado em silêncio por `ensureWorkspace`, e a lista de projetos filtra por `owner_id`. Não existe espaço nem tabela de membros no schema.
3. **Administração em dois níveis.** Uma visão de administração para quem é dono da plataforma e outra para quem administra o tenant. Hoje o único papel é `app_role` com `admin` e `member` em `user_roles`, e Convidados só aparece para `admin`.

## Modelo que a decisão implica

Tenant, espaço e projeto formam três níveis: o tenant é a organização, o espaço é a divisão interna (gestão, arquitetura, IA, contabilidade) e o projeto continua sendo a unidade de wiki e diagramas. Membro é do espaço, com papel por espaço. Administrador do tenant governa espaços, membros e convites do tenant. Dono da plataforma governa os tenants. É o assunto do ADR 013, que resolve os conflitos C-3 e C-7 e ainda não foi escrito. Esta decisão não fixa nomes de tabela nem papéis: fixa a direção do produto para o ADR e para as pranchas.

## Onde vira trabalho

| O quê | Card | Sessão |
| --- | --- | --- |
| Prancha da lateral pinável nos dois estados e no hover | `DDP-493` | D |
| Estudo de tenancy: tenant, espaço, projeto, membro por espaço, administrador do tenant e dono da plataforma, insumo do ADR 013 | `DDP-494` | B |
| Prancha da lateral com árvore de espaços e projetos | `DDP-495` | D, bloqueada pela `DDP-494` |
| Pranchas da administração da plataforma e da administração do tenant | `DDP-496` | D, bloqueada pela `DDP-494` |

O prompt do ADR 013 ainda não existe em `prompts/`, pasta do humano. Frases a levar para ele: "Um tenant tem vários espaços (gestão, arquitetura, IA, contabilidade), cada espaço tem projetos, e a pessoa é membro por espaço com papel por espaço" e "A administração tem dois níveis: dono da plataforma governa tenants, administrador do tenant governa espaços, membros e convites (DEC-0035)".

## Custo aceito e alternativa descartada

Custo: a lateral com espaços depende do modelo de tenancy, então a prancha da árvore espera o estudo, e o app só muda depois do ADR 013 e da migração aprovada pelo humano. A lateral pinável não depende de nada e pode andar antes. Alternativa descartada: manter um workspace por dono e listar projetos por `owner_id`, que não representa uma organização com divisões internas nem quem é membro do quê.
