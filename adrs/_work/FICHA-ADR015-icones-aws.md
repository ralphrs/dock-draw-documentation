# Ficha: ícones AWS Architecture (pergunta 8, ADR 015)

Pesquisa sobre a fonte oficial dos ícones AWS Architecture, a versão atual, a licença aplicável e o que ela permite num produto SaaS comercial, para decidir se o conjunto de formas AWS do Diagram Studio pode usar o arquivo oficial da AWS, sob o eliminatório R-02 ("nenhuma forma de conjunto de terceiros entra sem licença conferida que permita o uso no produto") e sob R-01 ("cor só por token, igual em tema claro e escuro").

## Fonte oficial, versão e data da consulta

Página oficial: [aws.amazon.com/architecture/icons/](https://aws.amazon.com/architecture/icons/), consultada em 2026-09-21.

A página oferece dois downloads diretos, sem etapa de aceite de termos antes do download (confirmado por download direto via `curl`, resposta HTTP 200):

- Pacote de ícones: [`Icon-package_07312026...zip`](https://d1.awsstatic.com/onedam/marketing-channels/website/public/shared/architecture-icon-release/Icon-package_07312026.5846e92413caa21490223536cc97f1269e44fa92.zip), 13.988.918 bytes.
- Deck de apresentação: [`Microsoft-PPTx-toolkits_07312026...zip`](https://d1.awsstatic.com/onedam/marketing-channels/website/public/shared/architecture-icon-release/Microsoft-PPTx-toolkits_07312026.1c286c4a809a3cf2902c88ff63bf7dd1fa3cd55d.zip), com os arquivos `AWS-Architecture-Icons-Deck_For-Light-BG_07312026.pptx` e `AWS-Architecture-Icons-Deck_For-Dark-BG_07312026.pptx`.

O slide 1 do deck de 156 lâminas traz o texto "AWS Architecture Icons Release 24-2026.07.31". A AWS libera pacote de ícones por trimestre (Q1 no fim de janeiro, Q2 no fim de abril, Q3 no fim de julho, sem lançamento em Q4), o que coloca a release 24, de 2026-07-31, como a atual na data da consulta, 2026-09-21.

## O que a página e o deck dizem sobre uso

A própria página `aws.amazon.com/architecture/icons/`, consultada em 2026-09-21: "We allow customers and partners to use these toolkits and assets to create architecture diagrams." É permissão explícita, publicada na mesma página de onde o pacote é baixado, não um texto legal genérico.

O slide 5 do deck ("About AWS Architecture Icons") repete a mesma permissão: "Customers and partners can use AWS icons to create architecture diagrams. The icons are basic in design so that you can incorporate them directly into your whitepapers, presentations, datasheets, posters, or any technical material that you want." Nenhum dos dois textos menciona explicitamente um produto de terceiro que empacota os arquivos de ícone como biblioteca de formas e serve esses arquivos aos próprios clientes pagantes, mas nenhum dos dois restringe o uso a quem desenha o próprio diagrama isoladamente.

O deck distingue dois contextos de uso. Para treinamento e certificação, o slide 13 diz: "All icon sizes are fixed and should not be altered. All colors for icons have been accessibility tested and should not be altered." Para diagrama em geral, o slide 15 traz a orientação "DO: Use icons at their predefined size, color and format in diagrams" e o "DON'T: Crop service icons. Flip or rotate icons. Change icon shapes." Nenhuma das duas lâminas abre exceção para recolorir o ícone por tema claro e escuro.

Nenhuma das 156 lâminas do deck contém texto de licença ou termos de uso além do aviso de copyright repetido em rodapé, "© 2026, Amazon Web Services, Inc. or its affiliates." (verificado por busca de texto em todas as lâminas do arquivo `.pptx`).

O pacote de ícones baixado não contém arquivo de licença, termos ou `README`. A listagem completa do `.zip` (`unzip -l`) traz só imagem PNG, SVG e arquivo de metadado do sistema de arquivos (`.DS_Store`).

> [!WARNING]
> Lacuna: nem a página `aws.amazon.com/architecture/icons/`, nem o pacote de ícones, nem o deck de 156 lâminas publicam um texto de licença específico para os ícones. O download não exige clique de aceite de termos.

## Texto legal aplicável, fora da página de ícones

[AWS Trademark Guidelines](https://aws.amazon.com/trademark-guidelines/), consultada em 2026-09-21, cláusula 15, "Third Party Publications": "In most cases, AWS does not provide licenses or other authorization for use of AWS content in third party publications, including screenshots, diagrams, code, documentation, or other copyrightable materials. However, AWS does not object to limited fair use of such materials for educational or non-profit purposes." Essa cláusula é regra geral para conteúdo da AWS sem permissão específica. Os ícones de arquitetura têm permissão própria, publicada na página de ícones e repetida no deck, e a permissão específica prevalece sobre a regra geral.

A mesma página, cláusula 10, "Trade Dress": "You will not imitate the trade dress or 'look and feel' of any AWS website, including without limitation, the branding, color combinations, fonts, graphic designs, product icons, or other elements associated with AWS." Não proíbe usar o ícone oficial como distribuído. Proíbe imitar ou alterar a combinação de cor e o desenho, o que atinge tanto recolorir o arquivo oficial quanto desenhar um ícone próprio que reproduza a paleta por categoria da AWS.

A cláusula 13, "Fair Use", permite citar o nome do serviço em texto plano, sem logotipo, para afirmação factual verdadeira: "Any such use should be in plain text only (no logos) and used to make true factual statements." A cláusula 7, "No Combination", proíbe combinar a marca da AWS com outra marca ou elemento de marca do produto que a exibe.

O repositório [`awslabs/aws-icons-for-plantuml`](https://github.com/awslabs/aws-icons-for-plantuml), organização `awslabs` no GitHub, que é organização da própria AWS, não um terceiro, consultado em 2026-09-21, redistribui o mesmo conjunto de ícones convertido para PlantUML. O `README` declara: "The icons provided in this package are made available to you under the terms of the CC-BY-ND 2.0 license", e o arquivo `LICENSE` traz o texto integral da Creative Commons Attribution-NoDerivs 2.0. CC-BY-ND permite redistribuir com atribuição e proíbe obra derivada. Não é o texto publicado em `aws.amazon.com/architecture/icons/` para o pacote original, mas é termo de licença real, publicado por equipe da própria AWS, para o mesmo conjunto de ícones, e pesa como evidência de como a AWS trata a redistribuição desses arquivos.

## O que se confirma permitir e proibir, para um produto SaaS comercial

Permite, com evidência direta: usar os ícones para criar diagrama de arquitetura (página oficial e slide 5 do deck), incorporar o ícone tal como distribuído em material técnico. Redistribuir o ícone sem modificação e com atribuição, com base na permissão da página oficial somada aos termos CC-BY-ND 2.0 publicados pela `awslabs`. Citar o nome do serviço em texto plano, sem logotipo (cláusula 13).

Proíbe, com evidência direta: alterar tamanho, cor ou forma do ícone (slides 13 e 15 do deck, cláusula 10 das Trademark Guidelines, cláusula ND da CC-BY-ND). Recolorir o ícone por token de tema é obra derivada sob a licença ND, então não tem base nas fontes conferidas. Combinar a marca da AWS com outro elemento de marca (cláusula 7).

Não confirma, e fica como lacuna: nenhuma das fontes fala explicitamente de um produto SaaS de terceiro empacotando os ícones como biblioteca de formas para os próprios usuários pagantes do produto, uso mais amplo do que "criar um diagrama" ou "redistribuir com atribuição". A cláusula 15 sugere cautela para esse caso específico, mesmo a permissão específica dos ícones prevalecendo sobre a regra geral de conteúdo da AWS.

## Conflito com R-01

R-01 exige cor só por token, igual em tema claro e escuro. O ícone oficial da AWS é ilustração multicor fixa por categoria de serviço, e a licença ND proíbe recolorir. Usar o ícone oficial exige declarar exceção ao R-01 para este conjunto de formas específico: os ícones AWS mantêm cor e forma fixas, fora do mecanismo de token único, com os dois arquivos que a AWS já distribui separados por tema (fundo claro e fundo escuro) servindo cada um ao tema correspondente.

## Recomendação

O conjunto de formas AWS do Diagram Studio usa o ícone oficial da AWS sem modificação, com atribuição, com base na permissão publicada em `aws.amazon.com/architecture/icons/` e nos termos CC-BY-ND 2.0 que a própria AWS (`awslabs`) publica para o mesmo conjunto. Este conjunto de formas vira exceção declarada ao R-01: cor e forma fixas, dois ativos por tema em vez de token único. O rótulo da forma cita o nome do serviço em texto plano, "Amazon S3", "AWS Lambda", conforme a cláusula 13, sem combinar a marca da AWS com outro elemento de marca do produto, conforme a cláusula 7.

A lacuna sobre uso como biblioteca de formas de um SaaS de terceiro não se resolve nesta ficha. Fica registrada para o humano decidir se pede autorização formal da AWS antes de publicar o conjunto, e a decisão entre ícone oficial e ícone próprio pesa esse risco jurídico contra o valor de reconhecimento visual do ícone oficial.

## Alternativa descartada

Desenhar pictograma próprio para cada serviço, no vocabulário visual e na paleta de token do DokDraw, sem copiar a silhueta nem a cor da AWS. Descartada como recomendação principal porque tira o valor central de um conjunto de formas AWS: o usuário que desenha arquitetura AWS reconhece o ícone oficial, e um ícone próprio não carrega esse reconhecimento, mesmo evitando por completo o risco jurídico da cláusula 10 e a exceção ao R-01. Fica como alternativa se o humano concluir que o risco jurídico da lacuna acima pesa mais que o reconhecimento visual.

## Custo aceito

Manter dois ativos fixos por ícone (fundo claro, fundo escuro) fora do mecanismo de token único do resto do DokDraw, com exceção declarada ao R-01 só para este conjunto de formas. Conferência de nome, categoria e arquivo do pacote oficial a cada trimestre, para acompanhar serviço novo ou renomeado nas releases Q1, Q2 e Q3. Atribuição visível em algum lugar do produto, para cumprir a condição BY da licença CC-BY-ND 2.0. Risco jurídico residual sobre o uso como biblioteca de formas de um SaaS, não coberto por nenhuma das fontes conferidas, até resolução separada.
