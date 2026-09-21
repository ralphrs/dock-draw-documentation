# Ficha: ícones AWS Architecture (pergunta 8, ADR 015)

Pesquisa sobre a fonte oficial dos ícones AWS Architecture, a versão atual, a licença aplicável e o que ela permite num produto SaaS comercial, para decidir se o conjunto de formas AWS do Diagram Studio pode usar o arquivo oficial da AWS, sob o eliminatório R-02 ("nenhuma forma de conjunto de terceiros entra sem licença conferida que permita o uso no produto") e sob R-01 ("cor só por token, igual em tema claro e escuro").

## Fonte oficial, versão e data da consulta

Página oficial: [aws.amazon.com/architecture/icons/](https://aws.amazon.com/architecture/icons/), consultada em 2026-09-21.

A página oferece dois downloads diretos, sem etapa de aceite de termos antes do download (confirmado por download direto via `curl`, resposta HTTP 200):

- Pacote de ícones: [`Icon-package_07312026...zip`](https://d1.awsstatic.com/onedam/marketing-channels/website/public/shared/architecture-icon-release/Icon-package_07312026.5846e92413caa21490223536cc97f1269e44fa92.zip), 13.988.918 bytes.
- Deck de apresentação: [`Microsoft-PPTx-toolkits_07312026...zip`](https://d1.awsstatic.com/onedam/marketing-channels/website/public/shared/architecture-icon-release/Microsoft-PPTx-toolkits_07312026.1c286c4a809a3cf2902c88ff63bf7dd1fa3cd55d.zip), com os arquivos `AWS-Architecture-Icons-Deck_For-Light-BG_07312026.pptx` e `AWS-Architecture-Icons-Deck_For-Dark-BG_07312026.pptx`.

O slide 1 do deck de 156 lâminas traz o texto "AWS Architecture Icons Release 24-2026.07.31". A AWS libera pacote de ícones por trimestre (Q1 no fim de janeiro, Q2 no fim de abril, Q3 no fim de julho, sem lançamento em Q4), o que coloca a release 24, de 2026-07-31, como a atual na data da consulta, 2026-09-21.

## O que a página e o deck dizem sobre uso

O slide 5 do deck ("About AWS Architecture Icons"): "Customers and partners can use AWS icons to create architecture diagrams. The icons are basic in design so that you can incorporate them directly into your whitepapers, presentations, datasheets, posters, or any technical material that you want." O texto endereça o cliente da AWS desenhando o próprio diagrama. Não menciona produto de terceiro que empacota os arquivos de ícone como biblioteca de formas e serve esses arquivos aos próprios clientes pagantes.

O deck distingue dois contextos de uso. Para treinamento e certificação, o slide 13 diz: "All icon sizes are fixed and should not be altered. All colors for icons have been accessibility tested and should not be altered." Para diagrama em geral, o slide 15 traz a orientação "DO: Use icons at their predefined size, color and format in diagrams" e o "DON'T: Crop service icons. Flip or rotate icons. Change icon shapes." Nenhuma das duas lâminas abre exceção para recolorir o ícone por tema claro e escuro.

Nenhuma das 156 lâminas do deck contém texto de licença ou termos de uso além do aviso de copyright repetido em rodapé, "© 2026, Amazon Web Services, Inc. or its affiliates." (verificado por busca de texto em todas as lâminas do arquivo `.pptx`).

O pacote de ícones baixado não contém arquivo de licença, termos ou `README`. A listagem completa do `.zip` (`unzip -l`) traz só imagem PNG, SVG e arquivo de metadado do sistema de arquivos (`.DS_Store`).

> [!WARNING]
> Lacuna: nem a página `aws.amazon.com/architecture/icons/`, nem o pacote de ícones, nem o deck de 156 lâminas publicam um texto de licença específico para os ícones. O download não exige clique de aceite de termos.

## Texto legal aplicável, fora da página de ícones

[AWS Trademark Guidelines](https://aws.amazon.com/trademark-guidelines/), consultada em 2026-09-21, cláusula 15, "Third Party Publications": "In most cases, AWS does not provide licenses or other authorization for use of AWS content in third party publications, including screenshots, diagrams, code, documentation, or other copyrightable materials. However, AWS does not object to limited fair use of such materials for educational or non-profit purposes." DokDraw é produto SaaS vendido, fora do recorte "educational or non-profit purposes" dessa cláusula.

A mesma página, cláusula 10, "Trade Dress": "You will not imitate the trade dress or 'look and feel' of any AWS website, including without limitation, the branding, color combinations, fonts, graphic designs, product icons, or other elements associated with AWS." A cláusula atinge não só o arquivo oficial, também uma forma própria que reproduza a paleta de cor por categoria ou o desenho do ícone da AWS.

A cláusula 13, "Fair Use", permite citar o nome do serviço em texto plano, sem logotipo, para afirmação factual verdadeira: "Any such use should be in plain text only (no logos) and used to make true factual statements." A cláusula 7, "No Combination", proíbe combinar a marca da AWS com outra marca ou elemento de marca do produto que a exibe.

Um dado de prática, não uma fonte oficial da AWS para este pacote: o repositório [`awslabs/aws-icons-for-plantuml`](https://github.com/awslabs/aws-icons-for-plantuml) (organização `awslabs` no GitHub, consultado em 2026-09-21) redistribui o mesmo conjunto de ícones convertido para PlantUML. O `README` do repositório declara: "The icons provided in this package are made available to you under the terms of the CC-BY-ND 2.0 license", e o arquivo `LICENSE` traz o texto integral da Creative Commons Attribution-NoDerivs 2.0. Esse é o `LICENSE` de um repositório derivado, mantido por uma equipe da AWS, não um texto publicado em `aws.amazon.com/architecture/icons/` para o pacote original, e a versão 2.0 da licença, de 2004, não é a versão atual da Creative Commons (4.0, de 2013). Entra como indício de como uma equipe da AWS trata a redistribuição desses arquivos, não como o contrato que rege o pacote baixado nesta pesquisa.

## O que se confirma permitir e proibir, para um produto SaaS comercial

Permite, com evidência direta: cliente ou parceiro da AWS desenhar diagrama próprio com os ícones e publicar esse diagrama em material técnico (slide 5 do deck). Citar o nome do serviço em texto plano, sem logotipo (cláusula 13 das Trademark Guidelines).

Não confirma: que um produto de terceiro empacote os arquivos de ícone da AWS como parte de uma biblioteca de formas vendida a clientes próprios. A cláusula 15 aponta na direção oposta para diagrama em publicação de terceiro fora de uso educacional ou sem fins lucrativos, e nenhuma exceção específica para ferramenta de diagramação aparece nas Trademark Guidelines nem no material do pacote de ícones.

Proíbe, com evidência direta: alterar tamanho, cor ou forma do ícone (slides 13 e 15 do deck), imitar a paleta de cor por categoria ou o desenho do ícone fora do arquivo oficial (cláusula 10), combinar a marca da AWS com outro elemento de marca (cláusula 7).

## Conflito com R-01

R-01 exige cor só por token, igual em tema claro e escuro. O ícone oficial da AWS é ilustração multicor fixa por categoria de serviço, e o deck orienta manter cor e forma como estão, tanto no caso geral (slide 15) quanto no caso de treinamento e certificação (slide 13). A AWS publica dois arquivos de apresentação separados, um para fundo claro e um para fundo escuro, como arquivos distintos, não como um único arquivo com cor trocada por variável CSS. Usar o ícone oficial como está exigiria manter dois ativos fixos por tema, fora do mecanismo de token único que o resto do DokDraw usa, ou recolorir o ícone para um token único, o que a cláusula 10 das Trademark Guidelines e a orientação do deck tratam como alteração não permitida.

## Recomendação

O conjunto de formas AWS do Diagram Studio não usa o ícone oficial da AWS como está, nem uma versão recolorida dele. O conjunto desenha pictograma próprio para cada serviço, no vocabulário visual e na paleta de token do DokDraw, sem copiar a silhueta nem a combinação de cor por categoria da AWS, o que atende à cláusula 10 das Trademark Guidelines além de resolver R-01. O rótulo da forma cita o nome do serviço em texto plano, "Amazon S3", "AWS Lambda", sem logotipo, conforme a cláusula 13, e sem combinar a marca da AWS com outro elemento de marca do produto, conforme a cláusula 7.

## Alternativa descartada

Empacotar o SVG oficial da AWS dentro do pacote de formas do DokDraw, servindo o arquivo tal como baixado aos clientes do produto. Descartada por dois motivos independentes.

Primeiro, R-02: nenhuma das fontes consultadas (página de ícones, pacote baixado, deck de 156 lâminas, Trademark Guidelines, termos gerais da AWS) confirma licença que cubra esse uso específico, e a cláusula 15 das Trademark Guidelines aponta o contrário para diagrama em publicação de terceiro fora de uso educacional ou sem fins lucrativos.

Segundo, R-01: a cor fixa por categoria do ícone oficial e a ausência de um arquivo único trocável por tema não cabem no mecanismo de token único do DokDraw sem recolorir o ícone, o que a cláusula 10 das Trademark Guidelines trata como alteração de elemento associado à AWS.

## Custo aceito

O DokDraw desenha e mantém um conjunto próprio de pictograma para cada serviço AWS do escopo do conjunto de formas, sem reaproveitar a arte vetorial da AWS. O custo recai sobre a fatia que implementa o conjunto de formas AWS: tempo de design por serviço, conferência de nome e categoria contra o pacote oficial a cada trimestre, para acompanhar serviço novo ou renomeado nas releases Q1, Q2 e Q3, e reconhecimento visual menor do usuário no primeiro uso, por não repetir o pictograma que a AWS publica e que ferramentas concorrentes de diagramação costumam reproduzir tal como a AWS distribui.

> [!WARNING]
> Lacuna: se o DokDraw decidir buscar autorização formal da AWS para empacotar o ícone oficial (contato jurídico ou parceria de negócio), essa negociação é ação separada, não resolvida por esta ficha.
