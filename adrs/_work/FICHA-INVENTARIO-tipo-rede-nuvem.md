# Ficha: inventário de formas, família rede e nuvem (tipos 10, 11, 12, 13, 15 e 16 da `DEC-0026`)

Levantamento pedido pela `DEC-0026` para os seis tipos de diagrama da família rede e nuvem. Reaproveita as dez primitivas de `src/components/editor/element-shape.tsx` (app `dok-draw-app`) e as oito primitivas novas já identificadas em `adrs/_work/INVENTARIO-formas-por-diagrama.md` (elipse, losango, triângulo, paralelogramo, documento, nuvem, nota, texto solto). Reaproveita também a decisão de ícone de terceiro em `decisoes/DEC-0023-icone-aws-oficial-na-moldura-do-dokdraw.md`: ícone oficial sem modificação, dentro da moldura do DokDraw, com atribuição, contêineres de região, VPC, zona de disponibilidade, sub-rede e grupo de segurança.

O mecanismo de aninhamento de contêiner já está decidido em `adrs/_work/FICHA-ADR015-conteineres.md`: um único mecanismo, baseado em `parentId` e `extent: 'parent'` de `@xyflow/react` 12.11.6, compartilhado entre o contêiner C4 (`group`, forma `boundary`) e o contêiner AWS de até cinco níveis. Essa ficha registra dois riscos abertos e sem correção prevista na versão instalada: o recálculo em cascata do tamanho do contêiner-avô (`expandParent`, issue `xyflow/xyflow#4500`, aberta) e o reparentamento por interseção em profundidade dois ou mais (`getIntersectingNodes`, corrigido só na issue `#4781`/PR `#4782`). Os seis tipos desta ficha herdam os dois riscos sempre que aninham região, rede virtual e sub-rede, sem repetir a investigação aqui.

## Tipo 10: Topologia de rede virtual

Situação na `DEC-0026`: previsto, contêineres de nuvem.

| Forma | Representa | Primitiva | Aninhamento ou ícone |
| :--- | :--- | :--- | :--- |
| Região | Fronteira geográfica do provedor (AWS Region, Azure Region, GCP Region) | `boundary`, existente | Contêiner de nível 1, sem ícone de terceiro |
| Rede virtual | VPC (AWS), Virtual Network (Azure), VPC (GCP) | `boundary`, existente | Contêiner de nível 2, filho de Região via `parentId` |
| Zona de disponibilidade | Availability Zone (AWS), Availability Zone (Azure), Zone (GCP) | `boundary`, existente | Contêiner de nível 3, filho de Rede virtual |
| Sub-rede | Subnet (AWS), Subnet (Azure), Subnetwork (GCP) | `boundary`, existente | Contêiner de nível 4, filho de Zona de disponibilidade |
| Grupo de segurança | Security Group (AWS), Network Security Group (Azure), regra de firewall (GCP) | `boundary`, existente | Contêiner de nível 5, filho de Sub-rede |
| Gateway de internet, NAT gateway, VPN gateway | Recurso de borda de rede do provedor | `rect`, existente | Ícone oficial do fornecedor dentro da moldura do DokDraw, padrão da `DEC-0023` |
| Load balancer | Application/Network Load Balancer (AWS), Azure Load Balancer, Cloud Load Balancing (GCP) | `rect`, existente | Ícone oficial em moldura |
| Tabela de rotas | Route Table (AWS), Route Table/UDR (Azure), Routes (GCP) | `rect`, existente | Ícone oficial em moldura |
| Peering entre redes | Ligação lógica entre duas redes virtuais | Nenhuma forma nova | Aresta do `C4Edge` existente, rotulada, sem nó próprio |

Nenhuma forma nova. O tipo 10 usa só primitivas já existentes (`boundary`, `rect`) e a aresta já existente. O trabalho pendente não é de forma, é de catálogo: cada recurso de rede (gateway, load balancer, tabela de rotas) precisa de um tipo de elemento novo em `src/domain/c4/catalog.ts`, apontando para `rect` com o ícone correspondente, no molde de `queue` (linha 125) e `store` (linha 114) daquele arquivo.

> [!WARNING]
> Lacuna: nenhuma medição de desempenho ou de comportamento visual do DokDraw com os cinco níveis de contêiner aninhado da AWS existe até esta ficha. `FICHA-ADR015-conteineres.md` já registra o risco em nível de biblioteca (`expandParent`, `getIntersectingNodes`). Falta o teste no editor real. Dono: spike da fatia que implementa o conjunto de formas AWS ou Azure, antes de aceitar cinco níveis como número final também para redes virtuais.

