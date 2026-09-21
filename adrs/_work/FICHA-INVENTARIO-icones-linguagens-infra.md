# Ficha: licença de arquivo e regra de marca para ícones de linguagem e de infraestrutura fora da CNCF

**Escopo:** Python, JavaScript/TypeScript, Go, Java, Rust (linguagens) e Docker, PostgreSQL, Redis, Nginx, Terraform (infraestrutura fora do landscape CNCF), como formas do Diagram Studio.

**Precedente:** `DEC-0023` fixa a regra para o conjunto AWS. O ícone entra sem modificação, dentro da moldura própria do DokDraw, com atribuição visível, e a licença do arquivo do ícone é sempre separada da permissão de uso da marca. `DEC-0027` estende essa regra a linguagens e infraestrutura e pede o inventário de fonte, licença e regra de marca por fornecedor, na web e na data.

## Fonte do arquivo

### simple-icons

Repositório `simple-icons/simple-icons`, site simpleicons.org. O arquivo `LICENSE.md` do branch `develop` declara CC0 1.0 Universal, domínio público, sem restrição de uso comercial. Fonte: https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md, consultado em 2026-09-21.

O projeto separa a licença do arquivo SVG da permissão de marca em `DISCLAIMER.md`, no mesmo branch (https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md, consultado em 2026-09-21):

> "Simple Icons is released under CC0 - though that doesn't mean to imply that all icons within the project are also CC0."

> "Simple Icons cannot be held responsible for any legal activity raised by a brand, or users of the package."

