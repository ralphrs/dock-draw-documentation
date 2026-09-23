# DEC-0043: ícones oficiais da AWS servidos por bucket público, sob demanda

**Data:** 2026-09-22
**Quem decidiu:** Sessão A, sobre o estudo da sessão B em `adrs/_work/ESTUDO-icones-aws-fonte.md` (`DDP-514`).
**Registrado por:** Sessão A
**Substituída por:** `DEC-0044` em 2026-09-22. As premissas do bucket público (criação por SQL e upload pelo painel do Supabase) não valem em Lovable Cloud.

## Decisão

Os ícones oficiais da AWS Architecture Icons entram no app por um bucket novo do Supabase Storage, `aws-icons`, de leitura pública, com um arquivo SVG por serviço no caminho `{categoria}/{slug}.svg`, populado a partir do pacote oficial sem nenhuma alteração. O app busca só o ícone que a pessoa arrasta para o quadro, pelo mesmo mecanismo de embutir imagem por URL que `diagram-images` já usa, e um manifesto estático em `public/aws-icons-manifest.json` diz à paleta que categorias e serviços existem.

O mesmo mecanismo vale para as outras nuvens (Azure, Google Cloud, OCI) e para os logotipos de tecnologia (`DEC-0030`), um bucket por família ou um bucket `vendor-icons` com uma pasta por fornecedor, a decidir na ordem de cada família.

## Alternativas descartadas

- Pacote npm: os dois candidatos achados na web em 2026-09-22 não servem. `aws-svg-icons` parou em 2021, `@aws-icons/svg` declara alterar o desenho, o que a `DEC-0030` e a licença CC-BY-ND proíbem.
- Cópia em `public/`: bundla centenas de ícones que a maioria dos diagramas não usa, e cada release trimestral vira um commit grande no app.

## Custo aceito

Bucket novo é infraestrutura: card `app-release` com aprovação do humano antes de aplicar. A atualização trimestral do pacote da AWS é manual, por upload de quem administra. Falha de rede ao buscar um ícone precisa de estado de erro visível na paleta e na exportação.

## Lacuna

Quem faz o upload dos arquivos e como: o agente do Lovable não sobe centenas de arquivos num bucket. A ordem do bucket precisa dizer que o humano sobe a pasta pelo painel do Supabase, com a lista de arquivos e o manifesto gerados pela sessão B a partir do pacote oficial.
