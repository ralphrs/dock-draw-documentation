# DEC-0023: ícone AWS oficial, intacto, dentro da moldura do DokDraw

**Data:** 2026-09-21
**Quem decidiu:** humano, escolhendo a opção 1 da pesquisa de `DDP-156` com o pedido "mas estilizado para o nosso padrão", interpretado pela sessão A como descrito abaixo
**Alcance:** como o conjunto de formas AWS do Diagram Studio mostra os ícones, e o que pode seguir os tokens do produto

## A decisão

O conjunto de formas AWS usa o ícone oficial da AWS **sem modificação**, com atribuição visível no produto. Tudo em volta do ícone segue o padrão do DokDraw: moldura, fundo, borda, raio de canto, tipografia e posição do rótulo, estado de seleção, espaçamento, e os contêineres de região, VPC, zona de disponibilidade, sub-rede e grupo de segurança.

O ícone funciona como selo dentro de uma forma do DokDraw. O tema claro e o escuro usam os dois arquivos que a própria AWS distribui para fundo claro e fundo escuro, sem recolorir.

## Por que o ícone em si não é estilizado

O pedido foi estilizar para o padrão do produto. Aplicado ao ícone, ele cai em três proibições conferidas em `DDP-156`: a CC-BY-ND 2.0 publicada pela `awslabs` proíbe obra derivada, a apresentação oficial da AWS manda não alterar cor, forma nem tamanho, e a cláusula 10 das diretrizes de marca proíbe imitar o visual da AWS. A leitura adotada cumpre o pedido na parte que as fontes permitem, que é todo o resto da forma.

### Alternativas descartadas

| Alternativa | Por que não |
| :--- | :--- |
| Recolorir ou redesenhar o ícone oficial no padrão do DokDraw | Obra derivada sob a CC-BY-ND, e alteração proibida pela própria AWS |
| Ícone próprio que lembre o da AWS | A cláusula 10 proíbe imitar cor e desenho da AWS |
| Ícone próprio sem semelhança | Tira o reconhecimento do serviço, que é o valor central de um diagrama AWS |

## Custos aceitos

**Exceção à regra de cor só por token.** Os ícones AWS têm cor fixa, com dois arquivos por tema. A exceção vale só para o ícone, não para a forma em volta dele.

**Atribuição visível** em algum lugar do produto, condição da licença.

**Conferência periódica do pacote oficial.** A AWS publica releases trimestrais, com serviço novo e serviço renomeado.

**Risco jurídico residual aceito pelo humano.** Nenhum texto conferido fala de um produto SaaS oferecer os ícones como biblioteca de formas aos usuários pagantes dele. A opção de pedir autorização formal à AWS antes de publicar existia e não foi escolhida. Se a AWS vier a objetar, a troca afeta um conjunto de formas, não o editor.

## Lacuna declarada

O tamanho do ícone. A apresentação da AWS pede os tamanhos predefinidos, e uma forma redimensionável no quadro livre tende a escalar o que tem dentro. A regra sobre como o ícone se comporta quando a forma cresce fica para o ADR 015.