## Tipo 11: Computação e serverless

Situação na `DEC-0026`: previsto, nuvem.

| Forma | Representa | Primitiva | Aninhamento ou ícone |
| :--- | :--- | :--- | :--- |
| Instância de máquina virtual | EC2 (AWS), Azure VM, Compute Engine (GCP) | `rect`, existente | Ícone oficial em moldura |
| Nó de cluster de contêiner | Nó do ECS/EKS (AWS), AKS (Azure), GKE (GCP) | `rect`, existente | Ícone oficial em moldura |
| Cluster gerenciado de contêiner | EKS, AKS, GKE como agrupamento visual | `boundary`, existente | Contêiner rotulado, com o ícone do serviço gerenciador no canto, mesmo padrão do grupo de segurança do tipo 10 |
| Função serverless | AWS Lambda, Azure Functions, Cloud Run functions | `rect`, existente | Ícone oficial em moldura. Já decidido para AWS na `DEC-0023`. A extensão a Azure e GCP depende da licença apurada nesta ficha, seção final |
| Grupo de escalonamento automático | Auto Scaling Group (AWS), VM Scale Set (Azure), Managed Instance Group (GCP) | `boundary`, existente | Contêiner rotulado, sem ícone de terceiro obrigatório |
| Gateway de API | API Gateway (AWS), API Management (Azure), API Gateway (GCP) | `rect`, existente | Ícone oficial em moldura |
| Registro de contêiner | ECR (AWS), Azure Container Registry, Artifact Registry (GCP) | `rect`, existente | Ícone oficial em moldura |

Nenhuma forma nova. O tipo 11 repete o padrão do tipo 10, ícone de fornecedor dentro de `rect`, e agrupamento visual em `boundary` para cluster e grupo de escalonamento. A lacuna é a mesma: cada recurso listado precisa de um tipo de elemento novo no catálogo, não de primitiva geométrica nova.

## Tipo 12: Serverless e orientado a eventos

Situação na `DEC-0026`: em parte, faltam broker, tópico e fila genéricos.

O catálogo atual (`src/domain/c4/catalog.ts`, linhas 125 a 135) já tem um tipo de elemento `queue`, rótulo "Fila / Mensageria", forma `pipe`, tecnologia padrão "Apache Kafka". A lacuna descrita na `DEC-0026` está parcialmente desatualizada neste ponto: fila genérica já existe como tipo de elemento e já tem forma no editor de hoje, sem trabalho de forma pendente. Falta tópico e broker.

| Forma | Representa | Primitiva | Justificativa |
| :--- | :--- | :--- | :--- |
| Fila | Canal ponto a ponto, um produtor, um consumidor | `pipe`, já existente como tipo `queue` no catálogo | Confirmado pela notação de referência: o ícone de *Message Channel* de Hohpe e Woolf, *Enterprise Integration Patterns* (Addison-Wesley, 2003), capítulo 3, página 60, é um tubo cinza, a mesma forma geométrica de `pipe`. Texto sob licença Creative Commons Attribution, conforme https://www.enterpriseintegrationpatterns.com/patterns/messaging/, consultado em 2026-09-21 |
| Tópico | Canal publica-assina, um produtor, múltiplos consumidores | `pipe`, primitiva nova de catálogo (tipo `topic`), sem forma geométrica nova | A página de *Publish-Subscribe Channel* do mesmo site, consultada em 2026-09-21, descreve o canal como "um canal de entrada que se ramifica em múltiplos canais de saída, um por assinante". A ramificação é comportamento de aresta, já coberto pelo `C4Edge` existente com múltiplas conexões de saída do mesmo nó, não exige geometria própria no nó. O tópico se distingue da fila só por rótulo e tecnologia padrão (ex.: "Amazon SNS", "Google Pub/Sub", "Azure Service Bus Topic"), não por forma |
| Broker de mensagem | Componente central que roteia mensagem entre produtores e consumidores (Kafka, RabbitMQ, Azure Service Bus, Amazon MQ) | `rect`, primitiva nova de catálogo (tipo `message_broker`) | O broker é um componente de sistema, não um canal. A página de *Message Broker* do mesmo site descreve o padrão hub-and-spoke, central com várias pontas. O DokDraw já representa hub-and-spoke por várias arestas partindo do mesmo nó, o mesmo mecanismo do tópico acima, então o broker reaproveita `rect`, a forma de componente já usada por `system` e `container` no catálogo (linhas 58 e 78) |
| Função serverless com gatilho de evento | Função acionada por mensagem, sem contexto de fornecedor | `rect`, primitiva nova de catálogo (tipo a definir) | O hexágono já está ocupado por `microservice` no catálogo (`catalog.ts`, linhas 82 a 92), reaproveitá-lo para função serverless colidiria com esse tipo existente na leitura do diagrama. `rect` evita a colisão e evita aproximar a forma do contorno hexagonal da marca registrada do AWS Lambda, cautela já registrada para o ícone AWS na `DEC-0023`. O ícone de gatilho (raio, evento) fica para a sessão D |

