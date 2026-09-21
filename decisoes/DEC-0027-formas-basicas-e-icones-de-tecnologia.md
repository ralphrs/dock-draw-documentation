# DEC-0027: depois de C4 e AWS, formas básicas e ícones de tecnologia

**Data:** 2026-09-21
**Quem decidiu:** humano, respondendo à pergunta de prioridade da `DEC-0026`
**Alcance:** ordem das famílias de forma do Diagram Studio, fila da sessão B e da sessão D

## A decisão

Depois de C4 e AWS, as próximas famílias são, nesta ordem:

1. **Formas básicas e setas básicas**, para diagrama conceitual sem notação. Referência: a família "Geral" do draw.io.
2. **Ícones de tecnologia**: os projetos do landscape da CNCF, linguagens de programação e tecnologias de infraestrutura.

Os outros tipos da `DEC-0026` seguem depois, na ordem da tabela de lá.

Alternativa descartada: seguir a ordem da tabela da `DEC-0026`, que começa pelo UML. Entrega primeiro uma notação especializada, e custa ao diagrama conceitual, o uso mais comum, esperar a lista inteira.

## Formas básicas

O inventário da sessão B fecha a lista. O ponto de partida é retângulo, retângulo arredondado, elipse, losango, triângulo, paralelogramo, hexágono, cilindro, documento, nuvem, nota, texto solto e contêiner. As setas básicas cobrem traço contínuo e tracejado, rota reta, ortogonal e curva, e ponta de seta, ponta aberta, losango e nenhuma.

Várias já existem como primitiva do editor C4 (retângulo, hexágono, cilindro). A forma básica reaproveita a primitiva sem o significado C4 e com a cor da paleta neutra.

### Lista do humano, 2026-09-21

Na `DDP-249` o humano fechou a lista das formas genéricas por enquanto: retângulo, retângulo arredondado, quadrado, texto, caixa de texto, elipse, círculo, losango, triângulo, cilindro, ator, nuvem, contêiner e raia horizontal e vertical, mais linha, conector, seta direcional e linha curva. Paralelogramo, documento e nota, que a lista inicial desta decisão trazia, ficam em backlog.

## Ícones de tecnologia

Cada logotipo tem dono e marca registrada. A licença do arquivo do ícone não autoriza o uso da marca. A CNCF publica os logotipos dos projetos dela em um repositório de artwork, e linguagens e ferramentas de infraestrutura têm, cada uma, a própria regra de uso de marca. O inventário confere fonte, licença e regra de marca por fornecedor, na web e na data, com link. A regra da `DEC-0023` vale aqui: o ícone entra intacto, dentro da moldura do DokDraw.

## Lacuna declarada

Conjunto de ícones do tamanho do landscape da CNCF, com centenas de projetos, não se desenha à mão, um épico por ícone. O desenho da sessão D é a moldura e o padrão de encaixe. A carga dos ícones é trabalho de dados, e o formato de catálogo sai do ADR 015.

## Nuvens sem permissão escrita, decidido em 2026-09-21

Na `DDP-249` o humano decidiu: ícone genérico, colagem de imagem para quem quiser logotipo, e nenhum logotipo de terceiro no produto, com exceção das nuvens que dão permissão escrita para diagrama (AWS e Azure). Na `DDP-366` aprovou o caminho para o Google Cloud e as outras nuvens sem essa permissão: um conjunto próprio do DokDraw de ícones por categoria de serviço (computação, função, contêiner, banco relacional, banco NoSQL, armazenamento de objetos, fila e mensageria, rede, balanceador, cache, identidade, monitoramento), com o desenho vindo da Lucide (ISC), a cor da paleta do DokDraw, o nome do serviço no rótulo e um selo de texto com o provedor, sem logotipo.

Alternativa descartada: pedir autorização ao Google. Sem prazo, e o mesmo pedido se repetiria para cada provedor.
