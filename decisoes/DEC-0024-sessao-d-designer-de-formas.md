# DEC-0024: a sessão D desenha as formas no Figma

**Data:** 2026-09-21
**Quem decidiu:** humano, pedindo uma sessão que crie no Figma, tarefa a tarefa, o desenho das formas do Diagram Studio
**Alcance:** papel novo no protocolo das sessões, como ele recebe trabalho e o que pode tocar

## A decisão

Uma quarta sessão, **D**, desenha no Figma as formas do Diagram Studio, uma tarefa por forma, para o humano ver e aprovar o desenho antes de qualquer forma ser construída no app.

A sessão D só escreve no Figma. O app e este repositório são de leitura para ela, e a entrega é um comentário na issue com o link do frame.

## Como ela recebe trabalho

A sessão D não tem conta própria no Jira, ao contrário da B e da C, que são identificadas pelo responsável da issue. A fila dela é o rótulo **`sessao-d`**. A escuta `aguarda-fila.sh` passou a aceitar `D`, com a consulta por esse rótulo.

Alternativa descartada: criar uma conta no Jira para a D. Resolve a identidade como nas outras sessões, e custa ao humano criar e licenciar um usuário antes de a sessão poder começar.

## Primeira leva

Agrupador `DDP-158`, com catorze tarefas: a fundação visual (arquivo, variáveis espelhando os tokens do app, tipografia e moldura base), as dez formas primitivas que o editor C4 usa hoje, com uma variante por tipo C4, os três estilos de conexão, e duas da AWS, a moldura do ícone e os cinco contêineres.

A unidade da tarefa é a forma primitiva, não o tipo C4: no Figma, os quinze tipos são variantes de dez componentes. As famílias além do C4 e da AWS entram em levas seguintes, depois que o ADR 015 decidir o formato e a prioridade.

## O que a sessão D não pode fazer

Alterar ícone oficial de terceiros (`DEC-0023`), decidir o que o produto vai ter, e escrever no app ou em `DOCS`.

## Lacuna declarada

O desenho no Figma não é contrato. A forma construída no app segue o ADR 015 e o que o humano aprovar na issue. Se o desenho e o ADR divergirem, vale o ADR, e a divergência volta como dúvida para a sessão A.

A sessão D depende do MCP do Figma conectado na sessão do humano. Nesta sessão A ele não está disponível, e a sessão A não confere o arquivo do Figma diretamente: confere pelo link e pela descrição da entrega.