Nenhuma primitiva geométrica nova. As quatro formas do tipo 12 reaproveitam `pipe` e `rect`, existentes. O trabalho pendente é de catálogo: três tipos de elemento novos (`topic`, `message_broker`, função serverless genérica), no molde do `queue` já existente.

> [!WARNING]
> Lacuna: a página de *Message Broker* de `enterpriseintegrationpatterns.com` não pôde ser lida em detalhe visual nesta pesquisa, só o texto ao redor do ícone (arquivo de imagem `.gif`, não extraído). A leitura de hub-and-spoke acima é inferência a partir do texto da página, não confirmação da forma exata do ícone original. Dono: sessão D, se decidir usar um ícone próprio para broker em vez de só rótulo sobre `rect`.

## Tipo 13: Híbrido e multicloud

Situação na `DEC-0026`: previsto, famílias misturadas no mesmo diagrama.

| Forma | Representa | Primitiva | Aninhamento ou ícone |
| :--- | :--- | :--- | :--- |
| Recurso AWS, Azure e GCP no mesmo diagrama | Mistura de ícones de até três fornecedores | `rect`, existente | Cada ícone segue a regra de licença do próprio fornecedor (seção final desta ficha), com a mesma moldura DokDraw (raio, borda, tipografia, posição do rótulo) para os três, igual à decisão já tomada para AWS na `DEC-0023` |
| Datacenter on-premises | Ambiente fora de qualquer nuvem pública | `boundary`, existente | Contêiner rotulado "On-premises" ou nome próprio, sem ícone de marca, forma genérica |
| Conectividade híbrida | AWS Direct Connect, Azure ExpressRoute, Google Cloud Interconnect, VPN site a site | `rect` para o recurso de gateway em cada ponta, aresta existente para a ligação | Ícone oficial do fornecedor correspondente em cada ponta, sem forma nova |
| Servidor físico genérico dentro do datacenter | Host que não pertence a nenhum provedor de nuvem | Mesma lacuna do tipo 15 e do tipo 16, abaixo | Ver seção de licença Cisco |

Nenhuma forma nova além das já cobertas pelos tipos 10 e 11. O requisito específico do tipo 13 é de composição, não de geometria: o mesmo diagrama mistura ícones de fornecedores diferentes, cada um com a própria regra de cor fixa e a própria licença, sob a mesma moldura visual do DokDraw. Isso exige repetir para Azure e para GCP a exceção à regra de cor só por token que a `DEC-0023` já aceitou para AWS, ícone com cor fixa, dois arquivos por tema quando o fornecedor os distribuir assim.

## Tipo 15: Rede física

Situação na `DEC-0026`: previsto, topologia de redes.

| Forma | Representa | Primitiva | Aninhamento ou ícone |
| :--- | :--- | :--- | :--- |
| Roteador | Dispositivo de rede física | `rect`, existente | Ícone Cisco em moldura, se a licença permitir (seção final) |
| Switch | Dispositivo de rede física | `rect`, existente | Ícone Cisco em moldura |
| Firewall | Dispositivo de rede física | `rect`, existente | Ícone Cisco em moldura |
| Servidor físico | Host de rack | `rect`, existente | Ícone Cisco em moldura. Forma distinta de `terminal` e `browser`, já usadas por container de software (aplicação server-side, single-page app), não pelo hardware que o hospeda |
| Rede externa ou internet | Fronteira de rede fora do controle do diagrama | Primitiva nova "nuvem", já identificada em `INVENTARIO-formas-por-diagrama.md` | Reaproveitada aqui como fronteira externa de rede, sem forma adicional. O pedido desta tarefa já indica esse uso |

