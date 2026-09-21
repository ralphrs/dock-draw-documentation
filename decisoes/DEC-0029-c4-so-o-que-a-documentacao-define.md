# DEC-0029: a família C4 usa só o que a documentação do C4 define

**Data:** 2026-09-21
**Quem decidiu:** humano, em comentário na `DDP-222`
**Alcance:** tipos de elemento, formas e tipos de diagrama da família C4 no Diagram Studio, no app e no design-system

## A decisão

Os elementos da família C4 seguem só o que está em c4model.com. As páginas que o humano indicou são a fonte:

| Assunto | Página |
| --- | --- |
| Nível 1, contexto do sistema | https://c4model.com/diagrams/system-context |
| Nível 2, contêiner | https://c4model.com/diagrams/container |
| Nível 3, componente | https://c4model.com/diagrams/component |
| Nível 4, código | https://c4model.com/diagrams/code |
| Panorama de sistemas | https://c4model.com/diagrams/system-landscape |
| Diagrama dinâmico | https://c4model.com/diagrams/dynamic |
| Diagrama de implantação | https://c4model.com/diagrams/deployment |
| Microsserviços | https://c4model.com/abstractions/microservices |
| Notação | https://c4model.com/diagrams/notation |

Material de apoio indicado pelo humano: a apresentação da Devoxx Polônia 2023 (https://static.architectis.je/devoxxpl2023-c4-model.pdf) e dois trabalhos acadêmicos (PUC Minas e UFSJ, links na `DDP-222`).

## O que isso muda

O catálogo do app tem hoje 15 tipos C4 (`src/domain/c4/catalog.ts`). Parte deles é forma de desenho sem tipo próprio no C4: pasta, balde, terminal, navegador, SPA, microsserviço. A página de notação diz que o C4 não prescreve notação e que o tipo de cada elemento precisa estar escrito. Pelo que foi lido em 2026-09-21, ela não lista formas.

O inventário sai da sessão B: cada tipo e cada forma do catálogo de hoje contra a documentação, com a citação que sustenta manter, e o que falta ao app (nível de código, panorama, dinâmico, implantação com nós de implantação e de infraestrutura).

Até o inventário sair, nenhuma forma C4 nova é aprovada. As formas já aprovadas ficam onde estão, e o inventário diz quais saem da família C4. Forma que sair do C4 pode continuar no produto como forma genérica (`DEC-0027`), sem o rótulo de tipo C4.

## Lacuna declarada

A página de microsserviços usa um hexágono para um contêiner de API num dos exemplos. Se exemplo de figura conta como documentação para esta decisão é pergunta ao humano, feita junto com o inventário.
