# Ficha: ícones dos projetos CNCF (inventário de ícones de tecnologia, `DEC-0027`)

Pesquisa sobre a fonte oficial do artwork dos projetos do landscape da CNCF, a licença do arquivo, a regra de uso de marca da CNCF e da Linux Foundation, e a regra específica do Kubernetes, para decidir se a família "ícones de tecnologia" do Diagram Studio pode reaproveitar o precedente da `DEC-0023` (ícone AWS oficial, intacto, na moldura do DokDraw).

## Fonte oficial do artwork

Repositório [`cncf/artwork`](https://github.com/cncf/artwork), branch padrão `main`, consultado em 2026-09-21. O `README.md` descreve o repositório como o conjunto de logotipos dos projetos e programas da CNCF, em PNG e SVG, com pelo menos 18 versões por logotipo. O Kubernetes tem pasta própria em `projects/kubernetes`.

O arquivo de licença do repositório é [`LICENSE.md`](https://github.com/cncf/artwork/blob/main/LICENSE.md), texto integral:

> All artwork in this repo is made available under the Linux Foundation trademark usage [guidelines](https://www.linuxfoundation.org/trademark-usage/).
>
> This text from those guidelines, and the correct and incorrect usage examples, are particularly helpful:
>
> Certain marks of The Linux Foundation have been created to enable you to communicate compatibility or interoperability of software or products. In addition to the requirement that any use of a mark to make an assertion of compatibility must, of course, be accurate, the use of these marks must avoid confusion regarding The Linux Foundation's association with the product. The use of the mark cannot imply that The Linux Foundation or its projects are sponsoring or endorsing the product.

A API do GitHub classifica essa licença como `"key": "other"`, `"spdx_id": "NOASSERTION"`, consultada em 2026-09-21 (`api.github.com/repos/cncf/artwork/license`). Não é uma licença de conteúdo com permissão de cópia e redistribuição, como a CC-BY-ND 2.0 que a `awslabs` publica para os ícones AWS na `FICHA-ADR015-icones-aws.md`. `LICENSE.md` não concede direito autoral sobre o arquivo do ícone. Aponta para a regra de uso de marca da Linux Foundation, e essa regra fala de marca usada para afirmar compatibilidade, não de cópia de arquivo.

## Regra de uso de marca, CNCF e Linux Foundation

Duas páginas, separadas do arquivo de licença acima.

**CNCF Brand Guidelines**, [`cncf.io/brand-guidelines`](https://www.cncf.io/brand-guidelines/), consultada em 2026-09-21. Trata do logotipo da própria CNCF, distinto do logotipo de cada projeto hospedado, que a mesma página lista à parte, em "Project Logos", apontando para o repositório `cncf/artwork`. Texto relevante, na seção "Products, websites, names, and logos":

> Don't use our logo or incorporate our logo into yours.

Na seção "Advertising, promotional, and sales materials":

> Please check in with us before using our logo on websites, products, packaging, manuals, or for other commercial or product use.

E na seção sobre afiliação:

> [...] please don't edit or change the CNCF logo, we like it how it is!

**Linux Foundation Trademark Usage**, [`linuxfoundation.org/legal/trademark-usage`](https://www.linuxfoundation.org/legal/trademark-usage), consultada em 2026-09-21. Esta é a regra que `LICENSE.md` do `cncf/artwork` cita, e vale para o logotipo de cada projeto, Kubernetes incluído. Trechos:

> A trademark should not be used as part of your product name.

> A trademark should not be incorporated into your company's logos or designs.

> Fair use does not permit you to state or imply that the owner of a mark produces, endorses, or supports your company, products, or services.

> Do not use logos or names of The Linux Foundation in any commercial or marketing context other than as expressly permitted in this policy unless you have obtained explicit written permission.

A política descreve o uso aceito como afirmação de compatibilidade, no formato "`<nome do seu produto>` for `<marca>`" ou "`<nome do seu produto>` compatible with `<marca>`", não como reprodução do logotipo dentro da interface de outro produto.

Nenhuma das duas páginas contém uma frase equivalente à que sustentou a `DEC-0023` para a AWS, "We allow customers and partners to use these toolkits and assets to create architecture diagrams", publicada na própria página de download dos ícones. A licença dos ícones AWS soma essa permissão de uso a uma licença de conteúdo (CC-BY-ND 2.0) que autoriza cópia com atribuição. O par `cncf/artwork` mais Linux Foundation Trademark Usage não tem nenhuma das duas peças: nem a frase de permissão de uso em diagrama, nem a licença de conteúdo.

## Regra específica do Kubernetes

[`kubernetes/kubernetes`, `logo/usage_guidelines.md`](https://github.com/kubernetes/kubernetes/blob/master/logo/usage_guidelines.md), consultado em 2026-09-21. Último commit no arquivo em 2020-08-13 (`api.github.com/repos/kubernetes/kubernetes/commits?path=logo/usage_guidelines.md`), o que indica texto estável desde então, não uma versão em rascunho.

O arquivo repete o mesmo parágrafo da Linux Foundation Trademark Usage citado acima, na íntegra, e acrescenta uma frase, sem equivalente na regra geral da CNCF:

> Additionally, permission is granted to modify the Kubernetes mark for non-commercial uses such as t-shirts and stickers.

A permissão de modificar a marca do Kubernetes existe só para uso não comercial. O texto não fala de uso comercial, nem de logotipo intacto dentro de produto de terceiro. Sem essa frase, o caso comercial cai na regra geral da Linux Foundation, que condiciona contexto comercial ou de marketing fora do texto da própria política a autorização escrita.

O arquivo aponta para os arquivos de logotipo em `github.com/cncf/artwork/tree/master/projects/kubernetes`, referência à branch antiga `master`, hoje `main` no repositório `cncf/artwork` (confirmado por `api.github.com/repos/cncf/artwork`, `default_branch: main`). O link está desatualizado, sem efeito sobre o texto da regra.

> [!WARNING]
> Lacuna: nenhuma das fontes conferidas, CNCF Brand Guidelines, Linux Foundation Trademark Usage ou o arquivo específico do Kubernetes, fala de um produto SaaS de terceiro oferecendo o logotipo de um projeto CNCF como forma de biblioteca de diagrama, disponível a clientes pagantes. Dono: humano, para decidir entre pedir autorização escrita ou não incluir a forma.

## Recomendação

Não incluir os logotipos dos projetos CNCF, Kubernetes entre eles, como forma do Diagram Studio, sem autorização escrita da CNCF ou da Linux Foundation.

O motivo é a ausência das duas peças que sustentaram a `DEC-0023` para a AWS. Falta a licença de conteúdo: `LICENSE.md` do `cncf/artwork` não concede direito de cópia, só aponta para a regra de marca. Falta a permissão de uso equivalente: nenhuma fonte conferida diz algo como "use estes logotipos para criar diagramas", e a Linux Foundation Trademark Usage exige autorização escrita para contexto comercial fora do que a própria política permite expressamente. A regra específica do Kubernetes só abre exceção de modificação para uso não comercial, silêncio que não favorece o caso comercial.

Antes de incluir a forma, a via correta é pedir autorização escrita a `trademarks@linuxfoundation.org` e, se o Kubernetes exigir contato próprio, ao canal da CNCF indicado em `cncf.io/brand-guidelines`, descrevendo o uso real: biblioteca de formas de um produto SaaS comercial, logotipo intacto, dentro de moldura própria, com atribuição visível.

## Alternativa descartada

Tratar o caso CNCF como o caso AWS da `DEC-0023`, usar o logotipo intacto, com atribuição, aceitando risco jurídico residual pela decisão do humano. Descartada como recomendação principal porque o risco residual da `DEC-0023` partiu de duas permissões concretas, a frase da página oficial da AWS e a licença CC-BY-ND da `awslabs`, e nenhuma das duas existe para CNCF ou Kubernetes nas fontes conferidas. Sem essas duas peças, o precedente da `DEC-0023` não se aplica por analogia, e o risco deixa de ser residual para ser a regra geral de uso comercial sem permissão, que a própria Linux Foundation escreve como proibida sem autorização escrita.

## Custo aceito

Bloqueio da família "ícones de tecnologia" da `DEC-0027`, na parte dos projetos CNCF, até resposta ao pedido de autorização escrita ou decisão explícita do humano de aceitar o risco sem ela.

Repetição desta checagem por fornecedor. A `DEC-0027` cobre também linguagens de programação e tecnologias de infraestrutura fora do guarda-chuva CNCF, cada uma com fonte e regra de marca próprias, fora do escopo desta ficha.

Sem verificação, nesta ficha, da regra de marca de projetos individuais além do Kubernetes, como Prometheus, Envoy, containerd e etcd citados na `DEC-0027`. A `LICENSE.md` do `cncf/artwork` e a Linux Foundation Trademark Usage cobrem todos eles pela mesma cadeia de regra, mas nenhum arquivo `usage_guidelines.md` próprio, como o do Kubernetes, foi conferido para os demais.
