# Inventário de formas por tipo de diagrama

Levantamento pedido pela `DEC-0026`, para os 24 tipos de diagrama que o Diagram Studio precisa cobrir. A ordem de entrega segue a `DEC-0027`: formas básicas e ícones de tecnologia primeiro, os 24 tipos da tabela depois. As dez formas primitivas de hoje estão em `src/components/editor/element-shape.tsx` (app `dok-draw-app`): `rect` (padrão, retângulo com raio configurável), `boundary`, `person`, `cylinder`, `pipe`, `hexagon`, `browser`, `terminal`, `bucket`, `folder`. As arestas (`src/components/editor/c4-edge.tsx`) já têm ponta de seta (`arrow`, `open`, `diamond`, `circle`, `none`), roteamento (`straight`, `orthogonal`, `curved`) e traço (contínuo, tracejado, pontilhado assíncrono).

## 1. Formas básicas e setas básicas

Referência: família "General" do draw.io, [fluxograma básico](https://www.drawio.com/docs/getting-started/basic-flowchart/) e [quantas formas um diagrama técnico precisa](https://www.drawio.com/docs/best-practice/technical-diagramming-shapes/), consultadas em 2026-09-21. Diagrama conceitual sem notação, para quem não quer C4 nem UML.

| Forma pedida (`DEC-0027`) | Primitiva |
| :--- | :--- |
| Retângulo | `rect`, existente, raio zero |
| Retângulo arredondado | `rect`, existente, raio maior que zero |
| Elipse | primitiva nova |
| Losango | primitiva nova |
| Triângulo | primitiva nova |
| Paralelogramo | primitiva nova |
| Hexágono | `hexagon`, existente |
| Cilindro | `cylinder`, existente |
| Documento (retângulo com base ondulada) | primitiva nova |
| Nuvem | primitiva nova |
| Nota (retângulo com canto dobrado, notação UML) | primitiva nova |
| Texto solto | primitiva nova. Visualmente é `rect` sem preenchimento nem borda, mas precisa de identificador de forma próprio: sem ele, redimensionar ou reconectar trataria o texto como retângulo |
| Contêiner | `boundary`, existente. Já é o retângulo tracejado de agrupamento |

Cinco das treze reaproveitam primitiva existente. Oito são novas: elipse, losango, triângulo, paralelogramo, documento, nuvem, nota, texto solto.

### Setas básicas

Já cobertas pelo `C4Edge` de hoje, sem primitiva nova:

| Pedido (`DEC-0027`) | Onde já existe |
| :--- | :--- |
| Traço contínuo | `relStyle` padrão (`sync`), sem `strokeDasharray` |
| Traço tracejado | `relStyle: "dashed"`, `strokeDasharray: "8 6"` |
| Rota reta | `routing: "straight"` |
| Rota ortogonal | `routing: "orthogonal"` |
| Rota curva | `routing: "curved"` |
| Ponta de seta (preenchida) | `EdgeEnding: "arrow"` |
| Ponta aberta | `EdgeEnding: "open"` |
| Ponta losango | `EdgeEnding: "diamond"` |
| Ponta nenhuma | `EdgeEnding: "none"` |

`C4Edge` também tem `circle` como ponta e `async` como traço pontilhado, não pedidos pela `DEC-0027`, sem custo adicional por já existirem.

## 2. Ícones de tecnologia

Duas fichas separadas, `superpowers:dispatching-parallel-agents`, porque cada fornecedor tem regra de marca própria, separada da licença do arquivo.

### CNCF e Kubernetes

Ficha completa em `adrs/_work/FICHA-INVENTARIO-icones-cncf.md`. O caso não é análogo ao da AWS (`DEC-0023`). O `LICENSE.md` do repositório `cncf/artwork` não é licença de conteúdo, aponta para a regra de marca da Linux Foundation ([linuxfoundation.org/legal/trademark-usage](https://www.linuxfoundation.org/legal/trademark-usage), consultada em 2026-09-21), que trata o logotipo como selo de compatibilidade e proíbe uso comercial fora do expressamente permitido, sem autorização escrita. As diretrizes de marca da CNCF ([cncf.io/brand-guidelines](https://www.cncf.io/brand-guidelines/)) dizem "Don't use our logo or incorporate our logo into yours" e "check in with us before using our logo on ... products ... or other commercial or product use". As diretrizes específicas do logotipo do Kubernetes ([kubernetes/kubernetes, `logo/usage_guidelines.md`](https://github.com/kubernetes/kubernetes/blob/master/logo/usage_guidelines.md)) só abrem exceção para uso não comercial.

Faltam as duas peças que sustentaram a `DEC-0023` para a AWS: permissão explícita de uso e licença de conteúdo redistribuível. Nenhuma das duas existe aqui.

**Recomendação:** não incluir logotipos CNCF nem Kubernetes como forma do Diagram Studio sem autorização escrita prévia da Linux Foundation. **Alternativa descartada:** tratar como o caso AWS, aceitando risco residual sem a base que sustentou aquela decisão. **Custo aceito:** esta família de ícones fica bloqueada até autorização ou decisão explícita do humano assumindo o risco, e a mesma checagem se repete por projeto (Prometheus, Envoy, containerd, etcd) fora do guarda-chuva geral.

### Linguagens de programação e infraestrutura fora do CNCF

Ficha completa em `adrs/_work/FICHA-INVENTARIO-icones-linguagens-infra.md`. Fonte de arquivo: `simple-icons` (CC0 1.0, `LICENSE.md`), com `DISCLAIMER.md` próprio separando licença do arquivo SVG da marca de cada logotipo, campo por ícone. Reserva: `devicon` (`devicons/devicon`, MIT), aviso de marca só em parágrafo de README, sem a mesma granularidade.

Amostra de três regras de marca, verificadas com link e data (2026-09-21): Python Software Foundation libera só uso nominativo de compatibilidade. Docker exige permissão prévia por escrito para qualquer uso fora de citação referencial limitada, cobrindo pela leitura literal o caso de biblioteca de forma comercial. PostgreSQL é o único dos três que abre uma zona de uso sem aprovação prévia, logotipo intacto, sem afirmação de afiliação.

**Recomendação:** `simple-icons` como fonte primária, `devicon` de reserva, mesma regra de exibição da `DEC-0023` (ícone intacto, moldura do DokDraw, atribuição visível). Diferente da AWS, nenhum dos três fornecedores da amostra autoriza explicitamente o caso "SaaS comercial vende o logo como forma de diagrama". **Alternativa descartada:** pedir autorização formal a cada fornecedor antes de publicar, e desenhar ícone próprio sem reproduzir o logo oficial. **Custo aceito:** risco jurídico não uniforme por fornecedor (Docker é o mais restritivo da amostra), conferência manual que não escala para centenas de logotipos sem processo repetível, e nenhuma das três políticas declara cadência de atualização.