O `README.md` do mesmo branch pede que todo usuário leia o disclaimer antes de usar qualquer ícone (https://github.com/simple-icons/simple-icons/blob/develop/README.md, consultado em 2026-09-21).

O formato de dados de cada ícone aceita um campo `license` próprio, com `type` em SPDX ID ou `custom`, para o caso em que a marca de um fornecedor específico impõe termo diferente do CC0 geral do pacote (`CONTRIBUTING.md`, https://github.com/simple-icons/simple-icons/blob/develop/CONTRIBUTING.md, consultado em 2026-09-21). O projeto já prevê, na própria estrutura de dados, que licença de arquivo e regra de marca por fornecedor podem divergir.

### devicon

Repositório `devicons/devicon` (o prompt cita `devicon-dev/devicon`, que não existe. A organização correta no GitHub é `devicons`). O arquivo `LICENSE` do branch `master` é MIT, copyright 2015, konpa. Fonte: https://github.com/devicons/devicon/blob/master/LICENSE, consultado em 2026-09-21.

O `README.md` do mesmo branch traz aviso de marca ao fim da seção "About the Project" (https://github.com/devicons/devicon/blob/master/README.md, consultado em 2026-09-21):

> "All product names, logos, and brands are property of their respective owners. All company, product and service names used in this website are for identification purposes only. Use of these names, logos, and brands does not imply endorsement. Usage of these logos should be done according to the company/brand/service's brand policy."

O devicon não tem um arquivo de disclaimer separado nem campo de licença por ícone. O aviso fica em um parágrafo do README, sem a granularidade que o `DISCLAIMER.md` e o campo `license` do simple-icons oferecem.

## Regra de marca por fornecedor

### Python (Python Software Foundation)

Fonte: https://www.python.org/psf/trademarks/, política aprovada pelo PSF Board em 2006-11-13, versão 1.3 de 2007-01-08, consultada em 2026-09-21.

Permitido sem aprovação prévia: uso nominativo, para declarar que um software "is written in the Python programming language" ou "is compatible" com Python, com a palavra ou o logo não alterado.

Proibido sem aprovação prévia: uso comercial do nome ou do logo Python em nome de produto ou de empresa. Uso de logo derivado (modificado) para qualquer fim comercial. Uso em embalagem de produto, site comercial ou item vendido (merchandise), fora do uso nominativo de compatibilidade. A política veda também qualquer uso que "may imply association of unrelated modules, tools, documentation, or other resources with the Python programming language."

O texto da política não trata do caso de um SaaS de terceiro oferecer o logo Python como item de uma biblioteca de formas de diagrama, vendida a cliente pagante. O caso mais próximo previsto é o de declarar compatibilidade, que não é o uso pretendido pelo Diagram Studio.

### Docker

Fonte: https://www.docker.com/legal/trademark-guidelines/, consultada em 2026-09-21. A página não traz data de última atualização visível.

Permitido sem aprovação prévia: uso referencial limitado do nome Docker, por exemplo para nomear ou citar o produto em um artigo, sob as diretrizes publicadas.

Proibido sem aprovação prévia: qualquer outro uso do logo "Moby Dock". A diretriz é explícita: "All other uses are prohibited except by express written permission, requested in advance, which we may grant or deny in our sole discretion." Reprodução ou imitação do logo fora do material oficial da Docker também é proibida: "Do not create imitations, facsimiles or reproductions of these design elements on your own." Uso que implique patrocínio, endosso ou afiliação com a Docker é proibido.

Diferente do Python e do PostgreSQL, a Docker não descreve um uso nominativo genericamente liberado. A leitura literal da diretriz cobre o caso do Diagram Studio (logo como item de biblioteca comercial) dentro de "all other uses", que exige permissão prévia por escrito.

### PostgreSQL

Fonte: https://www.postgresql.org/about/policies/trademarks/, última atualização declarada em 2024-11-20, consultada em 2026-09-21. Os termos "Postgres", "PostgreSQL" e o logo do elefante (Slonik) são marcas registradas da PostgreSQL Community Association of Canada.

Permitido sem aprovação prévia, se as condições abaixo forem respeitadas: uso do nome e do logo sem modificação, sem combinar com outra marca ou logo, e sem afirmar ou sugerir afiliação, patrocínio, endosso ou aprovação da PostgreSQL Community Association of Canada, do PostgreSQL Global Development Group, do PostgreSQL Project, do PostgreSQL Core Team ou da PostgreSQL Community: "As long as you do not state or imply that you or your business are affiliated with, endorsed, sponsored or approved by [essas entidades], these kinds of uses of the words Postgres and PostgreSQL are generally fine."

Proibido: uso em nome de empresa, de produto ou de domínio sem aprovação prévia. Uso com software não relacionado ao PostgreSQL, ou que sugira falsamente que o PostgreSQL não é software livre, ou em produto concorrente (outro banco de dados), ou "with unrelated goods and services". Modificação do logo sem aprovação prévia.

Da amostra de três, a política do PostgreSQL é a única com uma zona de uso liberado sem pedido prévio de aprovação, desde que o logo entre intacto e sem afirmação de afiliação. A cláusula sobre "unrelated goods and services" não resolve se um SaaS de diagramação, que documenta sistemas que incluem PostgreSQL, conta como bem relacionado ou não relacionado. A política não dá exemplo desse caso.

## Recomendação

Adotar `simple-icons` como fonte primária do arquivo, com `devicon` como fonte alternativa para o caso de o `simple-icons` não cobrir um logotipo específico. Os dois cobrem as cinco linguagens e as cinco tecnologias de infraestrutura do escopo.

O motivo é a separação explícita entre licença do arquivo e regra de marca. O `simple-icons` documenta essa separação em um arquivo próprio (`DISCLAIMER.md`) e no formato de dados (campo `license` por ícone), o mesmo modelo que `DEC-0023` já aplica ao ícone AWS. O `devicon` traz o mesmo aviso em um parágrafo do README, sem a mesma granularidade.

A regra de exibição da `DEC-0023` (ícone intacto, dentro da moldura do DokDraw, atribuição visível) se estende ao arquivo baixado do `simple-icons` ou do `devicon`, porque nenhuma das duas licenças de arquivo (CC0, MIT) proíbe redistribuição ou uso comercial do SVG em si.

A extensão não cobre a regra de marca. Ao contrário da AWS, cujo pacote oficial é publicado com o propósito declarado de compor diagrama de arquitetura, nenhuma das três políticas de marca conferidas (Python, Docker, PostgreSQL) descreve ou autoriza o caso de um SaaS de terceiro oferecer o logo como item de uma biblioteca de formas vendida a cliente pagante. A política da Docker exige permissão prévia por escrito para qualquer uso fora do referencial limitado, o que cobre esse caso pela leitura literal do texto. A política do Python trata só do uso nominativo de compatibilidade. A política do PostgreSQL abre uma zona de uso sem aprovação prévia, com condição de logo intacto e ausência de afirmação de afiliação, mas não resolve se biblioteca de forma de diagrama comercial é bem relacionado ou não relacionado ao PostgreSQL.

## Alternativa descartada

**Pedir autorização formal por escrito a cada um dos dez fornecedores antes de publicar qualquer ícone.** Descartada pelo mesmo motivo do precedente AWS em `DEC-0023`: a opção existia e não foi escolhida lá. Pedir para dez fornecedores, com prazo de resposta e critério de aprovação próprios de cada um, atrasa a entrega da família de ícones de tecnologia sem grau de certeza maior, já que negativa expressa também é resposta possível. A exceção é a Docker, cuja política não deixa zona de uso liberado sem pedido, ao contrário de Python e PostgreSQL.

**Desenhar ícone próprio, sem reproduzir o logo oficial de cada tecnologia.** Descartada pelo mesmo motivo do precedente AWS: tira o reconhecimento da tecnologia, que é o valor central de uma forma de diagrama de infraestrutura.

## Custo aceito

**Risco jurídico residual por fornecedor, não uniforme.** Ao contrário do conjunto AWS, em que a mesma diretriz vale para todo o pacote, aqui cada um dos dez fornecedores tem a própria regra. A leitura da diretriz da Docker aponta exigência de permissão prévia por escrito, o que a distingue do Python e do PostgreSQL, que descrevem alguma zona de uso liberado. Publicar o ícone Docker sem esse pedido carrega risco maior do que publicar o ícone PostgreSQL.

**Conferência não escala para centenas de logotipos sem processo repetível.** O inventário desta ficha cobriu dez fornecedores com pesquisa manual, uma política por vez. `DEC-0027` já declara essa lacuna para o tamanho do landscape CNCF, e ela vale também para o conjunto de linguagens e de infraestrutura fora da CNCF: um processo de checklist por fornecedor, com os mesmos critérios usados aqui (uso liberado sem aprovação, exigência de aprovação prévia, proibição de modificação, proibição de combinação com outra marca), evita repetir pesquisa de zero a cada novo logotipo, mas esse processo não existe ainda.

**Conferência periódica das três políticas.** As páginas de marca de Python, Docker e PostgreSQL não têm a mesma cadência de versão declarada. A do PostgreSQL registra a data da última atualização (2024-11-20), a do Python registra versão e data de aprovação (1.3, 2007-01-08), a da Docker não declara data. Mudança de política em qualquer uma das três não gera aviso automático para o DokDraw.

## Lacuna declarada

> [!WARNING]
> Lacuna: nenhuma das três políticas de marca conferidas resolve, em texto explícito, o caso de um SaaS comercial de terceiro oferecer o logo como forma de diagrama dentro de uma biblioteca vendida a cliente pagante. A leitura adotada nesta ficha é inferência sobre texto escrito para outro cenário (nominativo de compatibilidade, referencial em artigo, uso geral sem afiliação). Dono: sessão A, na decisão que fechar o inventário de `DEC-0027` para este subconjunto.