## Tipo 16: Rede lógica

Situação na `DEC-0026`: previsto, topologia de redes. Mesma notação de referência do tipo 15.

As formas de nó do tipo 16 repetem as do tipo 15 (roteador, switch, firewall, servidor, nuvem), porque a distinção física/lógica está no que os nós representam (equipamento físico ou segmento lógico, como VLAN), não na geometria. Nenhuma forma nova além das já listadas no tipo 15.

| Item | O que muda em relação ao tipo 15 |
| :--- | :--- |
| Segmento lógico (VLAN, sub-rede) | Reaproveita `boundary`, existente, o mesmo contêiner tracejado usado por Região e Rede virtual no tipo 10, sem forma nova |
| Arranjo estrela, barramento, anel, malha | Não é forma de nó. É arranjo geométrico das arestas entre os nós já listados, decisão de layout, não de forma. Ver lacuna abaixo |

> [!WARNING]
> Lacuna: estrela, barramento, anel e malha não têm forma própria a desenhar. São arranjos de grafo entre nós existentes (roteador, switch, host), com aresta simples ou múltipla entre eles. O `C4Edge` de hoje desenha rota manual (`straight`, `orthogonal`, `curved`), sem cálculo automático de posição por topologia. A `DEC-0026` já registra situação análoga para roadmap, Gantt e ciclo de vida, "problema 4 do escopo", posição derivada em vez de arrasto livre. Se os quatro arranjos de topologia exigirem posicionamento automático dos nós (por exemplo, dispor N roteadores em círculo para o arranjo anel), a decisão de mecanismo é a mesma do ADR 015 para posição derivada, e não deste inventário. Dono: ADR 015.

## Licença de ícones: Azure, Google Cloud e Cisco

A `DEC-0023` já decidiu o caso AWS: ícone oficial sem modificação, com atribuição, base na permissão publicada em `aws.amazon.com/architecture/icons/` somada à licença CC-BY-ND 2.0 que a `awslabs` publica para o mesmo conjunto (detalhe em `adrs/_work/FICHA-ADR015-icones-aws.md`). Esta seção não repete essa pesquisa, só compara Azure, Google Cloud e Cisco contra o mesmo padrão de evidência: permissão explícita de uso em diagrama, licença de conteúdo redistribuível, regra de alteração e regra de marca.

### Azure

