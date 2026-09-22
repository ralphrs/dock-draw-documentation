# Proposta: janela de propriedades do elemento

**Data:** 2026-09-21
**Protótipo:** https://claude.ai/artifact/KRmvf2pFKTLNGEWPa2AVH5
**Pedido:** humano, com urgência. Clicar num elemento não deve abrir outra visão. O duplo clique abre uma janela com as configurações daquele elemento, qualquer que seja o tipo. Elemento C4 mostra os metadados do C4, e assim por diante.

## Como é hoje

- O duplo clique num elemento chama `openElement` e cria ou abre a visão filha (Contexto para Contêineres, Contêineres para Componentes). Em elemento sem nível filho, não faz nada.
- A janela "Detalhes do elemento" já existe e abre por F2, pelo menu "Editar nome" e pelo lápis do painel da direita. Ela edita nome, tipo, tecnologia e descrição.
- O painel da direita cuida da aparência: preenchimento, linha, fonte, alinhamento, camadas, posição e tamanho.
- `model_elements` tem `name`, `type`, `description`, `technology`, `tags`, `external`, `color` e `style`. A coluna `tags` existe, mas nenhuma tela a edita.

## O que muda

**Gesto.** Duplo clique num elemento abre a janela de propriedades, sempre. F2, o lápis do painel e um item novo "Propriedades…" no menu do clique direito abrem a mesma janela. Abrir a visão de detalhe sai do duplo clique e fica em três lugares: o item que já existe no menu do clique direito, o botão que já existe no painel da direita, e um botão dentro da janela. Duplo clique numa linha continua criando ponto de quebra. Duplo clique numa forma do painel da esquerda continua criando a forma.

**A janela.** A janela "Detalhes do elemento" cresce e vira a janela de propriedades. O cabeçalho mostra o nome, a família e o tipo (por exemplo "C4 Model · Contêiner"). Abas à esquerda:

| Aba | Para quem | O que tem |
| --- | --- | --- |
| Geral | Todo elemento | Nome, descrição, tags e link |
| Aba da família | Depende da família | C4: tipo C4, tecnologia e a visão de detalhe. Imagem: prévia, tamanho do arquivo, texto alternativo e substituir. Família nova (AWS, Básicas e as demais): os campos dela, quando for construída |
| Propriedades | Todo elemento | Pares chave e valor livres, como "Dono: Time Pagamentos" ou "SLA: 99,9%" |
| Ligações | Todo elemento | Relações que entram e que saem, com rótulo e tecnologia. Clicar numa seleciona a linha no quadro |

A aparência continua só no painel da direita, sem duplicar na janela.

**C4 só com o que o c4model.com define (`DEC-0029`).** A aba C4 tem tipo, descrição e tecnologia, os três campos que a notação pede em [c4model.com/diagrams/notation](https://c4model.com/diagrams/notation). A tecnologia é pedida para contêiner e componente, e a aba avisa quando ela está vazia nesses tipos. Tags, link e propriedades livres ficam nas abas comuns, porque são do DokDraw e não do C4.

**Gravação.** Cada campo grava ao sair dele, como a janela de hoje, e entra na pilha de desfazer da `DDP-294`.

## Fases

- **Fase 1, sem migração.** O gesto novo, a janela com as abas Geral (nome, descrição, tags), C4 (tipo, tecnologia, visão de detalhe), Imagem (prévia, tamanho, substituir) e Ligações. Tudo cabe nas colunas que já existem.
- **Fase 2, com migração (`app-release`).** Coluna nova `metadata jsonb` em `model_elements`, validada por Zod, para o link, as propriedades livres e o texto alternativo da imagem. Link só aceita `http` e `https`, e abre em aba nova.

## Relação

A linha tem a mesma necessidade: rótulo, tecnologia (o C4 pede protocolo entre contêineres) e descrição. A proposta é abrir a mesma janela pelo item "Propriedades…" do menu da linha, com as abas Geral, C4 e Propriedades. O duplo clique na linha continua criando ponto de quebra.

## Fora desta proposta

- Campo obrigatório que bloqueia salvar. A tecnologia vazia gera aviso, nunca bloqueio.
- Perspectivas e outros campos do Structurizr que o c4model.com não define.
