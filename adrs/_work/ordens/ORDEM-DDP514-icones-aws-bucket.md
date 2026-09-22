# Ordem DDP-514a: bucket dos ícones oficiais da AWS

**Issue da ordem:** a definir pela sessão A a partir da `DDP-514`, rótulo `lovable`.

Primeira de duas ordens da `DDP-514`. Categoria `app-release` (bucket novo é infraestrutura, `DEC-0007`), exige aprovação humana explícita antes de aplicar. Decisão de mecanismo em `adrs/_work/ESTUDO-icones-aws-fonte.md`: carga sob demanda, sem pacote npm, sem cópia em `public/`. A segunda ordem (frame, contêineres, família) depende desta.

## O que fazer

**1. Bucket `aws-icons`, leitura pública.** Diferente de `diagram-images` (privado, por projeto), o ícone é o mesmo arquivo para qualquer pessoa: nenhum dado de usuário, nenhuma regra de acesso por projeto.

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('aws-icons', 'aws-icons', true, 1048576, ARRAY['image/svg+xml'])
ON CONFLICT (id) DO NOTHING;
```

Bucket público não precisa de política de `SELECT`: o Supabase serve o objeto pela URL pública sem checar RLS. Sem política de `INSERT`/`UPDATE`/`DELETE` para `authenticated` nem `anon`: quem sobe o arquivo é quem administra, pelo painel do Supabase ou pela `service_role`, nunca o app em nome de uma pessoa logada. Isso também impede qualquer pessoa de sobrescrever o ícone oficial pela API pública.

**2. Convenção de caminho.** `{categoria}/{slug-do-serviço}.svg`, com `categoria` em `kebab-case` batendo as categorias oficiais do pacote AWS (`compute`, `storage`, `database`, e as demais que o pacote `Icon-package_07312026` trouxer) e `slug-do-serviço` derivado do nome do arquivo oficial (`Arch_AWS-Lambda_48.svg` vira `lambda.svg`, dentro de `compute/`). Um arquivo por serviço, sem separação clara/escuro: a `DDP-237` já confirmou que o ícone de serviço é um quadrado colorido sólido que funciona nos dois temas sem alteração, só a moldura do DokDraw muda de cor.

**3. Manifesto, `public/aws-icons-manifest.json` no repositório do app (não no bucket).** Lista estática `{ category: string; label: string; services: { slug: string; name: string }[] }[]`, uma entrada por categoria, gerada a partir do mesmo pacote oficial usado para subir os arquivos. É o que a paleta lê para montar os grupos da família `aws` (segunda ordem), sem precisar listar o bucket em tempo de execução.

**4. Upload da primeira leva.** A partir do `Icon-package_07312026...zip` já baixado na pesquisa da `DDP-514` (`FICHA-ADR015-icones-aws.md`), extrair os SVGs de serviço das categorias Compute, Storage, Database, Networking & Content Delivery, Security Identity & Compliance e Analytics (as seis com mais serviços usados em diagrama de arquitetura), subir para `aws-icons/{categoria}/{slug}.svg` sem nenhuma alteração de path, cor ou conteúdo, e gerar o manifesto do item 3 na mesma leva. As demais categorias do pacote ficam para leva futura, sem bloquear esta ordem.

**5. Atribuição.** O rodapé de licenças do app (onde já existe algum texto de atribuição, se houver, ou a criar na próxima ordem de interface) precisa citar a AWS conforme a `DEC-0030`. Esta ordem só prepara o bucket, o texto entra na ordem de interface.

## O que não fazer aqui

- Não desenhar a moldura nem os contêineres AWS no app: isso é a `ORDEM-DDP514-frame-e-conteineres-aws.md`.
- Não instalar nenhum pacote npm.
- Não alterar nenhum ícone, cor ou proporção do arquivo oficial.
- Não criar política de escrita para `authenticated`: upload é sempre administrativo.
- Nenhum texto de tela cita tarefa, ADR, ordem ou sessão (`DEC-0041`).

## Tabela de restrições do contrato

| Restrição (`LEDGER.md` e decisões) | Onde esta ordem cumpre |
| --- | --- |
| `DEC-0030`: ícone oficial sem alteração, com atribuição | Item 2 e 4, upload direto do zip oficial sem edição |
| Dependências novas só com justificativa em ADR | Nenhuma dependência nova, é bucket, não pacote |
| Migração e RLS exigem aprovação humana explícita (`DEC-0007`) | Categoria `app-release`, aplicação represada até o sim do humano |

## Verificação

Roteiro da sessão A: `SELECT public FROM storage.buckets WHERE id = 'aws-icons'` devolve `true`. Baixar um SVG por URL pública sem sessão autenticada (`curl` sem header de autorização) devolve 200. Tentar subir um arquivo pela API do app autenticado (não pelo painel) falha por falta de política de `INSERT`. `public/aws-icons-manifest.json` existe e lista pelo menos as seis categorias do item 4, cada uma com pelo menos um serviço.

## Restrições

- Não aplique sem aprovação humana explícita (`app-release`).
- Não toque em `content.*`, `content.pages` nem `content.spaces`.
- Não toque `.env*`.
- Nenhum contrato do ledger muda.