Fonte oficial: [learn.microsoft.com/en-us/azure/architecture/icons/](https://learn.microsoft.com/en-us/azure/architecture/icons/), consultada em 2026-09-21, `ms.date` da página 2026-07-09. Download direto: `Azure_Public_Service_Icons_V24.zip`.

A seção "Icon terms" da própria página, texto integral: "Microsoft permits the use of these icons in architectural diagrams, training materials, or documentation. You can copy, distribute, and display the icons only for the permitted use unless granted explicit permission by Microsoft. Microsoft reserves all other rights." É permissão explícita de uso em diagrama de arquitetura, publicada na mesma página do download, no mesmo padrão de evidência que sustentou a `DEC-0023` para a AWS.

A seção "General guidelines" lista o permitido e o proibido. Permitido: "Use the icon to illustrate how products can work together", "In diagrams, we recommend including the product name somewhere close to the icon", "Use the icons as they would appear within Azure." Proibido: "Don't crop, flip, or rotate icons", "Don't distort or change icon shape in any way", "Don't use Microsoft product icons to represent your product or service."

**Veredito: mesmo regime da AWS.** Ícone oficial sem modificação, dentro da moldura do DokDraw, com atribuição e nome do produto perto do ícone, cor fixa por ícone como exceção declarada à regra de token único, no mesmo molde da `DEC-0023`.

> [!WARNING]
> Lacuna: nenhuma frase da página cobre explicitamente o caso "produto SaaS de terceiro empacota os ícones como biblioteca de formas para os próprios clientes pagantes", a mesma lacuna que a `DEC-0023` já aceita como risco residual para a AWS. Também não verificado nesta ficha se o pacote `Azure_Public_Service_Icons_V24.zip` distingue arquivo para fundo claro e fundo escuro, como a AWS distribui. Dono: humano, mesma decisão de risco residual já tomada para AWS, estendida a Azure.

### Google Cloud

Fonte oficial: [cloud.google.com/icons](https://cloud.google.com/icons), consultada em 2026-09-21. A página é aplicação de página única renderizada em JavaScript, confirmado por download direto do HTML estático (`curl`), que não traz o texto de termos de uso, só a metatag de descrição: "Official Google Cloud icons to build your own architectural diagrams or reference architectures."

O guia de referência dos ícones, [`services.google.com/fh/files/misc/google-cloud-product-icons.pdf`](https://services.google.com/fh/files/misc/google-cloud-product-icons.pdf), "Updated: May 2026", 34 páginas, lido nesta ficha, cataloga os ícones em dois formatos (ícone único por produto essencial, ícone de categoria para os demais) mas não traz texto de licença ou termos de uso em nenhuma página, é catálogo visual, não documento legal.

A tentativa de chegar à regra geral de marca do Google redireciona de `google.com/permissions/trademark/rules/` para `about.google/brand-resource-center/rules/` e desta para `partnermarketinghub.withgoogle.com`, portal que exige acesso autenticado, não alcançado nesta pesquisa.

**Veredito: não verificado.** Diferente de AWS e Azure, esta ficha não localizou o texto de termos de uso dos ícones do Google Cloud. A metatag da própria página confirma a intenção de uso em diagrama de arquitetura, sinal na mesma direção da permissão explícita da AWS e da Azure, mas não é o texto de termos em si.

> [!WARNING]
> Lacuna: o texto de termos de uso dos ícones do Google Cloud não foi lido nesta ficha. A página oficial é renderizada em JavaScript e não expõe o texto por download direto, e o caminho até a regra geral de marca do Google exige login em portal de parceiro. Dono: sessão B, numa passada dedicada com acesso interativo ao navegador, ou humano, se preferir contatar o canal de marca do Google Cloud diretamente antes de incluir o conjunto Azure paralelo com GCP no mesmo diagrama do tipo 13.

### Cisco

Fonte oficial: [cisco.com/c/en/us/about/brand-center/network-topology-icons.html](https://www.cisco.com/c/en/us/about/brand-center/network-topology-icons.html), consultada em 2026-09-21. A página oferece download em EPS e JPG para material impresso, arquivo `.zip` de stencil para Microsoft Visio e apresentação em PowerPoint, sem formato SVG.

Texto de uso da própria página: "You may use them freely, but you may not alter them." É permissão de uso mais curta que a da AWS e da Azure, sem menção explícita a "diagrama de arquitetura", mas também sem a exigência de autorização prévia por escrito que marca o caso CNCF (`adrs/_work/FICHA-INVENTARIO-icones-cncf.md`). A proibição de alteração é a mesma das outras três fontes.

**Veredito: mais próximo do regime AWS/Azure que do regime CNCF, com evidência mais fraca.** A permissão "freely" cobre uso geral, sem a frase explícita de criação de diagrama que sustentou a AWS e a Azure, e sem a exigência de autorização escrita para uso comercial que bloqueou a CNCF. Ícone Cisco sem modificação, dentro da moldura do DokDraw, fica como recomendação sujeita à mesma classe de risco residual já aceita para AWS e Azure, não ao bloqueio do caso CNCF.

> [!WARNING]
> Lacuna: a página consultada não oferece formato vetorial web (SVG), só EPS, JPG, Visio e PowerPoint. A AWS distribui SVG em quatro tamanhos por ícone, base da resolução de exportação decidida no complemento da `DEC-0023`. Sem SVG oficial, o ícone Cisco exige conversão de formato antes de entrar no editor, passo técnico que este inventário não resolve. Dono: sessão D, na carga do conjunto de formas de rede física e lógica.

## Resumo das formas novas

Nenhuma primitiva geométrica nova surge desta ficha, além das oito já identificadas em `INVENTARIO-formas-por-diagrama.md`. A "nuvem" daquela lista de oito ganha aqui um segundo uso confirmado, fronteira externa de rede nos tipos 15 e 16, além do uso original como forma básica. O trabalho pendente dos seis tipos é de catálogo de tipo de elemento, não de forma: cada recurso de nuvem, rede física ou rede lógica listado nas tabelas acima precisa de uma entrada em `src/domain/c4/catalog.ts` apontando para `rect`, `boundary` ou `pipe`, já existentes, no molde de `queue`, `store` e `group` daquele arquivo.
