# DEC-0030: ícones oficiais de AWS, Azure, Google Cloud e OCI no produto

**Data:** 2026-09-21
**Quem decidiu:** humano, em mensagem à sessão A, voltando atrás na saída aprovada na `DDP-366`
**Alcance:** ícones de provedor de nuvem no Diagram Studio. Substitui, para o Google Cloud, o conjunto próprio por categoria registrado no fim da `DEC-0027`

## A decisão

O produto usa os pacotes oficiais de ícones de arquitetura dos quatro provedores: AWS, Azure, Google Cloud e Oracle Cloud Infrastructure (OCI). Cada pacote é baixado da página oficial do provedor e entra sem alteração.

Regras que o produto segue, trazidas pelo humano:

| Pode | Não pode |
| --- | --- |
| Oferecer os pacotes oficiais para o usuário montar diagramas | Alterar cor, proporção ou forma do ícone, aplicar filtro ou distorcer |
| Agrupar por provedor, em bibliotecas com o nome claro: "AWS", "Azure", "Google Cloud", "OCI" | Usar elemento visual de qualquer provedor no logotipo, no ícone do app, no favicon ou na identidade do DokDraw |
| Citar o nome dos provedores para indicar compatibilidade | Sugerir parceria, endosso ou homologação sem contrato |
| Mostrar o produto em uso, com diagramas desses provedores, no site e no marketing | Registrar domínio com o nome de um provedor |
| Cobrar pelo produto como um todo | Vender os ícones separados, como pacote para download |

O ícone oficial continua dentro da moldura do DokDraw, como na `DEC-0023`, e a moldura fica em volta dele, sem tocar no ícone.

## Aviso de marca

O texto vai no rodapé do site, na biblioteca de ícones do app e na página de licenças:

> Aviso de marca comercial: AWS, Amazon Web Services, Microsoft Azure, Google Cloud, GCP, Oracle Cloud Infrastructure e OCI são marcas registradas das respectivas empresas (Amazon.com, Inc., Microsoft Corporation, Google LLC e Oracle Corporation). O uso dos logotipos, nomes e ícones de arquitetura dentro do DokDraw tem finalidade ilustrativa, educativa e de indicação de compatibilidade técnica para a criação de diagramas por usuários finais. O DokDraw é uma ferramenta independente, sem vínculo, endosso, patrocínio ou filiação com nenhum dos provedores citados.

A atribuição que a AWS pede (`DDP-236`) continua valendo junto com este aviso.

## Risco aceito

As regras acima vieram de uma conversa com um assistente de IA que o humano colou, e não de parecer jurídico nem dos termos lidos pela sessão B. Para o Google Cloud, a leitura da sessão B (`DDP-356`) não achou permissão escrita para uso em produto, e as diretrizes gerais de marca do Google pedem aprovação prévia. Para a OCI, os termos ainda não foram lidos. O humano decidiu seguir com os ícones oficiais e assume esse risco.

Alternativa descartada: o conjunto próprio por categoria, aprovado na `DDP-366` e registrado na `DEC-0027`. Tira o risco de marca e custa o reconhecimento imediato do ícone oficial, que é o que o humano quer oferecer.

## Lacuna declarada

A regra dos quatro provedores não diz nada sobre logotipos que não são de nuvem: CNCF e Kubernetes, Docker, linguagens e ferramentas de CI/CD. Para esses, vale a `DDP-249` (ícone genérico e colagem de imagem) até o humano dizer outra coisa.

A versão e os termos de cada pacote (Google Cloud e OCI) são conferidos na web, com link e data, antes de o pacote entrar no produto.
